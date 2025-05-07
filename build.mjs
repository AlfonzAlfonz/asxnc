// @ts-check
import { build } from "esbuild";
import { $, path } from "zx";
import fs from "fs/promises";
import * as ts from "typescript";
import tsconfig from "./tsconfig.json" with { type: "json" };

await $`rm -rf ./dist`;

const files = await fs
	.readdir("./src", { recursive: true, withFileTypes: true })
	.then((files) =>
		files
			.filter((f) => !f.isDirectory() && !f.name.endsWith(".test.ts"))
			.map((f) => path.join(f.parentPath, f.name)),
	);
console.log("Building:", files);

await Promise.all([
	build({
		entryPoints: files,
		format: "esm",
		outdir: "./dist",
		outExtension: { ".js": ".mjs" },
	}),
	build({
		entryPoints: files,
		format: "cjs",
		outdir: "./dist",
		outExtension: { ".js": ".cjs" },
	}),
]);

const p = ts.createProgram(files, {
	...tsconfig.compilerOptions,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Bundler,
	moduleDetection: ts.ModuleDetectionKind.Force,
	target: ts.ScriptTarget.ESNext,
});

p.emit();
