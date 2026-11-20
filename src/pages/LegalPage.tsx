interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export function LegalPage({ type }: LegalPageProps) {
  const isPrivacy = type === 'privacy';

  return (
    <div className="bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-medium text-gold-600 mb-2">Legal Documentation</p>
        <h1 className="font-display text-4xl font-semibold text-zinc-900 mb-3">
          {isPrivacy ? 'Privacy Policy' : 'Terms and Conditions'}
        </h1>
        <p className="text-xs text-zinc-500 mb-10">Last updated: November 2026</p>

        {isPrivacy ? (
          <div className="space-y-6 text-sm text-zinc-700 leading-relaxed">
            <section>
              <h2 className="font-sans text-base font-semibold text-zinc-900 mb-2">
                1. Information We Collect
              </h2>
              <p>
                When you register an account, save favourite properties, or submit a property
                inquiry on Aurelia Estates, we collect your name, email address, phone number,
                preferred contact method, and inquiry message to coordinate property inspections and
                advisory services.
              </p>
            </section>
            <section>
              <h2 className="font-sans text-base font-semibold text-zinc-900 mb-2">
                2. How Your Data Is Used &amp; Protected
              </h2>
              <p>
                Customer contact details are stored with strict owner-and-administrator access
                controls in Firebase Firestore. We never sell or rent your personal contact
                information to third-party marketing lists. Inquiry notifications are transmitted
                exclusively to our authorized advisory desk (anujmlahoti24@gmail.com).
              </p>
            </section>
            <section>
              <h2 className="font-sans text-base font-semibold text-zinc-900 mb-2">
                3. Your Rights &amp; Data Deletion
              </h2>
              <p>
                You may review your profile, manage saved listings, or request deletion of your
                inquiry records at any time by contacting our data privacy officer at
                anujmlahoti24@gmail.com.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-zinc-700 leading-relaxed">
            <section>
              <h2 className="font-sans text-base font-semibold text-zinc-900 mb-2">
                1. Listing Accuracy &amp; Availability
              </h2>
              <p>
                Aurelia Estates conducts thorough verification of property specifications, carpet
                areas, and indicative INR prices. All listings remain subject to prior sale, lease,
                withdrawal, or price revision by the respective owner or developer without notice.
              </p>
            </section>
            <section>
              <h2 className="font-sans text-base font-semibold text-zinc-900 mb-2">
                2. User Accounts &amp; Platform Conduct
              </h2>
              <p>
                Users agree to provide accurate contact information when submitting site-visit or
                purchase inquiries. Automated scraping, duplicate inquiry flooding, or unauthorized
                attempts to access administrative interfaces are strictly prohibited.
              </p>
            </section>
            <section>
              <h2 className="font-sans text-base font-semibold text-zinc-900 mb-2">
                3. Governing Law
              </h2>
              <p>
                These terms are governed by the laws of India, including applicable Real Estate
                (Regulation and Development) Act (RERA) guidelines. Any disputes are subject to the
                exclusive jurisdiction of courts in Mumbai, Maharashtra.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
