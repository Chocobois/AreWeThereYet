import Phaser from "phaser";
import { GameScene } from "@/scenes/GameScene";
import { Button } from "./Button";
import { Color } from "@/util/colors";
import { interpolateColor } from "@/util/functions";

const SIZE = 350;

export class Order extends Button {
	public scene: GameScene;

	private accepted: boolean = false;
	private completed: boolean = false;
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
		this.remainingSeconds = 30;

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
		// Silly squishing animation if the request has been accepted
		let squish = 0.1 * this.holdSmooth;
		if (this.accepted) {
			squish += 0.03 * Math.sin(time / 300);
		}
		this.squishContainer.setScale(1 + squish, 1 - squish);

		// Count down
		const prevSeconds = this.remainingSeconds;
		this.remainingSeconds -= delta / 1000;
		const justHitNewSecond =
			Math.floor(this.remainingSeconds) != Math.floor(prevSeconds);

		// Too long to accept order
		if (!this.accepted && !this.completed) {
			if (this.remainingSeconds < 0) {
				this.completed = true;
				this.failOrder("ok nvm");
			} else if (this.remainingSeconds <= 5 && justHitNewSecond) {
				this.flashWarning();
			}
		}

		// Too long to complete order (food burned)
		if (this.accepted && !this.completed) {
			if (this.remainingSeconds < -30) {
				this.completed = true;
				this.failOrder("burned");
			} else if (this.remainingSeconds <= -25 && justHitNewSecond) {
				this.flashWarning();
			}
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
		if (!this.accepted && !this.completed) {
			this.accepted = true;
			this.acceptOrder();
		}
		// Complete order
		else if (!this.completed) {
			this.completed = true;
			this.completeOrder();
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

	acceptOrder() {
		this.remainingSeconds = this.requestedSeconds;
		this.text.setText(this.formatTime(this.requestedSeconds));
		this.pill.setTint(Color.Blue600);
	}

	completeOrder() {
		const distance = Math.round(Math.abs(this.remainingSeconds));
		if (distance < 2) {
			this.pill.setTint(Color.Cyan500);
			this.text.setText("Perfect");
			this.emit("score", 100);
		} else if (distance < 5) {
			this.pill.setTint(Color.Green600);
			this.text.setText("Good");
			this.emit("score", 50);
		} else if (distance < 10) {
			this.pill.setTint(Color.Amber600);
			this.text.setText("Bad");
			this.emit("score", 20);
		} else {
			this.pill.setTint(Color.Red700);
			this.text.setText("Terrible");
			this.emit("score", -50);
		}

		// Debug
		this.debugText.setVisible(true);
		this.debugText.setText(`${distance} second${distance != 1 ? "s" : ""} off`);

		this.scene.addEvent(2000, this.moveOffscreen, this);
	}

	failOrder(text: string) {
		this.pill.setTint(Color.Red600);
		this.text.setText(text);

		this.scene.addEvent(2000, this.moveOffscreen, this);

		this.emit("score", -100);
	}

	flashWarning() {
		this.scene.tweens.addCounter({
			ease: Phaser.Math.Easing.Cubic.Out,
			duration: 1000,
			onUpdate: (tween) => {
				const t = tween.getValue()!;
				this.text.setTint(interpolateColor(0xff0000, 0xffffff, t));
			},
			onComplete: () => {
				this.text.setTint(0xffffff);
			},
		});
	}

	moveOffscreen() {
		const offscreenX = this.x < this.scene.CX ? -500 : this.scene.W + 500;

		this.scene.tweens.add({
			targets: this,
			x: offscreenX,
			ease: Phaser.Math.Easing.Cubic.In,
			onComplete: () => {
				this.emit("remove");
			},
		});
	}
}
