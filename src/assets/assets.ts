import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
const images: Image[] = [
	// Backgrounds
	image("backgrounds/background", "background"),

	// Characters
	image("characters/player", "player"),

	// Items
	image("items/coin", "coin"),

	// UI
	image("ui/hud", "hud"),

	// Titlescreen
	image("titlescreen/sky", "title_sky"),
	image("titlescreen/background", "title_background"),
	image("titlescreen/foreground", "title_foreground"),
	image("titlescreen/character", "title_character"),

	// Car
	image("front", "front"),

	// Cooking
	image("timer_1", "timer_1"),
	image("timer_2", "timer_2"),
	image("timer_3", "timer_3"),

	image("broccoli", "broccoli"),
	image("eggplant", "eggplant"),
	image("meat", "meat"),
	image("pot", "pot"),
	image("steak", "steak"),

	image("bubble", "bubble"),
	image("pill", "pill"),
	image("shadow", "shadow"),
];

/* Spritesheets */
const spritesheets: SpriteSheet[] = [];

/* Audios */
const audios: Audio[] = [
	music("title", "m_main_menu"),
	music("first", "m_first"),
	sound("tree/rustle", "t_rustle", 0.5),
];

/* Fonts */
await loadFont("DynaPuff-Medium", "Game Font");

export { images, spritesheets, audios };
