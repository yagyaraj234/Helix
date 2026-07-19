import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
	ArrowUpRight,
	CheckCircle2,
	CircleX,
	LoaderCircle,
} from "lucide-react";
import { AppPageHeader } from "#/components/app-page-header";
import { SeverityCounts } from "#/components/roast-table";
import { loadBatch } from "#/lib/roast-functions";
import type { BatchRoast } from "#/lib/roasts";

export const Route = createFileRoute("/app/scans/batches/$batch")({
	loader: ({ params }) => loadBatch({ data: { batchId: params.batch } }),
	component: BatchStatus,
});

function BatchStatus() {
	const initialRows = Route.useLoaderData();
	const { batch } = Route.useParams();
	const query = useQuery({
		queryKey: ["batch", batch],
		queryFn: () => loadBatch({ data: { batchId: batch } }),
		initialData: initialRows,
		staleTime: Number.POSITIVE_INFINITY,
		retry: false,
		refetchInterval: ({ state }) =>
			state.data?.some((row) => row.status === "processing") ? 1_500 : false,
	});
	const rows: BatchRoast[] = query.data;
	const settled =
		rows.length > 0 && rows.every((row) => row.status !== "processing");
	const completedRow =
		rows.length === 1 && rows[0]?.status === "done" ? rows[0] : null;

	if (completedRow) {
		return (
			<Navigate to="/app/scans/$slug" params={{ slug: completedRow.slug }} />
		);
	}

	return (
		<main>
			<AppPageHeader
				description={
					settled
						? "All traces settled. Polling stopped."
						: "Processing traces. Status refreshes every 1.5 seconds."
				}
				title="Scan status"
			/>

			{query.error && (
				<p
					className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger"
					role="alert"
				>
					Could not refresh batch status.
				</p>
			)}
			{rows.length === 0 ? (
				<div className="mt-7 rounded-xl border border-line bg-white p-10 text-center text-muted">
					Batch not found.
				</div>
			) : (
				<ul className="mt-7 space-y-3">
					{rows.map((row) => (
						<StatusRow key={row.id} row={row} />
					))}
				</ul>
			)}
		</main>
	);
}

function StatusRow({ row }: { row: BatchRoast }) {
	return (
		<li className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white px-5 py-4">
			{row.status === "processing" ? (
				<LoaderCircle
					className="size-5 animate-spin text-accent"
					aria-label="Processing"
				/>
			) : row.status === "done" ? (
				<CheckCircle2 className="size-5 text-tier-rare" aria-label="Done" />
			) : (
				<CircleX className="size-5 text-danger" aria-label="Failed" />
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-ink">{row.title}</p>
				{row.status === "processing" && (
					<p className="text-sm text-muted">processing</p>
				)}
				{row.status === "failed" && (
					<p className="text-sm text-danger">
						{row.error || "Processing failed."}
					</p>
				)}
			</div>
			{row.status === "done" && (
				<>
					<span className="font-mono text-lg font-semibold text-ink">
						Helix score {row.score}
					</span>
					<SeverityCounts counts={row.findingCounts} />
					<Link
						className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors duration-150 hover:text-blue-700"
						params={{ slug: row.slug }}
						to="/app/scans/$slug"
					>
						Report <ArrowUpRight size={14} aria-hidden="true" />
					</Link>
				</>
			)}
		</li>
	);
}
