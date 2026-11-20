import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  propertyTitle?: string;
}

export function WhatsAppButton({ propertyTitle }: WhatsAppButtonProps) {
  const number = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '919820012345';
  const text = propertyTitle
    ? `Hello Aurelia Estates, I would like more details regarding "${propertyTitle}".`
    : 'Hello Aurelia Estates, I would like to speak with a property advisor.';

  const href = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Aurelia Estates on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-zinc-900 text-white border border-gold-500/40 shadow-lg hover:bg-zinc-800 transition-transform duration-200 hover:-translate-y-0.5 text-xs font-medium whitespace-nowrap"
    >
      <MessageCircle className="w-4 h-4 text-gold-400" />
      <span className="hidden sm:inline">WhatsApp Advisor</span>
    </a>
  );
}
