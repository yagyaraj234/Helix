import { createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "../components/auth-shell";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
	return <AuthShell title="Start roasting" />;
}
