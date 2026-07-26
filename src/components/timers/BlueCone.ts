import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Timer } from "./Timer";

export class BlueCone extends Timer {
	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y, "timer_blue_cone");

		this.shadow.y = -30;
		this.shadow.setScale(350 / this.shadow.width);
	}

	calculateSound(ps: number, rs: number): void {
		const cantick =
		Math.floor(rs) != Math.floor(ps);

		if (cantick) {
			const {volume, pan} = this.getSoundPosition();
			this.scene.sound.play("rattle", {
				volume: volume * 3*this.scene.SFXvolume,
				pan,
			});
		}

	}
}
