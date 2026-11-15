#pragma once
#include <stdint.h>
#include <stddef.h>
#include <cstring>
#include <string>
#include <map>
#include <vector>
#include <mutex>
#include <stdexcept>
#include <algorithm>
#include <cstdlib>
#include <cstdio>
#include <sys/time.h>
using std::size_t;
#define PROGMEM
#define HIGH 1
#define LOW 0
#define OUTPUT 1
#define ESP_OK 0
#define ESP_FAIL -1
#define ESP_ERR_NO_MEM 0x101
#define pdPASS 1
#define portMAX_DELAY 0xffffffff
#define pdMS_TO_TICKS(x) (x)
#define ESP_ERROR_CHECK(x) do{if((x)!=0)throw std::runtime_error("SDK failure");}while(0)
using esp_err_t=int;
inline uint32_t fakeTime=100;
inline uint32_t millis(){return fakeTime;}
inline int64_t esp_timer_get_time(){return int64_t(fakeTime)*1000;}
inline void delay(int ms){fakeTime+=ms;}
inline void vTaskDelay(int ms){fakeTime+=ms;}
using SemaphoreHandle_t=std::mutex*;
inline bool fakeMutexCreate=true,fakeTaskCreate=true;
inline int fakeWdtInit=ESP_OK,fakeWdtAdd=ESP_OK,fakeWdtReset=ESP_OK;
inline SemaphoreHandle_t xSemaphoreCreateMutex(){return fakeMutexCreate?new std::mutex:nullptr;}
inline void xSemaphoreTake(SemaphoreHandle_t m,uint32_t){m->lock();}
inline void xSemaphoreGive(SemaphoreHandle_t m){m->unlock();}
inline int xTaskCreatePinnedToCore(void(*)(void*),const char*,int,void*,int,void*,int){return fakeTaskCreate?pdPASS:0;}
inline int esp_task_wdt_add(void*){return fakeWdtAdd;}
inline int esp_task_wdt_reset(){return fakeWdtReset;}
inline int esp_task_wdt_init(int,bool){return fakeWdtInit;}
struct Write{int channel,value;uint32_t at;};
inline std::vector<Write> writes;
inline std::map<int,int> pwm,digital,pinChannels;
inline void pinMode(int,int){}
inline void digitalWrite(int pin,int value){digital[pin]=value;}
inline void ledcSetup(int,int,int){}
inline void ledcAttachPin(int pin,int channel){pinChannels[pin]=channel;}
inline void ledcWrite(int channel,int value){pwm[channel]=value;writes.push_back({channel,value,fakeTime});if((pwm[4]&&pwm[5])||(pwm[6]&&pwm[7]))throw std::runtime_error("H bridge overlap");}
inline bool fakePsram=true;
inline bool psramFound(){return fakePsram;}
struct SerialType{void begin(int){}template<typename...T>void printf(const char*,T...){} };inline SerialType Serial;
struct ESPType{uint64_t getEfuseMac(){return 0x123456789abc;}};inline ESPType ESP;
inline uint32_t esp_random(){return 1234567;}
struct IPAddress{IPAddress(int,int,int,int){}};
#define WIFI_AP 2
struct WiFiType{void mode(int){}void setSleep(bool){}void softAPConfig(IPAddress,IPAddress,IPAddress){}void softAP(const char*,const char*,int,bool,int){}};inline WiFiType WiFi;
#define LEDC_CHANNEL_0 0
#define LEDC_TIMER_0 0
#define PIXFORMAT_JPEG 0
#define FRAMESIZE_QVGA 1
#define CAMERA_FB_IN_PSRAM 0
#define CAMERA_FB_IN_DRAM 1
#define CAMERA_GRAB_WHEN_EMPTY 0
#define CAMERA_GRAB_LATEST 1
struct camera_config_t{int ledc_channel,ledc_timer,pin_d0,pin_d1,pin_d2,pin_d3,pin_d4,pin_d5,pin_d6,pin_d7,pin_xclk,pin_pclk,pin_vsync,pin_href,pin_sccb_sda,pin_sccb_scl,pin_pwdn,pin_reset,xclk_freq_hz,pixel_format,frame_size,jpeg_quality,fb_count,fb_location,grab_mode;};
struct camera_fb_t{uint8_t*buf;size_t len;timeval timestamp;};
inline bool fakeCamera=true;inline uint32_t fakeFrameAgeMs=0;inline uint8_t fakeJPEG[]={0xff,0xd8,0xff,0xd9};inline camera_fb_t frame={fakeJPEG,4,{}};
inline camera_config_t lastCameraConfig{};
inline bool fakeDoubleInitFail=false;
inline int fakeFrameGets=0,fakeFrameReturns=0,fakeCameraDeinits=0;
inline esp_err_t esp_camera_init(camera_config_t*c){lastCameraConfig=*c;return fakeDoubleInitFail&&c->fb_count==2?ESP_FAIL:ESP_OK;}
inline esp_err_t esp_camera_deinit(){++fakeCameraDeinits;return ESP_OK;}
inline camera_fb_t*esp_camera_fb_get(){++fakeFrameGets;uint32_t ts=fakeTime>fakeFrameAgeMs?fakeTime-fakeFrameAgeMs:0;frame.timestamp.tv_sec=ts/1000;frame.timestamp.tv_usec=(ts%1000)*1000;return fakeCamera?&frame:nullptr;}
inline void esp_camera_fb_return(camera_fb_t*){++fakeFrameReturns;}
using httpd_handle_t=void*;using httpd_method_t=int;
#define HTTP_GET 0
#define HTTP_POST 1
#define HTTPD_RESP_USE_STRLEN -1
#define HTTPD_403_FORBIDDEN 403
#define HTTPD_400_BAD_REQUEST 400
#define HTTPD_500_INTERNAL_SERVER_ERROR 500
struct httpd_req_t{
 const char*uri;int content_len=0;std::map<std::string,std::string>headers;std::string body,response,status="200 OK",type;size_t offset=0;int responseCode=200;std::map<std::string,std::string>responseHeaders;
};
inline size_t httpd_req_get_hdr_value_len(httpd_req_t*r,const char*k){return r->headers[k].size();}
inline esp_err_t httpd_req_get_hdr_value_str(httpd_req_t*r,const char*k,char*out,size_t n){const auto&s=r->headers[k];if(s.empty())return ESP_FAIL;std::snprintf(out,n,"%s",s.c_str());return s.size()<n?ESP_OK:ESP_FAIL;}
inline int httpd_req_recv(httpd_req_t*r,char*out,int n){n=std::min(n,int(r->body.size()-r->offset));std::memcpy(out,r->body.data()+r->offset,n);r->offset+=n;return n;}
inline void httpd_resp_set_type(httpd_req_t*r,const char*s){r->type=s;}
inline void httpd_resp_set_hdr(httpd_req_t*r,const char*k,const char*v){r->responseHeaders[k]=v;}
inline esp_err_t httpd_resp_send(httpd_req_t*r,const char*v,int n){r->response.assign(v,n<0?std::strlen(v):n);return ESP_OK;}
inline int fakeChunkBudget=0;
inline esp_err_t httpd_resp_send_chunk(httpd_req_t*r,const char*v,int n){if(fakeChunkBudget--<=0)return ESP_FAIL;r->response.append(v,n);return ESP_OK;}
inline esp_err_t httpd_resp_send_err(httpd_req_t*r,int code,const char*v){r->responseCode=code;r->response=v;return ESP_OK;}
struct httpd_config_t{int server_port=80,max_uri_handlers=0,stack_size=0,recv_wait_timeout=0,send_wait_timeout=0,ctrl_port=3000;bool lru_purge_enable=false;};
inline httpd_config_t HTTPD_DEFAULT_CONFIG(){return {};}
struct httpd_uri_t{const char*uri;int method;esp_err_t(*handler)(httpd_req_t*);};
inline int httpdStartCalls=0;
inline bool fakeStreamServerFail=false;
inline esp_err_t httpd_start(httpd_handle_t*s,httpd_config_t*c){++httpdStartCalls;if(c->server_port==82&&fakeStreamServerFail)return ESP_FAIL;*s=(void*)1;return ESP_OK;}
inline esp_err_t httpd_stop(httpd_handle_t){return ESP_OK;}
inline esp_err_t httpd_register_uri_handler(httpd_handle_t,httpd_uri_t*){return ESP_OK;}