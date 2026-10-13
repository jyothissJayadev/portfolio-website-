"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Physics (Rapier WASM) and WebGL are client-only, so the scene is never server-rendered.
const TechStackScene = dynamic(() => import("@/components/canvas/TechStackScene"), {
  ssr: false,
});

export default function TechStack() {
  const ref = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);

  // Spheres rush in when the section scrolls into view and the loop pauses when it leaves.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsActive(entry.isIntersecting), {
      threshold: 0.2,
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="techstack" ref={ref} className="relative h-screen w-full overflow-clip">
      {/* Violet glow behind the heading. It has no solid base, so the page background
          and starfield run through the section without a visible band, and it fades
          out well before the top and bottom edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgb(124 92 255 / 0.32), rgb(99 102 241 / 0.12) 40%, rgb(99 102 241 / 0.04) 60%, transparent 80%)",
          maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        }}
      />
      {/* The heading sits behind the transparent canvas, so spheres can drift over it. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <h2 className="px-4 text-center text-4xl font-normal uppercase tracking-tight md:text-7xl">
          My Techstack
        </h2>
      </div>
      <div className="absolute inset-0">
        <TechStackScene isActive={isActive} />
      </div>
    </section>
  );
}
