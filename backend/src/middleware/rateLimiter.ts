import type { NextFunction, Request, Response } from 'express';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const maxRequestsPerWindow = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

// Store request counts per IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [ip, data] of requestCounts.entries()) {
		if (now > data.resetTime) {
			requestCounts.delete(ip);
		}
	}
}, windowMs);

export const createRateLimiter = () => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const ip = req.ip || req.socket.remoteAddress || 'unknown';
		const now = Date.now();

		const clientData = requestCounts.get(ip);

		if (!clientData || now > clientData.resetTime) {
			// New window
			requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
			next();
			return;
		}

		if (clientData.count >= maxRequestsPerWindow) {
			const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
			res.status(429).json({
				success: false,
				error: 'Too many requests, please try again later',
				retryAfter
			});
			return;
		}

		clientData.count++;
		next();
	};
};

// Default rate limiter instance
export const rateLimiter = createRateLimiter();
