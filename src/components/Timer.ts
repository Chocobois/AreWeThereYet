import Phaser from "phaser";
import { GameScene } from "@/scenes/GameScene";
import { Button } from "./Button";

export class Timer extends Button {
	public scene: GameScene;

	private shadow: Phaser.GameObjects.Image;
	private image: Phaser.GameObjects.Image;
	private text: Phaser.GameObjects.Text;

	private time: number = 0;

	constructor(scene: GameScene, x: number, y: number, spriteKey: string) {
		super(scene, x, y);
		scene.add.existing(this);
		this.scene = scene;

		this.shadow = scene.add.image(0, -100, "shadow");
		this.shadow.setAlpha(0.3);
		this.shadow.setScale(250 / this.shadow.width);
		this.add(this.shadow);

		this.image = scene.add.image(0, 0, spriteKey);
		this.image.setOrigin(0.5, 1.0);
		this.image.setScale(400 / this.image.width);
		this.add(this.image);

		this.bindInteractive(this.image, true);

		this.text = scene.addText({ x: 0, y: -40, size: 48, text: "00:00" });
		this.text.setOrigin(0.5);
		this.text.setStroke("black", 16);
		this.add(this.text);
	}

	update(time: number, delta: number) {
		const scale = 400 / this.image.width;
		const squish = 0.1 * this.holdSmooth;
		this.image.setScale(scale + squish, scale - squish);

		this.time = Math.max(0, this.time - delta / 1000);
		this.text.setText(this.formatTime());
	}

	onDown(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	): void {
		super.onDown(pointer, localX, localY, event);

		this.time += 15;
		this.time = Math.ceil(this.time);

		this.scene.tweens.add({
			targets: this.text,
			scaleX: { from: 1.5, to: 1 },
			scaleY: { from: 1.5, to: 1 },
			ease: Phaser.Math.Easing.Back.Out,
			duration: 200,
		});
	}

	formatTime(): string {
		const minutes = Math.floor(Math.ceil(this.time) / 60);
		const seconds = Math.ceil(this.time) % 60;

		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}
}
