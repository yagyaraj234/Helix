import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "#/components/app-shell";
import { getCurrentUser } from "#/lib/auth.functions";
import { getBillingStatus } from "#/lib/billing.functions";
import { loadDashboard } from "#/lib/roast-functions";

export const Route = createFileRoute("/app")({
	head: () => ({
		meta: [{ name: "robots", content: "noindex, nofollow" }],
	}),
	beforeLoad: async () => {
		const user = await getCurrentUser();
		if (!user) throw redirect({ to: "/login" });
		return { user };
	},
	loader: async () => {
		const [dashboard, billing] = await Promise.all([
			loadDashboard(),
			getBillingStatus().catch(() => null),
		]);
		return { ...dashboard, billing };
	},
	component: AppLayout,
});

function AppLayout() {
	const { user } = Route.useRouteContext();
	const { billing, stats } = Route.useLoaderData();
	return (
		<AppShell
			plan={billing?.plan ?? null}
			totalRoasts={stats.totalRoasts}
			user={user}
		/>
	);
}
