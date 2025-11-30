import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const apiUrl = env.VITE_API_URL || 'http://localhost:3000';
	const wsUrl = env.VITE_WS_URL || 'http://localhost:3000';
	const port = Number(env.VITE_PORT) || 5173;

	return {
		plugins: [react()],
		resolve: {
			alias: {
				'@': resolve(__dirname, './src')
			}
		},
		server: {
			port,
			proxy: {
				'/api': {
					target: apiUrl,
					changeOrigin: true
				},
				'/socket.io': {
					target: wsUrl,
					changeOrigin: true,
					ws: true
				}
			}
		},
		build: {
			outDir: 'dist',
			sourcemap: true
		}
	};
});
