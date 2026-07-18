import { createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "../components/auth-shell";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
	return <AuthShell title="Welcome back" />;
}
