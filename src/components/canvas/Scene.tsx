"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Preload, Stars } from "@react-three/drei";
import * as THREE from "three";
import { scroll, startScrollTracking } from "@/lib/scroll";

// One camera position per viewport height of scrolling (hero, about, projects intro,
// then the rest of the page); the camera blends between them. Later sections like
// the zoom parallax and gallery are opaque and cover this scene.
const CAMERA_STOPS = [
  new THREE.Vector3(0, 0, 6),
  new THREE.Vector3(3, 1, 5),
  new THREE.Vector3(-3, -1, 4),
  new THREE.Vector3(0, 2, 8),
];

function ScrollCamera() {
  const target = new THREE.Vector3();

  useFrame(({ camera }, delta) => {
    const t = Math.min(scroll.viewports, CAMERA_STOPS.length - 1);
    const i = Math.min(Math.floor(t), CAMERA_STOPS.length - 2);
    target.lerpVectors(CAMERA_STOPS[i], CAMERA_STOPS[i + 1], t - i);
    camera.position.lerp(target, 1 - Math.exp(-4 * delta));
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// True while a section marked data-covers-background fills the whole viewport,
// so the starfield behind it can't be seen and doesn't need to render.
function useCovered() {
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const update = () => {
      const covers = document.querySelectorAll("[data-covers-background]");
      setCovered(
        Array.from(covers).some((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top <= 0 && rect.bottom >= window.innerHeight;
        }),
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return covered;
}

export default function Scene() {
  useEffect(() => startScrollTracking(), []);
  const covered = useCovered();

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      frameloop={covered ? "never" : "always"}
    >
      <Suspense fallback={null}>
        <Stars radius={60} depth={40} count={2500} factor={3} fade speed={0.5} />
        <Preload all />
      </Suspense>
      <ScrollCamera />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
