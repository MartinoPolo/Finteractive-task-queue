/**
 * Minimalistic logging utility for frontend network communication.
 * Icon: 🌐 to distinguish from backend logs
 * Logs are only visible when VITE_DEBUG=true environment variable is set.
 */

/**
 * Check if debug mode is enabled via environment variable
 */
const isDebugEnabled = (): boolean => import.meta.env.VITE_DEBUG === 'true';

type LogType = 'http' | 'ws' | 'info' | 'error';

const TYPE_LABELS = {
	http: 'HTTP',
	ws: 'WS',
	info: 'INFO',
	error: 'ERR'
} as const;

const ICON = '🌐';

// CSS styles for browser console
const STYLES = {
	http: 'color: #4fc3f7',
	ws: 'color: #81c784',
	info: 'color: #90a4ae',
	error: 'color: #e57373'
} as const;

/**
 * Format a minimal payload preview (max 60 chars)
 */
const formatPayload = (payload?: unknown): string => {
	if (payload === undefined || payload === null) {
		return '';
	}
	const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
	if (str.length <= 60) {
		return str;
	}
	return str.slice(0, 57) + '...';
};

/**
 * Get timestamp in HH:MM:SS format
 */
const getTimestamp = (): string => {
	const now = new Date();
	return now.toTimeString().slice(0, 8);
};

const logWithStyle = (type: LogType, message: string, payload?: unknown): void => {
	if (!isDebugEnabled()) {
		return;
	}

	const timestamp = getTimestamp();
	const typeLabel = TYPE_LABELS[type];
	const payloadStr = formatPayload(payload);
	const payloadPart = payloadStr ? ` ${payloadStr}` : '';
	const formatted = `${timestamp} ${ICON} [${typeLabel}] ${message}${payloadPart}`;
	console.log(`%c${formatted}`, STYLES[type]);
};

export const logger = {
	/**
	 * Log HTTP request
	 * @example logger.http('GET', '/api/tasks')
	 * @example logger.http('POST', '/api/tasks', { name: 'Task 1' })
	 */
	http: (method: string, url: string, payload?: unknown): void => {
		const path = url.replace(/^https?:\/\/[^/]+/, '');
		logWithStyle('http', `${method} ${path}`, payload);
	},

	/**
	 * Log WebSocket event
	 * @example logger.ws('→', 'join_queue') // outgoing
	 * @example logger.ws('←', 'task_completed', { id: '123' }) // incoming
	 */
	ws: (direction: '→' | '←', event: string, payload?: unknown): void => {
		logWithStyle('ws', `${direction} ${event}`, payload);
	},

	/**
	 * Log info message
	 */
	info: (message: string): void => {
		logWithStyle('info', message);
	},

	/**
	 * Log error message
	 */
	error: (message: string, error?: unknown): void => {
		const errorMsg = error instanceof Error ? error.message : error;
		logWithStyle('error', message, errorMsg);
	}
};
