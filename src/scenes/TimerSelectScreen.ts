import Phaser from "phaser";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";
import { AddTimer, GetTimerList, GetTimerMasterList } from "@/components/Stages";
import { TimerSelectButton } from "@/components/TimerSelectButton";

export class TimerSelectScene extends BaseScene {
	private background: Phaser.GameObjects.Image;
	private shopkeep: Phaser.GameObjects.Image;
	private box: Phaser.GameObjects.Image;
	private speech: Phaser.GameObjects.Image;

	private dialogue: Phaser.GameObjects.Text;

    private phaseTimer: number = 1000;
    private phase: number = 0;

    private eligibleTimers: string[];
    private timerList: string[];
    private ownedTimers: string[];

    private eTimer: number;
    private ended: boolean;

    private displayedTimers: TimerSelectButton[];


	constructor() {
		super({ key: "TimerSelectScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
        this.timerList = GetTimerMasterList();
        this.ownedTimers = GetTimerList();
        this.filterTimers();

        this.eTimer = -1000;
        this.ended = false;
        this.displayedTimers = [];

		this.cameras.main.setBackgroundColor(0xffffff);

		this.background = this.add.image(0, 0, "transitionbkg");
		this.background.setOrigin(0);
        this.background.setDepth(1);
        this.fitToScreen(this.background);

        this.shopkeep = this.add.image(0, 0, "shopkeep");
		this.shopkeep.setOrigin(0);
        this.shopkeep.setDepth(2);
        this.fitToScreen(this.shopkeep);

        this.box = this.add.image(0, 0, "timerbox");
		this.box.setOrigin(0);
        this.box.setDepth(3);
        this.fitToScreen(this.box);

        this.speech = this.add.image(0, 0, "shopkeep_speech");
		this.speech.setOrigin(0);
        this.speech.setDepth(4);
        this.fitToScreen(this.speech);
        this.speech.setVisible(false);

        this.dialogue = this.addText({
			x: 1416,
			y: 124,
			size: 48,
			text: "",
		});
        this.dialogue.setDepth(5);
		this.dialogue.setStroke("black", 16);
		this.dialogue.setOrigin(0, 0);
        this.dialogue.setWordWrapWidth(400);
        this.dialogue.setVisible(false);




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

    filterTimers(){
        this.eligibleTimers = [];
        this.timerList.forEach((tl) => {
            if(!this.ownedTimers.includes(tl)){
                this.eligibleTimers.push(tl);
            }
        });
    }

    buyTimer(st: string){
        this.sound.play("buy", {volume: 0.5});
        AddTimer(st);
        this.eTimer = 500;
        this.displayedTimers.forEach((dt) => {
            if(!dt.bought){
                dt.passivate();
            }
        })
    }

    createTimers(){
        console.log("TIMER LIST: " + this.eligibleTimers);
        switch(this.eligibleTimers.length){
            case 1: {
                this.displayedTimers.push(new TimerSelectButton(this,960,540,this.eligibleTimers[0]));
                break;
            } case 2: {
                this.displayedTimers.push(new TimerSelectButton(this,960-180,540,this.eligibleTimers[0]));
                this.displayedTimers.push(new TimerSelectButton(this,960+180,540,this.eligibleTimers[1]));
                console.log("CREATED 2 TIMERS " + this.displayedTimers);
                break;
            } case 3: {
                this.displayedTimers.push(new TimerSelectButton(this,960-360,540,this.eligibleTimers[0]));
                this.displayedTimers.push(new TimerSelectButton(this,960,540,this.eligibleTimers[1]));
                this.displayedTimers.push(new TimerSelectButton(this,960+360,540,this.eligibleTimers[2]));
                break;
            } case 0: {
                this.progress();
                break;
            } default: {
                break;
            }
        }

        this.displayedTimers.forEach((dt) => {
            dt.setDepth(20);
        })
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
                this.shopkeep.setTexture("shopkeep_talk");
                this.speech.setVisible(true);
                this.dialogue.setText("Are you looking for timers?");
                this.dialogue.setVisible(true);
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 1: {
                this.dialogue.setText("I was cleaning out and found all of these!");
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 2: {
                this.shopkeep.setTexture("shopkeep_smirk");
                this.dialogue.setText("I, uh, dunno if they're all... accurate, hehe.");
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 3: {
                this.shopkeep.setTexture("shopkeep_talk");
                this.dialogue.setText("But, I'm sure a clever fellow like you can work with that, right?");
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 4: {
                this.dialogue.setText("So, what about it?");
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 5: {
                this.createTimers();
                this.shopkeep.setTexture("shopkeep");
                this.speech.setVisible(false);
                this.dialogue.setText("");
                this.dialogue.setVisible(false);
                this.sound.play("scroll", {volume: 0.5});
                this.phase++;
                break;
            } case 6: {
                //this.phase++;
                break;
            } default: {
                break;
            }
        }
    }

    progress(){
        this.addEvent(500, () => {
            this.fade(true, 1000, 0x000000);
            this.addEvent(1050, () => {
                this.scene.start("GameScene");
            });
        });
    }

	update(time: number, delta: number) {
        if(this.ended){
            return;
        }
        if(this.phaseTimer > 0){
            this.phaseTimer -= delta;
        }
        if(this.eTimer > 0){
            this.eTimer -= delta;
            this.displayedTimers.forEach((tt) => {
                if(tt.bought){
                    if(this.eTimer > 250){
                        tt.offset(20*Math.sin((this.eTimer-250)/250));
                    }
                } else {
                    tt.setAlpha(Math.max(0,this.eTimer/500));
                }
            });
            if((this.eTimer <= 0)){
                this.ended = true;
                this.progress();
            }
        }
	}

	/* Orders */

}
