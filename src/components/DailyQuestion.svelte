<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { CollectionEntry } from "astro:content";

	interface Props {
		question: CollectionEntry<"daily-questions">;
		explanationId?: string;
	}

	let { question, explanationId = "daily-explanation" }: Props = $props();

	let selectedAnswer: number | null = $state(null);
	let submitted = $state(false);
	let isCorrect = $state(false);

	const choices = question.data.choices;
	// 确保 correct 是数字类型
	const correct = Number(question.data.correct);
	const optionLabels = ["A", "B", "C", "D"];

	function selectAnswer(index: number) {
		if (submitted) return;
		selectedAnswer = Number(index);
	}

	function revealExplanation() {
		const el = document.getElementById(explanationId);
		if (el) {
			el.classList.remove("hidden");
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}

	function submitAnswer() {
		if (selectedAnswer === null) return;
		// 在提交时立即计算是否正确
		isCorrect = Number(selectedAnswer) === Number(correct);
		submitted = true;
		revealExplanation();
	}
</script>

<div class="w-full">
	<!-- 选项 -->
	<div class="flex flex-col gap-3 mb-6">
		{#each choices as choice, index}
			<div class="flex items-start gap-3">
				<!-- ABCD 小按钮 -->
				<button
					type="button"
					onclick={() => selectAnswer(index)}
					disabled={submitted}
					class:list={[
						"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200",
						"hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
						{
							// 未选中状态：深色背景 + 白色文字
							"bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10":
								(selectedAnswer === null || selectedAnswer !== index) && !submitted,
							// 选中但未提交：浅色背景 + 蓝色文字（主题色）
							"bg-white dark:bg-[var(--btn-regular-bg)] border-2":
								selectedAnswer !== null && selectedAnswer === index && !submitted,
							// 提交后：正确答案
							"bg-green-500 text-white border-2 border-green-500":
								submitted && index === Number(correct),
							// 提交后：选错的答案
							"bg-red-500 text-white border-2 border-red-500":
								submitted &&
									selectedAnswer !== null &&
									selectedAnswer === index &&
									index !== Number(correct),
							// 提交后：未选中的错误选项
							"bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 opacity-50":
								submitted && (selectedAnswer === null || selectedAnswer !== index) && index !== Number(correct),
						},
					]}
					style={(selectedAnswer === null || selectedAnswer !== index) && !submitted
						? "color: white !important;"
						: selectedAnswer !== null && selectedAnswer === index && !submitted
						? "color: var(--primary) !important; border-color: var(--primary) !important;"
						: ""}
				>
					{optionLabels[index]}
				</button>
				
				<!-- 选项文本 -->
				<div class="flex-1 flex items-center gap-3 min-h-[2rem]">
					<div class="flex-1 text-75 text-base leading-relaxed">{choice}</div>
					{#if submitted && index === Number(correct)}
						<Icon
							icon="material-symbols:check-circle-rounded"
							class="flex-shrink-0 text-green-500 text-xl"
						/>
					{/if}
					{#if submitted &&
						selectedAnswer !== null &&
						selectedAnswer === index &&
						index !== Number(correct)}
						<Icon
							icon="material-symbols:cancel-rounded"
							class="flex-shrink-0 text-red-500 text-xl"
						/>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- 提交按钮 -->
	{#if !submitted}
		<button
			type="button"
			onclick={submitAnswer}
			disabled={selectedAnswer === null}
			class:list={[
				"btn-regular rounded-xl font-medium transition px-6 py-3",
				"disabled:opacity-50 disabled:cursor-not-allowed",
			]}
		>
			提交答案
		</button>
	{/if}

	<!-- 结果提示 -->
	{#if submitted}
		<div
			class:list={[
				"mt-6 p-4 rounded-xl flex items-center gap-3 border",
				{
					"bg-green-500/10 dark:bg-green-500/15 border-green-500/30 dark:border-green-500/40":
						isCorrect,
					"bg-red-500/10 dark:bg-red-500/15 border-red-500/30 dark:border-red-500/40":
						!isCorrect,
				},
			]}
		>
			<Icon
				icon={isCorrect
					? "material-symbols:celebration-rounded"
					: "material-symbols:sentiment-dissatisfied-rounded"}
				class={`text-2xl flex-shrink-0 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
			/>
			<div>
				<div
					class:list={[
						"font-semibold mb-0.5",
						{
							"text-green-700 dark:text-green-300": isCorrect,
							"text-red-700 dark:text-red-300": !isCorrect,
						},
					]}
				>
					{isCorrect ? "回答正确！" : "回答错误"}
				</div>
				<div
					class:list={[
						"text-sm text-75",
						{
							"text-green-600/90 dark:text-green-400/90": isCorrect,
							"text-red-600/90 dark:text-red-400/90": !isCorrect,
						},
					]}
				>
					{isCorrect
						? "恭喜你答对了！"
						: `正确答案是：${optionLabels[Number(correct)]}`}
				</div>
			</div>
		</div>
	{/if}
</div>
