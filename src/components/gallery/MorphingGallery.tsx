"use client";

// Adapted from Spatty (https://github.com/eloi-web/Spatty), MIT License,
// Copyright (c) 2026 Ntwali Rwilima Eloi Miguel.
// Changed to be driven by page scroll instead of the mouse wheel and a mode toggle,
// and the background tint (Spatty's SceneEnvironment) is folded in, retuned for a dark theme.
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
const _cf = new THREE.Vector3();
const _ti = new THREE.Vector3();

// Background is the page colour, tinted slightly toward the nearest image.
const BG = new THREE.Color("#07060f");
const TINT = 0.18;

/** Averages an image down to one RGB colour using a tiny canvas. */
function extractDominantColor(url: string): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve([40, 40, 60]);
      ctx.drawImage(img, 0, 0, 8, 8);
      const { data } = ctx.getImageData(0, 0, 8, 8);
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const px = data.length / 4;
      resolve([Math.round(r / px), Math.round(g / px), Math.round(b / px)]);
    };
    img.onerror = () => resolve([40, 40, 60]);
    img.src = url;
  });
}

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
  const nearest = useRef(-1);
  const lastNearestCheck = useRef(0);
  const colorCache = useRef(new Map<string, [number, number, number]>());
  const envColor = useRef<[number, number, number]>([7, 6, 15]);
  const bg = useRef(BG.clone());
  const bgTarget = useRef(new THREE.Color());

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

    // 6. Every 400ms, find the image nearest the view direction and tint the scene with it.
    const now = state.clock.elapsedTime;
    if (now - lastNearestCheck.current > 0.4) {
      lastNearestCheck.current = now;
      cam.getWorldDirection(_cf);
      let best = 0;
      let maxDot = -Infinity;
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        if (!mesh) continue;
        const dot = _ti.copy(mesh.position).sub(cam.position).normalize().dot(_cf);
        if (dot > maxDot) {
          maxDot = dot;
          best = i;
        }
      }
      if (best !== nearest.current) {
        nearest.current = best;
        const url = images[best];
        const cached = colorCache.current.get(url);
        if (cached) envColor.current = cached;
        else
          extractDominantColor(url).then((color) => {
            colorCache.current.set(url, color);
            envColor.current = color;
          });
      }
    }

    // 7. Drift the background and fog toward the nearest image's colour.
    const [r, g, b] = envColor.current;
    bgTarget.current.setRGB(
      BG.r * (1 - TINT) + (r / 255) * TINT,
      BG.g * (1 - TINT) + (g / 255) * TINT,
      BG.b * (1 - TINT) + (b / 255) * TINT,
    );
    bg.current.lerp(bgTarget.current, 0.025);
    state.scene.background = bg.current;
    if (state.scene.fog instanceof THREE.Fog) state.scene.fog.color.copy(bg.current);
  });

  return (
    <>
      <fog attach="fog" args={["#07060f", 80, 230]} />
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
