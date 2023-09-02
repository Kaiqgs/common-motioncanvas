import {
  Circle,
  CircleProps,
  Icon,
  initial,
  Layout,
  LayoutProps,
  Line,
  LineProps,
  NodeProps,
  Rect,
  RectProps,
  Shape,
  signal,
  Txt,
  TxtProps,
  vector2Signal,
} from "@motion-canvas/2d";
import {
  all,
  createRef,
  debug,
  Random,
  range,
  Reference,
  SignalValue,
  SimpleSignal,
  ThreadGenerator,
  Vector2,
  Vector2Signal,
  waitFor,
} from "@motion-canvas/core";
import { Pool } from "../pool";
import { rng2d, zero2d } from "../math";
import { OpaqueSpawner } from "../spawner";
import { each, shuffle } from "../utils";
import { TEXT_TAB } from "../const";

export interface TextFlickerProps extends LayoutProps {
  characters?: SignalValue<string[]>;
  colors?: SignalValue<string[]>;
  length?: SignalValue<number>;
  random: Random;
}

export class TextFlicker extends Layout {
  @initial(300)
  @signal()
  public declare readonly length: SimpleSignal<number, this>;

  @initial(["0", "1"])
  @signal()
  public declare readonly characters: SimpleSignal<string[], this>;

  @initial(["green", "black"])
  @signal()
  public declare readonly colors: SimpleSignal<string[], this>;

  yingRef: Reference<Txt> = createRef<Txt>();
  yangRef: Reference<Txt> = createRef<Txt>();

  random: Random;
  pool: Pool<Reference<Icon>>;
  duration: number;
  _length: number;

  constructor(props?: TextFlickerProps) {
    props.length = props.length || 0;
    props.random = props.random || new Random(0);
    props.colors = props.colors || ["green", "black"];
    props.rotation = props.rotation;
    super({
      ...props,
    });
    this._length = 0;
    this.random = props.random;

    // type CanvasTextAlign = "center" | "end" | "left" | "right" | "start";
    this.add(
      <>
        <Layout>
          <Txt
            ref={this.yingRef}
            fontSize={50}
            textAlign={"left"}
            alignItems={"end"}
            alignContent={"start"}
            width={this.width()}
          />
          <Txt
            ref={this.yangRef}
            fontSize={50}
            textAlign={"left"}
            alignItems={"end"}
            alignContent={"start"}
            width={this.width()}
          />
          <Line
            points={[new Vector2(-200, 0), new Vector2(200, 0)]}
            lineWidth={50}
            stroke={"rgba(255, 255, 255, 0)"}
            lineCap={"round"}
          />
        </Layout>
      </>
    );
  }

  *flicker(frequency: number = 0.1, duration?: number): ThreadGenerator {
    duration = duration || 60;
    for (let i = 0; i < duration; i += frequency) {
      const txt = range(this.length()).map(
        () =>
          this.characters()[this.random.nextInt(0, this.characters().length)]
      );
      const randomYing: string[] = [];
      const randomYang: string[] = [];
      txt.forEach((t) => {
        if (this.random.nextFloat() > 0.5) {
          randomYing.push(t.toString());
          randomYang.push(TEXT_TAB[0]);
        } else {
          randomYang.push(t.toString());
          randomYing.push(TEXT_TAB[0]);
        }
      });
      const randomColorYing =
        this.colors()[this.random.nextInt(0, this.colors().length)];
      let randomColorYang =
        this.colors()[this.random.nextInt(0, this.colors().length)];
      while (randomColorYing === randomColorYang) {
        randomColorYang =
          this.colors()[this.random.nextInt(0, this.colors().length)];
      }
      this.yingRef().text(randomYing.join(""));
      this.yangRef().text(randomYang.join(""));
      this.yingRef().fill(randomColorYing);
      this.yangRef().fill(randomColorYang);
      yield* waitFor(frequency);
    }
    this.yingRef().text("");
    this.yangRef().text("");
  }

  // *resize(frequency: number = 0.1): ThreadGenerator {
  //   const diff = this.length() - this._length;
  //   const dir = diff > 0 ? 1 : -1;
  //   const maxCase = Math.abs(this._length) + Math.abs(this.length());
  //
  //   for (let i = 0; i < maxCase || this._length !== this.length(); ++i) {
  //     this._length += dir;
  //     yield* waitFor(frequency);
  //   }
  // }

  private internalSpawn(): (i: number) => ThreadGenerator {
    const self = this;
    return function*(index: number) {
      const numberOperations = 2;
      const duration = self.duration / numberOperations;
      const preSpawnDur = duration * self.random.nextFloat();
      const spawnDur = duration - preSpawnDur;
      yield* waitFor(preSpawnDur);
      yield* OpaqueSpawner.spawn(self.pool.pool[index](), spawnDur);
    };
  }

  *spawn(duration: number, count: number) {
    this.duration = duration;
    yield* all(
      ...range(count).map((i) =>
        this.pool.spawnAs({
          position: this.pool.pool[i]().position(),
          onSpawn: this.internalSpawn(),
        })
      )
    );
  }
}
