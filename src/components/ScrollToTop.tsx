import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Aurelia Estates | Find Your Perfect Property, Make It Your Home',
  '/properties': 'Property Listings | Aurelia Estates',
  '/compare': 'Compare Properties | Aurelia Estates',
  '/about': 'About Us & FAQ | Aurelia Estates',
  '/contact': 'Contact Advisory Desk | Aurelia Estates',
  '/auth': 'Sign In or Register | Aurelia Estates',
  '/dashboard': 'Client Dashboard | Aurelia Estates',
  '/admin': 'Admin Console | Aurelia Estates',
  '/privacy-policy': 'Privacy Policy | Aurelia Estates',
  '/terms': 'Terms & Conditions | Aurelia Estates',
};

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const title = ROUTE_TITLES[pathname];
    if (title) {
      document.title = title;
    }
  }, [pathname]);

  return null;
}
