import Phaser from "phaser";
import { GameScene } from "@/scenes/GameScene";
import { Button } from "./Button";

const SIZE = 350;

export interface OrderConfig {
	side: "left" | "right";
	image: "broccoli" | "eggplant" | "meat" | "pot" | "steak";
	minutes: number;
}

export class Order extends Button {
	public scene: GameScene;

	private squishContainer: Phaser.GameObjects.Container;
	private bubble: Phaser.GameObjects.Image;
	private food: Phaser.GameObjects.Image;

	private pill: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;

	constructor(scene: GameScene, config: OrderConfig) {
		super(scene, 0, 0);
		scene.add.existing(this);
		this.scene = scene;

		/* Sprites */

		const flipped = config.side == "right";

		this.squishContainer = scene.add.container();
		this.add(this.squishContainer);

		this.bubble = scene.add.image(0, 0, "bubble");
		this.bubble.setScale(SIZE / this.bubble.width);
		this.bubble.setFlipX(flipped);
		this.squishContainer.add(this.bubble);

		this.food = scene.add.image(0, 0, config.image);
		this.food.setScale(SIZE / 2 / this.food.width);
		this.squishContainer.add(this.food);

		/* Minute timer */

		const pillX = (flipped ? -1 : 1) * 140;
		const pillY = -100;

		this.pill = scene.add.image(pillX, pillY, "pill");
		this.pill.setScale(200 / this.pill.width);
		this.add(this.pill);

		this.bindInteractive(this.bubble);

		this.text = scene.addText({
			x: pillX,
			y: pillY,
			size: 40,
			text: "5 min",
		});
		this.text.setOrigin(0.5);
		this.add(this.text);
	}

	update(time: number, delta: number) {
		const squish = 0.1 * this.holdSmooth;
		this.squishContainer.setScale(1 + squish, 1 - squish);
	}

	onDown(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	): void {
		super.onDown(pointer, localX, localY, event);
	}
}
