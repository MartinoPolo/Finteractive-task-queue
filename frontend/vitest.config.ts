import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plugins: [react() as any],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src')
		}
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			reporter: ['text', 'html'],
			exclude: ['node_modules/', 'dist/', 'build/']
		}
	}
});
