import { readFileSync } from "node:fs";

const firstLine = readFileSync(process.argv[2], "utf8").split("\n")[0] ?? "";
const ok =
	/^(feat|fix|refactor|test|docs|chore|perf|content)(\([a-z0-9-]+\))?!?: \S/.test(
		firstLine,
	);

if (!ok) {
	console.error("Commit message must match: type(scope): summary");
	console.error("Types: feat, fix, refactor, test, docs, chore, perf, content");
	process.exit(1);
}
