<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { isAnswered } from "../../utils/question-storage";

interface Props {
	dateStr: string;
}

let { dateStr }: Props = $props();
let answered = $state(false);

onMount(() => {
	answered = isAnswered(dateStr);
	const handler = () => {
		answered = isAnswered(dateStr);
	};
	window.addEventListener("question-answered", handler);
	return () => window.removeEventListener("question-answered", handler);
});
</script>

{#if answered}
	<span
		class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400"
		role="status"
	>
		<Icon icon="material-symbols:check-circle-rounded" class="text-sm" />
		已完成
	</span>
{/if}
