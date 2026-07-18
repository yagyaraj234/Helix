import { describe, expect, test } from "vitest";

import { toPublicRoastSummaries } from "./public-roasts";

describe("public roast summaries", () => {
	test("keeps only safe, valid card fields", () => {
		expect(
			toPublicRoastSummaries([
				{
					slug: "hot-one",
					title: "Leaky agent",
					score: -4.2,
					tier: "Charcoal",
					roast_line: "This agent put its secrets on speakerphone.",
					created_at: "2026-07-18T00:00:00Z",
					raw_trace: "never reaches the client",
				},
				{ slug: "broken" },
			]),
		).toEqual([
			{
				slug: "hot-one",
				title: "Leaky agent",
				score: 0,
				tier: "Charcoal",
				roastLine: "This agent put its secrets on speakerphone.",
				createdAt: "2026-07-18T00:00:00Z",
			},
		]);
	});
});
