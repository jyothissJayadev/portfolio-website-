"use client";

import Image from "next/image";
import PathMarquee from "@/components/dom/PathMarquee";
import { site } from "@/content/site";

export default function TechStack() {
  return (
    <section id="techstack" className="relative h-screen w-full overflow-clip">
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
      <div className="relative flex h-full flex-col">
        <div className="pointer-events-none flex flex-col items-center px-6 pt-20 text-center md:pt-24">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
            What I work with
          </p>
          <h2 className="mt-3 bg-linear-to-b from-white to-violet-200/70 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-6xl">
            My Tech Stack
          </h2>
          <p className="mt-3 text-sm text-white/50">Drag the cards.</p>
        </div>
        <div className="relative min-h-0 flex-1">
          <PathMarquee preset="wave" speed={4} repeat={1}>
            {site.techStack.map(({ name, src }) => (
              <div
                key={name}
                className="relative h-[110px] w-20 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_12px_40px_-12px_rgb(124_92_255/0.55)] ring-1 ring-violet-400/10 transition-[scale,border-color] duration-300 hover:scale-110 hover:border-violet-400/50 md:h-44 md:w-32"
              >
                {/* The logo textures are white with two copies side by side: object-left
                    shows one copy, and invert + hue-rotate turns the white into black
                    while keeping the brand colors close to the original. */}
                <Image
                  src={src}
                  alt={name}
                  fill
                  sizes="(min-width: 768px) 256px, 160px"
                  draggable={false}
                  className="pointer-events-none object-cover object-left invert hue-rotate-180"
                />
              </div>
            ))}
          </PathMarquee>
        </div>
      </div>
    </section>
  );
}
