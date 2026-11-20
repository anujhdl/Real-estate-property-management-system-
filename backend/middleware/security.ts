import rateLimit from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';

export const inquiryRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    delivered: false,
    error: 'Too many inquiry requests from this network. Please wait a few minutes before submitting again.',
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Upload rate limit exceeded. Please try again later.',
  },
});

export function apiErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[API Error]', err.message);
  if (err.message.includes('Only JPEG, PNG, and WebP')) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err.message.includes('File too large')) {
    res.status(413).json({ error: 'Uploaded image exceeds the 5 MB size limit.' });
    return;
  }
  res.status(500).json({ error: 'An internal server error occurred.' });
}
