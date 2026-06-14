'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export function GlassmorphismNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <motion.nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-500',
        isScrolled
          ? 'bg-black/30 backdrop-blur-2xl border-b border-white/20 shadow-2xl'
          : 'bg-black/20 backdrop-blur-xl border-b border-white/10'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Link
              href="/"
              className="text-2xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent transition-all hover:from-amber-200 hover:to-orange-400"
            >
              ScanBite
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className="group relative px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                    {/* Animated underline */}
                    <span className="absolute bottom-0 left-4 h-0.5 w-0 bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300 group-hover:w-[calc(100%-2rem)]" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                Login
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
                Get Started
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-3">
              {/* Mobile Nav Links */}
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium border border-white/10 hover:border-white/30"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10"
              >
                <Button
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Login
                </Button>
                <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold">
                  Get Started
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated gradient background on scroll */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
        animate={{
          opacity: isScrolled ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.nav>
  );
}
