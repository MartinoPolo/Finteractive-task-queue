/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PORT: number;
	readonly VITE_API_URL: string;
	readonly VITE_WS_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
