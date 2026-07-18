import { createFileRoute } from "@tanstack/react-router";

import { AppPage } from "../components/app-shell";

export const Route = createFileRoute("/app/roasts/$batch")({
	component: BatchPage,
});

function BatchPage() {
	return <AppPage breadcrumb="Roast0 / Roasts / Batch" title="Batch status" />;
}
