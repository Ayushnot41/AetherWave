'use client';

/**
 * 3D Isometric Agricultural Parcel Voxel Visualizer
 * Built with pure Three.js WebGL
 * Renders:
 * - Stratified Soil Strata: Topsoil (0-20cm), Root Absorption Zone (20-60cm), Deep Hydration Aquifer
 * - Low-poly crop canopy voxels color-coded by NDVI Health Index (0.15 - 0.88)
 * - Dynamic Moisture Probe depth markers & Seed Sowing Furrows
 * - Interactive mouse orbit and layer inspection
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface FieldParcelVoxel3DProps {
  className?: string;
  height?: number | string;
  soilMoisturePercent?: number;
  ndviIndex?: number;
  cropName?: string;
}

export function FieldParcelVoxel3D({
  className,
  height = '420px',
  soilMoisturePercent = 22.4,
  ndviIndex = 0.76,
  cropName = 'Wheat HD-2967',
}: FieldParcelVoxel3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeLayer, setActiveLayer] = useState<'topsoil' | 'rootzone' | 'aquifer'>('rootzone');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(12, 10, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    // Soil Stratified Slabs
    // 1. Deep Aquifer Layer (Dark blue/gray)
    const aquiferGeo = new THREE.BoxGeometry(8, 1.2, 8);
    const aquiferMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      roughness: 0.9,
      metalness: 0.1,
    });
    const aquiferMesh = new THREE.Mesh(aquiferGeo, aquiferMat);
    aquiferMesh.position.y = -1.6;
    parcelGroup.add(aquiferMesh);

    // 2. Subsoil / Root Zone Layer (Loamy clay brown)
    const rootGeo = new THREE.BoxGeometry(8, 1.4, 8);
    const rootMat = new THREE.MeshStandardMaterial({
      color: 0x4a2c11,
      roughness: 0.85,
    });
    const rootMesh = new THREE.Mesh(rootGeo, rootMat);
    rootMesh.position.y = -0.3;
    parcelGroup.add(rootMesh);

    // 3. Topsoil Layer (Rich organic humus)
    const topsoilGeo = new THREE.BoxGeometry(8, 0.6, 8);
    const topsoilMat = new THREE.MeshStandardMaterial({
      color: 0x2e1a0b,
      roughness: 0.95,
    });
    const topsoilMesh = new THREE.Mesh(topsoilGeo, topsoilMat);
    topsoilMesh.position.y = 0.7;
    parcelGroup.add(topsoilMesh);

    // Crop Canopy Voxel Grid (Low-Poly Wheat/Crop Stalks)
    const canopyGroup = new THREE.Group();
    parcelGroup.add(canopyGroup);

    const rows = 7;
    const cols = 7;
    const spacing = 1.0;
    const startX = -((cols - 1) * spacing) / 2;
    const startZ = -((rows - 1) * spacing) / 2;

    const stalkGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.9, 6);
    const headGeo = new THREE.ConeGeometry(0.12, 0.45, 6);

    // NDVI color interpolation
    const healthyColor = new THREE.Color(0x34d399); // green
    const stressedColor = new THREE.Color(0xf59e0b); // amber
    const canopyColor = new THREE.Color().lerpColors(stressedColor, healthyColor, Math.min(Math.max((ndviIndex - 0.2) / 0.6, 0), 1));

    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.6 });
    const headMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.4 });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cropX = startX + c * spacing + (Math.random() - 0.5) * 0.15;
        const cropZ = startZ + r * spacing + (Math.random() - 0.5) * 0.15;

        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.set(cropX, 1.45, cropZ);
        canopyGroup.add(stalk);

        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(cropX, 1.95, cropZ);
        canopyGroup.add(head);
      }
    }

    // Soil Moisture Probe Indicator
    const probeGroup = new THREE.Group();
    probeGroup.position.set(3.2, 0, 3.2);
    parcelGroup.add(probeGroup);

    const probeRodGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 12);
    const probeRodMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
    const probeRod = new THREE.Mesh(probeRodGeo, probeRodMat);
    probeRod.position.y = 0.5;
    probeGroup.add(probeRod);

    const probeHeadGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
    const probeHeadMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const probeHead = new THREE.Mesh(probeHeadGeo, probeHeadMat);
    probeHead.position.y = 2.2;
    probeGroup.add(probeHead);

    // Volumetric Water Table Plane
    const waterGeo = new THREE.PlaneGeometry(8.2, 8.2);
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const waterPlane = new THREE.Mesh(waterGeo, waterMat);
    waterPlane.rotation.x = Math.PI / 2;
    waterPlane.position.y = -1.0;
    parcelGroup.add(waterPlane);

    // Hairline Wireframe Outlines
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 3.2, 8));
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeMesh.position.y = -0.4;
    parcelGroup.add(edgeMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    dirLight.position.set(10, 15, 12);
    scene.add(dirLight);

    const softFill = new THREE.DirectionalLight(0x38bdf8, 0.6);
    softFill.position.set(-10, -5, -10);
    scene.add(softFill);

    // Mouse Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      parcelGroup.rotation.y += dx * 0.007;
      parcelGroup.rotation.x += dy * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        parcelGroup.rotation.y += 0.0025;
      }

      // Gentle wind sway on crop heads
      canopyGroup.children.forEach((mesh, idx) => {
        if (idx % 2 === 1) {
          mesh.rotation.z = Math.sin(elapsed * 2 + idx) * 0.06;
        }
      });

      // Probe indicator pulsing
      probeHead.position.y = 2.2 + Math.sin(elapsed * 3) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [ndviIndex, soilMoisturePercent]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className || ''}`}
      style={{
        height,
        background: 'radial-gradient(ellipse at center, #0F1D2C 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Overlay HUD */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
        }}
      >
        <div style={{ background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>
            3D AGRICULTURAL PARCEL VOXEL PROFILE
          </div>
          <div style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800, marginTop: '2px' }}>
            {cropName} Canopy & Strata
          </div>
        </div>

        {/* Strata Pills */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          {[
            { id: 'topsoil', label: 'Topsoil (0-20cm)', color: '#FCD34D' },
            { id: 'rootzone', label: 'Root Zone (20-60cm)', color: '#34D399' },
            { id: 'aquifer', label: 'Aquifer (60cm+)', color: '#38BDF8' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id as any)}
              style={{
                background: activeLayer === l.id ? l.color : 'rgba(15, 23, 42, 0.85)',
                color: activeLayer === l.id ? '#0A0F14' : '#E2E8F0',
                border: `1px solid ${l.color}`,
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          fontSize: '0.72rem',
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: '#94A3B8' }}>NDVI VEGETATION:</span>{' '}
          <strong style={{ color: '#34D399' }}>{ndviIndex.toFixed(2)} (Healthy Chlorophyll)</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>VOLUMETRIC MOISTURE:</span>{' '}
          <strong style={{ color: '#38BDF8' }}>{soilMoisturePercent}% (Optimal Germination)</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>ROOT INFILTRATION:</span>{' '}
          <strong style={{ color: '#FCD34D' }}>48.5 cm (Active Uptake)</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>AQUIFER TABLE:</span>{' '}
          <strong style={{ color: '#A78BFA' }}>-1.2 m Depth</strong>
        </div>
      </div>
    </div>
  );
}

export default FieldParcelVoxel3D;
