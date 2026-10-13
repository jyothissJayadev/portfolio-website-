"use client";

import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Cloud, Clouds, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { site } from "@/content/site";
import { range } from "./range";
import WindowModel from "./WindowModel";

const FONT = "/fonts/Geist-Regular.ttf";

// Scroll timeline of the intro, as fractions of its pinned scroll distance:
// look up at the sky, tilt down towards the clouds, fall through them onto the
// window, the window opens, and the camera drops through it into the shaft just
// as the intro fades out over the Projects gallery (see IntroSection).
const TILT = { start: 0, length: 0.18 };
const FALL = { start: 0.2, length: 0.7 };
const FALL_DEPTH = 28;
const WINDOW_Y = -25;
const SHAFT_HEIGHT = 16;

type Pointer = { x: number; y: number };

function CameraRig({ progress, pointer }: { progress: RefObject<number>; pointer: RefObject<Pointer> }) {
  useFrame(({ camera }, delta) => {
    const p = progress.current;
    const tilt = range(p, TILT.start, TILT.length);
    const fall = range(p, FALL.start, FALL.length);
    // Ease the fall so the camera slows as it reaches the window, then speeds through.
    const eased = fall < 0.5 ? 2 * fall * fall : 1 - (-2 * fall + 2) ** 2 / 2;

    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, -0.5 * Math.PI * tilt, 5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -FALL_DEPTH * eased, 7, delta);

    // A little sway with the mouse, faded out before the camera enters the shaft.
    const sway = 1 - range(p, 0.5, 0.1);
    const swayY = (-pointer.current.x * Math.PI) / 90;
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, swayY * sway, 0.05);
  });

  return null;
}

// The night sky drifts on its own and leans slightly with scroll, so it keeps
// moving even while the page is still.
function Sky({ progress }: { progress: RefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.012;
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, progress.current * 0.4, 3, delta);
  });

  return (
    <group ref={group}>
      <Stars radius={140} depth={80} count={6000} factor={7} saturation={0} fade speed={1} />
    </group>
  );
}

function Title() {
  const group = useRef<THREE.Group>(null);
  // Shrink the title to fit narrow screens: the visible width 10 units away at a 60deg fov.
  const aspect = useThree((s) => s.size.width / s.size.height);
  const scale = Math.min(1, (2 * 10 * Math.tan(Math.PI / 6) * aspect * 0.9) / 17);

  // Rise up into place once the scene has loaded.
  useFrame((_, delta) => {
    if (group.current) group.current.position.y = THREE.MathUtils.damp(group.current.position.y, 1.2, 1.2, delta);
  });

  return (
    <group ref={group} position={[0, -8, -10]} scale={scale}>
      <Text font={FONT} fontSize={1.1} anchorY="bottom" color="white" letterSpacing={-0.02}>
        {`Hi, I am ${site.name}.`}
      </Text>
      <Text font={FONT} fontSize={0.32} anchorY="top" position={[0, -0.35, 0]} color="#c4b5fd" letterSpacing={0.2}>
        {site.role.toUpperCase()}
      </Text>
    </group>
  );
}

function CloudLayer() {
  return (
    <Clouds material={THREE.MeshBasicMaterial} frustumCulled={false}>
      <Cloud seed={2} segments={30} bounds={[10, 3, 10]} position={[-2, -6, 0]} volume={9} color="#b8bdd4" opacity={0.55} fade={30} speed={0.2} growth={4} />
      <Cloud seed={5} segments={24} bounds={[8, 3, 8]} position={[6, -9, -4]} volume={7} color="#9aa0bb" opacity={0.5} fade={30} speed={0.15} growth={4} />
      <Cloud seed={8} segments={24} bounds={[8, 3, 8]} position={[-7, -11, 5]} volume={7} color="#9aa0bb" opacity={0.5} fade={30} speed={0.15} growth={4} />
      {/* Right on the camera's path, so it falls through a layer of cloud. */}
      <Cloud seed={11} segments={30} bounds={[6, 2, 6]} position={[0, -14, 0]} volume={6} color="#c9cde0" opacity={0.6} fade={20} speed={0.25} growth={3} />
      <Cloud seed={14} segments={20} bounds={[10, 3, 10]} position={[3, -19, 6]} volume={8} color="#8a8fa8" opacity={0.45} fade={30} speed={0.1} growth={4} />
    </Clouds>
  );
}

// The dark room under the window that the camera drops into, with words on its walls.
// BackSide faces only render from inside, so from above it shows only through the window.
function Shaft() {
  const [first, second, third, fourth] = site.intro.words;
  const top = -0.35;
  const textProps = {
    font: FONT,
    fontSize: 0.26,
    color: "white",
    anchorX: "left" as const,
    anchorY: "middle" as const,
    rotation: [0, 0, -Math.PI / 2] as [number, number, number],
    letterSpacing: 0.08,
  };
  // Ends at the top of the wall and runs upwards instead of starting there.
  const upwards = {
    anchorX: "right" as const,
    rotation: [0, 0, Math.PI / 2] as [number, number, number],
  };

  return (
    <group>
      <mesh position={[0, -SHAFT_HEIGHT / 2 - 0.25, 0]}>
        <boxGeometry args={[1, SHAFT_HEIGHT, 1.38]} />
        <meshStandardMaterial color="#0d0b1a" side={THREE.BackSide} roughness={1} />
      </mesh>
      {/* Each wall group turns its text to face the middle of the shaft. Seen from above,
          the right and bottom walls read upside down, so their text runs upwards instead. */}
      <group position={[-0.49, top, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Text {...textProps}>{first}</Text>
      </group>
      <group position={[0.49, top, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Text {...textProps} {...upwards}>{second}</Text>
      </group>
      <group position={[0, top - 0.6, -0.68]}>
        <Text {...textProps}>{third}</Text>
      </group>
      <group position={[0, top - 0.6, 0.68]} rotation={[0, Math.PI, 0]}>
        <Text {...textProps} {...upwards}>{fourth}</Text>
      </group>
      <pointLight position={[0, -1.2, 0]} intensity={6} distance={6} color="#a78bfa" />
    </group>
  );
}

export default function IntroCanvas({ progress, active }: { progress: RefObject<number>; active: boolean }) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      // Not exactly at the origin: R3F points the camera at (0, 0, 0) on creation,
      // which from the origin itself gives a NaN rotation.
      camera={{ position: [0, 0, 0.01], fov: 60, near: 0.05, far: 400 }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#07060f"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 10, 3]} intensity={1.6} color="#dfe3ff" />
      <Suspense fallback={null}>
        <Sky progress={progress} />
        <Title />
        <CloudLayer />
        <group position={[0, WINDOW_Y, 0]}>
          <WindowModel progress={progress} />
          <Shaft />
        </group>
      </Suspense>
      <CameraRig progress={progress} pointer={pointer} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
