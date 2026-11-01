import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080C, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Gold + Electric Orange + Cool Ambient)
    const ambientLight = new THREE.AmbientLight(0x222230, 1.8);
    scene.add(ambientLight);

    const goldDirLight = new THREE.DirectionalLight(0xD4AF37, 2.5);
    goldDirLight.position.set(5, 8, 4);
    scene.add(goldDirLight);

    const orangePointLight = new THREE.PointLight(0xFF5722, 3, 15);
    orangePointLight.position.set(-3, 2, 2);
    scene.add(orangePointLight);

    const cyanPointLight = new THREE.PointLight(0x06B6D4, 2, 12);
    cyanPointLight.position.set(3, -1, 1);
    scene.add(cyanPointLight);

    // 3. 3D Delivery Vehicle / Scooter Model (Procedural High-Detail Mesh)
    const vehicleGroup = new THREE.Group();

    // Scooter Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.45, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A24,
      metalness: 0.8,
      roughness: 0.25,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.5;
    vehicleGroup.add(bodyMesh);

    // Gold Trim Accents
    const trimGeo = new THREE.BoxGeometry(1.65, 0.08, 0.82);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x554400,
      emissiveIntensity: 0.3,
    });
    const trimMesh = new THREE.Mesh(trimGeo, goldMat);
    trimMesh.position.y = 0.5;
    vehicleGroup.add(trimMesh);

    // Thermal Delivery Cargo Box on Rear
    const boxGeo = new THREE.BoxGeometry(0.7, 0.75, 0.7);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xFF5722, // Electric orange thermal food container
      roughness: 0.4,
      metalness: 0.2,
    });
    const cargoBox = new THREE.Mesh(boxGeo, boxMat);
    cargoBox.position.set(-0.4, 0.95, 0);
    vehicleGroup.add(cargoBox);

    // Cargo Box Logo Strip
    const stripGeo = new THREE.BoxGeometry(0.72, 0.15, 0.72);
    const stripMesh = new THREE.Mesh(stripGeo, goldMat);
    stripMesh.position.set(-0.4, 0.95, 0);
    vehicleGroup.add(stripMesh);

    // Windshield / Cockpit
    const windshieldGeo = new THREE.CylinderGeometry(0.1, 0.4, 0.6, 16, 1, false, 0, Math.PI);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x06B6D4,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.rotation.z = Math.PI / 4;
    windshield.position.set(0.65, 0.9, 0);
    vehicleGroup.add(windshield);

    // Front Headlight (Glowing LED)
    const lightGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const headlight = new THREE.Mesh(lightGeo, lightMat);
    headlight.position.set(0.85, 0.55, 0);
    vehicleGroup.add(headlight);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0E, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9, roughness: 0.2 });

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.x = Math.PI / 2;
    frontWheel.position.set(0.6, 0.25, 0);
    const frontRim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16), rimMat);
    frontRim.rotation.x = Math.PI / 2;
    frontRim.position.copy(frontWheel.position);
    vehicleGroup.add(frontWheel, frontRim);

    const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheel.rotation.x = Math.PI / 2;
    rearWheel.position.set(-0.6, 0.25, 0);
    const rearRim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16), rimMat);
    rearRim.rotation.x = Math.PI / 2;
    rearRim.position.copy(rearWheel.position);
    vehicleGroup.add(rearWheel, rearRim);

    vehicleGroup.position.set(-0.5, 0.2, 0);
    vehicleGroup.rotation.y = 0.45;
    scene.add(vehicleGroup);

    // 4. Floating 3D Packages & Glowing GPS Waypoint Pins
    const floatingGroup = new THREE.Group();

    // Floating Parcel 1
    const p1Geo = new THREE.BoxGeometry(0.45, 0.4, 0.45);
    const p1Mat = new THREE.MeshStandardMaterial({ color: 0x2A2A38, metalness: 0.5, roughness: 0.3 });
    const parcel1 = new THREE.Mesh(p1Geo, p1Mat);
    parcel1.position.set(1.8, 1.4, -0.5);
    floatingGroup.add(parcel1);

    // Floating Parcel 2 (Gold Box)
    const p2Geo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const parcel2 = new THREE.Mesh(p2Geo, goldMat);
    parcel2.position.set(-2.2, 1.8, -1.0);
    floatingGroup.add(parcel2);

    // Glowing GPS Waypoint Pin
    const pinHeadGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const pinConeGeo = new THREE.ConeGeometry(0.24, 0.5, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x10B981, // Emerald green GPS pin
      emissive: 0x10B981,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const pinGroup = new THREE.Group();
    const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
    pinHead.position.y = 0.4;
    const pinCone = new THREE.Mesh(pinConeGeo, pinMat);
    pinCone.rotation.x = Math.PI;
    pinGroup.add(pinHead, pinCone);
    pinGroup.position.set(2.4, 0.6, 0.8);
    floatingGroup.add(pinGroup);

    // Pulsing Radar Rings under GPS Pin
    const ringGeo = new THREE.RingGeometry(0.2, 0.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const radarRing = new THREE.Mesh(ringGeo, ringMat);
    radarRing.rotation.x = Math.PI / 2;
    radarRing.position.set(2.4, -0.2, 0.8);
    floatingGroup.add(radarRing);

    scene.add(floatingGroup);

    // 5. Holographic Logistics Ground Grid
    const gridHelper = new THREE.GridHelper(16, 24, 0xD4AF37, 0x1D1D2B);
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    // 6. Floating Ambient Particle Matrix
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = Math.random() * 5 - 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Interactive Parallax & Mouse Tracking
    let targetX = 0;
    let targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.25;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Vehicle gentle idle float & suspension tilt
        vehicleGroup.position.y = 0.2 + Math.sin(elapsedTime * 2.5) * 0.06;
        vehicleGroup.rotation.z = Math.sin(elapsedTime * 2.0) * 0.02;

        // Floating parcels smooth tumbling
        parcel1.position.y = 1.4 + Math.sin(elapsedTime * 1.8 + 1) * 0.12;
        parcel1.rotation.x = elapsedTime * 0.4;
        parcel1.rotation.y = elapsedTime * 0.3;

        parcel2.position.y = 1.8 + Math.cos(elapsedTime * 2.2) * 0.15;
        parcel2.rotation.y = elapsedTime * 0.6;
        parcel2.rotation.z = elapsedTime * 0.2;

        // GPS pin hover & radar pulse
        pinGroup.position.y = 0.6 + Math.sin(elapsedTime * 3) * 0.08;
        pinGroup.rotation.y = elapsedTime * 1.2;

        const pulseScale = 1 + (elapsedTime % 1.5) * 0.8;
        radarRing.scale.set(pulseScale, pulseScale, 1);
        ringMat.opacity = Math.max(0, 0.7 - (elapsedTime % 1.5) * 0.45);

        // Smooth camera dampening towards mouse
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (2.5 + targetY - camera.position.y) * 0.05;
        camera.lookAt(0, 0.6, 0);

        // Slow grid shimmer
        gridHelper.position.z = (elapsedTime * 0.4) % 0.66;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-[400px] md:h-[460px] overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing"
      title="Interactive 3D Fleet Canvas — Move cursor to orbit"
    >
      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-charcoal-900/80 border border-gold-500/30 text-xs font-mono text-gold-400 flex items-center space-x-2 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Three.js 3D Engine • Realtime</span>
      </div>
    </div>
  );
};
