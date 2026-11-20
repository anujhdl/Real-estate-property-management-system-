import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PROPERTY_CATEGORIES } from '../models/types';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              to="/"
              className="font-display text-2xl font-semibold text-white tracking-tight inline-block"
            >
              Aurelia Estates
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Curated residential estates, penthouses, plotted enclaves, and Grade-A commercial
              assets across India&apos;s prime metropolitan and coastal markets.
            </p>
            <p className="text-xs text-zinc-500">
              RERA Registered Advisory · Est. 2016
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="font-sans text-sm font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties" className="text-zinc-400 hover:text-gold-400 transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?listingType=Buy"
                  className="text-zinc-400 hover:text-gold-400 transition-colors"
                >
                  Buy Residential &amp; Commercial
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?listingType=Rent"
                  className="text-zinc-400 hover:text-gold-400 transition-colors"
                >
                  Luxury Rentals &amp; Leasing
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-zinc-400 hover:text-gold-400 transition-colors">
                  Compare Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-400 hover:text-gold-400 transition-colors">
                  About Us &amp; FAQ
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-zinc-400 hover:text-gold-400 transition-colors">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-zinc-400 hover:text-gold-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-sans text-sm font-semibold text-white mb-4">Property Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {PROPERTY_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    to={`/properties?category=${encodeURIComponent(category)}`}
                    className="text-zinc-400 hover:text-gold-400 transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-sm font-semibold text-white mb-4">Advisory Desk</h3>
            <ul className="space-y-3.5 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>
                  14th Floor, One BKC Tower C, Bandra Kurla Complex, Mumbai 400051, Maharashtra
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="tel:+912268409200" className="hover:text-white transition-colors tabular-nums">
                  +91 22 6840 9200
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href="mailto:anujmlahoti24@gmail.com"
                  className="hover:text-white transition-colors break-all"
                >
                  anujmlahoti24@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-5">
              <Link
                to="/contact"
                className="inline-flex items-center text-sm font-medium text-gold-400 hover:text-gold-200 transition-colors"
              >
                Schedule a Private Consultation &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {year} Aurelia Estates Realty Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-zinc-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/contact" className="hover:text-zinc-300 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
