/**
 * Payload-First Security TDD Suite for Aurelia Estates Firestore Rules.
 * Verifies all 12 adversarial ("Dirty Dozen") payloads against security_spec.md.
 * Run with Firebase Emulator Suite when testing rules locally.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
  mitigatingRule: string;
}

export const dirtyDozenTests: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Self-Assigned Admin Escalation',
    collectionPath: 'users/user-attacker',
    operation: 'create',
    auth: { uid: 'user-attacker', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 'user-attacker',
      name: 'Attacker',
      email: 'attacker@example.com',
      authProviderId: 'google.com',
      role: 'admin',
      favorites: [],
      createdAt: 'REQUEST_TIME',
    },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: "users.create requires incoming().role == 'user' unless isBootstrappedAdmin()",
  },
  {
    id: 2,
    name: 'Shadow Field Injection on User Profile',
    collectionPath: 'users/user-1',
    operation: 'update',
    auth: { uid: 'user-1', email: 'buyer@example.com', email_verified: true },
    payload: { name: 'Buyer', isVerified: true, role: 'admin' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: "isValidUser() enforces hasOnly() and update enforces affectedKeys().hasOnly(['name','phone','favorites'])",
  },
  {
    id: 3,
    name: 'Cross-User PII Read',
    collectionPath: 'users/user-2',
    operation: 'get',
    auth: { uid: 'user-1', email: 'buyer@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: 'users.get restricts read strictly to request.auth.uid == userId || isAdmin()',
  },
  {
    id: 4,
    name: 'Unverified Admin Email Spoof',
    collectionPath: 'properties/prop-spoof',
    operation: 'create',
    auth: { uid: 'spoof-uid', email: 'anujmlahoti24@gmail.com', email_verified: false },
    payload: { id: 'prop-spoof', title: 'Spoofed Listing' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: 'isBootstrappedAdmin() strictly requires request.auth.token.email_verified == true',
  },
  {
    id: 5,
    name: 'Non-Admin Property Creation',
    collectionPath: 'properties/prop-99',
    operation: 'create',
    auth: { uid: 'user-1', email: 'buyer@example.com', email_verified: true },
    payload: { id: 'prop-99', title: 'Unauthorized Listing' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: 'properties.create requires isAdmin()',
  },
  {
    id: 6,
    name: 'Document ID Poisoning',
    collectionPath: 'inquiries/$$invalid..id',
    operation: 'create',
    auth: null,
    payload: { id: '$$invalid..id' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: "isValidId() enforces regex '^[a-zA-Z0-9_\\-]+$' and size <= 128",
  },
  {
    id: 7,
    name: 'Inquiry Status Shortcutting on Create',
    collectionPath: 'inquiries/inq-shortcut',
    operation: 'create',
    auth: null,
    payload: { id: 'inq-shortcut', status: 'Closed' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: "inquiries.create requires incoming().status == 'New'",
  },
  {
    id: 8,
    name: 'Inquiry User Spoofing',
    collectionPath: 'inquiries/inq-spoof',
    operation: 'create',
    auth: { uid: 'user-A', email: 'a@example.com', email_verified: true },
    payload: { id: 'inq-spoof', userId: 'user-B', status: 'New' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: "inquiries.create requires incoming().userId == request.auth.uid || incoming().userId == ''",
  },
  {
    id: 9,
    name: 'Client Timestamp Forgery',
    collectionPath: 'inquiries/inq-backdate',
    operation: 'create',
    auth: null,
    payload: { id: 'inq-backdate', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: 'inquiries.create enforces incoming().createdAt == request.time',
  },
  {
    id: 10,
    name: 'Oversized Payload / Denial of Wallet',
    collectionPath: 'inquiries/inq-huge',
    operation: 'create',
    auth: null,
    payload: { id: 'inq-huge', message: 'A'.repeat(5000) },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: 'isValidInquiry() caps message length at 2500 chars and fullName at 120 chars',
  },
  {
    id: 11,
    name: 'Non-Admin Inquiry Status Tampering',
    collectionPath: 'inquiries/inq-5',
    operation: 'update',
    auth: { uid: 'user-1', email: 'buyer@example.com', email_verified: true },
    payload: { status: 'Closed' },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: 'inquiries.update requires isAdmin()',
  },
  {
    id: 12,
    name: 'Unbounded Array / Value Poisoning',
    collectionPath: 'users/user-1',
    operation: 'update',
    auth: { uid: 'user-1', email: 'buyer@example.com', email_verified: true },
    payload: { favorites: Array.from({ length: 60 }, (_, i) => `prop-${i}`) },
    expected: 'PERMISSION_DENIED',
    mitigatingRule: 'isValidStringList() enforces favorites.size() <= 50 and string type on element 0',
  },
];
