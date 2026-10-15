import { useEffect } from "react";
import type { ProgressDocument } from "../../core/scoring/record-run";

export type ZoneMapProps = {
	readonly progress?: ProgressDocument | null;
	readonly onStartLevel?: (levelId?: string) => void;
};

function formatStars(count: number): string {
	const clamped = Math.max(0, Math.min(3, count));
	return "★".repeat(clamped) + "☆".repeat(3 - clamped);
}

export function ZoneMap({ progress, onStartLevel }: ZoneMapProps = {}) {
	const starsEarned = progress?.levels["level:1.1"]?.cadet?.stars ?? 0;
	const starsDisplay = formatStars(starsEarned);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
				return;
			}
			if (event.key === " " || event.key === "Enter") {
				event.preventDefault();
				onStartLevel?.("level:1.1");
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onStartLevel]);

	return (
		<div className="flex flex-col items-center gap-6 p-8 max-w-3xl mx-auto text-foreground">
			<header className="flex flex-col items-center gap-2">
				<h1 className="text-display-lg font-bold">Zone map</h1>
				<h2 className="text-display-md font-semibold text-muted-foreground">
					Zone 1: The Drift
				</h2>
				<p className="text-ui-md text-muted-foreground">
					Sector 1 · Home Row Station Perimeter
				</p>
			</header>

			<section className="flex flex-col items-center gap-4 w-full mt-4">
				<button
					type="button"
					data-testid="level-node-level:1.1"
					onClick={() => onStartLevel?.("level:1.1")}
					className="flex items-center justify-between w-full max-w-md p-4 rounded-radius border border-primary bg-surface hover:bg-muted text-foreground transition-all shadow-md focus:shadow-focus outline-none cursor-pointer"
				>
					<div className="flex flex-col text-left">
						<span className="text-ui-lg font-bold">First Light</span>
						<span className="text-ui-sm text-muted-foreground">
							Level 1.1 · Home Keys F &amp; J
						</span>
					</div>
					<div className="flex flex-col items-end">
						<span
							role="img"
							data-testid="node-stars-level:1.1"
							className="text-primary text-display-sm tracking-widest"
							aria-label={`${starsEarned} of 3 stars`}
						>
							{starsDisplay}
						</span>
						<span className="text-ui-xs text-muted-foreground">
							Space to launch
						</span>
					</div>
				</button>
			</section>
		</div>
	);
}
