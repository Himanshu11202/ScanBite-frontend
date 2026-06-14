'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteNavigation } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-white">
          SCANBITE
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-white/70 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden md:inline-flex">
            Login
          </Button>
          <Button className="hidden md:inline-flex">Get Started</Button>
          <button
            type="button"
            aria-label="Toggle mobile menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/10 md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-white/10 bg-black/90 transition-all duration-300 md:hidden',
          open ? 'max-h-72 pb-6' : 'max-h-0'
        )}
      >
        <div className="space-y-4 px-6 pt-4">
          {siteNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
