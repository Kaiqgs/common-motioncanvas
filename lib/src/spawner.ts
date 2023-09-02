import { Shape } from "@motion-canvas/2d";
import {
  easeInElastic,
  easeOutElastic,
  Vector2,
  tween,
  TimingFunction,
} from "@motion-canvas/core";

export class OpaqueSpawner {
  public static *spawn(
    node: Shape,
    time: number,
    func: TimingFunction = easeOutElastic
  ) {
    let scale = node.scale();
    node.opacity(1);
    // yield* tween(time, (v) => {
    yield* tween(time, (v) => {
      node.scale(new Vector2(func(v, 0, scale.x), func(v, 0, scale.y)));
    });
  }

  public static *despawn(
    node: Shape,
    time: number,
    func: TimingFunction = easeInElastic
  ) {
    let scale = node.scale();
    yield* tween(time, (v) => {
      node.scale(new Vector2(func(v, scale.x, 0), func(v, scale.y, 0)));
    });
    node.opacity(0);
    node.scale(scale);
  }
}

export class SizeSpawner {
  public static *spawn(
    node: Shape,
    size: number | Vector2,
    time: number,
    func: TimingFunction = easeOutElastic
  ) {
    yield* tween(time, (v) => {
      let _size = typeof size === "number" ? Vector2.one.mul(size) : size;
      node.size(_size.mul(func(v)));
    });
  }
  public static *despawn(
    node: Shape,
    time: number,
    func: TimingFunction = easeInElastic
  ) {
    const originalSize = node.size();
    yield* tween(time, (v) => {
      const value = func(v, 1, 0);
      node.size(originalSize.mul(value));
    });
  }
}

export function* spawnElastic(
  node: Shape,
  size: number | Vector2,
  time: number
) {
  yield* tween(time, (v) => {
    let _size = typeof size === "number" ? Vector2.one.mul(size) : size;
    node.size(_size.mul(easeOutElastic(v)));
  });
}

export function* despawnElastic(node: Shape, time: number) {
  const originalSize = node.size();
  yield* tween(time, (v) => {
    const value = easeInElastic(v, 1, 0);
    node.size(originalSize.mul(value));
  });
}
