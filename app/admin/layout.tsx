'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/site/sidebar';
import { AdminTopnav } from '@/components/site/admin-topnav';

import { useRouter, usePathname } from 'next/navigation';
import api from '@/services/apiClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('scanbite@demo.com');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize data attribute so Sidebar can read it
    document.documentElement.dataset.sbCollapsed = collapsed.toString();
  }, [collapsed]);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('sb_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Validate token
        const valRes = await api.get('/auth/validate');
        const user = valRes.data;
        setUserEmail(user.username);

        // Fetch cafes to verify cafe ownership
        const cafesRes = await api.get('/cafes');
        const hasCafe = cafesRes.data.some((c: any) => c.ownerId === user.id);

        if (!hasCafe) {
          if (pathname !== '/admin/cafe/onboarding') {
            router.push('/admin/cafe/onboarding');
            return;
          }
        } else {
          if (pathname === '/admin/cafe/onboarding') {
            router.push('/admin/dashboard');
            return;
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Session validation error:', err);
        localStorage.removeItem('sb_token');
        router.push('/login');
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent mx-auto"></div>
          <p className="text-sm font-medium text-white/70">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <AdminTopnav 
        collapsed={collapsed} 
        onToggle={() => setCollapsed((s) => !s)} 
        userEmail={userEmail}
      />

      <div className="mx-auto flex min-h-screen max-w-[1700px] overflow-hidden bg-black/20">
        <Sidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
