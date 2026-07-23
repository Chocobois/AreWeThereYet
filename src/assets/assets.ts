import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
const images: Image[] = [
	// Backgrounds
	image("backgrounds/background.png", "background"),

	// Titlescreen
	image("titlescreen/sky.png", "title_sky"),
	image("titlescreen/background.png", "title_background"),
	image("titlescreen/foreground.png", "title_foreground"),
	image("titlescreen/character.png", "title_character"),

	// Car
	image("front.png", "front"),

	// Cooking
	image("timer_1.png", "timer_1"),
	image("timer_2.png", "timer_2"),
	image("timer_3.png", "timer_3"),

	image("food/broccoli.png", "broccoli"),
	image("food/eggplant.png", "eggplant"),
	image("food/meat.png", "meat"),
	image("food/pot.png", "pot"),
	image("food/steak.png", "steak"),

	image("bubble.png", "bubble"),
	image("pill.png", "pill"),
	image("shadow.png", "shadow"),
];

/* Spritesheets */
const spritesheets: SpriteSheet[] = [];

/* Audios */
const audios: Audio[] = [
	music("title.mp3", "m_main_menu"),
	music("first.mp3", "m_first"),
	sound("tree/rustle.mp3", "t_rustle", 0.5),
];

/* Fonts */
await loadFont("DynaPuff-Medium.ttf", "Game Font");

export { images, spritesheets, audios };
