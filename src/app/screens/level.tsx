import { useEffect, useRef } from "react";
import type { acceptLevel } from "../../core/content/load";
import type { DomainEvent } from "../../core/ports/domain-event";
import { createOutbox } from "../../core/ports/outbox";
import { createRng } from "../../core/replay/rng";
import { scoreEvents } from "../../core/scoring/score";
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
import { useHudStore } from "../stores/hud";

export type LevelProps = {
	readonly levelId?: string;
	readonly seed?: string;
	readonly onFinish?: () => void;
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
}: LevelProps) {
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const score = useHudStore((s) => s.score);
	const combo = useHudStore((s) => s.combo);

	useEffect(() => {
		const container = canvasContainerRef.current;
		if (container === null) {
			return;
		}

		const level = campaign.levels[levelId] ?? campaign.levels["level:1.1"];
		if (level === undefined) {
			return;
		}

		const zone = campaign.zones[level.zoneId];
		if (zone === undefined) {
			return;
		}

		const tuning =
			campaign.tuning[level.tuningId ?? "waiting-lanes"] ??
			Object.values(campaign.tuning)[0];
		if (tuning === undefined) {
			return;
		}

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
		let combo = 0;

		const handleEvents = (events: readonly DomainEvent[]) => {
			adapter.publish(events);
			for (const event of events) {
				allEvents.push(event);
				if (event.type === "Hit") {
					combo += 1;
				} else if (event.type === "Error") {
					combo = 0;
				} else if (event.type === "LevelEnded") {
					onFinish?.();
				}
			}
			bridge.update({
				score: scoreEvents(allEvents),
				combo,
				activeCharacter: run.activeNote()?.character ?? null,
				accuracy: 1,
			});
		};

		const loop = createFixedStepLoop((step) => {
			run.advance(step, outbox);
			const events = outbox.drain();
			if (events.length > 0) {
				handleEvents(events);
			}
		});

		// Initialize loop cursor
		loop.frame(typeof performance !== "undefined" ? performance.now() : 0);

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

		let destroyed = false;

		adapter.init(container).then(() => {
			if (destroyed) {
				adapter.destroy();
			}
		});

		const keyboardCapture = startKeyboardCapture({
			loop,
			run,
			outbox,
			onEvents: handleEvents,
		});

		const frames = startAnimationFrames(
			loop,
			(cb) =>
				requestAnimationFrame((timeMs) => {
					cb(timeMs);
					adapter.renderFrame(loop.interpolation());
				}),
			(handle) => cancelAnimationFrame(handle),
		);

		return () => {
			destroyed = true;
			frames.stop();
			keyboardCapture.destroy();
			bridge.destroy();
			adapter.destroy();
			useHudStore.getState().reset();
		};
	}, [levelId, seed, onFinish]);

	return (
		<div className="flex flex-col items-center gap-4 p-4">
			<h1 className="text-display-lg">Level</h1>
			<div className="flex gap-8 text-ui-md font-mono text-muted-foreground">
				<span>Score: {score}</span>
				<span>Combo: {combo}</span>
			</div>
			<div
				ref={canvasContainerRef}
				data-testid="level-canvas-container"
				className="relative w-[900px] h-[600px] rounded-radius border border-border bg-background overflow-hidden"
			/>
		</div>
	);
}
