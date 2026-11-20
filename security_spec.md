# Security Specification — Aurelia Estates Firestore Rules

## 1. Data Invariants
1. **Default Deny**: All unmatched paths are unconditionally denied (`allow read, write: if false;`).
2. **Public Catalog / Admin-Only Catalog Mutation**: `/properties/{propertyId}` documents are publicly readable (`get`, `list`), while `create`, `update`, and `delete` require a verified administrator (`isAdmin()`).
3. **PII Isolation on Users**: `/users/{userId}` documents contain PII (`email`, `phone`, `name`). Single-document reads (`get`) are strictly restricted to the verified owner (`request.auth.uid == userId`) or a verified administrator. Listing users is restricted exclusively to verified administrators.
4. **Privilege Escalation Prevention**: Users cannot self-assign `role: 'admin'` during registration unless their verified token email matches a bootstrapped admin email, and users can never modify `role`, `email`, `id`, `authProviderId`, or `createdAt` on updates.
5. **Inquiry Integrity & Access Isolation**: Prospective buyers (guests or signed-in users) may create `/inquiries/{inquiryId}` documents only with `status == 'New'`, server timestamp `createdAt == request.time`, bounded string lengths, and valid enums. Reading or listing inquiries is strictly restricted to verified admins or the verified user whose `userId == request.auth.uid`. Updating inquiry status is restricted exclusively to verified admins, and terminal `'Closed'` inquiries can only be modified by admins.
6. **Temporal Integrity**: `createdAt` must equal `request.time` on creation and is immutable on all updates.
7. **ID Poisoning & Resource Exhaustion Guards**: Every document ID path variable on single-document operations (`get`, `create`, `update`, `delete`) is verified with `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars). Every string and array field has explicit `.size()` bounds.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Assigned Admin Escalation**: Regular user creates `/users/{uid}` with `role: "admin"`. Expected: `PERMISSION_DENIED`.
2. **Shadow Field Injection on User Profile**: Owner updates `/users/{uid}` adding ghost field `isVerified: true` or modifying `role: "admin"`. Expected: `PERMISSION_DENIED`.
3. **Cross-User PII Read**: Authenticated user A reads `/users/{userB_uid}`. Expected: `PERMISSION_DENIED`.
4. **Unverified Admin Email Spoof**: User with admin email but `email_verified: false` attempts to create a property. Expected: `PERMISSION_DENIED`.
5. **Non-Admin Property Creation**: Verified standard user attempts to create or delete `/properties/prop-99`. Expected: `PERMISSION_DENIED`.
6. **ID Poisoning**: Attacker attempts to create `/inquiries/$$$invalid..id` or a 200-character document ID. Expected: `PERMISSION_DENIED`.
7. **Inquiry Status Shortcutting on Create**: Visitor creates `/inquiries/inq-1` with `status: "Closed"` instead of `"New"`. Expected: `PERMISSION_DENIED`.
8. **Inquiry User Spoofing**: Signed-in user A creates `/inquiries/inq-2` setting `userId: "user-B"`. Expected: `PERMISSION_DENIED`.
9. **Client Timestamp Forgery**: Caller submits `/inquiries/inq-3` with backdated `createdAt` not equal to `request.time`. Expected: `PERMISSION_DENIED`.
10. **Oversized Payload / Denial of Wallet**: Caller submits `/inquiries/inq-4` with a 10,000-character `message` or 500-character `fullName`. Expected: `PERMISSION_DENIED`.
11. **Non-Admin Inquiry Status Tampering**: Regular user attempts to update `/inquiries/inq-5` `status` from `"New"` to `"Closed"`. Expected: `PERMISSION_DENIED`.
12. **Unbounded Array / Value Poisoning**: Admin or user attempts to store > 50 items or non-string items in `favorites` or > 10 images in `properties.images`. Expected: `PERMISSION_DENIED`.
