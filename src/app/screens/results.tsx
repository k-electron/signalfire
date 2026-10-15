import type { AppFlowEvent } from "../machines/app-flow";

export type ResultsItem = {
	label: string;
	event: AppFlowEvent;
};

export type ResultsProps = {
	stars?: number;
	score?: number;
	accuracy?: number;
	netWpm?: number;
	missedMessage?: string | null;
	items?: readonly ResultsItem[];
	selectedIndex?: number;
	onOpen?: (event: AppFlowEvent) => void;
	onContinue?: () => void;
	onToHub?: () => void;
};

const defaultItems: readonly ResultsItem[] = [
	{ label: "Continue", event: { type: "toZoneMap" } },
	{ label: "Hub", event: { type: "toHub" } },
];

export function Results({
	stars = 0,
	score = 0,
	accuracy = 1,
	netWpm = 0,
	missedMessage = null,
	items = defaultItems,
	selectedIndex = 0,
	onOpen,
	onContinue,
	onToHub,
}: ResultsProps) {
	const accuracyPercent =
		accuracy <= 1 ? Math.round(accuracy * 100) : Math.round(accuracy);
	const starDisplay = Array.from({ length: 3 }, (_, i) =>
		i < stars ? "★" : "☆",
	).join(" ");

	const handleAction = (item: ResultsItem, index: number) => {
		if (onOpen) {
			onOpen(item.event);
		} else if (index === 0 && onContinue) {
			onContinue();
		} else if (index === 1 && onToHub) {
			onToHub();
		}
	};

	return (
		<div className="flex flex-col items-center gap-6 p-6 max-w-lg mx-auto text-center">
			<h1 className="text-display-lg">Results</h1>

			<div
				role="img"
				data-testid="results-stars"
				className="text-display-md text-primary tracking-widest"
				aria-label={`${stars} stars`}
			>
				{starDisplay}
			</div>

			<div className="flex flex-col gap-2 text-ui-lg font-mono">
				<div data-testid="results-score">Score: {score}</div>
				<div data-testid="results-integrity">Integrity: {accuracyPercent}%</div>
				<div data-testid="results-velocity">
					Velocity: {Math.round(netWpm)} WPM
				</div>
			</div>

			{missedMessage !== null && missedMessage !== undefined && (
				<p
					data-testid="missed-bar-message"
					className="text-ui-md text-destructive border border-destructive/30 bg-destructive/10 rounded-radius px-4 py-2"
				>
					{missedMessage}
				</p>
			)}

			<div className="flex gap-4 mt-4">
				{items.map((item, index) => (
					<button
						key={item.label}
						type="button"
						tabIndex={-1}
						aria-current={index === selectedIndex ? "true" : undefined}
						className={`px-4 py-2 rounded-radius border border-border font-medium transition-colors ${
							index === selectedIndex
								? "bg-primary text-primary-foreground shadow-focus"
								: "bg-surface hover:bg-surface-hover"
						}`}
						onClick={() => handleAction(item, index)}
					>
						{item.label}
					</button>
				))}
			</div>
		</div>
	);
}
