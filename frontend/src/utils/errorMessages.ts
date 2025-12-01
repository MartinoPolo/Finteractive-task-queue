import { ApiError } from '../types/api';

/**
 * Known error patterns and their user-friendly messages.
 * These patterns are matched against the raw error message (case-insensitive).
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
	// Network errors
	{
		pattern: /failed to fetch/i,
		message: 'Unable to connect to server. Please check your internet connection.'
	},
	{
		pattern: /network\s*(error|request\s*failed)/i,
		message: 'Network error. Please check your internet connection.'
	},
	{ pattern: /ERR_NETWORK/i, message: 'Network error. Please check your internet connection.' },
	{
		pattern: /ERR_CONNECTION_REFUSED/i,
		message: 'Unable to reach server. Please try again later.'
	},
	{ pattern: /timeout/i, message: 'Request timed out. Please try again.' },
	{ pattern: /aborted/i, message: 'Request was cancelled. Please try again.' },

	// Rate limiting
	{ pattern: /rate\s*limit/i, message: 'Too many requests. Please wait a moment and try again.' },
	{
		pattern: /too many requests/i,
		message: 'Too many requests. Please wait a moment and try again.'
	},

	// Server errors
	{ pattern: /internal\s*server\s*error/i, message: 'Server error. Please try again later.' },
	{
		pattern: /service\s*unavailable/i,
		message: 'Service temporarily unavailable. Please try again later.'
	},
	{
		pattern: /bad\s*gateway/i,
		message: 'Server is temporarily unreachable. Please try again later.'
	}
];

/**
 * User-friendly messages for specific HTTP status codes
 */
const STATUS_CODE_MESSAGES: Record<number, string> = {
	400: 'Invalid request. Please check your input.',
	401: 'Authentication required. Please log in.',
	403: 'You do not have permission to perform this action.',
	404: 'The requested resource was not found.',
	408: 'Request timed out. Please try again.',
	429: 'Too many requests. Please wait a moment and try again.',
	500: 'Server error. Please try again later.',
	502: 'Server is temporarily unreachable. Please try again later.',
	503: 'Service temporarily unavailable. Please try again later.',
	504: 'Server took too long to respond. Please try again.'
};

/**
 * Context-specific fallback messages for different operations.
 */
export const OPERATION_ERROR_MESSAGES = {
	createTask: 'Failed to add task. Please try again.',
	clearCompleted: 'Failed to clear completed tasks. Please try again.',
	fetchTasks: 'Failed to load tasks. Please try again.',
	socketConnection: 'Connection error. Attempting to reconnect...',
	socketMaxRetries: 'Unable to connect to server. Please refresh the page.'
} as const;

export type OperationContext = keyof typeof OPERATION_ERROR_MESSAGES;

/**
 * Transforms raw error messages into user-friendly messages.
 *
 * @param error - The error to transform (can be Error, ApiError, or string)
 * @param context - Optional operation context for better fallback messages
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown, context?: OperationContext): string {
	// Handle ApiError with status code
	if (error instanceof ApiError) {
		const statusMessage = STATUS_CODE_MESSAGES[error.statusCode];
		if (statusMessage) {
			return statusMessage;
		}
		// Check if the ApiError message itself matches a pattern
		return matchErrorPattern(error.message) ?? getContextualFallback(context);
	}

	// Handle regular Error or string
	const errorMessage = error instanceof Error ? error.message : String(error);

	// Try to match against known patterns
	const matchedMessage = matchErrorPattern(errorMessage);
	if (matchedMessage) {
		return matchedMessage;
	}

	// Return contextual fallback or generic message
	return getContextualFallback(context);
}

/**
 * Matches error message against known patterns
 */
function matchErrorPattern(message: string): string | null {
	for (const { pattern, message: userMessage } of ERROR_PATTERNS) {
		if (pattern.test(message)) {
			return userMessage;
		}
	}
	return null;
}

/**
 * Gets a fallback message based on operation context
 */
function getContextualFallback(context?: OperationContext): string {
	if (context && context in OPERATION_ERROR_MESSAGES) {
		return OPERATION_ERROR_MESSAGES[context];
	}
	return 'An unexpected error occurred. Please try again.';
}

/**
 * Checks if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
		return true;
	}
	const message = error instanceof Error ? error.message : String(error);
	return /failed to fetch|network|ERR_NETWORK|ERR_CONNECTION_REFUSED/i.test(message);
}
