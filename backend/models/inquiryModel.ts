export type InquiryType = 'Buying' | 'Renting' | 'Site Visit' | 'General Inquiry';
export type PreferredContact = 'Phone' | 'Email' | 'WhatsApp';

export interface InquiryEmailPayload {
  fullName: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  inquiryType: InquiryType;
  preferredContact: PreferredContact;
  message: string;
  submittedAt: string;
}

const VALID_INQUIRY_TYPES: readonly InquiryType[] = [
  'Buying',
  'Renting',
  'Site Visit',
  'General Inquiry',
];

const VALID_CONTACT_METHODS: readonly PreferredContact[] = ['Phone', 'Email', 'WhatsApp'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+\d\s\-()]{7,25}$/;

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function validateInquiryPayload(body: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
  data?: InquiryEmailPayload;
} {
  const errors: string[] = [];

  const fullName = sanitizeText(body.fullName, 120);
  const email = sanitizeText(body.email, 160).toLowerCase();
  const phone = sanitizeText(body.phone, 30);
  const propertyId = sanitizeText(body.propertyId || 'general', 128);
  const propertyTitle = sanitizeText(body.propertyTitle || 'General Property Inquiry', 200);
  const inquiryType = sanitizeText(body.inquiryType, 40) as InquiryType;
  const preferredContact = sanitizeText(body.preferredContact, 30) as PreferredContact;
  const message = sanitizeText(body.message, 2500);
  const submittedAt = sanitizeText(body.submittedAt, 80) || new Date().toISOString();

  if (fullName.length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }
  if (!EMAIL_REGEX.test(email)) {
    errors.push('Please enter a valid email address.');
  }
  if (!PHONE_REGEX.test(phone)) {
    errors.push('Please enter a valid phone number.');
  }
  if (!VALID_INQUIRY_TYPES.includes(inquiryType)) {
    errors.push('Invalid inquiry type selected.');
  }
  if (!VALID_CONTACT_METHODS.includes(preferredContact)) {
    errors.push('Invalid preferred contact method selected.');
  }
  if (message.length < 5) {
    errors.push('Message must be at least 5 characters.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      fullName,
      email,
      phone,
      propertyId,
      propertyTitle,
      inquiryType,
      preferredContact,
      message,
      submittedAt,
    },
  };
}
