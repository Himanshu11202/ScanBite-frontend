 'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import api from '@/services/apiClient';

interface ValidateResponse {
  id: number;
}

interface CafeDetails {
  name: string;
  imageUrl?: string;
  ownerId: number;
}

export function AdminTopnav({ 
  collapsed, 
  onToggle, 
  userEmail = 'scanbite@demo.com' 
}: { 
  collapsed: boolean; 
  onToggle: () => void; 
  userEmail?: string;
}) {
  const [cafe, setCafe] = useState<CafeDetails | null>(null);

  useEffect(() => {
    async function loadCafe() {
      try {
        const valRes = await api.get<ValidateResponse>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<CafeDetails[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        if (userCafe) {
          setCafe(userCafe);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCafe();
  }, []);
  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/6 bg-black/20 backdrop-blur backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              // toggle via data attribute on documentElement so Sidebar can read it
              const cur = document.documentElement.dataset.sbCollapsed === 'true';
              document.documentElement.dataset.sbCollapsed = (!cur).toString();
              onToggle();
            }}
            className="h-10 w-10 p-0"
          >
            <Menu className="h-5 w-5 text-white/80" />
          </Button>
 
          {cafe ? (
            <div className="flex items-center gap-3">
              {cafe.imageUrl && (
                <img 
                  src={cafe.imageUrl.startsWith('http') ? cafe.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com'}${cafe.imageUrl}`} 
                  alt={cafe.name} 
                  className="h-8 w-8 rounded-full object-cover border border-white/10" 
                />
              )}
              <div className="hidden sm:block">
                <h4 className="text-sm font-semibold text-white">{cafe.name}</h4>
                <p className="text-xs text-white/50">Admin Portal</p>
              </div>
            </div>
          ) : (
            <div className="hidden sm:block">
              <h4 className="text-lg font-semibold text-white">Admin Portal</h4>
              <p className="text-sm text-white/60">Overview & management</p>
            </div>
          )}
        </div>
 
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <input
              placeholder="Search menus, orders..."
              className="w-72 rounded-full border border-white/10 bg-white/2 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
 
          <motion.button whileHover={{ scale: 1.05 }} className="relative inline-flex items-center rounded-full p-2 text-white/80">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-black">2</span>
          </motion.button>
 
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex sm:flex-col sm:text-right">
              <span className="text-sm font-medium text-white">Owner</span>
              <span className="text-xs text-white/60">{userEmail}</span>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full bg-white/5 flex items-center justify-center">
              <User className="h-5 w-5 text-white/80" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('sb_token');
                window.location.href = '/login';
              }}
              className="border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
