// Mutable state shared between the gallery section (DOM) and the R3F render
// loop. Written by event handlers, read inside useFrame.
export type GalleryControls = {
  /** Scroll progress through the pinned section, 0 to 1. */
  scroll: number;
  /** Extra rotation from mouse drag, in radians. */
  rotationX: number;
  rotationY: number;
};

export function createControls(): GalleryControls {
  return { scroll: 0, rotationX: 0, rotationY: 0 };
}

// Scroll progress breakpoints: zoom into the sphere, morph, then fly through the tunnel.
export const MORPH_START = 0.4;
export const MORPH_END = 0.55;
