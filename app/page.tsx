'use client';

import React, { useEffect, useState } from 'react';
import { LandingNavbar } from '@/components/site/landing-navbar';
import { LandingHero } from '@/components/site/landing-hero';
import { FloatingFoodCards } from '@/components/site/floating-cards';
import { LandingFeatures } from '@/components/site/landing-features';
import { LandingFooter } from '@/components/site/landing-footer';
import api from '@/services/apiClient';
import { motion } from 'framer-motion';

interface CafeInfo {
  name: string;
  imageUrl?: string;
  coverPhotos?: string;
}

export default function HomePage() {
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [cafeInfo, setCafeInfo] = useState<CafeInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Syncing details...');

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = '/' + url.replace(/^\/+/, '');
    const base = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
    return `${base}${cleanUrl}`;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get('cafeId');
      const tnum = params.get('tableNumber');
      if (cid && tnum) {
        setCafeId(cid);
        setTableNumber(tnum);
        sessionStorage.setItem('sb_customer_cafeId', cid);
        sessionStorage.setItem('sb_customer_tableNumber', tnum);

        // Fetch cafe details for branding
        api.get<CafeInfo>(`/cafes/${cid}`)
          .then((res) => {
            setCafeInfo(res.data);
          })
          .catch((err) => {
            console.error('Failed to load cafe details for landing animation:', err);
          });
      }
    }
  }, []);

  useEffect(() => {
    if (!cafeId || !tableNumber) return;

    // Premium loading progress transition
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Redirect to menu page
          window.location.href = `/customer/menu?cafeId=${cafeId}&tableNumber=${tableNumber}`;
          return 100;
        }
        
        // Progress status updates
        if (prev === 25) setLoadingText('Curating fresh menu...');
        if (prev === 50) setLoadingText('Warming up ovens...');
        if (prev === 75) setLoadingText('Connecting table...');
        
        return prev + 1;
      });
    }, 25); // 2.5 seconds total

    return () => clearInterval(interval);
  }, [cafeId, tableNumber]);

  // QR Welcome Screen
  if (cafeId && tableNumber) {
    const mainCover = cafeInfo?.coverPhotos 
      ? getImageUrl(cafeInfo.coverPhotos.split(',')[0].trim()) 
      : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200';
    
    const logoUrl = cafeInfo?.imageUrl ? getImageUrl(cafeInfo.imageUrl) : null;

    return (
      <main className="relative flex min-h-screen items-center justify-center bg-zinc-950 overflow-hidden px-4">
        {/* Blurred Cover Art Background */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-cover bg-center filter blur-md"
          style={{ backgroundImage: `url('${mainCover}')` }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/90 to-zinc-950" />

        {/* Welcome Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-zinc-950/85 p-8 text-center backdrop-blur-2xl shadow-2xl"
        >
          {/* Pulsing Cafe Logo */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="mx-auto h-24 w-24 rounded-full border border-amber-400/40 p-1 bg-zinc-900 shadow-xl shadow-amber-400/10 mb-6 flex items-center justify-center overflow-hidden"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={cafeInfo?.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              <div className="text-amber-400 text-3xl font-black">
                {(cafeInfo?.name || 'SB').substring(0, 2).toUpperCase()}
              </div>
            )}
          </motion.div>

          <span className="inline-flex rounded-full bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
            Welcome to
          </span>

          <h1 className="mt-3 text-3xl font-black text-white tracking-tight leading-tight">
            {cafeInfo?.name || 'ScanBite Cafe'}
          </h1>
          
          <p className="mt-2 text-sm text-zinc-400 font-light">
            You're dining at <span className="text-white font-bold">Table #{tableNumber}</span>
          </p>

          {/* Loading Progress Bar */}
          <div className="mt-8 space-y-2">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              <span>{loadingText}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden bg-black">
      <LandingNavbar />
      <LandingHero />
      <FloatingFoodCards />
      <LandingFeatures />
      <LandingFooter />
    </main>
  );
}
