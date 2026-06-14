'use client';

import { useEffect } from 'react';
import { LandingNavbar } from '@/components/site/landing-navbar';
import { LandingHero } from '@/components/site/landing-hero';
import { FloatingFoodCards } from '@/components/site/floating-cards';
import { LandingFeatures } from '@/components/site/landing-features';
import { LandingFooter } from '@/components/site/landing-footer';

export default function HomePage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cafeId = params.get('cafeId');
      const tableNumber = params.get('tableNumber');
      if (cafeId && tableNumber) {
        sessionStorage.setItem('sb_customer_cafeId', cafeId);
        sessionStorage.setItem('sb_customer_tableNumber', tableNumber);
        window.location.href = `/customer/menu?cafeId=${cafeId}&tableNumber=${tableNumber}`;
      }
    }
  }, []);

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
