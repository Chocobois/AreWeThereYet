import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "./Button";
import { TimerSelectScene } from "@/scenes/TimerSelectScreen";

export class TimerSelectButton extends Button {
    public scene: TimerSelectScene;
    public spr: Phaser.GameObjects.Image;
    public key: string;
    constructor(scene: TimerSelectScene, x: number, y: number, key: string){
        super(scene,x,y);
        this.scene = scene;
        switch(key){
            case "golen": {
                this.spr = this.scene.add.image(0,0,"timer_golen");
                break;
            } case "hourglass": {
                this.spr = this.scene.add.image(0,0,"timer_hourglass_1");
                break;
            } case "blue_cone": {
                this.spr = this.scene.add.image(0,0,"timer_blue_cone");
                break;
            }
        }
    }

    onDown(
		pointer: Phaser.Input.Pointer,
		localX: number,
		localY: number,
		event: Phaser.Types.Input.EventData,
	): void {
        

	}
}