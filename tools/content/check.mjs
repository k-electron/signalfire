import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBundledContent } from "../../src/core/content/load.ts";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const argument = process.argv[2];
const contentRoot =
	argument === undefined
		? join(repoRoot, "content")
		: isAbsolute(argument)
			? argument
			: join(process.cwd(), argument);

const folders = ["zones", "levels", "tuning"];
const files = [];
let failed = false;

for (const folder of folders) {
	const directory = join(contentRoot, folder);
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch {
		console.error(folder);
		failed = true;
		continue;
	}
	for (const entry of entries) {
		if (!entry.isFile()) {
			continue;
		}
		const path = `${folder}/${entry.name}`;
		if (!entry.name.endsWith(".json")) {
			files.push({ path, value: null });
			continue;
		}
		const text = await readFile(join(directory, entry.name), "utf8");
		try {
			files.push({ path, value: JSON.parse(text) });
		} catch (error) {
			const message = error instanceof Error ? error.message : "invalid JSON";
			console.error(`${path}: ${message}`);
			failed = true;
		}
	}
}

if (failed) {
	process.exit(1);
}

const result = loadBundledContent(files);
if (!result.ok) {
	for (const error of result.errors) {
		console.error(`${error.path}: ${error.message}`);
	}
	process.exit(1);
}

const lines = Object.values(result.content.levels)
	.map((level) => `${level.id} ${level.contentVersion}`)
	.sort();
for (const line of lines) {
	console.log(line);
}
