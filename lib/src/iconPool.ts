import { Icon } from "@motion-canvas/2d";
import {
  debug,
  Random,
  Reference,
  ThreadGenerator,
  Vector2,
  waitFor,
} from "@motion-canvas/core";
import { computeLight } from "./shadow";
import { Pool, SpawnDetails } from "./pool";

export class IconPool extends Pool<Reference<Icon>> {
  constructor(
    pool: Reference<Icon>[],
    position: Vector2,
    length: number,
    size: number,
    public icons: string[],
    public colors: string[] = ["black"]
  ) {
    super(pool, position, length, size);
  }

  *spawn(details: SpawnDetails): ThreadGenerator {
    const self = this;
    const spawner = details.onSpawn;
    details.onSpawn = function*(index) {
      const reference = self.pool[index];
      if (details.random) {
        const random = details.random as Random;
        const randomIcon = random.nextInt(0, self.icons.length);
        const randomColor = random.nextInt(0, self.colors.length);
        reference().icon(self.icons[randomIcon]);
        reference().color(self.colors[randomColor]);
      }
      spawner && (yield* spawner(index));
    };
    yield* super.spawn(details);
  }
}
