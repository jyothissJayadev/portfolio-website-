"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { site } from "@/content/site";

// Three.js needs `window` and WebGL, so the scene is never server-rendered.
const FooterScene = dynamic(() => import("./FooterScene"), { ssr: false });

export default function DreiFooter() {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  // Mount the scene shortly before it scrolls into view, and only render
  // frames (and play the video) while it is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && setMounted(true), {
      rootMargin: "100% 0px",
    });
    const visible = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  return (
    <footer
      id="contact"
      ref={ref}
      data-covers-background
      className="relative h-screen w-full overflow-hidden bg-black select-none">
      <div className="absolute inset-0 animate-[fade-in_2s_ease_0.5s_both]" aria-hidden>
        {mounted && <FooterScene active={active} />}
      </div>
      <h2 className="sr-only">{site.footer.giantText}</h2>

      {/* Corner text, laid out like the original demo's overlay. */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-10 text-[10px] leading-[1.5em] whitespace-pre text-[#808080]">
        <div className="flex flex-col">
          <b className="font-semibold text-[#b0b0b0]">{site.name}</b>
          <span>{site.role}</span>
        </div>
        <div className="flex flex-col items-end">
          <a href={`mailto:${site.email}`} className="pointer-events-auto hover:underline">
            {site.email}
          </a>
          {site.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
