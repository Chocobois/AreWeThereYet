import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Timer } from "./Timer";

export class GreenEgg extends Timer {
	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y, "timer_green_egg");

		this.shadow.y = 10;
		this.shadow.setScale(240 / this.shadow.width);
	}

	calculateSound(ps: number, rs: number): void {
		const cantick =
		Math.floor(rs) != Math.floor(ps);

		if (cantick) {
			this.scene.sound.play("eggtick", {volume: 3*this.scene.SFXvolume});
		}

	}
}
