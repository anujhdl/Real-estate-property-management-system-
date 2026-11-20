import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';

export function Navbar() {
  const { firebaseUser, isAdmin } = useAuth();
  const { compareIds } = useProperties();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b ${
      isActive
        ? 'text-zinc-900 border-gold-600'
        : 'text-zinc-600 border-transparent hover:text-zinc-900 hover:border-zinc-300'
    }`;

  const primaryAction = firebaseUser
    ? isAdmin
      ? { to: '/admin', label: 'Admin Console' }
      : { to: '/dashboard', label: 'My Account' }
    : { to: '/auth', label: 'Sign In' };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-zinc-200/80 transition-colors ${
        isHome ? 'bg-white/95 backdrop-blur-md' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="font-display text-2xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
        >
          Aurelia Estates
        </Link>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7"
        >
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/properties" className={navLinkClass}>
            Properties
          </NavLink>
          <NavLink to="/compare" className={navLinkClass}>
            {compareIds.length > 0 ? `Compare (${compareIds.length})` : 'Compare'}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="hidden md:flex items-center shrink-0">
          <Link
            to={primaryAction.to}
            className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            {primaryAction.label}
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-6 py-5 space-y-3">
          {[
            { to: '/', label: 'Home' },
            { to: '/properties', label: 'Properties' },
            {
              to: '/compare',
              label: compareIds.length > 0 ? `Compare (${compareIds.length})` : 'Compare',
            },
            { to: '/about', label: 'About' },
            { to: '/contact', label: 'Contact' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-base font-medium text-zinc-800 hover:text-gold-600"
            >
              {item.label}
            </Link>
          ))}
          {firebaseUser && isAdmin && (
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-base font-medium text-zinc-800 hover:text-gold-600"
            >
              Saved Properties
            </Link>
          )}
          <div className="pt-3 border-t border-zinc-100">
            <Link
              to={primaryAction.to}
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-5 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800"
            >
              {primaryAction.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
