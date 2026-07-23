import { Order } from "@/components/Order";
import { Timer } from "@/components/Timer";
import { BaseScene } from "@/scenes/BaseScene";

export class GameScene extends BaseScene {
	private background: Phaser.GameObjects.Image;

	private timers: Timer[];
	private orders: Order[];

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
		this.cameras.main.setBackgroundColor(0xffffff);

		this.background = this.add.image(0, 0, "background");
		this.background.setOrigin(0);
		this.fitToScreen(this.background);

		this.timers = [];
		this.timers.push(new Timer(this, 600, 1000, "timer_1"));
		this.timers.push(new Timer(this, 1000, 900, "timer_2"));
		this.timers.push(new Timer(this, 1400, 1000, "timer_3"));

		this.orders = [];
		this.newOrder();
	}

	update(time: number, delta: number) {
		this.timers.forEach((timer) => timer.update(time, delta));
		this.orders.forEach((order) => order.update(time, delta));
	}

	/* Orders */

	newOrder() {
		const side = Math.random() < 0.5 ? "right" : "left";

		this.orders.push(
			new Order(this, { side, image: "broccoli", minutes: 5 }),
		);
	}
}
