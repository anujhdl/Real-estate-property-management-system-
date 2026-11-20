import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { handleFirestoreError, OperationType } from '../database/firestoreError';
import type {
  EmailDeliveryStatus,
  Inquiry,
  InquiryStatus,
  InquiryType,
  PreferredContact,
} from '../models/types';

const INQUIRIES_COLLECTION = 'inquiries';

export interface SubmitInquiryInput {
  fullName: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  inquiryType: InquiryType;
  preferredContact: PreferredContact;
  message: string;
}

export interface SubmitInquiryResponse {
  inquiryId: string;
  savedToDatabase: boolean;
  emailDelivered: boolean;
  emailStatus: EmailDeliveryStatus;
  emailError?: string;
  recipient: string;
  duplicate?: boolean;
}

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function mapInquiryDoc(id: string, data: Record<string, unknown>): Inquiry {
  return {
    id,
    fullName: String(data.fullName ?? ''),
    email: String(data.email ?? ''),
    phone: String(data.phone ?? ''),
    propertyId: String(data.propertyId ?? 'general'),
    propertyTitle: String(data.propertyTitle ?? 'General Inquiry'),
    inquiryType: (data.inquiryType as InquiryType) || 'General Inquiry',
    preferredContact: (data.preferredContact as PreferredContact) || 'Email',
    message: String(data.message ?? ''),
    status: (data.status as InquiryStatus) || 'New',
    emailDeliveryStatus: (data.emailDeliveryStatus as EmailDeliveryStatus) || 'failed',
    emailError: typeof data.emailError === 'string' ? data.emailError : undefined,
    userId: String(data.userId ?? ''),
    createdAt: toIsoString(data.createdAt),
  };
}

export async function submitPropertyInquiry(
  input: SubmitInquiryInput
): Promise<SubmitInquiryResponse> {
  const submittedAt = new Date().toISOString();

  // 1. Attempt real backend email delivery to anujmlahoti24@gmail.com
  let emailDelivered = false;
  let emailError: string | undefined;
  let recipient = 'anujmlahoti24@gmail.com';
  let duplicate = false;

  try {
    const response = await fetch('/api/inquiries/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        submittedAt,
      }),
    });

    const body = (await response.json()) as {
      delivered?: boolean;
      error?: string;
      recipient?: string;
      duplicate?: boolean;
    };

    if (body.recipient) recipient = body.recipient;

    if (response.status === 429 && body.duplicate) {
      duplicate = true;
      return {
        inquiryId: '',
        savedToDatabase: false,
        emailDelivered: false,
        emailStatus: 'failed',
        emailError: body.error || 'Duplicate submission prevented.',
        recipient,
        duplicate: true,
      };
    }

    if (response.ok && body.delivered === true) {
      emailDelivered = true;
    } else {
      emailDelivered = false;
      emailError =
        body.error || 'Email service could not deliver the notification at this time.';
    }
  } catch (err) {
    emailDelivered = false;
    emailError =
      err instanceof Error
        ? `Network error contacting email service: ${err.message}`
        : 'Unable to reach email notification service.';
  }

  // 2. ALWAYS persist the inquiry to Firestore even if email delivery failed
  const inquiryId = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const emailDeliveryStatus: EmailDeliveryStatus = emailDelivered ? 'sent' : 'failed';
  const currentUid = auth.currentUser?.uid ?? '';

  const firestorePayload: Record<string, unknown> = {
    id: inquiryId,
    fullName: input.fullName.trim().slice(0, 120),
    email: input.email.trim().toLowerCase().slice(0, 160),
    phone: input.phone.trim().slice(0, 30),
    propertyId: (input.propertyId || 'general').trim().slice(0, 128),
    propertyTitle: (input.propertyTitle || 'General Property Inquiry').trim().slice(0, 200),
    inquiryType: input.inquiryType,
    preferredContact: input.preferredContact,
    message: input.message.trim().slice(0, 2500),
    status: 'New',
    emailDeliveryStatus,
    userId: currentUid,
    createdAt: serverTimestamp(),
  };

  if (emailError) {
    firestorePayload.emailError = emailError.slice(0, 500);
  }

  try {
    await setDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), firestorePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${INQUIRIES_COLLECTION}/${inquiryId}`);
  }

  return {
    inquiryId,
    savedToDatabase: true,
    emailDelivered,
    emailStatus: emailDeliveryStatus,
    emailError,
    recipient,
    duplicate,
  };
}

export async function fetchAllInquiriesAdmin(): Promise<Inquiry[]> {
  try {
    const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapInquiryDoc(d.id, d.data() as Record<string, unknown>));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, INQUIRIES_COLLECTION);
  }
}

export async function fetchMyInquiries(userId: string): Promise<Inquiry[]> {
  try {
    const q = query(
      collection(db, INQUIRIES_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapInquiryDoc(d.id, d.data() as Record<string, unknown>));
  } catch (error) {
    // Fallback without composite index if Firestore index is still warming up
    try {
      const qFallback = query(
        collection(db, INQUIRIES_COLLECTION),
        where('userId', '==', userId)
      );
      const snap = await getDocs(qFallback);
      return snap.docs
        .map((d) => mapInquiryDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.LIST, INQUIRIES_COLLECTION);
    }
  }
}

export async function updateInquiryStatusAdmin(
  inquiryId: string,
  status: InquiryStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${INQUIRIES_COLLECTION}/${inquiryId}`);
  }
}

export async function deleteInquiryAdmin(inquiryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, INQUIRIES_COLLECTION, inquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${INQUIRIES_COLLECTION}/${inquiryId}`);
  }
}
