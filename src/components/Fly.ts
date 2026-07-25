import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "./Button";
import { GameScene } from "@/scenes/GameScene";

export class Fly extends Button{
    public scene: GameScene;
    private spr: Phaser.GameObjects.Image;
    private effect: Phaser.GameObjects.Image;
    private phase: number = 0;
    private ptimer: number[] = [100,100];
    public fstate: number = 0;
    private bpos: number[] = [0,0];
    private epos: number[] = [0,0];
    private elapsed: number = 0;
    private tdist: number = 0;
    public deleteFlag: boolean = false;
    private velocity: number[] = [5000,5000];
    private vtheta: number = 0;
    constructor(scene:GameScene, x: number, y: number, xd: number, yd: number){
        super(scene,x,y);
        this.scene = scene;

        this.bpos = [x,y];
        this.epos = [xd,yd];
        this.tdist = this.distance(this.bpos,this.epos);

        this.vtheta = Math.atan2(this.epos[1]-this.bpos[1], this.epos[0]-this.bpos[0]);
        this.velocity = [500*Math.cos(this.vtheta),500*Math.sin(this.vtheta)];

        if(this.epos[0] >= this.bpos[0]){
            this.setScale(-1,1);
        } else {
            this.setScale(1,1);
        }
        
        this.spr = this.scene.add.image(0,0,"flyf1");
        this.spr.setOrigin(0.5,0.5);
        this.add(this.spr);
        this.spr.setDepth(5);

        this.effect = this.scene.add.image(0,0,"smack");
        this.effect.setOrigin(0.5,0.5);
        this.add(this.effect);
        this.effect.setDepth(10);
        this.effect.setVisible(false);


    }

    update(t: number, d: number){
        switch(this.fstate){
            case 0: {
                this.ptimer[0] -= d;
                
                this.x += this.velocity[0]*(d/1000);
                this.y += this.velocity[1]*(d/1000);
                
                if(this.ptimer[0] <= 0){
                    this.ptimer[0] = this.ptimer[1]
                    switch(this.phase){
                        case 0: {
                            this.spr.setTexture("flyf2");
                            this.phase = 1;
                            break;
                        } case 1: {
                            this.spr.setTexture("flyf1");
                            this.phase = 0;
                            break;
                        } default: {
                            break;
                        }
                    }
                }
                this.elapsed = this.distance([this.x,this.y],this.bpos);
                if(this.elapsed > this.tdist){
                    this.x = this.epos[0];
                    this.y = this.epos[1];
                    this.fstate = 1;
                    this.spr.setTexture("flystand");
                    this.ptimer = [5000,5000];
                    this.bindInteractive(this.spr);
                    this.spr.setInteractive();
                }
                break;
            } case 1: {
                this.ptimer[0] -= d;
                
                if(this.ptimer[0] <= 0){
                    this.ptimer = [250,250];
                    this.fstate = 2;
                    this.spr.setTexture("flyt0");
                    this.phase = 0;
                }
                break;
            } case 2: {
                this.ptimer[0] -= d;
                if(this.ptimer[0] <= 0){
                    this.ptimer[0] = this.ptimer[1];
                    switch(this.phase){
                        case 0: {
                            this.spr.setTexture("flyt1");
                            this.scene.addScore(-25);
                            this.phase = 1;
                            break;
                        } case 1: {
                            this.spr.setTexture("flyt0");
                            this.phase = 0;
                            break;
                        } default: {
                            break;
                        }
                    }
                }
                break;
            } case 3: {
                this.ptimer[0] -= d;
                if(this.ptimer[0] <= 0){
                    this.effect.setVisible(false);
                    this.fstate = 4;
                    this.ptimer = [5000,5000];
                } else if (this.ptimer[0] < 500){
                    this.effect.setAlpha(this.ptimer[0]/500);
                }
                break;
            } case 4: {
                this.ptimer[0] -= d;
                if(this.ptimer[0] <= 0){
                    this.spr.setVisible(false);
                    this.fstate = 5;
                    this.ptimer = [5000,5000];
                    this.deleteFlag = true;
                } else if (this.ptimer[0] < 2000){
                    this.spr.setAlpha(this.ptimer[0]/2000);
                }
                break;
            } default: {
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
        if(this.fstate < 3){
            
            super.onDown(pointer, localX, localY, event);
            this.fstate = 3;
            this.spr.setTexture("flydead");
            this.effect.setVisible(true);
            this.spr.removeInteractive();
            this.scene.sound.play("flyslap", {volume: 0.25});
            this.ptimer = [1000,1000];
            
           //this.scene.killFlies();
        }

	}

    forceDie(){
        this.fstate = 3;
        this.spr.setTexture("flydead");
        this.effect.setVisible(true);
        this.spr.removeInteractive();
        this.ptimer = [1000,1000];
    }

    distance(i: number[], e: number[]): number{
        return Math.sqrt(Math.pow((i[0]-e[0]),2)+Math.pow((i[1]-e[1]),2));
    }



}