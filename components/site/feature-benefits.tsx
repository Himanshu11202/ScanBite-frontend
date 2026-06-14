'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BenefitCard {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  delay: number;
}

const benefitCards: BenefitCard[] = [
  {
    id: 1,
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightning Fast',
    description: 'Optimized performance for peak restaurant hours',
    benefits: ['Sub-50ms latency', 'Handles 10K+ concurrent users', 'Auto-scaling infrastructure', 'CDN powered delivery'],
    delay: 0,
  },
  {
    id: 2,
    icon: <Shield className="h-6 w-6" />,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance standards',
    benefits: ['End-to-end encryption', 'GDPR & CCPA compliant', 'PCI DSS certified', 'Regular security audits'],
    delay: 0.1,
  },
  {
    id: 3,
    icon: <Users className="h-6 w-6" />,
    title: 'Team Collaboration',
    description: 'Seamless staff coordination and training',
    benefits: ['Real-time staff dashboard', 'Role-based permissions', 'Training modules', 'Team analytics'],
    delay: 0.2,
  },
];

function BenefitCard({ card }: { card: BenefitCard }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: card.delay, duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border border-white/10 bg-gradient-to-br from-white/8 to-white/2 p-6 transition-all duration-300 hover:border-white/30 hover:from-white/12">
        {/* Gradient top border */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: card.delay + 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            animate={{ scale: isExpanded ? 1.1 : 1, rotate: isExpanded ? 10 : 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-white"
          >
            {card.icon}
          </motion.div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-white">{card.title}</h3>

          {/* Description */}
          <p className="mb-4 text-sm text-white/70">{card.description}</p>

          {/* Benefits with checkmarks */}
          <motion.ul
            className="space-y-2"
            animate={{ opacity: isExpanded ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {card.benefits.map((benefit, idx) => (
              <motion.li
                key={idx}
                className="flex items-center gap-2 text-xs text-white/60"
                animate={{ x: isExpanded ? 4 : 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                {benefit}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </Card>
    </motion.div>
  );
}

export function FeatureBenefitsSection() {
  return (
    <section className="relative bg-gradient-to-b from-black via-gray-950 to-black px-4 py-20 md:py-32">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/2 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Built for <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Performance & Scale</span>
          </h2>
          <p className="mx-auto max-w-xl text-white/70">
            Trust enterprise-grade infrastructure designed to handle millions of orders
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {benefitCards.map((card) => (
            <BenefitCard key={card.id} card={card} />
          ))}
        </div>

        {/* Integration Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 md:p-12"
        >
          <h3 className="mb-8 text-2xl font-bold text-white">Seamless Integration</h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Payment Gateway', value: 'Stripe, Razorpay' },
              { name: 'POS Systems', value: 'Square, Toast' },
              { name: 'Analytics', value: 'Mixpanel, Segment' },
              { name: 'CRM', value: 'Salesforce, HubSpot' },
            ].map((integration, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-colors">
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                    {integration.name}
                  </p>
                  <p className="text-sm text-white">{integration.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
