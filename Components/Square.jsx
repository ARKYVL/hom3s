import * as THREE from 'three'
import { useEffect,useRef,useState } from 'react'

import React from 'react'

const Square = () => {
    const mountRef=useRef(null);
    useEffect(()=>{
        const scene =new THREE.Scene();//scene is root of scene tree
        scene.background= new THREE.Color(0x202020);
        const camera=new THREE.PerspectiveCamera(
            75,
            window.innerWidth/window.innerHeight,
            0.1,
            1000
        )
        camera.position.z=5;

        const renderer =new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(window.innerWidth,innerHeight);

        renderer.domElement.style.display = 'block';


        mountRef.current.appendChild(renderer.domElement);//

        const geometry=new THREE.BoxGeometry(2,2,2);
        const material=new THREE.MeshBasicMaterial({color:0x00ff00});

        const cube =new THREE.Mesh(geometry,material);
        scene.add(cube);

        let animationFrameId;

        const animate=()=>{
            animationFrameId=requestAnimationFrame(animate);

            cube.rotation.x+=0.01;
            cube.rotation.y+=0.01;

            renderer.render(scene,camera);

        }
        
        animate();


        return ()=>{
            cancelAnimationFrame(animationFrameId);
            if(mountRef.current){
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };//cleanup function cuz three stores its components in gpu which react doesnt clear
    },[])
  return (
    <div>
        <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}/>
    </div>
  )
}

export default Square