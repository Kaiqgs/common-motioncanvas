import { makeProject } from "@motion-canvas/core";

import "./global.css";


import audio from "../audios/audio.mp3";
import base  from "./scenes/base?scene";

let selected = [base];

export default makeProject({
  scenes: selected,
  audio: audio,
});
