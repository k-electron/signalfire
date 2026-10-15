export type PauseProps = {
	readonly onResume?: () => void;
	readonly onQuit?: () => void;
};

export function Pause({ onResume, onQuit }: PauseProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
			<h1 className="text-display-lg">Pause</h1>
			<div className="flex flex-col gap-3 w-48">
				<button
					type="button"
					className="px-4 py-2 rounded-radius bg-primary text-primary-foreground font-semibold shadow-focus"
					onClick={onResume}
				>
					1. Resume
				</button>
				<button
					type="button"
					className="px-4 py-2 rounded-radius border border-border bg-surface hover:bg-surface-hover"
					onClick={onQuit}
				>
					2. Quit
				</button>
			</div>
		</div>
	);
}
