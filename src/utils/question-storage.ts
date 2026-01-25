/**
 * localStorage 存储：每日答题记录、连续天数、成就、统计
 * 仅用于静态站前端，无后端。
 */

import { formatDateToYYYYMMDD } from "./date-utils";

const STORAGE_KEY = "daily-question-data";

export type Difficulty = "easy" | "medium" | "hard";

export interface DailyRecord {
	answered: boolean;
	correct: boolean;
	selectedAnswer: number;
	difficulty: Difficulty;
	dateStr: string;
	timestamp: number;
	/** 题目标题，用于日历悬停展示 */
	title?: string;
}

export interface StreakData {
	current: number;
	best: number;
	lastDate: string | null;
	lastCorrect: boolean;
	achievements: string[];
}

export interface StatsData {
	totalAnswered: number;
	totalCorrect: number;
	accuracy: number;
	byDifficulty: Record<Difficulty, { answered: number; correct: number }>;
}

export interface QuestionStorage {
	dailyRecords: Record<string, DailyRecord>;
	streak: StreakData;
}

function defaultStreak(): StreakData {
	return {
		current: 0,
		best: 0,
		lastDate: null,
		lastCorrect: false,
		achievements: [],
	};
}

function defaultDifficultyStats(): Record<
	Difficulty,
	{ answered: number; correct: number }
> {
	return {
		easy: { answered: 0, correct: 0 },
		medium: { answered: 0, correct: 0 },
		hard: { answered: 0, correct: 0 },
	};
}

function loadStorage(): QuestionStorage {
	if (typeof window === "undefined") {
		return { dailyRecords: {}, streak: defaultStreak() };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { dailyRecords: {}, streak: defaultStreak() };
		const parsed = JSON.parse(raw) as QuestionStorage;
		parsed.dailyRecords = parsed.dailyRecords || {};
		parsed.streak = { ...defaultStreak(), ...parsed.streak };
		parsed.streak.achievements = parsed.streak.achievements || [];
		return parsed;
	} catch {
		return { dailyRecords: {}, streak: defaultStreak() };
	}
}

function saveStorage(data: QuestionStorage): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// ignore
	}
}

function parseDateStr(s: string): Date {
	const [y, m, d] = s.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function dateStrFromDate(d: Date): string {
	return formatDateToYYYYMMDD(d);
}

/** 计算连续答对天数：仅统计「连续」且「答对」的天数。漏天或答错即断。 */
function recomputeStreak(records: Record<string, DailyRecord>): StreakData {
	const streak = defaultStreak();
	const sorted = Object.keys(records)
		.filter((k) => records[k].answered && records[k].correct)
		.sort()
		.reverse();
	if (sorted.length === 0) return streak;

	const today = dateStrFromDate(new Date());
	const todayTime = parseDateStr(today).getTime();
	let run = 0;
	let last: string | null = null;
	for (const d of sorted) {
		const prev = last ? parseDateStr(last) : null;
		const curr = parseDateStr(d);
		if (prev) {
			const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
			if (diffDays > 1) break;
		}
		run++;
		last = d;
	}
	streak.lastDate = last;
	streak.lastCorrect = true;
	const lastTime = last ? parseDateStr(last).getTime() : 0;
	const daysSinceLast = Math.round((todayTime - lastTime) / 86400000);
	streak.current = daysSinceLast <= 1 ? run : 0;

	let best = run;
	let acc = 0;
	for (let i = 0; i < sorted.length; i++) {
		const prev = i > 0 ? parseDateStr(sorted[i - 1] as string) : null;
		const curr = parseDateStr(sorted[i] as string);
		if (prev) {
			const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
			if (diff > 1) {
				best = Math.max(best, acc);
				acc = 0;
			}
		}
		acc++;
	}
	streak.best = Math.max(best, acc);

	const badges = ["3连击", "7连击", "30连击"];
	for (const b of badges) {
		const n = Number.parseInt(b, 10);
		if (!Number.isNaN(n) && streak.best >= n) {
			streak.achievements.push(b);
		}
	}
	streak.achievements = [...new Set(streak.achievements)];

	return streak;
}

/** 保存一次答题结果，并更新 streak。 */
export function saveAnswer(
	dateStr: string,
	correct: boolean,
	selectedAnswer: number,
	difficulty: Difficulty = "medium",
	title?: string,
): { streak: StreakData; prevStreak: number } {
	const data = loadStorage();
	const prevStreak = data.streak.current;

	const rec: DailyRecord = {
		answered: true,
		correct,
		selectedAnswer,
		difficulty,
		dateStr,
		timestamp: Date.now(),
		title,
	};
	data.dailyRecords[dateStr] = rec;
	data.streak = recomputeStreak(data.dailyRecords);

	if (!correct) {
		const onlyCorrect = { ...data.dailyRecords };
		delete onlyCorrect[dateStr];
		data.streak = recomputeStreak(onlyCorrect);
		data.streak.current = 0;
		data.dailyRecords[dateStr] = rec;
	}

	saveStorage(data);
	return { streak: data.streak, prevStreak };
}

/** 获取每日答题记录 */
export function getDailyRecords(): Record<string, DailyRecord> {
	return loadStorage().dailyRecords;
}

/** 获取连续成就数据 */
export function getStreak(): StreakData {
	return loadStorage().streak;
}

/** 获取统计数据 */
export function getStats(): StatsData {
	const records = getDailyRecords();
	const entries = Object.values(records).filter((r) => r.answered);
	const totalAnswered = entries.length;
	const totalCorrect = entries.filter((r) => r.correct).length;
	const byDifficulty = defaultDifficultyStats();
	for (const r of entries) {
		const d = r.difficulty ?? "medium";
		byDifficulty[d].answered++;
		if (r.correct) byDifficulty[d].correct++;
	}
	return {
		totalAnswered,
		totalCorrect,
		accuracy:
			totalAnswered > 0
				? Math.round((1000 * totalCorrect) / totalAnswered) / 10
				: 0,
		byDifficulty,
	};
}

/** 指定日期是否已答题 */
export function isAnswered(dateStr: string): boolean {
	return !!loadStorage().dailyRecords[dateStr]?.answered;
}
