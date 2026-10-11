import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {prune,dedup,weld,textureCompress,meshopt} from '@gltf-transform/functions';
import sharp from 'sharp';
import {MeshoptEncoder} from 'meshoptimizer';
await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(process.argv[2]);
for(const extension of doc.getRoot().listExtensionsUsed()){if(extension.extensionName==='KHR_materials_variants')extension.dispose();}
for(const mat of doc.getRoot().listMaterials()){
 const name=mat.getName();
 // Remove the source's brand artwork, not its legal attribution.
 mat.setEmissiveTexture(null);
 if(name==='License')mat.setBaseColorTexture(null).setBaseColorFactor([.25,.28,.30,1]);
 if(name.startsWith('Paint 1'))mat.setBaseColorFactor([.44,.48,.53,1]).setMetallicFactor(.92).setRoughnessFactor(.25).setNormalScale(.08);
 if(name.startsWith('Paint 2'))mat.setBaseColorFactor([.055,.062,.07,1]).setRoughnessFactor(.3);
 if(name.startsWith('Interior 3'))mat.setBaseColorFactor([.023,.026,.028,1]);
 if(name==='Glass'){mat.setExtension('KHR_materials_transmission',null).setBaseColorFactor([.042,.066,.083,1]).setMetallicFactor(.65).setRoughnessFactor(.14);}
 if(!['Headlight','Brakelight','Signallight'].includes(name))mat.setEmissiveFactor([0,0,0]);
 if(name==='Headlight')mat.setEmissiveFactor([.2,.16,.105]);
 if(name==='Brakelight')mat.setEmissiveFactor([.20,.005,.001]);
 if(name==='Signallight')mat.setEmissiveFactor([0,0,0]);
}
await doc.transform(dedup(),weld(),prune(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],quality:86}),meshopt({encoder:MeshoptEncoder,level:'high'}));
await io.write(process.argv[3] || 'public/assets/car-concept-silver.glb',doc);
