'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  ExternalLink 
} from 'lucide-react';

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { title: 'Features', href: '/link-footer/docs/features' },
      { title: 'Pricing', href: '/link-footer/docs/pricing' },
      { title: 'Documentation', href: '/link-footer/docs/documentation' },
      { title: 'API Reference', href: '/link-footer/docs/api-reference' },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'About', href: '/link-footer/docs/about' },
      { title: 'Blog', href: '/link-footer/docs/blog' },
      { title: 'Careers', href: '/link-footer/docs/career' },
      { title: 'Contact', href: '/link-footer/docs/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Community', href: '/link-footer/docs/community' },
      { title: 'Support', href: '/link-footer/docs/support' },
      { title: 'Status', href: 'https://status.matjenin.space', external: true },
      { title: 'Changelog', href: '/link-footer/docs/changelog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { title: 'Privacy Policy', href: '/link-footer/docs/privacy-policy' },
      { title: 'Terms of Service', href: '/link-footer/docs/terms-of-service' },
      { title: 'Cookie Policy', href: '/link-footer/docs/cookie-policy' },
      { title: 'GDPR', href: '/link-footer/docs/gdpr' },
    ],
  },
];

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('border-t bg-background', className)}>
      <div className="container px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <img
                src="/LOGO_MJ.svg"
                alt="MatJenin Logo"
                className="w-10 h-10"
              />
              <span className="text-xl font-bold">MatJenin</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Turn Enterprise Data into Intelligence. From scattered repositories to a unified AI-powered knowledge layer, 
            MatJenin helps enterprises search smarter, automate faster, and scale intelligence securely.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/MatMotoFix-Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:support@matjenin.space"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {link.title}
                      {link.external && (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} MatJenin. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Smart Search, Enterprise Scale</span>
              <span>•</span>
              <span>Powered by Next.Js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

