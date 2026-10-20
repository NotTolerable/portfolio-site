// Integer coordinates and bases keep repeated quarter-turns exact.
export type Coordinate = [number, number, number];
export type Axis = 0 | 1 | 2;
export type Turn = { axis: Axis; layer: -1 | 1; direction: -1 | 1 };
export type ScrambleMove = Turn & { quarterTurns: 1 | 2 };
export type Cubie = {
  id: string;
  home: Coordinate;
  position: Coordinate;
  basis: [Coordinate, Coordinate, Coordinate];
};

export const FACE_NORMALS: Coordinate[] = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
];

export function createCubies(): Cubie[] {
  const cubies: Cubie[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        cubies.push({ id: `${x},${y},${z}`, home: [x, y, z], position: [x, y, z], basis: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] });
      }
    }
  }
  return cubies;
}

function rotate([x, y, z]: Coordinate, { axis, direction: d }: Turn): Coordinate {
  if (axis === 0) return [x, -d * z, d * y];
  if (axis === 1) return [d * z, y, -d * x];
  return [-d * y, d * x, z];
}

export function applyTurn(cubies: Cubie[], turn: Turn) {
  for (const cubie of cubies) {
    if (cubie.position[turn.axis] !== turn.layer) continue;
    cubie.position = rotate(cubie.position, turn);
    cubie.basis = cubie.basis.map((axis) => rotate(axis, turn)) as Cubie["basis"];
  }
}

export function worldNormal(cubie: Cubie, normal: Coordinate): Coordinate {
  return [0, 1, 2].map((axis) => cubie.basis[0][axis] * normal[0] + cubie.basis[1][axis] * normal[1] + cubie.basis[2][axis] * normal[2]) as Coordinate;
}

export function hasSticker(cubie: Cubie, normal: Coordinate) {
  return normal.some((value, axis) => value !== 0 && cubie.home[axis] === value);
}

export function createTurnSequence(seed = 7127) {
  let previousAxis: Axis = 2;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return (): Turn => {
    // Changing axes prevents repeated moves from immediately undoing each other.
    const axis = ((previousAxis + 1 + Math.floor(random() * 2)) % 3) as Axis;
    previousAxis = axis;
    return { axis, layer: random() < 0.5 ? -1 : 1, direction: random() < 0.5 ? -1 : 1 };
  };
}

/** Continuous half-turns, with an opposite-layer follow-up every 3–5 sequences. */
export function createScrambleSequence(seed = 3907) {
  const nextTurn = createTurnSequence(seed);
  const interval = () => {
    seed = seed * 16807 % 2147483647;
    return 3 + Math.floor((seed - 1) / 2147483646 * 3);
  };
  let remaining = interval();
  return (): ScrambleMove[] => {
    const turn = nextTurn();
    const turns: ScrambleMove[] = [{ ...turn, quarterTurns: 2 }];
    if (--remaining === 0) {
      turns.push({ ...turn, layer: turn.layer === 1 ? -1 : 1, quarterTurns: 1 });
      remaining = interval();
    }
    return turns;
  };
}
