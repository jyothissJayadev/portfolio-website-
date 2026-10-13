"use client";

// Adapted from Spatty (https://github.com/eloi-web/Spatty), MIT License,
// Copyright (c) 2026 Ntwali Rwilima Eloi Miguel.
// Changed to be driven by page scroll instead of the mouse wheel and a mode toggle,
// and the background tint (Spatty's SceneEnvironment) is dropped so the canvas matches the page.
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import { MORPH_END, MORPH_START, type GalleryControls } from "./controls";

const SPHERE_RADIUS = 35;
const TUNNEL_SPACING = 8;
// Card size in world units (width, height).
const CARD_SIZE: [number, number] = [9.5, 13];
// How far the scroll zooms into the sphere before the morph starts (0 = far, 1 = inside).
const SPHERE_MAX_ZOOM = 0.55;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// Pre-allocated objects to avoid per-frame garbage collection.
const _rotMatrix = new THREE.Matrix4();
const _euler = new THREE.Euler(0, 0, 0, "YXZ");
const _sp = new THREE.Vector3();
const _ls = new THREE.Vector3();
const _lt = new THREE.Vector3();
const _lx = new THREE.Vector3();

// Page background (--background in globals.css); the scene and fog use it so the canvas blends into the page.
const BG = "#07060f";

// Image zoom inside a card while it is hovered.
const HOVER_ZOOM = 1.12;
// Pointer travel (px) between press and release above which a click counts as a drag.
const CLICK_TOLERANCE = 6;

export default function MorphingGallery({
  images,
  controls,
  autoRotate,
  onSelect,
  onHover,
}: {
  images: string[];
  controls: React.RefObject<GalleryControls>;
  autoRotate: boolean;
  /** Called with the card index when a card is clicked (not dragged). */
  onSelect: (index: number) => void;
  /** Called with the hovered card index, or null when no card is hovered. */
  onHover: (index: number | null) => void;
}) {
  // Fibonacci-spiral positions on the sphere, before rotation.
  const spherePos = useMemo(() => {
    const n = images.length;
    const phi = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: n }, (_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      return new THREE.Vector3(Math.cos(theta) * r * SPHERE_RADIUS, y * SPHERE_RADIUS, Math.sin(theta) * r * SPHERE_RADIUS);
    });
  }, [images.length]);

  // Tunnel positions, alternating left and right with deterministic jitter.
  const tunnelPos = useMemo(() => {
    const h = (n: number) => ((n * 2654435761) >>> 0) / 4294967296;
    return images.map(
      (_, i) =>
        new THREE.Vector3(
          // Far enough out that the camera flies between the cards, not through them.
          (i % 2 === 0 ? -1 : 1) * (8 + h(i * 3 + 1) * 3),
          (h(i * 7 + 2) - 0.5) * 6,
          -(i + 1) * TUNNEL_SPACING,
        ),
    );
  }, [images]);

  const morph = useRef(0);
  const worldRotY = useRef(0);
  const smoothRot = useRef({ x: 0, y: 0 });
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const hovered = useRef<number | null>(null);
  useFrame((state, delta) => {
    const c = controls.current;
    const p = c.scroll;

    // 1. Map scroll progress to morph amount and per-mode zoom.
    const targetMorph = smoothstep(clamp01((p - MORPH_START) / (MORPH_END - MORPH_START)));
    morph.current += (targetMorph - morph.current) * (1 - Math.exp(-6 * delta));
    const t = morph.current;
    const sphereZoom = clamp01(p / MORPH_START) * SPHERE_MAX_ZOOM;
    const tunnelZoom = clamp01((p - MORPH_END) / (1 - MORPH_END));

    // 2. Slow auto-rotation that fades out in the tunnel.
    if (autoRotate) worldRotY.current += delta * 0.05 * (1 - t);

    // 3. Smoothed sphere rotation.
    smoothRot.current.y = THREE.MathUtils.lerp(smoothRot.current.y, worldRotY.current + c.rotationY, 0.1);
    smoothRot.current.x = THREE.MathUtils.lerp(smoothRot.current.x, c.rotationX, 0.1);
    _euler.set(smoothRot.current.x, smoothRot.current.y, 0, "YXZ");
    _rotMatrix.makeRotationFromEuler(_euler);

    // 4. Blend every card between its sphere and tunnel placement.
    const meshes = meshRefs.current;
    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      if (!mesh || !spherePos[i] || !tunnelPos[i]) continue;
      _sp.copy(spherePos[i]).applyMatrix4(_rotMatrix);
      mesh.position.lerpVectors(_sp, tunnelPos[i], t);
      // Sphere cards face outward; tunnel cards face the camera (+Z).
      _ls.copy(_sp).multiplyScalar(2);
      _lt.set(mesh.position.x, mesh.position.y, mesh.position.z + 1000);
      _lx.lerpVectors(_ls, _lt, t);
      mesh.lookAt(_lx);
      // Ease the hovered card's image zoom in and the others back out.
      const material = mesh.material as unknown as { zoom: number };
      material.zoom = THREE.MathUtils.lerp(material.zoom, hovered.current === i ? HOVER_ZOOM : 1, 0.15);
    }

    // 5. Camera: dolly toward the sphere, then down the tunnel.
    const tunnelLen = images.length * TUNNEL_SPACING;
    const sphereCamZ = 150 - sphereZoom * 170;
    const tunnelCamZ = -(tunnelZoom * tunnelLen);
    const cam = state.camera;
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, THREE.MathUtils.lerp(sphereCamZ, tunnelCamZ, t), 0.065);
    // In the tunnel, dragging looks around instead of spinning the sphere.
    cam.rotation.x = THREE.MathUtils.lerp(cam.rotation.x, -c.rotationX * 0.2 * t, 0.07);
    cam.rotation.y = THREE.MathUtils.lerp(cam.rotation.y, -c.rotationY * 0.2 * t, 0.07);

  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 80, 230]} />
      {images.map((url, i) => (
        <DreiImage
          key={url + i}
          ref={(el) => {
            meshRefs.current[i] = el as THREE.Mesh | null;
          }}
          url={url}
          transparent
          side={THREE.DoubleSide}
          position={spherePos[i].toArray()}
          scale={CARD_SIZE}
          onClick={(e) => {
            if (e.delta > CLICK_TOLERANCE) return;
            e.stopPropagation();
            onSelect(i);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            hovered.current = i;
            onHover(i);
          }}
          onPointerOut={() => {
            if (hovered.current !== i) return;
            hovered.current = null;
            onHover(null);
          }}
        />
      ))}
    </>
  );
}
