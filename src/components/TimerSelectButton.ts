import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "./Button";
import { TimerSelectScene } from "@/scenes/TimerSelectScreen";

export class TimerSelectButton extends Button {
    public scene: TimerSelectScene;
    public spr: Phaser.GameObjects.Image;
    public key: string;
    public bought: boolean = false;
    private opos: number[];
    constructor(scene: TimerSelectScene, x: number, y: number, key: string){
        super(scene,x,y);
        this.scene = scene;
        this.key = key;
        switch(key){
            case "golen": {
                this.spr = this.scene.add.image(0,0,"timer_golen");
                break;
            } case "hourglass": {
                this.spr = this.scene.add.image(0,0,"timer_hourglass_1");
                break;
            } case "bluecone": {
                this.spr = this.scene.add.image(0,0,"timer_blue_cone");
                break;
            } default: {
                this.spr = this.scene.add.image(0,0,"timer_green_egg");
                break;
            }
        }
        this.opos = [x,y];
        this.spr.setOrigin(0.5,0.5);
        this.spr.setScale(0.5);
        this.add(this.spr);
        this.bindInteractive(this.spr);
        this.spr.setInteractive(true);
        this.scene.add.existing(this);
    }

    onDown(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	): void {
        this.bought = true;
        this.scene.buyTimer(this.key);
        this.spr.setInteractive(false);
        this.spr.removeInteractive();

	}

    offset(n: number){
        this.y = this.opos[1] - n;
    }

    passivate(){
        this.spr.setInteractive(false);
        this.spr.removeInteractive();
    }
}