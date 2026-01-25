<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	type Difficulty,
	getStats,
	type StatsData,
} from "../../utils/question-storage";

const difficultyLabels: Record<Difficulty, string> = {
	easy: "简单",
	medium: "中等",
	hard: "困难",
};

let stats = $state<StatsData | null>(null);

function refresh() {
	if (typeof window === "undefined") return;
	stats = getStats();
}

onMount(() => {
	refresh();
	window.addEventListener("question-answered", refresh);
	return () => window.removeEventListener("question-answered", refresh);
});

const total = $derived(stats?.totalAnswered ?? 0);
const correct = $derived(stats?.totalCorrect ?? 0);
const accuracy = $derived(stats?.accuracy ?? 0);
const byDiff = $derived(stats?.byDifficulty ?? null);
const maxAnswered = $derived(
	byDiff
		? Math.max(
				byDiff.easy.answered,
				byDiff.medium.answered,
				byDiff.hard.answered,
			)
		: 0,
);
</script>

<div
	class="stats-panel rounded-xl p-4 bg-[var(--card-bg)] border border-black/5 dark:border-white/10 animate-fade-in"
	role="region"
	aria-label="答题统计"
>
	<h3 class="text-sm font-semibold text-75 mb-4 flex items-center gap-2">
		<Icon icon="material-symbols:analytics-outline-rounded" class="text-lg" />
		答题统计
	</h3>

	{#if stats}
		<div class="space-y-4">
			<div class="grid grid-cols-3 gap-2 text-center">
				<div class="rounded-lg bg-black/5 dark:bg-white/5 p-3">
					<div class="text-2xl font-bold text-[var(--primary)]">{total}</div>
					<div class="text-xs text-50">总答题数</div>
				</div>
				<div class="rounded-lg bg-black/5 dark:bg-white/5 p-3">
					<div class="text-2xl font-bold text-green-500">{correct}</div>
					<div class="text-xs text-50">答对</div>
				</div>
				<div class="rounded-lg bg-black/5 dark:bg-white/5 p-3">
					<div class="text-2xl font-bold text-[var(--primary)]">{accuracy}%</div>
					<div class="text-xs text-50">正确率</div>
				</div>
			</div>

			{#if byDiff && maxAnswered > 0}
				<div>
					<div class="text-xs font-medium text-50 mb-2">各难度分布</div>
					<div class="space-y-2">
						{#each ["easy", "medium", "hard"] as d}
							{@const diff = d as Difficulty}
							{@const data = byDiff[diff]}
							{@const w = maxAnswered > 0 ? (100 * data.answered) / maxAnswered : 0}
							<div class="flex items-center gap-2">
								<span class="w-12 text-xs text-75">{difficultyLabels[diff]}</span>
								<div
									class="h-6 flex-1 rounded-md bg-black/5 dark:bg-white/5 overflow-hidden"
									role="presentation"
								>
									<div
										class="h-full rounded-md bg-[var(--primary)]/30 transition-all duration-500"
										style="width: {w}%"
									></div>
								</div>
								<span class="text-xs text-50 w-16 text-right"
									>{data.answered} 题 · {data.answered > 0
										? Math.round((100 * data.correct) / data.answered)
										: 0}% 对</span
								>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="text-sm text-50 py-6 text-center">暂无答题记录</div>
	{/if}
</div>

<style>
	.animate-fade-in {
		animation: stats-fade-in 0.4s ease-out;
	}
	@keyframes stats-fade-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
