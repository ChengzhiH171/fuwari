import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

export type MusicTrack = {
	/** 歌曲名 */
	title: string;
	/** 歌手名 */
	artist: string;
	/** 封面图 URL 或路径（相对于 /public 目录以 / 开头，否则为网络地址） */
	cover?: string;
	/** 音频文件 URL */
	url: string;
};

export type MusicConfig = {
	enable: boolean;
	/** 侧边栏标题，默认 "音乐" */
	name?: string;
	tracks: MusicTrack[];
};

export type WeatherConfig = {
	enable: boolean;
	/** 显示的位置名称，例如 "重庆城区 沙坪坝区" */
	location: string;
	/** 纬度，用于 Open-Meteo 查询 */
	latitude: number;
	/** 经度，用于 Open-Meteo 查询 */
	longitude: number;
	/** "更多" 按钮跳转链接 */
	moreUrl: string;
};

export type CalendarWidgetConfig = {
	enable: boolean;
	/** 侧边栏标题，默认 "日期" */
	name?: string;
};
