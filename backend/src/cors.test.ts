import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

const app = createApp();

describe('CORS Configuration', () => {
	const allowedOrigins = [
		'http://localhost:5173',
		'http://localhost:3001',
		'http://127.0.0.1:5173'
	];

	const disallowedOrigins = [
		'http://localhost:4000',
		'http://example.com',
		'http://malicious-site.com'
	];

	describe('Allowed Origins', () => {
		it.each(allowedOrigins)('should allow requests from %s', async (origin) => {
			const response = await request(app)
				.options('/api/tasks')
				.set('Origin', origin)
				.set('Access-Control-Request-Method', 'GET');

			expect(response.headers['access-control-allow-origin']).toBe(origin);
			expect(response.headers['access-control-allow-credentials']).toBe('true');
		});

		it.each(allowedOrigins)(
			'should include CORS headers in GET response from %s',
			async (origin) => {
				const response = await request(app).get('/api/tasks').set('Origin', origin);

				expect(response.headers['access-control-allow-origin']).toBe(origin);
			}
		);
	});

	describe('Disallowed Origins', () => {
		it.each(disallowedOrigins)(
			'should not include CORS headers for requests from %s',
			async (origin) => {
				const response = await request(app)
					.options('/api/tasks')
					.set('Origin', origin)
					.set('Access-Control-Request-Method', 'GET');

				expect(response.headers['access-control-allow-origin']).toBeUndefined();
			}
		);
	});

	describe('Allowed Methods', () => {
		const allowedMethods = ['GET', 'POST', 'DELETE'];

		it('should allow configured HTTP methods', async () => {
			const response = await request(app)
				.options('/api/tasks')
				.set('Origin', 'http://localhost:5173')
				.set('Access-Control-Request-Method', 'GET');

			const allowedMethodsHeader = response.headers['access-control-allow-methods'];
			allowedMethods.forEach((method) => {
				expect(allowedMethodsHeader).toContain(method);
			});
		});

		it('should not allow PUT method', async () => {
			const response = await request(app)
				.options('/api/tasks')
				.set('Origin', 'http://localhost:5173')
				.set('Access-Control-Request-Method', 'PUT');

			// CORS preflight for disallowed method should still return allowed methods
			// but PUT should not be in the list
			const allowedMethodsHeader = response.headers['access-control-allow-methods'];
			expect(allowedMethodsHeader).not.toContain('PUT');
		});
	});

	describe('Credentials', () => {
		it('should allow credentials', async () => {
			const response = await request(app).get('/api/tasks').set('Origin', 'http://localhost:5173');

			expect(response.headers['access-control-allow-credentials']).toBe('true');
		});
	});

	describe('Preflight Requests', () => {
		it('should respond to OPTIONS preflight request', async () => {
			const response = await request(app)
				.options('/api/tasks')
				.set('Origin', 'http://localhost:5173')
				.set('Access-Control-Request-Method', 'POST')
				.set('Access-Control-Request-Headers', 'Content-Type');

			expect(response.status).toBe(204);
			expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
			expect(response.headers['access-control-allow-methods']).toBeDefined();
		});
	});
});
