import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';
import { memo } from 'react';

// Static footer data - moved outside component to prevent recreation
const FOOTER_DATA = {
  quickLinks: [
    { name: 'Browse Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  supportLinks: [
    { name: 'Help Center', href: '/help' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Reset Password', href: '/forgot-password' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  contact: {
    whatsapp: 'https://wa.me/254111938368',
    phone: '0111938368',
    email: 'gedionmutua2024@gmail.com',
    location: 'Embuni Campus',
  },
  year: new Date().getFullYear(),
} as const;

const Footer = memo(function Footer() {
  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" aria-label="Embuni Campus Market Home" className="focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Logo width={40} height={40} />
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted campus marketplace for buying and selling products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <nav aria-label="Footer quick links">
              <ul className="space-y-2 text-sm">
                {FOOTER_DATA.quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors rounded-lg px-2 py-1 -mx-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <nav aria-label="Footer support links">
              <ul className="space-y-2 text-sm">
                {FOOTER_DATA.supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors rounded-lg px-2 py-1 -mx-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <a
                  href={FOOTER_DATA.contact.whatsapp}
                  className="hover:text-primary transition-colors rounded-lg px-2 py-1 -mx-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {FOOTER_DATA.contact.phone} (WhatsApp)
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <a
                  href={`mailto:${FOOTER_DATA.contact.email}`}
                  className="hover:text-primary transition-colors rounded-lg px-2 py-1 -mx-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {FOOTER_DATA.contact.email}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{FOOTER_DATA.contact.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {FOOTER_DATA.year} Embuni Campus Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
