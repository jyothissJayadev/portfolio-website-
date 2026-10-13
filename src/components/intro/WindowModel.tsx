"use client";

/*
Model: "Residential Window" by AleixoAlonso (https://sketchfab.com/AleixoAlonso)
Source: https://sketchfab.com/3d-models/residential-window-ae11104237314463a61251fd46ded4b4
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/), credit the author on the site.
*/

import { useRef, type RefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { range } from "./range";

const URL = "/models/window.glb";

type WindowGLTF = {
  nodes: Record<
    | "#WIN0003_Frame_#WIN0003_Textures_0"
    | "#WIN0003_Window_#WIN0003_Textures_0"
    | "#WIN0003_Handle_#WIN0003_Textures_0",
    THREE.Mesh
  >;
  materials: { WIN0003_Textures: THREE.Material };
};

// The window lies flat with its glass facing up, centered on its group's origin.
// As the intro scrolls, the handle turns and then the sash swings open.
export default function WindowModel({ progress }: { progress: RefObject<number> }) {
  const sash = useRef<THREE.Group>(null);
  const handle = useRef<THREE.Mesh>(null);
  const { nodes, materials } = useGLTF(URL) as unknown as WindowGLTF;

  useFrame((_, delta) => {
    const p = progress.current;
    if (handle.current) {
      const target = -0.5 * Math.PI * range(p, 0.5, 0.07);
      handle.current.rotation.y = THREE.MathUtils.damp(handle.current.rotation.y, target, 8, delta);
    }
    if (sash.current) {
      const target = 0.5 * Math.PI * range(p, 0.57, 0.11);
      sash.current.rotation.z = THREE.MathUtils.damp(sash.current.rotation.z, target, 8, delta);
    }
  });

  return (
    // The model's long side runs along +z from 0 to 1.42; shift it so it is centered.
    <group position={[0, 0, 0.71]} rotation={[0, Math.PI, Math.PI]} dispose={null}>
      <mesh
        geometry={nodes["#WIN0003_Frame_#WIN0003_Textures_0"].geometry}
        material={materials.WIN0003_Textures}
      />
      {/* Hinge line of the sash, taken from the model's geometry. */}
      <group ref={sash} position={[0.441, -0.039, 0.082]}>
        <mesh
          geometry={nodes["#WIN0003_Window_#WIN0003_Textures_0"].geometry}
          material={materials.WIN0003_Textures}
        />
        <mesh
          ref={handle}
          geometry={nodes["#WIN0003_Handle_#WIN0003_Textures_0"].geometry}
          material={materials.WIN0003_Textures}
          position={[-0.84, -0.018, 0.55]}
        />
      </group>
    </group>
  );
}

useGLTF.preload(URL);
