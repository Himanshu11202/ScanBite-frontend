'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, QrCode, Sparkles } from 'lucide-react';

export function LandingHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Background with Overlay */}
      <div className="absolute inset-0">
        {/* Gradient background instead of video for demo */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        
        {/* Premium decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,165,0,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,69,19,0.1)_0%,transparent_50%)]" />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl"
        >
          {/* Premium badge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-block"
          >
            <div className="rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <p className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Sparkles className="h-4 w-4 text-amber-400" />
                The Future of Restaurant Ordering
              </p>
            </div>
          </motion.div>

          {/* Main heading with word-by-word animation */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              Scan, Order,
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-red-200 bg-clip-text text-transparent">
              Enjoy Instantly
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mb-8 text-lg text-white/70 sm:text-xl"
          >
            Smart QR code ordering with AI-powered menu scanning. Experience
            <br className="hidden sm:inline" />
            the future of dining technology today.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:shadow-xl hover:shadow-orange-500/30"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Try Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col gap-6 sm:flex-row sm:justify-center"
          >
            {['500+', '50,000+', '99.9%'].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <p className="text-2xl font-bold text-amber-400">{stat}</p>
                <p className="text-sm text-white/60">
                  {idx === 0
                    ? 'Restaurants'
                    : idx === 1
                      ? 'Daily Orders'
                      : 'Uptime'}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute right-10 top-32 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
          className="absolute left-10 bottom-32 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"
        />
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <p className="text-sm">Scroll to explore</p>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
