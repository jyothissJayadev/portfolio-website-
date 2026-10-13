"use client";

// Ported from the atomics landing page ZoomParallax, rebuilt on GSAP ScrollTrigger.
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import styles from "./ZoomParallax.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Final scale of each tile; index 0 is the center image.
const END_SCALES = [1, 4.5, 4, 5, 4.2, 5.5, 5.8];

export default function ZoomParallax() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray<HTMLElement>(`.${styles.el}`, container.current);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        tiles.forEach((tile, i) => {
          if (i === 0) {
            tl.fromTo(tile, { scale: 0.25 }, { scale: 1, duration: 1 }, 0);
          } else {
            tl.fromTo(tile, { scale: 1 }, { scale: END_SCALES[i], duration: 1 }, 0);
            tl.to(tile, { opacity: 0.85, duration: 0.45 }, 0);
            tl.to(tile, { opacity: 0, duration: 0.4 }, 0.45);
          }
        });
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className={styles.container}>
      <div className={styles.sticky}>
        {site.showcase.map(({ src, alt }, i) => (
          <div key={i} className={`${styles.el} ${i === 0 ? styles.center : ""}`}>
            <div className={i === 0 ? styles.centerImage : styles.tileImage}>
              <Image src={src} alt={alt} fill sizes={i === 0 ? "100vw" : "25vw"} className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
