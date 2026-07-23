import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
// 1. Import OrbitControls from the examples folder
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const Square = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    // camera.rotateY(20);

    const axes=new THREE.AxesHelper(200);
    scene.add(axes);

    const spotLight = new THREE.SpotLight(0xff0000, 1000, 2000, Math.PI / 6, 0.5, 2);
    spotLight.position.set(-2,1,-2);
    spotLight.target.position.set(0,-3,0);
    scene.add(spotLight);


    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    currentMount.appendChild(renderer.domElement);

    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Gives it a smooth, physical momentum when swiping
    controls.dampingFactor = 0.05; // Adjusts how heavy the momentum feels
    controls.enablePan=false;
    // controls.enableRotate=false;
    // controls.enableZoom=false;
    controls.minDistance=2;
    controls.maxDistance=5;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 3;
    controls.minAzimuthAngle = -Math.PI / 8; // 45 degrees to the left
    controls.maxAzimuthAngle = Math.PI / 8;

    const monitorGeo = new THREE.BoxGeometry(4, 2.5, 0.2);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    scene.add(monitor);
    const screenGeo = new THREE.PlaneGeometry(3.8, 2.3);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.11; // Push it out slightly so it doesn't overlap
    monitor.add(screen);    
    const clickableObjects = [];

    // Helper function to create a link button
    const createLinkButton = (color, yPos, url) => {
      const btnGeo = new THREE.PlaneGeometry(2, 0.5);
      const btnMat = new THREE.MeshBasicMaterial({ color: color });
      const button = new THREE.Mesh(btnGeo, btnMat);
      
      button.position.set(0, yPos, 0.12); // Slightly in front of the black screen
      
      // CRITICAL: We attach custom data to this specific mesh!
      button.userData = { 
          isLink: true, 
          url: url 
      };
      
      monitor.add(button);
      clickableObjects.push(button); // Add to our list of clickables
    };

    // Create two links
    createLinkButton(0x0055ff, 0.5, 'https://google.com'); // Top button (Blue)
    createLinkButton(0xff5500, -0.5, 'https://youtube.com'); // Bottom button (Orange)


    // ==========================================
    // 3. The Raycaster (Click Detection)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const gltfLoader=new GLTFLoader();
    let myMesh;
    gltfLoader.load('/model.glb',(gltf)=>{
      myMesh=gltf.scene;
      myMesh.scale.set(28,28,28); 
      myMesh.position.set(0, 0, 0);
      myMesh.rotateY(0.7);

    

      scene.add(myMesh);
    },
    (progress) => {

    // console.log((progress.loaded / progress.total * 100) + '% loaded');
    },
    (error) => {

    console.error('Error hoe gay', error);
    }
);
    




    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    let envMap;

    new EXRLoader()
      .setDataType(THREE.HalfFloatType)
      .load('/satara_night_1k.exr', (texture) => {
        envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap; 
        scene.background = envMap;  
        texture.dispose();
      });
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Required for realistic exposure changes
    renderer.toneMappingExposure = 0.1;

    const onClick = (event) => {
      // 1. Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // 2. Shoot the laser from the camera through the mouse position
      raycaster.setFromCamera(mouse, camera);

      // 3. See what the laser hit (only checking our specific link buttons)
      const intersects = raycaster.intersectObjects(clickableObjects);

      if (intersects.length > 0) {
        // We hit something! Grab the first object we hit.
        const hitObject = intersects[0].object;
        
        // Open the URL attached to its userData
        if (hitObject.userData.isLink) {
            window.open(hitObject.userData.url, '_blank');
        }
      }
    };

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects);

      // Change CSS cursor depending on if we are hovering a link
      if (intersects.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
      } else {
          renderer.domElement.style.cursor = 'default';
      }
    };

    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);


    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // I have commented out the automatic rotation so you can feel the touch controls!
      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;

      // 3. Update Controls
      // This MUST be called every frame for the smooth damping momentum to work
      controls.update();

      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onMouseMove);      
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }


      renderer.dispose();
      
      pmremGenerator.dispose();
      if (envMap) envMap.dispose(); 
      

      controls.dispose();
    };
  }, []);

  return (<div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />);
}

export default Square;