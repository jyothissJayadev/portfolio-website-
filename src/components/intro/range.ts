/** 0 before `start`, 1 after `start + length`, and a linear ramp in between. */
export function range(progress: number, start: number, length: number) {
  return Math.min(Math.max((progress - start) / length, 0), 1);
}
