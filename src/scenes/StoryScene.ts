import Phaser from "phaser";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";
import { Music } from "@/components/Music";

export class StoryScene extends BaseScene {
	private background: Phaser.GameObjects.Image;

	private dialogue: Phaser.GameObjects.Text;
	private dialogue2: Phaser.GameObjects.Text;
    private indicator: Phaser.GameObjects.Text;
    private defaultTimer: number = 1000;
    private phaseTimer: number = this.defaultTimer;
    private phase: number = 0;
    private textMode: number = -1;

    public music: Phaser.Sound.WebAudioSound;

	constructor() {
		super({ key: "StoryScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
		this.cameras.main.setBackgroundColor(0xffffff);

		this.background = this.add.image(0, 0, "st1");
		this.background.setOrigin(0);
        this.background.setDepth(1);
        this.fitToScreen(this.background);

        this.music = new Music(this, "m_kitchentimer_side", { volume: 0.25 });
        this.music.on("bar", this.onBar.bind(this));
        this.music.play();

        this.dialogue = this.addText({
			x: 80,
			y: 80,
			size: 60,
			text: "What the heck?! Why is it so much?",
		});
        this.dialogue.setDepth(5);
		this.dialogue.setStroke("black", 16);
		this.dialogue.setOrigin(0, 0);
        this.dialogue.setWordWrapWidth(800);
        this.dialogue.setVisible(true);

        this.dialogue2 = this.addText({
			x: 1060,
			y: 300,
			size: 60,
			text: "",
		});
        this.dialogue2.setDepth(5);
		this.dialogue2.setStroke("black", 16);
		this.dialogue2.setOrigin(0, 0);
        this.dialogue2.setWordWrapWidth(800);
        this.dialogue2.setVisible(true);

        this.indicator = this.addText({
			x: 0,
			y: 0,
			size: 60,
			text: String.fromCharCode(0x2B06),
		});
        this.indicator.setDepth(4);
		this.indicator.setStroke("black", 16);
		this.indicator.setOrigin(0, 0);
        this.indicator.setVisible(true);
        this.indicator.setRotation(Math.PI);
        this.indicator.setAlpha(0);


        this.input.keyboard
        ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        .on("down", this.forward, this);
        this.input.on(
            "pointerdown",
            (pointer: PointerEvent) => {
                if (pointer.button == 0) {
                    this.forward();
                }
            },
        );

	}

    currentText() {
        switch (this.textMode) {
            case 0: return this.dialogue2;
            default: // fall-through
            case 1: return this.dialogue;
        }
    }

    textSize() {
        return Phaser.GameObjects.GetTextSize(
            this.currentText(),
            this.currentText().getTextMetrics(),
            this.currentText().getWrappedText(),
        );
    }

    forward(){
        if(this.phaseTimer > 0){
            return;
        }
        if(this.phaseTimer <= 0){
            this.phaseTimer = this.defaultTimer;
        }
        switch(this.phase){
            case 0: {
                this.dialogue2.setText("There's no way I can afford this...");
                this.textMode = 0;
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 1: {
                this.dialogue.setAlpha(1);
                this.dialogue.y += 600;
                this.dialogue.setText("Ugh, guess I'll need to get a job.");
                this.textMode = 1;
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 2: {
                this.dialogue2.setVisible(false);
                this.background.setTexture("st2");
                this.dialogue.y -= 600;
                this.dialogue.setText("What a seedy looking place.");
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                this.flash(500,0x000000, 1);
                this.indicator.setAlpha(0);
                break;
            } case 3: {
                this.dialogue2.setVisible(true);
                this.dialogue2.setAlpha(1);
                this.dialogue2.setText("At least they're hiring though...");
                this.textMode = 0;
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 4: {
                this.dialogue.setAlpha(1);
                this.dialogue.y += 600;
                this.dialogue.setText("Well, time to try my luck.");
                this.sound.play("scroll", {volume: 0.5});
                this.textMode = 1;
                this.phase++;
                break;
            } case 5: {
                this.dialogue2.setVisible(false);
                this.addEvent(500, () => {
                    this.fade(true, 1000, 0x000000);
                    this.addEvent(1050, () => {
                        this.scene.start("GameScene");
                    });
                });
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } default: {
                break;
            }
        }
    }

	update(time: number, delta: number) {
        if(this.phaseTimer > 0){
            this.phaseTimer -= delta;

            if (this.indicator.alpha > 0)
                this.indicator.setAlpha(Math.max(0,(this.phaseTimer-500)/500));

            switch(this.textMode){
                case 0:{
                    this.dialogue.setAlpha(Math.max(0,(this.phaseTimer-500)/500));
                    break;
                } case 1: {
                    this.dialogue2.setAlpha(Math.max(0,(this.phaseTimer-500)/500));
                    break;
                } default : {
                    break;
                }
            }
        } else {
            if (this.indicator.alpha == 0 && this.phase < 6)
            this.tweens.add({
                targets: this.indicator,
                duration: 400,
                alpha: 1,
            })
            const size = this.textSize();
            this.indicator.setPosition(
                this.currentText().x + (size.lineWidths.at(-1) ?? 0) + 69,
                this.currentText().y + size.lines * size.lineHeight
            );
        }

        const squish = 1.0 + 0.04 * Math.sin((6 * time) / 1000);
		this.indicator.setScale(1.0, squish);
	}

    onBar(bar: number) {
		if (this.phase == 5 && bar%4 == 0) {
            this.music.stop();
			this.sound.play("m_kitchentimer_side_end", {volume: this.music.volume});
		}
	}

	/* Orders */

}
