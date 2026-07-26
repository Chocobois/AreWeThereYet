const overlap = 2;

const Data = {
	m_main_menu: {
		offset: 0.424,
		bpm: 60,
	},
	m_first: {
		offset: 0,
		bpm: 140,
		loop: true,
		start: 0 + overlap,
		end: 760286 / 48000 + overlap,
	},
	m_first_draw: {
		offset: 0,
		bpm: 140,
		loop: true,
		start: 0 + overlap,
		end: 760286 / 48000 + overlap,
	},
	m_first_end: {
		offset: 0,
		bpm: 0,
		loop: false,
	},
	m_shop: {
		offset: 41860 / 48000,
		bpm: 86,
		loop: true,
		start: 41860 / 48000 + overlap,
		end: 2854884 / 48000 + overlap,
	},
	m_kitchentimer: {
		offset: 1180 / 44100,
		bpm: 120,
		loop: true,
		start: 1180 / 44100 + 16 + overlap,
		end:   1180 / 44100 + 78 + overlap,
	},
	m_kitchentimer_intro: {
		offset: 1180 / 44100,
		bpm: 120,
		loop: true,
		start: 1180 / 44100 + overlap/2,
		end:   1180 / 44100 + overlap/2 + 8,
	},
	m_kitchentimer_side: {
		offset: 0.125,
		bpm: 120,
		loop: true,
		start: 2.125 + overlap/2,
		end:  18.125 + overlap/2,
	},
	m_kitchentimer_title: {
		offset: 0.27,
		bpm: 183,
		loop: false
	}
};

export type MusicKey = keyof typeof Data;
export type MusicDataType = {
	[K in MusicKey]: {
		offset: number;
		bpm: number;
		loop: boolean;
		start: number;
		end: number;
	};
};

export default Data as MusicDataType;
