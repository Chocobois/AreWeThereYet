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

	// Timers
	image("timers/green_egg.png", "timer_green_egg"),
	image("timers/blue_cone.png", "timer_blue_cone"),
	image("timers/golen.png", "timer_golen"),
	image("timers/hourglass_1.png", "timer_hourglass_1"),
	image("timers/hourglass_2.png", "timer_hourglass_2"),
	image("timers/hourglass_3.png", "timer_hourglass_3"),
	image("timers/hourglass_4.png", "timer_hourglass_4"),
	image("timers/hourglass_5.png", "timer_hourglass_5"),

	// Food
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
