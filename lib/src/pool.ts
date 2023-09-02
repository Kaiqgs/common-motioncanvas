import { Shape } from "@motion-canvas/2d";
import {
  Vector2,
  Reference,
  Random,
  ThreadGenerator,
  debug,
  waitFor,
} from "@motion-canvas/core";
import { computeLight } from "./shadow";
import "./math";
import { zero2d } from "./math";

export interface SpaceInformation {
  position: Vector2;
  owner: number;
}

export interface SpawnDetails {
  position?: Vector2;
  // size: number;
  computeLight?: Vector2;

  flipX?: boolean;
  flipY?: boolean;
  random?: Random;
  onSpawn?: (index: number) => ThreadGenerator;
  // - Is using `?` correct to get optional properties?
  // Response:
  // Yes, it is correct. You can also use `| undefined` to make it more explicit.
  // https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#optional-properties
  // - It's correct LOL, thanks.
  // Response:
  // No problem! I'm glad I could help.
  // ^ this was an actual conversation I had with copilot
}

export class Pool<T extends Reference<Shape>> {
  active: number[] = [];
  iterations: number = 0;
  spaceMap: SpaceInformation[] = [];

  constructor(
    public pool: T[],
    public position: Vector2 = zero2d(),
    public length: number = 0,
    public size: number = 0, // radius-like
    public children: Pool<T>[] = []
  ) {
    this._computeMap();
  }

  _computeMap() {
    this.spaceMap = [];
    const radius = this.length;
    const length = radius * 2;
    const placesAvailable = length / this.size;
    let index = 0;
    for (let i = 0; i < placesAvailable; i++) {
      for (let j = 0; j < placesAvailable; j++) {
        this.spaceMap.push({
          position: new Vector2(
            this.position.x + i * this.size,
            this.position.y + j * this.size
          ),
          owner: index,
        });
        index++;
        if (index >= this.pool.length) {
          // debug(this.spaceMap);
          return;
        }
      }
    }
  }

  get count(): number {
    return this.pool.length;
  }

  randomInactivePosition(
    random: Random,
    depth: number = 0
  ): Vector2 | undefined {
    if (depth > 5) {
      // debug(depth);
      return undefined;
    }
    const nx =
      this.position.x + random.nextFloat() * this.length - this.length / 2;
    const ny =
      this.position.y + random.nextFloat() * this.length - this.length / 2;
    const center = new Vector2(nx, ny);

    const distances = this.active.map(
      (key) => this.pool[key]().position().distance(center)
      // distance(this.pool[key]().position(), center)
    );
    const away = distances.every((d) => d > this.size);
    if (!away) {
      // i--;
      // return this.spawn(random, randomFlipX, randomFlipY);
      return this.randomInactivePosition(random, depth + 1);
    }
    // debug(depth);
    return center;
  }

  *spawn(details: SpawnDetails): ThreadGenerator {
    if (this.active.length == this.count) {
      yield* waitFor(1);
      yield* this.spawn(details);
      return;
    }
    if (details.random === undefined) {
      yield* this.spawnAs(details);
      return;
    }

    const position = this.randomInactivePosition(details.random);
    if (position === undefined) {
      yield* waitFor(1);
      yield* this.spawn(details);
      return;
    }
    details.position = position;
    details.flipX = details.flipX ?? details.random.nextFloat() < 0.5;
    details.flipY = details.flipY ?? details.random.nextFloat() < 0.5;

    yield* this.spawnAs(details);
  }

  *spawnAs(details: SpawnDetails): ThreadGenerator {
    if (this.active.length == this.count) {
      yield* waitFor(1);
      yield* this.spawnAs(details);
      return;
    }
    // debug(this.iterations);
    const index = this.iterations++ % this.pool.length;
    if (index in this.active) {
      yield* waitFor(1);
      yield* this.spawnAs(details);
      return;
    }
    let position = details.position ?? new Vector2(0, 0);
    const reference = this.pool[index];
    const scale = reference().scale();
    scale.x *= details.flipX ? -1 : 1;
    scale.y *= details.flipY ? -1 : 1;
    if (details.computeLight ?? false) {
      reference().shadowOffset(
        computeLight(details.computeLight, position, 30)
      );
    }
    reference().scale(scale);
    reference().position(position);

    this.active.push(index);
    details.onSpawn && (yield* details.onSpawn(index));
  }

  *despawn(index: number) {
    const rmIdx = this.active.indexOf(index);
    this.active.splice(rmIdx, 1);
  }
}
