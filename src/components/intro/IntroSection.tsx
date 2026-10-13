"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { site } from "@/content/site";
import { range } from "./range";

const IntroCanvas = dynamic(() => import("./IntroCanvas"), { ssr: false });

// The last 25% (100vh) of the intro's 400vh pinned scroll overlaps the Projects
// gallery, pulled up underneath it by GallerySection's -200vh margin. The fade
// happens inside that overlap, starting a beat after the camera passes the window
// (around 0.74) so the shaft is seen briefly before Projects appears.
const FADE = { start: 0.8, length: 0.12 };

// Opening sequence: a pinned, scroll-driven 3D scene that ends with the camera
// falling through a window. The gallery is already pinned underneath by then, so
// the intro fades straight into the sphere with no empty scroll in between.
export default function IntroSection() {
  const container = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(true);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const p = distance > 0 ? Math.min(Math.max(-rect.top / distance, 0), 1) : 0;
      progress.current = p;
      if (stage.current) stage.current.style.opacity = String(1 - range(p, FADE.start, FADE.length));
      if (hint.current) hint.current.style.opacity = p > 0.01 ? "0" : "1";
      setFaded(p >= FADE.start + FADE.length);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // Stop rendering once the intro is off screen.
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  return (
    // Above the gallery but below the fixed nav; it never takes pointer input, so
    // the gallery underneath can be dragged and clicked once the intro has faded.
    <section id="home" ref={container} data-covers-background className="pointer-events-none relative z-[5] h-[500vh]">
      <div ref={stage} className="sticky top-0 h-screen overflow-hidden bg-background">
        <IntroCanvas progress={progress} active={visible && !faded} />

        {/* The 3D title is not readable by screen readers, so repeat it here. */}
        <h1 className="sr-only">
          {site.name}, {site.role}
        </h1>

        <div
          ref={hint}
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/60 transition-opacity duration-500"
          aria-hidden
        >
          <span>Scroll</span>
          <span className="h-8 w-px animate-pulse bg-white/50" />
        </div>
      </div>
    </section>
  );
}
