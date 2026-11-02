/* ESP stub READ_FLASH protocol, based on Espressif esptool/esptool-js (Apache-2.0).
 * esptool-js 0.5.7 readFlash leaves the trailing digest packet unread and repeatedly
 * reallocates the growing buffer. Consume/verify that digest with one bounded buffer.
 * Pinned library's public command/transport interface; no reset, erase or write-flash.
 */
export async function readFlashVerified(loader, transport, size, progress, md5) {
  if(!Number.isInteger(size)||size<1||size>4194304)throw Error('Invalid read size');
  const request=new Uint8Array(16),view=new DataView(request.buffer);
  [0,size,4096,64].forEach((n,i)=>view.setUint32(i*4,n,true));
  const response=await loader.checkCommand('read flash',loader.ESP_READ_FLASH,request);
  if(response!==0)throw Error('Flash read command rejected');
  const bytes=new Uint8Array(size);let offset=0;
  while(offset<size){
    const {value:packet}=await transport.read(5000).next();
    if(!(packet instanceof Uint8Array)||!packet.length||packet.length>4096||offset+packet.length>size)throw Error('Invalid flash data packet');
    bytes.set(packet,offset);offset+=packet.length;
    const ack=new Uint8Array(4);new DataView(ack.buffer).setUint32(0,offset,true);await transport.write(ack);
    progress(offset,size);
  }
  const {value:digest}=await transport.read(5000).next();
  if(!(digest instanceof Uint8Array)||digest.length!==16)throw Error('Missing flash digest');
  const expected=[...digest].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(md5(bytes.buffer)!==expected)throw Error('Flash read MD5 mismatch');
  return bytes;
}
