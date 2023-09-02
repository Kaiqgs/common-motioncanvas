import { Random, Vector2 } from "@motion-canvas/core";

declare module "@motion-canvas/core" {
  export interface Vector2 {
    distance(other: Vector2): number;
    nzero(): Vector2;
  }
}

Vector2.prototype.distance = function(other: Vector2) {
  return Math.sqrt(
    (this.x - other.x) * (this.x - other.x) +
    (this.y - other.y) * (this.y - other.y)
  );
};

export function zero2d(): Vector2 {
  return new Vector2(0, 0);
}

export function one2d(): Vector2 {
  return new Vector2(1, 1);
}

export function rng2d(random: Random = new Random(0)): Vector2 {
  return new Vector2(random.nextFloat() * 2 - 1, random.nextFloat() * 2 - 1);
}

Vector2.prototype.nzero = zero2d;
