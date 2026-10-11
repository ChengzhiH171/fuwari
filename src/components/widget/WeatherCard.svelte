<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type Props = Record<string, any>;
const {
	location = "",
	latitude,
	longitude,
	moreUrl = "",
}: { location?: string; latitude: number; longitude: number; moreUrl?: string } = $props() as any;

let loading = $state(true);
let failed = $state(false);
let temp = $state<number | null>(null);
let tempMax = $state<number | null>(null);
let tempMin = $state<number | null>(null);
let weatherCode = $state(0);
let isDay = $state(true);

const WEATHER_MAP: Record<number, { text: string; icon: string }> = {
	0: { text: "晴", icon: "material-symbols:clear-day" },
	1: { text: "晴间多云", icon: "material-symbols:partly-cloudy-day" },
	2: { text: "多云", icon: "material-symbols:partly-cloudy-day" },
	3: { text: "阴", icon: "material-symbols:cloud" },
	45: { text: "雾", icon: "material-symbols:foggy" },
	48: { text: "雾凇", icon: "material-symbols:foggy" },
	51: { text: "毛毛雨", icon: "material-symbols:rainy" },
	53: { text: "毛毛雨", icon: "material-symbols:rainy" },
	55: { text: "大毛毛雨", icon: "material-symbols:rainy" },
	56: { text: "冻毛毛雨", icon: "material-symbols:rainy" },
	57: { text: "冻毛毛雨", icon: "material-symbols:rainy" },
	61: { text: "小雨", icon: "material-symbols:rainy" },
	63: { text: "中雨", icon: "material-symbols:rainy" },
	65: { text: "大雨", icon: "material-symbols:rainy" },
	66: { text: "冻雨", icon: "material-symbols:rainy" },
	67: { text: "冻雨", icon: "material-symbols:rainy" },
	71: { text: "小雪", icon: "material-symbols:weather-snowy" },
	73: { text: "中雪", icon: "material-symbols:weather-snowy" },
	75: { text: "大雪", icon: "material-symbols:weather-snowy" },
	77: { text: "雪粒", icon: "material-symbols:weather-snowy" },
	80: { text: "阵雨", icon: "material-symbols:rainy" },
	81: { text: "阵雨", icon: "material-symbols:rainy" },
	82: { text: "强阵雨", icon: "material-symbols:rainy" },
	85: { text: "阵雪", icon: "material-symbols:weather-snowy" },
	86: { text: "阵雪", icon: "material-symbols:weather-snowy" },
	95: { text: "雷阵雨", icon: "material-symbols:thunderstorm" },
	96: { text: "雷阵雨伴冰雹", icon: "material-symbols:thunderstorm" },
	99: { text: "雷阵雨伴冰雹", icon: "material-symbols:thunderstorm" },
};

const weather = $derived(WEATHER_MAP[weatherCode] ?? { text: "未知", icon: "material-symbols:cloud" });

onMount(async () => {
	try {
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
			`&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min` +
			`&timezone=auto&forecast_days=1`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		temp = Math.round(data.current.temperature_2m);
		weatherCode = data.current.weather_code;
		isDay = data.current.is_day === 1;
		tempMax = Math.round(data.daily.temperature_2m_max[0]);
		tempMin = Math.round(data.daily.temperature_2m_min[0]);
	} catch {
		failed = true;
	} finally {
		loading = false;
	}
});
</script>

<div class="flex flex-col text-neutral-900 dark:text-neutral-100 select-none">
	{#if loading}
		<div class="flex items-center gap-2 h-20 text-sm text-neutral-500 dark:text-neutral-400">
			<Icon icon="material-symbols:progress-activity" class="text-[1.25rem] animate-spin"></Icon>
			正在获取天气信息…
		</div>
	{:else if failed}
		<div class="flex items-center gap-2 h-20 text-sm text-neutral-500 dark:text-neutral-400">
			<Icon icon="material-symbols:cloud-off" class="text-[1.25rem]"></Icon>
			天气获取失败，请稍后再试
		</div>
	{:else}
		<!-- 位置 -->
		<div class="flex items-center gap-1 text-sm">
			<Icon icon="material-symbols:location-on" class="text-[1.1rem] text-[var(--primary)]"></Icon>
			<span class="truncate">{location}</span>
		</div>

		<!-- 温度 + 天气图标 -->
		<div class="flex items-center justify-between mt-1">
			<div class="flex items-end gap-3">
				<div class="text-5xl font-bold leading-none">
					{temp}<span class="text-lg align-top">°</span>
				</div>
				<div class="text-base pb-0.5">{weather.text}</div>
			</div>
			<Icon
				icon={isDay ? weather.icon : "material-symbols:clear-night"}
				class="text-[3rem] text-[var(--primary)]"
			></Icon>
		</div>

		<!-- 高低温 -->
		<div class="flex justify-center gap-1 text-sm mt-3">
			<span class="text-red-500">高温 {tempMax}°C</span>
			<span class="text-neutral-500 dark:text-neutral-400">/</span>
			<span class="text-sky-500">低温 {tempMin}°C</span>
		</div>

		<!-- 更多 -->
		{#if moreUrl}
			<a
				href={moreUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="mt-3 flex items-center justify-center gap-1.5 text-sm text-[var(--primary)] hover:opacity-80 transition"
			>
				<Icon icon="material-symbols:more-horiz" class="text-[1.5rem]"></Icon>
				更多
			</a>
		{/if}
	{/if}
</div>
