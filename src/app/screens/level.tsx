import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import type { acceptLevel } from "../../core/content/load";
import type { DomainEvent } from "../../core/ports/domain-event";
import { createOutbox } from "../../core/ports/outbox";
import { createRng } from "../../core/replay/rng";
import {
	type ProgressDocument,
	recordCadetRun,
} from "../../core/scoring/record-run";
import { scoreEvents } from "../../core/scoring/score";
import type { MissedBar } from "../../core/scoring/stars";
import {
	createWaitingLanesRun,
	type RunLogDocument,
	type RunSummary,
} from "../../core/sim/waiting-lanes";
import { createHudBridge } from "../../engine/bridge/hud-bridge";
import { startKeyboardCapture } from "../../engine/input/keyboard";
import {
	createFixedStepLoop,
	startAnimationFrames,
} from "../../engine/loop/fixed-step-loop";
import {
	type NoteDefinition,
	PixiRenderAdapter,
} from "../../engine/render/pixi-render";
import { campaign } from "../content/campaign";
import {
	levelKeyToEvent,
	levelLifecycleMachine,
} from "../machines/level-lifecycle";
import { generateRunId } from "../storage/checkpoints";
import { useHudStore } from "../stores/hud";
import { Pause } from "./pause";
import { Results } from "./results";

export type LevelProps = {
	readonly levelId?: string;
	readonly seed?: string;
	readonly onFinish?: (
		summary?: RunSummary,
		missed?: readonly MissedBar[],
		progress?: ProgressDocument,
		runLog?: RunLogDocument,
	) => void;
	readonly onExit?: () => void;
	readonly skipBriefing?: boolean;
	readonly countdownIntervalMs?: number;
};

function generateInitialNotes(
	level: ReturnType<typeof acceptLevel>,
	seed: string,
	count = 60,
): NoteDefinition[] {
	const rng = createRng(seed).fork("waiting-lanes");
	const notes: NoteDefinition[] = [];
	let id = 0;

	for (const phase of level.phases) {
		for (let i = 0; i < Math.ceil(count / level.phases.length); i++) {
			const unit = rng.pick(phase.units);
			for (const char of unit) {
				const code = char.codePointAt(0);
				if (code !== undefined) {
					notes.push({ id: id++, character: code });
				}
			}
		}
	}

	return notes;
}

export function Level({
	levelId = "level:1.1",
	seed = "signalfire",
	onFinish,
	onExit,
	skipBriefing = false,
	countdownIntervalMs = 1000,
}: LevelProps) {
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const [state, send] = useMachine(levelLifecycleMachine, {
		input: { levelId, seed },
	});

	const score = useHudStore((s) => s.score);
	const combo = useHudStore((s) => s.combo);
	const accuracy = useHudStore((s) => s.accuracy);
	const velocity = useHudStore((s) => s.velocity);
	const activeCharacter = useHudStore((s) => s.activeCharacter);

	const level = campaign.levels[levelId];
	const zone = level ? campaign.zones[level.zoneId] : undefined;
	const tuning = level
		? (campaign.tuning[level.tuningId ?? "waiting-lanes"] ??
			Object.values(campaign.tuning)[0])
		: undefined;

	// Loading state verification
	useEffect(() => {
		if (state.value === "loading") {
			if (!level || !zone || !tuning) {
				send({
					type: "error",
					message: "Failed to load level content or configuration",
				});
				return;
			}
			send({ type: "loaded" });
			if (skipBriefing) {
				send({ type: "launch" });
			}
		}
	}, [state.value, level, zone, tuning, skipBriefing, send]);

	// Countdown timer ticks
	useEffect(() => {
		if (state.value !== "countdown") {
			return;
		}
		const timer = setInterval(() => {
			send({ type: "tick" });
		}, countdownIntervalMs);
		return () => clearInterval(timer);
	}, [state.value, countdownIntervalMs, send]);

	// Window blur pauses when playing
	useEffect(() => {
		if (state.value !== "playing") {
			return;
		}
		const onBlur = () => {
			send({ type: "pause" });
		};
		window.addEventListener("blur", onBlur);
		return () => window.removeEventListener("blur", onBlur);
	}, [state.value, send]);

	// Keyboard shortcut routing
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
				return;
			}
			if (state.value === "playing") {
				if (event.key === "Escape") {
					event.preventDefault();
					send({ type: "pause" });
				}
				return;
			}

			const action = levelKeyToEvent(state, event.key);
			if (action !== null) {
				event.preventDefault();
				if (
					(action.type === "continue" ||
						action.type === "quit" ||
						action.type === "back") &&
					onExit
				) {
					onExit();
					return;
				}
				send(action);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [state, send, onExit]);

	// Engine setup: initialize loop, run, adapter, bridge on mount
	const engineRef = useRef<{
		loop: ReturnType<typeof createFixedStepLoop>;
		run: ReturnType<typeof createWaitingLanesRun>;
		adapter: PixiRenderAdapter;
		bridge: ReturnType<typeof createHudBridge>;
		outbox: ReturnType<typeof createOutbox>;
		handleEvents: (events: readonly DomainEvent[]) => void;
	} | null>(null);

	useEffect(() => {
		const container = canvasContainerRef.current;
		if (container === null || !level || !zone || !tuning) {
			return;
		}

		const outbox = createOutbox();
		const now = new Date().toISOString();
		const run = createWaitingLanesRun(level, zone, tuning, seed, {
			runId: generateRunId(),
			levelId: level.id,
			tier: "cadet",
			mode: "campaign",
			contentVersion: level.contentVersion,
			startedAt: now,
			updatedAt: now,
			rev: 0,
		});

		let finished = false;
		const loop = createFixedStepLoop((step) => {
			if (finished) {
				return;
			}
			run.advance(step, outbox);
			const events = outbox.drain();
			if (events.length > 0) {
				for (const event of events) {
					if (event.type === "LevelEnded") {
						finished = true;
					}
				}
				handleEvents(events);
			}
		});

		const notes = generateInitialNotes(level, seed, 80);
		const adapter = new PixiRenderAdapter({
			width: 900,
			height: 600,
			notes,
		});

		const bridge = createHudBridge({
			onSnapshot: (snapshot) => {
				useHudStore.getState().setSnapshot(snapshot);
			},
			minIntervalMs: 50,
		});

		const initialMetrics = run.metrics();
		bridge.update({
			score: 0,
			combo: 0,
			activeCharacter: run.activeNote()?.character ?? null,
			accuracy: initialMetrics.integrityPercent / 100,
			velocity: initialMetrics.velocityWpm,
		});

		let destroyed = false;
		adapter.init(container).then(() => {
			if (destroyed) {
				adapter.destroy();
			} else {
				adapter.renderFrame(0);
			}
		});

		const allEvents: DomainEvent[] = [];
		let comboCounter = 0;

		const handleEvents = (events: readonly DomainEvent[]) => {
			adapter.publish(events);
			for (const event of events) {
				allEvents.push(event);
				if (event.type === "Hit") {
					comboCounter += 1;
				} else if (event.type === "Error") {
					comboCounter = 0;
				} else if (event.type === "LevelEnded") {
					const finished = run.summary();
					const defaultProgress: ProgressDocument = {
						v: 1,
						updatedAt: new Date().toISOString(),
						rev: 0,
						levels: {},
					};
					const updatedProgress = recordCadetRun(
						defaultProgress,
						{
							levelId: level.id,
							tier: "cadet",
							stars: finished.summary.stars,
							score: finished.summary.score,
							accuracy: finished.summary.accuracy,
							netWpm: finished.summary.netWpm,
						},
						Boolean(zone?.starBars),
						new Date().toISOString(),
					);
					send({
						type: "finish",
						summary: finished.summary,
						missed: finished.missed,
					});
					onFinish?.(
						finished.summary,
						finished.missed,
						updatedProgress,
						finished.log,
					);
				}
			}

			const metrics = run.metrics();
			bridge.update({
				score: scoreEvents(allEvents),
				combo: comboCounter,
				activeCharacter: run.activeNote()?.character ?? null,
				accuracy: metrics.integrityPercent / 100,
				velocity: metrics.velocityWpm,
			});
		};

		engineRef.current = { loop, run, adapter, bridge, outbox, handleEvents };

		return () => {
			destroyed = true;
			bridge.destroy();
			adapter.destroy();
			engineRef.current = null;
			useHudStore.getState().reset();
		};
	}, [level, zone, tuning, seed, onFinish, send]);

	// Playing state: start animation frames and keyboard capture
	useEffect(() => {
		const engine = engineRef.current;
		if (state.value !== "playing" || engine === null) {
			return;
		}

		engine.loop.frame(
			typeof performance !== "undefined" ? performance.now() : 0,
		);

		const keyboardCapture = startKeyboardCapture({
			loop: engine.loop,
			run: engine.run,
			outbox: engine.outbox,
			onEvents: engine.handleEvents,
		});

		const frames = startAnimationFrames(
			engine.loop,
			(cb) =>
				requestAnimationFrame((timeMs) => {
					cb(timeMs);
					engine.adapter.renderFrame(engine.loop.interpolation());
				}),
			(handle) => cancelAnimationFrame(handle),
		);

		return () => {
			frames.stop();
			keyboardCapture.destroy();
		};
	}, [state.value]);

	if (state.value === "results") {
		return (
			<Results
				stars={state.context.summary?.stars}
				score={state.context.summary?.score}
				integrity={state.context.summary?.accuracy}
				velocity={state.context.summary?.netWpm}
				missed={state.context.missed}
				onContinue={() => {
					if (onExit) {
						onExit();
					} else {
						send({ type: "continue" });
					}
				}}
			/>
		);
	}

	if (state.value === "error") {
		return (
			<div className="flex flex-col items-center gap-4 p-8 text-center">
				<h1 className="text-display-lg text-destructive">Error</h1>
				<p className="text-ui-md text-muted-foreground">
					{state.context.error ?? "Failed to load level."}
				</p>
				<button
					type="button"
					onClick={() => {
						if (onExit) {
							onExit();
						} else {
							send({ type: "back" });
						}
					}}
					className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-radius"
				>
					Return to zone map
				</button>
			</div>
		);
	}

	return (
		<div
			data-testid="level-screen"
			data-state={state.value}
			className="flex flex-col items-center gap-4 p-4 text-foreground relative"
		>
			<h1 className="text-display-lg">Level</h1>

			{/* Dev-only trigger for test automation in development */}
			{import.meta.env.DEV && (
				<button
					type="button"
					tabIndex={-1}
					data-testid="dev-finish-level-button"
					className="opacity-0 w-2 h-2 absolute pointer-events-auto"
					onClick={() => {
						const engine = engineRef.current;
						if (engine) {
							engine.run.finish(engine.outbox);
							engine.handleEvents(engine.outbox.drain());
						}
					}}
				>
					Dev finish
				</button>
			)}

			<div className="flex flex-col items-center gap-2 relative">
				{/* Minimal In-Level HUD */}
				<div
					data-testid="in-level-hud"
					data-active-char={
						activeCharacter !== null ? String.fromCharCode(activeCharacter) : ""
					}
					className="flex items-center justify-between w-[900px] px-6 py-3 border border-b-0 border-border bg-background/90 text-foreground font-mono rounded-t-radius"
				>
					<div className="flex gap-4">
						<span
							data-testid="hud-combo"
							className="text-ui-md text-muted-foreground"
						>
							Combo: <strong className="text-foreground">{combo}</strong>
						</span>
					</div>
					<div className="flex gap-8">
						<span
							data-testid="hud-integrity"
							className="text-ui-md text-muted-foreground"
						>
							Integrity:{" "}
							<strong className="text-foreground">
								{Math.round(accuracy * 100)}%
							</strong>
						</span>
						<span
							data-testid="hud-velocity"
							className="text-ui-md text-muted-foreground"
						>
							Velocity:{" "}
							<strong className="text-foreground">
								{Math.round(velocity)} WPM
							</strong>
						</span>
					</div>
					<div>
						<span
							data-testid="hud-score"
							className="text-ui-md text-muted-foreground"
						>
							Score: <strong className="text-foreground">{score}</strong>
						</span>
					</div>
				</div>

				{/* Canvas Area with Overlays */}
				<div className="relative w-[900px] h-[600px] rounded-b-radius border border-border bg-background overflow-hidden">
					<div
						ref={canvasContainerRef}
						data-testid="level-canvas-container"
						className="w-full h-full"
					/>

					{/* Briefing Overlay */}
					{state.value === "briefing" && level && (
						<div
							data-testid="briefing-overlay"
							className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-xs p-6"
						>
							<div
								data-testid="briefing-card"
								className="flex flex-col items-center justify-center gap-6 p-8 bg-background border border-border rounded-radius shadow-lg text-foreground max-w-lg w-full"
							>
								<div className="flex flex-col items-center gap-1 text-center">
									<span className="text-ui-sm font-mono text-muted-foreground uppercase tracking-widest">
										Briefing
									</span>
									<h2 className="text-display-md text-foreground">
										{level.name}
									</h2>
								</div>

								<div className="p-4 bg-muted/30 border border-border/50 rounded-radius text-ui-md text-muted-foreground text-center italic font-mono">
									Pim: &ldquo;Take her steady into the drift, cadet. Keep your
									beacons centered.&rdquo;
								</div>

								<div className="flex flex-col gap-2 w-full text-ui-sm font-mono">
									<div className="flex justify-between border-b border-border/50 pb-1">
										<span className="text-muted-foreground">Focus Keys:</span>
										<span className="text-foreground font-semibold">
											{level.focusKeys
												.map((k) => (k === " " ? "Space" : k.toUpperCase()))
												.join(", ")}
										</span>
									</div>
									{zone?.starBars && (
										<>
											<div className="flex justify-between border-b border-border/50 pb-1">
												<span className="text-muted-foreground">
													★ 1 Star Bar:
												</span>
												<span className="text-foreground">
													{zone.starBars.one.accuracyPercent}% Integrity ·{" "}
													{zone.starBars.one.wpm} WPM
												</span>
											</div>
											<div className="flex justify-between border-b border-border/50 pb-1">
												<span className="text-muted-foreground">
													★★ 2 Star Bar:
												</span>
												<span className="text-foreground">
													{zone.starBars.two.accuracyPercent}% Integrity ·{" "}
													{zone.starBars.two.wpm} WPM
												</span>
											</div>
											<div className="flex justify-between pb-1">
												<span className="text-muted-foreground">
													★★★ 3 Star Bar:
												</span>
												<span className="text-foreground">
													{zone.starBars.three.accuracyPercent}% Integrity ·{" "}
													{zone.starBars.three.wpm} WPM
												</span>
											</div>
										</>
									)}
								</div>

								<button
									type="button"
									data-testid="launch-button"
									onClick={() => send({ type: "launch" })}
									className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-radius shadow-focus hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
								>
									Launch (Space)
								</button>
							</div>
						</div>
					)}

					{/* Countdown Overlay */}
					{state.value === "countdown" && (
						<div
							data-testid="countdown-overlay"
							className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-xs"
						>
							<div className="text-display-2xl text-primary font-bold animate-pulse font-mono">
								{state.context.countdown}
							</div>
						</div>
					)}

					{/* Pause Overlay */}
					{state.value === "paused" && (
						<div
							data-testid="pause-overlay"
							className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs"
						>
							<Pause
								onResume={() => send({ type: "resume" })}
								onQuit={() => {
									if (onExit) {
										onExit();
									} else {
										send({ type: "quit" });
									}
								}}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
