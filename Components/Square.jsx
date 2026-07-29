import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const Square = () => {
  const mountRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    // Default background color while EXR loads
    scene.background = new THREE.Color(0x111111); 
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const axes = new THREE.AxesHelper(200);
    scene.add(axes);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    
    // Set tone mapping so we can adjust exposure (brightness) dynamically!
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Default, will be updated by time of day
    
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI / 2; // Can't go below ground
    controls.minPolarAngle = Math.PI / 3;
    controls.minAzimuthAngle = -Math.PI / 8;
    controls.maxAzimuthAngle = Math.PI / 8;

    const monitorGeo = new THREE.BoxGeometry(4, 2.5, 0.2);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    scene.add(monitor);

    const screenGeo = new THREE.PlaneGeometry(3.8, 2.3);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.11;
    monitor.add(screen);

    const weatherCanvas = document.createElement('canvas');
    weatherCanvas.width = 1024;
    weatherCanvas.height = 512;
    const weatherCtx = weatherCanvas.getContext('2d');
    const weatherTexture = new THREE.CanvasTexture(weatherCanvas);

    const drawWeather = (temp, condition, locName) => {
      weatherCtx.fillStyle = '#1e1e1e';
      weatherCtx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);
      weatherCtx.fillStyle = '#ffffff';
      weatherCtx.textAlign = 'center';
      weatherCtx.font = '50px sans-serif';
      weatherCtx.fillText(locName, weatherCanvas.width / 2, 100);
      weatherCtx.font = 'bold 180px sans-serif';
      weatherCtx.fillStyle = '#4fa0ff';
      weatherCtx.fillText(`${temp}°`, weatherCanvas.width / 2, 320);
      weatherCtx.font = '60px sans-serif';
      weatherCtx.fillStyle = '#aaaaaa';
      weatherCtx.fillText(condition, weatherCanvas.width / 2, 450);
      weatherTexture.needsUpdate = true;
    };

    drawWeather('--', 'Locating...', 'Waiting for GPS...');

    const weatherGeo = new THREE.PlaneGeometry(3.4, 1.2);
    const weatherMaterial = new THREE.MeshBasicMaterial({ map: weatherTexture });
    const weatherPanel = new THREE.Mesh(weatherGeo, weatherMaterial);
    weatherPanel.position.set(0, 0.4, 0.12);
    monitor.add(weatherPanel);

    const clickableObjects = [];
    const createLinkButton = (color, xPos, yPos, url) => {
      const btnGeo = new THREE.PlaneGeometry(1.5, 0.5);
      const btnMat = new THREE.MeshBasicMaterial({ color: color });
      const button = new THREE.Mesh(btnGeo, btnMat);
      button.position.set(xPos, yPos, 0.12);
      button.userData = { isLink: true, url: url };
      monitor.add(button);
      clickableObjects.push(button);
    };

    createLinkButton(0x0055ff, -0.9, -0.5, 'https://google.com'); 
    createLinkButton(0xff5500, 0.9, -0.5, 'https://youtube.com'); 

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    let envMap;

    // A helper function to swap EXR files dynamically
    const loadDynamicEXR = (exrFilename) => {
        new EXRLoader()
          .setDataType(THREE.HalfFloatType)
          .load(`/${exrFilename}`, (texture) => {
            if (envMap) envMap.dispose(); // Cleanup old map if swapping
            envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.environment = envMap; 
            scene.background = envMap;  
            texture.dispose();
          }, undefined, (err) => {
              console.error(`Failed to load ${exrFilename}. Did you place it in the public folder?`, err);
          });
    };

    // Helper logic to map weather to a specific file
    const getExrFile = (isClear, isDay) => {
        if (isDay) {
            return isClear ? 'clear_day.exr' : 'cloudy_day.exr';
        } else {
            return isClear ? 'clear_night.exr' : 'cloudy_night.exr';
        }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ latitude: lat, longitude: lon });
          
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
            .then(res => res.json())
            .then(geoData => {
              const locationName = geoData.city || geoData.locality || "Current Location";
              
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`)
                .then(res => res.json())
                .then(data => {
                   setWeather(data.current_weather);
                   const temp = data.current_weather.temperature;
                   const code = data.current_weather.weathercode;
                   
                   // Weather logic
                   const isClear = code === 0 || code === 1;
                   const condition = isClear ? 'Clear / Sunny' : (code < 40 ? 'Cloudy' : 'Rain/Storm');
                   drawWeather(temp, condition, locationName);

                   // Time of Day & Exposure Logic
                   const now = new Date(data.current_weather.time);
                   const sunrise = new Date(data.daily.sunrise[0]);
                   const sunset = new Date(data.daily.sunset[0]);
                   const isDay = now > sunrise && now < sunset;
                   
                   let exposure = 0.1; // Default night exposure
                   
                   if (isDay) {
                       const dayLength = sunset.getTime() - sunrise.getTime();
                       const timeSinceSunrise = now.getTime() - sunrise.getTime();
                       const progress = timeSinceSunrise / dayLength; // 0.0 to 1.0
                       
                       // Math: Parabola peaking at 1.0 exactly at Noon (progress = 0.5)
                       const sunIntensity = 4 * progress * (1 - progress); 
                       
                       // Base day exposure is 0.3 (dawn/dusk), peaks at 1.5 (noon)
                       exposure = 0.3 + (sunIntensity * 1.2); 
                       
                       // If cloudy, dim the scene by 40%
                       if (!isClear) exposure *= 0.6; 
                   } else {
                       // Night time
                       exposure = isClear ? 0.08 : 0.03; // Even darker if cloudy at night
                   }
                   
                   // 1. Apply the calculated brightness!
                   renderer.toneMappingExposure = exposure;

                   // 2. Figure out which EXR file to load based on the data!
                   const exrToLoad = getExrFile(isClear, isDay);
                   console.log(`Loading ${exrToLoad} with exposure ${exposure.toFixed(2)}`);
                   
                   loadDynamicEXR(exrToLoad);
                })
                .catch(() => drawWeather('--', 'Weather Error', locationName));
            })
            .catch(() => drawWeather('--', 'Geocoding Error', 'Unknown City'));
        },
        (error) => drawWeather('--', 'Access Denied', 'Location Unknown')
      );
    } else {
      drawWeather('--', 'Not Supported', 'No GPS');
    }

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
        if (hitObject.userData.isLink) window.open(hitObject.userData.url, '_blank');
      }
    };

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects);
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    window.addEventListener('click', onClick);
    window.addEventListener('mousemove', onMouseMove);

    const gltfLoader = new GLTFLoader();
    let myMesh;
    gltfLoader.load('/model.glb', (gltf) => {
      myMesh = gltf.scene;
      myMesh.scale.set(28, 28, 28); 
      myMesh.position.set(0, 0, 0);
      myMesh.rotateY(0.7);
      scene.add(myMesh);
    }, undefined, (error) => console.error('Error loading model', error));

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onMouseMove);      
      if (currentMount) currentMount.removeChild(renderer.domElement);
      renderer.dispose();
      pmremGenerator.dispose();
      if (envMap) envMap.dispose(); 
      controls.dispose();
    };
  }, []);

  return (<div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />);
}

export default Square;