import type { Config } from "jest";

const config: Config = {
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts", ".tsx"],
	transform: {
		"^.+\\.(t|j)sx?$": "@swc/jest",
	},
	moduleNameMapper: {
		"(.+)\\.js": "$1",
	},
};

export default config;
