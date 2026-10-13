"use client";

import dynamic from "next/dynamic";

// Three.js needs `window` and WebGL, so the scene is never server-rendered.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <Scene />
    </div>
  );
}
