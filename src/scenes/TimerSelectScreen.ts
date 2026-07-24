import Phaser from "phaser";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";

export class TimerSelectScene extends BaseScene {
	private background: Phaser.GameObjects.Image;
	private shopkeep: Phaser.GameObjects.Image;
	private box: Phaser.GameObjects.Image;

	private totalScore: number;
	private scoreText: Phaser.GameObjects.Text;

    private phaseTimer: number = 1000;


	constructor() {
		super({ key: "TimerSelectScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
		this.cameras.main.setBackgroundColor(0xffffff);

		this.background = this.add.image(0, 0, "transitionbkg");
		this.background.setOrigin(0);
        this.background.setDepth(1);
        this.fitToScreen(this.background);

        this.shopkeep = this.add.image(0, 0, "shopkeep");
		this.shopkeep.setOrigin(0);
        this.shopkeep.setDepth(2);
        this.fitToScreen(this.shopkeep);

        this.box = this.add.image(0, 0, "timerbox");
		this.box.setOrigin(0);
        this.box.setDepth(1);
        this.fitToScreen(this.box);

	}

	update(time: number, delta: number) {

	}

	/* Orders */

}
