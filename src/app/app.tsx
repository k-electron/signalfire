import { useMachine } from "@xstate/react";
import { lazy, Suspense, useEffect, useRef } from "react";
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

export function App({ firstRun = true }: { firstRun?: boolean }) {
	const [snapshot, send] = useMachine(appFlowMachine, {
		input: { firstRun },
	});
	const frame = useRef<HTMLElement>(null);

	useEffect(() => {
		send({ type: "ready" });
	}, [send]);

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
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
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
			screen = <Onboarding />;
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
			screen = <ZoneMap />;
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
			screen = <Level />;
			break;
		case "pause":
			screen = <Pause />;
			break;
		case "results":
			screen = (
				<Results
					items={resultsItems}
					selectedIndex={snapshot.context.resultsIndex}
					onOpen={open}
				/>
			);
			break;
		default:
			screen = null;
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
