import type { Request, Response } from 'express';
import { validateInquiryPayload } from '../models/inquiryModel.ts';
import { sendInquiryNotificationEmail } from '../services/emailService.ts';
import { envConfig, isSmtpConfigured } from '../config/env.ts';

// Deduplication window (60 seconds) to prevent accidental double submissions
const recentSubmissions = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

function cleanupDedupeCache(): void {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > DEDUPE_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }
}

export async function handleSendInquiryEmail(req: Request, res: Response): Promise<void> {
  cleanupDedupeCache();

  const validation = validateInquiryPayload((req.body ?? {}) as Record<string, unknown>);
  if (!validation.valid || !validation.data) {
    res.status(400).json({
      delivered: false,
      configured: isSmtpConfigured(),
      recipient: envConfig.inquiryRecipientEmail,
      error: validation.errors.join(' '),
    });
    return;
  }

  const inquiry = validation.data;
  const fingerprint = `${inquiry.email}|${inquiry.propertyId}|${inquiry.inquiryType}|${inquiry.message.slice(0, 80)}`;
  const lastSubmittedAt = recentSubmissions.get(fingerprint);

  if (lastSubmittedAt && Date.now() - lastSubmittedAt < DEDUPE_WINDOW_MS) {
    res.status(429).json({
      delivered: false,
      duplicate: true,
      configured: isSmtpConfigured(),
      recipient: envConfig.inquiryRecipientEmail,
      error: 'A matching inquiry was just submitted. Please wait a moment before sending another.',
    });
    return;
  }

  recentSubmissions.set(fingerprint, Date.now());

  const result = await sendInquiryNotificationEmail(inquiry);
  if (result.delivered) {
    res.status(200).json(result);
    return;
  }

  // Never falsely report success when SMTP is unconfigured or fails
  res.status(result.configured ? 502 : 503).json(result);
}

export function handleEmailServiceStatus(_req: Request, res: Response): void {
  res.json({
    configured: isSmtpConfigured(),
    recipient: envConfig.inquiryRecipientEmail,
  });
}
