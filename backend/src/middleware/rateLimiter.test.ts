import type { NextFunction, Request, Response } from 'express';
import type { Socket } from 'net';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from './rateLimiter.js';

describe('Rate Limiter', () => {
	const mockRequest = (ip: string): Partial<Request> => ({
		ip,
		socket: { remoteAddress: ip } as Socket
	});

	const mockResponse = (): Partial<Response> => {
		const res: Partial<Response> = {};
		res.status = vi.fn().mockReturnValue(res);
		res.json = vi.fn().mockReturnValue(res);
		return res;
	};

	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('should allow requests under the limit', () => {
		const limiter = createRateLimiter();
		const req = mockRequest('192.168.1.1') as Request;
		const res = mockResponse() as Response;
		const next = vi.fn() as NextFunction;

		limiter(req, res, next);

		// check that request passed through successfully
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('should block requests over the limit', () => {
		const limiter = createRateLimiter();
		const res = mockResponse() as Response;
		const next = vi.fn() as NextFunction;

		// Make 101 requests (default limit is 100)
		for (let i = 0; i < 101; i++) {
			const req = mockRequest('192.168.1.2') as Request;
			limiter(req, res, next);
		}

		expect(res.status).toHaveBeenCalledWith(429);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				error: 'Too many requests, please try again later'
			})
		);
	});

	it('should reset limit after window expires', () => {
		const limiter = createRateLimiter();
		const next = vi.fn() as NextFunction;

		// Exhaust the limit
		for (let i = 0; i < 100; i++) {
			const req = mockRequest('192.168.1.3') as Request;
			const res = mockResponse() as Response;
			limiter(req, res, next);
		}

		// Advance time past the window (default 60 seconds)
		vi.advanceTimersByTime(61000);

		// Should allow new request
		const req = mockRequest('192.168.1.3') as Request;
		const res = mockResponse() as Response;
		const freshNext = vi.fn() as NextFunction;
		limiter(req, res, freshNext);

		expect(freshNext).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it('should track different IPs separately', () => {
		const limiter = createRateLimiter();
		const next = vi.fn() as NextFunction;

		// Exhaust limit for IP 1
		for (let i = 0; i < 100; i++) {
			const req = mockRequest('192.168.1.10') as Request;
			const res = mockResponse() as Response;
			limiter(req, res, next);
		}

		// IP 2 should still be allowed
		const req = mockRequest('192.168.1.11') as Request;
		const res = mockResponse() as Response;
		const otherNext = vi.fn() as NextFunction;
		limiter(req, res, otherNext);

		expect(otherNext).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});
});
