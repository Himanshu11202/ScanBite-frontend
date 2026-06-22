'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/site/sidebar';
import { AdminTopnav } from '@/components/site/admin-topnav';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/services/apiClient';
import { AdminContext, UserProfile, CafeDetails } from '@/components/site/admin-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cafe, setCafe] = useState<CafeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize data attribute so Sidebar can read it
    document.documentElement.dataset.sbCollapsed = collapsed.toString();
  }, [collapsed]);

  const loadData = async () => {
    const token = localStorage.getItem('sb_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch user profile and cafes in parallel
      const [valRes, cafesRes] = await Promise.all([
        api.get<UserProfile>('/auth/validate'),
        api.get<CafeDetails[]>('/cafes')
      ]);
      
      setUser(valRes.data);
      const userCafe = cafesRes.data.find((c) => c.ownerId === valRes.data.id);

      if (userCafe) {
        setCafe(userCafe);
        if (pathname === '/admin/cafe/onboarding') {
          router.push('/admin/dashboard');
          return;
        }
      } else {
        setCafe(null);
        if (pathname !== '/admin/cafe/onboarding') {
          router.push('/admin/cafe/onboarding');
          return;
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Session validation error:', err);
      localStorage.removeItem('sb_token');
      router.push('/login');
    }
  };

  useEffect(() => {
    loadData();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent mx-auto"></div>
          <p className="text-sm font-medium text-white/70">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user, cafe, loading, refreshData: loadData }}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <AdminTopnav 
          collapsed={collapsed} 
          onToggle={() => setCollapsed((s) => !s)} 
        />

        <div className="mx-auto flex min-h-screen max-w-[1700px] overflow-hidden bg-black/20">
          <Sidebar collapsed={collapsed} />
          <main className="flex-1 px-4 py-6 lg:px-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
