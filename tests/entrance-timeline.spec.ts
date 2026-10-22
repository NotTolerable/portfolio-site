import { test, expect } from "@playwright/test";
import { CUBE_ENTRANCE_DURATION, entrancePose, entranceOffset } from "../src/lib/entrance-timeline";
import { createCubies } from "../src/lib/rubik-state";

test("the complete slice pass separates all 26 cubelets and closes every gap precisely", () => {
  const cubies = createCubies();
  const original = cubies.map((cubie) => [...cubie.position]);
  const cuts = entrancePose(1100);
  const separated = cubies.map((cubie) => cubie.position.map((value, axis) => value + entranceOffset(cubie.position, cuts)[axis]));
  expect(separated).toHaveLength(26);
  separated.forEach((position, index) => {
    expect(Math.hypot(...position.map((value, axis) => value - original[index][axis])), "each cubelet must leave its original position").toBeGreaterThan(.4);
    separated.slice(index + 1).forEach((neighbor, offset) => {
      const oldNeighbor = original[index + offset + 1];
      const wasAdjacent = original[index].reduce((sum, value, axis) => sum + Math.abs(value - oldNeighbor[axis]), 0) === 1;
      if (wasAdjacent) expect(Math.hypot(...position.map((value, axis) => value - neighbor[axis])), "no adjacent pieces may remain joined").toBeGreaterThan(1.4);
    });
    expect(entranceOffset(original[index], entrancePose(CUBE_ENTRANCE_DURATION))).toEqual([0, 0, 0]);
  });
  expect(cubies.map((cubie) => cubie.position), "the visual effect must not mutate the Rubik model").toEqual(original);
});
