import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
	title: "async",
	tagline: "A collection of useful async utilities",
	favicon: "img/favicon.ico", // TODO

	url: "https://your-docusaurus-site.example.com", // TODO
	baseUrl: "/",

	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",

	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					// editUrl:
					// 	"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/", // TODO
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],

	plugins: [
		[
			"@docusaurus/plugin-content-docs",
			{
				id: "api",
				path: "api",
				routeBasePath: "/api/",
				sidebarPath: require.resolve("./sidebars-api.js"),
			},
		],
	],

	themeConfig: {
		// image: "img/docusaurus-social-card.jpg", // TODO
		navbar: {
			title: "async",
			items: [
				{
					type: "docSidebar",
					sidebarId: "docs",
					position: "left",
					label: "Docs",
				},
				{
					type: "docSidebar",
					docsPluginId: "api",
					sidebarId: "api",
					position: "left",
					label: "API",
				},
				{
					href: "https://github.com/AlfonzAlfonz/async",
					label: "GitHub",
					position: "right",
				},
			],
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
