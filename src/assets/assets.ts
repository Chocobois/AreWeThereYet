import { Image, SpriteSheet, Audio } from "./util";
import { image, sound, music, loadFont, spritesheet } from "./util";

/* Images */
const images: Image[] = [
	// Backgrounds
	image("backgrounds/background.png", "background"),
	image("backgrounds/transitionbkg.png", "transitionbkg"),
	image("backgrounds/shopkeep.png", "shopkeep"),
	image("backgrounds/shopkeep_talk.png", "shopkeep_talk"),
	image("backgrounds/shopkeep_smirk.png", "shopkeep_smirk"),
	image("backgrounds/shopkeep_speech.png", "shopkeep_speech"),
	image("backgrounds/timerbox.png", "timerbox"),

	image("backgrounds/st1.png", "st1"),
	image("backgrounds/st2.png", "st2"),

	// Titlescreen
	image("titlescreen/sky.png", "title_sky"),
	image("titlescreen/background.png", "title_background"),
	image("titlescreen/foreground.png", "title_foreground"),
	image("titlescreen/character.png", "title_character"),
	image("backgrounds/kprebkg.png", "kprebkg"),
	image("backgrounds/kbkg.png", "kbkg"),
	image("backgrounds/kbkg_exp.png", "kbkg_exp"),
	image("backgrounds/kbun.png", "kbun"),
	image("backgrounds/kchar.png", "kchar"),
	image("backgrounds/endscreen.png", "endscreen"),

	//Fly
	image("characters/flyf1.png", "flyf1"),
	image("characters/flyf2.png", "flyf2"),
	image("characters/flystand.png", "flystand"),
	image("characters/flyt0.png", "flyt0"),
	image("characters/flyt1.png", "flyt1"),
	image("characters/flydead.png", "flydead"),

	image("characters/smack.png", "smack"),

	image("characters/sb_jbun.png", "sb_jbun"),
	image("characters/sb_kobold.png", "sb_kobold"),

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

	image("timers/bar_bg.png", "bar_bg"),
	image("timers/bar_frame.png", "bar_frame"),
	image("timers/bar_progress.png", "bar_progress"),

	// Food
	image("food/broccoli.png", "broccoli"),
	image("food/eggplant.png", "eggplant"),
	image("food/meat.png", "meat"),
	image("food/pot.png", "pot"),
	image("food/steak.png", "steak"),

	image("bubble.png", "bubble"),
	image("bubble_p.png", "bubble_p"),
	image("pill.png", "pill"),
	image("shadow.png", "shadow"),
];

/* Spritesheets */
const spritesheets: SpriteSheet[] = [
	spritesheet("music.png", "music", 300, 300),
	spritesheet("audio.png", "audio", 300, 300),
];

/* Audios */
const audios: Audio[] = [
	music("kitchentimer.mp3", "m_kitchentimer"),
	music("kitchentimer_title.mp3", "m_kitchentimer_title"),
	music("kitchentimer_intro.mp3", "m_kitchentimer_intro"),
	music("kitchentimer_side.mp3", "m_kitchentimer_side"),
	sound("kitchentimer_side_end.mp3", "m_kitchentimer_side_end"),

	sound("flyslap.mp3", "flyslap", 0.5),
	sound("perfect.mp3", "perfect", 0.5),
	sound("ok.mp3", "ok", 0.5),
	sound("bad.mp3", "bad", 0.5),
	sound("terrible.mp3", "terrible", 0.5),
	sound("expire.mp3", "expire", 0.5),
	sound("tooltip.mp3", "tooltip", 0.5),
	sound("eggtick.mp3", "eggtick", 0.5),
	sound("neworder.mp3", "neworder", 0.5),
	sound("scroll.mp3", "scroll", 0.5),
	sound("boom.mp3", "boom", 0.5),
	sound("buy.mp3", "buy", 0.5),
		sound("ding.mp3", "ding", 0.5),

	sound("vo/three.mp3", "v_three", 1),
	sound("vo/two.mp3", "v_two", 1),
	sound("vo/one.mp3", "v_one", 1),
	sound("vo/go.mp3", "v_go", 1),
	sound("vo/good_job.mp3", "v_good_job", 1),
];

/* Fonts */
await loadFont("DynaPuff-Medium.ttf", "Game Font");

export { images, spritesheets, audios };
