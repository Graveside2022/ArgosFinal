import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		host: true,
		watch: {
			// Ignore log files to reduce memory usage
			ignored: ['**/logs/**', '**/*.log', '/tmp/**']
		}
	},
	optimizeDeps: {
		// Exclude heavy dependencies from pre-bundling
		exclude: ['@sveltejs/kit']
	},
	build: {
		// Reduce memory usage during build
		sourcemap: false,
		chunkSizeWarningLimit: 1000,
		// Enable tree-shaking and minification
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		},
		// Split vendor chunks for better caching
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte']
				}
			}
		}
	}
});
