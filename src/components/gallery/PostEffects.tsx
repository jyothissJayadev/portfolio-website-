"use client";

// Adapted from Spatty (https://github.com/eloi-web/Spatty), MIT License,
// Copyright (c) 2026 Ntwali Rwilima Eloi Miguel.
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";

// Dreamy blur when far from the sphere, pin-sharp up close.
export default function PostEffects() {
  const dof = useRef<DepthOfFieldEffect>(null);

  useFrame((state) => {
    const effect = dof.current;
    if (!effect) return;
    const camZ = state.camera.position.z;
    const far = (state.camera as THREE.PerspectiveCamera).far;
    // Distance to the front of the sphere; in the tunnel the images are always close.
    const distToImages = Math.max(1, camZ > 0 ? camZ - 28 : 18);
    effect.cocMaterial.focusDistance = Math.min(0.4, Math.max(0.001, distToImages / far));
    effect.bokehScale = THREE.MathUtils.lerp(0, 4.5, THREE.MathUtils.smoothstep(distToImages, 30, 85));
  });

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField ref={dof} focusDistance={0.08} focalLength={0.022} bokehScale={3} height={480} />
    </EffectComposer>
  );
}
