import { spawn } from "node:child_process";
import { cp, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fixturesRoot = join(root, "tools", "layer-boundaries", "fixtures");
const category = "lint/style/noRestrictedImports";

function lint(tempDir) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			join(root, "node_modules", ".bin", "biome"),
			[
				"lint",
				join(tempDir, "src"),
				"--config-path",
				tempDir,
				"--vcs-enabled=false",
				"--reporter=json",
			],
			{ cwd: tempDir },
		);
		let stdout = "";
		let stderr = "";
		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("error", reject);
		child.on("close", () => {
			const start = stdout.indexOf("{");
			if (start === -1) {
				reject(new Error(stderr || "biome did not print JSON"));
				return;
			}
			const report = JSON.parse(stdout.slice(start));
			const diagnostics = report.diagnostics ?? [];
			resolve(
				diagnostics.some((diagnostic) => diagnostic.category === category),
			);
		});
	});
}

async function checkTree(srcDir, label, expectRestricted) {
	const tempDir = await mkdtemp(join(tmpdir(), "layer-boundaries-"));
	try {
		await cp(join(root, "biome.jsonc"), join(tempDir, "biome.jsonc"));
		await cp(srcDir, join(tempDir, "src"), { recursive: true });
		const restricted = await lint(tempDir);
		const ok = restricted === expectRestricted;
		const verdict = ok
			? "ok"
			: expectRestricted
				? "missing noRestrictedImports"
				: "unexpected noRestrictedImports";
		console.log(`${label}: ${verdict}`);
		return ok;
	} finally {
		await rm(tempDir, { recursive: true, force: true });
	}
}

const failRoot = join(fixturesRoot, "fail");
const failNames = (await readdir(failRoot, { withFileTypes: true }))
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)
	.sort();

let ok = await checkTree(join(fixturesRoot, "pass", "src"), "pass", false);
for (const name of failNames) {
	const failed = await checkTree(
		join(failRoot, name, "src"),
		`fail ${name}`,
		true,
	);
	ok = ok && failed;
}

if (!ok) {
	process.exit(1);
}
