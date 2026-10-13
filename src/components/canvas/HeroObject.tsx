"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import { scroll } from "@/lib/scroll";

// Placeholder centerpiece. Swap it for your own model, e.g.
// const { scene } = useGLTF("/models/your-model.glb"); return <primitive object={scene} />
export default function HeroObject() {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.2;
    mesh.current.rotation.x = scroll.progress * Math.PI;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.4, 8]} />
        <MeshDistortMaterial
          color="#7c5cff"
          roughness={0.15}
          metalness={0.6}
          distort={0.35}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}
