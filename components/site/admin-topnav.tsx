'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAdmin } from '@/components/site/admin-context';

export function AdminTopnav({ 
  collapsed, 
  onToggle 
}: { 
  collapsed: boolean; 
  onToggle: () => void; 
}) {
  const { user, cafe } = useAdmin();

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${backendBase}${url}`;
  };

  const [logoError, setLogoError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Luxury owner profile photo fallback
  const ownerAvatar = user?.ownerPhoto && !avatarError
    ? getImageUrl(user.ownerPhoto) 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';

  // Cafe logo fallback
  const cafeLogo = cafe?.imageUrl && !logoError
    ? getImageUrl(cafe.imageUrl) 
    : null;

  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-zinc-950/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-6 py-3 lg:px-10">
        
        {/* Left section: Collapse Button + Cafe Branding */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              const cur = document.documentElement.dataset.sbCollapsed === 'true';
              document.documentElement.dataset.sbCollapsed = (!cur).toString();
              onToggle();
            }}
            className="h-10 w-10 p-0 hover:bg-white/5"
          >
            <Menu className="h-5 w-5 text-white/80" />
          </Button>
 
          {cafe ? (
            <div className="flex items-center gap-3">
              {cafeLogo ? (
                <img 
                  src={cafeLogo} 
                  alt={cafe.name} 
                  className="h-9 w-9 rounded-full object-cover border border-white/10" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold">
                  {cafe.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <h4 className="text-sm font-semibold text-white tracking-tight">{cafe.name}</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Admin Portal</p>
              </div>
            </div>
          ) : (
            <div className="hidden sm:block">
              <h4 className="text-sm font-semibold text-white tracking-tight">Admin Portal</h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Onboarding Panel</p>
            </div>
          )}
        </div>
 
        {/* Right section: Profile Info & Actions */}
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            className="relative inline-flex items-center rounded-full p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </motion.button>
 
          <div className="flex items-center gap-4 border-l border-white/5 pl-4">
            {user && (
              <div className="hidden sm:flex sm:flex-col sm:text-right">
                <span className="text-sm font-semibold text-white leading-tight">
                  {user.fullName || 'Executive User'}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {user.designation || 'Owner'}
                </span>
              </div>
            )}
            
            {/* Executive Headshot Avatar */}
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-900 shadow-md">
              <img 
                src={ownerAvatar} 
                alt={user?.fullName || 'Owner'} 
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('sb_token');
                window.location.href = '/login';
              }}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
