import * as THREE from 'three';
const scene=new THREE.Scene();scene.background=new THREE.Color('#f1eee7');
const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,100);camera.position.z=7;
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);document.body.append(renderer.domElement);
const form=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5,1),new THREE.MeshStandardMaterial({color:'#aab7bf',metalness:.7,roughness:.3}));form.scale.set(.7,1.4,.3);form.rotation.set(.2,.5,-.2);scene.add(form,new THREE.HemisphereLight(0xe1f0ff,0xc79883,3));
const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-3,5,4);scene.add(light);renderer.render(scene,camera);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.render(scene,camera);});
