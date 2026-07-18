import { createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "../components/auth-shell";

export const Route = createFileRoute("/update-password")({
	component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
	return <AuthShell title="Choose a new password" />;
}
