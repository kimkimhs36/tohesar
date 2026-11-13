// Includes the actual production handlers, setup and PWM writer with a mock SDK HAL.
#include "../firmware/src/main.cpp"
#include <cassert>
httpd_req_t call(const char*path,const std::string&body="{}",const char*origin="http://192.168.4.1",const char*type="application/json"){
 httpd_req_t req{};req.uri=path;req.body=body;req.content_len=body.size();if(origin)req.headers["Origin"]=origin;if(type)req.headers["Content-Type"]=type;mutation(&req);return req;
}
void safetyTick(){xSemaphoreTake(guard,portMAX_DELAY);if(state.expired(millis())){state.stop();outputs();}xSemaphoreGive(guard);}
int main(){
 int count=0;setup();assert(pinChannels[13]==4&&pinChannels[12]==5&&pinChannels[14]==6&&pinChannels[15]==7);assert(pwm[4]==0&&pwm[5]==0&&pwm[6]==0&&pwm[7]==0&&digital[4]==0);++count;
 assert(call("/api/arm").responseCode==400);++count;
 httpd_req_t cap{};cap.uri="/capture";capture(&cap);assert(cap.response.size()==4&&state.fresh(millis()));++count;
 assert(call("/api/arm","{}","https://evil.example").responseCode==403);assert(!state.token);++count;
 assert(call("/api/arm","{}",nullptr,nullptr).responseCode==403);assert(!state.token);++count;
 assert(call("/api/arm","{}",nullptr,"text/plain").responseCode==403);++count;
 assert(call("/api/arm","{broken").responseCode==400);++count;
 assert(call("/api/arm",std::string(201,'x')).responseCode==400);++count;
 assert(call("/api/arm","{} trailing").responseCode==400);++count;
 assert(call("/api/arm","[]").responseCode==400);++count;
 assert(call("/api/arm").responseCode==200&&state.token==1234567);++count;
 auto command=[](int seq,int l,int r,int led=0){return call("/api/control","{\"token\":1234567,\"seq\":"+std::to_string(seq)+",\"left\":"+std::to_string(l)+",\"right\":"+std::to_string(r)+",\"led\":"+std::to_string(led)+"}");};
 command(1,85,85,1);assert(pwm[4]==85&&pwm[5]==0&&pwm[6]==0&&pwm[7]==85&&digital[4]==1);++count;
 auto at=millis();writes.clear();command(2,-85,-85);assert(millis()>=at+5);assert(pwm[4]==0&&pwm[5]==85&&pwm[6]==85&&pwm[7]==0);for(int i=0;i<4;i++)assert(writes[i].value==0&&writes[i].at==at);++count;
 command(3,-85,85);assert(pwm[5]==85&&pwm[7]==85);++count;
 command(4,85,-85);assert(pwm[4]==85&&pwm[6]==85);++count;
 assert(command(4,0,0).responseCode==400&&pwm[4]==85);++count;
 assert(command(5,256,0).responseCode==400&&pwm[4]==85);++count;
 assert(call("/api/control","{\"token\":1234567,\"seq\":5,\"left\":1.5,\"right\":0,\"led\":0}").responseCode==400);++count;
 call("/api/stop");assert(state.token==0&&pwm[4]==0&&pwm[5]==0&&pwm[6]==0&&pwm[7]==0&&digital[4]==0);assert(command(99,255,255).responseCode==400);++count;
 call("/api/arm");command(1,170,170,1);fakeTime+=350;safetyTick();assert(!state.token&&pwm[4]==0&&pwm[7]==0&&digital[4]==0);++count;
 assert(command(100,255,255).responseCode==400&&pwm[4]==0);++count;
 fakeTime+=1300;assert(call("/api/arm").responseCode==400);++count;
 fakeCamera=false;httpd_req_t fail{};fail.uri="/capture";capture(&fail);assert(fail.responseCode==500);++count;
 fakeCamera=true;capture(&cap);call("/api/arm");uint32_t rng=42;
 for(int i=1;i<=3000;i++){rng=rng*1664525+1013904223;int l=int(rng%511)-255;rng=rng*1664525+1013904223;int r=int(rng%511)-255;capture(&cap);fakeTime+=2;assert(command(i,l,r).responseCode==200);assert(pwm[4]==(l>0?l:0)&&pwm[5]==(l<0?-l:0)&&pwm[6]==(r<0?-r:0)&&pwm[7]==(r>0?r:0));}
 call("/api/stop");assert(!state.token&&!pwm[4]&&!pwm[5]&&!pwm[6]&&!pwm[7]);++count;
 // Stream transmission is read-only and returns every borrowed camera buffer
 // even when the client disconnects mid-frame.
 assert(doubleBuffered&&streamReady&&lastCameraConfig.fb_count==2&&lastCameraConfig.grab_mode==CAMERA_GRAB_LATEST);
 state.camera=false;state.frame=0;const int beforeReturn=fakeFrameReturns;
 fakeChunkBudget=3;httpd_req_t live{};live.uri="/stream";assert(stream(&live)==ESP_FAIL);
 assert(fakeFrameReturns-beforeReturn==2&&!state.camera&&state.frame==0);
 assert(live.type.find("multipart/")==0&&live.response.find("Content-Length: 4")!=std::string::npos);++count;
 httpd_req_t diagnostics{};status(&diagnostics);cJSON* report=cJSON_Parse(diagnostics.response.c_str());
 cJSON* video=cJSON_GetObjectItemCaseSensitive(report,"video");
 assert(video&&cJSON_GetObjectItemCaseSensitive(video,"stream_frames")->valueint>=1);
 cJSON_Delete(report);++count;
 // A camera that returns an old buffered JPEG must not refresh the control
 // watchdog or be delivered as a live frame.
 fakeTime+=3000;fakeFrameAgeMs=1500;state.camera=false;state.frame=0;const int staleReturn=fakeFrameReturns;
 httpd_req_t stale{};stale.uri="/capture";capture(&stale);
 assert(stale.responseCode==500&&!state.camera&&state.frame==0&&fakeFrameReturns==staleReturn+1);
 httpd_req_t staleStream{};staleStream.uri="/stream";assert(stream(&staleStream)==ESP_FAIL);
 assert(!state.camera&&fakeFrameReturns==staleReturn+2);++count;
 // Even an accepted buffered frame expires relative to its source timestamp.
 fakeFrameAgeMs=800;httpd_req_t aged{};capture(&aged);assert(aged.responseCode==200&&state.fresh(millis()));
 fakeTime+=400;assert(!state.fresh(millis()));fakeFrameAgeMs=0;++count;
 // A missing PSRAM chip or failed double-buffer init retains snapshot mode.
 fakePsram=false;setup();assert(cameraReady&&!doubleBuffered&&!streamReady&&lastCameraConfig.fb_count==1);
 httpd_req_t noStream{};assert(stream(&noStream)==ESP_OK&&noStream.responseCode==500);++count;
 fakePsram=true;fakeDoubleInitFail=true;setup();assert(cameraReady&&!doubleBuffered&&!streamReady&&lastCameraConfig.fb_count==1&&fakeCameraDeinits>0);fakeDoubleInitFail=false;++count;
 // Stream listener failure must not break the existing camera/control servers.
 fakeStreamServerFail=true;setup();assert(cameraReady&&doubleBuffered&&!streamReady);fakeStreamServerFail=false;++count;
 // If a safety resource cannot start, setup must abort with all outputs low
 // before opening an HTTP server. ESP_ERROR_CHECK is a host exception here.
 auto startupFails=[&](){int servers=httpdStartCalls;bool failed=false;try{setup();}catch(const std::runtime_error&){failed=true;}assert(failed&&httpdStartCalls==servers&&!pwm[4]&&!pwm[5]&&!pwm[6]&&!pwm[7]&&!digital[4]);++count;};
 fakeMutexCreate=false;startupFails();fakeMutexCreate=true;
 fakeWdtInit=ESP_FAIL;startupFails();fakeWdtInit=ESP_OK;
 fakeTaskCreate=false;startupFails();fakeTaskCreate=true;
 bool rejected=false;fakeWdtAdd=ESP_FAIL;try{safetyTask(nullptr);}catch(const std::runtime_error&){rejected=true;}assert(rejected);fakeWdtAdd=ESP_OK;++count;
 rejected=false;fakeWdtReset=ESP_FAIL;try{safetyTask(nullptr);}catch(const std::runtime_error&){rejected=true;}assert(rejected);fakeWdtReset=ESP_OK;++count;
 printf("PASS: %d actual firmware handler/HAL scenarios, including 3000 randomized PWM commands (no hardware)\n",count);
}