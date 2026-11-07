import {readFlashVerified} from '../web/setup/flash-io.js';
import {ESPLoader} from '../web/setup/vendor/esptool.bundle.js';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const md5=b=>createHash('md5').update(new Uint8Array(b)).digest('hex');
let count=0;
async function run({size=9000,tamper=false,missing=false,overflow=false}={}){
 const data=Uint8Array.from({length:size},(_,i)=>i%251);let packets=[],acks=[];
 const transport={tracing:false,getInfo:()=>({usbVendorId:0,usbProductId:0}),async write(packet){
  if(packet.length===24){assert.equal(packet[1],0xd2);const view=new DataView(packet.buffer,packet.byteOffset+8);assert.equal(view.getUint32(4,true),size);assert.equal(view.getUint32(12,true),64);
   packets.push(Uint8Array.from([1,0xd2,0,0,0,0,0,0]));
   for(let n=0;n<size;n+=4096)packets.push(data.slice(n,Math.min(n+4096,size)));
   if(overflow)packets[packets.length-1]=new Uint8Array(4096);
   if(!missing){const digest=Uint8Array.from(Buffer.from(md5(data.buffer),'hex'));if(tamper)digest[0]^=1;packets.push(digest);}
  }else acks.push(new DataView(packet.buffer).getUint32(0,true));
 },async *read(){if(!packets.length)throw Error('No digest');yield packets.shift();}};
 const loader=new ESPLoader({transport,baudrate:115200,terminal:{write(){},writeLine(){},clean(){}}});
 const result=await readFlashVerified(loader,transport,size,()=>{},md5);
 assert.deepEqual(result,data);assert.equal(acks.at(-1),size);assert.equal(packets.length,0);count++;
}
await run();await run({size:4194304});
await assert.rejects(run({tamper:true}),/MD5 mismatch/);count++;
await assert.rejects(run({missing:true}),/No digest/);count++;
await assert.rejects(run({overflow:true}),/Invalid flash data/);count++;
console.log(`PASS: ${count} flash protocol checks (real esptool-js, synthetic serial packets)`);