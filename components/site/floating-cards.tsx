'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface FloatingCardProps {
  id: number;
  name: string;
  price: string;
  rating: number;
  image: string;
  delay: number;
}

function FloatingCard({ name, price, rating, delay }: FloatingCardProps) {
  const floatingVariants = {
    animate: {
      y: [0, -30, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      variants={floatingVariants}
      animate="animate"
      className="relative h-64 w-48 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-md"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Image placeholder with gradient */}
        <div className="mb-3 h-32 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center">
          <div className="text-4xl">🍽️</div>
        </div>

        {/* Content */}
        <div>
          <h3 className="truncate text-base font-semibold text-white">{name}</h3>
          <div className="mb-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                }`}
              />
            ))}
            <span className="text-xs text-white/60">({rating}.0)</span>
          </div>
          <p className="text-lg font-bold text-amber-400">{price}</p>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}

export function FloatingFoodCards() {
  const cards = [
    {
      id: 1,
      name: 'Margherita Pizza',
      price: '₹299',
      rating: 5,
      image: '🍕',
      delay: 0,
    },
    {
      id: 2,
      name: 'Biryani Special',
      price: '₹349',
      rating: 5,
      image: '🍛',
      delay: 0.2,
    },
    {
      id: 3,
      name: 'Grilled Salmon',
      price: '₹599',
      rating: 4,
      image: '🐟',
      delay: 0.4,
    },
    {
      id: 4,
      name: 'Chocolate Cake',
      price: '₹199',
      rating: 5,
      image: '🍰',
      delay: 0.6,
    },
  ];

  return (
    <div className="relative flex items-center justify-center gap-4 py-20 px-4">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <FloatingCard key={card.id} {...card} />
        ))}
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent blur-3xl" />
    </div>
  );
}
