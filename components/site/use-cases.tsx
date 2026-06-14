'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Utensils, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UseCase {
  id: number;
  icon: React.ReactNode;
  role: string;
  problem: string;
  solution: string;
  benefit: string;
  color: string;
  delay: number;
}

const useCases: UseCase[] = [
  {
    id: 1,
    icon: <ChefHat className="h-8 w-8" />,
    role: 'Restaurant Owners',
    problem: 'Managing multiple locations and staff coordination',
    solution: 'Unified dashboard to control all restaurants and staff in real-time',
    benefit: 'Increase operational efficiency by 40%',
    color: 'from-emerald-400 to-teal-600',
    delay: 0,
  },
  {
    id: 2,
    icon: <Utensils className="h-8 w-8" />,
    role: 'Kitchen Staff',
    problem: 'Paper orders causing delays and confusion',
    solution: 'Digital order tickets synced directly from customer orders',
    benefit: 'Reduce order preparation time by 30%',
    color: 'from-orange-400 to-red-600',
    delay: 0.15,
  },
  {
    id: 3,
    icon: <TrendingUp className="h-8 w-8" />,
    role: 'Managers',
    problem: 'Lack of data insights for decision making',
    solution: 'Real-time analytics and revenue tracking',
    benefit: 'Boost revenue by 25% through insights',
    color: 'from-blue-400 to-indigo-600',
    delay: 0.3,
  },
  {
    id: 4,
    icon: <Clock className="h-8 w-8" />,
    role: 'Customers',
    problem: 'Long waits for menu and order placement',
    solution: 'Instant QR menu access and mobile ordering',
    benefit: 'Order in under 2 minutes',
    color: 'from-pink-400 to-rose-600',
    delay: 0.45,
  },
];

function UseCaseCard({ useCase }: { useCase: UseCase }) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -20 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      transition={{ delay: useCase.delay, duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      className="h-full perspective"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <motion.div
          style={{ backfaceVisibility: 'hidden' }}
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-full"
        >
          <Card className={`relative h-full cursor-pointer overflow-hidden border border-white/10 bg-gradient-to-br ${useCase.color} ${useCase.color === 'from-emerald-400 to-teal-600' ? 'from-emerald-500/10 to-teal-600/5' : useCase.color === 'from-orange-400 to-red-600' ? 'from-orange-500/10 to-red-600/5' : useCase.color === 'from-blue-400 to-indigo-600' ? 'from-blue-500/10 to-indigo-600/5' : 'from-pink-500/10 to-rose-600/5'} p-6 transition-all duration-300 hover:border-white/30 group`}>
            {/* Animated top accent */}
            <motion.div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${useCase.color}`}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: useCase.delay + 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            />

            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                className={`mb-4 inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${useCase.color} text-white shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {useCase.icon}
              </motion.div>

              {/* Role */}
              <h3 className="mb-2 text-lg font-bold text-white">{useCase.role}</h3>

              {/* Problem */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  The Challenge
                </p>
                <p className="text-sm text-white/80">{useCase.problem}</p>
              </div>

              {/* CTA Text */}
              <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                Click to see how we solve it →
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Back */}
        <motion.div
          style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-full"
        >
          <Card className="relative h-full cursor-pointer overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/2 p-6 transition-all duration-300 hover:border-white/30">
            <div className="relative z-10 flex h-full flex-col justify-between">
              {/* Solution section */}
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  Our Solution
                </p>
                <p className="mb-6 text-sm text-white">{useCase.solution}</p>

                {/* Benefit highlight */}
                <div className="rounded-lg border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-4">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    The Impact
                  </p>
                  <p className="text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {useCase.benefit}
                  </p>
                </div>
              </div>

              {/* Back button */}
              <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                Click to go back ←
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function UseCasesSection() {
  return (
    <section className="relative bg-gradient-to-b from-black via-gray-950 to-black px-4 py-20 md:py-32">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute right-1/3 bottom-0 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
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
          <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 mb-4">
            FOR EVERY ROLE
          </span>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Solutions for Every Restaurant Role
          </h2>
          <p className="mx-auto max-w-xl text-white/70">
            From owners to customers, ScanBite streamlines workflows and delights at every touchpoint. Click cards to explore solutions.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.id} useCase={useCase} />
          ))}
        </div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/2 p-8 md:p-12"
        >
          <h3 className="mb-8 text-2xl font-bold text-white">Real Results from Our Customers</h3>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              { metric: '2.5M+', label: 'Orders Processed' },
              { metric: '500+', label: 'Active Restaurants' },
              { metric: '4.8★', label: 'Customer Rating' },
              { metric: '92%', label: 'Retention Rate' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-2 text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {stat.metric}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
