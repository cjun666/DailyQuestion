<script lang="ts">
import { onMount } from "svelte";
import { getDailyRecords } from "../../utils/question-storage";

function formatDateToYYYYMMDD(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

let year = $state(new Date().getFullYear());
let month = $state(new Date().getMonth());
let records = $state<Record<string, { correct?: boolean }>>({});

function refresh() {
	if (typeof window === "undefined") return;
	const r = getDailyRecords();
	const out: Record<string, { correct?: boolean }> = {};
	for (const [k, v] of Object.entries(r)) {
		if (!v.answered) continue;
		out[k] = { correct: v.correct };
	}
	records = out;
}

onMount(() => {
	refresh();
	window.addEventListener("question-answered", refresh);
	return () => window.removeEventListener("question-answered", refresh);
});

const daysInMonth = new Date(year, month + 1, 0).getDate();
const firstWeekday = new Date(year, month, 1).getDay();
const monthLabel = new Date(year, month, 1).toLocaleDateString("zh-CN", {
	month: "long",
	year: "numeric",
});

const answered = $derived(
	Array.from({ length: daysInMonth }, (_, i) =>
		formatDateToYYYYMMDD(new Date(year, month, i + 1)),
	).filter((k) => records[k]).length,
);
const total = daysInMonth;
const pct = $derived(total > 0 ? Math.round((100 * answered) / total) : 0);
</script>

<div class="progress-calendar rounded-xl p-4 bg-[var(--card-bg)] border border-black/5 dark:border-white/10">
	<h3 class="text-sm font-semibold text-75 mb-3">本月答题进度</h3>
	<div class="flex items-center gap-4 mb-4">
		<div
			class="progress-ring w-14 h-14 rounded-full flex items-center justify-center shrink-0"
			style="--pct: {pct};"
			role="img"
			aria-label="本月进度 {pct}%"
		>
			<span class="progress-ring-inner text-sm font-bold text-[var(--primary)]">{pct}%</span>
		</div>
		<div class="text-sm text-50">
			<div>已答 <span class="font-semibold text-[var(--primary)]">{answered}</span> / {total} 天</div>
		</div>
	</div>
	<div class="grid grid-cols-7 gap-1 text-center">
		{#each ["日","一","二","三","四","五","六"] as w}
			<div class="text-xs text-50 font-medium">{w}</div>
		{/each}
		{#each Array(firstWeekday) as _}
			<div></div>
		{/each}
		{#each Array(daysInMonth) as _, i}
			{@const d = i + 1}
			{@const date = new Date(year, month, d)}
			{@const key = formatDateToYYYYMMDD(date)}
			{@const rec = records[key]}
			<button
				type="button"
				class="progress-day aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center {rec
					? 'bg-[var(--primary)]/20 dark:bg-[var(--primary)]/30 text-[var(--primary)]'
					: 'bg-black/5 dark:bg-white/5 text-50'}"
				title={rec ? "已答题" : "未答题"}
			>
				{d}
			</button>
		{/each}
	</div>
</div>

<style>
	.progress-ring {
		background: conic-gradient(
			var(--primary) calc(var(--pct) * 1%),
			var(--btn-regular-bg) 0
		);
		padding: 4px;
	}
	.progress-ring-inner {
		background: var(--card-bg);
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.progress-day:hover {
		transform: scale(1.08);
	}
</style>
