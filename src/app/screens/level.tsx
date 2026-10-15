import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import type { acceptLevel } from "../../core/content/load";
import type { DomainEvent } from "../../core/ports/domain-event";
import { createOutbox } from "../../core/ports/outbox";
import { createRng } from "../../core/replay/rng";
import { scoreEvents } from "../../core/scoring/score";
import type { MissedBar } from "../../core/scoring/stars";
import type { RunSummary } from "../../core/sim/waiting-lanes";
import { createWaitingLanesRun } from "../../core/sim/waiting-lanes";
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
import { levelLifecycleMachine } from "../machines/level-lifecycle";
import { useHudStore } from "../stores/hud";
import { Pause } from "./pause";
import { Results } from "./results";

export type LevelProps = {
	readonly levelId?: string;
	readonly seed?: string;
	readonly skipBriefing?: boolean;
	readonly skipCountdown?: boolean;
	readonly countdownIntervalMs?: number;
	readonly onFinish?: (
		summary?: RunSummary,
		missed?: readonly MissedBar[],
	) => void;
	readonly onQuit?: () => void;
	readonly onContinue?: () => void;
	readonly onToHub?: () => void;
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

export function formatMissedBar(
	missed?: readonly MissedBar[] | null,
): string | null {
	if (!missed || missed.length === 0) {
		return null;
	}
	return missed
		.map((bar) => {
			if (bar.kind === "integrity") {
				return `Integrity ${Math.round(bar.measuredPercent)}%, needed ${bar.neededPercent}%`;
			}
			return `Velocity ${Math.round(bar.measuredWpm)} WPM, needed ${bar.neededWpm} WPM`;
		})
		.join(". ");
}

export function Level({
	levelId = "level:1.1",
	seed = "signalfire",
	skipBriefing = false,
	skipCountdown = false,
	countdownIntervalMs = 1000,
	onFinish,
	onQuit,
	onContinue,
	onToHub,
}: LevelProps) {
	const [snapshot, send] = useMachine(levelLifecycleMachine, {
		input: { levelId, seed },
	});

	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const score = useHudStore((s) => s.score);
	const combo = useHudStore((s) => s.combo);
	const accuracy = useHudStore((s) => s.accuracy);
	const netWpm = useHudStore((s) => s.netWpm);

	const level = campaign.levels[levelId] ?? campaign.levels["level:1.1"];
	const zone = level ? campaign.zones[level.zoneId] : undefined;
	const tuning = level
		? (campaign.tuning[level.tuningId ?? "waiting-lanes"] ??
			Object.values(campaign.tuning)[0])
		: undefined;

	// Loading resolution
	useEffect(() => {
		if (snapshot.value !== "loading") {
			return;
		}
		if (!level || !zone || !tuning) {
			send({ type: "FAIL", error: "Mission data could not be loaded." });
			return;
		}
		send({ type: "LOADED" });
		if (skipBriefing) {
			send({ type: "LAUNCH" });
			if (skipCountdown) {
				send({ type: "SKIP" });
			}
		}
	}, [snapshot.value, level, zone, tuning, send, skipBriefing, skipCountdown]);

	// Countdown timer
	useEffect(() => {
		if (snapshot.value !== "countdown") {
			return;
		}
		if (skipCountdown) {
			send({ type: "SKIP" });
			return;
		}
		if (snapshot.context.countdownValue > 0) {
			const timer = setTimeout(() => {
				send({ type: "TICK" });
			}, countdownIntervalMs);
			return () => clearTimeout(timer);
		}
	}, [
		snapshot.value,
		snapshot.context.countdownValue,
		skipCountdown,
		countdownIntervalMs,
		send,
	]);

	// Listeners for briefing and pause keys
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.repeat) return;

			if (snapshot.value === "briefing") {
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					send({ type: "LAUNCH" });
				} else if (e.key === "Escape") {
					e.preventDefault();
					onQuit?.();
					send({ type: "QUIT" });
				}
			} else if (snapshot.value === "paused") {
				if (e.key === " " || e.key === "1") {
					e.preventDefault();
					send({ type: "RESUME" });
				} else if (e.key === "Escape" || e.key === "2") {
					e.preventDefault();
					onQuit?.();
					send({ type: "QUIT" });
				}
			} else if (snapshot.value === "playing") {
				if (e.key === "Escape") {
					e.preventDefault();
					send({ type: "PAUSE" });
				}
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [snapshot.value, send, onQuit]);

	// Pause on window blur
	useEffect(() => {
		if (snapshot.value !== "playing") return;

		const onBlur = () => {
			send({ type: "PAUSE" });
		};

		window.addEventListener("blur", onBlur);
		return () => window.removeEventListener("blur", onBlur);
	}, [snapshot.value, send]);

	// Engine setup during playing/paused states
	const engineRef = useRef<{
		destroy: () => void;
		pause: () => void;
		resume: () => void;
	} | null>(null);

	useEffect(() => {
		if (snapshot.value !== "playing" && snapshot.value !== "paused") {
			if (engineRef.current) {
				engineRef.current.destroy();
				engineRef.current = null;
			}
			return;
		}

		if (snapshot.value === "paused") {
			engineRef.current?.pause();
			return;
		}

		if (snapshot.value === "playing") {
			if (engineRef.current) {
				engineRef.current.resume();
				return;
			}

			const container = canvasContainerRef.current;
			if (!container || !level || !zone || !tuning) return;

			const outbox = createOutbox();
			const run = createWaitingLanesRun(level, zone, tuning, seed, {
				runId: "01AFQCG20004HMASW9NF6YY41J",
				levelId: level.id,
				tier: "cadet",
				mode: "campaign",
				contentVersion: "demo",
				startedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				rev: 0,
			});

			const allEvents: DomainEvent[] = [];
			let currentCombo = 0;
			let hits = 0;
			let totalAttempts = 0;
			const startTime = performance.now();
			let frames: { stop(): void } | null = null;

			const handleEvents = (events: readonly DomainEvent[]) => {
				adapter.publish(events);
				for (const event of events) {
					allEvents.push(event);
					if (event.type === "Hit") {
						currentCombo += 1;
						hits += 1;
						totalAttempts += 1;
					} else if (event.type === "Error") {
						currentCombo = 0;
						totalAttempts += 1;
					} else if (event.type === "LevelEnded") {
						frames?.stop();
						const finished = run.finish(outbox);
						send({
							type: "FINISH",
							summary: finished.summary,
							missed: finished.missed,
						});
						onFinish?.(finished.summary, finished.missed);
					}
				}

				const elapsedMinutes = (performance.now() - startTime) / 60000;
				const currentNetWpm =
					elapsedMinutes > 0.01 ? hits / 5 / elapsedMinutes : 0;
				const currentAccuracy = totalAttempts === 0 ? 1 : hits / totalAttempts;

				bridge.update({
					score: scoreEvents(allEvents),
					combo: currentCombo,
					activeCharacter: run.activeNote()?.character ?? null,
					accuracy: currentAccuracy,
					netWpm: currentNetWpm,
				});
			};

			const loop = createFixedStepLoop((step) => {
				run.advance(step, outbox);
				const events = outbox.drain();
				if (events.length > 0) {
					handleEvents(events);
				}
			});

			loop.frame(typeof performance !== "undefined" ? performance.now() : 0);

			const notes = generateInitialNotes(level, seed, 80);
			const adapter = new PixiRenderAdapter({
				width: 900,
				height: 600,
				notes,
			});

			const bridge = createHudBridge({
				onSnapshot: (snap) => {
					useHudStore.getState().setSnapshot(snap);
				},
				minIntervalMs: 50,
			});

			let destroyed = false;
			adapter.init(container).then(() => {
				if (destroyed) {
					adapter.destroy();
				}
			});

			let keyboardCapture = startKeyboardCapture({
				loop,
				run,
				outbox,
				onEvents: handleEvents,
			});

			frames = startAnimationFrames(
				loop,
				(cb) =>
					requestAnimationFrame((timeMs) => {
						cb(timeMs);
						adapter.renderFrame(loop.interpolation());
					}),
				(handle) => cancelAnimationFrame(handle),
			);

			let isPaused = false;

			engineRef.current = {
				pause: () => {
					if (isPaused) return;
					isPaused = true;
					frames?.stop();
					keyboardCapture.destroy();
				},
				resume: () => {
					if (!isPaused) return;
					isPaused = false;
					loop.frame(
						typeof performance !== "undefined" ? performance.now() : 0,
					);
					keyboardCapture = startKeyboardCapture({
						loop,
						run,
						outbox,
						onEvents: handleEvents,
					});
					frames = startAnimationFrames(
						loop,
						(cb) =>
							requestAnimationFrame((timeMs) => {
								cb(timeMs);
								adapter.renderFrame(loop.interpolation());
							}),
						(handle) => cancelAnimationFrame(handle),
					);
				},
				destroy: () => {
					destroyed = true;
					frames?.stop();
					keyboardCapture.destroy();
					bridge.destroy();
					adapter.destroy();
					useHudStore.getState().reset();
				},
			};
		}
	}, [snapshot.value, level, zone, tuning, seed, send, onFinish]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (engineRef.current) {
				engineRef.current.destroy();
				engineRef.current = null;
			}
			useHudStore.getState().reset();
		};
	}, []);

	// Render based on state
	if (snapshot.value === "loading") {
		return (
			<p className="text-ui-md text-muted-foreground p-8">Loading mission...</p>
		);
	}

	if (snapshot.value === "error") {
		return (
			<div className="flex flex-col items-center gap-4 p-8 text-center">
				<h1 className="text-display-lg text-destructive">Mission Error</h1>
				<p className="text-ui-md text-muted-foreground">
					{snapshot.context.error ?? "Something went wrong with the mission."}
				</p>
				<button
					type="button"
					className="px-4 py-2 rounded-radius border border-border bg-surface hover:bg-surface-hover"
					onClick={() => {
						onQuit?.();
						send({ type: "QUIT" });
					}}
				>
					Return to Zone Map
				</button>
			</div>
		);
	}

	if (snapshot.value === "briefing" && level && zone) {
		return (
			<div className="flex flex-col items-center gap-6 p-8 max-w-lg mx-auto text-center">
				<h1 className="text-display-lg">{level.name}</h1>
				<p className="text-ui-md text-muted-foreground italic">
					Commander Okafor: Welcome to {zone.name}, cadet. Keep your eyes on the
					hit line.
				</p>

				<div className="border border-border rounded-radius p-4 w-full bg-surface">
					<h2 className="text-ui-sm uppercase font-semibold text-muted-foreground mb-2">
						Introduced Keys
					</h2>
					<div className="flex justify-center gap-3 font-mono text-ui-lg">
						{level.allowedKeys.map((key) => (
							<span
								key={key}
								className="px-3 py-1 bg-surface-hover rounded-radius border border-border"
							>
								{key === " " ? "Space" : key.toUpperCase()}
							</span>
						))}
					</div>
				</div>

				{zone.starBars && (
					<div className="border border-border rounded-radius p-4 w-full bg-surface text-left">
						<h2 className="text-ui-sm uppercase font-semibold text-muted-foreground mb-2">
							Star Bars
						</h2>
						<div className="flex flex-col gap-1 text-ui-sm font-mono">
							<div>
								★ {zone.starBars.one.accuracyPercent}% Integrity,{" "}
								{zone.starBars.one.wpm} WPM
							</div>
							<div>
								★★ {zone.starBars.two.accuracyPercent}% Integrity,{" "}
								{zone.starBars.two.wpm} WPM
							</div>
							<div>
								★★★ {zone.starBars.three.accuracyPercent}% Integrity,{" "}
								{zone.starBars.three.wpm} WPM
							</div>
						</div>
					</div>
				)}

				<button
					type="button"
					className="px-6 py-3 rounded-radius font-semibold bg-primary text-primary-foreground shadow-focus"
					onClick={() => send({ type: "LAUNCH" })}
				>
					Space to launch
				</button>
				<button
					type="button"
					data-testid="finish-level"
					className="opacity-0 w-px h-px block"
					onClick={() => {
						onFinish?.();
						send({ type: "FINISH" });
					}}
				>
					Finish level
				</button>
			</div>
		);
	}

	if (snapshot.value === "results") {
		const summary = snapshot.context.runSummary;
		return (
			<Results
				stars={summary?.stars ?? 0}
				score={summary?.score ?? 0}
				accuracy={summary?.accuracy ?? 1}
				netWpm={summary?.netWpm ?? 0}
				missedMessage={formatMissedBar(snapshot.context.missedBars)}
				onContinue={() => {
					onContinue?.() ?? onFinish?.();
					send({ type: "CONTINUE" });
				}}
				onToHub={() => {
					onToHub?.();
					send({ type: "TO_HUB" });
				}}
			/>
		);
	}

	return (
		<div className="relative flex flex-col items-center gap-4 p-4">
			<h1 className="sr-only">Level</h1>

			{/* Minimal HUD */}
			<div
				data-testid="level-hud"
				className="flex justify-between items-center w-[900px] px-4 py-2 border border-border rounded-radius bg-surface text-ui-md font-mono"
			>
				<div className="flex gap-4">
					<span>Combo: {combo}</span>
					<span>Score: {score}</span>
				</div>
				<div className="flex gap-6">
					<span>Integrity: {Math.round(accuracy * 100)}%</span>
					<span>Velocity: {Math.round(netWpm)} WPM</span>
				</div>
			</div>

			{/* Canvas Container */}
			<div
				ref={canvasContainerRef}
				data-testid="level-canvas-container"
				className="relative w-[900px] h-[600px] rounded-radius border border-border bg-background overflow-hidden"
			/>

			{/* Countdown Overlay */}
			{snapshot.value === "countdown" && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-20">
					<div
						data-testid="countdown-display"
						className="text-display-2xl font-mono text-primary font-bold animate-pulse"
					>
						{snapshot.context.countdownValue}
					</div>
				</div>
			)}

			{/* Pause Overlay */}
			{snapshot.value === "paused" && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-30">
					<Pause
						onResume={() => send({ type: "RESUME" })}
						onQuit={() => {
							onQuit?.();
							send({ type: "QUIT" });
						}}
					/>
				</div>
			)}

			{/* Hidden trigger for testing app-flow transitions */}
			<button
				type="button"
				data-testid="finish-level"
				className="opacity-0 w-px h-px block"
				onClick={() => {
					onFinish?.();
					send({ type: "FINISH" });
				}}
			>
				Finish level
			</button>
		</div>
	);
}
