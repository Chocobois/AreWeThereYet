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
	private isBusyTurning: boolean = false;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y, "timer_hourglass_5");

		this.shadow.y = 35;
		this.shadow.setScale(280 / this.shadow.width);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		const stage = Math.ceil(
			((TEXTURES.length - 1) * this.remainingSeconds) / MAX_TIME,
		);
		this.image.setTexture(TEXTURES[stage]);
	}

	onClick(pointer: Phaser.Input.Pointer) {
		if (this.isBusyTurning) return;
		this.isBusyTurning = true;

		const duration = 500;
		const offsetY = this.image.y;

		this.bounceTimerText();

		// Lift into air animation
		this.scene.tweens.chain({
			targets: this.image,
			tweens: [
				{
					y: -300,
					duration: (3 / 4) * duration,
					ease: Phaser.Math.Easing.Cubic.Out,
					onComplete: () => {
						this.remainingSeconds = MAX_TIME;
					},
				},
				{
					y: offsetY,
					duration: (1 / 4) * duration,
					ease: Phaser.Math.Easing.Bounce.Out,
				},
			],
		});

		// Spin animation
		this.scene.tweens.addCounter({
			duration: duration,
			ease: Phaser.Math.Easing.Cubic.InOut,
			onUpdate: (tween) => {
				const t = tween.getValue()!;
				this.image.setAngle(360 * t);
			},
			onComplete: (tween) => {
				this.image.setAngle(0);
				this.isBusyTurning = false;
			},
		});
	}
}
