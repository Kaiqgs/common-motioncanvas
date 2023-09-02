import {
  initial,
  Line,
  LineProps,
  signal,
  vector2Signal,
} from "@motion-canvas/2d";
import {
  debug,
  SignalValue,
  SimpleSignal,
  Vector2,
  Vector2Signal,
} from "@motion-canvas/core";
import { zero2d } from "../math";

function rectFromSize(size: Vector2): Vector2[] {
  size = size.div(2);
  const leftToRight = [
    // new Vector2(-1920/2, -1080/2),
    // new Vector2(1920/2, -1080/2),
    new Vector2(-size.x, -size.y),
    new Vector2(size.x, -size.y),
    new Vector2(size.x, size.y),
    new Vector2(-size.x, size.y),
  ];

  debug(leftToRight);
  return leftToRight;
}

export interface EndableRectProps extends LineProps {
  // end?: SignalValue<number>;
  rectSize?: SignalValue<Vector2>;
}

export class EndableRect extends Line {
  @initial(0)
  @signal()
  public declare readonly end: SimpleSignal<number, this>;

  @initial(Vector2.zero)
  @vector2Signal()
  public declare readonly rectSize: Vector2Signal<this>;

  constructor(props?: EndableRectProps) {
    super({
      closed: true,
      ...props,
    });

    this.add(
      <Line
        // ref={this.contain
        size={this.rectSize}
        end={this.end}
        closed={self.closed}
        points={rectFromSize(this.rectSize())}
        fill={this.fill}
        stroke={this.stroke}
        lineWidth={this.lineWidth}
        position={zero2d()}
      >
        {this.children}
      </Line>
    );
    //     <Line
    //   layout
    //   closed
    //   direction={"column"}
    //   alignItems={"center"}
    //   justifyContent={"center"}
    //   ref={trackMeta}
    //   lineWidth={lineWidth}
    //   points={rectFromSize(halfTrackItemSize)}
    //   stroke={"black"}
    //   end={0}
    // >
  }
}
