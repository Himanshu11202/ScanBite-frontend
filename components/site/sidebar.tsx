'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavigation } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Coffee, ListChecks, QrCode, ShoppingBag, Wallet, Settings } from 'lucide-react';
import { useAdmin } from '@/components/site/admin-context';

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
  const { cafe } = useAdmin();
  const [imageError, setImageError] = useState(false);

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = '/' + url.replace(/^\/+/, '');
    const base = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
    return `${base}${cleanUrl}`;
  };

  const logoUrl = cafe?.imageUrl && !cafe.imageUrl.includes('placeholder.png') && !imageError 
    ? getImageUrl(cafe.imageUrl) 
    : null;

  return (
    <aside
      className={cn(
        'min-h-screen shrink-0 border-r border-white/[0.06] bg-zinc-950/80 py-6 lg:flex lg:flex-col transition-all duration-300',
        collapsed ? 'w-20 px-2' : 'w-[280px] px-5'
      )}
    >
      {/* Cafe Branding Header inside Sidebar */}
      {cafe && (
        <div className={cn(
          'flex items-center gap-3 pb-6 border-b border-white/5 mb-6 px-2 overflow-hidden',
          collapsed && 'justify-center px-0'
        )}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={cafe.name} 
              className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0" 
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-black font-black text-xs shrink-0 shadow-lg shadow-amber-400/10">
              {cafe.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <div className="truncate">
              <h3 className="text-xs font-bold text-white tracking-tight truncate leading-tight">{cafe.name}</h3>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">Enterprise</p>
            </div>
          )}
        </div>
      )}

      <div className={cn('mb-4 px-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold', collapsed && 'hidden')}>
        Navigation
      </div>
      
      <nav className="space-y-1">
        {adminNavigation.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = icons[item.label as keyof typeof icons] || Settings;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition duration-200',
                active 
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/10' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn(collapsed ? 'hidden' : '')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn('mt-auto px-2', collapsed && 'text-center')}>
        <div className={cn('text-[10px] text-zinc-600 font-medium', collapsed && 'hidden')}>
          ScanBite Suite v1.0
        </div>
      </div>
    </aside>
  );
}
