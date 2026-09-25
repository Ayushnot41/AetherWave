'use client';

/**
 * 3D Volumetric Disaster Weather Doppler Radar Dome
 * Built with pure Three.js WebGL (Meteorological Defense Grade)
 * Renders:
 * - Hemispheric Doppler Radar Dome with Azimuth & Elevation Range Rings
 * - Rotating 360° Microwave Radar Sweep Beam
 * - 3D Particle Cloud Precipitation Backscatter (dBZ reflectivity)
 * - Dynamic Flood Inundation Plane with water ripple
 * - Real-time disaster hazard vectors (Cyclone, Flood, Hail, Heatwave)
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface DisasterRadarDome3DProps {
  className?: string;
  height?: number | string;
  floodRiskPercent?: number;
  cycloneRiskPercent?: number;
  heatwaveRiskPercent?: number;
  hailRiskPercent?: number;
  precipitationMm?: number;
}

export function DisasterRadarDome3D({
  className,
  height = '440px',
  floodRiskPercent = 28,
  cycloneRiskPercent = 14,
  heatwaveRiskPercent = 72,
  hailRiskPercent = 8,
  precipitationMm = 1.2,
}: DisasterRadarDome3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 440;

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 100);
    camera.position.set(0, 11, 16);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    // Hemispheric Radar Dome Wireframe
    const domeRadius = 7.0;
    const domeGeo = new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeWireMat);
    radarGroup.add(domeMesh);

    // Concentric Range Rings on Ground Plane (10km, 25km, 50km, 100km radar range)
    [2, 4, 6, 7].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r - 0.03, r + 0.03, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      radarGroup.add(ring);
    });

    // Azimuth Crosshair Rays (N, S, E, W, NE, NW, SE, SW)
    const rayMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.25 });
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const points = [
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(Math.cos(angle) * domeRadius, 0.02, Math.sin(angle) * domeRadius),
      ];
      const rayGeo = new THREE.BufferGeometry().setFromPoints(points);
      const rayLine = new THREE.Line(rayGeo, rayMat);
      radarGroup.add(rayLine);
    }

    // Rotating 3D Radar Sweep Wedge
    const sweepGeo = new THREE.CylinderGeometry(domeRadius, domeRadius, 0.05, 32, 1, false, 0, Math.PI / 3);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const sweepWedge = new THREE.Mesh(sweepGeo, sweepMat);
    sweepWedge.position.y = 0.05;
    radarGroup.add(sweepWedge);

    // Dynamic Cloud Backscatter Particles (dBZ Radar Echo)
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.0 + Math.random() * (domeRadius - 1.5);
      const theta = Math.random() * Math.PI * 2;
      const height = 0.8 + Math.random() * 4.5;

      positions[i] = Math.cos(theta) * radius;
      positions[i + 1] = height;
      positions[i + 2] = Math.sin(theta) * radius;

      // Color coding: high reflectivity (red/amber) vs light rain (cyan/blue)
      if (Math.random() < 0.25) {
        colors[i] = 0.95; // Red
        colors[i + 1] = 0.25;
        colors[i + 2] = 0.2;
      } else if (Math.random() < 0.6) {
        colors[i] = 0.98; // Amber
        colors[i + 1] = 0.75;
        colors[i + 2] = 0.05;
      } else {
        colors[i] = 0.13; // Cyan
        colors[i + 1] = 0.82;
        colors[i + 2] = 0.93;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const cloudParticles = new THREE.Points(particleGeo, particleMat);
    radarGroup.add(cloudParticles);

    // Flood Risk Water Plane (Elevated based on risk)
    const floodElevation = (floodRiskPercent / 100) * 0.8;
    const waterGeo = new THREE.PlaneGeometry(domeRadius * 2, domeRadius * 2);
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const waterPlane = new THREE.Mesh(waterGeo, waterMat);
    waterPlane.rotation.x = Math.PI / 2;
    waterPlane.position.y = floodElevation;
    radarGroup.add(waterPlane);

    // Central Radar Station Tower
    const towerGeo = new THREE.CylinderGeometry(0.15, 0.35, 1.2, 12);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 0.6;
    radarGroup.add(tower);

    const radomeGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const radomeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const radome = new THREE.Mesh(radomeGeo, radomeMat);
    radome.position.y = 1.4;
    radarGroup.add(radome);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    // Drag Interaction
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
      radarGroup.rotation.y += dx * 0.007;
      radarGroup.rotation.x += dy * 0.004;
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

      // Rotate Sweep Fan
      sweepWedge.rotation.y = elapsed * 1.6;

      // Particle slight drift
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y += Math.sin(elapsed * 2 + i) * 0.003;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Subtle water ripple
      waterPlane.position.y = floodElevation + Math.sin(elapsed * 2.5) * 0.03;

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
  }, [floodRiskPercent]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className || ''}`}
      style={{
        height,
        background: 'radial-gradient(ellipse at center, #0B192C 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
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
        <div style={{ background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700 }}>
            VOLUMETRIC DOPPLER DISASTER RADAR DOME
          </div>
          <div style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800, marginTop: '2px' }}>
            50km Micro-Climate Atmospheric Telemetry
          </div>
        </div>

        {/* Hazard Risk Badges */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ background: heatwaveRiskPercent > 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.8)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
            🔥 Heatwave: {heatwaveRiskPercent}%
          </div>
          <div style={{ background: floodRiskPercent > 30 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.8)', border: '1px solid #38BDF8', color: '#7DD3FC', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
            🌊 Flood: {floodRiskPercent}%
          </div>
          <div style={{ background: cycloneRiskPercent > 20 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.8)', border: '1px solid #F59E0B', color: '#FDE68A', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
            🌀 Cyclone: {cycloneRiskPercent}%
          </div>
        </div>
      </div>

      {/* Bottom Legend */}
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ color: '#94A3B8' }}>DOPPLER SWEEP: <strong style={{ color: '#22D3EE' }}>ACTIVE (1.6 rad/s)</strong></span>
          <span style={{ color: '#94A3B8' }}>PRECIPITATION ECHO: <strong style={{ color: '#FCD34D' }}>{precipitationMm} mm/h</strong></span>
          <span style={{ color: '#94A3B8' }}>HAIL INDEX: <strong style={{ color: '#F87171' }}>{hailRiskPercent}% Severity</strong></span>
        </div>
        <span style={{ color: '#38BDF8', fontWeight: 600 }}>Live IMD & Open-Meteo Synoptic Grid</span>
      </div>
    </div>
  );
}

export default DisasterRadarDome3D;
