import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { InquiryForm } from '../components/InquiryForm';

const OFFICES = [
  {
    city: 'Mumbai Headquarters',
    address: '14th Floor, One BKC Tower C, Bandra Kurla Complex, Mumbai 400051',
    phone: '+91 22 6840 9200',
  },
  {
    city: 'Delhi NCR Desk',
    address: 'Level 9, Two Horizon Center, Golf Course Road, Sector 43, Gurugram 122002',
    phone: '+91 124 491 8400',
  },
  {
    city: 'Bengaluru Desk',
    address: 'Level 6, Prestige Trade Tower, Palace Road, Bengaluru 560001',
    phone: '+91 80 4620 7100',
  },
];

export function ContactPage() {
  return (
    <div className="bg-zinc-50 min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium text-gold-600 mb-2">Direct Advisory</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-zinc-900 tracking-tight">
            Contact Us
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
            Submit an inquiry for buying, renting, scheduling a private site visit, or listing your
            property with Aurelia Estates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-1">
              Send an Inquiry
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              All fields marked with * are required. Your message is logged and forwarded to our
              lead advisor.
            </p>
            <InquiryForm defaultInquiryType="General Inquiry" />
          </div>

          {/* Office & Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-950 text-white rounded-xl p-6 sm:p-7 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-white">Direct Channels</h2>
              <div className="space-y-3 text-sm text-zinc-300">
                <p className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                  <a href="mailto:anujmlahoti24@gmail.com" className="hover:text-white">
                    anujmlahoti24@gmail.com
                  </a>
                </p>
                <p className="flex items-center gap-3 tabular-nums">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  <a href="tel:+912268409200" className="hover:text-white">
                    +91 22 6840 9200
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Monday – Sunday, 9:30 AM – 7:30 PM IST</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-zinc-900">
                Regional Offices
              </h2>
              <div className="divide-y divide-zinc-100 space-y-5">
                {OFFICES.map((office) => (
                  <div key={office.city} className="pt-4 first:pt-0">
                    <h3 className="font-sans text-sm font-semibold text-zinc-900">
                      {office.city}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1.5 flex items-start gap-2 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 pl-5 tabular-nums">{office.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
