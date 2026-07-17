import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  RefreshCw, 
  Lightbulb, 
  HelpCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Controls3DOverviewProps {
  language: 'EN' | 'FR' | 'RU';
  glowingRooms: Record<string, boolean>;
  toggleRoomGlow: (room: string) => void;
  lightScene: 'ambient' | 'bright' | 'relax' | 'night';
  currentTemp: number;
}

interface Room3DConfig {
  id: string;
  name: { EN: string; FR: string; RU: string };
  type: 'suite' | 'meeting' | 'corridor';
  // 3D coordinates: x, y, z positions and width, height, depth dimensions
  pos: [number, number, number];
  size: [number, number, number];
  baseTemp: number;
  capacity: number;
}

const ROOMS_3D: Room3DConfig[] = [
  { 
    id: '201', 
    name: { EN: 'Royal Suite 201', FR: 'Suite Royale 201', RU: 'Королевский Люкс 201' }, 
    type: 'suite', 
    pos: [-4.5, 0.75, -2.5],
    size: [4.2, 1.5, 3.2],
    baseTemp: 21.5,
    capacity: 2 
  },
  { 
    id: '202', 
    name: { EN: 'Imperial Suite 202', FR: 'Suite Impériale 202', RU: 'Императорский Люкс 202' }, 
    type: 'suite', 
    pos: [4.5, 0.75, -2.5],
    size: [4.2, 1.5, 3.2],
    baseTemp: 22.0,
    capacity: 3 
  },
  { 
    id: 'corridor', 
    name: { EN: 'Grand Corridor B', FR: 'Grand Couloir B', RU: 'Главный Коридор Б' }, 
    type: 'corridor', 
    pos: [0, 0.75, 0],
    size: [2.8, 1.5, 8.2],
    baseTemp: 20.0,
    capacity: 10 
  },
  { 
    id: 'meeting', 
    name: { EN: 'Sovereign Boardroom A', FR: 'Salle de Conseil A', RU: 'Президентский Зал A' }, 
    type: 'meeting', 
    pos: [-4.5, 0.75, 2.5],
    size: [4.2, 1.5, 3.2],
    baseTemp: 21.0,
    capacity: 12 
  },
  { 
    id: '203', 
    name: { EN: 'Prestige Suite 203', FR: 'Suite Prestige 203', RU: 'Престиж Люкс 203' }, 
    type: 'suite', 
    pos: [4.5, 0.75, 2.5],
    size: [4.2, 1.5, 3.2],
    baseTemp: 22.5,
    capacity: 2 
  }
];

export const Controls3DOverview: React.FC<Controls3DOverviewProps> = ({
  language,
  glowingRooms,
  toggleRoomGlow,
  lightScene,
  currentTemp
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // UI Interactive States
  const [selectedRoomId, setSelectedRoomId] = useState<string>('201');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [projectedLabels, setProjectedLabels] = useState<Array<{ id: string; name: string; x: number; y: number; isGlowing: boolean }>>([]);

  // Translations
  const t = {
    EN: {
      title: "Interactive 3D Control Deck",
      subtitle: "Three.js Spatial Atmosphere - Orbit and click suites to dispatch smart glows",
      autoRotate: "Auto-Rotation",
      particles: "Ambient Dust",
      resetView: "Reset Camera",
      selectedTitle: "Spatial Telemetry",
      ambientMode: "Lighting Scene Mode",
      statusLights: "Status Lights",
      glowing: "Glowing",
      dormant: "Power Saver",
      instruct: "Left-click & Drag to rotate • Scroll to zoom • Click room to toggle system",
      energyLabel: "Est. Thermal Ingress",
    },
    FR: {
      title: "Deck de Contrôle 3D Interactif",
      subtitle: "Atmosphère Spatiale Three.js - Pivotez et cliquez sur les suites pour gérer l'éclairage",
      autoRotate: "Rotation Auto",
      particles: "Poussière Ambiante",
      resetView: "Réinitialiser",
      selectedTitle: "Télémétrie Spatiale",
      ambientMode: "Mode de Scène Lumineuse",
      statusLights: "État Lumineux",
      glowing: "Éclairé",
      dormant: "Éco Énergie",
      instruct: "Clic gauche & Glisser pour pivoter • Molette pour zoomer • Cliquer pour basculer",
      energyLabel: "Flux Thermique Estimé",
    },
    RU: {
      title: "Интерактивный 3D-Пульт",
      subtitle: "Пространственная атмосфера Three.js - Вращайте и кликайте для управления светом",
      autoRotate: "Авто-Вращение",
      particles: "Частицы Света",
      resetView: "Сбросить Камеру",
      selectedTitle: "Пространственная Телеметрия",
      ambientMode: "Световой Сценарий",
      statusLights: "Световой Статус",
      glowing: "Подсветка",
      dormant: "Энергосбережение",
      instruct: "ЛКМ + Перетаскивание для вращения • Колесо для зума • Клик для переключения",
      energyLabel: "Тепловой поток",
    }
  }[language];

  // Helper variables for rotation dragging
  const dragRef = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    targetRotationY: -Math.PI / 6,
    targetRotationX: Math.PI / 8,
    currentRotationY: -Math.PI / 6,
    currentRotationX: Math.PI / 8,
    zoomDistance: 16,
    targetZoomDistance: 16
  });

  // Track state in ref for animation frame callback
  const glowRoomsRef = useRef(glowingRooms);
  useEffect(() => {
    glowRoomsRef.current = glowingRooms;
  }, [glowingRooms]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 400;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x131313, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8, 16);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // 4. Pivot Group for Dragging & Auto-rotation
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // 5. Grid Helper Floor with gold tint
    const gridHelper = new THREE.GridHelper(20, 20, 0xc19a6b, 0x3a352a);
    gridHelper.position.y = 0;
    // Lower grid opacity
    if (Array.isArray(gridHelper.material)) {
      gridHelper.material.forEach(m => { m.transparent = true; m.opacity = 0.25; });
    } else if (gridHelper.material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.25;
    }
    pivotGroup.add(gridHelper);

    // A subtle circular boundary ring
    const ringGeo = new THREE.RingGeometry(11, 11.2, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc19a6b, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    pivotGroup.add(ring);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8f0, 0.6);
    dirLight.position.set(10, 15, 8);
    scene.add(dirLight);

    // Additional blue/indigo ambient glow from below
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x1d1a15, 0.2);
    scene.add(hemisphereLight);

    // 7. Room Meshes Generation
    const roomMeshes: Array<{
      id: string;
      boxMesh: THREE.Mesh;
      wireMesh: THREE.LineSegments;
      pointLight: THREE.PointLight;
      occupancyPulse: THREE.Mesh;
    }> = [];

    ROOMS_3D.forEach(room => {
      const group = new THREE.Group();
      group.position.set(...room.pos);

      // Room main block geometry
      const [w, h, d] = room.size;
      const boxGeo = new THREE.BoxGeometry(w, h, d);
      
      // Standard material with glass physics representation
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.15,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.userData = { roomId: room.id };
      group.add(boxMesh);

      // Wireframe contour
      const edges = new THREE.EdgesGeometry(boxGeo);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: 0xc19a6b, 
        transparent: true, 
        opacity: 0.35,
        linewidth: 1.5 
      });
      const wireMesh = new THREE.LineSegments(edges, lineMat);
      group.add(wireMesh);

      // Dynamic local point light inside
      const pointLight = new THREE.PointLight(0xd4af37, 0, 8, 1.2);
      pointLight.position.set(0, 0.2, 0);
      group.add(pointLight);

      // Pulsing green occupancy sphere
      const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.8
      });
      const occupancyPulse = new THREE.Mesh(sphereGeo, sphereMat);
      occupancyPulse.position.set(0, -0.4, 0);
      group.add(occupancyPulse);

      pivotGroup.add(group);

      roomMeshes.push({
        id: room.id,
        boxMesh,
        wireMesh,
        pointLight,
        occupancyPulse
      });
    });

    // 8. Particles Ambient Starfield Dust
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 22;     // X
      positions[i + 1] = Math.random() * 5 + 0.1;   // Y
      positions[i + 2] = (Math.random() - 0.5) * 22; // Z
      speeds[i / 3] = Math.random() * 0.02 + 0.005;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc19a6b,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMat);
    pivotGroup.add(particleSystem);

    // Raycasting for interactive clicks & hovers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse Interaction Handlers
    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      dragRef.current.isDragging = true;
      dragRef.current.prevMouseX = clickX;
      dragRef.current.prevMouseY = clickY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Click / Hover raycasting
      mouse.x = (currentX / width) * 2 - 1;
      mouse.y = -(currentY / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomMeshes.map(r => r.boxMesh));

      if (intersects.length > 0) {
        const hitRoomId = intersects[0].object.userData.roomId;
        setHoveredRoomId(hitRoomId);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredRoomId(null);
        document.body.style.cursor = 'auto';
      }

      // Handle drag rotation
      if (dragRef.current.isDragging) {
        const deltaX = currentX - dragRef.current.prevMouseX;
        const deltaY = currentY - dragRef.current.prevMouseY;

        dragRef.current.targetRotationY += deltaX * 0.007;
        dragRef.current.targetRotationX = Math.max(
          -Math.PI / 12,
          Math.min(Math.PI / 2.5, dragRef.current.targetRotationX + deltaY * 0.007)
        );

        dragRef.current.prevMouseX = currentX;
        dragRef.current.prevMouseY = currentY;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;

      // If they didn't drag far, treat as a click to toggle or select
      const rect = renderer.domElement.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      mouse.x = (currentX / width) * 2 - 1;
      mouse.y = -(currentY / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomMeshes.map(r => r.boxMesh));

      if (intersects.length > 0) {
        const clickedRoomId = intersects[0].object.userData.roomId;
        setSelectedRoomId(clickedRoomId);
        toggleRoomGlow(clickedRoomId);
        
        // Dynamic confetti spark on interaction
        confetti({
          particleCount: 15,
          spread: 30,
          origin: { x: currentX / window.innerWidth, y: currentY / window.innerHeight },
          colors: ['#c19a6b', '#ffffff']
        });
      }
    };

    // Zoom wheel handler
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dragRef.current.targetZoomDistance = Math.max(
        6,
        Math.min(28, dragRef.current.targetZoomDistance + e.deltaY * 0.015)
      );
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('pointerdown', onPointerDown);
    canvasEl.addEventListener('pointermove', onPointerMove);
    canvasEl.addEventListener('pointerup', onPointerUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    // 9. Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth } = entries[0].contentRect;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    });
    resizeObserver.observe(containerRef.current);

    // 10. Animation & Render loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentGlows = glowRoomsRef.current;

      // Apply drag target smooth interpolation
      dragRef.current.currentRotationY += (dragRef.current.targetRotationY - dragRef.current.currentRotationY) * 0.1;
      dragRef.current.currentRotationX += (dragRef.current.targetRotationX - dragRef.current.currentRotationX) * 0.1;
      dragRef.current.zoomDistance += (dragRef.current.targetZoomDistance - dragRef.current.zoomDistance) * 0.1;

      // Update Group Rotation
      pivotGroup.rotation.y = dragRef.current.currentRotationY;
      pivotGroup.rotation.x = dragRef.current.currentRotationX;

      // Apply Auto-Rotation if active and user isn't holding down
      if (autoRotate && !dragRef.current.isDragging) {
        dragRef.current.targetRotationY += 0.002;
      }

      // Position camera based on dynamic zoom distance
      camera.position.z = dragRef.current.zoomDistance;
      camera.lookAt(0, 0.5, 0);

      // Animate particles
      if (showParticles) {
        particleSystem.visible = true;
        const positionsArr = particleGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idxY = i * 3 + 1;
          positionsArr[idxY] -= speeds[i]; // move down
          if (positionsArr[idxY] < 0) {
            positionsArr[idxY] = 5; // reset top
          }
        }
        particleGeometry.attributes.position.needsUpdate = true;
        particleSystem.rotation.y += 0.001;
      } else {
        particleSystem.visible = false;
      }

      // Update rooms visual feedback dynamically based on props
      roomMeshes.forEach(room => {
        const isGlowing = currentGlows[room.id];
        const isHovered = hoveredRoomId === room.id;
        const isSelected = selectedRoomId === room.id;

        // Custom glow colors matching lightScene preset
        let glowColor = 0xc19a6b; // default gold
        if (lightScene === 'bright') glowColor = 0xfffae6;
        if (lightScene === 'relax') glowColor = 0xb58955;
        if (lightScene === 'night') glowColor = 0x4f371d;

        const mat = room.boxMesh.material as THREE.MeshStandardMaterial;
        
        // Materials dynamic adjustments
        if (isGlowing) {
          mat.color.setHex(glowColor);
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, isHovered ? 0.65 : 0.4, 0.1);
          mat.emissive.setHex(glowColor);
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.35, 0.1);
          
          room.pointLight.intensity = THREE.MathUtils.lerp(room.pointLight.intensity, 2.5, 0.1);
          room.pointLight.color.setHex(glowColor);
        } else {
          mat.color.setHex(0x1a1a1a);
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, isHovered ? 0.35 : 0.12, 0.1);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          
          room.pointLight.intensity = THREE.MathUtils.lerp(room.pointLight.intensity, 0, 0.1);
        }

        // Selected indicator scale & outline pulsing
        const wireMat = room.wireMesh.material as THREE.LineBasicMaterial;
        if (isSelected) {
          wireMat.color.setHex(0xc19a6b);
          wireMat.opacity = THREE.MathUtils.lerp(wireMat.opacity, 1.0, 0.1);
        } else {
          wireMat.color.setHex(isGlowing ? 0xc19a6b : 0x5a4a3a);
          wireMat.opacity = THREE.MathUtils.lerp(wireMat.opacity, isHovered ? 0.8 : 0.35, 0.1);
        }

        // Pulse occupancy indicators
        const pulse = Math.abs(Math.sin(elapsedTime * 2.5)) * 0.4 + 0.5;
        room.occupancyPulse.scale.set(pulse, pulse, pulse);
      });

      // Project 3D Positions to HTML 2D overlays for crispy labels
      const labelsData = ROOMS_3D.map(room => {
        const tempV = new THREE.Vector3(...room.pos);
        // Slightly raise the label relative to room height
        tempV.y += 0.95;

        // Apply pivot transforms to matching coordinates
        tempV.applyMatrix4(pivotGroup.matrixWorld);
        tempV.project(camera);

        // Convert projection coordinates to pixel coordinates
        const x = (tempV.x * .5 + .5) * width;
        const y = (-(tempV.y * .5) + .5) * height;

        return {
          id: room.id,
          name: room.name[language],
          x,
          y,
          isGlowing: currentGlows[room.id]
        };
      });
      setProjectedLabels(labelsData);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      canvasEl.removeEventListener('pointermove', onPointerMove);
      canvasEl.removeEventListener('pointerup', onPointerUp);
      canvasEl.removeEventListener('wheel', onWheel);
      
      // Dispose Geometries/Materials
      scene.clear();
      renderer.dispose();
    };
  }, [language, autoRotate, showParticles, hoveredRoomId, selectedRoomId, lightScene]);

  // Quick reset view callback
  const handleResetView = () => {
    dragRef.current.targetRotationY = -Math.PI / 6;
    dragRef.current.targetRotationX = Math.PI / 8;
    dragRef.current.targetZoomDistance = 16;
    confetti({ particleCount: 10, colors: ['#c19a6b'] });
  };

  const selectedRoom = ROOMS_3D.find(r => r.id === selectedRoomId);

  return (
    <div className="p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl space-y-6 font-sans-luxury" id="threejs-control-deck-spatial">
      
      {/* Header section with toggle buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h3 className="text-lg font-bold font-serif-luxury text-slate-800 tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c19a6b] animate-pulse" />
            {t.title}
          </h3>
          <p className="text-xs text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* 3D Action Switches */}
        <div className="flex flex-wrap gap-2">
          {/* Reset button */}
          <button
            onClick={handleResetView}
            className="bg-white/60 hover:bg-[#c19a6b]/10 border border-slate-300 rounded-xl px-3 py-1.5 text-[10px] font-mono font-bold text-slate-700 active:scale-95 duration-100 flex items-center gap-1.5"
            title={t.resetView}
          >
            <RefreshCw className="w-3 h-3 text-[#7c5a30]" />
            <span>{t.resetView}</span>
          </button>

          {/* Auto rotate toggle */}
          <button
            onClick={() => {
              setAutoRotate(!autoRotate);
              confetti({ particleCount: 5 });
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-all duration-200 ${
              autoRotate
                ? 'bg-[#7c5a30] text-white border-[#7c5a30]'
                : 'bg-white/60 text-slate-600 border-slate-300 hover:bg-white/80'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{t.autoRotate}</span>
          </button>

          {/* Particles toggle */}
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-all duration-200 ${
              showParticles
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white/60 text-slate-600 border-slate-300 hover:bg-white/80'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.particles}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Area & Sidebar Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Three.js Canvas Container */}
        <div 
          ref={containerRef}
          className="xl:col-span-8 bg-[#faf8f4] rounded-2.5xl border border-slate-200/80 shadow-inner relative overflow-hidden select-none"
          style={{ height: '400px' }}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Floating projected HTML Labels */}
          {projectedLabels.map(lbl => {
            // Check if label coordinates fall within safe boundaries of canvas frame
            if (lbl.x < 15 || lbl.x > widthRef(containerRef) - 15 || lbl.y < 15 || lbl.y > 385) return null;

            return (
              <div
                key={lbl.id}
                onClick={() => {
                  setSelectedRoomId(lbl.id);
                  toggleRoomGlow(lbl.id);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-lg border text-[9.5px] font-mono font-bold cursor-pointer transition-all duration-150 backdrop-blur-sm shadow-md flex items-center gap-1 ${
                  selectedRoomId === lbl.id
                    ? 'bg-[#7c5a30] text-white border-[#c19a6b] scale-105 z-30 font-black ring-2 ring-[#c19a6b]/20'
                    : lbl.isGlowing
                      ? 'bg-amber-50/90 text-amber-900 border-[#c19a6b] z-20 hover:bg-amber-100'
                      : 'bg-white/80 text-slate-700 border-slate-300/80 z-10 hover:bg-white'
                }`}
                style={{ left: `${lbl.x}px`, top: `${lbl.y}px` }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${lbl.isGlowing ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`} />
                <span className="uppercase tracking-wider">{lbl.name.replace(/Suite|Boardroom|Corridor/gi, '').trim()}</span>
              </div>
            );
          })}

          {/* Drag Instruction Banner */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/75 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-[8.5px] font-mono text-stone-300 pointer-events-none flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#c19a6b]" />
            <span>{t.instruct}</span>
          </div>
        </div>

        {/* Selected parameters card & Smart preset toggler sidebar */}
        <div className="xl:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="bg-[#fcfaf5] border border-amber-200/50 rounded-2.5xl p-5 shadow-sm space-y-4 flex-1">
            <div className="border-b border-amber-200/30 pb-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#7c5a30]/80 font-bold block mb-1">
                {t.selectedTitle}
              </span>
              <h4 className="text-sm font-bold font-serif-luxury text-slate-850 flex items-center justify-between">
                <span>{selectedRoom ? selectedRoom.name[language] : 'Select spatial node'}</span>
                <span className="font-mono text-[9px] uppercase bg-amber-100 text-amber-850 border border-amber-200/40 p-1 px-2 rounded-md font-bold">
                  ID: #{selectedRoomId}
                </span>
              </h4>
            </div>

            {selectedRoom && (
              <div className="space-y-4">
                {/* 3D Details */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Status Lights Switch */}
                  <div className="p-3 bg-white border border-[#c19a6b]/20 rounded-xl space-y-1.5 shadow-inner">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase font-black tracking-wider block">
                      {t.statusLights}
                    </span>
                    <button
                      onClick={() => toggleRoomGlow(selectedRoomId)}
                      className={`text-[10px] font-bold font-mono p-1.5 rounded-lg w-full transition border text-center flex items-center justify-center gap-1.5 ${
                        glowingRooms[selectedRoomId]
                          ? 'bg-amber-100/50 text-amber-800 border-amber-350 font-bold shadow-sm'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${glowingRooms[selectedRoomId] ? 'text-amber-500 fill-amber-500' : ''}`} />
                      <span>{glowingRooms[selectedRoomId] ? t.glowing : t.dormant}</span>
                    </button>
                  </div>

                  {/* Active Scene Indicator */}
                  <div className="p-3 bg-white border border-[#c19a6b]/20 rounded-xl space-y-1.5 shadow-inner">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase font-black tracking-wider block">
                      {t.ambientMode}
                    </span>
                    <div className="bg-amber-50 border border-amber-150 text-amber-800 rounded-lg py-1.5 text-[9px] font-mono font-bold uppercase text-center tracking-widest">
                      ⚜️ {lightScene}
                    </div>
                  </div>
                </div>

                {/* Simulated thermal heat dissipation metric */}
                <div className="p-3.5 bg-white border border-[#c19a6b]/15 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">{t.energyLabel}</span>
                    <span className="text-xs font-bold font-mono text-slate-600 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-[#c19a6b]" />
                      <span>{+(currentTemp + (glowingRooms[selectedRoomId] ? 1.4 : -0.6)).toFixed(1)} kW/m²</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold">Capacity</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{selectedRoom.capacity} Guests</span>
                  </div>
                </div>

                {/* Legend explanation of 3D nodes */}
                <div className="bg-[#f5efe2] border border-[#c19a6b]/20 rounded-2xl p-3.5 text-[9px] font-mono text-[#5a4a3a] leading-relaxed space-y-1">
                  <p className="font-bold uppercase tracking-wider text-amber-850 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 3D Spatial Grid Info
                  </p>
                  <p>• Translucent glass mesh maps structural volume.</p>
                  <p>• Floating pointlights dynamically bounce custom photons based on ambient scene.</p>
                  <p>• Base of the space features a gold-aligned telemetry grid.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple utility function to determine container width for responsive label clipping
function widthRef(ref: React.RefObject<HTMLDivElement>) {
  return ref.current ? ref.current.clientWidth : 800;
}
