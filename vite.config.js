import { defineConfig } from "vite";

export default defineConfig({
	// Base public path when served in development or production
	base: "./",

	// Development server configuration
	server: {
		port: 3000,
		open: true, // Automatically open browser
		host: true, // Allow external connections
	},

	// Build configuration
	build: {
		outDir: "dist",
		assetsDir: "assets",
		sourcemap: true,

		// Optimize chunks for better loading
		rollupOptions: {
			output: {
				manualChunks: {
					three: ["three"],
				},
			},
		},
	},

	// Optimize dependencies
	optimizeDeps: {
		include: ["three"],
	},

	// Handle static assets
	assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.fbx", "**/*.obj"],
});
