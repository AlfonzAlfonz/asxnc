import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	globalIgnores(["dist/**/*", "coverage/**/*", "docs/.docusaurus/**/*"]),
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{
					"ts-expect-error": false,
				},
			],
			"@typescript-eslint/no-non-null-asserted-optional-chain": "off",
			"no-undef": "off",
			"no-useless-escape": "off",
			"@typescript-eslint/no-require-imports": "off",
		},
	},
);
