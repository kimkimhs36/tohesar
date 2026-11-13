#include "control.h"
#include <cassert>
#include <cstdio>
int main(){
 int tests=0;
 {Control c;assert(!c.arm(1,10));++tests;}
 {Control c;c.camera=true;c.frame=100;assert(c.arm(42,100));assert(!c.arm(43,101));++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);assert(c.command(42,1,85,85,1,110));assert(c.left==85&&c.led);assert(!c.command(43,2,1,1,0,120));assert(c.left==85);++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);assert(c.command(42,3,85,-85,0,110));assert(!c.command(42,2,0,0,0,120));assert(!c.command(42,3,0,0,0,120));assert(c.left==85);++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);c.command(42,1,85,85,1,100);assert(!c.expired(449));assert(c.expired(450));assert(!c.command(42,2,255,255,1,450));assert(c.token==0&&c.left==0&&!c.led);++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);c.command(42,1,-85,85,1,200);c.stop();assert(!c.command(42,2,255,255,1,210));assert(c.left==0&&!c.led);assert(c.arm(99,211));assert(!c.command(42,99,255,255,1,212));++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);assert(!c.command(42,1,256,0,0,110));assert(!c.command(42,1,0,-256,0,110));assert(!c.command(42,1,0,0,2,110));assert(c.left==0&&c.last==100);++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);for(int t=100;t<=1200;t+=100)assert(c.command(42,t,85,85,0,t));assert(c.expired(1300));assert(!c.command(42,1300,85,85,0,1300));assert(!c.arm(55,1300));++tests;}
 {Control c;uint32_t t=0xffffff80;c.camera=true;c.frame=t;c.arm(42,t);assert(!c.expired(t+349));assert(c.expired(t+350));++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);c.stop();c.frame=500;assert(c.arm(43,500));assert(c.sequence==0&&c.left==0&&c.right==0&&!c.led);++tests;}
 {Control c;c.camera=true;c.frame=100;assert(!c.arm(0,100));assert(!c.command(0,1,255,255,1,100));++tests;}
 {Control c;c.camera=true;c.frame=100;c.arm(42,100);assert(c.command(42,1,0,0,1,110));assert(c.led&&c.left==0);c.stop();assert(!c.led);++tests;}
 printf("PASS: %d safety scenarios (production Control state machine)\n",tests);
}