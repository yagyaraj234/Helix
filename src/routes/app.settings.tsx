import { createFileRoute } from "@tanstack/react-router";

import { AppPage } from "../components/app-shell";

export const Route = createFileRoute("/app/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return <AppPage breadcrumb="Roast0 / Settings" title="Settings" />;
}
