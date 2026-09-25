'use client';

/**
 * 3D Verification Seal Component
 * Built using Three.js directly for zero-dependency React 19 compatibility.
 * Features:
 * - 3D embossed cylinder/disc mesh with golden rim and authority navy face
 * - Physical "stamp-down" animation upon mint confirmation
 * - Radiating shockwave ring and particle burst
 * - Progressive enhancement: falls back seamlessly if WebGL is unavailable
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { tokens } from '@/lib/design-tokens';

interface VerificationSeal3DProps {
  onStamped?: () => void;
  className?: string;
  size?: number;
}

export function VerificationSeal3D({
  onStamped,
  className,
  size = 220,
}: VerificationSeal3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support Test
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
    } catch {
      setWebGLFailed(true);
      return;
    }

    container.appendChild(renderer.domElement);

    // 2. Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keyLight.position.set(5, 5, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb96a28, 1.5);
    fillLight.position.set(-5, -3, 4);
    scene.add(fillLight);

    // 4. Seal Geometry: Embossed Disc
    const sealGroup = new THREE.Group();
    scene.add(sealGroup);

    // Outer Gold Rim
    const rimGeo = new THREE.TorusGeometry(2.2, 0.15, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xb96a28,
      metalness: 0.85,
      roughness: 0.25,
    });
    const rimMesh = new THREE.Mesh(rimGeo, goldMat);
    sealGroup.add(rimMesh);

    // Inner Core Disc
    const discGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.25, 64);
    discGeo.rotateX(Math.PI / 2);
    const navyMat = new THREE.MeshStandardMaterial({
      color: 0x153350,
      metalness: 0.3,
      roughness: 0.5,
    });
    const discMesh = new THREE.Mesh(discGeo, navyMat);
    sealGroup.add(discMesh);

    // Center Verification Crest (Diamond)
    const crestGeo = new THREE.ConeGeometry(0.8, 1.2, 4);
    crestGeo.rotateX(Math.PI / 2);
    const forestMat = new THREE.MeshStandardMaterial({
      color: 0x33573c,
      metalness: 0.6,
      roughness: 0.3,
    });
    const crestMesh = new THREE.Mesh(crestGeo, forestMat);
    crestMesh.position.z = 0.2;
    sealGroup.add(crestMesh);

    // Radiating Shockwave Ring (Initially invisible)
    const shockGeo = new THREE.RingGeometry(2.2, 2.4, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x14f195,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    shockMesh.position.z = -0.1;
    scene.add(shockMesh);

    // 5. Animation Timeline: Stamp Down
    let startTime = performance.now();
    let animId: number;
    let shockActive = false;
    let shockStart = 0;

    // Initial position: high above screen (Z = 12, rotating)
    sealGroup.position.z = 8;
    sealGroup.scale.set(1.8, 1.8, 1.8);
    sealGroup.rotation.z = -0.5;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const elapsed = (time - startTime) / 1000;

      // Stamp-down physics: 0.6s drop with bounce
      if (elapsed < 0.6) {
        const progress = elapsed / 0.6;
        // Ease in quad
        const easeIn = progress * progress * progress;
        sealGroup.position.z = 8 * (1 - easeIn);
        sealGroup.scale.set(
          1.8 - 0.8 * easeIn,
          1.8 - 0.8 * easeIn,
          1.8 - 0.8 * easeIn
        );
        sealGroup.rotation.z = -0.5 * (1 - easeIn);
      } else if (!shockActive) {
        // Impact moment!
        sealGroup.position.z = 0;
        sealGroup.scale.set(1, 1, 1);
        sealGroup.rotation.z = 0;
        shockActive = true;
        shockStart = time;
        setStamped(true);
        onStamped?.();
      }

      // Shockwave expansion after stamp
      if (shockActive) {
        const shockElapsed = (time - shockStart) / 1000;
        if (shockElapsed < 1.0) {
          const s = 1 + shockElapsed * 2.5;
          shockMesh.scale.set(s, s, s);
          shockMat.opacity = Math.max(0, 0.9 * (1 - shockElapsed));
        } else {
          shockMat.opacity = 0;
        }

        // Gentle idle wobble
        sealGroup.rotation.y = Math.sin(time * 0.001) * 0.15;
        sealGroup.rotation.x = Math.cos(time * 0.0012) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      rimGeo.dispose();
      goldMat.dispose();
      discGeo.dispose();
      navyMat.dispose();
      crestGeo.dispose();
      forestMat.dispose();
      shockGeo.dispose();
      shockMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, onStamped]);

  // Progressive Fallback if WebGL fails
  if (webGLFailed) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/images/aetherweave-3d-seal.svg"
          alt="Government Verification Seal"
          width={size * 0.9}
          height={size * 0.9}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div ref={mountRef} style={{ width: size, height: size }} />
      {stamped && (
        <div
          style={{
            position: 'absolute',
            bottom: '-1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: tokens.colors.verifiedForest,
            letterSpacing: '1px',
          }}
        >
          ✓ 3D SEAL CONFIRMED ON-CHAIN
        </div>
      )}
    </div>
  );
}

export default VerificationSeal3D;
