'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Phone, CreditCard, Airplay } from 'lucide-react';

const features = [
  { label: 'Live order updates', icon: <Sparkles size={18} /> },
  { label: 'Smart table QR codes', icon: <Phone size={18} /> },
  { label: 'AI menu recommendations', icon: <Airplay size={18} /> },
  { label: 'Fast checkout flow', icon: <CreditCard size={18} /> }
];

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden px-6 py-20 md:px-8 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,122,24,0.18),_transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/15 bg-white/5 px-4 py-2 text-sm text-orange-200">
            Premium food-tech experience for cafes and restaurants
          </div>
          <motion.h1
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.06em] text-white md:text-6xl"
          >
            Build the future of restaurant ordering with ScanBite.
          </motion.h1>
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-2xl text-base leading-8 text-white/70 md:text-lg"
          >
            An AI-powered QR menu and billing platform designed for multi-location cafes, bars, and dining venues.
          </motion.p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button className="w-full sm:w-auto">Start Free Trial</Button>
            <Button variant="outline" className="w-full sm:w-auto">
              View Demo
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3 text-orange-300">{feature.icon}</div>
                <p className="mt-3 text-sm text-white/80">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 shadow-soft"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full min-h-[420px] w-full object-cover"
          >
            <source src="/restaurant-loop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-x-0 bottom-0 rounded-b-[2rem] bg-gradient-to-t from-black/90 to-transparent px-6 py-8 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Live QR ordering flow</p>
            <h2 className="mt-3 text-2xl font-semibold">Scan, browse, order, and pay without leaving the table.</h2>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
