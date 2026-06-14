'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Sparkles, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function LandingFeatures() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Ordering',
      description:
        'Instant menu access with just a scan. No downloads, no registration needed.',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: Sparkles,
      title: 'AI Menu Scanning',
      description:
        'Smart AI analyzes dishes and provides nutritional info, ingredients, and recommendations.',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: Zap,
      title: 'Instant Checkout',
      description:
        'Fast and secure payments with one tap. Multiple payment options supported.',
      color: 'from-amber-500/20 to-orange-600/20',
      borderColor: 'border-amber-500/30',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description:
        'Live order tracking with push notifications. Know exactly when your food arrives.',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-black via-gray-950 to-black px-4 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-4xl font-bold text-white sm:text-5xl"
          >
            Powerful Features for Modern
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Restaurant Operations
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-white/60"
          >
            Everything you need to streamline your restaurant experience
          </motion.p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className={`relative h-full border ${feature.borderColor} bg-gradient-to-br ${feature.color} p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/40`}>
                  {/* Glow on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

                  <div className="relative z-10">
                    <div className="mb-4 inline-block rounded-lg bg-white/10 p-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/70">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* QR Ordering Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 grid gap-8 lg:grid-cols-2 lg:gap-12 items-center"
        >
          <div>
            <div className="mb-6 inline-block rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2">
              <p className="text-sm font-semibold text-blue-300">QR Ordering</p>
            </div>
            <h3 className="mb-4 text-3xl font-bold text-white">
              Scan and Order in Seconds
            </h3>
            <p className="mb-6 text-lg text-white/70">
              No more waiting for staff to take your order. Simply scan the QR code at your table, browse the menu, and place your order instantly. Our system syncs directly with your restaurant's kitchen.
            </p>
            <ul className="mb-8 space-y-3">
              {[
                'Instant menu access',
                'Real-time availability',
                'Special requests & notes',
                'Split payments',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/80">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/30">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Learn More
            </Button>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative h-96 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-8 flex items-center justify-center"
          >
            <div className="text-center">
              <QrCode className="mx-auto mb-4 h-32 w-32 text-blue-400 opacity-50" />
              <p className="text-white/60">QR Code Scanner Demo</p>
            </div>
          </motion.div>
        </motion.div>

        {/* AI Menu Scanning Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            className="relative h-96 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-8 flex items-center justify-center order-first lg:order-last"
          >
            <div className="text-center">
              <Sparkles className="mx-auto mb-4 h-32 w-32 text-purple-400 opacity-50" />
              <p className="text-white/60">AI Analysis Demo</p>
            </div>
          </motion.div>

          <div className="order-last lg:order-first">
            <div className="mb-6 inline-block rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2">
              <p className="text-sm font-semibold text-purple-300">AI Powered</p>
            </div>
            <h3 className="mb-4 text-3xl font-bold text-white">
              Smart Menu Intelligence
            </h3>
            <p className="mb-6 text-lg text-white/70">
              Our advanced AI scans food images and provides detailed nutritional information, ingredient lists, allergen warnings, and personalized recommendations based on preferences.
            </p>
            <ul className="mb-8 space-y-3">
              {[
                'Nutritional information',
                'Allergen detection',
                'Ingredient breakdown',
                'Personalized recommendations',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/80">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/30">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
