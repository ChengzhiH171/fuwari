<script lang="ts">
import Icon from "@iconify/svelte";

type Props = Record<string, any>;
let { postDates = [] as string[] }: { postDates?: string[] } = $props() as any;

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

// 以 "YYYY-MM-DD" 为键统计每日文章数
const countByDate = $derived.by(() => {
	const map = new Map<string, number>();
	for (const d of postDates) {
		map.set(d, (map.get(d) ?? 0) + 1);
	}
	return map;
});

let viewYear = $state(new Date().getFullYear());
let viewMonth = $state(new Date().getMonth()); // 0-11
let today = $state(formatDate(new Date()));

function formatDate(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 月历网格：从当月 1 号开始，前补空位
const calendarCells = $derived.by(() => {
	const first = new Date(viewYear, viewMonth, 1);
	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
	const startWeekday = first.getDay(); // 0 = 周日
	const cells: { day: number | null }[] = [];
	for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
	for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
	while (cells.length % 7 !== 0) cells.push({ day: null });
	return cells;
});

// 热力图：过去 12 个月（含当月），每月 5 行代表第 1-5 周
const heatmapData = $derived.by(() => {
	const now = new Date();
	const months: {
		year: number;
		month: number; // 0-11
		label: number; // 1-12
		weeks: { count: number; label: string }[];
	}[] = [];
	for (let i = 11; i >= 0; i--) {
		const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const year = m.getFullYear();
		const month = m.getMonth();
		const weeks: { count: number; label: string }[] = [];
		for (let w = 1; w <= 5; w++) {
			let count = 0;
			for (let d = (w - 1) * 7 + 1; d <= Math.min(w * 7, 31); d++) {
				const dt = new Date(year, month, d);
				if (dt.getMonth() !== month) break;
				count += countByDate.get(formatDate(dt)) ?? 0;
			}
			weeks.push({ count, label: `${month + 1}月第${w}周.. ${count}篇文章` });
		}
		months.push({ year, month, label: month + 1, weeks });
	}
	return months;
});

function levelOf(count: number): number {
	if (count <= 0) return 0;
	if (count <= 1) return 1;
	if (count <= 3) return 2;
	if (count <= 6) return 3;
	return 4;
}

function prevMonth() {
	if (viewMonth === 0) {
		viewYear -= 1;
		viewMonth = 11;
	} else {
		viewMonth -= 1;
	}
}

function nextMonth() {
	if (viewMonth === 11) {
		viewYear += 1;
		viewMonth = 0;
	} else {
		viewMonth += 1;
	}
}

function backToToday() {
	const now = new Date();
	viewYear = now.getFullYear();
	viewMonth = now.getMonth();
	today = formatDate(now);
}

function monthCount(year: number, month: number): number {
	const days = new Date(year, month + 1, 0).getDate();
	let count = 0;
	for (let d = 1; d <= days; d++) {
		count += countByDate.get(formatDate(new Date(year, month, d))) ?? 0;
	}
	return count;
}
</script>

<div class="flex flex-col items-center text-neutral-900 dark:text-neutral-100 select-none">
	<!-- 月份导航 -->
	<div class="flex items-center justify-between w-full px-1">
		<button aria-label="上个月" class="ctl-btn" on:click={prevMonth}>
			<Icon icon="material-symbols:chevron-left" class="text-xl"></Icon>
		</button>
		<button aria-label="回到今天" class="font-bold text-base" on:click={backToToday}>
			{viewYear}年{viewMonth + 1}月
		</button>
		<button aria-label="下个月" class="ctl-btn" on:click={nextMonth}>
			<Icon icon="material-symbols:chevron-right" class="text-xl"></Icon>
		</button>
	</div>

	<!-- 星期表头 -->
	<div class="grid grid-cols-7 w-full mt-2 mb-1">
		{#each WEEKDAYS as wd (wd)}
			<div class="text-center text-xs text-neutral-500 dark:text-neutral-400">{wd}</div>
		{/each}
	</div>

	<!-- 日期网格 -->
	<div class="grid grid-cols-7 w-full gap-y-0.5">
		{#each calendarCells as cell, i (i)}
			<div class="flex items-center justify-center">
				{#if cell.day !== null}
					{@const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`}
					{@const count = countByDate.get(dateStr) ?? 0}
					<div
						class="cal-day {count > 0 ? 'has-post' : ''} {dateStr === today ? 'today' : ''}"
						title={count > 0 ? `${dateStr} · ${count} 篇文章` : undefined}
					>
						{cell.day}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- 热力图月份标签 -->
	<div class="grid grid-cols-12 w-full mt-3">
		{#each heatmapData as m (m.year * 12 + m.month)}
			<div class="text-center text-[9px] text-neutral-500 dark:text-neutral-400">{m.label}</div>
		{/each}
	</div>

	<!-- 热力图网格：每列一个月，5 行代表周 -->
	<div class="grid grid-rows-5 grid-flow-col gap-[2px] mt-1">
		{#each heatmapData as m (m.year * 12 + m.month)}
			{@const mCount = monthCount(m.year, m.month)}
			{#each m.weeks as w, wi (wi)}
				{@const lvl = levelOf(w.count)}
				<div class="heat-cell level-{lvl}" title={mCount > 0 ? w.label : w.label.replace(/\d+篇文章/, "0篇文章")}></div>
			{/each}
		{/each}
	</div>
</div>

<style>
	.ctl-btn {
		opacity: 0.6;
		transition: all 0.15s;
	}
	.ctl-btn:hover {
		opacity: 1;
	}
	.cal-day {
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		transition: all 0.15s;
	}
	.cal-day.has-post {
		color: var(--primary);
		font-weight: 700;
	}
	.cal-day.has-post:hover {
		background: var(--btn-regular-bg);
	}
	.cal-day.today {
		border-color: var(--primary);
	}
	.heat-cell {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 2px;
		background: var(--btn-regular-bg);
		cursor: default;
	}
	.heat-cell.level-1 {
		background: color-mix(in srgb, var(--primary) 25%, transparent);
	}
	.heat-cell.level-2 {
		background: color-mix(in srgb, var(--primary) 45%, transparent);
	}
	.heat-cell.level-3 {
		background: color-mix(in srgb, var(--primary) 70%, transparent);
	}
	.heat-cell.level-4 {
		background: var(--primary);
	}
</style>
