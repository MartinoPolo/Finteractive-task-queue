import { describe, expect, it } from 'vitest';
import { ApiError } from '../types/api';
import { getUserFriendlyErrorMessage, OPERATION_ERROR_MESSAGES } from './errorMessages';

describe('errorMessages', () => {
	describe('getUserFriendlyErrorMessage', () => {
		describe('network errors', () => {
			it('should transform "Failed to fetch" to user-friendly message', () => {
				const error = new TypeError('Failed to fetch');
				expect(getUserFriendlyErrorMessage(error)).toBe(
					'Unable to connect to server. Please check your internet connection.'
				);
			});

			it('should handle network error patterns', () => {
				expect(getUserFriendlyErrorMessage(new Error('Network Error'))).toBe(
					'Network error. Please check your internet connection.'
				);
			});

			it('should handle timeout errors', () => {
				expect(getUserFriendlyErrorMessage(new Error('Request timeout'))).toBe(
					'Request timed out. Please try again.'
				);
			});

			it('should handle ERR_NETWORK errors', () => {
				expect(getUserFriendlyErrorMessage(new Error('ERR_NETWORK'))).toBe(
					'Network error. Please check your internet connection.'
				);
			});
		});

		describe('ApiError handling', () => {
			it('should use status code message for known status codes', () => {
				const error = new ApiError('Internal error details', 500);
				expect(getUserFriendlyErrorMessage(error)).toBe('Server error. Please try again later.');
			});

			it('should handle 429 rate limit', () => {
				const error = new ApiError('Rate limited', 429);
				expect(getUserFriendlyErrorMessage(error)).toBe(
					'Too many requests. Please wait a moment and try again.'
				);
			});

			it('should handle 503 service unavailable', () => {
				const error = new ApiError('Service down', 503);
				expect(getUserFriendlyErrorMessage(error)).toBe(
					'Service temporarily unavailable. Please try again later.'
				);
			});

			it('should fall back to pattern matching for unknown status codes', () => {
				const error = new ApiError('Rate limit exceeded', 418);
				expect(getUserFriendlyErrorMessage(error)).toBe(
					'Too many requests. Please wait a moment and try again.'
				);
			});
		});

		describe('context-based fallbacks', () => {
			it('should use createTask context for unknown errors', () => {
				const error = new Error('Some internal error');
				expect(getUserFriendlyErrorMessage(error, 'createTask')).toBe(
					OPERATION_ERROR_MESSAGES.createTask
				);
			});

			it('should use clearCompleted context for unknown errors', () => {
				const error = new Error('Some internal error');
				expect(getUserFriendlyErrorMessage(error, 'clearCompleted')).toBe(
					OPERATION_ERROR_MESSAGES.clearCompleted
				);
			});

			it('should use generic fallback when no context provided', () => {
				const error = new Error('Unknown xyz error');
				expect(getUserFriendlyErrorMessage(error)).toBe(
					'An unexpected error occurred. Please try again.'
				);
			});
		});

		describe('string errors', () => {
			it('should handle string errors', () => {
				expect(getUserFriendlyErrorMessage('Failed to fetch')).toBe(
					'Unable to connect to server. Please check your internet connection.'
				);
			});
		});
	});
});
