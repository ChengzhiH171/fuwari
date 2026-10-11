<script lang="ts">
import Icon from "@iconify/svelte";
import type { MusicTrack } from "../../types/config";

type Props = Record<string, any>;
const { tracks }: { tracks: MusicTrack[] } = $props() as any;

let audio: HTMLAudioElement | null = null;
let currentIndex = $state(0);
let playing = $state(false);
let currentTime = $state(0);
let duration = $state(0);
let volume = $state(0.7);
let muted = $state(false);
let shuffle = $state(false);
let showPlaylist = $state(false);

const currentTrack = $derived(tracks[currentIndex] ?? null);
const progress = $derived(duration > 0 ? currentTime / duration : 0);

$effect(() => {
	if (audio) {
		audio.volume = volume;
		audio.muted = muted;
	}
});

function formatTime(sec: number): string {
	if (!isFinite(sec) || sec < 0) return "0:00";
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${String(s).padStart(2, "0")}`;
}

function togglePlay() {
	if (!audio) return;
	if (playing) {
		audio.pause();
	} else {
		audio.play().catch(() => {});
	}
}

function randomIndex(): number {
	if (tracks.length <= 1) return 0;
	let idx = currentIndex;
	while (idx === currentIndex) {
		idx = Math.floor(Math.random() * tracks.length);
	}
	return idx;
}

function nextTrack(auto = false) {
	if (tracks.length === 0) return;
	if (tracks.length <= 1 && auto) {
		if (audio) {
			audio.currentTime = 0;
			audio.play().catch(() => {});
		}
		return;
	}
	currentIndex = shuffle && tracks.length > 1 ? randomIndex() : (currentIndex + 1) % tracks.length;
}

function prevTrack() {
	if (tracks.length === 0) return;
	if (audio && audio.currentTime > 3) {
		audio.currentTime = 0;
		return;
	}
	currentIndex = shuffle && tracks.length > 1 ? randomIndex() : (currentIndex - 1 + tracks.length) % tracks.length;
}

function selectTrack(i: number) {
	currentIndex = i;
	if (audio) audio.play().catch(() => {});
}

function seek(e: PointerEvent) {
	const bar = e.currentTarget as HTMLElement;
	const rect = bar.getBoundingClientRect();
	const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
	if (audio && duration > 0) {
		audio.currentTime = ratio * duration;
	}
}

function setVolume(e: Event) {
	const v = parseFloat((e.target as HTMLInputElement).value);
	volume = v;
	if (v > 0) muted = false;
}

function toggleMute() {
	muted = !muted;
}
</script>

<div class="flex flex-col text-neutral-900 dark:text-neutral-100 select-none">
	<!-- 封面 + 歌曲信息 + 音量 -->
	<div class="flex items-center gap-3">
		<div class="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--btn-regular-bg)]">
			{#if currentTrack?.cover}
				<img src={currentTrack.cover} alt={currentTrack.title} class="w-full h-full object-cover" draggable="false" />
			{:else}
				<div class="w-full h-full flex items-center justify-center bg-[var(--primary)]/20">
					<Icon icon="material-symbols:music-note" class="text-[1.75rem] text-[var(--primary)]"></Icon>
				</div>
			{/if}
		</div>
		<div class="flex-1 min-w-0">
			<div class="font-bold text-sm truncate" title={currentTrack?.title}>{currentTrack?.title ?? "暂无歌曲"}</div>
			<div class="text-xs text-neutral-500 dark:text-neutral-400 truncate">{currentTrack?.artist ?? ""}</div>
			<div class="flex items-center gap-2 mt-1">
				<span class="text-[10px] text-neutral-500 dark:text-neutral-400 tabular-nums">
					{formatTime(currentTime)} / {formatTime(duration)}
				</span>
				<button aria-label="静音" class="shrink-0" on:click={toggleMute}>
					<Icon
						icon={muted || volume === 0 ? "material-symbols:volume-off" : "material-symbols:volume-up"}
						class="text-[1rem] text-[var(--primary)]"
					></Icon>
				</button>
				<input
					aria-label="音量"
					type="range"
					min="0"
					max="1"
					step="0.01"
					bind:value={volume}
					on:input={setVolume}
					class="vol-slider flex-1 min-w-0"
				/>
			</div>
		</div>
	</div>

	<!-- 进度条 -->
	<div
		class="progress-bar mt-2 cursor-pointer"
		role="slider"
		aria-label="播放进度"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(progress * 100)}
		on:pointerdown={seek}
	>
		<div class="progress-fill" style:width={`${progress * 100}%`}></div>
	</div>

	<!-- 控制按钮 -->
	<div class="flex items-center justify-center gap-5 mt-2">
		<button
			aria-label="随机播放"
			on:click={() => (shuffle = !shuffle)}
			class="ctl-btn {shuffle ? 'text-[var(--primary)] opacity-100' : ''}"
		>
			<Icon icon="material-symbols:shuffle" class="text-[1.25rem]"></Icon>
		</button>
		<button aria-label="上一首" on:click={prevTrack} class="ctl-btn">
			<Icon icon="material-symbols:skip-previous" class="text-[1.5rem]"></Icon>
		</button>
		<button
			aria-label={playing ? "暂停" : "播放"}
			on:click={togglePlay}
			class="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center
				shadow-md active:scale-90 will-change-transform transition-transform"
		>
			<Icon icon={playing ? "material-symbols:pause" : "material-symbols:play-arrow"} class="text-[1.75rem] -translate-x-px"></Icon>
		</button>
		<button aria-label="下一首" on:click={() => nextTrack(false)} class="ctl-btn">
			<Icon icon="material-symbols:skip-next" class="text-[1.5rem]"></Icon>
		</button>
		<button
			aria-label="播放列表"
			on:click={() => (showPlaylist = !showPlaylist)}
			class="ctl-btn {showPlaylist ? 'text-[var(--primary)] opacity-100' : ''}"
		>
			<Icon icon="material-symbols:queue-music" class="text-[1.25rem]"></Icon>
		</button>
	</div>

	<!-- 播放列表 -->
	{#if showPlaylist}
		<div class="mt-3 border-t border-neutral-200 dark:border-neutral-700 pt-2 max-h-44 overflow-y-auto">
			{#each tracks as t, i (i)}
				<button
					class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs hover:bg-[var(--btn-regular-bg)] transition
						{i === currentIndex ? 'text-[var(--primary)]' : ''}"
					on:click={() => selectTrack(i)}
				>
					<Icon
						icon={i === currentIndex && playing ? "material-symbols:graphic-eq" : "material-symbols:music-note"}
						class="text-[0.9rem] shrink-0"
					></Icon>
					<span class="truncate flex-1">{t.title}</span>
					<span class="truncate max-w-[5rem] text-neutral-500 dark:text-neutral-400 shrink-0">{t.artist}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if tracks.length > 0}
	<audio
		bind:this={audio}
		src={currentTrack?.url}
		on:play={() => (playing = true)}
		on:pause={() => (playing = false)}
		on:timeupdate={() => (currentTime = audio?.currentTime ?? 0)}
		on:loadedmetadata={() => (duration = audio?.duration ?? 0)}
		on:ended={() => nextTrack(true)}
	></audio>
{/if}

<style>
	.progress-bar {
		height: 0.375rem;
		border-radius: 9999px;
		background: var(--btn-regular-bg);
		overflow: hidden;
		touch-action: none;
	}
	.progress-fill {
		height: 100%;
		border-radius: 9999px;
		background: var(--primary);
		transition: width 0.15s linear;
	}
	.ctl-btn {
		color: var(--btn-content);
		opacity: 0.75;
		transition: all 0.15s;
	}
	.ctl-btn:hover {
		opacity: 1;
		transform: scale(1.1);
	}
	.vol-slider {
		-webkit-appearance: none;
		appearance: none;
		height: 0.25rem;
		border-radius: 9999px;
		background: var(--btn-regular-bg);
		outline: none;
		cursor: pointer;
	}
	.vol-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
		background: var(--primary);
	}
	.vol-slider::-moz-range-thumb {
		width: 0.625rem;
		height: 0.625rem;
		border: none;
		border-radius: 50%;
		background: var(--primary);
	}
</style>
