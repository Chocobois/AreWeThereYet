import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";

export class Button extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	// private hover: boolean;
	private _hold: boolean;
	private _drag: boolean;
	protected blocked: boolean;
	public liftSmooth: number;
	public holdSmooth: number;
	public dragSmooth: number;
	private dragStart = new Phaser.Math.Vector2();
	public category: number;
	public aliveValue: number;
	private holdTween: Phaser.Tweens.Tween;
	private dragTween: Phaser.Tweens.Tween;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene = scene;
		scene.add.existing(this);

		// this.hover = false;
		this._hold = false;
		this._drag = false;
		this.blocked = false;

		this.liftSmooth = 0;
		this.holdSmooth = 0;
		this.dragSmooth = 0;
		this.aliveValue = 0;
	}

	bindInteractive(
		gameObject: Phaser.GameObjects.GameObject,
		draggable = false,
	) {
		gameObject.removeInteractive();
		gameObject
			.setInteractive({ useHandCursor: true, draggable: draggable })
			.on("pointerout", this.onOut, this)
			.on("pointerover", this.onOver, this)
			.on("pointerdown", this.onDown, this)
			.on("pointerup", this.onUp, this)
			.on("dragstart", this.onDragStart, this)
			.on("drag", this.onDrag, this)
			.on("dragend", this.onDragEnd, this);
		return gameObject;
	}

	public get hold(): boolean {
		return this._hold;
	}

	set hold(value: boolean) {
		if (value != this._hold) {
			if (this.holdTween) {
				this.holdTween.stop();
			}
			if (value) {
				this.holdTween = this.scene.tweens.add({
					targets: this,
					holdSmooth: { from: 0.0, to: 1.0 },
					ease: "Cubic.Out",
					duration: 100,
				});
			} else {
				this.holdTween = this.scene.tweens.add({
					targets: this,
					holdSmooth: { from: 1.0, to: 0.0 },
					ease: (v: number) => {
						return Phaser.Math.Easing.Elastic.Out(v, 1.5, 0.5);
					},
					duration: 500,
				});
			}
		}

		this._hold = value;
	}

	public get drag(): boolean {
		return this._drag;
	}

	set drag(value: boolean) {
		if (value != this._drag) {
			if (this.dragTween) {
				this.dragTween.stop();
			}
			if (value) {
				this.dragTween = this.scene.tweens.add({
					targets: this,
					dragSmooth: { from: 0.0, to: 1.0 },
					ease: "Cubic.Out",
					duration: 200,
				});
			} else {
				this.dragTween = this.scene.tweens.add({
					targets: this,
					dragSmooth: { from: 1.0, to: 0.0 },
					ease: "Bounce.Out",
					duration: 300,
				});
			}
		}

		this._drag = value;
	}

	onOut(pointer: Phaser.Input.Pointer, event: Phaser.Types.Input.EventData) {
		// this.hover = false;
		this.hold = false;
		this.drag = false;
	}

	onOver(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	) {
		// this.hover = true;
	}

	onDown(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	) {
		this.hold = true;
		this.blocked = false;
	}

	onUp(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	) {
		if (this.hold && !this.drag && !this.blocked) {
			this.emit("click", pointer);
		}
		this.hold = false;
	}

	onDragStart(
		pointer: Phaser.Input.Pointer,
		dragX: number,
		dragY: number,
	): void {
		this.drag = false;
		this.dragStart.set(pointer.x, pointer.y);
	}

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		const distance = Phaser.Math.Distance.BetweenPoints(
			pointer,
			this.dragStart,
		);
		if (distance > 64) {
			this.drag = true;
			this.hold = false;
		}
	}

	onDragEnd(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
		this.drag = false;
	}

	isInsidePlayingField(): boolean {
		return false;
	}

	block() {
		this.blocked = true;
	}
}
