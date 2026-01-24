import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
const dailyQuestionsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		question: z.string(), // 题干
		date: z.date(), // 题目对应的日期，每日一题按此匹配
		choices: z.array(z.string()).length(4), // 选择题选项 A/B/C/D
		correct: z.number().min(0).max(3), // 正确答案索引 0=A,1=B,2=C,3=D
		difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
		tags: z.array(z.string()).optional().default([]),
		draft: z.boolean().optional().default(false),
	}),
	// body = 答案解析，支持 Markdown
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	"daily-questions": dailyQuestionsCollection,
};
