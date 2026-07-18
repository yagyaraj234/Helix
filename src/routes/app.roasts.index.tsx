import { createFileRoute } from "@tanstack/react-router";

import { AppPage } from "../components/app-shell";

export const Route = createFileRoute("/app/roasts/")({ component: RoastsPage });

function RoastsPage() {
	return <AppPage breadcrumb="Roast0 / Roasts" title="Roasts" />;
}
