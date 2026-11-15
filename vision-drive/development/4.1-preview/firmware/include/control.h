#pragma once
#include <stdint.h>
#include <stdlib.h>
// Transport-independent state machine, also compiled in host tests.
struct Control {
  static constexpr uint32_t leaseMs = 350, frameMs = 1200;
  uint32_t token=0, sequence=0, last=0, frame=0;
  int left=0, right=0; bool led=false, camera=false;
  void stop() { token=0; sequence=0; left=right=0; led=false; }
  bool fresh(uint32_t now) const {return camera && uint32_t(now-frame)<frameMs;}
  bool expired(uint32_t now) const {return token && (uint32_t(now-last)>=leaseMs || !fresh(now));}
  bool arm(uint32_t key,uint32_t now) {
    if(token || !key || !fresh(now)) return false;
    stop(); token=key; last=now; return true;
  }
  bool command(uint32_t key,uint32_t seq,int l,int r,int lamp,uint32_t now) {
    if(expired(now)) stop();
    if(!token || key!=token || seq<=sequence || abs(l)>255 || abs(r)>255 || lamp<0 || lamp>1) return false;
    sequence=seq; last=now; left=l;right=r;led=lamp;return true;
  }
};