import { createFileRoute } from "@tanstack/react-router";

import { AppPage } from "../components/app-shell";

export const Route = createFileRoute("/app/")({ component: DashboardPage });

function DashboardPage() {
	return <AppPage breadcrumb="Roast0 / Dashboard" title="Dashboard" />;
}
