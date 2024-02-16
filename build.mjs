// @ts-check
import { build } from "esbuild";
import { $ } from "zx";

/** @type {import("esbuild").BuildOptions} */
const common = {
	bundle: true,
	entryPoints: ["src/index.ts"],
	platform: "neutral",
};

await Promise.all([
	$`tsc -p tsconfig.json --rootDir ./src`,
	build({
		...common,
		outfile: "./dist/index.js",
		target: "es6",
	}),
	build({
		...common,
		outfile: "./dist/index.esnext.js",
		target: "esnext",
		minify: true,
	}),
]);
