# Aurelia Estates — Real Estate Property Management System

A full-stack luxury and commercial Real Estate Property Management System built with **React + TypeScript**, **Tailwind CSS**, **Node.js + Express.js**, **Firebase Firestore & Authentication**, and **Nodemailer**.

## Architecture Overview

```
/
├── server.ts                  # Full-stack Express + Vite server (Port 3000)
├── backend/
│   ├── config/env.ts          # Environment variable & SMTP configuration
│   ├── controllers/           # Inquiry email dispatch & property image upload handlers
│   ├── middleware/            # Rate limiting, Multer upload validation, error handler
│   ├── models/                # Inquiry validation & sanitization schemas
│   ├── routes/                # /api/inquiries & /api/uploads REST routes
│   └── services/emailService.ts # Nodemailer SMTP delivery to anujmlahoti24@gmail.com
├── src/
│   ├── assets/images/         # 24 photorealistic architectural property photographs
│   ├── config/firebase.ts     # Firebase Auth & Firestore client SDK initialization
│   ├── context/               # AuthContext & PropertyContext
│   ├── database/              # 20 seeded properties & structured Firestore error handler
│   ├── models/types.ts        # Shared TypeScript interfaces & INR formatters
│   ├── services/              # Firestore CRUD, Inquiry dispatch, User & Upload services
│   ├── components/            # Navbar, Footer, PropertyCard, InquiryForm, CompareDrawer
│   └── pages/                 # Home, Properties, Details, Compare, Auth, User & Admin Dashboards
├── firebase-blueprint.json    # Firestore data schema blueprint
└── firestore.rules            # Hardened role-based Firestore security rules
```

## Local Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Configure Email Delivery (Nodemailer SMTP)**
   Every submitted property inquiry is stored in Firestore AND automatically emailed to `anujmlahoti24@gmail.com` with subject `"New Property Inquiry - Real Estate Property Management System"`.

   To enable live email delivery with Gmail SMTP:
   1. Enable **2-Step Verification** on your Google Account.
   2. Generate an **App Password** at https://myaccount.google.com/apppasswords.
   3. Set these variables in `.env` (or AI Studio Secrets panel):
      ```env
      SMTP_HOST="smtp.gmail.com"
      SMTP_PORT="465"
      SMTP_SECURE="true"
      SMTP_USER="your-sender-email@gmail.com"
      SMTP_PASS="your-16-char-app-password"
      SMTP_FROM="Aurelia Estates <your-sender-email@gmail.com>"
      INQUIRY_RECIPIENT_EMAIL="anujmlahoti24@gmail.com"
      ```
   > **Honest Delivery Guarantee**: If SMTP credentials are missing or delivery fails, the inquiry is still persisted to Firestore with `emailDeliveryStatus: "failed"`, and the user is transparently notified instead of showing a false email success message.

4. **Optional: Enable Email/Password Sign-In in Firebase Console**
   Google Sign-In works immediately out of the box. To also allow Email & Password registration/login:
   - Open your Firebase Console → **Authentication** → **Sign-in method** → Enable **Email/Password**.

5. **Run the application locally**
   ```bash
   npm run dev
   ```
   The full-stack Express API and React frontend run together on `http://localhost:3000`.

6. **Build for production**
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```
