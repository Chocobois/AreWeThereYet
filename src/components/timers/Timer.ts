import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "../Button";
import { formatTime } from "@/util/format";

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

	protected scaleCont: Phaser.GameObjects.Container; // For scaling image + shadow
	protected shadow: Phaser.GameObjects.Image; // Set by children
	protected squishCont: Phaser.GameObjects.Container; // For squishing image
	protected image: Phaser.GameObjects.Image;
	protected text: Phaser.GameObjects.Text;

	constructor(scene: BaseScene, x: number, y: number, spriteKey: string) {
		super(scene, x, y);
		scene.add.existing(this);
		this.scene = scene;

		this.scaleCont = scene.add.container();
		this.add(this.scaleCont);

		this.shadow = scene.add.image(0, 0, "shadow");
		this.shadow.setAlpha(0.3);
		this.shadow.setScale(250 / this.shadow.width);
		this.scaleCont.add(this.shadow);

		this.squishCont = scene.add.container(0, 0);
		this.scaleCont.add(this.squishCont);

		this.image = scene.add.image(0, -120, spriteKey);
		this.image.setScale(400 / this.image.width);
		this.squishCont.add(this.image);

		this.bindInteractive(this.image, true);
		this.on("click", this.onClick, this);

		this.text = scene.addText({ x: 0, y: 60, size: 48, text: "00:00" });
		this.text.setOrigin(0.5);
		this.text.setStroke("black", 16);
		this.add(this.text);
	}

	update(time: number, delta: number) {
		// Scale larger near bottom of screen
		const scale = (1.1 * this.y) / this.scene.H;
		this.scaleCont.setScale(scale, scale);

		// Squish image
		const squish = 0.1 * this.holdSmooth;
		this.squishCont.setScale(1 + squish, 1 - squish);
		this.squishCont.y = -100 * this.dragSmooth;

		const prevSeconds = this.remainingSeconds;
		// this.remainingSeconds = Math.max(0, this.remainingSeconds - delta / 1000);
	
		const justHitNewSecond =
			Math.floor(this.remainingSeconds) != Math.floor(prevSeconds);

	}

	calculateSound(ps: number, rs: number){
		
	}

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		super.onDrag(pointer, dragX, dragY);

		const TOP = 450;
		const BOTTOM = 900;

		if (this.drag) {
			this.x = Phaser.Math.Clamp(pointer.x, 400, this.scene.W - 400);
			this.y = Phaser.Math.Clamp(pointer.y, TOP, BOTTOM);
		}
	}

	onClick(pointer: Phaser.Input.Pointer) {
		this.remainingSeconds += pointer.button != 0 ? -10 : 10;
		this.remainingSeconds = Math.max(0, Math.ceil(this.remainingSeconds));

		this.text.setText(formatTime(this.remainingSeconds));
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

	decrementTime() {
		this.text.setText(formatTime(this.remainingSeconds));
		// Time switches to a new second
		this.bounceTimerText(1.1);

		const prevSeconds = this.remainingSeconds;
		if(this.remainingSeconds > 0) {
			this.remainingSeconds--;
			this.scene.tweens.add({
					targets: this,
					scaleY: { from: 1, to: 0.9 },
					scaleX: { from: 1, to: 1.1 },
					duration: 50,
					ease: 'Cubic.Out',
					yoyo: true,
				});
		}
		this.calculateSound(prevSeconds, this.remainingSeconds);
		// Timer reaches zero
		if (this.remainingSeconds == 0 && prevSeconds > 0) {
			this.flashTimer();
		}
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

	getSoundPosition() {
		return {
			volume: Phaser.Math.Clamp((this.y / this.scene.H * 1.2), 0.6, 1),
			pan: Phaser.Math.Interpolation.Linear([-1, 1], this.x / this.scene.W),
		};
	}
}
