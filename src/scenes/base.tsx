import { makeScene2D } from "@motion-canvas/2d";
import * as k from "../../lib/src";
import { waitFor } from "@motion-canvas/core";

export default makeScene2D(function*(view) {
  view.add(
  <>

  </>
  );
  yield* waitFor(7);
});
