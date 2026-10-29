/* Development-only export. Original generated PNGs are never overwritten. */
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{
  const file=path.join(root,'journal/data/wallpaper-artworks.json');
  const registry=JSON.parse(fs.readFileSync(file));
  for(const a of registry.artworks){
    const original=path.join(root,a.original);
    a.variants=[];
    for(const width of [240,480]){
      const web=`/journal/assets/wallpaper/${a.id}-${width}.webp`;
      await sharp(original).trim({background:'#00000000',threshold:20}).resize(width).webp({quality:92,alphaQuality:100,effort:6}).toFile(root+web);
      a.variants.push({width,path:web});
    }
  }
  fs.writeFileSync(file,JSON.stringify(registry,null,2)+'\n');
  console.log('Exported transparent responsive derivatives from the preserved PNGs.');
})().catch(e=>{console.error(e);process.exit(1)});
