import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Timer } from "./Timer";

export class BlueCone extends Timer {
	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y, "timer_blue_cone");

		this.shadow.y = -30;
		this.shadow.setScale(350 / this.shadow.width);
	}
}
