import Phaser from "phaser";
import { Order } from "@/components/Order";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";
import { Hourglass } from "@/components/timers/Hourglass";
import { GreenEgg } from "@/components/timers/GreenEgg";
import { BlueCone } from "@/components/timers/BlueCone";
import { Golen } from "@/components/timers/Golen";

const orderItems = [
	// Temporary: Duplicate entries to increase their odds of appearing
	{ image: "broccoli", seconds: 5 },
	{ image: "broccoli", seconds: 10 },
	{ image: "broccoli", seconds: 10 },
	{ image: "broccoli", seconds: 10 },
	{ image: "eggplant", seconds: 15 },
	{ image: "eggplant", seconds: 20 },
	{ image: "eggplant", seconds: 20 },
	{ image: "eggplant", seconds: 20 },
	{ image: "meat", seconds: 30 },
	{ image: "meat", seconds: 30 },
	{ image: "meat", seconds: 30 },
	{ image: "steak", seconds: 40 },
	{ image: "steak", seconds: 40 },
	{ image: "pot", seconds: 50 },
	{ image: "pot", seconds: 60 },
];

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
		this.timers.push(new GreenEgg(this, 600, 800));
		this.timers.push(new Golen(this, 1000, 700));
		this.timers.push(new BlueCone(this, 1400, 800));
		this.timers.push(new Hourglass(this, 800, 500));

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

		// Select random order item
		const item = Phaser.Math.RND.pick(orderItems);

		const order = new Order(this, slot.x, slot.y, item.image, item.seconds);
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
