import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { AppPageHeader } from "#/components/app-page-header";
import { LangSmithConnectionCard } from "#/components/langsmith-connection-card";
import { primaryButton } from "#/components/ui";
import { getLangSmithConnections } from "#/lib/langsmith.functions";

export const Route = createFileRoute("/app/integrations/")({
	loader: () => getLangSmithConnections(),
	component: IntegrationsPage,
	pendingComponent: () => (
		<p className="mt-7 text-sm text-muted">Loading integrations…</p>
	),
	errorComponent: () => (
		<p className="mt-6 text-sm text-danger" role="alert">
			Could not load integrations.
		</p>
	),
});

function IntegrationsPage() {
	const connections = Route.useLoaderData();
	const router = useRouter();

	return (
		<main>
			<AppPageHeader
				title="Integrations"
				description="Connect LangSmith projects for scheduled redacted scans."
				action={
					<Link to="/app/integrations/langsmith/new" className={primaryButton}>
						Connect LangSmith
					</Link>
				}
			/>
			{!connections.length ? <Empty /> : null}
			<div className="mt-7 grid gap-4">
				{connections.map((connection) => (
					<LangSmithConnectionCard
						key={connection.id}
						connection={connection}
						onChanged={() => void router.invalidate()}
						onDeleted={() => void router.invalidate()}
					/>
				))}
			</div>
		</main>
	);
}

function Empty() {
	return (
		<section className="mt-7 rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
			<h2 className="text-lg font-semibold text-ink">
				Scan LangSmith traces automatically
			</h2>
			<p className="mx-auto mt-2 max-w-md text-sm text-muted">
				Connect a project with a workspace-scoped service key. Helix scans
				completed traces on your schedule and redacts before storage.
			</p>
			<Link
				to="/app/integrations/langsmith/new"
				className={`${primaryButton} mt-5`}
			>
				Connect LangSmith
			</Link>
		</section>
	);
}
