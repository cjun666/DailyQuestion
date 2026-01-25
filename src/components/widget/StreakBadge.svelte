<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { getStreak, type StreakData } from "../../utils/question-storage";

let streak = $state<StreakData | null>(null);

function refresh() {
	if (typeof window === "undefined") return;
	streak = getStreak();
}

onMount(() => {
	refresh();
	const handler = () => refresh();
	window.addEventListener("question-answered", handler);
	return () => window.removeEventListener("question-answered", handler);
});
</script>

{#if streak && (streak.current > 0 || streak.achievements.length > 0)}
	<div
		class="streak-badge flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--btn-regular-bg)] dark:bg-[var(--btn-regular-bg)] text-[var(--primary)] font-semibold text-sm"
		role="status"
		aria-label="连续答对 {streak.current} 天"
		title="连续答对 {streak.current} 天 · 最佳 {streak.best} 天"
	>
		<Icon icon="material-symbols:local-fire-department-rounded" class="text-lg" />
		<span class="hidden sm:inline">连续</span>
		<span class="tabular-nums">{streak.current}</span>
		<span class="hidden sm:inline">天</span>
	</div>
	{#if streak.achievements.length > 0}
		<div class="flex items-center gap-1" role="list" aria-label="成就徽章">
			{#each streak.achievements as badge}
				<span
					class="badge-pill animate-badge-in px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--primary)]/20 dark:bg-[var(--primary)]/30 text-[var(--primary)]"
					role="listitem"
					title="{badge}"
				>
					{badge}
				</span>
			{/each}
		</div>
	{/if}
{/if}

<style>
	.animate-badge-in {
		animation: badge-pop 0.4s ease-out;
	}
	@keyframes badge-pop {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		70% {
			transform: scale(1.05);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
