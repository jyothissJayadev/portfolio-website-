"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  CylinderCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { site } from "@/content/site";

// Ported from https://github.com/akashrmalhotra/3d-portfolio (MIT).
// Logo spheres float in zero gravity, get pulled toward the center while the
// section is on screen, and are pushed around by the pointer. The pull centers
// on the origin, which lines up with the heading in the middle of the section.

const SPHERE_COUNT = 36;
// World-space radius of the invisible ball that follows the cursor.
const POINTER_RADIUS = 1.1;
// Where the pointer collider waits while the cursor is outside the section.
const PARKED = new THREE.Vector3(100, 100, 100);

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

// This module only runs on the client (loaded with ssr: false), so the random
// layout is computed once here instead of during render. Logos are dealt out
// round-robin so every tech in the list shows up at least twice.
const r = THREE.MathUtils.randFloatSpread;
const spheres = Array.from({ length: SPHERE_COUNT }, (_, i) => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
  position: [r(20), r(20) - 25, r(20) - 10] as [number, number, number],
  materialIndex: i % site.techStack.length,
}));

function Sphere({
  scale,
  position,
  material,
  isActive,
}: {
  scale: number;
  position: [number, number, number];
  material: THREE.Material;
  isActive: boolean;
}) {
  const api = useRef<RapierRigidBody>(null);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const strength = useMemo(() => new THREE.Vector3(), []);

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;
    delta = Math.min(0.1, delta);
    strength.set(-50 * delta * scale, -150 * delta * scale, -50 * delta * scale);
    const impulse = vec.copy(api.current.translation()).normalize().multiply(strength);
    api.current.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      ref={api}
      position={position}
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

// Tracks the real cursor against the canvas rect on every pointer move and
// scroll, so the collider stays under the cursor even when the page scrolls
// without the mouse moving.
function Pointer({ isActive }: { isActive: boolean }) {
  const ref = useRef<RapierRigidBody>(null);
  const gl = useThree((state) => state.gl);
  const viewport = useThree((state) => state.viewport);
  const cursor = useRef({ clientX: 0, clientY: 0, seen: false });
  const target = useMemo(() => new THREE.Vector3(), []);
  const current = useMemo(() => PARKED.clone(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cursor.current.clientX = e.clientX;
      cursor.current.clientY = e.clientY;
      cursor.current.seen = e.pointerType === "mouse" || e.pointerType === "pen" || e.buttons > 0;
    };
    const onLeave = () => {
      cursor.current.seen = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useFrame(() => {
    if (!isActive || !ref.current) return;
    const rect = gl.domElement.getBoundingClientRect();
    const { clientX, clientY, seen } = cursor.current;
    const inside =
      seen &&
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!inside) {
      current.copy(PARKED);
    } else {
      // Cursor position on the z = 0 plane, where the spheres gather.
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      target.set((ndcX * viewport.width) / 2, (ndcY * viewport.height) / 2, 0);
      // Snap when entering so the collider doesn't sweep in from the parked spot.
      if (current.equals(PARKED)) current.copy(target);
      else current.lerp(target, 0.6);
    }
    ref.current.setNextKinematicTranslation(current);
  });

  return (
    <RigidBody ref={ref} position={PARKED.toArray()} type="kinematicPosition" colliders={false}>
      <BallCollider args={[POINTER_RADIUS]} />
    </RigidBody>
  );
}

function Spheres({ isActive }: { isActive: boolean }) {
  const textures = useTexture(site.techStack);

  const materials = useMemo(
    () =>
      textures.map((texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        return new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.3,
          metalness: 0.5,
          roughness: 1,
          clearcoat: 0.1,
        });
      }),
    [textures],
  );

  return (
    <Physics gravity={[0, 0, 0]}>
      <Pointer isActive={isActive} />
      {spheres.map(({ materialIndex, ...props }, i) => (
        <Sphere key={i} {...props} material={materials[materialIndex]} isActive={isActive} />
      ))}
    </Physics>
  );
}

export default function TechStackScene({ isActive }: { isActive: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      // Stop rendering entirely while the section is off screen.
      frameloop={isActive ? "always" : "never"}
      gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
      camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
      onCreated={(state) => {
        state.gl.toneMappingExposure = 1.5;
      }}
    >
      <ambientLight intensity={1} />
      <spotLight
        position={[20, 20, 25]}
        penumbra={1}
        angle={0.2}
        color="white"
      />
      <directionalLight position={[0, 5, -4]} intensity={2} />
      <Suspense fallback={null}>
        <Spheres isActive={isActive} />
        <Environment preset="city" environmentIntensity={0.5} environmentRotation={[0, 4, 2]} />
      </Suspense>
      <EffectComposer enableNormalPass={false}>
        <N8AO halfRes color="#0f002c" aoRadius={2} intensity={1.15} />
      </EffectComposer>
    </Canvas>
  );
}
