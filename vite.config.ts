import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss: './postcss.config.js'
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
