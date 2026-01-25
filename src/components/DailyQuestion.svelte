<script lang="ts">
import type { CollectionEntry } from "astro:content";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { formatDateToYYYYMMDD } from "../utils/date-utils";
import { type Difficulty, saveAnswer } from "../utils/question-storage";

interface Props {
	question: CollectionEntry<"daily-questions">;
	explanationId?: string;
}

let { question, explanationId = "daily-explanation" }: Props = $props();

let selectedAnswer: number | null = $state(null);
let submitted = $state(false);
let isCorrect = $state(false);
let isDarkMode = $state(false);
let submitState = $state<"idle" | "submitting" | "done">("idle");
let streakToast = $state<number | null>(null);

const choices = question.data.choices;
const correct = Number(question.data.correct);
const optionLabels = ["A", "B", "C", "D"];
const difficulty = (question.data.difficulty ?? "medium") as Difficulty;
const dateStr = formatDateToYYYYMMDD(question.data.date);
const title = question.data.title ?? question.data.question;

onMount(() => {
	const checkTheme = () => {
		isDarkMode = document.documentElement.classList.contains("dark");
	};
	checkTheme();
	const observer = new MutationObserver(checkTheme);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
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

async function submitAnswer() {
	if (selectedAnswer === null || submitState !== "idle") return;
	isCorrect = Number(selectedAnswer) === Number(correct);
	submitState = "submitting";
	submitted = true;

	await new Promise((r) => setTimeout(r, 400));

	const { streak, prevStreak } = saveAnswer(
		dateStr,
		isCorrect,
		selectedAnswer,
		difficulty,
		title,
	);

	window.dispatchEvent(
		new CustomEvent("question-answered", {
			detail: { streak, prevStreak, isCorrect },
		}),
	);

	if (!isCorrect && prevStreak > 0) {
		streakToast = prevStreak;
		setTimeout(() => {
			streakToast = null;
		}, 3000);
	}

	submitState = "done";
	revealExplanation();
}

function goToExplanation() {
	revealExplanation();
}
</script>

<div class="daily-question-block w-full">
	<!-- 选项 -->
	<div class="flex flex-col gap-3 mb-6">
		{#each choices as choice, index}
			<button
				type="button"
				onclick={() => selectAnswer(index)}
				disabled={submitted}
				class="group relative flex items-start gap-3 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed overflow-hidden"
				class:answer-correct-bounce={submitted && index === Number(correct)}
				class:answer-wrong-shake={submitted &&
					selectedAnswer !== null &&
					selectedAnswer === index &&
					index !== Number(correct)}
				style={selectedAnswer !== null && selectedAnswer === index && !submitted
					? "border: 3px solid var(--primary);"
					: (selectedAnswer === null || selectedAnswer !== index) && !submitted
						? "border: 2px solid transparent;"
						: ""}
				class:list={[
					{
						"bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 shadow-sm":
							(selectedAnswer === null || selectedAnswer !== index) && !submitted,
						"bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 dark:from-[var(--primary)]/30 dark:to-[var(--primary)]/20 shadow-2xl -translate-y-1 ring-4 ring-[var(--primary)]/30":
							selectedAnswer !== null && selectedAnswer === index && !submitted,
						"bg-green-500/10 dark:bg-green-500/20 border-2 border-green-500 shadow-lg":
							submitted && index === Number(correct),
						"bg-red-500/10 dark:bg-red-500/20 border-2 border-red-500 shadow-lg":
							submitted &&
								selectedAnswer !== null &&
								selectedAnswer === index &&
								index !== Number(correct),
						"bg-black/5 dark:bg-white/5 opacity-50 shadow-sm":
							submitted &&
								(selectedAnswer === null || selectedAnswer !== index) &&
								index !== Number(correct),
					},
				]}
			>
				{#if selectedAnswer !== null && selectedAnswer === index && !submitted}
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent -translate-x-full group-hover:translate-x-full"
					></div>
					<div
						class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)]/60 to-transparent"
					></div>
				{/if}
				<div
					class:list={[
						"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 shadow-lg relative z-10",
						{
							"bg-[var(--btn-regular-bg)] dark:bg-[var(--btn-regular-bg)] border-2":
								(selectedAnswer === null || selectedAnswer !== index) && !submitted,
							"bg-[var(--primary)] text-white border-2 border-[var(--primary)] shadow-2xl -translate-y-0.5 scale-110":
								selectedAnswer !== null && selectedAnswer === index && !submitted,
							"bg-green-500 text-white border-2 border-green-500 shadow-xl icon-check":
								submitted && index === Number(correct),
							"bg-red-500 text-white border-2 border-red-500 shadow-xl icon-cross":
								submitted &&
									selectedAnswer !== null &&
									selectedAnswer === index &&
									index !== Number(correct),
							"bg-[var(--btn-regular-bg)] dark:bg-[var(--btn-regular-bg)] opacity-50 border-2":
								submitted &&
									(selectedAnswer === null || selectedAnswer !== index) &&
									index !== Number(correct),
						},
					]}
					style={(selectedAnswer === null || selectedAnswer !== index) && !submitted
						? "color: var(--primary); border-color: var(--primary);"
						: submitted &&
								(selectedAnswer === null || selectedAnswer !== index) &&
								index !== Number(correct)
							? "color: var(--primary); border-color: var(--primary); opacity: 0.5;"
							: ""}
				>
					{optionLabels[index]}
				</div>
				<div class="flex-1 flex items-center gap-3 min-h-[2.5rem] relative z-10">
					<div class="flex-1 text-75 text-base leading-relaxed">{choice}</div>
					{#if submitted && index === Number(correct)}
						<span class="answer-icon-check flex-shrink-0"
							><Icon
								icon="material-symbols:check-circle-rounded"
								class="text-green-500 text-xl"
							/></span
						>
					{/if}
					{#if submitted &&
						selectedAnswer !== null &&
						selectedAnswer === index &&
						index !== Number(correct)}
						<span class="answer-icon-cross flex-shrink-0"
							><Icon
								icon="material-symbols:cancel-rounded"
								class="text-red-500 text-xl"
							/></span
						>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<!-- 提交 / 查看解析 -->
	{#if submitState === "idle"}
		<button
			type="button"
			onclick={submitAnswer}
			disabled={selectedAnswer === null}
			class="group relative flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 px-8 py-3.5 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
			style={isDarkMode
				? "background: white; color: black; box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);"
				: "background: black; color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);"}
		>
			<div
				class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
			></div>
			<Icon
				icon="material-symbols:send-rounded"
				class="text-xl transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12 relative z-10"
			/>
			<span class="relative z-10">提交答案</span>
		</button>
	{:else if submitState === "submitting"}
		<button
			type="button"
			disabled
			class="flex items-center justify-center gap-2 rounded-2xl font-semibold px-8 py-3.5 shadow-lg opacity-90 cursor-wait overflow-hidden submit-loading"
			style={isDarkMode
				? "background: white; color: black;"
				: "background: black; color: white;"}
		>
			<span class="submit-spinner"></span>
			<span>提交中…</span>
		</button>
	{:else}
		<button
			type="button"
			onclick={goToExplanation}
			class="group relative flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 px-8 py-3.5 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden btn-view-explanation"
			style={isDarkMode
				? "background: white; color: black; box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);"
				: "background: black; color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);"}
		>
			<div
				class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
			></div>
			<Icon
				icon="material-symbols:lightbulb-outline-rounded"
				class="text-xl relative z-10"
			/>
			<span class="relative z-10">查看解析</span>
		</button>
	{/if}

	<!-- 连续天数 Toast（答错且此前有连续时） -->
	{#if streakToast !== null}
		<div
			class="streak-toast fixed left-1/2 top-24 -translate-x-1/2 z-[10002] px-4 py-2 rounded-xl shadow-xl bg-red-500/90 dark:bg-red-600/90 text-white text-sm font-medium animate-fade-in"
			role="status"
		>
			连续 {streakToast} 天已重置
		</div>
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
				class={"text-2xl flex-shrink-0 " +
					(isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}
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

<style>
	.answer-correct-bounce {
		animation: answer-bounce 0.5s ease-out;
	}
	.answer-wrong-shake {
		animation: answer-shake 0.4s ease-in-out;
	}
	.icon-check .answer-icon-check,
	.answer-icon-check {
		animation: icon-flash 0.6s ease-out;
	}
	.icon-cross .answer-icon-cross,
	.answer-icon-cross {
		animation: icon-flash 0.4s ease-out;
	}

	@keyframes answer-bounce {
		0%,
		100% {
			transform: scale(1);
		}
		30% {
			transform: scale(1.02);
		}
		50% {
			transform: scale(0.98);
		}
		70% {
			transform: scale(1.01);
		}
	}
	@keyframes answer-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-6px);
		}
		40% {
			transform: translateX(6px);
		}
		60% {
			transform: translateX(-4px);
		}
		80% {
			transform: translateX(4px);
		}
	}
	@keyframes icon-flash {
		0% {
			opacity: 0;
			transform: scale(0.5);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.submit-spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.streak-toast {
		animation: toast-in 0.3s ease-out;
	}
	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translate(-50%, -0.5rem);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
</style>
