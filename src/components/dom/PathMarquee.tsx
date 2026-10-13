"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";

// Adapted from https://github.com/davidumoru/playground (components/experiments/path-marquee.tsx).
// The original moves every item with CSS offset-path driven by motion values, which
// re-parses the path and recomputes layout per item per frame. Here the path is sampled
// once into a lookup table, and each frame only writes a translate3d per item, so the
// browser can composite the motion without layout or React re-renders. The loop also
// stops entirely while the marquee is off screen.

const SVG_NS = "http://www.w3.org/2000/svg";
const SAMPLES = 1024;
// Height of the fade at the container's top and bottom edges, in px. Fitted paths keep
// whole cards inside it; only path tails that run past the box fade out through it.
const EDGE_FADE = 32;

export const PATH_PRESETS = {
  wave: {
    d: "M-83.1 240.6L1.20703 116.533C105.589 -36.9698 209.971 -36.9698 314.353 116.533C418.736 270.036 523.118 270.036 627.5 116.533C731.882 -36.9698 836.264 -36.9698 940.646 116.533C1045.03 270.036 1149.41 270.036 1253.79 116.533L1338.1 -7.5",
    viewBox: [0, 0, 1255, 233],
  },
} as const;

export type PathPreset = keyof typeof PATH_PRESETS;

// breaks: where each subpath starts and ends, as fractions of the total length.
type PathSamples = { points: Float32Array; length: number; breaks: number[] };
const sampleCache = new Map<string, PathSamples>();

// Points evenly spaced by arc length, in the path's own coordinate space.
// getPointAtLength needs the path attached to the document in some browsers.
function samplePath(d: string): PathSamples {
  const cached = sampleCache.get(d);
  if (cached) return cached;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;visibility:hidden");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  document.body.appendChild(svg);

  const length = path.getTotalLength();

  // A path may be several disjoint lines. Items jump from the end of one
  // to the start of the next, so they fade out around every subpath boundary.
  const breaks = [0];
  const subpath = document.createElementNS(SVG_NS, "path");
  svg.appendChild(subpath);
  let travelled = 0;
  for (const part of d.match(/[Mm][^Mm]*/g) ?? []) {
    subpath.setAttribute("d", part);
    travelled += subpath.getTotalLength();
    breaks.push(Math.min(1, travelled / length));
  }

  const points = new Float32Array((SAMPLES + 1) * 2);
  for (let i = 0; i <= SAMPLES; i++) {
    const p = path.getPointAtLength((length * i) / SAMPLES);
    points[i * 2] = p.x;
    points[i * 2 + 1] = p.y;
  }
  svg.remove();

  const samples = { points, length, breaks };
  sampleCache.set(d, samples);
  return samples;
}

const wrap = (value: number) => ((value % 100) + 100) % 100;

export default function PathMarquee({
  children,
  preset = "wave",
  speed = 4,
  repeat = 2,
  slowDownFactor = 0.25,
  minHeightRatio = 0.6,
  className = "",
}: {
  children: ReactNode;
  preset?: PathPreset;
  /** Percent of the path travelled per second. */
  speed?: number;
  /** How many times the children are repeated along the path. */
  repeat?: number;
  /** Speed multiplier while an item is hovered. */
  slowDownFactor?: number;
  /** On narrow screens the path may run off the sides so it still fills this fraction of the height. */
  minHeightRatio?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Mutable animation state shared by the frame loop and the event handlers.
  const state = useRef({ hovered: false });

  const childArray = Children.toArray(children);
  const items = Array.from({ length: repeat }, (_, r) =>
    childArray.map((child, c) => ({ child, key: `${r}-${c}`, isCopy: r > 0 })),
  ).flat();
  const itemCount = items.length;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { d, viewBox } = PATH_PRESETS[preset];
    const [vbX, vbY, vbW, vbH] = viewBox;
    const { points, length, breaks } = samplePath(d);
    const els = itemRefs.current.slice(0, itemCount);
    const lastZ = new Int16Array(itemCount).fill(-1);
    const lastOpacity = new Float32Array(itemCount).fill(-1);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const baseSpeed = reduceMotion ? 0 : speed;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let offset = 0;
    let direction = 1;
    let hoverFactor = 1;
    let scrollBoost = 0;
    let lastScrollY = window.scrollY;
    let dragging = false;
    let dragDelta = 0; // percent of path accumulated since the last frame
    let dragVelocity = 0; // percent per second, decays after release
    let lastPointerX = 0;
    let raf = 0;
    let lastTime = 0;

    const place = () => {
      for (let i = 0; i < itemCount; i++) {
        const el = els[i];
        if (!el) continue;
        const t = wrap(offset + (i * 100) / itemCount) / 100;
        const f = t * SAMPLES;
        const i0 = Math.min(SAMPLES - 1, f | 0);
        const frac = f - i0;
        const x = points[i0 * 2] + (points[i0 * 2 + 2] - points[i0 * 2]) * frac;
        const y = points[i0 * 2 + 1] + (points[i0 * 2 + 3] - points[i0 * 2 + 1]) * frac;
        el.style.transform = `translate3d(${x * scale + offsetX}px, ${y * scale + offsetY}px, 0)`;

        // Items further along the path stack on top, so crossings overlap consistently.
        const z = 1 + Math.round(t * 100);
        if (z !== lastZ[i]) {
          lastZ[i] = z;
          el.style.zIndex = String(z);
        }
        // Fade at the path ends (and subpath joins) so wrapping items don't pop in and out.
        let edge = 1;
        for (const b of breaks) edge = Math.min(edge, Math.abs(t - b));
        const opacity = Math.round(Math.min(1, edge / 0.03) * 20) / 20;
        if (opacity !== lastOpacity[i]) {
          lastOpacity[i] = opacity;
          el.style.opacity = String(opacity);
        }
      }
    };

    const fit = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      // Items are centered on the path, so leave half a card (plus the edge fade)
      // above and below it; otherwise cards at the top and bottom get cut off.
      const card = els[0]?.firstElementChild as HTMLElement | null | undefined;
      const padY = (card?.offsetHeight ?? 0) / 2 + EDGE_FADE;
      const fitHeight = Math.max(h - padY * 2, 0) / vbH;
      // Never taller than the box. Wide screens fit the width; narrow ones let the
      // path overflow sideways rather than shrink to a sliver.
      scale = Math.min(fitHeight, Math.max(w / vbW, fitHeight * minHeightRatio));
      offsetX = (w - vbW * scale) / 2 - vbX * scale;
      offsetY = (h - vbH * scale) / 2 - vbY * scale;
      place();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (dt <= 0) return;

      const ease = 1 - Math.exp(-dt * 10);
      hoverFactor += ((state.current.hovered ? slowDownFactor : 1) - hoverFactor) * ease;

      // Scrolling steers the direction and briefly speeds the marquee up.
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      lastScrollY = scrollY;
      if (scrollDelta !== 0 && !dragging) direction = scrollDelta > 0 ? 1 : -1;
      const targetBoost = Math.min(Math.abs(scrollDelta / dt) / 250, 6);
      scrollBoost += (targetBoost - scrollBoost) * ease;

      if (dragging) {
        offset += dragDelta;
        dragVelocity = dragDelta / dt;
        dragDelta = 0;
      } else {
        offset += direction * baseSpeed * dt * hoverFactor * (1 + scrollBoost);
        offset += dragVelocity * dt;
        dragVelocity *= Math.exp(-dt * 4);
        if (Math.abs(dragVelocity) < 0.05) dragVelocity = 0;
      }
      offset = wrap(offset);
      place();
    };

    const start = () => {
      if (raf) return;
      lastTime = performance.now();
      lastScrollY = window.scrollY;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      dragVelocity = 0;
      lastPointerX = e.clientX;
      container.setPointerCapture(e.pointerId);
      container.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      // Convert pixels to percent of the on-screen path so items track the pointer.
      dragDelta += (dx / (length * scale)) * 100;
      if (dx !== 0) direction = dx > 0 ? 1 : -1;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
      container.style.cursor = "";
    };

    fit();
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    intersectionObserver.observe(container);
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    container.addEventListener("lostpointercapture", onPointerUp);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      container.removeEventListener("lostpointercapture", onPointerUp);
    };
  }, [preset, speed, slowDownFactor, minHeightRatio, itemCount]);

  return (
    <div
      ref={containerRef}
      // pan-y keeps vertical page scrolling on touch screens; horizontal swipes drag the marquee.
      className={`relative h-full w-full cursor-grab touch-pan-y select-none ${className}`}
      style={{
        maskImage: `linear-gradient(to bottom, transparent, black ${EDGE_FADE}px, black calc(100% - ${EDGE_FADE}px), transparent)`,
      }}
    >
      {items.map(({ child, key, isCopy }, i) => (
        <div
          key={key}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          aria-hidden={isCopy || undefined}
          className="absolute left-0 top-0 opacity-0 will-change-transform"
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") state.current.hovered = true;
          }}
          onPointerLeave={() => {
            state.current.hovered = false;
          }}
        >
          <div className="-translate-x-1/2 -translate-y-1/2">{child}</div>
        </div>
      ))}
    </div>
  );
}
