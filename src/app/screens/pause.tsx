export type PauseProps = {
	readonly onResume?: () => void;
	readonly onQuit?: () => void;
};

export function Pause({ onResume, onQuit }: PauseProps) {
	return (
		<div
			data-testid="pause-screen"
			className="flex flex-col items-center justify-center gap-6 p-8 bg-background/95 border border-border rounded-radius shadow-lg text-foreground max-w-md mx-auto"
		>
			<h1 className="text-display-lg">Pause</h1>
			<p className="text-ui-md text-muted-foreground text-center">
				Simulation suspended. Take a breath, cadet.
			</p>
			<div className="flex flex-col gap-3 w-full">
				<button
					type="button"
					onClick={onResume}
					className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-radius shadow-focus hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
				>
					Resume (Space)
				</button>
				<button
					type="button"
					onClick={onQuit}
					className="px-4 py-2 bg-muted text-muted-foreground font-semibold rounded-radius hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
				>
					Quit to zone map (Escape)
				</button>
			</div>
		</div>
	);
}
