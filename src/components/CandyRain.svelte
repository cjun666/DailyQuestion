<script lang="ts">
import { onMount } from "svelte";

interface Candy {
	id: number;
	x: number;
	y: number;
	endX: number;
	endY: number;
	rotation: number;
	delay: number;
	duration: number;
	scale: number;
	emoji: string;
}

let candies = $state<Candy[]>([]);
let candyId = $state(0);

const emojis = ["🍭", "🍬", "🍫", "🍪", "🍰", "🧁", "🍩", "🍯"];

function createCandies(x: number, y: number) {
	const count = 10 + Math.floor(Math.random() * 6); // 10-15 个棒棒糖
	const newCandies: Candy[] = [];

	for (let i = 0; i < count; i++) {
		const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
		const velocity = 200 + Math.random() * 150; // 初始速度
		const duration = 1.2 + Math.random() * 0.6;

		// 计算最终位置（考虑重力和初始速度）
		const endX = x + Math.cos(angle) * velocity * duration;
		const endY =
			y + Math.sin(angle) * velocity * duration + window.innerHeight * 0.8;

		newCandies.push({
			id: candyId++,
			x: x,
			y: y,
			endX: endX,
			endY: endY,
			rotation: Math.random() * 360,
			delay: Math.random() * 0.1,
			duration: duration,
			scale: 0.7 + Math.random() * 0.5,
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	candies = [...candies, ...newCandies];

	// 清理过期的棒棒糖
	setTimeout(() => {
		candies = candies.filter((c) => !newCandies.includes(c));
	}, 3000);
}

function handleClick(event: MouseEvent) {
	// 排除按钮和链接点击
	const target = event.target as HTMLElement;
	if (
		target.tagName === "BUTTON" ||
		target.tagName === "A" ||
		target.closest("button") ||
		target.closest("a")
	) {
		return;
	}

	createCandies(event.clientX, event.clientY);
}

onMount(() => {
	document.addEventListener("click", handleClick);
	return () => {
		document.removeEventListener("click", handleClick);
	};
});
</script>

<div class="candy-container">
	{#each candies as candy (candy.id)}
		<div
			class="candy"
			style="
				left: {candy.x}px;
				top: {candy.y}px;
				--rotation: {candy.rotation}deg;
				--delay: {candy.delay}s;
				--duration: {candy.duration}s;
				--scale: {candy.scale};
				--end-x: {candy.endX - candy.x}px;
				--end-y: {candy.endY - candy.y}px;
			"
		>
			{candy.emoji}
		</div>
	{/each}
</div>

<style>
	.candy-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 9999;
		overflow: hidden;
	}

	.candy {
		position: absolute;
		font-size: 2rem;
		user-select: none;
		pointer-events: none;
		transform-origin: center;
		animation: fall var(--duration) var(--delay) ease-out forwards;
		will-change: transform, opacity;
	}

	@keyframes fall {
		0% {
			transform: translate(0, 0) rotate(var(--rotation)) scale(var(--scale));
			opacity: 1;
		}
		100% {
			transform: translate(var(--end-x), var(--end-y))
				rotate(calc(var(--rotation) + 1080deg)) scale(calc(var(--scale) * 0.3));
			opacity: 0;
		}
	}
</style>
