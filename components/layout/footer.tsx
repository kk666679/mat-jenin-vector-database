'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: string;
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
      {
        title: 'Status',
        href: 'https://status.matjenin.space',
        external: true,
      },
      { title: 'Changelog', href: '/link-footer/docs/changelog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      {
        title: 'Privacy Policy',
        href: '/link-footer/docs/privacy-policy',
      },
      {
        title: 'Terms of Service',
        href: '/link-footer/docs/terms-of-service',
      },
      {
        title: 'Cookie Policy',
        href: '/link-footer/docs/cookie-policy',
      },
      {
        title: 'GDPR',
        href: '/link-footer/docs/gdpr',
      },
    ],
  },
];

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    href: 'https://github.com/MatMotoFix-Pro',
    icon: '/github.svg',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/',
    icon: '/twitter.svg',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/',
    icon: '/linkedin.svg',
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
        {/* Main Footer */}
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="mb-4 flex items-center gap-3"
            >
              <Image
                src="/LOGO_MJ.svg"
                alt="MatJenin Logo"
                width={40}
                height={40}
                priority
              />

              <span className="text-xl font-bold">
                MatJenin
              </span>
            </Link>

            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Turn Enterprise Data into Intelligence. From
              scattered repositories to a unified AI-powered
              knowledge layer, MatJenin helps enterprises search
              smarter, automate faster, and scale intelligence
              securely.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="transition-opacity hover:opacity-70"
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={20}
                    height={20}
                    className="dark:invert"
                  />
                </Link>
              ))}

              <Link
                href="mailto:support@matjenin.space"
                aria-label="Email"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Footer Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-semibold">
                {column.title}
              </h3>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      target={
                        link.external ? '_blank' : undefined
                      }
                      rel={
                        link.external
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
        <div className="border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} MatJenin. All rights reserved.
            </p>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Smart Search, Enterprise Scale</span>
              <span>•</span>
              <span>Powered by Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;