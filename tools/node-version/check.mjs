import { readFileSync } from "node:fs";

const lockfile = readFileSync("pnpm-lock.yaml", "utf8");
const versions = new Set();
for (const line of lockfile.split("\n")) {
	const match = /^\s{2}node@runtime:([^:]+):$/.exec(line);
	if (match?.[1] !== undefined) {
		versions.add(match[1]);
	}
}
if (versions.size !== 1) {
	console.error(
		`expected one node@runtime package, found ${[...versions].join(", ")}`,
	);
	process.exit(1);
}
const locked = [...versions][0];
const file = readFileSync(".node-version", "utf8").trim();
if (file !== locked) {
	console.error(
		`.node-version is ${file}; the lockfile node@runtime is ${locked}`,
	);
	process.exit(1);
}
