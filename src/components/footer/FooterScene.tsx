"use client";

// Port of the pmndrs/drei README hero, "ground reflections and video textures"
// (github.com/pmndrs/examples/tree/main/examples/ground-reflections-and-video-textures, MIT).
// Assets live in public/footer. The original seated woman (Carla) is swapped for
// three.js's Soldier model (examples/models/gltf/Soldier.glb), idling.
import { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { MeshReflectorMaterial, Text, useAnimations, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { site } from "@/content/site";

const ASSETS = "/footer";

export default function FooterScene({ active }: { active: boolean }) {
  return (
    <Canvas
      gl={{ alpha: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 3, 100], fov: 15 }}
      // Stop rendering while the footer is off screen.
      frameloop={active ? "always" : "never"}
    >
      <color attach="background" args={["black"]} />
      <fog attach="fog" args={["black", 15, 20]} />
      <Suspense fallback={null}>
        <group position={[0, -1, 0]}>
          <Man rotation={[0, Math.PI - 0.4, 0]} position={[-1.2, 0, 0.6]} scale={1.15} />
          <VideoText playing={active} position={[0, 0.15, -2]} />
          <Ground />
        </group>
        <ambientLight intensity={0.5 * Math.PI} />
        <spotLight position={[0, 10, 0]} intensity={0.3 * Math.PI} decay={0} />
        <directionalLight position={[-50, 0, -40]} intensity={0.7 * Math.PI} />
        <Intro />
      </Suspense>
    </Canvas>
  );
}

function Man(props: ThreeElements["group"]) {
  const { scene, animations } = useGLTF(`${ASSETS}/man.glb`);
  const { actions } = useAnimations(animations, scene);
  useEffect(() => {
    actions.Idle?.play();
  }, [actions]);
  return <primitive object={scene} {...props} />;
}

function VideoText({ playing, ...props }: { playing: boolean } & Omit<ThreeElements["group"], "ref">) {
  const [video] = useState(() =>
    Object.assign(document.createElement("video"), {
      src: `${ASSETS}/drei.mp4`,
      crossOrigin: "Anonymous",
      loop: true,
      muted: true,
      playsInline: true,
    }),
  );
  useEffect(() => {
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [video, playing]);

  // The original word is 4 letters at fontSize 3; shrink longer text to fit the screen.
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.viewport);
  const [width, setWidth] = useState(0);
  const visibleWidth = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, -2)).width;
  const scale = width ? Math.min(1, (visibleWidth * 0.85) / width) : 1;

  return (
    <Text
      font={`${ASSETS}/Inter-Bold.woff`}
      fontSize={3}
      letterSpacing={-0.06}
      anchorY="bottom-baseline"
      scale={scale}
      onSync={(mesh) => {
        const [minX, , maxX] = mesh.textRenderInfo.blockBounds;
        setWidth(maxX - minX);
      }}
      {...props}
    >
      {site.footer.giantText}
      <meshBasicMaterial toneMapped={false}>
        <videoTexture attach="map" args={[video]} colorSpace={THREE.SRGBColorSpace} />
      </meshBasicMaterial>
    </Text>
  );
}

function Ground() {
  const [floor, normal] = useTexture([
    `${ASSETS}/SurfaceImperfections003_1K_var1.jpg`,
    `${ASSETS}/SurfaceImperfections003_1K_Normal.jpg`,
  ]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
      <planeGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        blur={[200, 50]}
        resolution={256}
        mirror={0.5}
        mixBlur={6}
        mixStrength={1.5}
        color="#a0a0a0"
        metalness={0.4}
        roughnessMap={floor}
        normalMap={normal}
        normalScale={[2, 2]}
      />
    </mesh>
  );
}

// Dolly in from far away, then drift with the cursor.
function Intro() {
  const [vec] = useState(() => new THREE.Vector3());
  useFrame((state) => {
    state.camera.position.lerp(vec.set(state.pointer.x * 5, 3 + state.pointer.y * 2, 14), 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}
