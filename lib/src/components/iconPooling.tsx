import {
  Circle,
  CircleProps,
  Icon,
  initial,
  Layout,
  Line,
  LineProps,
  NodeProps,
  Rect,
  RectProps,
  Shape,
  signal,
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

export interface IconPoolingProps extends RectProps {
  icons?: SignalValue<string[]>;
  count?: number;
  iconSize?: SignalValue<number>;
  randomizables?: SignalValue<string[]>;
  range?: SignalValue<number>;
  random?: Random;
}

export class IconPooling extends Rect {
  @initial([])
  @signal()
  public declare readonly icons: SimpleSignal<string[], this>;

  @initial(75)
  @signal()
  public declare readonly iconSize: SimpleSignal<number, this>;

  @initial(300)
  @signal()
  public declare readonly range: SimpleSignal<number, this>;

  @initial(["size"])
  @signal()
  public declare readonly randomizables: SimpleSignal<string[], this>;

  public declare readonly count: number;

  random: Random;
  pool: Pool<Reference<Icon>>;
  duration: number;

  constructor(props?: IconPoolingProps) {
    props.icons = props.icons || [];
    super({
      ...props,
    });
    const children = this.children();
    props.count = props.count || children.length;
    this.count = props.count;
    this.random = props.random || new Random(0);

    this.pool = new Pool<Reference<Icon>>(
      range(props.count).map(() => createRef<Icon>()),
      this.position(),
      this.range()
    );

    if (children.length > 0) {
      this.removeChildren();
      this.add(
        <>
          <Rect lineWidth={30} fill={this.fill()} size={this.range()}>
            {children.map((child, i) => {
              const icon = child as Icon;
              const size = props.iconSize ?? icon.size();
              const element = (
                <Icon
                  ref={this.getRef(i)}
                  icon={icon.icon()}
                  position={
                    this.randomizables().includes("position")
                      ? rng2d(this.random).mul(this.range())
                      : icon.position()
                  }
                  size={size}
                  opacity={0}
                  color={icon.color()}
                  zIndex={icon.zIndex()}
                  fill={icon.fill()}
                  shadowBlur={icon.shadowBlur()}
                  shadowColor={icon.shadowColor()}
                  shadowOffset={icon.shadowOffset()}
                  children={icon.children()}
                />
              );
              return element;
            })}
          </Rect>
        </>
      );
    } else {
      this.add(
        <>
          <Rect size={this.range()}>
            {range(props.count).map((i) => (
              <Icon
                ref={this.getRef(i)}
                position={rng2d(this.random).mul(this.range())}
                size={
                  this.randomizables().includes("size")
                    ? (this.random.nextFloat() * this.iconSize()) / 2 +
                    this.iconSize() / 2
                    : this.iconSize()
                }
                icon={this.icons()[this.random.nextInt(0, this.icons().length)]}
                opacity={0}
              />
            ))}
          </Rect>
        </>
      );
    }
  }

  getRef(index: number): Reference<Icon> {
    return this.pool.pool[index];
  }

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

  private internalDespawn(): (i: number) => ThreadGenerator {
    const self = this;
    return function*(index: number) {
      const numberOperations = 2;
      const duration = self.duration / numberOperations;
      const preDespawnDur = duration * self.random.nextFloat();
      const despawnDur = duration - preDespawnDur;
      yield* waitFor(preDespawnDur);
      yield* OpaqueSpawner.despawn(self.pool.pool[index](), despawnDur);
      self.pool.despawn(index);
    };
  }

  *spawn(duration: number, count?: number) {
    count = count ?? this.pool.pool.length;
    // debug(this.pool.pool[0]);
    this.duration = duration;
    yield* all(
      ...range(count).map((i) =>
        this.pool.spawnAs({
          position: this.getRef(i)().position(),
          onSpawn: this.internalSpawn(),
        })
      )
    );
  }

  *despawn(duration: number, count?: number) {
    count = count ?? this.pool.pool.length;
    this.duration = duration;
    yield* all(...range(count).map(this.internalDespawn()));
  }
}
