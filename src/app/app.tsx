import { useMachine } from "@xstate/react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Storage } from "../core/ports/storage";
import type { ProgressDocument } from "../core/scoring/record-run";
import type { MissedBar } from "../core/scoring/stars";
import type { RunSummary } from "../core/sim/waiting-lanes";
import { createLocalStorage } from "../platform/storage/indexed-db";
import {
	type AppFlowEvent,
	appFlowMachine,
	hubItems,
	keyToEvent,
	resultsItems,
} from "./machines/app-flow";
import { GalaxyMap } from "./screens/galaxy-map";
import { Hub } from "./screens/hub";
import { Level } from "./screens/level";
import { Onboarding } from "./screens/onboarding";
import { Pause } from "./screens/pause";
import { Results } from "./screens/results";
import { ScreenBoundary } from "./screens/screen-boundary";
import { Title } from "./screens/title";
import { ZoneMap } from "./screens/zone-map";
import {
	loadBootData,
	requestStoragePersistence,
	saveLevelCompletionCheckpoint,
	saveOnboardingProfileCheckpoint,
} from "./storage/checkpoints";

const LazyDossier = lazy(() =>
	import("./screens/dossier").then((module) => ({ default: module.Dossier })),
);
const LazyHangar = lazy(() =>
	import("./screens/hangar").then((module) => ({ default: module.Hangar })),
);
const LazyCodex = lazy(() =>
	import("./screens/codex").then((module) => ({ default: module.Codex })),
);
const LazySettings = lazy(() =>
	import("./screens/settings").then((module) => ({ default: module.Settings })),
);

function hasTrap(state: unknown) {
	if (typeof state !== "object" || state === null || !("signalfire" in state)) {
		return false;
	}
	return state.signalfire === "app-flow";
}

export type AppProps = {
	readonly firstRun?: boolean;
	readonly storage?: Storage;
};

export function App({
	firstRun: initialFirstRun,
	storage: storageProp,
}: AppProps = {}) {
	const storage = useMemo(
		() => storageProp ?? createLocalStorage(),
		[storageProp],
	);
	const [snapshot, send] = useMachine(appFlowMachine, {
		input: { firstRun: initialFirstRun ?? true },
	});
	const [progress, setProgress] = useState<ProgressDocument | null>(null);
	const [lastRun, setLastRun] = useState<{
		summary?: RunSummary;
		missed?: readonly MissedBar[];
	} | null>(null);
	const frame = useRef<HTMLElement>(null);

	useEffect(() => {
		let active = true;
		loadBootData(storage)
			.then((boot) => {
				if (!active) return;
				if (boot.progress) {
					setProgress(boot.progress);
				}
				const isFirstRun =
					initialFirstRun !== undefined ? initialFirstRun : boot.isFirstRun;
				send({ type: "ready", firstRun: isFirstRun });
			})
			.catch(() => {
				if (!active) return;
				send({ type: "ready", firstRun: initialFirstRun ?? true });
			});
		return () => {
			active = false;
		};
	}, [storage, send, initialFirstRun]);

	useEffect(() => {
		// One marker so Back asks the machine to go back, including from the title.
		// A visit stack would disagree with the screen that opened the zone map.
		const onPop = () => {
			send({ type: "back" });
			history.pushState({ signalfire: "app-flow" }, "");
		};
		if (!hasTrap(history.state)) {
			history.pushState({ signalfire: "app-flow" }, "");
		}
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, [send]);

	useEffect(() => {
		if (snapshot.value === "boot") {
			return;
		}
		frame.current?.focus();
	}, [snapshot.value]);

	useEffect(() => {
		if (snapshot.value === "level") {
			return;
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
				return;
			}
			// When on onboarding, only Escape is handled by app shell to go back to title.
			// Other keys (arrows, space, f, j) are handled by Onboarding itself.
			if (snapshot.value === "onboarding" && event.key !== "Escape") {
				return;
			}
			const next = keyToEvent(snapshot, event.key);
			if (next === null) {
				return;
			}
			event.preventDefault();
			send(next);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [snapshot, send]);

	if (snapshot.value === "boot") {
		return null;
	}

	const open = (event: AppFlowEvent) => {
		send(event);
	};

	let screen = null;
	switch (snapshot.value) {
		case "title":
			screen = <Title />;
			break;
		case "onboarding":
			screen = (
				<Onboarding
					onComplete={(profile) => {
						saveOnboardingProfileCheckpoint(storage, profile).catch(() => {});
						send({ type: "continue" });
					}}
				/>
			);
			break;
		case "hub":
			screen = (
				<Hub
					items={hubItems}
					selectedIndex={snapshot.context.hubIndex}
					onOpen={open}
				/>
			);
			break;
		case "galaxyMap":
			screen = <GalaxyMap />;
			break;
		case "zoneMap":
			screen = (
				<ZoneMap
					progress={progress}
					onStartLevel={(levelId) => send({ type: "startLevel", levelId })}
				/>
			);
			break;
		case "dossier":
			screen = <LazyDossier />;
			break;
		case "hangar":
			screen = <LazyHangar />;
			break;
		case "codex":
			screen = <LazyCodex />;
			break;
		case "settings":
			screen = <LazySettings />;
			break;
		case "level":
			screen = (
				<Level
					key={snapshot.context.levelId}
					levelId={snapshot.context.levelId}
					onFinish={(summary, missed, runProgress) => {
						setLastRun({ summary, missed });
						if (runProgress) {
							setProgress(runProgress);
						}
						if (snapshot.context.levelId === "level:1.1" && summary) {
							saveLevelCompletionCheckpoint(storage, {
								levelId: "level:1.1",
								summary,
								zoneHasStarBars: true,
							})
								.then((res) => {
									setProgress(res.progress);
								})
								.catch(() => {});
							if (summary.stars >= 1) {
								requestStoragePersistence();
							}
						}
						send({ type: "finish" });
					}}
					onExit={() => send({ type: "toZoneMap" })}
				/>
			);
			break;
		case "pause":
			screen = (
				<Pause
					onResume={() => send({ type: "resume" })}
					onQuit={() => send({ type: "toZoneMap" })}
				/>
			);
			break;
		case "results":
			screen = (
				<Results
					stars={lastRun?.summary?.stars}
					score={lastRun?.summary?.score}
					integrity={lastRun?.summary?.accuracy}
					velocity={lastRun?.summary?.netWpm}
					missed={lastRun?.missed}
					items={resultsItems}
					selectedIndex={snapshot.context.resultsIndex}
					onOpen={open}
					onContinue={() => send({ type: "toZoneMap" })}
				/>
			);
			break;
	}

	return (
		<main
			ref={frame}
			data-screen={snapshot.value}
			tabIndex={-1}
			className="outline-none focus:shadow-focus"
		>
			<ScreenBoundary
				key={snapshot.value}
				onBack={() => send({ type: "back" })}
			>
				<Suspense fallback={<p>Loading</p>}>{screen}</Suspense>
			</ScreenBoundary>
		</main>
	);
}
