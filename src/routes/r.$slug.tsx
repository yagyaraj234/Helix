import { createFileRoute, Link } from "@tanstack/react-router";

import { Logo } from "../components/brand";

export const Route = createFileRoute("/r/$slug")({
	component: PublicRoastPage,
});

function PublicRoastPage() {
	return (
		<div className="public-shell">
			<header className="public-topbar">
				<Link aria-label="Roast0 home" to="/">
					<Logo />
				</Link>
				<Link className="button button--ember" to="/app/new">
					Roast yours →
				</Link>
			</header>
			<main className="public-card-frame">
				<h1 className="sr-only">Public roast card</h1>
			</main>
		</div>
	);
}
