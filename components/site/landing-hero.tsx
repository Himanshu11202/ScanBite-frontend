'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, QrCode, Sparkles, ShieldCheck, Zap, ChefHat } from 'lucide-react';
import Link from 'next/link';

export function LandingHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const badgeVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, delay: 0.1 }
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 pt-20">
      {/* Premium Ambient Background Image with Dark & Golden Overlays */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070')" 
          }}
        />
        {/* Luxury Radial/Linear Gradients for high contrast and elegant lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-zinc-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 w-full max-w-7xl px-6 py-12 lg:px-8 flex flex-col items-center justify-center">
        
        {/* Luxury Glassmorphic Center Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl rounded-3xl border border-white/[0.08] bg-black/40 p-8 md:p-12 lg:p-16 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
        >
          {/* Subtle gold glow inside card */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-orange-600/10 blur-3xl" />

          {/* Premium Tagline Badge */}
          <motion.div
            variants={badgeVariants}
            className="mb-6 inline-block"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-amber-200 uppercase">
                Premium Restaurant Technology
              </span>
            </div>
          </motion.div>

          {/* Luxury Typography Title */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            <span className="bg-gradient-to-r from-zinc-100 via-white to-zinc-300 bg-clip-text text-transparent">
              Elevate Your Dining.
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
              Accelerate Your Revenue.
            </span>
          </motion.h1>

          {/* SaaS Concept Explanation & Benefits */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mb-8 max-w-2xl text-base text-zinc-300 md:text-lg leading-relaxed"
          >
            ScanBite is the all-in-one digital table assistant for luxury dining establishments. Give your guests immediate, contactless access to high-end visual menus, instant ordering, and secure payments right from their tables.
          </motion.p>

          {/* Value Prop Columns */}
          <motion.div
            variants={itemVariants}
            className="mb-10 grid grid-cols-2 gap-4 text-left max-w-2xl mx-auto border-y border-white/5 py-6"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Zero Wait Times</h4>
                  <p className="text-xs text-zinc-400">Scan & order in seconds, accelerating table turnover by 35%.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Smart Visual Menu</h4>
                  <p className="text-xs text-zinc-400">Increase average order value by 22% with AI cross-selling.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <ChefHat className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Staff Relief</h4>
                  <p className="text-xs text-zinc-400">Minimize manual tasks. Let your staff focus on fine hospitality.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Secure Checkout</h4>
                  <p className="text-xs text-zinc-400">Safe, frictionless digital payments direct from the guest's device.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call-to-actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 w-full sm:w-auto px-8 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                >
                  Onboard Your Cafe
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full sm:w-auto px-8 border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md"
                >
                  <QrCode className="mr-2 h-5 w-5 text-amber-400" />
                  Admin Login
                </Button>
              </Link>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      {/* Decorative Golden Ambient Bulbs */}
      <div className="absolute right-0 bottom-0 z-0 h-64 w-64 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute left-0 top-0 z-0 h-64 w-64 bg-orange-600/5 rounded-full blur-3xl" />
    </section>
  );
}
