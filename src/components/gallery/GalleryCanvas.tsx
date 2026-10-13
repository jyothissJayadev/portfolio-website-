"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import MorphingGallery from "./MorphingGallery";
import PostEffects from "./PostEffects";
import type { GalleryControls } from "./controls";

export default function GalleryCanvas({
  images,
  controls,
  active,
  onSelect,
  onHover,
}: {
  images: string[];
  controls: React.RefObject<GalleryControls>;
  active: boolean;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  // Client-only component (loaded with ssr: false), so window is available here.
  const [isMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  return (
    <Canvas
      camera={{ position: [0, 0, 150], fov: 45 }}
      dpr={[1, isMobile ? 1.25 : 1.5]}
      // Stop rendering while the section is off screen.
      frameloop={active ? "always" : "never"}
    >
      <ambientLight intensity={1.5} />
      <Suspense fallback={null}>
        <MorphingGallery
          images={images}
          controls={controls}
          autoRotate={!reducedMotion}
          onSelect={onSelect}
          onHover={onHover}
        />
      </Suspense>
      {!isMobile && <PostEffects />}
    </Canvas>
  );
}
