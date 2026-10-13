"use client";

import Image from "next/image";
import { MotionConfig, motion, type Variants } from "motion/react";
import {
  HoverSlider,
  TextStaggerHover,
  useHoverSliderContext,
} from "@/components/ui/animated-slideshow";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

const topics = site.aboutTopics;
const pad = (n: number) => String(n).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1] as const;

// Where each of a topic's three photos sits in the collage, and its tilt.
const PHOTO_LAYOUT = [
  { className: "left-0 top-[4%] z-10 w-[58%] aspect-[3/4]", rotate: -7 },
  { className: "right-0 top-0 z-20 w-[50%] aspect-[4/3]", rotate: 6 },
  { className: "bottom-[2%] right-[8%] z-30 w-[46%] aspect-[4/3]", rotate: -3 },
];

const photoVariants: Variants = {
  hidden: { opacity: 0, y: 40, rotate: 0, scale: 0.9, transition: { duration: 0.3 } },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: PHOTO_LAYOUT[i].rotate,
    scale: 1,
    transition: { delay: 0.1 + i * 0.09, duration: 0.9, ease: EASE },
  }),
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 16, transition: { duration: 0.2 } },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE },
  }),
};

// "02 / 05" counter that follows the active topic.
function Counter() {
  const { activeSlide } = useHoverSliderContext();
  return (
    <span className="whitespace-nowrap font-mono text-sm tabular-nums text-white/50">
      <span className="text-white">{pad(activeSlide + 1)}</span> / {pad(topics.length)}
    </span>
  );
}

function TopicNumber({ index }: { index: number }) {
  const { activeSlide } = useHoverSliderContext();
  return (
    <span
      className={cn(
        "w-8 shrink-0 font-mono text-xs transition-colors duration-300",
        activeSlide === index ? "text-violet-300" : "text-white/25",
      )}
    >
      {pad(index + 1)}
    </span>
  );
}

function Progress() {
  const { activeSlide } = useHoverSliderContext();
  return (
    <div className="h-px w-full bg-white/10">
      <motion.div
        className="h-px bg-violet-400"
        initial={false}
        animate={{ width: `${((activeSlide + 1) / topics.length) * 100}%` }}
        transition={{ ease: EASE, duration: 0.6 }}
      />
    </div>
  );
}

function TopicPanel({ topic, index }: { topic: (typeof topics)[number]; index: number }) {
  const { activeSlide } = useHoverSliderContext();
  const isActive = activeSlide === index;
  return (
    <motion.div
      initial={false}
      animate={isActive ? "visible" : "hidden"}
      aria-hidden={!isActive}
      className={cn(
        "grid items-center gap-10 md:grid-cols-2 md:gap-12",
        !isActive && "pointer-events-none",
      )}
    >
      {/* Collage: three framed photos, scattered and tilted. */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[460px]">
        <div className="absolute inset-[15%] rounded-full bg-violet-500/10 blur-[90px]" />
        {topic.images.map((src, i) => (
          <motion.figure
            key={src}
            custom={i}
            variants={photoVariants}
            whileHover={{ scale: 1.06, rotate: 0, zIndex: 40, transition: { duration: 0.4 } }}
            className={cn(
              "absolute rounded-2xl bg-[#15131f] p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10",
              PHOTO_LAYOUT[i].className,
            )}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <Image
                src={src}
                alt={`${topic.title} photo ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          </motion.figure>
        ))}
      </div>

      <div>
        <motion.span
          custom={0}
          variants={textVariants}
          className="mb-4 block font-mono text-xs uppercase tracking-[0.2em] text-violet-300"
        >
          {pad(index + 1)} / {topic.title}
        </motion.span>
        <motion.h3
          custom={1}
          variants={textVariants}
          className="mb-4 text-2xl font-semibold leading-tight text-white md:text-3xl"
        >
          {topic.heading}
        </motion.h3>
        <motion.p
          custom={2}
          variants={textVariants}
          className="mb-6 text-base leading-relaxed text-white/70"
        >
          {topic.body}
        </motion.p>
        <motion.ul custom={3} variants={textVariants} className="flex flex-wrap gap-2">
          {topic.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs text-white/80"
            >
              {tag}
            </li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}

// About section: topic list on the left, a photo collage + copy for the active topic on the right.
export default function AboutSlider() {
  return (
    <section id="about" className="relative flex min-h-screen flex-col justify-center px-6 py-24 md:px-16">
      <Reveal>
        <MotionConfig reducedMotion="user">
          <HoverSlider className="mx-auto w-full max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
                  About
                </h2>
                <p className="max-w-md text-2xl font-medium leading-snug text-white/90 md:text-3xl">
                  A little about me, beyond the code.
                </p>
              </div>
              <Counter />
            </div>

            <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="flex flex-col gap-8 lg:col-span-4">
                <ul className="flex flex-col space-y-3 md:space-y-4">
                  {topics.map((topic, index) => (
                    <li key={topic.title} className="flex items-center">
                      <TopicNumber index={index} />
                      <TextStaggerHover
                        index={index}
                        text={topic.title}
                        className="cursor-pointer text-4xl font-bold uppercase tracking-tighter text-white outline-none focus-visible:ring-2 focus-visible:ring-violet-400 md:text-5xl lg:text-4xl xl:text-5xl"
                      />
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3">
                  <Progress />
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Hover or tap a topic
                  </p>
                </div>
              </div>

              {/* All panels share one grid cell; only the active one is visible. */}
              <div className="grid lg:col-span-8 [&>*]:col-start-1 [&>*]:row-start-1">
                {topics.map((topic, index) => (
                  <TopicPanel key={topic.title} topic={topic} index={index} />
                ))}
              </div>
            </div>
          </HoverSlider>
        </MotionConfig>
      </Reveal>
    </section>
  );
}
