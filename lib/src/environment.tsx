import { Circle, Layout, Rect, Shape } from "@motion-canvas/2d";
import {
  createRef,
  linear,
  Random,
  Reference,
  TimingFunction,
  Vector2,
} from "@motion-canvas/core";

export class Environment {
  private rootMovement: Vector2[] = [];
  private rootScale: Vector2[] = [];
  constructor(
    public lightAt: Vector2,
    public random: Random = new Random(0),
    public root: Reference<Shape> = createRef<Shape>()
  ) { }

  *shiftRoot(diff: Vector2, time: number) {
    let pos = this.root().position();
    let finalPos = pos.add(diff);
    this.rootMovement.push(pos);
    yield* this.root().position(finalPos, time);
  }

  *popRoot(time: number, func: TimingFunction = linear) {
    const pos = this.rootMovement.pop();
    yield* this.root().position(pos, time, func);
  }

  get element() {
    return (
      <>
        <Circle
          fill={"yellow"}
          width={100}
          height={100}
          position={this.lightAt}
          shadowColor={"rgba(0, 0, 0, .75)"}
          shadowOffsetX={10}
          shadowOffsetY={10}
          zIndex={100}
        />
      </>
    );
  }
}
