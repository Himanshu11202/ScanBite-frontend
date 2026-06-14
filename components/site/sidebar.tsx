'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavigation } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Coffee, ListChecks, QrCode, ShoppingBag, Wallet, Settings } from 'lucide-react';

const icons = {
  Dashboard: LayoutDashboard,
  Cafe: Coffee,
  Menu: ListChecks,
  'QR Codes': QrCode,
  Orders: ShoppingBag,
  Billing: Wallet,
  Settings: Settings
};

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'min-h-screen shrink-0 border-r border-white/10 bg-black/80 py-6 lg:flex lg:flex-col transition-all duration-300',
        collapsed ? 'w-20 px-2' : 'w-[280px] px-5'
      )}
    >
      <div className={cn('mb-6 text-xs uppercase tracking-[0.22em] text-white/50', collapsed && 'hidden')}>Admin</div>
      <nav className="space-y-2">
        {adminNavigation.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = icons[item.label as keyof typeof icons];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-3xl px-3 py-3 text-sm transition duration-200',
                active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className={cn(collapsed ? 'hidden' : '')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn('mt-auto px-3', collapsed && 'text-center')}>
        <div className={cn('text-xs text-white/50', collapsed && 'hidden')}>v1.0</div>
      </div>
    </aside>
  );
}
