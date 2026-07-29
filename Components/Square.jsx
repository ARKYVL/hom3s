// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
// // 1. Import OrbitControls from the examples folder
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// const Square = () => {
//   const mountRef = useRef(null);
//   const[location,setLocation]=useState(null);
//   const [weather,setWeather]=useState(null);

//   useEffect(() => {
//     if(!navigator.geolocation){
//       console.log("error")
//     }
//     else{
//       navigator.geolocation.getCurrentPosition((position)=>{
//         setLocation({
//           latitude:position.coords.latitude,
//           longitude:position.coords.longitude
//         }
//         )
//       })
//     }
//     async const getWeather=()=>{
//       const response= await fetch
//       setWeather((data)=>{})
//     }
//     const currentMount = mountRef.current;

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     camera.position.z = 5;
//     // camera.rotateY(20);

//     const axes=new THREE.AxesHelper(200);
//     scene.add(axes);

//     const spotLight = new THREE.SpotLight(0xff0000, 1000, 2000, Math.PI / 6, 0.5, 2);
//     spotLight.position.set(-2,1,-2);
//     spotLight.target.position.set(0,-3,0);
//     scene.add(spotLight);


//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.domElement.style.display = 'block';
//     currentMount.appendChild(renderer.domElement);

    
//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true; // Gives it a smooth, physical momentum when swiping
//     controls.dampingFactor = 0.05; // Adjusts how heavy the momentum feels
//     controls.enablePan=false;
//     // controls.enableRotate=false;
//     // controls.enableZoom=false;
//     controls.minDistance=2;
//     controls.maxDistance=5;
//     controls.maxPolarAngle = Math.PI / 2;
//     controls.minPolarAngle = Math.PI / 3;
//     controls.minAzimuthAngle = -Math.PI / 8; // 45 degrees to the left
//     controls.maxAzimuthAngle = Math.PI / 8;

//     const monitorGeo = new THREE.BoxGeometry(4, 2.5, 0.2);
//     const monitorMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
//     const monitor = new THREE.Mesh(monitorGeo, monitorMat);
//     scene.add(monitor);
//     const screenGeo = new THREE.PlaneGeometry(3.8, 2.3);
//     const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
//     const screen = new THREE.Mesh(screenGeo, screenMat);
//     screen.position.z = 0.11; // Push it out slightly so it doesn't overlap
//     monitor.add(screen);    
//     const clickableObjects = [];

//     // Helper function to create a link button
//     const createLinkButton = (color, yPos, url) => {
//       const btnGeo = new THREE.PlaneGeometry(2, 0.5);
//       const btnMat = new THREE.MeshBasicMaterial({ color: color });
//       const button = new THREE.Mesh(btnGeo, btnMat);
      
//       button.position.set(0, yPos, 0.12); // Slightly in front of the black screen
      
//       // CRITICAL: We attach custom data to this specific mesh!
//       button.userData = { 
//           isLink: true, 
//           url: url 
//       };
      
//       monitor.add(button);
//       clickableObjects.push(button); // Add to our list of clickables
//     };

//     // Create two links
//     createLinkButton(0x0055ff, 0.5, 'https://google.com'); // Top button (Blue)
//     createLinkButton(0xff5500, -0.5, 'https://youtube.com'); // Bottom button (Orange)


//     // ==========================================
//     // 3. The Raycaster (Click Detection)
//     // ==========================================
//     const raycaster = new THREE.Raycaster();
//     const mouse = new THREE.Vector2();
    
//     const gltfLoader=new GLTFLoader();
//     let myMesh;
//     gltfLoader.load('/model.glb',(gltf)=>{
//       myMesh=gltf.scene;
//       myMesh.scale.set(28,28,28); 
//       myMesh.position.set(0, 0, 0);
//       myMesh.rotateY(0.7);

    

//       scene.add(myMesh);
//     },
//     (progress) => {

//     // console.log((progress.loaded / progress.total * 100) + '% loaded');
//     },
//     (error) => {

//     console.error('Error hoe gay', error);
//     }
// );
    




//     const pmremGenerator = new THREE.PMREMGenerator(renderer);
//     pmremGenerator.compileEquirectangularShader();

//     let envMap;

//     new EXRLoader()
//       .setDataType(THREE.HalfFloatType)
//       .load('/satara_night_1k.exr', (texture) => {
//         envMap = pmremGenerator.fromEquirectangular(texture).texture;
//         scene.environment = envMap; 
//         scene.background = envMap;  
//         texture.dispose();
//       });
//     renderer.toneMapping = THREE.ACESFilmicToneMapping; // Required for realistic exposure changes
//     renderer.toneMappingExposure = 0.1;

//     const onClick = (event) => {
//       // 1. Calculate mouse position in normalized device coordinates (-1 to +1)
//       const rect = renderer.domElement.getBoundingClientRect();
//       mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       // 2. Shoot the laser from the camera through the mouse position
//       raycaster.setFromCamera(mouse, camera);

//       // 3. See what the laser hit (only checking our specific link buttons)
//       const intersects = raycaster.intersectObjects(clickableObjects);

//       if (intersects.length > 0) {
//         // We hit something! Grab the first object we hit.
//         const hitObject = intersects[0].object;
        
//         // Open the URL attached to its userData
//         if (hitObject.userData.isLink) {
//             window.open(hitObject.userData.url, '_blank');
//         }
//       }
//     };

//     const onMouseMove = (event) => {
//       const rect = renderer.domElement.getBoundingClientRect();
//       mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.setFromCamera(mouse, camera);
//       const intersects = raycaster.intersectObjects(clickableObjects);

//       // Change CSS cursor depending on if we are hovering a link
//       if (intersects.length > 0) {
//           renderer.domElement.style.cursor = 'pointer';
//       } else {
//           renderer.domElement.style.cursor = 'default';
//       }
//     };

//     window.addEventListener('click', onClick);
//     window.addEventListener('mousemove', onMouseMove);


//     let animationFrameId;
//     const animate = () => {
//       animationFrameId = requestAnimationFrame(animate);
      
//       // I have commented out the automatic rotation so you can feel the touch controls!
//       // cube.rotation.x += 0.01;
//       // cube.rotation.y += 0.01;

//       // 3. Update Controls
//       // This MUST be called every frame for the smooth damping momentum to work
//       controls.update();

//       renderer.render(scene, camera);
//     };
//     animate();
//     return () => {
//       cancelAnimationFrame(animationFrameId);
//       window.removeEventListener('click', onClick);
//       window.removeEventListener('mousemove', onMouseMove);      
//       if (currentMount) {
//         currentMount.removeChild(renderer.domElement);
//       }


//       renderer.dispose();
      
//       pmremGenerator.dispose();
//       if (envMap) envMap.dispose(); 
      

//       controls.dispose();
//     };
//   }, []);

//   return (<div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />);
// }

// export default Square;
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
// 1. Import OrbitControls from the examples folder
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const Square = () => {
  const mountRef = useRef(null);
  // We no longer strictly need these state variables if we draw directly to the canvas,
  // but keeping them is fine if you plan to use them outside the 3D scene later.
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // ==========================================
    // 1. Basic Scene Setup
    // ==========================================
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const axes = new THREE.AxesHelper(200);
    scene.add(axes);

    const spotLight = new THREE.SpotLight(0xff0000, 1000, 2000, Math.PI / 6, 0.5, 2);
    spotLight.position.set(-2, 1, -2);
    spotLight.target.position.set(0, -3, 0);
    scene.add(spotLight);
    scene.add(spotLight.target); // MUST add the target to the scene!

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 3;
    controls.minAzimuthAngle = -Math.PI / 8;
    controls.maxAzimuthAngle = Math.PI / 8;

    // ==========================================
    // 2. Build the Monitor & Screen
    // ==========================================
    const monitorGeo = new THREE.BoxGeometry(4, 2.5, 0.2);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    scene.add(monitor);

    const screenGeo = new THREE.PlaneGeometry(3.8, 2.3);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.11;
    monitor.add(screen);

    // ==========================================
    // 3. Weather Canvas Setup
    // ==========================================
    // A. Create an invisible 2D HTML Canvas
    const weatherCanvas = document.createElement('canvas');
    weatherCanvas.width = 1024;
    weatherCanvas.height = 512;
    const weatherCtx = weatherCanvas.getContext('2d');
    
    // B. Convert that Canvas into a Three.js Texture
    const weatherTexture = new THREE.CanvasTexture(weatherCanvas);

    // C. Function to draw text on our 2D canvas
    const drawWeather = (temp, condition, locName) => {
      // Background
      weatherCtx.fillStyle = '#1e1e1e';
      weatherCtx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);
      
      // Text Setup
      weatherCtx.fillStyle = '#ffffff';
      weatherCtx.textAlign = 'center';
      
      // Draw Location
      weatherCtx.font = '50px sans-serif';
      weatherCtx.fillText(locName, weatherCanvas.width / 2, 100);
      
      // Draw Temperature
      weatherCtx.font = 'bold 180px sans-serif';
      weatherCtx.fillStyle = '#4fa0ff';
      weatherCtx.fillText(`${temp}°`, weatherCanvas.width / 2, 320);
      
      // Draw Condition
      weatherCtx.font = '60px sans-serif';
      weatherCtx.fillStyle = '#aaaaaa';
      weatherCtx.fillText(condition, weatherCanvas.width / 2, 450);

      // Tell Three.js the image data has changed
      weatherTexture.needsUpdate = true;
    };

    // Draw initial state
    drawWeather('--', 'Locating...', 'Waiting for GPS...');

    // D. Create the 3D plane for the weather report
    const weatherGeo = new THREE.PlaneGeometry(3.4, 1.2);
    const weatherMaterial = new THREE.MeshBasicMaterial({ map: weatherTexture });
    const weatherPanel = new THREE.Mesh(weatherGeo, weatherMaterial);
    weatherPanel.position.set(0, 0.4, 0.12); // Positioned on top half of screen
    monitor.add(weatherPanel);

    // ==========================================
    // 4. Geolocation & API Fetching
    // ==========================================
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ latitude: lat, longitude: lon });
          
          // Fetch City Name (Reverse Geocoding)
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
            .then(res => res.json())
            .then(geoData => {
              const locationName = geoData.city || geoData.locality || "Current Location";
              
              // Fetch Weather
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(res => res.json())
                .then(data => {
                   setWeather(data.current_weather);
                   const temp = data.current_weather.temperature;
                   const code = data.current_weather.weathercode;
                   
                   // Basic mapping of WMO weather codes to text
                   const isClear = code === 0 || code === 1;
                   const condition = isClear ? 'Clear / Sunny' : (code < 40 ? 'Cloudy' : 'Rain/Storm');
                   
                   drawWeather(temp, condition, locationName);
                })
                .catch(() => drawWeather('--', 'Weather Error', locationName));
            })
            .catch(() => drawWeather('--', 'Geocoding Error', 'Unknown City'));
        },
        (error) => {
          console.log("Geolocation error:", error);
          drawWeather('--', 'Access Denied', 'Location Unknown');
        }
      );
    } else {
      console.log("Geolocation not supported");
      drawWeather('--', 'Not Supported', 'No GPS');
    }

    // ==========================================
    // 5. Interactive Links (Bottom of Screen)
    // ==========================================
    const clickableObjects = [];

    const createLinkButton = (color, xPos, yPos, url) => {
      const btnGeo = new THREE.PlaneGeometry(1.5, 0.5);
      const btnMat = new THREE.MeshBasicMaterial({ color: color });
      const button = new THREE.Mesh(btnGeo, btnMat);
      
      button.position.set(xPos, yPos, 0.12);
      
      button.userData = { 
          isLink: true, 
          url: url 
      };
      
      monitor.add(button);
      clickableObjects.push(button);
    };

    // Adjusted positions to fit side-by-side below the weather panel
    createLinkButton(0x0055ff, -0.9, -0.5, 'https://google.com'); 
    createLinkButton(0xff5500, 0.9, -0.5, 'https://youtube.com'); 

    // ==========================================
    // 6. Raycaster & Events
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
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

      if (intersects.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
      } else {
          renderer.domElement.style.cursor = 'default';
      }
    };

    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);

    // ==========================================
    // 7. Load GLB Model
    // ==========================================
    const gltfLoader = new GLTFLoader();
    let myMesh;
    gltfLoader.load('/model.glb', (gltf) => {
      myMesh = gltf.scene;
      myMesh.scale.set(28, 28, 28); 
      myMesh.position.set(0, 0, 0);
      myMesh.rotateY(0.7);
      scene.add(myMesh);
    }, undefined, (error) => {
      console.error('Error loading model', error);
    });

    // ==========================================
    // 8. Load EXR Environment
    // ==========================================
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
      
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.1;

    // ==========================================
    // 9. Animation Loop
    // ==========================================
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ==========================================
    // 10. Cleanup
    // ==========================================
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

  return (<div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />);
}

export default Square;