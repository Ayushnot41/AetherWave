'use client';

/**
 * 3D Harvest Grain Silo & Yield Profitability Visualizer
 * Built with pure Three.js WebGL
 * Renders:
 * - Volumetric Agricultural Grain Silo with Cutaway Inspection Window
 * - Layered Grain Infill level (Quintals stored & Moisture condensation risk)
 * - 3D Comparative Profit vs Delay Loss Volumetric Towers
 * - Real-time post-harvest spoilage threat simulation
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HarvestYieldTimeline3DProps {
  className?: string;
  height?: number | string;
  harvestNowGainInr?: number;
  delayedLossInr?: number;
  optimalProfitInr?: number;
  moisturePercent?: number;
  grainStoredQuintals?: number;
}

export function HarvestYieldTimeline3D({
  className,
  height = '420px',
  harvestNowGainInr = 132400,
  delayedLossInr = 34500,
  optimalProfitInr = 143800,
  moisturePercent = 13.8,
  grainStoredQuintals = 52.8,
}: HarvestYieldTimeline3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(10, 8, 14);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Concrete Base Platform
    const platformGeo = new THREE.CylinderGeometry(6.5, 6.8, 0.6, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.3;
    mainGroup.add(platform);

    // 1. Central Grain Silo (Cutaway Cylinder)
    const siloRadius = 2.4;
    const siloHeight = 5.5;

    // Silo Outer Wall (Semi-transparent with cutaway)
    const siloGeo = new THREE.CylinderGeometry(siloRadius, siloRadius, siloHeight, 32, 1, true, 0, Math.PI * 1.5);
    const siloMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const silo = new THREE.Mesh(siloGeo, siloMat);
    silo.position.set(-2.2, siloHeight / 2, 0);
    mainGroup.add(silo);

    // Silo Conical Roof
    const roofGeo = new THREE.ConeGeometry(siloRadius + 0.2, 1.4, 32);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(-2.2, siloHeight + 0.7, 0);
    mainGroup.add(roof);

    // Grain Infill Cylinder inside Silo
    const grainHeight = Math.min((grainStoredQuintals / 80) * siloHeight, siloHeight * 0.9);
    const grainGeo = new THREE.CylinderGeometry(siloRadius - 0.08, siloRadius - 0.08, grainHeight, 32);
    const grainMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber golden grain
      roughness: 0.8,
    });
    const grain = new THREE.Mesh(grainGeo, grainMat);
    grain.position.set(-2.2, grainHeight / 2, 0);
    mainGroup.add(grain);

    // Moisture Condensation Ring (Top layer)
    const moistGeo = new THREE.CylinderGeometry(siloRadius - 0.06, siloRadius - 0.06, 0.4, 32);
    const moistMat = new THREE.MeshBasicMaterial({
      color: moisturePercent > 14 ? 0xef4444 : 0x38bdf8,
      transparent: true,
      opacity: 0.65,
    });
    const moistLayer = new THREE.Mesh(moistGeo, moistMat);
    moistLayer.position.set(-2.2, grainHeight + 0.2, 0);
    mainGroup.add(moistLayer);

    // 2. Financial Decision Volumetric Towers (Right side)
    // Tower 1: Harvest Now (Verified Green Tower)
    const towerWidth = 1.0;
    const towerDepth = 1.0;
    const nowH = (harvestNowGainInr / 160000) * 4.5;
    const nowGeo = new THREE.BoxGeometry(towerWidth, nowH, towerDepth);
    const nowMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.5 });
    const nowTower = new THREE.Mesh(nowGeo, nowMat);
    nowTower.position.set(2.0, nowH / 2, -1.2);
    mainGroup.add(nowTower);

    // Tower 2: Optimal Window (Cyan Tower)
    const optH = (optimalProfitInr / 160000) * 4.5;
    const optGeo = new THREE.BoxGeometry(towerWidth, optH, towerDepth);
    const optMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.5 });
    const optTower = new THREE.Mesh(optGeo, optMat);
    optTower.position.set(3.4, optH / 2, 0.2);
    mainGroup.add(optTower);

    // Tower 3: Delayed Loss Risk (Ochre/Red Tower)
    const lossH = Math.max((delayedLossInr / 160000) * 4.5, 0.8);
    const lossGeo = new THREE.BoxGeometry(towerWidth, lossH, towerDepth);
    const lossMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.4 });
    const lossTower = new THREE.Mesh(lossGeo, lossMat);
    lossTower.position.set(2.0, lossH / 2, 1.6);
    mainGroup.add(lossTower);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    mainLight.position.set(10, 15, 10);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    fillLight.position.set(-10, -5, -10);
    scene.add(fillLight);

    // Interaction
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
      mainGroup.rotation.y += dx * 0.007;
      mainGroup.rotation.x += dy * 0.004;
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
        mainGroup.rotation.y += 0.002;
      }

      // Tower pulsing indicator
      nowTower.position.y = nowH / 2 + Math.sin(elapsed * 2) * 0.03;
      optTower.position.y = optH / 2 + Math.sin(elapsed * 2 + 1) * 0.03;

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
  }, [grainStoredQuintals, harvestNowGainInr, delayedLossInr, optimalProfitInr, moisturePercent]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className || ''}`}
      style={{
        height,
        background: 'radial-gradient(ellipse at center, #101E2E 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top HUD */}
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
        <div style={{ background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 700 }}>
            3D POST-HARVEST GRAIN SILO & TIMELINE
          </div>
          <div style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800, marginTop: '2px' }}>
            {grainStoredQuintals} Quintals Volumetric Stock
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#6EE7B7', padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
            Harvest Now: ₹{harvestNowGainInr.toLocaleString('en-IN')}
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
            Rain Delay Risk: -₹{delayedLossInr.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          fontSize: '0.72rem',
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: '#94A3B8' }}>GRAIN MOISTURE:</span>{' '}
          <strong style={{ color: moisturePercent > 14 ? '#EF4444' : '#34D399' }}>{moisturePercent}% ({moisturePercent > 14 ? 'High Spoilage' : 'Safe Dry'})</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>OPTIMAL APMC YIELD:</span>{' '}
          <strong style={{ color: '#38BDF8' }}>₹{optimalProfitInr.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>SILO VENTILATION:</span>{' '}
          <strong style={{ color: '#FCD34D' }}>Forced Aeration Recommended</strong>
        </div>
      </div>
    </div>
  );
}

export default HarvestYieldTimeline3D;
