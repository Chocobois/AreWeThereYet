import Phaser from "phaser";
import { Order } from "@/components/Order";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";
import { Hourglass } from "@/components/timers/Hourglass";
import { GreenEgg } from "@/components/timers/GreenEgg";
import { BlueCone } from "@/components/timers/BlueCone";
import { Golen } from "@/components/timers/Golen";

export class GameScene extends BaseScene {
	private background: Phaser.GameObjects.Image;

	private timers: Timer[];
	private orders: Order[];

	private totalScore: number;
	private scoreText: Phaser.GameObjects.Text;

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
		this.timers.push(new GreenEgg(this, 600, 1000));
		this.timers.push(new Golen(this, 1000, 900));
		this.timers.push(new BlueCone(this, 1400, 1000));
		this.timers.push(new Hourglass(this, 1000, 900));

		this.orders = [];
		this.newOrder();

		this.totalScore = 0;
		this.scoreText = this.addText({
			x: this.CX,
			y: 0,
			size: 48,
			text: "Score: 0",
		});
		this.scoreText.setStroke("black", 16);
		this.scoreText.setOrigin(0.5, 0);

		// Endlessly looping gameplay
		this.time.addEvent({
			delay: 7500,
			loop: true,
			callback: () => {
				// Allow a maximum of 2 pending orders
				const pendingOrders = this.orders.filter((order) => !order.accepted);
				if (pendingOrders.length <= 1) {
					this.newOrder();
				}
			},
			callbackScope: this,
		});
	}

	update(time: number, delta: number) {
		this.timers.forEach((timer) => {
			timer.update(time, delta);
			timer.setDepth(10 + timer.y / 1000);
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
		const seconds = Phaser.Math.RND.pick([
			5, 10, 10, 10, 15, 20, 20, 20, 30, 30, 30, 40, 40, 50, 60,
		]);

		const order = new Order(this, slot.x, slot.y, image, seconds);
		slot.order = order;
		this.orders.push(order);

		// On clicking the bubble (after accepting)
		order.on("remove", () => {
			this.completeOrder(order);
		});

		// On completing or failing an order
		order.on("score", (score: number) => {
			this.totalScore += score;
			this.scoreText.setText(`Score: ${this.totalScore}`);
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
