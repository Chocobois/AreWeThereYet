import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "../Button";

export const TimerType = {
	GreenEgg: {
		image: "timer_green_egg",
	},
	BlueCone: {
		image: "timer_blue_cone",
	},
	Golen: {
		image: "timer_golen",
	},
	Hourglass: {
		image: "timer_hourglass_1",
	},
} as const;
export type TimerType = keyof typeof TimerType;

export class Timer extends Button {
	public scene: BaseScene;

	protected remainingSeconds: number = 0;

	protected container: Phaser.GameObjects.Container;
	protected shadow: Phaser.GameObjects.Image;
	protected image: Phaser.GameObjects.Image;
	protected text: Phaser.GameObjects.Text;

	constructor(scene: BaseScene, x: number, y: number, spriteKey: string) {
		super(scene, x, y);
		scene.add.existing(this);
		this.scene = scene;

		this.container = scene.add.container();
		this.add(this.container);

		this.shadow = scene.add.image(0, -100, "shadow");
		this.shadow.setAlpha(0.3);
		this.shadow.setScale(250 / this.shadow.width);
		this.container.add(this.shadow);

		this.image = scene.add.image(0, 0, spriteKey);
		this.image.setOrigin(0.5, 1.0);
		this.image.setScale(400 / this.image.width);
		this.container.add(this.image);

		this.bindInteractive(this.image, true);
		this.on("click", this.onClick, this);

		this.text = scene.addText({ x: 0, y: -40, size: 48, text: "00:00" });
		this.text.setOrigin(0.5);
		this.text.setStroke("black", 16);
		this.add(this.text);
	}

	update(time: number, delta: number) {
		const scale = (1.1 * this.y) / this.scene.H; // Larger near bottom of screen
		const squish = 0.1 * this.holdSmooth;
		this.container.setScale(scale * (1 + squish), scale * (1 - squish));
		this.image.y = -100 * this.dragSmooth;

		const prevSeconds = this.remainingSeconds;
		this.remainingSeconds = Math.max(0, this.remainingSeconds - delta / 1000);
		const justHitNewSecond =
			Math.floor(this.remainingSeconds) != Math.floor(prevSeconds);

		this.text.setText(this.formatTime());

		// Time switches to a new second
		if (justHitNewSecond) {
			this.bounceTimerText(1.1);
		}
		// Timer reaches zero
		if (this.remainingSeconds == 0 && prevSeconds > 0) {
			this.flashTimer();
		}
	}

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		super.onDrag(pointer, dragX, dragY);

		if (this.drag) {
			this.x = Phaser.Math.Clamp(pointer.x, 400, this.scene.W - 400);
			this.y = Phaser.Math.Clamp(pointer.y + 100, 500, 1000);
		}
	}

	onClick(pointer: Phaser.Input.Pointer) {
		this.remainingSeconds += pointer.button != 0 ? -10 : 10;
		this.remainingSeconds = Math.ceil(this.remainingSeconds);

		this.bounceTimerText();
	}

	bounceTimer() {
		this.drag = true;
		this.scene.addEvent(200, () => {
			this.drag = false;
		});
	}

	bounceTimerText(strength: number = 1.25) {
		this.scene.tweens.add({
			targets: this.text,
			scaleX: { from: strength, to: 1 },
			scaleY: { from: strength, to: 1 },
			ease: Phaser.Math.Easing.Back.Out,
			duration: 300,
		});
	}

	flashTimer() {
		this.scene.tweens.addCounter({
			duration: 2000,
			onUpdate: (tween) => {
				const blink = Math.floor(10 * tween.getValue()!) % 2 == 0;
				this.text.setTint(blink ? 0xff0000 : 0xffffff);
			},
			onComplete: () => {
				this.text.setTint(0xffffff);
			},
		});

		this.bounceTimer();
		this.bounceTimerText();
	}

	formatTime(): string {
		const minutes = Math.floor(Math.ceil(this.remainingSeconds) / 60);
		const seconds = Math.ceil(this.remainingSeconds) % 60;

		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}
}
