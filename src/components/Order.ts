import Phaser from "phaser";
import { GameScene } from "@/scenes/GameScene";
import { Button } from "./Button";
import { Color } from "@/util/colors";

const SIZE = 350;

export class Order extends Button {
	public scene: GameScene;

	private accepted: boolean = false;
	private requestedSeconds: number;
	private remainingSeconds: number;

	private squishContainer: Phaser.GameObjects.Container;
	private bubble: Phaser.GameObjects.Image;
	private food: Phaser.GameObjects.Image;

	private pill: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;
	private debugText: Phaser.GameObjects.Text;

	constructor(
		scene: GameScene,
		x: number,
		y: number,
		image: string,
		seconds: number,
	) {
		super(scene, x, y);
		scene.add.existing(this);
		this.scene = scene;
		this.requestedSeconds = seconds;
		this.remainingSeconds = seconds;

		/* Sprites */

		const flipped = x > scene.CX;

		this.squishContainer = scene.add.container();
		this.add(this.squishContainer);

		this.bubble = scene.add.image(0, 0, "bubble");
		this.bubble.setScale(SIZE / this.bubble.width);
		this.bubble.setFlipX(flipped);
		this.squishContainer.add(this.bubble);

		this.food = scene.add.image(0, 0, image);
		this.food.setScale(SIZE / 2 / this.food.width);
		this.squishContainer.add(this.food);

		/* Minute timer */

		const pillX = (flipped ? -1 : 1) * 140;
		const pillY = -100;

		this.pill = scene.add.image(pillX, pillY, "pill");
		this.pill.setScale(200 / this.pill.width);
		this.pill.setTint(0x888888);
		this.add(this.pill);

		this.bindInteractive(this.bubble);

		this.text = scene.addText({
			x: pillX,
			y: pillY,
			size: 40,
			text: this.formatTime(this.requestedSeconds) + "?",
		});
		this.text.setOrigin(0.5);
		this.add(this.text);

		this.debugText = scene.addText({
			x: pillX,
			y: pillY + 60,
			size: 32,
			text: "Debug text",
			color: "black",
		});
		this.debugText.setStroke("white", 8);
		this.debugText.setOrigin(0.5);
		this.debugText.setVisible(false);
		this.add(this.debugText);
	}

	update(time: number, delta: number) {
		let squish = 0.1 * this.holdSmooth;
		if (this.accepted) {
			squish += 0.03 * Math.sin(time / 300);
		}
		this.squishContainer.setScale(1 + squish, 1 - squish);

		if (this.accepted) {
			this.remainingSeconds -= delta / 1000;
		}
	}

	onDown(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	): void {
		super.onDown(pointer, localX, localY, event);

		// Accept order
		if (!this.accepted) {
			this.accepted = true;
			this.text.setText(this.formatTime(this.requestedSeconds));
			this.pill.setTint(0x229900);
		}
		// Complete order
		else {
			const distance = Math.round(Math.abs(this.remainingSeconds));

			if (distance == 0) {
				this.pill.setTint(Color.Cyan500);
				this.text.setText("Perfect");
			} else if (distance < 3) {
				this.pill.setTint(Color.Green600);
				this.text.setText("Good");
			} else if (distance < 10) {
				this.pill.setTint(Color.Amber600);
				this.text.setText("Bad");
			} else {
				this.pill.setTint(Color.Red700);
				this.text.setText("Terrible");
			}

			// Debug
			this.debugText.setVisible(true);
			this.debugText.setText(`You were ${distance} seconds off!`);

			// Move the bubble offscreen
			this.scene.addEvent(2000, () => {
				const offscreenX = this.x < this.scene.CX ? -500 : this.scene.W + 500;
				this.scene.tweens.add({
					targets: this,
					x: offscreenX,
					ease: Phaser.Math.Easing.Cubic.In,
					onComplete: () => {
						this.emit("complete");
					},
				});
			});
		}
	}

	formatTime(seconds: number) {
		const minutes = Math.floor(seconds / 60);

		if (minutes * 60 == seconds) {
			return `${minutes} min`;
		} else if (seconds < 60) {
			return `${seconds} sec`;
		} else {
			return `${minutes}m ${Math.floor(seconds - minutes * 60)}s`;
		}
	}
}
