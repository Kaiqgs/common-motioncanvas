import { Vector2 } from "@motion-canvas/core";

export  function computeLight(a: Vector2, b: Vector2, amount: number): Vector2 {
	const dir = b.sub(a);
	const len = dir.magnitude;
	return dir.div(len).mul(amount);
}
