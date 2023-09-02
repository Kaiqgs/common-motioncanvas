import { Random, ThreadGenerator, waitFor } from "@motion-canvas/core";

// complement to all(...) canvas function
export function* each(...items: ThreadGenerator[]) {
  for (const item of items) {
    yield* item;
  }
}

// export function* thread(func: () => ThreadGenerator) {
//   yield* func();
// }

export function complementWait(
  duration: number,
  random: Random
): [number, number] {
  // const wait = random.nextFloat() * duration / 2 + duration / 2;
  const wait = random.nextFloat() * duration;
  const complement = duration - wait;
  return [wait, complement];
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle<T>(rand: Random, array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(rand.nextFloat() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
