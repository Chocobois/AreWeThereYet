import Phaser from "phaser";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";

export class StoryScene extends BaseScene {
	private background: Phaser.GameObjects.Image;

	private dialogue: Phaser.GameObjects.Text;
	private dialogue2: Phaser.GameObjects.Text;
    private phaseTimer: number = 1000;
    private phase: number = 0;
    private textMode: number = -1;


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

    forward(){
        if(this.phaseTimer > 0){
            return;
        }
        if(this.phaseTimer <= 0){
            this.phaseTimer = 1000;
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
        }
	}

	/* Orders */

}
