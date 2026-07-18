import { createFileRoute, Link } from "@tanstack/react-router";

import { DotMatrixFlame, Logo } from "../components/brand";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="landing-shell">
			<header className="landing-nav">
				<Link aria-label="Roast0 home" to="/">
					<Logo className="brand--cream" />
				</Link>
				<nav aria-label="Main navigation" className="landing-nav__links">
					<a href="#how-it-works">How it works</a>
					<a href="#live-roasts">Live roasts</a>
					<a href="#pricing">Pricing</a>
				</nav>
				<div className="landing-nav__actions">
					<Link className="button button--ghost" to="/login">
						Log in
					</Link>
					<Link className="button button--ember" to="/app/new">
						Roast a trace
					</Link>
				</div>
			</header>
			<main className="landing-stage">
				<h1 className="sr-only">Roast0</h1>
				<DotMatrixFlame className="landing-stage__dots" />
			</main>
		</div>
	);
}
