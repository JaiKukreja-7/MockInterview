export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function remap(value: number, inMin: number, inMax: number) {
  return Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
}
