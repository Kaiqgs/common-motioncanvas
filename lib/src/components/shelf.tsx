import {
  Icon,
  initial,
  Line,
  LineProps,
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
  Reference,
  SignalValue,
  SimpleSignal,
  ThreadGenerator,
  Vector2,
  Vector2Signal,
  waitFor,
} from "@motion-canvas/core";
import { Recursive, RecursiveRecipe } from "../recursive";
import { zero2d } from "../math";
import { OpaqueSpawner } from "../spawner";
import { each, shuffle } from "../utils";
import { Style } from "../style";

export interface BookShelfProps extends RectProps {
  icons: SignalValue<string[]>;
}

export class BookShelf extends Rect {
  @initial([])
  @signal()
  public declare readonly icons: SimpleSignal<string[], this>;

  shelf: Recursive;
  random: Random;
  hiddenBooks = [] as number[];
  constructor(props?: BookShelfProps) {
    super({
      ...props,
    });
    const shelf = new Recursive(createRef<Rect>(), [
      // Row
      new Recursive(createRef<Rect>(), [
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
      ]),
      // Row
      new Recursive(createRef<Rect>(), [
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
      ]),
      // Row
      new Recursive(createRef<Rect>(), [
        new Recursive(createRef<Rect>(), [
          new Recursive(createRef<Icon>()),
          new Recursive(createRef<Icon>()),
          new Recursive(createRef<Icon>()),
          new Recursive(createRef<Icon>()),
        ]),
      ]),
      // Row
      new Recursive(createRef<Rect>(), [
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
        new Recursive(createRef<Rect>(), [new Recursive(createRef<Icon>())]),
      ]),
    ]);

    this.shelf = shelf;
    const random = new Random(0);
    this.random = random;

    this.add(
      <>
        <Rect
          layout
          ref={shelf.ref}
          size={props.size}
          fill={"#9D4521"}
          stroke={"gray"}
          direction={"column"}
          range={props.range}
          opacity={0}
        >
          {shelf.next.map((row) => (
            <Rect
              layout
              direction={"row"}
              ref={row.ref}
              fill={"orange"}
              size={
                new Vector2(this.width(), this.height() / shelf.next.length)
              }
              opacity={0}
            >
              {row.next.map((cell) => (
                <Rect
                  layout
                  ref={cell.ref}
                  size={
                    new Vector2(
                      this.width() / row.next.length,
                      this.height() / shelf.next.length
                    )
                  }
                  lineWidth={props.lineWidth}
                  fill={"#BC7C56"}
                  stroke={"#9D4521"}
                  justifyContent={"center"}
                  alignItems={"end"}
                  opacity={0}
                  range={props.range}
                >
                  {cell.next.map((item) => (
                    <Icon
                      ref={item.ref}
                      icon={this.icons()[random.nextInt(0, this.icons().length)]}
                      size={90}
                      opacity={0}
                      shadowBlur={Style.ShadowBlur}
                      shadowColor={Style.ShadowColor}
                      shadowOffsetX={10}
                    />
                  ))}
                </Rect>
              ))}
            </Rect>
          ))}
        </Rect>
      </>
    );
  }

  public *spawn(time: number = 3) {
    let data = this.shelf.chunks();
    // data = shuffle(this.random, data);
    debug(data);
    let totalData = data.length;
    // let totalData = data.reduce((acc, value) => acc.concat(value)).length;
    const timePerItem = time / totalData;
    const numberOfOperations = 2; // Somehow this is still not completely matching;
    const timePerOp = timePerItem / numberOfOperations;

    debug("timePerOp " + timePerOp);

    for (let group of data) {
      const toSpawn: ThreadGenerator[] = [];
      for (let cell of group) {
        const cellInstance = cell();
        // if (cellInstance instanceof Icon) {
        //   continue;
        // }
        const preSpawnTime = this.random.nextFloat() * timePerOp;
        const spawnDuration = timePerOp + (timePerOp - preSpawnTime);
        toSpawn.push(
          each(
            waitFor(preSpawnTime),
            OpaqueSpawner.spawn(cellInstance, spawnDuration)
          )
        );
      }
      yield* all(...toSpawn);
    }
  }

  public *resizeLibrary(percentage: number = 1, duration: number = 1) {
    const books = this.shelf
      .iterate()
      .map((c) => c())
      .filter((cell) => cell instanceof Icon);

    const booksCount = books.length;
    const booksToShow = Math.floor(booksCount * percentage);
    const howManyToHide = booksCount - booksToShow;
    const diffShow = howManyToHide - this.hiddenBooks.length;
    let counter = 0;
    let timePerSpawn = duration / Math.abs(diffShow);
    debug(`BookCount: ${booksCount}`);
    debug(`HiddenBooks: ${this.hiddenBooks.length}`);
    debug(`BooksToShow: ${booksToShow}`);
    debug(`DiffShow: ${diffShow}`);

    while (counter < Math.abs(diffShow)) {
      const i = this.random.nextInt(0, books.length);
      const book = books[i];
      const index = this.hiddenBooks.indexOf(i);
      const isHidden = index !== -1;
      if (isHidden && diffShow < 0) {
        yield* OpaqueSpawner.spawn(book, timePerSpawn);
        this.hiddenBooks.splice(index, 1);
        counter++;
      } else if (!isHidden && diffShow > 0) {
        yield* OpaqueSpawner.despawn(book, timePerSpawn);
        this.hiddenBooks.push(i);
        counter++;
      }
      if (counter === Math.abs(diffShow)) {
        break;
      }
    }
  }
}
