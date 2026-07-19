import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";

import { AppPageHeader } from "#/components/app-page-header";
import { LangSmithConnectionForm } from "#/components/langsmith-connection-form";

export const Route = createFileRoute("/app/integrations/langsmith/new")({
	component: ConnectLangSmith,
});

function ConnectLangSmith() {
	const navigate = useNavigate();
	const router = useRouter();
	return (
		<div className="max-w-2xl">
			<AppPageHeader
				description="Use a workspace-scoped service key when possible. The first scan checks the last 24 hours, up to 50 completed traces; your key is encrypted and never shown again."
				title="Connect LangSmith"
			/>
			<LangSmithConnectionForm
				onConnected={async () => {
					await router.invalidate();
					await navigate({ to: "/app/integrations" });
				}}
			/>
		</div>
	);
}
