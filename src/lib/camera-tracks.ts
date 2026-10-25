import * as T from "three";

export type Key = readonly [number, number];
/** Monotone cubic Hermite interpolation prevents pacing overshoot and is reversible. */
export function monotoneTrack(keys: readonly Key[]) {
  const slopes = keys
    .slice(1)
    .map((k, i) => (k[1] - keys[i][1]) / (k[0] - keys[i][0]));
  const tangent = keys.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === keys.length - 1) return slopes.at(-1)!;
    const a = slopes[i - 1],
      b = slopes[i];
    if (a * b <= 0) return 0;
    const h0 = keys[i][0] - keys[i - 1][0],
      h1 = keys[i + 1][0] - keys[i][0];
    const w0 = 2 * h1 + h0,
      w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / a + w1 / b);
  });
  return (progress: number) => {
    const p = T.MathUtils.clamp(progress, keys[0][0], keys.at(-1)![0]);
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0],
      t = (p - keys[i][0]) / h,
      t2 = t * t,
      t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * keys[i][1] +
      (t3 - 2 * t2 + t) * h * tangent[i] +
      (-2 * t3 + 3 * t2) * keys[i + 1][1] +
      (t3 - t2) * h * tangent[i + 1]
    );
  };
}
