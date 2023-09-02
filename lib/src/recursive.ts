import { Rect, Shape } from "@motion-canvas/2d";
import { Reference, Type, range, createRef, debug } from "@motion-canvas/core";

export class RecursiveRecipe {
  constructor(
    public qnt: number,
    public next: RecursiveRecipe[] = [],
    public transformer: (i: number) => Reference<Shape> = () =>
      createRef<Rect>(),
    public values: Reference<Shape>[] = []
  ) {
    this.values = range(qnt).map((i) => transformer(i));
  }
}
type Sorter = { [idx: number]: Reference<Shape>[] };
export class Recursive {
  constructor(
    public ref: Reference<Shape>,
    public next: Recursive[] = [],
    // use uuid generator
    public id: string = Math.random().toString(36).substring(7)
  ) { }

  iterate(level: number = 0): Reference<Shape>[] {
    let collected = [this.ref];
    for (const child of this.next) {
      collected = collected.concat(child.iterate(level + 1));
    }
    return collected;
  }

  private chunker(level: number = 0, accumulator: Sorter = {}): Sorter {
    // like iterate but in groups of recursion level
    if (level in accumulator) {
      accumulator[level] = accumulator[level].concat(
        this.next.map((child) => child.ref)
      );
    } else {
      accumulator[level] = this.next.map((child) => child.ref);
    }
    for (const child of this.next) {
      accumulator = child.chunker(level + 1, accumulator);
    }
    if (level === 0) {
      debug(accumulator);
    }
    return accumulator;
  }

  chunks(): Reference<Shape>[][] {
    const chunks = this.chunker();
    const chunkArray = Object.keys(chunks)
      .map((key) => chunks[Number(key)])
      .filter((chunk) => chunk.length > 0);
    chunkArray.unshift([this.ref]);
    return chunkArray;
  }
}
