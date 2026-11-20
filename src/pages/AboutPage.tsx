import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { HERO_IMAGE } from '../database/seedProperties';
import { PropertyImage } from '../components/PropertyImage';

const FAQS = [
  {
    q: 'Are all properties listed on Aurelia Estates RERA and title verified?',
    a: 'Yes. Before any residential villa, apartment, independent bungalow, plot, or commercial floor plate is published, our legal associates verify the chain of title, RERA registration where applicable, municipal occupation certificates, and non-encumbrance status.',
  },
  {
    q: 'How quickly will an advisor respond after I submit a property inquiry?',
    a: 'Every inquiry is logged in our management system and automatically routed to our advisory desk. A regional specialist contacts you within 2 business hours via your chosen method (Phone, Email, or WhatsApp).',
  },
  {
    q: 'Can I schedule private in-person or live video site visits?',
    a: 'Yes. Select "Site Visit" in the inquiry form on any property details page and mention your preferred date and time. We arrange both private on-site tours and guided high-definition walkthroughs for outstation and NRI clients.',
  },
  {
    q: 'Do you assist NRI buyers and corporate tenants with documentation?',
    a: 'Our transaction team coordinates FEMA-compliant acquisition workflows, Power of Attorney vetting, NRE/NRO account settlement timelines, and institutional lease agreements across all major Indian metro markets.',
  },
  {
    q: 'How can I compare multiple properties or save favourites?',
    a: 'Click the heart icon on any listing to save it to your Client Dashboard, or click the compare icon to evaluate up to three properties side by side on our dedicated Compare page.',
  },
];

export function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-white">
      {/* Editorial Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium text-gold-600 mb-3">About Aurelia Estates</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-zinc-900 tracking-tight headline-balance">
              Institutional Rigour for India&apos;s Finest Private Real Estate
            </h1>
            <p className="mt-5 text-base text-zinc-600 leading-relaxed">
              Founded in 2016 in Mumbai, Aurelia Estates was created to replace fragmented brokerage
              experiences with transparent, research-led property management and acquisition
              advisory. Today, our regional desks operate across Mumbai, Gurugram, New Delhi,
              Bengaluru, Pune, Hyderabad, Goa, Jaipur, Chandigarh, and Chennai.
            </p>
            <p className="mt-4 text-sm text-zinc-600 leading-relaxed">
              Whether advising families on generational bungalows, sourcing turnkey headquarters for
              growth-stage enterprises, or managing investment yields for NRI estates, our mandate
              remains constant: verified titles, honest market pricing, and complete discretion.
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="h-full min-h-[340px] rounded-xl overflow-hidden border border-zinc-200">
              <PropertyImage
                src={HERO_IMAGE}
                alt="Aurelia Estates curated architectural residence"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Verified Quantitative Strip */}
        <div className="mt-14 pt-10 border-t border-zinc-200 grid grid-cols-2 lg:grid-cols-4 gap-8 tabular-nums">
          <div>
            <p className="font-display text-4xl font-semibold text-zinc-900">₹4,200+ Cr</p>
            <p className="text-xs text-zinc-500 mt-1">Transaction Value Advised (2016–2026)</p>
          </div>
          <div>
            <p className="font-display text-4xl font-semibold text-zinc-900">10 Cities</p>
            <p className="text-xs text-zinc-500 mt-1">Active Metropolitan &amp; Coastal Desks</p>
          </div>
          <div>
            <p className="font-display text-4xl font-semibold text-zinc-900">100%</p>
            <p className="text-xs text-zinc-500 mt-1">Legal &amp; RERA Audited Inventory</p>
          </div>
          <div>
            <p className="font-display text-4xl font-semibold text-zinc-900">94%</p>
            <p className="text-xs text-zinc-500 mt-1">Repeat Client &amp; Referral Rate</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-zinc-50 border-t border-zinc-200 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-medium text-gold-600 mb-2">Common Questions</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white rounded-xl overflow-hidden">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-medium text-zinc-900">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-zinc-600 leading-relaxed">{item.a}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Still Have Questions? Contact Our Advisory Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
