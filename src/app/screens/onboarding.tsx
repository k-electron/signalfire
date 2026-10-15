import { useEffect, useState } from "react";

export type OnboardingProps = {
	readonly onComplete?: (profile: {
		callSign: string;
		preferredThumb?: "left" | "right" | "either";
	}) => void;
};

const CALL_SIGNS = [
	"Cadet Nova",
	"Beacon Leader",
	"Skiff Pilot",
	"Vanguard",
] as const;

const POSTURE_STEPS = [
	{
		title: "Sit tall",
		instruction: "Keep your feet flat on the floor and your spine straight.",
	},
	{
		title: "Wrists floating",
		instruction:
			"Hover your wrists gently above the desk without resting down.",
	},
	{
		title: "Eyes on the screen",
		instruction: "Keep your gaze on the display. Trust your beacons.",
	},
] as const;

export function Onboarding({ onComplete }: OnboardingProps) {
	const [step, setStep] = useState<"call-sign" | "posture" | "beacons">(
		"call-sign",
	);
	const [callSignIndex, setCallSignIndex] = useState(0);
	const [postureIndex, setPostureIndex] = useState(0);
	const [foundF, setFoundF] = useState(false);
	const [foundJ, setFoundJ] = useState(false);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
				return;
			}

			if (step === "call-sign") {
				if (
					event.key === "ArrowDown" ||
					event.key === "ArrowRight" ||
					event.code === "ArrowDown" ||
					event.code === "ArrowRight"
				) {
					event.preventDefault();
					setCallSignIndex((prev) => (prev + 1) % CALL_SIGNS.length);
				} else if (
					event.key === "ArrowUp" ||
					event.key === "ArrowLeft" ||
					event.code === "ArrowUp" ||
					event.code === "ArrowLeft"
				) {
					event.preventDefault();
					setCallSignIndex(
						(prev) => (prev - 1 + CALL_SIGNS.length) % CALL_SIGNS.length,
					);
				} else if (event.key === " " || event.code === "Space") {
					event.preventDefault();
					setStep("posture");
				}
			} else if (step === "posture") {
				if (event.key === " " || event.code === "Space") {
					event.preventDefault();
					if (postureIndex < POSTURE_STEPS.length - 1) {
						setPostureIndex((prev) => prev + 1);
					} else {
						setStep("beacons");
					}
				}
			} else if (step === "beacons") {
				if (event.key.toLowerCase() === "f" || event.code === "KeyF") {
					event.preventDefault();
					setFoundF(true);
				} else if (
					foundF &&
					(event.key.toLowerCase() === "j" || event.code === "KeyJ")
				) {
					event.preventDefault();
					setFoundJ(true);
					onComplete?.({
						callSign: CALL_SIGNS[callSignIndex] ?? "Cadet Nova",
						preferredThumb: "either",
					});
				}
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [step, postureIndex, foundF, callSignIndex, onComplete]);

	return (
		<div className="flex flex-col items-center justify-center gap-6 p-8 max-w-xl mx-auto text-foreground">
			<h1 className="text-display-lg">Onboarding</h1>

			{step === "call-sign" && (
				<div
					data-testid="onboarding-step-call-sign"
					className="flex flex-col items-center gap-4 w-full"
				>
					<p className="text-ui-lg text-muted-foreground text-center">
						Welcome to Home Row Station, cadet. Choose your call sign:
					</p>

					<div className="flex flex-col gap-2 w-full max-w-xs">
						{CALL_SIGNS.map((sign, index) => {
							const selected = index === callSignIndex;
							return (
								<button
									type="button"
									key={sign}
									onClick={() => {
										setCallSignIndex(index);
										setStep("posture");
									}}
									className={`px-4 py-3 rounded-radius text-left text-ui-md font-mono transition-colors border ${
										selected
											? "bg-primary text-primary-foreground border-primary font-bold shadow-md"
											: "bg-surface text-foreground border-border hover:bg-muted"
									}`}
								>
									{selected ? "▶ " : "  "}
									{sign}
								</button>
							);
						})}
					</div>

					<p className="text-ui-sm text-muted-foreground">
						Use Arrow keys to choose, Space to confirm
					</p>
				</div>
			)}

			{step === "posture" && (
				<div
					data-testid="onboarding-step-posture"
					className="flex flex-col items-center gap-4 text-center max-w-md p-6 bg-surface border border-border rounded-radius shadow-md"
				>
					<span className="text-ui-sm text-primary font-semibold tracking-wide uppercase">
						Posture Check ({postureIndex + 1} of {POSTURE_STEPS.length})
					</span>

					<h2 className="text-display-md font-bold">
						{POSTURE_STEPS[postureIndex]?.title}
					</h2>

					<p className="text-ui-md text-muted-foreground">
						{POSTURE_STEPS[postureIndex]?.instruction}
					</p>

					<button
						type="button"
						onClick={() => {
							if (postureIndex < POSTURE_STEPS.length - 1) {
								setPostureIndex((prev) => prev + 1);
							} else {
								setStep("beacons");
							}
						}}
						className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-radius font-semibold"
					>
						Confirm (Space)
					</button>
				</div>
			)}

			{step === "beacons" && (
				<div
					data-testid="onboarding-step-beacons"
					className="flex flex-col items-center gap-6 text-center max-w-md p-6 bg-surface border border-border rounded-radius shadow-md"
				>
					<span className="text-ui-sm text-primary font-semibold tracking-wide uppercase">
						Find the Beacons
					</span>

					<p className="text-ui-md text-muted-foreground">
						Rest your fingers on the keys. Feel the two raised bumps? Those are
						your beacons.
					</p>

					<div className="flex gap-8 my-4">
						<div
							data-testid="beacon-f"
							data-found={foundF ? "true" : "false"}
							className={`w-20 h-20 rounded-radius flex flex-col items-center justify-center font-mono border-2 transition-all ${
								foundF
									? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
									: "bg-surface text-foreground border-primary animate-pulse"
							}`}
						>
							<span className="text-display-md font-bold">F</span>
							<span className="text-ui-xs opacity-75">
								{foundF ? "Locked" : "Bump"}
							</span>
						</div>

						<div
							data-testid="beacon-j"
							data-found={foundJ ? "true" : "false"}
							className={`w-20 h-20 rounded-radius flex flex-col items-center justify-center font-mono border-2 transition-all ${
								foundJ
									? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
									: foundF
										? "bg-surface text-foreground border-primary animate-pulse"
										: "bg-surface text-muted-foreground border-border opacity-50"
							}`}
						>
							<span className="text-display-md font-bold">J</span>
							<span className="text-ui-xs opacity-75">
								{foundJ ? "Locked" : "Bump"}
							</span>
						</div>
					</div>

					<p className="text-ui-sm font-mono text-primary">
						{!foundF
							? "Press F on your keyboard..."
							: !foundJ
								? "Great! Now press J..."
								: "Both beacons locked! Ready for launch."}
					</p>
				</div>
			)}
		</div>
	);
}
