/**
 * Minimalistic logging utility for backend network communication.
 * Icon: ⚙️ to distinguish from frontend logs
 */

type LogType = 'http' | 'ws' | 'info' | 'error';

const COLORS = {
	reset: '\x1b[0m',
	dim: '\x1b[2m',
	cyan: '\x1b[36m',
	green: '\x1b[32m',
	red: '\x1b[31m'
} as const;

const TYPE_LABELS = {
	http: 'HTTP',
	ws: 'WS',
	info: 'INFO',
	error: 'ERR'
} as const;

const ICON = '⚙️';

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

const logWithColor = (type: LogType, message: string, payload?: unknown): void => {
	const timestamp = getTimestamp();
	const typeLabel = TYPE_LABELS[type];
	const payloadStr = formatPayload(payload);
	const payloadPart = payloadStr ? ` ${payloadStr}` : '';
	const formatted = `${timestamp} ${ICON} [${typeLabel}] ${message}${payloadPart}`;

	const colors = {
		http: COLORS.cyan,
		ws: COLORS.green,
		info: COLORS.dim,
		error: COLORS.red
	};
	console.log(`${colors[type]}${formatted}${COLORS.reset}`);
};

export const logger = {
	/**
	 * Log HTTP request
	 * @example logger.http('GET', '/api/tasks')
	 * @example logger.http('POST', '/api/tasks', { name: 'Task 1' })
	 */
	http: (method: string, path: string, payload?: unknown): void => {
		logWithColor('http', `${method} ${path}`, payload);
	},

	/**
	 * Log HTTP response
	 * @example logger.httpRes('GET', '/api/tasks', 200)
	 */
	httpRes: (method: string, path: string, status: number): void => {
		logWithColor('http', `${method} ${path} → ${status}`);
	},

	/**
	 * Log WebSocket event
	 * @example logger.ws('→', 'task_added', { id: '123' }) // outgoing
	 * @example logger.ws('←', 'join_queue') // incoming
	 */
	ws: (direction: '→' | '←', event: string, payload?: unknown): void => {
		logWithColor('ws', `${direction} ${event}`, payload);
	},

	/**
	 * Log info message
	 */
	info: (message: string): void => {
		logWithColor('info', message);
	},

	/**
	 * Log error message
	 */
	error: (message: string, error?: unknown): void => {
		const errorMsg = error instanceof Error ? error.message : error;
		logWithColor('error', message, errorMsg);
	}
};
