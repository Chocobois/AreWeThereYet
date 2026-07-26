import Phaser from "phaser";
import { GameScene } from "@/scenes/GameScene";
import { Button } from "./Button";
import { Color } from "@/util/colors";
import { interpolateColor } from "@/util/functions";

const SIZE = 350;

export class Order extends Button {
	public scene: GameScene;

	public accepted: boolean = false;
	public completed: boolean = false;
	private requestedSeconds: number;
	private remainingSeconds: number;
	private premium: boolean;

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
		premium: boolean = false,
	) {
		super(scene, x, y);
		scene.add.existing(this);
		this.scene = scene;
		this.requestedSeconds = seconds;
		this.remainingSeconds = 30 - this.scene.orderExpiryAccel;

		/* Sprites */

		const flipped = x > scene.CX;

		this.squishContainer = scene.add.container();
		this.add(this.squishContainer);
		this.premium = premium;
		if(!premium){
			this.bubble = scene.add.image(0, 0, "bubble");
		} else {
			this.bubble = scene.add.image(0, 0, "bubble_p");
		}

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

	decrementTime() {
		const prevSeconds = this.remainingSeconds;
		this.remainingSeconds--;

		if (!this.accepted && !this.completed) {
			if (this.remainingSeconds < 0) {
				this.completed = true;
				this.scene.sound.play("expire", {volume: 3*this.scene.SFXvolume});
				this.failOrder("ok nvm");
			} else if (this.remainingSeconds <= 5) {
				this.flashWarning();
			}
		}

				if (this.accepted && !this.completed) {
			if (this.remainingSeconds < -30) {
				this.completed = true;
				this.scene.sound.play("terrible", {volume: 0.5*this.scene.SFXvolume});
				this.failOrder("Ashes...");
			} else if (this.remainingSeconds <= -25 ) {
				this.flashWarning();
			}
		}
	};

	acceptOrder() {
		this.remainingSeconds = this.requestedSeconds;
		this.text.setText(this.formatTime(this.requestedSeconds));
		this.pill.setTint(Color.Blue600);
		this.scene.sound.play("tooltip", {volume: 3*this.scene.SFXvolume});
	}

	completeOrder() {
		const distance = Math.round(Math.abs(this.remainingSeconds));
		if(this.premium){
			if(distance < 2){
				this.pill.setTint(Color.Cyan500);
				this.text.setText("Perfect!");
				this.scene.sound.play("perfect", {volume: 0.75*this.scene.SFXvolume});
				this.emit("score", 100);
			} else {
				this.pill.setTint(Color.Red700);
				this.scene.sound.play("terrible", {volume: 0.5*this.scene.SFXvolume});
				if(this.remainingSeconds > 0){
					this.text.setText("Raw...");
				} else {
					this.text.setText("Burnt...");
				}

				this.emit("score", Math.trunc(-200*this.scene.multiplier));
			}
		} else {
			this.evaluateCompletion(distance);
		}

		// Debug
		//this.debugText.setVisible(true);
		//this.debugText.setText(`${distance} second${distance != 1 ? "s" : ""} off`);

		this.scene.addEvent(2000, this.moveOffscreen, this);
	}

	evaluateCompletion(d: number){
		if (d < 2) {
			this.pill.setTint(Color.Cyan500);
			this.text.setText("Perfect!");
			this.scene.sound.play("perfect", {volume: 0.75*this.scene.SFXvolume});
			this.emit("score", 100);
		} else if (d < 5) {
			this.pill.setTint(Color.Green600);
			this.text.setText("Good");
			this.scene.sound.play("ok", {volume: 0.75*this.scene.SFXvolume});
			this.emit("score", 50);
		} else if (d < 10) {
			this.pill.setTint(Color.Amber600);
			this.scene.sound.play("bad", {volume: 0.5*this.scene.SFXvolume});
			this.text.setText("Bad");
			this.emit("score", Math.trunc(-10*this.scene.multiplier));
		} else {
			this.pill.setTint(Color.Red700);
			this.scene.sound.play("terrible", {volume: 0.5*this.scene.SFXvolume});
			if(this.remainingSeconds > 0){
				this.text.setText("Raw...");
			} else {
				this.text.setText("Burnt...");
			}
			this.emit("score", Math.trunc(-50*this.scene.multiplier));
		}
		
	}

	failOrder(text: string) {
		this.pill.setTint(Color.Red600);
		this.text.setText(text);

		this.scene.addEvent(2000, this.moveOffscreen, this);
		this.emit("score", Math.trunc(-100*this.scene.multiplier));
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
