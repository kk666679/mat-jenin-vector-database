'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Documents', href: '/documents', icon: FileText },
  { title: 'Chat', href: '/chat', icon: MessageSquare },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface HeaderProps {
  className?: string;
  ctaLabels?: {
    primary?: string;
    secondary?: string;
  };
}

export function Header({ className, ctaLabels }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Default CTA labels
  const primaryLabel = ctaLabels?.primary ?? 'Try Demo';
  const secondaryLabel = ctaLabels?.secondary ?? 'Upload Documents';

  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <img
              src="/LOGO_MJ.svg"
              alt="MatJenin Logo"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">MatJenin</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center justify-center p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80 flex items-center gap-2',
                  isActive ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* CTA Buttons - Desktop only */}
        <div className="hidden md:flex items-center gap-2 mr-4">
          <Link href="/chat">
            <Button size="sm">
              {primaryLabel}
            </Button>
          </Link>
          <Link href="/documents">
            <Button size="sm" variant="outline">
              {secondaryLabel}
            </Button>
          </Link>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(searchOpen && 'hidden md:flex')}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium">U</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container flex flex-col space-y-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                    isActive 
                      ? 'bg-primary/10 text-foreground' 
                      : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
            {/* Mobile CTA Buttons */}
            <Link
              href="/chat"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-foreground/60 hover:text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare className="h-5 w-5" />
              {primaryLabel}
            </Link>
            <Link
              href="/documents"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-foreground/60 hover:text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="h-5 w-5" />
              {secondaryLabel}
            </Link>
          </nav>
        </div>
      )}

      {/* Search Bar (Expandable) */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 border-b bg-background p-4">
          <div className="container max-w-md">
            <input
              type="search"
              placeholder="Search..."
              className="w-full h-10 rounded-md border bg-background px-4 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

