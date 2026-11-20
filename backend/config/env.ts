import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  smtp: {
    host: process.env.SMTP_HOST?.trim() || '',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false',
    user: process.env.SMTP_USER?.trim() || '',
    pass: process.env.SMTP_PASS?.trim() || '',
    from:
      process.env.SMTP_FROM?.trim() ||
      (process.env.SMTP_USER ? `Aurelia Estates <${process.env.SMTP_USER.trim()}>` : 'Aurelia Estates <noreply@aureliaestates.in>'),
  },
  inquiryRecipientEmail: process.env.INQUIRY_RECIPIENT_EMAIL?.trim() || 'anujmlahoti24@gmail.com',
};

export function isSmtpConfigured(): boolean {
  const { host, user, pass } = envConfig.smtp;
  if (!host || !user || !pass) return false;
  if (user.includes('your-sender-email') || pass.includes('your-16-character')) return false;
  return true;
}
