import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Timer } from "./Timer";

export class Golen extends Timer {
	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y, "timer_golen");

		this.image.x = 20;
		this.image.setScale(500 / this.image.width);

		this.shadow.y = 40;
		this.shadow.setScale(260 / this.shadow.width);
	}

	calculateSound(ps: number, rs: number): void {
		const cantick =
		Math.floor(rs) != Math.floor(ps);

		if (cantick) {
			const {volume, pan} = this.getSoundPosition();
			this.scene.sound.play("gsm", {
				volume: volume * 3*this.scene.SFXvolume,
				pan,
			});
		}

	}
}
