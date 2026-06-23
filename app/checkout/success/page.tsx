'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/apiClient';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ChefHat, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface OrderDetails {
  id: string;
  customerName: string;
  customerPhone?: string;
  table?: {
    tableNumber: string;
  };
  items?: OrderItem[];
  total: number;
  cafe?: {
    name: string;
    imageUrl?: string;
  };
}

function SuccessPageContent() {
  const search = useSearchParams();
  const router = useRouter();
  const orderId = search.get('orderId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = '/' + url.replace(/^\/+/, '');
    const base = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
    return `${base}${cleanUrl}`;
  };

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    
    async function loadOrder() {
      try {
        const res = await api.get<OrderDetails>(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order from database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent mx-auto"></div>
          <p className="text-sm font-medium text-white/70">Generating receipt...</p>
        </div>
      </div>
    );
  }

  const logoUrl = order?.cafe?.imageUrl && !order.cafe.imageUrl.includes('placeholder.png')
    ? getImageUrl(order.cafe.imageUrl)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Main Success Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-zinc-900/60 p-8 md:p-12 shadow-2xl backdrop-blur-md"
        >
          {/* Cafe Header logo inside confirmation card */}
          {order?.cafe && (
            <div className="flex items-center justify-center gap-3 mb-8 border-b border-white/5 pb-6">
              {logoUrl ? (
                <img src={logoUrl} alt={order.cafe.name} className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-bold shrink-0">
                  {order.cafe.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="text-base font-bold text-white tracking-tight leading-tight">{order.cafe.name}</h3>
            </div>
          )}

          <div className="text-center space-y-3 mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-2"
            >
              <CheckCircle2 className="h-9 w-9" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Thank You For Your Order ❤️</h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
              Your order has been sent to the kitchen and is being processed.
            </p>
          </div>

          {/* Prep timer info */}
          <div className="grid gap-4 sm:grid-cols-2 bg-black/40 border border-white/5 rounded-2xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Preparation Time</span>
                <span className="text-xs font-bold text-white">15-20 minutes</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Order Status</span>
                <span className="text-xs font-bold text-white">Cooking...</span>
              </div>
            </div>
          </div>

          {order && (
            <div className="space-y-4 border-t border-white/5 pt-6">
              <div className="flex justify-between items-start flex-wrap gap-2 text-xs text-zinc-400">
                <span>Order No: <span className="text-white font-bold">#{order.id}</span></span>
                <span>Table: <span className="text-white font-bold">Table {order.table?.tableNumber || 'N/A'}</span></span>
              </div>

              {/* Receipt Items list */}
              <div className="space-y-2.5">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                    <div className="text-zinc-300 font-medium">
                      {it.name} <span className="text-[10px] text-zinc-500 font-normal ml-1">x{it.qty}</span>
                    </div>
                    <div className="text-zinc-400 font-mono">₹{(it.price * it.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between font-semibold text-base border-t border-white/10 pt-4 mt-2">
                <span className="text-white">Amount Total</span>
                <span className="text-amber-300 font-mono text-lg">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push('/customer/menu')} 
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-semibold h-11 inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Order More Food
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex-1 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            >
              Exit to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent mx-auto"></div>
          <p className="text-sm font-medium text-white/70">Generating receipt...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
