import { createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "../components/auth-shell";

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	return <AuthShell title="Reset password" />;
}
