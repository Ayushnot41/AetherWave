'use client';

/**
 * 3D Ambient Topographic / Terrain Mesh Component
 * Built using Three.js directly for zero-dependency React 19 compatibility.
 * Features:
 * - Low-poly terrain surface simulating rural agricultural land contours
 * - Subtle undulating ambient motion (heatwave evapotranspiration effect)
 * - Color shifting based on overall risk severity (Forest -> Ochre -> Deep Navy)
 * - Progressive enhancement: falls back seamlessly if WebGL is unavailable
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface TerrainMesh3DProps {
  heatIntensity?: number; // 0 (normal) to 1 (extreme heatwave)
  className?: string;
  opacity?: number;
}

export function TerrainMesh3D({
  heatIntensity = 0.65,
  className,
  opacity = 0.45,
}: TerrainMesh3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      setWebGLFailed(true);
      return;
    }

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, -6, 6);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(
      heatIntensity > 0.5 ? 0xb96a28 : 0x33573c,
      2.0
    );
    dirLight.position.set(5, 5, 8);
    scene.add(dirLight);

    // Plane geometry with segments
    const geo = new THREE.PlaneGeometry(16, 12, 28, 22);

    // Displace vertices to create low-poly agricultural relief
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.8) * Math.cos(y * 0.8) * 0.8 + Math.sin(x * 1.5) * 0.3;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();

    const wireMat = new THREE.MeshStandardMaterial({
      color: heatIntensity > 0.5 ? 0xb96a28 : 0x153350,
      wireframe: true,
      transparent: true,
      opacity: opacity,
    });

    const mesh = new THREE.Mesh(geo, wireMat);
    scene.add(mesh);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Subtle topographic breath/heat distortion
      mesh.rotation.z = time * 0.04;
      mesh.position.z = Math.sin(time * 0.6) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geo.dispose();
      wireMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [heatIntensity, opacity]);

  if (webGLFailed) {
    return null; // Silent fallback - underlying CSS gradient will show
  }

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    />
  );
}

export default TerrainMesh3D;
