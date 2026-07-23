import Phaser from "phaser";
import { Order } from "@/components/Order";
import { Timer } from "@/components/Timer";
import { BaseScene } from "@/scenes/BaseScene";

export class GameScene extends BaseScene {
	private background: Phaser.GameObjects.Image;

	private timers: Timer[];
	private orders: Order[];

	// Locations to place the order bubbles
	private slots: { order: Order | null; x: number; y: number }[] = [
		{ order: null, x: 175, y: 200 },
		{ order: null, x: 175, y: 500 },
		{ order: null, x: 175, y: 800 },
		{ order: null, x: 1920 - 175, y: 200 },
		{ order: null, x: 1920 - 175, y: 500 },
		{ order: null, x: 1920 - 175, y: 800 },
	];

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

		// Endlessly looping gameplay
		const loop = setInterval(() => {
			this.newOrder();
		}, 15000);
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			clearInterval(loop);
		});
	}

	update(time: number, delta: number) {
		this.timers.forEach((timer) => {
			timer.update(time, delta);
			timer.setDepth(10 + timer.y / 1000)
		});
		this.orders.forEach((order) => {
			order.update(time, delta);
			order.setDepth(20);
		});
	}

	/* Orders */

	newOrder() {
		Phaser.Math.RND.shuffle(this.slots);
		const slot = this.slots.find((slot) => !slot.order);
		if (!slot) return;

		const image = Phaser.Math.RND.pick([
			"broccoli",
			"eggplant",
			"meat",
			"pot",
			"steak",
		]);
		const seconds = Phaser.Math.RND.pick([5, 15, 30, 45, 60, 90]);

		const order = new Order(this, slot.x, slot.y, image, seconds);
		slot.order = order;
		this.orders.push(order);

		// On clicking the bubble (after accepting)
		order.on("remove", () => {
			this.completeOrder(order);
		});
	}

	completeOrder(order: Order) {
		const slot = this.slots.find((s) => s.order === order);
		if (slot) {
			slot.order = null;
		}

		this.orders = this.orders.filter((o) => o !== order);

		order.destroy();
	}
}
