import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import type { InquiryType, PreferredContact } from '../models/types';
import {
  submitPropertyInquiry,
  type SubmitInquiryResponse,
} from '../services/inquiryService';

interface InquiryFormProps {
  propertyId?: string;
  propertyTitle?: string;
  defaultInquiryType?: InquiryType;
  compact?: boolean;
}

const INQUIRY_TYPES: readonly InquiryType[] = [
  'Buying',
  'Renting',
  'Site Visit',
  'General Inquiry',
];

const CONTACT_METHODS: readonly PreferredContact[] = ['Phone', 'Email', 'WhatsApp'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s\-()]{7,25}$/;

export function InquiryForm({
  propertyId,
  propertyTitle,
  defaultInquiryType = 'Buying',
  compact = false,
}: InquiryFormProps) {
  const { profile } = useAuth();
  const { properties } = useProperties();

  const [fullName, setFullName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || 'general');
  const [inquiryType, setInquiryType] = useState<InquiryType>(defaultInquiryType);
  const [preferredContact, setPreferredContact] = useState<PreferredContact>('Phone');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitInquiryResponse | null>(null);
  const [lastFingerprint, setLastFingerprint] = useState<string>('');

  useEffect(() => {
    if (profile) {
      setFullName((prev) => prev || profile.name);
      setEmail((prev) => prev || profile.email);
      setPhone((prev) => prev || profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (propertyId) setSelectedPropertyId(propertyId);
  }, [propertyId]);

  useEffect(() => {
    setInquiryType(defaultInquiryType);
  }, [defaultInquiryType]);

  const resolvedTitle = propertyId
    ? propertyTitle || 'Selected Property'
    : selectedPropertyId === 'general'
      ? 'General Property Consultation'
      : properties.find((p) => p.id === selectedPropertyId)?.title || 'Selected Property';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setResult(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setValidationError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!PHONE_RE.test(trimmedPhone)) {
      setValidationError('Please enter a valid phone number (7–25 digits).');
      return;
    }
    if (trimmedMessage.length < 5) {
      setValidationError('Please enter a brief message about your requirements.');
      return;
    }

    const fingerprint = `${trimmedEmail.toLowerCase()}|${selectedPropertyId}|${inquiryType}|${trimmedMessage}`;
    if (fingerprint === lastFingerprint) {
      setValidationError(
        'This exact inquiry has already been submitted. Modify your message if you need to send an update.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitPropertyInquiry({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        propertyId: selectedPropertyId,
        propertyTitle: resolvedTitle,
        inquiryType,
        preferredContact,
        message: trimmedMessage,
      });

      setResult(response);
      if (response.savedToDatabase) {
        setLastFingerprint(fingerprint);
        setMessage('');
      }
    } catch (err) {
      setValidationError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your inquiry right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {validationError && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {result && result.savedToDatabase && result.emailDelivered && (
        <div
          role="status"
          className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Inquiry submitted and emailed successfully.</p>
            <p className="text-emerald-800 mt-1">
              Reference ID <span className="font-mono">{result.inquiryId}</span> has been recorded
              and dispatched to <span className="font-medium">{result.recipient}</span>. Our
              advisory desk will reach out via {preferredContact}.
            </p>
          </div>
        </div>
      )}

      {result && result.savedToDatabase && !result.emailDelivered && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-sm text-amber-950 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Inquiry saved to database, but email delivery failed.
            </p>
            <p className="text-amber-900 mt-1">
              Your inquiry (Ref: <span className="font-mono">{result.inquiryId}</span>) is securely
              stored in our admin portal, however automatic email notification to{' '}
              <span className="font-medium">{result.recipient}</span> could not be delivered:{' '}
              {result.emailError}
            </p>
          </div>
        </div>
      )}

      {result && !result.savedToDatabase && result.duplicate && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-zinc-100 border border-zinc-300 text-sm text-zinc-800 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
          <span>{result.emailError}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-4`}>
        <div>
          <label htmlFor="inq-name" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Full Name *
          </label>
          <input
            id="inq-name"
            type="text"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Aarav Deshmukh"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="inq-email" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Email Address *
          </label>
          <input
            id="inq-email"
            type="email"
            required
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-4`}>
        <div>
          <label htmlFor="inq-phone" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Phone Number *
          </label>
          <input
            id="inq-phone"
            type="tel"
            required
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98200 12345"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 tabular-nums"
          />
        </div>

        <div>
          <label htmlFor="inq-type" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Inquiry Type *
          </label>
          <select
            id="inq-type"
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value as InquiryType)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          >
            {INQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!propertyId && (
        <div>
          <label htmlFor="inq-property" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Property Interested In
          </label>
          <select
            id="inq-property"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          >
            <option value="general">General Property Consultation</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.propertyCode} — {p.title} ({p.city})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <span className="block text-xs font-medium text-zinc-700 mb-1.5">
          Preferred Contact Method *
        </span>
        <div className="grid grid-cols-3 gap-2">
          {CONTACT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPreferredContact(method)}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                preferredContact === method
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="inq-message" className="block text-xs font-medium text-zinc-700 mb-1.5">
          Message *
        </label>
        <textarea
          id="inq-message"
          rows={compact ? 3 : 4}
          required
          maxLength={2500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your preferred dates for a site visit, financing questions, or specific requirements..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting Inquiry...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Property Inquiry
          </>
        )}
      </button>

      <p className="text-[11px] text-zinc-500 leading-relaxed">
        Inquiries are securely recorded and routed to our advisory desk at{' '}
        <span className="font-medium text-zinc-700">anujmlahoti24@gmail.com</span>.
      </p>
    </form>
  );
}
