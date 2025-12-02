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
	});

	describe('Disallowed Origins', () => {
		it.each(disallowedOrigins)(
			'should not include CORS headers for preflight requests from %s',
			async (origin) => {
				const response = await request(app)
					.options('/api/tasks')
					.set('Origin', origin)
					.set('Access-Control-Request-Method', 'GET');

				expect(response.headers['access-control-allow-origin']).toBeUndefined();
			}
		);

		it.each(disallowedOrigins)(
			'should not include CORS headers for actual GET requests from %s',
			async (origin) => {
				const response = await request(app).get('/api/tasks').set('Origin', origin);

				// The request succeeds server-side, but browser would block it
				// because Access-Control-Allow-Origin header is missing
				expect(response.headers['access-control-allow-origin']).toBeUndefined();
			}
		);

		it.each(disallowedOrigins)(
			'should not include CORS headers for actual POST requests from %s',
			async (origin) => {
				const response = await request(app)
					.post('/api/tasks')
					.set('Origin', origin)
					.set('Content-Type', 'application/json')
					.send({ title: 'Test task', priority: 1 });

				// Server processes the request, but browser blocks response
				// due to missing Access-Control-Allow-Origin header
				expect(response.headers['access-control-allow-origin']).toBeUndefined();
			}
		);
	});

	describe('Preflight Requests', () => {
		it('should respond to OPTIONS preflight with allowed methods', async () => {
			const response = await request(app)
				.options('/api/tasks')
				.set('Origin', 'http://localhost:5173')
				.set('Access-Control-Request-Method', 'POST')
				.set('Access-Control-Request-Headers', 'Content-Type');

			expect(response.status).toBe(204);
			expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
			expect(response.headers['access-control-allow-methods']).toContain('GET');
			expect(response.headers['access-control-allow-methods']).toContain('POST');
			expect(response.headers['access-control-allow-methods']).toContain('DELETE');
		});
	});
});
