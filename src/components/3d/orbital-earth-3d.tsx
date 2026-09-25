'use client';

/**
 * 3D Orbital Earth & Satellite Constellation Space Engine
 * Built with pure Three.js WebGL (Defense / ISRO Space Systems Grade)
 * Tracks:
 * - ISRO Cartosat-3 (High-Res Optical 0.28m)
 * - ISRO RISAT-1B / EOS-04 (C-Band Synthetic Aperture Radar)
 * - Copernicus Sentinel-2 (Multispectral 13-Band)
 * - Ground Station Radar Beacons: ISTRAC Bengaluru, SHAR Sriharikota, SAC Ahmedabad
 * - Day/Night atmospheric halo and radar nadir scan cone
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface OrbitalEarth3DProps {
  className?: string;
  height?: number | string;
  selectedSatellite?: 'cartosat' | 'risat' | 'sentinel';
  onSatelliteSelect?: (sat: 'cartosat' | 'risat' | 'sentinel') => void;
}

export function OrbitalEarth3D({
  className,
  height = '520px',
  selectedSatellite = 'risat',
  onSatelliteSelect,
}: OrbitalEarth3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSat, setActiveSat] = useState<'cartosat' | 'risat' | 'sentinel'>(selectedSatellite);
  const [telemetry, setTelemetry] = useState({
    altitudeKm: 528,
    velocityKmS: 7.56,
    subSatelliteLat: '14.28° N',
    subSatelliteLon: '79.91° E',
    radarFrequency: '5.405 GHz (C-Band)',
  });

  useEffect(() => {
    setActiveSat(selectedSatellite);
  }, [selectedSatellite]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 8, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Deep Space Background Points
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.18, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Earth Sphere Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Earth Surface Mesh
    const earthRadius = 5.2;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x0f2545,
      emissive: 0x031224,
      specular: 0x22d3ee,
      shininess: 25,
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Earth Tactical Wireframe Grid
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(earthRadius + 0.02, 32, 24));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.35 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    earthGroup.add(wireframe);

    // Atmospheric Glow Halo
    const haloGeo = new THREE.SphereGeometry(earthRadius + 0.5, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    earthGroup.add(haloMesh);

    // ISRO Ground Station Beacons (GPS coordinates mapped to sphere)
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    const stations = [
      { name: 'ISTRAC [BLR]', lat: 12.97, lon: 77.59, color: 0x06b6d4 },
      { name: 'SHAR [Sriharikota]', lat: 13.72, lon: 80.23, color: 0xf59e0b },
      { name: 'SAC [Ahmedabad]', lat: 23.02, lon: 72.57, color: 0x3b82f6 },
    ];

    stations.forEach((st) => {
      const pos = latLonToVector3(st.lat, st.lon, earthRadius + 0.05);
      const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: st.color });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos);
      earthGroup.add(beaconMesh);

      // Radar Ring Pulse
      const ringGeo = new THREE.RingGeometry(0.15, 0.35, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: st.color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      earthGroup.add(ringMesh);
    });

    // Satellite Orbit Tracks & Satellites
    const createOrbit = (radiusX: number, radiusY: number, tiltDeg: number, color: number) => {
      const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(120);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMat = new THREE.LineDashedMaterial({
        color,
        dashSize: 0.4,
        gapSize: 0.2,
        transparent: true,
        opacity: 0.75,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.computeLineDistances();
      orbitLine.rotation.x = Math.PI / 2;
      orbitLine.rotation.y = (tiltDeg * Math.PI) / 180;
      return { orbitLine, curve, tiltDeg };
    };

    // 1. ISRO RISAT-1B C-Band SAR
    const risatOrbit = createOrbit(8.6, 7.8, -28, 0x8b5cf6);
    scene.add(risatOrbit.orbitLine);

    // 2. ISRO Cartosat-3 High-Res Optical
    const cartosatOrbit = createOrbit(7.5, 7.2, 38, 0x06b6d4);
    scene.add(cartosatOrbit.orbitLine);

    // 3. Copernicus Sentinel-2 Multispectral
    const sentinelOrbit = createOrbit(9.4, 8.8, 65, 0x10b981);
    scene.add(sentinelOrbit.orbitLine);

    // Satellite Models (Geometric Bodies)
    const createSatModel = (bodyColor: number, wingColor: number) => {
      const satGroup = new THREE.Group();
      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.25), new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.8, roughness: 0.2 }));
      satGroup.add(body);
      // Solar Wings
      const wingGeo = new THREE.BoxGeometry(0.7, 0.2, 0.03);
      const wingMat = new THREE.MeshStandardMaterial({ color: wingColor, metalness: 0.5, roughness: 0.4 });
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.x = -0.55;
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.x = 0.55;
      satGroup.add(leftWing);
      satGroup.add(rightWing);

      // Nadir Microwave / Optical Sensor Cone
      const coneGeo = new THREE.ConeGeometry(0.8, 2.2, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({ color: bodyColor, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = -1.2;
      cone.rotation.x = Math.PI;
      satGroup.add(cone);

      return satGroup;
    };

    const risatSat = createSatModel(0x8b5cf6, 0x3b82f6);
    scene.add(risatSat);

    const cartosatSat = createSatModel(0x06b6d4, 0x0284c7);
    scene.add(cartosatSat);

    const sentinelSat = createSatModel(0x10b981, 0x059669);
    scene.add(sentinelSat);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(15, 10, 12);
    scene.add(sunLight);

    const backfill = new THREE.DirectionalLight(0x38bdf8, 0.5);
    backfill.position.set(-15, -10, -10);
    scene.add(backfill);

    // Mouse Interaction for Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      earthGroup.rotation.y += deltaX * 0.006;
      earthGroup.rotation.x += deltaY * 0.006;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize Handler
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
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Earth Idle Rotation
      if (!isDragging) {
        earthGroup.rotation.y += 0.002;
      }

      // Orbital Satellites Motion
      const risatT = (elapsed * 0.08) % 1;
      const risatPoint = risatOrbit.curve.getPoint(risatT);
      risatSat.position.set(risatPoint.x, 0, risatPoint.y);
      risatSat.rotation.x = Math.PI / 2;
      risatSat.rotation.y = (risatOrbit.tiltDeg * Math.PI) / 180;
      risatSat.lookAt(0, 0, 0);

      const cartosatT = (elapsed * 0.11 + 0.3) % 1;
      const cartosatPoint = cartosatOrbit.curve.getPoint(cartosatT);
      cartosatSat.position.set(cartosatPoint.x, 0, cartosatPoint.y);
      cartosatSat.rotation.x = Math.PI / 2;
      cartosatSat.rotation.y = (cartosatOrbit.tiltDeg * Math.PI) / 180;
      cartosatSat.lookAt(0, 0, 0);

      const sentinelT = (elapsed * 0.06 + 0.6) % 1;
      const sentinelPoint = sentinelOrbit.curve.getPoint(sentinelT);
      sentinelSat.position.set(sentinelPoint.x, 0, sentinelPoint.y);
      sentinelSat.rotation.x = Math.PI / 2;
      sentinelSat.rotation.y = (sentinelOrbit.tiltDeg * Math.PI) / 180;
      sentinelSat.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className || ''}`}
      style={{
        height,
        background: 'radial-gradient(ellipse at center, #0B1728 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top HUD Overlay */}
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
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.5px' }}>
            ORBITAL SPACE ENGINE // ISRO & COPERNICUS
          </div>
          <div style={{ fontSize: '0.92rem', color: '#F8FAFC', fontWeight: 800, marginTop: '2px' }}>
            Sub-Meter Bi-Temporal Space Surveillance
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>
            Rotate with cursor to inspect orbits & ISRO ground stations
          </div>
        </div>

        {/* Satellite Switcher */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          {[
            { id: 'risat', name: 'RISAT-1B (SAR)', color: '#8B5CF6' },
            { id: 'cartosat', name: 'Cartosat-3 (0.28m)', color: '#06B6D4' },
            { id: 'sentinel', name: 'Sentinel-2 (MSI)', color: '#10B981' },
          ].map((sat) => (
            <button
              key={sat.id}
              onClick={() => {
                setActiveSat(sat.id as any);
                onSatelliteSelect?.(sat.id as any);
              }}
              style={{
                background: activeSat === sat.id ? sat.color : 'rgba(15, 23, 42, 0.85)',
                color: activeSat === sat.id ? '#FFFFFF' : '#94A3B8',
                border: `1px solid ${sat.color}`,
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
              }}
            >
              {sat.name}
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
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          fontSize: '0.72rem',
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: '#64748B' }}>ORBIT ALTITUDE:</span>{' '}
          <strong style={{ color: '#38BDF8' }}>{telemetry.altitudeKm} km LEO</strong>
        </div>
        <div>
          <span style={{ color: '#64748B' }}>ORBITAL VELOCITY:</span>{' '}
          <strong style={{ color: '#34D399' }}>{telemetry.velocityKmS} km/s</strong>
        </div>
        <div>
          <span style={{ color: '#64748B' }}>SUB-SATELLITE POINT:</span>{' '}
          <strong style={{ color: '#FCD34D' }}>{telemetry.subSatelliteLat}, {telemetry.subSatelliteLon}</strong>
        </div>
        <div>
          <span style={{ color: '#64748B' }}>ACTIVE SENSOR:</span>{' '}
          <strong style={{ color: '#C084FC' }}>
            {activeSat === 'risat' ? 'C-Band Microwave Radar (5.405 GHz)' : activeSat === 'cartosat' ? '0.28m Panchromatic Telescope' : '13-Band Multispectral NIR'}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default OrbitalEarth3D;
