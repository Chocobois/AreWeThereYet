import Phaser from "phaser";
import { Order } from "@/components/Order";
import { Timer, TimerType } from "@/components/timers/Timer";
import { BaseScene } from "@/scenes/BaseScene";
import { Hourglass } from "@/components/timers/Hourglass";
import { GreenEgg } from "@/components/timers/GreenEgg";
import { BlueCone } from "@/components/timers/BlueCone";
import { Golen } from "@/components/timers/Golen";
import { Fly } from "@/components/Fly";
import { Music } from "@/components/Music";
import { formatTime } from "@/util/format";
import { GetCurrentStage, GetStage, Stage } from "@/components/Stages";
import StartButton from "@/components/buttons/StartButton";
import { SpeechBubble } from "@/components/SpeechBubble";
import { MiniButton } from "@/components/MiniButton";

const orderItems = [
	// Temporary: Duplicate entries to increase their odds of appearing
	{ image: "broccoli", seconds: 5 },
	{ image: "broccoli", seconds: 10 },
	{ image: "broccoli", seconds: 10 },
	{ image: "broccoli", seconds: 10 },
	{ image: "eggplant", seconds: 15 },
	{ image: "eggplant", seconds: 20 },
	{ image: "eggplant", seconds: 20 },
	{ image: "eggplant", seconds: 20 },
	{ image: "meat", seconds: 30 },
	{ image: "meat", seconds: 30 },
	{ image: "meat", seconds: 30 },
	{ image: "steak", seconds: 40 },
	{ image: "steak", seconds: 40 },
	{ image: "pot", seconds: 50 },
	{ image: "pot", seconds: 60 },
];

export class GameScene extends BaseScene {
	private background: Phaser.GameObjects.Image;

	public musicKitchentimerIntro: Phaser.Sound.WebAudioSound;
	public musicKitchentimer: Phaser.Sound.WebAudioSound;

	private speechBubbleLayer: Phaser.GameObjects.Container;
	private speechBubbles: SpeechBubble[];
	private doTutorial: boolean = true;
	private tPhase: number = 0;
	private tTimer: number[] = [-1000, -1000];
	public inTutorial: boolean = false;
	private previousBarIntro: number = -1;
	private tAdvance: boolean = false;

	private timers: Timer[];
	private orders: Order[];
	private flies: Fly[];

	private progressBar: Phaser.GameObjects.Image;

	private totalScore: number;
	private scoreText: Phaser.GameObjects.Text;
	private textGetReady: Phaser.GameObjects.Text;

	private stageTimer: number;

	private currentStage: Stage;

	public flySpawnChance: number;
	public maxFlies: number;
	public flySpawnDelay: number;
	public maxNewOrders: number;
	public maxActiveOrders: number;
	public orderDelay: number;
	public offOrderChance: number;
	public offOrderQueue: number;
	public premiumOrderQueue: number;
	public premiumOrderChance: number;

	public multiplier: number;
	public orderExpiryAccel: number = 0;
	public difficulty: number;

	private queueUpdate: boolean;
	public pendingBeat: boolean;
	private pauseOrders: boolean;
	private myLv: number;
	private pending: boolean;

	private orderTimer: number[]; 
	private flyTimer: number[]; 

	private startButton: StartButton;
	public musicButton: MiniButton;
	public audioButton: MiniButton;

	private gameStarted = false;

	// Locations to place the order bubbles
	private slots: { order: Order | null; x: number; y: number }[] = [
		{ order: null, x: 175, y: 200 },
		{ order: null, x: 175, y: 500 },
		{ order: null, x: 175, y: 800 },
		{ order: null, x: 1920 - 175, y: 200 },
		{ order: null, x: 1920 - 175, y: 500 },
		{ order: null, x: 1920 - 175, y: 800 },
	];

	initTime: number;

	constructor() {
		super({ key: "GameScene" });
		this.gameStarted = false;
	}
	
	create(): void {
		this.currentStage = structuredClone(GetStage());
		this.initTime = this.currentStage.stageTime;
		this.myLv = GetCurrentStage();

		this.fade(false, 200, 0x000000);
		this.SFXvolume = 0.5;
		this.setBasicVariables();
		this.cameras.main.setBackgroundColor(0xffffff);

		this.musicKitchentimerIntro = new Music(this, "m_kitchentimer_intro", { volume: 0.4 });
		this.musicKitchentimerIntro.play();

		this.musicKitchentimer = new Music(this, "m_kitchentimer", { volume: 0.4 });

		this.background = this.add.image(0, 0, "background");
		this.background.setOrigin(0);
		this.fitToScreen(this.background);

		this.timers = [];
		this.timers.push(new GreenEgg(this, 600, 800));
		//this.timers.push(new Golen(this, 1000, 700));
		//this.timers.push(new BlueCone(this, 1400, 800));
		//this.timers.push(new Hourglass(this, 800, 500));

		this.musicKitchentimerIntro.on('bar',  this.onBarIntro.bind(this));
		this.musicKitchentimer.on('bar', this.onBar.bind(this));

		this.textGetReady = this.addText({ x: this.CX, y: this.CY, size: 64, text: "Get ready . . ." })
								.setStroke("black", 16)
								.setOrigin(0.5,0.5)
								.setDepth(30)
								.setVisible(false);

		this.orders = [];
		this.newOrder();

		this.flies = [];
		//this.spawnFly();

		this.totalScore = 0;
		this.scoreText = this.addText({
			x: this.CX,
			y: 0,
			size: 48,
			text: "Score: 0",
		});
		this.scoreText.setStroke("black", 16);
		this.scoreText.setOrigin(0.5, 0);

		this.startButton = new StartButton(this, this.CX, this.CY);
		this.startButton.setVisible(false);
		this.startButton.on("click", () => {
			this.startButton.setVisible(false);
			this.gameStarted = true;
			this.textGetReady.setVisible(true);
		});
		this.startButton.setScale(4, 1)

		this.speechBubbleLayer = new Phaser.GameObjects.Container(this,0,0);
		this.add.existing(this.speechBubbleLayer);
		this.speechBubbleLayer.setDepth(50);
		this.speechBubbles = [];

		this.add.image(this.CX, this.H-20, "bar_bg").setOrigin(0.5,1);
		this.progressBar = this.add.image(60, this.H-20, "bar_progress").setOrigin(0,1);
		this.add.image(this.CX, this.H-20, "bar_frame").setOrigin(0.5,1);
		this.progressBar.setCrop(0,0, 1900, 200)
		// From DiceEmUp
		const bsize = 70;

		this.musicButton = new MiniButton(this, this.W-2.5*bsize, 0.8*bsize, "music");
		this.musicButton.on("click", (active: boolean) => {
			this.musicButton.toggle();
			this.musicKitchentimer.volume      = (this.musicButton.active ? 0.4 : 0);
			this.musicKitchentimerIntro.volume = (this.musicButton.active ? 0.4 : 0);
		}, this);

		this.audioButton = new MiniButton(this, this.W-bsize, 0.8*bsize, "audio");
		this.audioButton.on("click", (active: boolean) => {
			this.audioButton.toggle();
			this.sound.mute = !this.audioButton.active;
		}, this);

		this.input.keyboard
        ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        .on("down", this.click, this);
        this.input.on(
            "pointerdown",
            (pointer: PointerEvent) => {
                if (pointer.button == 0) {
                    this.click();
                }
            },
        );
		
	}

	checkDesync(prevBar: number, currBar: number) {
		if ((prevBar < currBar) && (currBar - prevBar > 1)) {
			console.log(`Possible intro music desync detected: bar ${prevBar} -> ${currBar}`)
			return true
		}
		return false
	}

	onEndStage() {
		this.gameStarted = false;
		console.log("Stage over");
		this.addEvent(1000, () => {
			this.fade(true, 1000, 0x000000);
			this.addEvent(1050, () => {
				this.musicKitchentimer.stop();
				this.scene.start("TimerSelectScene");
			});
		});
	}

	onBarIntro(bar: number) {
		// Check for skipped bars (excluding loop poitns)
		this.checkDesync(this.previousBarIntro, bar)

		if(this.gameStarted) {
			const offset = (bar*0.5) % 4;

			if (bar%16 <= 12) {
				this.musicKitchentimerIntro.stop();
				this.musicKitchentimer.play({
					seek: 12 + offset
				});
			}

			/*
			if( bar <= 4 ) {
				this.musicKitchentimerIntro.stop();
				this.musicKitchentimer.play({
					seek: 12 + offset
				});
			}
			if( bar >= 4 && bar < 8 ) {
				this.musicKitchentimerIntro.stop();
				this.musicKitchentimer.play({
					seek: 8 + offset
				});
			}
			if(bar >= 8 && bar < 10) {
				this.musicKitchentimerIntro.stop();
				this.musicKitchentimer.play({
					seek: 12 + offset
				});
			}
			 */
		}

		this.previousBarIntro = bar;
	}
	
	onBar(bar: number) {
		if(bar >= 32) {
			if(this.currentStage.stageTime == 0) {
				this.pending = true;
				this.onEndStage();
				return;
			}
			this.currentStage.stageTime--;
			if(this.currentStage.stageTime >= 0) {
				const timeLeftPercent = this.currentStage.stageTime / this.initTime;
				this.progressBar.setCrop(0,0,1900*timeLeftPercent, 200);
				this.tweens.add({
					targets: this.progressBar,
					scaleX: { from: 0.99, to: 1 },
					ease: "Cubic.Out",
					duration: 200,
				})
			}
			this.timers.forEach((timer) => timer.decrementTime());
			this.orders.forEach((order) => order.decrementTime());
			this.textGetReady.setVisible(false);
		} else {
			if(bar == 28) {
				this.textGetReady.setFontSize(128);
				this.textGetReady.setText("3");
				this.tweens.add({
					targets: this.textGetReady,
					scale: { from: 2, to: 1 },
					ease: "Cubic.Out",
					duration: 200,
				});
				this.sound.play('v_three');
			}
			if(bar == 29) {
				this.textGetReady.setText("2");
				this.tweens.add({
					targets: this.textGetReady,
					rotation: { from: -Math.PI*2, to: 0 },
					ease: "Cubic.Out",
					duration: 200,
				});
				this.sound.play('v_two');
			}
			if(bar == 30) {
				this.textGetReady.setText("1");
				this.tweens.add({
					targets: this.textGetReady,
					scaleX: { from: 1, to: 0.25 },
					scaleY: { from: 1, to: 3 },
					ease: "Cubic.Out",
					duration: 100,
					yoyo: true
				});
				this.sound.play('v_one');
			}
			if(bar == 31) {
				this.textGetReady.setText("Go!")
				this.tweens.add({
					targets: this.textGetReady,
					scale: { from: 4, to: 1 },
					ease: "Cubic.Out",
					duration: 200,
				});
				this.sound.play('v_go');
				this.pendingBeat = false;
			}
		}
	}

	setBasicVariables(){
		this.pending = false;
		this.stageTimer = 60000;
		this.pendingBeat = true;
		this.doTutorial = true;
		this.tPhase = 0;
		this.tTimer = [-1000, -1000];
		this.inTutorial = false;
		this.previousBarIntro = -1;
		this.tAdvance = false;
		this.initDifficulty();
		this.queueUpdate = false;
		this.orderTimer = [this.orderDelay, this.orderDelay];
		this.flyTimer = [this.flySpawnDelay,this.flySpawnDelay];
		this.pauseOrders = false;
	}

	initDifficulty(){
		//difficulty variables
		this.difficulty = 0;
		this.multiplier = 1;

		this.flySpawnChance = 0;
		this.maxFlies = 1;
		this.flySpawnDelay = 10000;
		this.maxNewOrders = 1;
		this.maxActiveOrders = 1;
		this.orderDelay = 7500;
		this.offOrderChance = 0;
		this.offOrderQueue = 0;
		this.premiumOrderChance = 0;
		this.premiumOrderQueue = 0;
		this.orderExpiryAccel = 0;

		this.doTutorial = true;
		this.inTutorial = true;

		switch(this.myLv){
			case 0: {
				this.rampDifficultyLv1();
				break;
			} case 1: {
				this.rampDifficultyLv2();
				break;
			} case 2: {
				this.rampDifficultyLv3();
				break;
			} case -1: {
				this.doTutorial = true;
				this.inTutorial = true;
				this.rampDifficultyEndless();
				break;
			} default: {
				this.rampDifficultyEndless();
				break;
			}
		}
	}

	update(time: number, delta: number) {
		if(this.pending){
			return;
		}
		if(this.inTutorial){
			this.updateTutorial(time,delta);
		} else {
			this.timers.forEach((timer) => {
				timer.update(time, delta);
				timer.setDepth(10 + timer.y / 1000);
			});
	
			this.orders.forEach((order) => {
				order.update(time, delta);
				order.setDepth(20);
			});
	
			for(let fl = (this.flies.length-1); fl >= 0; fl--){
				this.flies[fl].update(time, delta);
				this.flies[fl].setDepth(40);
				if(this.flies[fl].deleteFlag) {
					this.flies[fl].destroy();
					this.flies.splice(fl,1);
				}
			}
	
			// this.scoreText.setText(`Score: ${this.totalScore}`);
			if (!this.pendingBeat){
				this.updateFlySpawn(time, delta);
				this.updateOrderSpawn(time, delta);
				this.stageTimer -= delta;
				if(this.stageTimer <= 0){
					console.log("Increased difficulty");
					this.increaseDifficulty();
					this.stageTimer = 60000;
				}
			}

		}
		this.scoreText.setText(`Score: ${this.totalScore}`);



		/*
		if((this.stageTimer <= 0) && this.orders.length < 1){ //Go to next stage if the stage timer has run out and all your orders have finished
			this.advance();
		}*/
	}

	spawnFly(){
		let ry = 360+Math.round(Math.random()*(1080-400));
		let rx = 430+Math.round(Math.random()*(1060));
		let sx = -120+Math.round(Math.random()*2160);
		//let sx = 100+Math.round(Math.random()*1720);
		this.flies.push(new Fly(this,sx,-100,rx,ry));

	}

	/* Orders */

	newOrder() {
		Phaser.Math.RND.shuffle(this.slots);
		const slot = this.slots.find((slot) => !slot.order);
		if (!slot) return;

		// Select random order item
		const item = Phaser.Math.RND.pick(orderItems);

		let adj = 0;
		if((this.offOrderQueue > 0) || (Math.random() < this.offOrderChance)){
			adj = 1+Math.trunc(Math.random()*9);
			if(this.offOrderQueue > 0){
				this.offOrderQueue--;
			}
		}
		
		let pr = true;
		if((this.premiumOrderQueue > 0) || (Math.random() < this.premiumOrderChance)){
			pr = true;
			if(this.premiumOrderQueue > 0){
				this.premiumOrderQueue--;
			}
		}

		const order = new Order(this, slot.x, slot.y, item.image, item.seconds+adj);
		slot.order = order;
		this.orders.push(order);

		this.sound.play("neworder", {volume: 0.75*this.SFXvolume});

		// On clicking the bubble (after accepting)
		order.on("remove", () => {
			this.completeOrder(order);
		});

		// On completing or failing an order
		order.on("score", (score: number) => {
			this.addScore(score);
		});
	}

	updateOrderSpawn(t: number, d: number){
		this.orderTimer[0] -= d;
		if(this.orderTimer[0] <= 0){
			this.orderTimer[1] = this.orderDelay;
			this.orderTimer[0] += this.orderDelay;
		}
		if(!this.pauseOrders){
			const pendingOrders = this.orders.filter((order) => !order.accepted);
			const activeOrders = this.orders.filter ((order) => !order.completed);
			if ((pendingOrders.length < this.maxNewOrders) && (activeOrders.length < this.maxActiveOrders)) {
				this.newOrder();
			}
		}
	}

	updateFlySpawn(t: number, d: number){
		this.flyTimer[0] -= d;
		if(this.flyTimer[0] <= 0){
			this.flyTimer[1] = this.flySpawnDelay;
			this.flyTimer[0] += this.flySpawnDelay;
		}
		if ((this.flies.length < this.maxFlies) && (Math.random() < this.flySpawnChance)) {
			this.spawnFly();
		}
	}

	roundEnd() {

	}

	addScore(n: number){
		const prevScore = this.totalScore;
		this.totalScore += n;
		this.tweens.addCounter({
			duration: 600,
			ease: Phaser.Math.Easing.Expo.Out,
			onUpdate: (tween) => {
				const animatedScore = Phaser.Math.Interpolation.Linear([prevScore, this.totalScore], tween.getValue()!)
				this.scoreText.setText(`Score: ${Phaser.Math.RoundTo(animatedScore, 0)}`);
			}
		})
	}

	killFlies(){
		this.flies.forEach((f) => 
		{		
			if(f.fstate < 3) {
				f.forceDie();
			}
		});
		this.sound.play("flyslap", {volume: 0.6*this.SFXvolume});
	}

	increaseDifficulty(){
		this.difficulty++;
		switch(this.myLv){
			case 0: {
				this.rampDifficultyLv1();
				break;
			} case 1: {
				this.rampDifficultyLv2();
				break;
			} case 2: {
				this.rampDifficultyLv3();
				break;
			} case -1: {
				this.rampDifficultyEndless();
				break;
			} default: {
				this.rampDifficultyEndless();
				break;
			}
		}
	}

	rampDifficultyLv1(){
		switch(this.difficulty){
			case 0:{
				this.maxActiveOrders = 1;
				this.maxNewOrders = 1;
				this.orderDelay = 7500;
				break;
			}
			case 1: {
				this.maxActiveOrders = 2;
				break;
			} case 2: {
				this.maxActiveOrders = 3;
				this.orderDelay = 6000;
				break;
			} case 3: {
				this.maxNewOrders = 2;
				this.offOrderQueue = 1;
				break;
			} case 4: {
				this.offOrderQueue = 1;
				this.orderExpiryAccel = 10;
				this.orderDelay = 5000;
				break;
			} default: {
				break;
			}
		}
	}

	rampDifficultyLv2(){
		switch(this.difficulty){
			case 0:{
				this.offOrderQueue = 1;
				this.maxActiveOrders = 2;
				this.maxNewOrders = 1;
			} case 1: {
				this.offOrderQueue = 1;
				this.maxActiveOrders = 3;
				this.maxNewOrders = 1;
				break;
			} case 2: {
				this.offOrderQueue = 1;
				this.maxActiveOrders = 3;
				this.maxNewOrders = 2;
				this.flySpawnChance = 0.5;
				this.flySpawnDelay = 7500;
				this.maxFlies = 1;
				break;
			} case 3: {
				this.offOrderQueue = 2;
				this.orderExpiryAccel = 5;
				this.maxActiveOrders = 4;
				this.maxNewOrders = 3;
				this.flySpawnChance = 0.75;
				this.maxFlies = 2;
				break;
			} case 4: {
				this.offOrderQueue = 2;
				this.offOrderChance = 0.25;
				this.maxNewOrders = 3;
				this.flySpawnChance = 0.9;
				this.maxFlies = 2;
				this.orderDelay = 6000;
				break;
			} case 5 : {
				this.offOrderQueue = 2;
				this.offOrderChance = 0.4;
				this.maxFlies = 3;
				this.maxNewOrders = 4;
				this.flySpawnDelay = 5500;
				break;
			} case 6: {
				this.offOrderQueue = 2;
				this.offOrderChance = 0.5;
				this.orderExpiryAccel = 10;
				this.orderDelay = 5000;
				this.flySpawnDelay = 5000;
				this.flySpawnChance = 1;
				this.maxFlies = 4;
				break;
			} default: {
				break;
			}
		}
	}

	rampDifficultyLv3(){
		switch(this.difficulty){
			case 0: {
				this.premiumOrderQueue = 1;
				this.maxActiveOrders = 2;
				this.maxNewOrders = 1;
			} case 1: {
				this.premiumOrderQueue = 2;
				this.maxNewOrders = 2;
				this.orderDelay = 6000;
				break;
			} case 2: {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 1;
				this.maxActiveOrders = 3;
				this.flySpawnChance = 0.5;
				this.maxFlies = 2;
				this.flySpawnDelay = 10000;
				this.orderExpiryAccel = 5;
				break;
			} case 3: {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 1;
				this.premiumOrderChance = 0.25;
				this.orderDelay = 5000;
				this.maxNewOrders = 3;
				this.flySpawnChance = 0.75;
				this.flySpawnDelay = 7500;
				break;
			} case 4: {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 2;
				this.offOrderChance = 0.25;
				this.maxFlies = 3;
				this.maxActiveOrders = 4;
				break;
			} case 5 : {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 2;
				this.maxNewOrders = 4;
				this.orderDelay = 4000;
				this.flySpawnChance = 1;
				this.flySpawnDelay = 6000;
				this.maxFlies = 4;
				break;
			} case 6: {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 2;
				this.premiumOrderChance = 0.35;
				this.orderExpiryAccel = 10;
				break;
			} case 7: {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 2;
				this.offOrderChance = 0.35;
				this.orderDelay = 3000;
				this.flySpawnChance = 1;
				this.flySpawnDelay = 5000;
				break;
			} case 8: {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 2;
				this.maxActiveOrders = 5;
				this.maxFlies = 5;
				break;
			} case 9: {
				this.premiumOrderQueue = 3;
				this.offOrderQueue = 2;
				this.orderExpiryAccel = 15;
				this.premiumOrderChance = 0.5;
				this.offOrderChance = 0.5;
			} default: {
				break;
			}
		}
	}

	rampDifficultyEndless(){
		switch(this.difficulty){
			case 0: {
				this.maxActiveOrders = 1;
			}case 1: {
				this.maxActiveOrders = 2;
				break;
			} case 2: {
				this.maxActiveOrders = 3;
				this.maxNewOrders = 2;
				break;
			} case 3: {
				this.offOrderQueue = 1;
				this.flySpawnChance = 0.5;
				break;
			} case 4: {
				this.premiumOrderQueue = 1;
				this.offOrderQueue = 1;
				this.offOrderChance = 0.2;
				this.maxFlies = 2;
				this.orderExpiryAccel = 5;
				this.flySpawnDelay -= 1000;
				break;
			} case 5 : {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 1;
				this.maxActiveOrders = 4;
				this.maxNewOrders = 3;
				break;
			} case 6: {
				this.premiumOrderQueue = 2;
				this.premiumOrderChance = 0.2;
				this.offOrderQueue = 2;
				this.orderDelay = 6250;
				this.flySpawnDelay -= 1000;
				this.flySpawnChance = 0.6;
				this.offOrderChance = 0.3;
				break;
			} case 7: {
				this.premiumOrderQueue = 2;
				this.offOrderQueue = 2;
				this.maxActiveOrders = 5;
				this.maxNewOrders = 4;
				this.maxFlies = 3;
				break;
			} case 8: {
				this.premiumOrderQueue = 3;
				this.offOrderQueue = 3;
				this.offOrderChance = 0.4;
				this.orderDelay = 5000;
				this.flySpawnDelay -= 1000;
				break;
			} case 9: {
				this.premiumOrderQueue = 4;
				this.offOrderQueue = 3;
				this.premiumOrderChance = 0.4;
				this.maxFlies = 4;
				this.maxNewOrders = 5;
				this.orderExpiryAccel = 5;
			} default: {
				this.premiumOrderQueue = 5;
				this.offOrderQueue = 5;
				this.orderDelay = Math.max(1000, this.orderDelay - 500);
				this.offOrderChance = Math.min(0.95, this.offOrderChance + 0.05);
				this.premiumOrderChance = Math.min(0.95, this.premiumOrderChance + 0.05);
				this.maxFlies = Math.min(20, this.maxFlies + 1);
				this.flySpawnDelay = Math.min(1000, this.flySpawnDelay - 750);
				this.flySpawnChance = Math.min(1, this.flySpawnChance + 0.05);
				this.orderExpiryAccel = Math.min(20, this.orderExpiryAccel + 1);
				this.maxActiveOrders = Math.min(6, Math.trunc(this.maxActiveOrders+0.25));
				this.maxNewOrders = Math.min(6, Math.trunc(this.maxNewOrders+0.25));
				if(this.orderDelay == 1000){
					this.multiplier += 0.5;
				}
				break;
			}
		}
	}

	click(){
		if(this.inTutorial){
			this.advanceSpeech()
		}
	}

	advanceSpeech(){
		if(this.speechBubbles.length < 1){
			return;
		}
		let sbb = this.speechBubbles.filter((stb) => stb.popped);
		sbb.forEach((sr) => sr.setAlpha(0.75));
		for(let nn = 0; nn < this.speechBubbles.length; nn++){
			if(!this.speechBubbles[nn].popped){
				if(this.speechBubbles[nn].nt < 0){
					this.speechBubbles[nn].setVisible(true);
					this.speechBubbles[nn].nt = 1000;
					this.sound.play("scroll", {volume: 0.5});
					return;
				} else {
					return;
				}
			}
		}
		if(!this.tAdvance){
			this.fadeBubbles(450);
			this.tAdvance = true;
		}
	}

	updateTutorial(t: number, d: number){
		if(!this.inTutorial){
			return;
		}
		switch(this.tPhase){
			case 0: {
				this.speechBubbles.push(new SpeechBubble(this, 40, 0, "sb_kobold", "Well... what am I even looking at?"));
				this.speechBubbles.push(new SpeechBubble(this, 240, 360, "sb_jbun", "Attention, minion!"));
				this.speechBubbles.push(new SpeechBubble(this, 40, 720, "sb_jbun", "We're getting plenty of orders and I expect excellence from you."));
				this.adjustBubbles();
				this.tTimer = [-1000,-1000]
				this.tPhase++;
				break;
			} case 1: {
				this.speechBubbles.forEach((sbb) => sbb.update(t,d));
				if(this.tAdvance){
					if(this.tTimer[0] < 0){
						this.tTimer = [500,500];
					}
				}
				if(this.tTimer[0] > 0){
					this.tTimer[0] -= d;
					if(this.tTimer[0] <= 0){
						this.tTimer = [-1000,-1000];
						this.tAdvance = false;
						this.tPhase++;
					}
				}
				break;
			} case 2: {
				this.destroyBubbles();
				this.speechBubbles.push(new SpeechBubble(this, 1080, 0, "sb_jbun", "Click on an order to start timing it for the chef."));
				this.speechBubbles.push(new SpeechBubble(this, 1280, 360, "sb_jbun", "Make sure to get it right or the food will be terrible!"));
				this.speechBubbles.push(new SpeechBubble(this, 1080, 720, "sb_kobold", "Uhhh..."));
				this.adjustBubbles();
				this.tTimer = [-1000,-1000];
				this.tPhase++;
				break;
			} case 3: {
				this.speechBubbles.forEach((sbb) => sbb.update(t,d));
				if(this.tAdvance){
					if(this.tTimer[0] < 0){
						this.tTimer = [500,500];
					}
				}
				if(this.tTimer[0] > 0){
					this.tTimer[0] -= d;
					if(this.tTimer[0] <= 0){
						this.tTimer = [-1000,-1000];
						this.tAdvance = false;
						this.tPhase++;
					}
				}
				break;
			} case 4: {
				this.destroyBubbles();
				this.speechBubbles.push(new SpeechBubble(this, 40, 0, "sb_jbun", "To help you keep track, you can use that egg timer."));
				this.speechBubbles.push(new SpeechBubble(this, 240, 360, "sb_jbun", "Just smack it to add 10 seconds."));
				this.speechBubbles.push(new SpeechBubble(this, 40, 720, "sb_jbun", "Even a dolt like you can figure that out."));
				this.adjustBubbles();
				this.tTimer = [-1000,-1000]
				this.tPhase++;
				break;
			} case 5: {
				this.speechBubbles.forEach((sbb) => sbb.update(t,d));
				if(this.tAdvance){
					if(this.tTimer[0] < 0){
						this.tTimer = [500,500];
					}
				}
				if(this.tTimer[0] > 0){
					this.tTimer[0] -= d;
					if(this.tTimer[0] <= 0){
						this.tTimer = [-1000,-1000];
						this.tAdvance = false;
						this.tPhase++;
					}
				}
				break;
			} case 6: {
				this.destroyBubbles();
				this.speechBubbles.push(new SpeechBubble(this, 1080, 0, "sb_kobold", "Well, seems easy enough. But what if I put the wrong time?"));
				this.speechBubbles.push(new SpeechBubble(this, 1280, 360, "sb_jbun", "Wait for it to run out. Or right click it to reduce the time."));
				this.speechBubbles.push(new SpeechBubble(this, 1080, 720, "sb_jbun", "Anyway, you're ready to start."));
				this.adjustBubbles();
				this.tTimer = [-1000,-1000]
				this.tPhase++;
				break;
			} case 7: {
				this.speechBubbles.forEach((sbb) => sbb.update(t,d));
				if(this.tAdvance){
					if(this.tTimer[0] < 0){
						this.tTimer = [500,500];
					}
				}
				if(this.tTimer[0] > 0){
					this.tTimer[0] -= d;
					if(this.tTimer[0] <= 0){
						this.tTimer = [-1000,-1000];
						this.tAdvance = false;
						this.tPhase++;
					}
				}
				break;
			} case 8: {
				this.destroyBubbles();
				this.speechBubbles.push(new SpeechBubble(this, 40, 0, "sb_kobold", "Wait, you said it's busy, what if there's a bunch of orders?"));
				this.speechBubbles.push(new SpeechBubble(this, 240, 360, "sb_jbun", "Well, what do you think your brain is for idiot?"));
				this.speechBubbles.push(new SpeechBubble(this, 40, 720, "sb_jbun", "Juggling is the EXCITING part. How else would you feel alive?"));
				this.adjustBubbles();
				this.tTimer = [-1000,-1000]
				this.tPhase++;
				break;
			} case 9: {
				this.speechBubbles.forEach((sbb) => sbb.update(t,d));
				if(this.tAdvance){
					if(this.tTimer[0] < 0){
						this.tTimer = [500,500];
					}
				}
				if(this.tTimer[0] > 0){
					this.tTimer[0] -= d;
					if(this.tTimer[0] <= 0){
						this.tTimer = [-1000,-1000];
						this.tAdvance = false;
						this.tPhase++;
					}
				}
				break;
			} case 10: {
				this.destroyBubbles();
				this.speechBubbles.push(new SpeechBubble(this, 1080, 0, "sb_jbun", "Anyway, the customers are coming! Better get started!"));
				this.speechBubbles.push(new SpeechBubble(this, 1280, 360, "sb_jbun", "By the way, if the food is terrible, I WILL be adding grilled kobold to the menu."));
				this.speechBubbles.push(new SpeechBubble(this, 1080, 720, "sb_kobold", "Oh my god..."));
				this.adjustBubbles();
				this.tTimer = [-1000,-1000]
				this.tPhase++;
				break;
			} case 11: {
				this.speechBubbles.forEach((sbb) => sbb.update(t,d));
				if(this.tAdvance){
					if(this.tTimer[0] < 0){
						this.tTimer = [500,500];
					}
				}
				if(this.tTimer[0] > 0){
					this.tTimer[0] -= d;
					if(this.tTimer[0] <= 0){
						this.tTimer = [-1000,-1000];
						this.tAdvance = false;
						this.tPhase++;
					}
				}
				break;
			} case 12: {
				this.destroyBubbles();
				this.tPhase++;
			} default: {
				this.inTutorial = false;
				this.startButton.setVisible(true);
			}
		}
		
	}

	fadeBubbles(t: number): boolean{
		let sr = this.speechBubbles.filter((st) => !st.popped);
		if(sr.length < 1){
			this.speechBubbles.forEach((sn) => {
				sn.fade(t);
			});
			return true;
		}
		return false;
	}

	adjustBubbles(){
		this.speechBubbles.forEach((s) => {
			s.setVisible(false);
			this.speechBubbleLayer.add(s);
		});
		this.speechBubbles[0].setVisible(true);
		this.speechBubbles[0].nt = 1000;
	}

	destroyBubbles(){
		this.speechBubbles.forEach((st) => {
			st.destroy();
		});
		this.speechBubbles = [];
	}
	

	completeOrder(order: Order) {
		const slot = this.slots.find((s) => s.order === order);
		if (slot) {
			slot.order = null;
		}

		this.orders = this.orders.filter((o) => o !== order);

		order.destroy();
	}

	advance(){

	}
}
