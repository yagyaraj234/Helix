import { createServerFn } from "@tanstack/react-start";

import { type LiveWallData, toPublicRoastSummaries } from "./public-roasts";

export const getRecentPublicRoasts = createServerFn({ method: "GET" }).handler(
	async (): Promise<LiveWallData> => {
		try {
			const { db } = await import("./db.server");
			const { data, error } = await db
				.from("roasts")
				.select("slug,title,score,tier,roast_line,created_at")
				.order("created_at", { ascending: false })
				.limit(8);

			if (error) return { roasts: [], available: false };
			const rows: unknown = data;
			return { roasts: toPublicRoastSummaries(rows), available: true };
		} catch {
			return { roasts: [], available: false };
		}
	},
);
