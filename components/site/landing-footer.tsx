'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function LandingFooter() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Security', 'Roadmap'],
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Press'],
    },
    {
      title: 'Developers',
      links: ['Documentation', 'API Reference', 'GitHub', 'Community'],
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Cookie Policy', 'Compliance'],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="relative bg-black px-4 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Main footer content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5"
        >
          {/* Brand section */}
          <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                ScanBite
              </h3>
            </div>
            <p className="text-sm text-white/60">
              Revolutionizing restaurant ordering with QR codes and AI-powered menu intelligence.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Links sections */}
          {footerSections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="mb-4 font-semibold text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <Separator className="my-8 bg-white/10" />

        {/* Bottom section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-3"
        >
          {/* Contact info */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-4 font-semibold text-white">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0 text-amber-400" />
                <a href="mailto:support@scanbite.com">support@scanbite.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0 text-amber-400" />
                <a href="tel:+919999999999">+91 999 999 9999</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="h-4 w-4 flex-shrink-0 text-amber-400 mt-0.5" />
                <span>Bangalore, India</span>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter signup */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-4 font-semibold text-white">Newsletter</h4>
            <p className="mb-3 text-sm text-white/60">
              Get updates on new features and partnerships.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>

          {/* Quick stats */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-4 font-semibold text-white">By the Numbers</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-white/60">Active Restaurants</span>
                <span className="font-semibold text-amber-400">500+</span>
              </li>
              <li className="flex justify-between">
                <span className="text-white/60">Daily Orders</span>
                <span className="font-semibold text-amber-400">50K+</span>
              </li>
              <li className="flex justify-between">
                <span className="text-white/60">Happy Diners</span>
                <span className="font-semibold text-amber-400">1M+</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-white/60"
        >
          <p>
            © 2024 ScanBite. All rights reserved. Crafted with ❤️ for the future of dining.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
