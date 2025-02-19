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
	routers: {
		client: {
			vite: {
				// @ts-expect-error fixed when https://github.com/nksaraf/vinxi/pull/465 merged
				server: {
					hmr: {
						// set a specific port for the HMR server, this is what Caddy will proxy to
						port: 60101,

						// this is where caddy is listening - it will proxy to 60101
						clientPort: 60100,
					},
				},
			},
		},
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
