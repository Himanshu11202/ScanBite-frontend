'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Sparkles, TrendingUp, Receipt, Globe, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  delay: number;
}

const features: Feature[] = [
  {
    id: 1,
    icon: <QrCode className="h-8 w-8" />,
    title: 'QR Code Ordering',
    description: 'Instant table-to-app ordering without waiting for staff',
    details: ['Instant menu access', 'No registration needed', 'Multiple payment options', 'Bill splitting'],
    color: 'from-blue-400 to-blue-600',
    bgColor: 'from-blue-500/10 to-blue-600/5',
    borderColor: 'border-blue-500/30',
    delay: 0,
  },
  {
    id: 2,
    icon: <Sparkles className="h-8 w-8" />,
    title: 'AI Menu Scanner',
    description: 'Smart AI analyzes dishes for nutrition and preferences',
    details: ['Nutritional info', 'Allergen detection', 'Ingredient breakdown', 'Personalized recommendations'],
    color: 'from-purple-400 to-purple-600',
    bgColor: 'from-purple-500/10 to-purple-600/5',
    borderColor: 'border-purple-500/30',
    delay: 0.1,
  },
  {
    id: 3,
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Live Order Tracking',
    description: 'Real-time order status with push notifications',
    details: ['Order tracking', 'Push notifications', 'Kitchen sync', 'Wait time estimates'],
    color: 'from-green-400 to-green-600',
    bgColor: 'from-green-500/10 to-green-600/5',
    borderColor: 'border-green-500/30',
    delay: 0.2,
  },
  {
    id: 4,
    icon: <Receipt className="h-8 w-8" />,
    title: 'Smart Billing',
    description: 'Automated invoicing with detailed expense tracking',
    details: ['Instant bills', 'Tax calculation', 'Expense reports', 'Payment history'],
    color: 'from-amber-400 to-orange-600',
    bgColor: 'from-amber-500/10 to-orange-600/5',
    borderColor: 'border-amber-500/30',
    delay: 0.3,
  },
  {
    id: 5,
    icon: <Globe className="h-8 w-8" />,
    title: 'Multi-Restaurant',
    description: 'Manage multiple locations from one unified dashboard',
    details: ['Centralized control', 'Branch analytics', 'Inventory sync', 'Staff management'],
    color: 'from-red-400 to-pink-600',
    bgColor: 'from-red-500/10 to-pink-600/5',
    borderColor: 'border-red-500/30',
    delay: 0.4,
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: feature.delay, duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card
        className={`relative h-full overflow-hidden border ${feature.borderColor} bg-gradient-to-br ${feature.bgColor} p-6 transition-all duration-300 hover:border-white/50`}
      >
        {/* Background glow on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0`}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated top accent line */}
        <motion.div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: feature.delay + 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            animate={{ y: isHovered ? -5 : 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-4 inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor} text-white`}
          >
            <span className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
              {feature.icon}
            </span>
          </motion.div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>

          {/* Description */}
          <p className="mb-4 text-sm text-white/70 leading-relaxed">
            {feature.description}
          </p>

          {/* Details list */}
          <motion.ul
            className="mb-6 space-y-2"
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            {feature.details.map((detail, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2 text-xs text-white/60"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-gradient-to-r ${feature.color}`} />
                <span>{detail}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA Button */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="sm"
              className={`w-full border-white/20 bg-white/5 text-white hover:bg-white/10 group`}
            >
              Learn More
              <motion.span
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-2"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

export function PremiumFeatureSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-black via-gray-950 to-black px-4 py-20 md:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mb-20 text-center"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
              POWERFUL FEATURES
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
          >
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Transform Your Restaurant
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/60"
          >
            Comprehensive tools designed to streamline operations, enhance customer experience, and drive growth
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>

        {/* Comparative View Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-8 md:p-12"
        >
          <h3 className="mb-8 text-2xl font-bold text-white">Why Choose ScanBite?</h3>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                number: '99.9%',
                label: 'Uptime',
                description: 'Enterprise-grade reliability',
              },
              {
                number: '50ms',
                label: 'Avg Response',
                description: 'Lightning-fast performance',
              },
              {
                number: '24/7',
                label: 'Support',
                description: 'Dedicated support team',
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="font-semibold text-white">{stat.label}</div>
                <div className="text-sm text-white/60">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mt-20 text-center"
        >
          <p className="mb-6 text-lg text-white/80">
            Ready to modernize your restaurant operations?
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:shadow-xl hover:shadow-orange-500/30"
              >
                Start Free Trial
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
                className="border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                Schedule Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
