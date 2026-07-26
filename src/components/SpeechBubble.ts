import Phaser from "phaser";
import { BaseScene } from "@/scenes/BaseScene";

export class SpeechBubble extends Phaser.GameObjects.Container{
    public bubble: Phaser.GameObjects.Image;
    private ft: number[] = [-100,-100];
    public nt: number = -1000;
    public popped: boolean = false;
    public faded: boolean = false;
    public dialogue: Phaser.GameObjects.Text;
    constructor(scene: BaseScene, x: number, y: number, img: string, txt: string){
        super(scene,x,y);
        this.bubble = this.scene.add.image(0,0,img);
        this.bubble.setOrigin(0,0);
        this.add(this.bubble);
        this.dialogue = this.scene.add.text(256,64,txt);
        this.dialogue.setColor("black");
        this.dialogue.setFontSize(30);
        this.dialogue.setOrigin(0,0);
        this.dialogue.setWordWrapWidth(296);
        this.add(this.dialogue);
    }

    fade(t: number){
        if(!this.faded){
            this.ft = [450,450];
            //this.setAlpha(0.5);
            this.faded = true;
        }
    }

    update(t: number, d: number){
        if(this.nt > 0){
            this.nt -= d;
            if(this.nt <= 0){
                this.popped = true;
            }
        }
        if(this.ft[0] > 0){
            this.ft[0] -= d;
            //console.log("FT: " + this.ft[0] + " / " + this.ft[1]);
            if(this.ft[0] <= 0){
                this.setVisible(false);
            }
            this.setAlpha(0.75*Math.max(0,this.ft[0]/this.ft[1]));
        }
    }
}