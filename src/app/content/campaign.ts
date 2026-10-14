import level01 from "../../../content/levels/0-1-twin-beacons.json" with {
	type: "json",
};
import level11 from "../../../content/levels/1-1-first-light.json" with {
	type: "json",
};
import tuning from "../../../content/tuning/waiting-lanes.json" with {
	type: "json",
};
import zone0 from "../../../content/zones/0-home-row-station.json" with {
	type: "json",
};
import zone1 from "../../../content/zones/1-the-drift.json" with {
	type: "json",
};
import { loadBundledContent } from "../../core/content/load";

const loaded = loadBundledContent([
	{ path: "zones/0-home-row-station.json", value: zone0 },
	{ path: "zones/1-the-drift.json", value: zone1 },
	{ path: "levels/0-1-twin-beacons.json", value: level01 },
	{ path: "levels/1-1-first-light.json", value: level11 },
	{ path: "tuning/waiting-lanes.json", value: tuning },
]);

if (!loaded.ok) {
	const details = loaded.errors
		.map((error) => `${error.path}: ${error.message}`)
		.join("\n");
	throw new Error(details);
}

export const campaign = loaded.content;
