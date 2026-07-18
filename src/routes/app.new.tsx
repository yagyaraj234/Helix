import { createFileRoute } from "@tanstack/react-router";

import { AppPage } from "../components/app-shell";

export const Route = createFileRoute("/app/new")({ component: NewRoastPage });

function NewRoastPage() {
	return <AppPage breadcrumb="Roast0 / New roast" title="New roast" />;
}
