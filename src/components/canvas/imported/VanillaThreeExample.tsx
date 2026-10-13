"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Pattern for dropping in plain Three.js code without rewriting it as JSX.
// Build objects imperatively, hand them to R3F with <primitive>, and move the
// old requestAnimationFrame body into useFrame. Not rendered by default;
// add <VanillaThreeExample /> inside <Canvas> in Scene.tsx to try it.
export default function VanillaThreeExample() {
  const ref = useRef<THREE.Group>(null);
  const group = useMemo(() => {
    const g = new THREE.Group();
    const geometry = new THREE.TorusKnotGeometry(0.4, 0.12, 128, 16);
    const material = new THREE.MeshStandardMaterial({ color: "#22d3ee", metalness: 0.5 });
    const knot = new THREE.Mesh(geometry, material);
    knot.position.set(2.5, 0, -1);
    g.add(knot);
    return g;
  }, []);

  // Clean up GPU resources that were created outside R3F.
  useEffect(
    () => () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
    },
    [group],
  );

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  return <primitive ref={ref} object={group} />;
}
