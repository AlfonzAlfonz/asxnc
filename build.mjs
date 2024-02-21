// @ts-check
import { build } from "esbuild";
import { $, fs } from "zx";

/** @type {import("esbuild").BuildOptions} */
const common = {
	bundle: true,
	entryPoints: ["src/index.ts"],
	platform: "neutral",
};

await fs.remove("./dist");

await Promise.all([
	$`tsc -p tsconfig.json`,
	build({
		...common,
		outfile: "./dist/index.cjs",
		target: "es6",
		format: "cjs",
	}),
	build({
		...common,
		outfile: "./dist/index.mjs",
		target: "es6",
	}),
	build({
		...common,
		outfile: "./dist/index.esnext.cjs",
		target: "esnext",
		format: "cjs",
	}),
	build({
		...common,
		outfile: "./dist/index.esnext.mjs",
		target: "esnext",
	}),
]);
