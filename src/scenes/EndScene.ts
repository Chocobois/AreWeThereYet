import Phaser from "phaser";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";
import { Music } from "@/components/Music";

export class EndScene extends BaseScene {
	private background: Phaser.GameObjects.Image;
    private defaultTimer: number;

    public music: Phaser.Sound.WebAudioSound;

	constructor() {
		super({ key: "EndScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
        this.sound.play("boom", {volume: 0.5});
		this.cameras.main.setBackgroundColor(0xffffff);
        this.defaultTimer = 2000;
		this.background = this.add.image(0, 0, "endscreen");
		this.background.setOrigin(0);
        this.background.setDepth(1);
        this.fitToScreen(this.background);

        /*
        this.music = new Music(this, "m_kitchentimer_side", { volume: 0.25 });
        this.music.on("bar", this.onBar.bind(this));
        this.music.play();
        */

        this.input.keyboard
        ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        .on("down", this.advance, this);
        this.input.on(
            "pointerdown",
            (pointer: PointerEvent) => {
                if (pointer.button == 0) {
                    this.advance();
                }
            },
        );

	}

    advance(){
        if(this.defaultTimer > 0){
            return;
        }
        this.addEvent(1000, () => {
            this.fade(true, 1000, 0x000000);
            this.addEvent(1050, () => {
                //this.musicTitle.stop();
                this.scene.start("TitleScene");
            });
        });
    }

	update(time: number, delta: number) {
        if(this.defaultTimer > 0){
            this.defaultTimer -= delta;
        }

	}


	/* Orders */

}
