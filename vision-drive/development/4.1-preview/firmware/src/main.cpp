#include <Arduino.h>
#include <WiFi.h>
#include <esp_camera.h>
#include <esp_http_server.h>
#include <esp_task_wdt.h>
#include <esp_system.h>
#include <esp_timer.h>
#include <cJSON.h>
#include <math.h>
#include "control.h"
#include "ui.h"
// Keyestudio KS5023 official 11_4_Video_Car pin map. No microSD: pins shared.
static constexpr int pins[]={13,12,14,15};
static constexpr int channels[]={4,5,6,7}; // camera XCLK owns LEDC timer 0/channel 0
static Control state;
static SemaphoreHandle_t guard;
static bool cameraReady=false,streamReady=false,doubleBuffered=false;
static int appliedL=0,appliedR=0;
static httpd_handle_t controlServer=nullptr, cameraServer=nullptr, streamServer=nullptr;
// Updated under the existing guard; these are device-send metrics, not
// display FPS or end-to-end latency.
static uint32_t snapshotFrames=0,streamFrames=0,videoDropped=0;
static uint32_t snapshotLast=0,streamLast=0,snapshotGap=0,streamGap=0;
static uint32_t videoBytes=0,videoAgeMs=0,videoWaitMs=0;
static constexpr uint32_t MAX_FRAME_AGE_MS=1000;

bool frameAge(const camera_fb_t* fb,uint32_t& ageMs){
  if(!fb || fb->timestamp.tv_sec<0 || fb->timestamp.tv_usec<0 || fb->timestamp.tv_usec>=1000000)return false;
  int64_t captured=int64_t(fb->timestamp.tv_sec)*1000000LL+fb->timestamp.tv_usec;
  int64_t now=esp_timer_get_time();
  if(captured>now)return false;
  uint64_t age=uint64_t(now-captured)/1000;
  if(age>MAX_FRAME_AGE_MS)return false;
  ageMs=uint32_t(age);return true;
}
void noteVideo(bool isStream,uint32_t bytes,uint32_t age,uint32_t wait){
  uint32_t now=millis();xSemaphoreTake(guard,portMAX_DELAY);
  uint32_t& last=isStream?streamLast:snapshotLast;
  uint32_t& gap=isStream?streamGap:snapshotGap;
  if(last){uint32_t delta=now-last;gap=delta>0&&delta<5000?(gap?(gap*3+delta)/4:delta):0;}
  last=now;if(isStream)++streamFrames;else ++snapshotFrames;
  videoBytes=bytes;videoAgeMs=age;videoWaitMs=wait;xSemaphoreGive(guard);
}
void noteDropped(){xSemaphoreTake(guard,portMAX_DELAY);++videoDropped;xSemaphoreGive(guard);}

// Called only with guard held; on sign reversal both inputs go low before energising.
void outputs() {
  bool reverse=(appliedL*state.left<0 || appliedR*state.right<0);
  if(reverse) {for(int ch:channels) ledcWrite(ch,0); vTaskDelay(pdMS_TO_TICKS(5));}
  ledcWrite(4,state.left>0?state.left:0); ledcWrite(5,state.left<0?-state.left:0);
  ledcWrite(6,state.right<0?-state.right:0); ledcWrite(7,state.right>0?state.right:0);
  digitalWrite(4,state.led?HIGH:LOW); appliedL=state.left;appliedR=state.right;
}
void safetyTask(void*) {
  ESP_ERROR_CHECK(esp_task_wdt_add(nullptr));
  for(;;){
    xSemaphoreTake(guard,portMAX_DELAY);
    if(state.expired(millis())) {state.stop();outputs();}
    xSemaphoreGive(guard);
    ESP_ERROR_CHECK(esp_task_wdt_reset()); vTaskDelay(pdMS_TO_TICKS(10));
  }
}
esp_err_t json(httpd_req_t* req,const char* value) {
  httpd_resp_set_type(req,"application/json");httpd_resp_set_hdr(req,"Cache-Control","no-store");
  return httpd_resp_send(req,value,HTTPD_RESP_USE_STRLEN);
}
bool localOrigin(httpd_req_t* req) {
  char origin[80];size_t n=httpd_req_get_hdr_value_len(req,"Origin");
  if(!n)return true; // native uploader/diagnostics; mutations still require JSON + lease
  if(n>=sizeof(origin)) return false;
  httpd_req_get_hdr_value_str(req,"Origin",origin,sizeof(origin));
  return strcmp(origin,"http://192.168.4.1")==0;
}
esp_err_t status(httpd_req_t* req) {
  char buf[700];xSemaphoreTake(guard,portMAX_DELAY);
  const uint32_t now=millis();
  snprintf(buf,sizeof(buf),
    "{\"product\":\"VISION DRIVE\",\"version\":\"4.1.0\",\"camera\":%s,\"fresh\":%s,\"armed\":%s,"
    "\"left\":%d,\"right\":%d,\"led\":%s,\"lease_ms\":350,\"frame_timeout_ms\":1200,"
    "\"stream\":%s,\"frame_buffers\":%d,\"video\":{"
    "\"snapshot_frames\":%u,\"stream_frames\":%u,\"snapshot_fps_x10\":%u,\"stream_fps_x10\":%u,"
    "\"snapshot_age_ms\":%u,\"stream_age_ms\":%u,\"source_age_at_send_ms\":%u,"
    "\"last_grab_wait_ms\":%u,\"jpeg_bytes\":%u,\"dropped\":%u}}",
    cameraReady?"true":"false",state.fresh(now)?"true":"false",state.token?"true":"false",
    state.left,state.right,state.led?"true":"false",streamReady?"true":"false",doubleBuffered?2:1,
    (unsigned)snapshotFrames,(unsigned)streamFrames,(unsigned)(snapshotGap?10000/snapshotGap:0),
    (unsigned)(streamGap?10000/streamGap:0),(unsigned)(snapshotLast?now-snapshotLast:9999999),
    (unsigned)(streamLast?now-streamLast:9999999),(unsigned)videoAgeMs,
    (unsigned)videoWaitMs,(unsigned)videoBytes,(unsigned)videoDropped);
  xSemaphoreGive(guard);return json(req,buf);
}
esp_err_t mutation(httpd_req_t* req) {
  char type[48]={}; httpd_req_get_hdr_value_str(req,"Content-Type",type,sizeof(type));
  if(!localOrigin(req)||strcmp(type,"application/json")!=0) return httpd_resp_send_err(req,HTTPD_403_FORBIDDEN,"Local JSON only");
  if(req->content_len<2||req->content_len>200) return httpd_resp_send_err(req,HTTPD_400_BAD_REQUEST,"Body size");
  char body[201];int pos=0;
  while(pos<req->content_len) {int n=httpd_req_recv(req,body+pos,req->content_len-pos);if(n<=0)return ESP_FAIL;pos+=n;}
  body[pos]=0;cJSON* obj=cJSON_ParseWithOpts(body,nullptr,true);if(!obj||!cJSON_IsObject(obj)){cJSON_Delete(obj);return httpd_resp_send_err(req,HTTPD_400_BAD_REQUEST,"Invalid JSON object");}
  bool ok=false;char reply[100]="{\"ok\":true}";
  xSemaphoreTake(guard,portMAX_DELAY);
  if(state.expired(millis())){state.stop();outputs();}
  if(strcmp(req->uri,"/api/stop")==0){state.stop();outputs();ok=true;}
  else if(strcmp(req->uri,"/api/arm")==0){uint32_t key=esp_random()&0x7fffffff;ok=state.arm(key,millis());if(ok)snprintf(reply,sizeof(reply),"{\"token\":%u}",key);}
  else {
    const char* names[]={"token","seq","left","right","led"}; double v[5]; bool valid=true;
    for(int i=0;i<5;i++){cJSON* item=cJSON_GetObjectItemCaseSensitive(obj,names[i]);if(!cJSON_IsNumber(item)||!isfinite(item->valuedouble)||floor(item->valuedouble)!=item->valuedouble){valid=false;break;}v[i]=item->valuedouble;}
    if(valid && v[0]>0 && v[0]<=2147483647 && v[1]>0 && v[1]<=2147483647 && v[2]>=-255&&v[2]<=255&&v[3]>=-255&&v[3]<=255&&v[4]>=0&&v[4]<=1){
      ok=state.command(v[0],v[1],v[2],v[3],v[4],millis());if(ok)outputs();
    }
  }
  xSemaphoreGive(guard);cJSON_Delete(obj);
  if(!ok)return httpd_resp_send_err(req,HTTPD_400_BAD_REQUEST,"Locked, stale, busy or invalid");
  return json(req,reply);
}
esp_err_t asset(httpd_req_t* req) {
  const unsigned char* data=asset0;size_t size=sizeof(asset0);const char* type="text/html; charset=utf-8";
  if(strcmp(req->uri,"/drive.css")==0){data=asset1;size=sizeof(asset1);type="text/css";}
  if(strcmp(req->uri,"/drive.js")==0){data=asset2;size=sizeof(asset2);type="application/javascript";}
  if(strcmp(req->uri,"/instrument.woff2")==0){data=asset3;size=sizeof(asset3);type="font/woff2";}
  if(strcmp(req->uri,"/text.woff2")==0){data=asset4;size=sizeof(asset4);type="font/woff2";}
  httpd_resp_set_type(req,type);httpd_resp_set_hdr(req,"Content-Encoding","gzip");
  httpd_resp_set_hdr(req,"Cache-Control","no-store");
  httpd_resp_set_hdr(req,"Content-Security-Policy","default-src 'self'; connect-src 'self' http://192.168.4.1:81; img-src 'self' blob:; style-src 'self'; script-src 'self'; frame-ancestors 'none'");
  return httpd_resp_send(req,(const char*)data,size);
}
// Bounded, individually acknowledged JPEG frames. Allows browser to detect a frozen camera;
// unlike an <img> MJPEG stream, every decoded frame has an observable completion.
esp_err_t capture(httpd_req_t* req) {
  if(!cameraReady)return httpd_resp_send_err(req,HTTPD_500_INTERNAL_SERVER_ERROR,"Camera unavailable");
  uint32_t start=millis();camera_fb_t* fb=esp_camera_fb_get();uint32_t wait=millis()-start;
  if(!fb){noteDropped();return httpd_resp_send_err(req,HTTPD_500_INTERNAL_SERVER_ERROR,"Capture failed");}
  uint32_t age=0;if(!frameAge(fb,age)){esp_camera_fb_return(fb);noteDropped();return httpd_resp_send_err(req,HTTPD_500_INTERNAL_SERVER_ERROR,"Camera frame stale");}
  uint32_t capturedAt=millis()-age;
  httpd_resp_set_type(req,"image/jpeg");httpd_resp_set_hdr(req,"Cache-Control","no-store");
  httpd_resp_set_hdr(req,"Access-Control-Allow-Origin","http://192.168.4.1");
  char ageHeader[16];snprintf(ageHeader,sizeof(ageHeader),"%u",(unsigned)age);httpd_resp_set_hdr(req,"X-Frame-Age-Ms",ageHeader);
  uint32_t bytes=fb->len;esp_err_t res=httpd_resp_send(req,(const char*)fb->buf,fb->len);esp_camera_fb_return(fb);
  if(res==ESP_OK){xSemaphoreTake(guard,portMAX_DELAY);state.camera=true;state.frame=capturedAt;xSemaphoreGive(guard);}
  if(res==ESP_OK)noteVideo(false,bytes,age,wait);
  return res;
}
// A separate read-only stream server leaves the existing /capture and drive
// watchdog paths intact. It never marks the control camera as fresh.
esp_err_t stream(httpd_req_t* req) {
  if(!cameraReady||!doubleBuffered)return httpd_resp_send_err(req,HTTPD_500_INTERNAL_SERVER_ERROR,"Stream unavailable");
  static const char* boundary="\r\n--visionframe\r\n";
  httpd_resp_set_type(req,"multipart/x-mixed-replace;boundary=visionframe");
  httpd_resp_set_hdr(req,"Cache-Control","no-store");
  esp_err_t result=ESP_OK;
  for(;;){
    const uint32_t start=millis();
    camera_fb_t* fb=esp_camera_fb_get();const uint32_t wait=millis()-start;
    if(!fb){noteDropped();result=ESP_FAIL;break;}
    uint32_t age=0;if(!frameAge(fb,age)){esp_camera_fb_return(fb);noteDropped();result=ESP_FAIL;break;}
    char header[144];
    int len=snprintf(header,sizeof(header),"Content-Type: image/jpeg\r\nContent-Length: %u\r\nX-Frame-Age-Ms: %u\r\n\r\n",(unsigned)fb->len,(unsigned)age);
    if(len<=0||len>=int(sizeof(header)))result=ESP_FAIL;
    if(result==ESP_OK)result=httpd_resp_send_chunk(req,boundary,strlen(boundary));
    if(result==ESP_OK)result=httpd_resp_send_chunk(req,header,len);
    if(result==ESP_OK)result=httpd_resp_send_chunk(req,(const char*)fb->buf,fb->len);
    uint32_t bytes=fb->len;esp_camera_fb_return(fb);
    if(result!=ESP_OK)break;
    noteVideo(true,bytes,age,wait);
    const uint32_t elapsed=millis()-start;
    if(elapsed<34)vTaskDelay(pdMS_TO_TICKS(34-elapsed));
    else vTaskDelay(1);
  }
  return result;
}
void add(httpd_handle_t server,const char* path,httpd_method_t method,esp_err_t(*handler)(httpd_req_t*)) {
 httpd_uri_t uri={};uri.uri=path;uri.method=method;uri.handler=handler;ESP_ERROR_CHECK(httpd_register_uri_handler(server,&uri));
}
void setup(){
  Serial.begin(115200);
  for(int i=0;i<4;i++){pinMode(pins[i],OUTPUT);digitalWrite(pins[i],LOW);ledcSetup(channels[i],1000,8);ledcAttachPin(pins[i],channels[i]);ledcWrite(channels[i],0);}
  pinMode(4,OUTPUT);digitalWrite(4,LOW);guard=xSemaphoreCreateMutex();
  ESP_ERROR_CHECK(guard?ESP_OK:ESP_ERR_NO_MEM);
  streamReady=false;doubleBuffered=false;
  // Brownout detection stays ENABLED. A power fault must not be hidden.
  ESP_ERROR_CHECK(esp_task_wdt_init(3,true));
  ESP_ERROR_CHECK(xTaskCreatePinnedToCore(safetyTask,"drive-safety",3072,nullptr,5,nullptr,1)==pdPASS?ESP_OK:ESP_ERR_NO_MEM);
  camera_config_t c={};c.ledc_channel=LEDC_CHANNEL_0;c.ledc_timer=LEDC_TIMER_0;
  c.pin_d0=5;c.pin_d1=18;c.pin_d2=19;c.pin_d3=21;c.pin_d4=36;c.pin_d5=39;c.pin_d6=34;c.pin_d7=35;
  c.pin_xclk=0;c.pin_pclk=22;c.pin_vsync=25;c.pin_href=23;c.pin_sccb_sda=26;c.pin_sccb_scl=27;c.pin_pwdn=32;c.pin_reset=-1;
  const bool hasPsram=psramFound();
  c.xclk_freq_hz=20000000;c.pixel_format=PIXFORMAT_JPEG;c.frame_size=FRAMESIZE_QVGA;c.jpeg_quality=14;
  c.fb_count=hasPsram?2:1;c.fb_location=hasPsram?CAMERA_FB_IN_PSRAM:CAMERA_FB_IN_DRAM;
  c.grab_mode=hasPsram?CAMERA_GRAB_LATEST:CAMERA_GRAB_WHEN_EMPTY;
  cameraReady=esp_camera_init(&c)==ESP_OK;
  doubleBuffered=cameraReady&&c.fb_count==2;
  if(!cameraReady&&hasPsram){esp_camera_deinit();c.fb_count=1;c.grab_mode=CAMERA_GRAB_WHEN_EMPTY;cameraReady=esp_camera_init(&c)==ESP_OK;}
  WiFi.mode(WIFI_AP);WiFi.setSleep(false);
  WiFi.softAPConfig(IPAddress(192,168,4,1),IPAddress(192,168,4,1),IPAddress(255,255,255,0));
  uint64_t mac=ESP.getEfuseMac();char ssid[32];snprintf(ssid,sizeof(ssid),"VISION-DRIVE-%04X",(unsigned)(mac>>32)&0xffff);
  WiFi.softAP(ssid,"BKIT-5023",6,false,1);
  httpd_config_t cfg=HTTPD_DEFAULT_CONFIG();cfg.server_port=80;cfg.max_uri_handlers=12;cfg.stack_size=8192;cfg.recv_wait_timeout=1;cfg.send_wait_timeout=1;cfg.lru_purge_enable=true;
  ESP_ERROR_CHECK(httpd_start(&controlServer,&cfg));
  add(controlServer,"/",HTTP_GET,asset);add(controlServer,"/drive.css",HTTP_GET,asset);add(controlServer,"/drive.js",HTTP_GET,asset);
  add(controlServer,"/instrument.woff2",HTTP_GET,asset);add(controlServer,"/text.woff2",HTTP_GET,asset);
  add(controlServer,"/api/status",HTTP_GET,status);add(controlServer,"/api/arm",HTTP_POST,mutation);add(controlServer,"/api/control",HTTP_POST,mutation);add(controlServer,"/api/stop",HTTP_POST,mutation);
  cfg.server_port=81;cfg.ctrl_port+=1;ESP_ERROR_CHECK(httpd_start(&cameraServer,&cfg));add(cameraServer,"/capture",HTTP_GET,capture);
  // Streaming is optional. Failure must not prevent the existing UI/capture.
  if(doubleBuffered){cfg.server_port=82;cfg.ctrl_port+=1;
    if(httpd_start(&streamServer,&cfg)==ESP_OK){
      httpd_uri_t uri={};uri.uri="/stream";uri.method=HTTP_GET;uri.handler=stream;
      if(httpd_register_uri_handler(streamServer,&uri)==ESP_OK){xSemaphoreTake(guard,portMAX_DELAY);streamReady=true;xSemaphoreGive(guard);}
      else{httpd_stop(streamServer);streamServer=nullptr;}
    }
  }
  Serial.printf("\nVISION DRIVE 4.1 | SSID: %s\nOpen http://192.168.4.1 | camera: %s\n",ssid,cameraReady?"OK":"FAILED / DRIVE LOCKED");
}
void loop(){delay(100);}