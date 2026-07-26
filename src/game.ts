import Phaser from "phaser";
import { PreloadScene } from "@/scenes/PreloadScene";
import { TitleScene } from "@/scenes/TitleScene";
import { TimerSelectScene } from "./scenes/TimerSelectScreen";
import { GameScene } from "@/scenes/GameScene";
import { StoryScene } from "./scenes/StoryScene";

export async function Game() {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 1920,
    height: 1080,
    mipmapFilter: "LINEAR_MIPMAP_LINEAR",
    roundPixels: false,
    scale: {
      mode: Phaser.Scale.FIT,
    },
    scene: [PreloadScene, TitleScene, StoryScene, GameScene, TimerSelectScene],

    plugins: {
      global: [],
    },
  };

  const game = new Phaser.Game(config);

  game.sound.pauseOnBlur = false;
  
  game.events.on('blur', () => {
    game.sound.setVolume(0.2); 
  });

  game.events.on('focus', () => {
    game.sound.setVolume(1.0);
  });

  game.events.on("hidden", () => {
    game.sound.pauseAll();
  })

  game.events.on("visible", () => {
    game.sound.resumeAll();
  })
}
