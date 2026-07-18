export interface PublicRoastSummary {
	slug: string;
	title: string;
	score: number;
	tier: string;
	roastLine: string | null;
	createdAt: string | null;
}

export interface LiveWallData {
	roasts: PublicRoastSummary[];
	available: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toPublicRoastSummary(
	value: unknown,
): PublicRoastSummary | null {
	if (!isRecord(value)) return null;

	const {
		slug,
		title,
		score,
		tier,
		roast_line: roastLine,
		created_at: createdAt,
	} = value;
	if (
		typeof slug !== "string" ||
		typeof title !== "string" ||
		typeof score !== "number" ||
		!Number.isFinite(score) ||
		typeof tier !== "string"
	) {
		return null;
	}

	return {
		slug,
		title,
		score: Math.max(0, Math.min(100, Math.round(score))),
		tier,
		roastLine: typeof roastLine === "string" ? roastLine : null,
		createdAt: typeof createdAt === "string" ? createdAt : null,
	};
}

export function toPublicRoastSummaries(value: unknown): PublicRoastSummary[] {
	if (!Array.isArray(value)) return [];
	return value.flatMap((row) => {
		const roast = toPublicRoastSummary(row);
		return roast ? [roast] : [];
	});
}
