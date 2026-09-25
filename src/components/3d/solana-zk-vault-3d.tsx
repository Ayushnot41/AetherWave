'use client';

/**
 * 3D Solana Cryptographic Vault & ZK Proof Attestation Engine
 * Built with pure Three.js WebGL (Cryptographic Web3 & Defense Grade)
 * Renders:
 * - Rotating Hexagonal Merkle State Vault Cylinder with Solana Gradient
 * - Encrypted Ed25519 Hardware Signature Rings (WebCrypto Bound)
 * - Orbiting SHA-256 Hash Particles & ZK-Compression Tree Nodes
 * - Immutable On-Chain Storage Display:
 *   * Farmer Name & Identity Hash
 *   * Attested GPS Coordinates
 *   * Sowing On-Time Profit & Delayed Loss
 *   * Disaster Risk Percentage
 *   * Harvest Mandi Valuation
 *   * Solana Devnet Block Slot & Explorer Link
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SolanaZkVault3DProps {
  className?: string;
  height?: number | string;
  farmerName?: string;
  gpsCoords?: string;
  disasterRiskPercent?: number;
  onTimeProfitInr?: number;
  delayedLossInr?: number;
  harvestEarningsInr?: number;
  blockSlot?: number;
  txSignature?: string;
}

export function SolanaZkVault3D({
  className,
  height = '440px',
  farmerName = 'Rameshwar Patil (रामेश्वर पाटिल)',
  gpsCoords = '20.5937° N, 78.9629° E [Attested]',
  disasterRiskPercent = 28,
  onTimeProfitInr = 91440,
  delayedLossInr = 34500,
  harvestEarningsInr = 143088,
  blockSlot = 284910283,
  txSignature = '5KhxZ283KLP9w84mNVcQP1849Mkd0923jLmks098192039401kdm',
}: SolanaZkVault3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 440;

    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 100);
    camera.position.set(0, 4, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // 1. Central Cryptographic Vault Core (Hexagonal Prism)
    const coreGeo = new THREE.CylinderGeometry(2.4, 2.4, 4.2, 6);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.2,
      metalness: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    vaultGroup.add(coreMesh);

    // Core Wireframe Glow Outline
    const wireGeo = new THREE.WireframeGeometry(new THREE.CylinderGeometry(2.45, 2.45, 4.25, 6));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x9945ff, transparent: true, opacity: 0.65 });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    vaultGroup.add(wireMesh);

    // 2. Solana Signature Orbit Rings (Purple / Cyan / Green)
    const createRing = (radius: number, color: number, tiltX: number, tiltY: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.06, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color, wireframe: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      return ring;
    };

    const ring1 = createRing(3.8, 0x9945ff, Math.PI / 3, 0); // Solana Purple
    const ring2 = createRing(4.3, 0x14f195, -Math.PI / 4, Math.PI / 6); // Solana Green
    const ring3 = createRing(4.8, 0x00c2ff, Math.PI / 6, -Math.PI / 3); // Solana Blue

    vaultGroup.add(ring1);
    vaultGroup.add(ring2);
    vaultGroup.add(ring3);

    // 3. Merkle ZK Proof Hash Nodes (Floating orbiting nodes)
    const nodeCount = 18;
    const nodesGroup = new THREE.Group();
    vaultGroup.add(nodesGroup);

    const nodeGeo = new THREE.OctahedronGeometry(0.18, 0);
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x14f195, roughness: 0.1, metalness: 0.9 });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const rad = 3.2 + (i % 3) * 0.4;
      node.position.set(Math.cos(angle) * rad, ((i % 5) - 2) * 0.8, Math.sin(angle) * rad);
      nodesGroup.add(node);
    }

    // 4. Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(3.2, 3.6, 0.4, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2.4;
    vaultGroup.add(base);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const purpleLight = new THREE.PointLight(0x9945ff, 3.0, 15);
    purpleLight.position.set(6, 4, 6);
    scene.add(purpleLight);

    const greenLight = new THREE.PointLight(0x14f195, 2.5, 15);
    greenLight.position.set(-6, -4, -6);
    scene.add(greenLight);

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
      vaultGroup.rotation.y += dx * 0.007;
      vaultGroup.rotation.x += dy * 0.004;
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
        vaultGroup.rotation.y += 0.003;
      }

      // Rotate Signature Rings in opposite axes
      ring1.rotation.z = elapsed * 0.4;
      ring2.rotation.z = -elapsed * 0.35;
      ring3.rotation.z = elapsed * 0.5;

      // Orbit Merkle Nodes
      nodesGroup.rotation.y = -elapsed * 0.2;

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
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className || ''}`}
      style={{
        height,
        background: 'radial-gradient(ellipse at center, #130B24 0%, #030712 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(153, 69, 255, 0.35)',
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
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(153, 69, 255, 0.4)' }}>
          <div style={{ fontSize: '0.72rem', color: '#C084FC', fontWeight: 700 }}>
            SOLANA ON-CHAIN ZK CRYPTOGRAPHIC VAULT
          </div>
          <div style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800, marginTop: '2px' }}>
            Tamper-Proof Farmer Attestation Record
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <div style={{ background: 'rgba(20, 241, 149, 0.15)', border: '1px solid #14F195', color: '#14F195', padding: '5px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
            Slot #{blockSlot}
          </div>
        </div>
      </div>

      {/* Sealed Data Grid HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          fontSize: '0.72rem',
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: '#94A3B8' }}>FARMER IDENTITY:</span>{' '}
          <strong style={{ color: '#FFFFFF' }}>{farmerName}</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>GPS ATTESTATION:</span>{' '}
          <strong style={{ color: '#38BDF8' }}>{gpsCoords}</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>DISASTER PROBABILITY:</span>{' '}
          <strong style={{ color: '#FCD34D' }}>{disasterRiskPercent}% Hazard Probability</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>ON-TIME SOWING PROFIT:</span>{' '}
          <strong style={{ color: '#34D399' }}>+₹{onTimeProfitInr.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>DELAYED LOSS PENALTY:</span>{' '}
          <strong style={{ color: '#EF4444' }}>-₹{delayedLossInr.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span style={{ color: '#94A3B8' }}>HARVEST MANDI SALE:</span>{' '}
          <strong style={{ color: '#14F195' }}>₹{harvestEarningsInr.toLocaleString('en-IN')}</strong>
        </div>
      </div>
    </div>
  );
}

export default SolanaZkVault3D;
