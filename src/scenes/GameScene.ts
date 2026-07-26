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
import { GetStage, Stage } from "@/components/Stages";
import StartButton from "@/components/buttons/StartButton";

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
	private previousBarIntro: number = -1;

	private timers: Timer[];
	private orders: Order[];
	private flies: Fly[];

	private totalScore: number;
	private scoreText: Phaser.GameObjects.Text;
	private timeText: Phaser.GameObjects.Text;
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

	public multiplier: number;
	public orderExpiryAccel: number = 0;
	public difficulty: number;

	private queueUpdate: boolean;
	private pauseOrders: boolean;

	private orderTimer: number[]; 
	private flyTimer: number[]; 

	private startButton: StartButton;

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

	constructor() {
		super({ key: "GameScene" });
		this.gameStarted = false;
	}

	

	create(): void {
		this.currentStage = structuredClone(GetStage(0));

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

		this.stageTimer = 60000;

		this.timers = [];
		this.timers.push(new GreenEgg(this, 600, 800));
		//this.timers.push(new Golen(this, 1000, 700));
		//this.timers.push(new BlueCone(this, 1400, 800));
		//this.timers.push(new Hourglass(this, 800, 500));

		this.musicKitchentimerIntro.on('bar',  this.onBarIntro.bind(this));
		this.musicKitchentimer.on('bar', this.onBar.bind(this));

		this.timeText = this.addText({ x: this.CX, y: this.H - 100, size: 64, text: formatTime(this.currentStage.stageTime) })
							.setStroke("black", 16)
							.setOrigin(0.5,0);

		this.textGetReady = this.addText({ x: this.CX, y: this.CY, size: 64, text: "Get ready . . ." })
								.setStroke("black", 16)
								.setOrigin(0.5,0.5)
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
		this.startButton.on("click", () => {
			this.startButton.setVisible(false);
			this.gameStarted = true;
			this.textGetReady.setVisible(true);
		});
		this.startButton.setScale(4, 1)

		// Endlessly looping gameplay



		/*
		const orderSpawner = this.time.addEvent({
			delay: this.orderDelay,
			loop: true,
			callback: () => {
				// Allow a maximum of 2 pending or active orders
				const pendingOrders = this.orders.filter((order) => !order.accepted);
				const activeOrders = this.orders.filter ((order) => !order.completed);
				if ((pendingOrders.length < this.maxNewOrders) && (activeOrders.length < this.maxActiveOrders)) {
					this.newOrder();
				}
			},
			callbackScope: this,
		});

		*/
		

		/*
		const flySpawner = this.time.addEvent({
			delay: this.flySpawnDelay,
			loop: true,
			startAt: -30000,
			callback: () => {
				// Allow a maximum of 2 pending orders
				if ((this.flies.length < this.maxFlies) && (Math.random() < this.flySpawnChance)) {
					this.spawnFly();
				}
			},
			callbackScope: this,
		});
		*/
		
	}

	checkDesync(prevBar: number, currBar: number) {
		if ((prevBar < currBar) && (currBar - prevBar > 1)) {
			console.log(`Possible intro music desync detected: bar ${prevBar} -> ${currBar}`)
			return true
		}
		return false
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
			this.timers.forEach((timer) => timer.decrementTime());
			this.orders.forEach((order) => order.decrementTime());
	
			if(--this.currentStage.stageTime > 0) {
				this.timeText.setText(formatTime(this.currentStage.stageTime));
			}
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
			}
		}
	}

	setBasicVariables(){
		this.initDifficulty();
		this.queueUpdate = false;
		this.orderTimer = [this.orderDelay, this.orderDelay];
		this.flyTimer = [this.flySpawnDelay+30000,this.flySpawnDelay];
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
		this.orderExpiryAccel = 0;
	}

	update(time: number, delta: number) {
		this.timers.forEach((timer) => {
			timer.update(time, delta);
			timer.setDepth(10 + timer.y / 1000);
		});

		this.orders.forEach((order) => {
			order.update(time, delta);
			order.setDepth(20);
		});

		this.updateOrderSpawn(time, delta);

		for(let fl = (this.flies.length-1); fl >= 0; fl--){
			this.flies[fl].update(time, delta);
			this.flies[fl].setDepth(40);
			if(this.flies[fl].deleteFlag) {
				this.flies[fl].destroy();
				this.flies.splice(fl,1);
			}
		}

		this.updateFlySpawn(time, delta);

		this.scoreText.setText(`Score: ${this.totalScore}`);

		this.stageTimer -= delta;
		if(this.stageTimer <= 0){
			this.increaseDifficulty();
			this.stageTimer = 60000;
		}

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
		if(Math.random() < this.offOrderChance){
			adj = 1+Math.trunc(Math.random()*9);
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
			this.totalScore += score;
			this.scoreText.setText(`Score: ${this.totalScore}`);
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

	addScore(n: number){
		this.totalScore += n;
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
		switch(this.difficulty){
			case 1: {
				this.maxActiveOrders = 2;
				break;
			} case 2: {
				this.maxActiveOrders = 3;
				this.maxNewOrders = 2;
				break;
			} case 3: {
				this.flySpawnChance = 0.5;
				break;
			} case 4: {
				this.offOrderChance = 0.2;
				this.maxFlies = 2;
				this.orderExpiryAccel = 5;
				this.flySpawnDelay -= 1000;
				break;
			} case 5 : {
				this.maxActiveOrders = 4;
				this.maxNewOrders = 3;
				break;
			} case 6: {
				this.orderDelay = 6250;
				this.flySpawnDelay -= 1000;
				this.flySpawnChance = 0.6;
				this.offOrderChance = 0.3;
				break;
			} case 7: {
				this.maxActiveOrders = 5;
				this.maxNewOrders = 4;
				this.maxFlies = 3;
				break;
			} case 8: {
				this.offOrderChance = 0.4;
				this.orderDelay = 5000;
				this.flySpawnDelay -= 1000;
				break;
			} case 9: {
				this.offOrderChance = 0.5;
				this.maxFlies = 4;
				this.maxNewOrders = 5;
				this.orderExpiryAccel = 5;
			} default: {
				this.orderDelay = Math.max(1000, this.orderDelay - 500);
				this.offOrderChance = Math.min(0.95, this.offOrderChance + 0.05);
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
