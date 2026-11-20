import nodemailer from 'nodemailer';
import { envConfig, isSmtpConfigured } from '../config/env.ts';
import type { InquiryEmailPayload } from '../models/inquiryModel.ts';

export interface EmailDeliveryResult {
  delivered: boolean;
  messageId?: string;
  recipient: string;
  error?: string;
  configured: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendInquiryNotificationEmail(
  inquiry: InquiryEmailPayload
): Promise<EmailDeliveryResult> {
  const recipient = envConfig.inquiryRecipientEmail;

  if (!isSmtpConfigured()) {
    return {
      delivered: false,
      configured: false,
      recipient,
      error:
        'SMTP email credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured on the server. Set them in your environment secrets to enable automatic email delivery.',
    };
  }

  const formattedDate = new Date(inquiry.submittedAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Asia/Kolkata',
  });

  const subject = 'New Property Inquiry - Real Estate Property Management System';

  const plainTextBody = [
    'NEW PROPERTY INQUIRY — AURELIA ESTATES',
    '====================================================',
    `Customer Name:            ${inquiry.fullName}`,
    `Customer Email:           ${inquiry.email}`,
    `Phone Number:             ${inquiry.phone}`,
    `Interested Property:      ${inquiry.propertyTitle} (ID: ${inquiry.propertyId})`,
    `Inquiry Type:             ${inquiry.inquiryType}`,
    `Preferred Contact Method: ${inquiry.preferredContact}`,
    `Submission Date & Time:   ${formattedDate}`,
    '',
    'Customer Message:',
    inquiry.message,
    '====================================================',
  ].join('\n');

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #18181b; max-width: 640px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #18181b; padding: 24px 28px; border-bottom: 3px solid #c5a059;">
        <p style="margin: 0; color: #c5a059; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;">Aurelia Estates</p>
        <h1 style="margin: 6px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 600;">New Property Inquiry</h1>
      </div>
      <div style="padding: 28px; background-color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; color: #71717a; width: 40%;">Customer Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; font-weight: 600;">${escapeHtml(inquiry.fullName)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; color: #71717a;">Customer Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5;"><a href="mailto:${escapeHtml(inquiry.email)}" style="color: #9a742c;">${escapeHtml(inquiry.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; color: #71717a;">Phone Number</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5;">${escapeHtml(inquiry.phone)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; color: #71717a;">Interested Property</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; font-weight: 600;">${escapeHtml(inquiry.propertyTitle)} <span style="color: #71717a; font-weight: 400;">(${escapeHtml(inquiry.propertyId)})</span></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; color: #71717a;">Inquiry Type</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5;">${escapeHtml(inquiry.inquiryType)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; color: #71717a;">Preferred Contact</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5;">${escapeHtml(inquiry.preferredContact)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5; color: #71717a;">Submitted At</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f4f4f5;">${escapeHtml(formattedDate)}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; font-weight: 600;">Customer Message</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</p>
        </div>
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: envConfig.smtp.host,
      port: envConfig.smtp.port,
      secure: envConfig.smtp.secure,
      auth: {
        user: envConfig.smtp.user,
        pass: envConfig.smtp.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: envConfig.smtp.from,
      to: recipient,
      replyTo: inquiry.email,
      subject,
      text: plainTextBody,
      html: htmlBody,
    });

    return {
      delivered: true,
      configured: true,
      recipient,
      messageId: info.messageId,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown SMTP delivery error';
    console.error('[EmailService] Failed to send inquiry notification:', errorMessage);
    return {
      delivered: false,
      configured: true,
      recipient,
      error: `Email delivery failed: ${errorMessage}`,
    };
  }
}
