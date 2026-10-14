import { expect, test } from "@playwright/test";
import { applyTurn, createCubies, createTurnSequence, FACE_NORMALS, hasSticker, worldNormal, type Axis, type Turn } from "../src/lib/rubik-state";

const serialize = (value: unknown) => JSON.stringify(value);

test("every face turn has an exact inverse and four quarter-turns return home", () => {
  for (const axis of [0, 1, 2] as Axis[]) {
    for (const layer of [-1, 1] as const) {
      const cubies = createCubies();
      const initial = serialize(cubies);
      const turn: Turn = { axis, layer, direction: 1 };
      applyTurn(cubies, turn);
      applyTurn(cubies, { ...turn, direction: -1 });
      expect(serialize(cubies)).toBe(initial);
      for (let i = 0; i < 4; i++) applyTurn(cubies, turn);
      expect(serialize(cubies)).toBe(initial);
    }
  }
});

test("scrambling preserves all 54 stickers, outward faces, and the piece lattice", () => {
  const cubies = createCubies();
  const next = createTurnSequence();
  for (let i = 0; i < 1000; i++) applyTurn(cubies, next());
  expect(new Set(cubies.map((cubie) => cubie.position.join(","))).size).toBe(26);
  const counts = FACE_NORMALS.map(() => 0);
  const visibleFaces = new Map(FACE_NORMALS.map((normal) => [normal.join(","), [] as number[]]));
  for (const cubie of cubies) {
    expect(cubie.position.every((value) => [-1, 0, 1].includes(value))).toBe(true);
    FACE_NORMALS.forEach((normal, texture) => {
      if (!hasSticker(cubie, normal)) return;
      counts[texture]++;
      const facing = worldNormal(cubie, normal);
      expect(facing.reduce((sum, value, axis) => sum + value * cubie.position[axis], 0)).toBe(1);
      visibleFaces.get(facing.join(","))!.push(texture);
    });
  }
  expect(counts).toEqual([9, 9, 9, 9, 9, 9]);
  for (const textures of visibleFaces.values()) expect(textures).toHaveLength(9);
});

test("the initial 22-turn scramble mixes textures across every side", () => {
  const cubies = createCubies();
  const next = createTurnSequence();
  for (let i = 0; i < 22; i++) applyTurn(cubies, next());
  const sides = new Map(FACE_NORMALS.map((normal) => [normal.join(","), new Set<number>()]));
  cubies.forEach((cubie) => FACE_NORMALS.forEach((normal, texture) => {
    if (hasSticker(cubie, normal)) sides.get(worldNormal(cubie, normal).join(","))!.add(texture);
  }));
  for (const textures of sides.values()) expect(textures.size).toBeGreaterThanOrEqual(3);
});
