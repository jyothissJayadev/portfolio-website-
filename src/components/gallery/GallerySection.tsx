"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { galleryCards, projects } from "@/content/projects";
import { createControls } from "./controls";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GalleryCanvas = dynamic(() => import("./GalleryCanvas"), { ssr: false });

const images = galleryCards.map((card) => card.image);

export default function GallerySection() {
  const router = useRouter();
  const container = useRef<HTMLElement>(null);
  const controls = useRef(createControls());
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  // Mount the canvas shortly before the section scrolls into view, and only
  // render frames while it is actually on screen.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && setMounted(true), {
      rootMargin: "50% 0px",
    });
    const visible = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  // Project pages open instantly once the gallery is close.
  useEffect(() => {
    if (mounted) projects.forEach((p) => router.prefetch(`/projects/${p.id}`));
  }, [mounted, router]);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: container.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          controls.current.scroll = self.progress;
        },
      });
    },
    { scope: container },
  );

  const handleDrag = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.buttons !== 1) return;
    controls.current.rotationY += e.movementX * 0.01;
    controls.current.rotationX += e.movementY * 0.01;
  };

  return (
    <section
      id="projects"
      ref={container}
      data-covers-background
      className="relative h-[400vh] bg-background">
      <div
        className={`sticky top-0 h-screen overflow-hidden ${
          hovered === null ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
        }`}
        onPointerMove={handleDrag}
      >
        {mounted && (
          <GalleryCanvas
            images={images}
            controls={controls}
            active={active}
            onSelect={(i) => router.push(galleryCards[i].href)}
            onHover={setHovered}
          />
        )}

        <div className="pointer-events-none absolute left-0 top-20 px-6 md:px-16">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">Projects</h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Scroll to fly through · Drag to rotate · Click a card to open
          </p>
        </div>

        {/* Name of the hovered project. */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-10 text-center transition-opacity duration-300 ${
            hovered === null ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        >
          <span className="rounded-full border border-white/10 bg-black/50 px-5 py-2 text-sm font-semibold backdrop-blur-md">
            {hovered !== null && galleryCards[hovered].title} →
          </span>
        </div>

        {/* The 3D cards can't be reached by keyboard or screen readers, so list the projects as links too. */}
        <nav aria-label="Projects" className="sr-only">
          <ul>
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
