import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Timer } from "./Timer";

const TEXTURES = [
	"timer_hourglass_5",
	"timer_hourglass_4",
	"timer_hourglass_3",
	"timer_hourglass_2",
	"timer_hourglass_1",
];
const MAX_TIME = 60;

export class Hourglass extends Timer {
	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y, "timer_hourglass_5");
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		const stage = Math.ceil(
			((TEXTURES.length - 1) * this.remainingSeconds) / MAX_TIME,
		);
		this.image.setTexture(TEXTURES[stage]);
	}

	onClick(pointer: Phaser.Input.Pointer) {
		this.remainingSeconds = MAX_TIME;

		this.bounceTimer();
		this.bounceTimerText();

		// this.scene.tweens.addCounter({
		// 	ease: Phaser.Math.Easing.Cubic.InOut,
		// 	onUpdate: (tween) => {
		// 		this.image.setAngle(360 * tween.getValue()!);
		// 	},
		// 	onComplete: (tween) => {
		// 		this.image.setAngle(0);
		// 	},
		// });
	}
}
