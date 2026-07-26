import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";
import { Music } from "@/components/Music";

import { title, version } from "@/version.json";
import StartButton from '@/components/buttons/StartButton';
import { SetEndless } from "@/components/Stages";

const creditsLeft = `
@NightLightLumie
@Golenchu
@ArcticFqx
@MatoCookies
Clover
`;

const creditsRight = `
Code and art
Code
Code and voice
Music and code
Music
`;

export class TitleScene extends BaseScene {
	public sky: Phaser.GameObjects.Image;
	public background: Phaser.GameObjects.Image;
	public foreground: Phaser.GameObjects.Image;
	public character: Phaser.GameObjects.Image;
	public overlay: Phaser.GameObjects.Image;
	public credits: Phaser.GameObjects.Container;
	public title: Phaser.GameObjects.Text;
	public subtitle: Phaser.GameObjects.Text;
	public tap: Phaser.GameObjects.Text;
	public version: Phaser.GameObjects.Text;
	private sTimer: number;

	public musicTitle: Phaser.Sound.WebAudioSound;
	public select: Phaser.Sound.WebAudioSound;

	public modeStory: StartButton;
	public modeEndless: StartButton;

	public isStarting: boolean;

	public hasFlash: boolean;

	constructor() {
		super({ key: "TitleScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
		this.hasFlash = false;
		this.sTimer = 1000000;
		this.sky = this.add.image(this.CX, this.CY, "kprebkg");
		this.containToScreen(this.sky);
		this.background = this.add.image(
			this.CX,
			0.9 * this.CY,
			"kbkg"
		);
		this.containToScreen(this.background);
		this.foreground = this.add.image(this.CX, this.CY, "kbun");
		this.containToScreen(this.foreground);
		//this.character = this.add.image(this.CX, this.CY, "kbun");
		//this.containToScreen(this.character);

		this.overlay = this.add.image(this.CX, this.CY, "kchar");
		this.containToScreen(this.overlay);
		this.overlay.setVisible(false);

		this.background.setVisible(false);
		this.background.setAlpha(0);
		this.background.y += 4000;
		this.foreground.y += 1050;
		//this.character.y += 1000;

		this.title = this.addText({
			x: 80,
			y: 0.87 * this.H,
			size: 160,
			color: "#FFF",
			text: title,
		});
		this.title.setOrigin(0, 0.5);
		this.title.setStroke("#000", 8);
		this.title.setPadding(2);
		this.title.setVisible(false);
		this.title.setAlpha(0);

		this.subtitle = this.addText({
			x: 0.135 * this.W,
			y: 0.35 * this.H,
			size: 75,
			color: "#FFF",
			text: "Tap to start",
		});
		this.subtitle.setOrigin(0.5, 0.5);
		this.subtitle.setStroke("#000", 6);
		this.subtitle.setPadding(2);
		this.subtitle.setVisible(false);
		this.subtitle.setAlpha(0);

		this.tap = this.addText({
			x: this.CX,
			y: this.CY,
			size: 140,
			color: "#FFF",
			text: "Tap to focus",
		});
		this.tap.setOrigin(0.5);
		this.tap.setAlpha(-1);
		this.tap.setStroke("#000", 4);
		this.tap.setPadding(2);

		this.version = this.addText({
			x: this.W,
			y: 0,
			size: 40,
			color: "#FFF",
			text: version,
		});
		this.version.setOrigin(1, 0);
		this.version.setAlpha(-1);
		this.version.setStroke("#000", 4);
		this.version.setPadding(2);

		this.credits = this.add.container(0, 0);
		this.credits.setVisible(false);
		this.credits.setAlpha(0);

		let credits1 = this.addText({
			x: 0.01 * this.W,
			y: 0,
			size: 40,
			color: "#c2185b",
			text: creditsLeft,
		});
		credits1.setStroke("#FFF", 10);
		credits1.setPadding(2);
		credits1.setLineSpacing(0);
		this.credits.add(credits1);

		let credits2 = this.addText({
			x: 0.23 * this.W,
			y: 0,
			size: 40,
			color: "#c2185b",
			text: creditsRight,
		});
		credits2.setStroke("#FFF", 10);
		credits2.setPadding(2);
		credits2.setLineSpacing(0);
		this.credits.add(credits2);

		// Music
		if (!this.musicTitle) {
			this.musicTitle = new Music(this, "m_kitchentimer_title", { volume: 0.4 });
			this.musicTitle.on("bar", this.onBar, this);
			this.musicTitle.on("beat", this.onBeat, this);

			// this.select = this.sound.add("dayShift", { volume: 0.8, rate: 1.0 }) as Phaser.Sound.WebAudioSound;
		}
		this.musicTitle.play();

		this.modeStory = new StartButton(this, this.W * 0.2, this.H * 0.5, "Story mode", 2.5);
		this.modeStory.setVisible(false);
		this.modeStory.on("click", () => this.startGame(0));
		this.modeStory.setScale(4, 1);
		this.modeStory.setAlpha(0);

		this.modeEndless = new StartButton(this, this.W * 0.2, this.H * 0.64, "Endless mode", 2.5);
		this.modeEndless.setVisible(false);
		this.modeEndless.on("click", () => this.startGame(1));
		this.modeEndless.setScale(4, 1);
		this.modeStory.setAlpha(0);


		// Input

		this.input.keyboard
			?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
			.on("down", this.progress, this);
		this.input.on(
			"pointerdown",
			(pointer: PointerEvent) => {
				if (pointer.button == 0) {
					this.progress();
				}
			},
			this
		);
		this.isStarting = false;
	}

	update(time: number, delta: number) {
		if (this.background.visible) {
			this.background.y += 0.02 * (this.CY - this.background.y);
			this.foreground.y += 0.025 * (this.CY - this.foreground.y);
			//this.character.y += 0.02 * (this.CY - this.character.y);

			this.background.alpha += 0.03 * (1 - this.background.alpha);
			this.overlay.scaleY = 1+(0.05*(1+Math.sin((3 * time) / 1000)));
			
			if(this.sTimer > 0){
				this.sTimer -= delta;
			}

			if(!this.hasFlash && (Math.abs(this.CY-this.foreground.y) < 10) ){
				this.hasFlash = true;
				this.flash(3000, 0xffffff, 1);
				this.sTimer = 1000;
				this.sound.play("boom", {volume: 0.25});
				this.background.setTexture("kbkg_exp");
				this.overlay.setVisible(true);
			}
			this.title.alpha +=
				0.02 * ((this.title.visible ? 1 : 0) - this.title.alpha);
			this.subtitle.alpha +=
				0.02 * ((this.subtitle.visible ? 1 : 0) - this.subtitle.alpha);
			this.version.alpha +=
				0.02 * ((this.version.visible ? 1 : 0) - this.version.alpha);

			if (this.credits.visible) {
				this.credits.alpha += 0.02 * (1 - this.credits.alpha);
			}
		} else {
			this.tap.alpha += 0.01 * (1 - this.tap.alpha);

			if (this.musicTitle.seek > 0) {
				this.background.setVisible(true);
				this.tap.setVisible(false);
			}
		}

		this.subtitle.setScale(1 + 0.02 * Math.sin((5 * time) / 1000));

		/* if (this.isStarting) {
			this.subtitle.setAlpha(0.6 + 0.4 * Math.sin((50 * time) / 1000));
		} */
	}

	progress() {
		if (!this.background.visible) {
			this.onBar(1);
		} else if (!this.subtitle.visible) {
			this.title.setVisible(true);
			this.title.setAlpha(1);
			this.subtitle.setVisible(true);
			this.subtitle.setAlpha(1);
		} else if(this.sTimer > 0){
			return;
		} else {
			this.modeStory.setVisible(true);
			this.modeEndless.setVisible(true);
			this.subtitle.setX(-2000);

			this.tweens.add({
				targets: [this.modeStory, this.modeEndless],
				duration: 500,
				alpha: 1,
			});

		}
	}

	onBar(bar: number) {
		if (bar >= 2) {
			this.title.setVisible(true);
		}
		if (bar >= 4) {
			this.subtitle.setVisible(true);
			this.credits.setVisible(true);
		}
	}

	onBeat(time: number) {
		// this.select.play();
	}

	startGame(gamemode: number /* 0=story 1=endless */) {
		if (this.isStarting) return;

		this.sound.play("ding", { volume: 0.18 });
		this.isStarting = true;
		this.flash(3000, 0xffffff, 0.6);

		this.addEvent(1000, () => {
			this.fade(true, 1000, 0x000000);
			this.addEvent(1050, () => {
				this.musicTitle.stop();
				switch(gamemode) {
					default: {
						this.scene.start("StoryScene"); 
						break;	
					} // fall-through
					case 0: {
						this.scene.start("StoryScene"); 
						break;
					}
					case 1: {
						SetEndless();
						this.scene.start("GameScene"); 
						break;
					}
				}
			});
		});
	}
}
