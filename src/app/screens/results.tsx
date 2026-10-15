import type { MissedBar } from "../../core/scoring/stars";
import type { AppFlowEvent } from "../machines/app-flow";

type Item = {
	label: string;
	event: AppFlowEvent;
};

export type ResultsProps = {
	readonly stars?: number;
	readonly score?: number;
	readonly integrity?: number;
	readonly velocity?: number;
	readonly missed?: readonly MissedBar[];
	readonly onContinue?: () => void;
	readonly items?: readonly Item[];
	readonly selectedIndex?: number;
	readonly onOpen?: (event: AppFlowEvent) => void;
};

function formatStars(stars: number): string {
	switch (stars) {
		case 3:
			return "★★★ (3 Stars)";
		case 2:
			return "★★☆ (2 Stars)";
		case 1:
			return "★☆☆ (1 Star)";
		default:
			return "☆☆☆ (0 Stars)";
	}
}

export function Results({
	stars,
	score = 0,
	integrity = 1,
	velocity = 0,
	missed = [],
	onContinue,
	items,
	selectedIndex = 0,
	onOpen,
}: ResultsProps) {
	const integrityPercent =
		integrity > 1 ? Math.round(integrity) : Math.round(integrity * 100);
	const velocityWpm = Math.round(velocity);
	const starCount = stars ?? 0;

	return (
		<div
			data-testid="results-screen"
			className="flex flex-col items-center justify-center gap-6 p-8 bg-background border border-border rounded-radius shadow-lg text-foreground max-w-lg mx-auto"
		>
			<h1 className="text-display-lg">Results</h1>

			<div
				data-testid="results-stars"
				className="text-display-md text-primary font-bold tracking-wider"
			>
				{formatStars(starCount)}
			</div>

			<div className="flex flex-col items-center gap-2 text-ui-lg font-mono">
				<span data-testid="results-score">Score: {score}</span>
				<div className="flex gap-6 text-muted-foreground text-ui-md">
					<span data-testid="results-integrity">
						Integrity: {integrityPercent}%
					</span>
					<span data-testid="results-velocity">
						Velocity: {velocityWpm} WPM
					</span>
				</div>
			</div>

			{missed.length > 0 && (
				<div
					data-testid="missed-bar-message"
					className="flex flex-col items-center gap-1 p-3 bg-muted/40 border border-border rounded-radius text-ui-sm text-center"
				>
					<span className="font-semibold text-muted-foreground">
						Target Shortfall:
					</span>
					{missed.map((miss) => (
						<p
							key={miss.kind}
							data-testid={`missed-${miss.kind}`}
							className="text-amber-500 font-mono"
						>
							{miss.kind === "integrity"
								? `Integrity ${Math.round(miss.measuredPercent)}%, needed ${miss.neededPercent}%`
								: `Velocity ${Math.round(miss.measuredWpm)} WPM, needed ${miss.neededWpm} WPM`}
						</p>
					))}
				</div>
			)}

			{items && items.length > 0 ? (
				<div className="flex gap-4">
					{items.map((item, index) => (
						<button
							key={item.label}
							type="button"
							tabIndex={-1}
							aria-current={index === selectedIndex ? "true" : undefined}
							className={`px-6 py-2 font-semibold rounded-radius shadow-focus hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring ${
								index === selectedIndex
									? "bg-primary text-primary-foreground shadow-focus"
									: "bg-muted text-muted-foreground hover:bg-muted/80"
							}`}
							onClick={() =>
								item.label === "Continue" && onContinue
									? onContinue()
									: onOpen?.(item.event)
							}
						>
							{item.label}
						</button>
					))}
				</div>
			) : (
				<button
					type="button"
					onClick={onContinue}
					className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-radius shadow-focus hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
				>
					Continue
				</button>
			)}
		</div>
	);
}
