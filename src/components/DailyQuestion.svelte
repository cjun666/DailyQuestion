<script lang="ts">
import type { CollectionEntry } from "astro:content";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

interface Props {
	question: CollectionEntry<"daily-questions">;
	explanationId?: string;
}

let { question, explanationId = "daily-explanation" }: Props = $props();

let selectedAnswer: number | null = $state(null);
let submitted = $state(false);
let isCorrect = $state(false);
let isDarkMode = $state(false);

const choices = question.data.choices;
// 确保 correct 是数字类型
const correct = Number(question.data.correct);
const optionLabels = ["A", "B", "C", "D"];

// 检测主题模式
onMount(() => {
	const checkTheme = () => {
		isDarkMode = document.documentElement.classList.contains("dark");
	};
	checkTheme();

	// 监听主题变化
	const observer = new MutationObserver(checkTheme);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});

	// 也监听主题变更事件
	window.addEventListener("theme-changed", checkTheme);

	return () => {
		observer.disconnect();
		window.removeEventListener("theme-changed", checkTheme);
	};
});

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
			<button
				type="button"
				onclick={() => selectAnswer(index)}
				disabled={submitted}
				class="group relative flex items-start gap-3 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed overflow-hidden"
				style={selectedAnswer !== null && selectedAnswer === index && !submitted
					? "border: 3px solid var(--primary);"
					: (selectedAnswer === null || selectedAnswer !== index) && !submitted
					? "border: 2px solid transparent;"
					: ""}
				class:list={[
					{
						// 未选中状态
						"bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 shadow-sm":
							(selectedAnswer === null || selectedAnswer !== index) && !submitted,
						// 选中但未提交：蓝色框框包裹 + 高亮+突起效果
						"bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 dark:from-[var(--primary)]/30 dark:to-[var(--primary)]/20 shadow-2xl -translate-y-1 ring-4 ring-[var(--primary)]/30":
							selectedAnswer !== null && selectedAnswer === index && !submitted,
						// 提交后：正确答案
						"bg-green-500/10 dark:bg-green-500/20 border-2 border-green-500 shadow-lg":
							submitted && index === Number(correct),
						// 提交后：选错的答案
						"bg-red-500/10 dark:bg-red-500/20 border-2 border-red-500 shadow-lg":
							submitted &&
								selectedAnswer !== null &&
								selectedAnswer === index &&
								index !== Number(correct),
						// 提交后：未选中的错误选项
						"bg-black/5 dark:bg-white/5 opacity-50 shadow-sm":
							submitted && (selectedAnswer === null || selectedAnswer !== index) && index !== Number(correct),
					},
				]}
			>
				<!-- 选中时的光效和装饰 -->
				{#if selectedAnswer !== null && selectedAnswer === index && !submitted}
					<!-- 背景光效 -->
					<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent -translate-x-full group-hover:translate-x-full"></div>
					<!-- 顶部高光 -->
					<div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)]/60 to-transparent"></div>
				{/if}
				<!-- ABCD 小按钮 -->
				<div
					class:list={[
						"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 shadow-lg relative z-10",
						{
							// 未选中状态：柔和的背景色，文字使用主题色
							"bg-[var(--btn-regular-bg)] dark:bg-[var(--btn-regular-bg)] border-2":
								(selectedAnswer === null || selectedAnswer !== index) && !submitted,
							// 选中但未提交：主题色背景 + 突起效果
							"bg-[var(--primary)] text-white border-2 border-[var(--primary)] shadow-2xl -translate-y-0.5 scale-110":
								selectedAnswer !== null && selectedAnswer === index && !submitted,
							// 提交后：正确答案
							"bg-green-500 text-white border-2 border-green-500 shadow-xl":
								submitted && index === Number(correct),
							// 提交后：选错的答案
							"bg-red-500 text-white border-2 border-red-500 shadow-xl":
								submitted &&
									selectedAnswer !== null &&
									selectedAnswer === index &&
									index !== Number(correct),
							// 提交后：未选中的错误选项
							"bg-[var(--btn-regular-bg)] dark:bg-[var(--btn-regular-bg)] opacity-50 border-2":
								submitted && (selectedAnswer === null || selectedAnswer !== index) && index !== Number(correct),
						},
					]}
					style={(selectedAnswer === null || selectedAnswer !== index) && !submitted
						? "color: var(--primary); border-color: var(--primary);"
						: submitted && (selectedAnswer === null || selectedAnswer !== index) && index !== Number(correct)
						? "color: var(--primary); border-color: var(--primary); opacity: 0.5;"
						: ""}
				>
					{optionLabels[index]}
				</div>
				
				<!-- 选项文本 -->
				<div class="flex-1 flex items-center gap-3 min-h-[2.5rem] relative z-10">
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
			</button>
		{/each}
	</div>

	<!-- 提交按钮 -->
	{#if !submitted}
		<button
			type="button"
			onclick={submitAnswer}
			disabled={selectedAnswer === null}
			class="group relative flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 px-8 py-3.5 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
			style={isDarkMode
				? "background: white; color: black; box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);"
				: "background: black; color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);"}
		>
			<!-- 背景光效 -->
			<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"></div>
			
			<Icon
				icon="material-symbols:send-rounded"
				class="text-xl transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12 relative z-10"
			/>
			<span class="relative z-10">提交答案</span>
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
