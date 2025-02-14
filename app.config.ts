import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		preset: "node-server",
	},
	tsr: {
		routeToken: "layout",
	},
	vite: {
		plugins: [tailwindcss(), tsConfigPaths()],
		optimizeDeps: {
			exclude: ["@electric-sql/pglite"],
		},
		worker: {
			format: "es",
		},
	},
	react: {
		babel: {
			plugins: [["@babel/plugin-proposal-decorators", { version: "2023-05" }]],
		},
	},
});
