// Mutable scroll state shared between the DOM and the R3F render loop.
// Read it inside useFrame; it is not React state, so changes do not cause re-renders.
export const scroll = {
  /** Page scroll progress, 0 at the top and 1 at the bottom. */
  progress: 0,
  /** Distance scrolled, measured in viewport heights. */
  viewports: 0,
};

export function startScrollTracking() {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scroll.progress = max > 0 ? window.scrollY / max : 0;
    scroll.viewports = window.scrollY / window.innerHeight;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}
