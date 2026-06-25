'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/apiClient';
import { MinimalStompClient } from '@/lib/stomp';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Clock, ChefHat, ArrowLeft, 
  Sparkles, Star, Utensils, Award, Smile 
} from 'lucide-react';

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
  status: string;
  paid: boolean;
  subtotal: number;
  total: number;
  prepTimeMinutes?: number;
  confirmedAt?: string;
  table?: {
    tableNumber: string;
  };
  items?: OrderItem[];
  cafe?: {
    name: string;
    imageUrl?: string;
  };
}

// 5-Star Experience Rating Widget (Part 10)
function ExperienceRating({ cafeName }: { cafeName: string }) {
  const [rating, setRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  return (
    <div className="text-center space-y-5 animate-fade-in p-6 bg-black/40 border border-white/5 rounded-[2rem]">
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Rate your experience</span>
        <h4 className="text-sm font-black text-white">How was your dining at {cafeName}?</h4>
        <p className="text-[11px] text-zinc-400 font-light">Share your feedback to help us serve you better.</p>
      </div>

      {submitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-2 py-4"
        >
          <Sparkles className="h-8 w-8 text-amber-400 mx-auto animate-pulse" />
          <h5 className="text-xs font-black text-white">Feedback Submitted!</h5>
          <p className="text-[10px] text-zinc-500 font-medium">Thank you for sharing your experience with us.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setSubmitted(true);
                  toast.success('Thank you for rating your dining experience!');
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 hover:scale-110 active:scale-95 transition duration-150 text-zinc-600 hover:text-amber-400"
              >
                <Star 
                  className={`h-7 w-7 ${
                    (hoverRating || rating) >= star 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-zinc-600'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Visual Stepper Order Timeline (Part 9)
function OrderTimeline({ status }: { status: string }) {
  const currentStep = useMemo(() => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 0;
      case 'PREPARING': return 1;
      case 'READY': return 2;
      case 'COMPLETED': return 3;
      default: return 0;
    }
  }, [status]);

  const steps = [
    { label: 'Order Received', desc: 'Sent to kitchen' },
    { label: 'Preparing', desc: 'Cooking your dish' },
    { label: 'Ready to Serve', desc: 'Waitstaff serving' }
  ];

  return (
    <div className="space-y-4 bg-black/20 border border-white/5 p-5 rounded-3xl text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {steps.map((step, idx) => {
          const isActive = currentStep >= idx;
          const isCurrent = currentStep === idx;
          return (
            <div key={idx} className="flex-1 flex items-center gap-3 w-full">
              <div className={`h-7 w-7 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                isCurrent 
                  ? 'bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-400/10 font-extrabold'
                  : isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-600 border-white/5'
              }`}>
                {isActive && idx < currentStep ? '✓' : idx + 1}
              </div>
              <div className="text-left leading-tight">
                <span className={`block text-xs font-bold ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                  {step.label}
                </span>
                <span className="block text-[9px] text-zinc-500 font-medium">
                  {step.desc}
                </span>
              </div>
              
              {/* Connecting line on desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:block flex-1 h-0.5 bg-white/5 mx-2 relative">
                  <div className={`absolute top-0 left-0 h-full bg-amber-400 transition-all duration-1000`} style={{ width: currentStep > idx ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Glowing Circular Countdown Timer (Part 8)
function CircularCountdown({ confirmedAt, prepTimeMinutes }: { confirmedAt: string; prepTimeMinutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const totalSeconds = prepTimeMinutes * 60;

  useEffect(() => {
    const calculate = () => {
      const target = new Date(confirmedAt).getTime() + prepTimeMinutes * 60 * 1000;
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [confirmedAt, prepTimeMinutes]);

  if (secondsLeft === null) return null;

  const displayMins = Math.floor(secondsLeft / 60);
  const displaySecs = secondsLeft % 60;
  const displayTime = `${displayMins}:${displaySecs < 10 ? '0' : ''}${displaySecs}`;

  const pct = Math.min(100, Math.max(0, (secondsLeft / totalSeconds) * 100));
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-4 border-y border-white/[0.04]">
      <div className="relative h-36 w-36 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full bg-amber-400/[0.03] blur-md animate-pulse" />
        
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle 
            cx="72" 
            cy="72" 
            r={radius} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.03)" 
            strokeWidth="6" 
          />
          {/* Progress circle */}
          <circle 
            cx="72" 
            cy="72" 
            r={radius} 
            fill="transparent" 
            stroke="#f59e0b" 
            strokeWidth="6" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time Text inside circle */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-mono tracking-tighter text-white">
            {secondsLeft > 0 ? displayTime : '00:00'}
          </span>
          <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-black mt-0.5">
            {secondsLeft > 0 ? 'Remaining' : 'Serving Now'}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-center text-zinc-400 font-light max-w-xs leading-relaxed">
        {secondsLeft > 0 
          ? "Chef is cooking your selections with fresh ingredients. Stay seated!"
          : "Dishes are finalized. Waiter is carrying them to your table!"}
      </p>
    </div>
  );
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

  // Load initial order details
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
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  // STOMP WebSocket Live Status Subscriber (Part 8)
  useEffect(() => {
    if (!orderId) return;

    const wsUrl = (() => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://scanbite-backend.onrender.com/api';
      const wsProto = apiUrl.startsWith('https') ? 'wss' : 'ws';
      const host = apiUrl.replace('https://', '').replace('http://', '').split('/')[0];
      return `${wsProto}://${host}/ws/websocket`;
    })();

    const client = new MinimalStompClient(wsUrl);

    client.connect(() => {
      console.log('[STOMP] Success tracking subscriber connected.');
      
      client.subscribe('/topic/orders', (frame) => {
        try {
          const updated: OrderDetails = JSON.parse(frame.body);
          if (String(updated.id) === String(orderId)) {
            setOrder(updated);
            toast.info(`Order status updated to: ${updated.status.toLowerCase()}`);
          }
        } catch (e) {
          console.error(e);
        }
      });
    });

    return () => {
      client.disconnect();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center space-y-4">
          <ChefHat className="h-10 w-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Generating digital receipt...</p>
        </div>
      </div>
    );
  }

  const logoUrl = order?.cafe?.imageUrl && !order.cafe.imageUrl.includes('placeholder.png')
    ? getImageUrl(order.cafe.imageUrl)
    : null;

  const isCompleted = order?.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-lg">
        
        {/* Main tracking card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl space-y-6"
        >
          {/* Top Radial Glow */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.06),_transparent_60%)] -z-10" />

          {/* Header Brand */}
          {order?.cafe && (
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt={order.cafe.name} className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black shrink-0">
                    {order.cafe.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h3 className="text-sm font-black text-white tracking-tight">{order.cafe.name}</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Order #{orderId}</span>
            </div>
          )}

          {/* Visual Progress Stepper timeline */}
          {!isCompleted && order && (
            <OrderTimeline status={order.status} />
          )}

          {/* Conditional Layouts based on status */}
          <AnimatePresence mode="wait">
            {isCompleted ? (
              /* PART 10: COMPLETION MESSAGE & FEEDBACK */
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center py-4"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tight">Thank You For Visiting!</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    We hope you thoroughly enjoyed your meal at <strong className="text-white font-semibold">{order?.cafe?.name}</strong>.
                  </p>
                </div>

                {/* Star rating widget */}
                <ExperienceRating cafeName={order?.cafe?.name || 'our cafe'} />
              </motion.div>
            ) : (
              /* ACTIVE ORDER WORKFLOW TIMERS */
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 1. Status Heading */}
                <div className="text-center space-y-2">
                  {order?.status === 'PENDING' ? (
                    <>
                      <h2 className="text-2xl font-black tracking-tight text-white">Order Sent to Kitchen 🍳</h2>
                      <p className="text-xs text-zinc-400 font-light max-w-xs mx-auto leading-relaxed">
                        Awaiting validation and cooking estimation from the chef. Refreshing live.
                      </p>
                    </>
                  ) : order?.status === 'PREPARING' ? (
                    <>
                      <h2 className="text-2xl font-black tracking-tight text-white">Cooking In Progress 🔥</h2>
                      <p className="text-xs text-zinc-400 font-light">Chef is actively preparing your dining request.</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-black tracking-tight text-emerald-400 animate-pulse">Dishes Ready To Serve! 🍽️</h2>
                      <p className="text-xs text-zinc-400 font-light">Waitstaff is delivering your dishes to table #{order?.table?.tableNumber}.</p>
                    </>
                  )}
                </div>

                {/* 2. Real-Time Circular Countdown Timer (Part 8) */}
                {order?.status === 'PREPARING' && order.confirmedAt && order.prepTimeMinutes && (
                  <CircularCountdown confirmedAt={order.confirmedAt} prepTimeMinutes={order.prepTimeMinutes} />
                )}

                {/* 3. Static helper for Pending */}
                {order?.status === 'PENDING' && (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl text-xs text-zinc-400 leading-relaxed justify-center">
                    <Clock className="h-5 w-5 text-amber-400 animate-pulse shrink-0" />
                    <span>Estimated time and countdown will activate upon chef confirmation.</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Receipt Breakdown details */}
          {order && (
            <div className="space-y-4 border-t border-white/5 pt-5 text-xs text-left">
              <div className="flex justify-between items-center text-zinc-500 font-bold uppercase tracking-wider">
                <span>Receipt Summary</span>
                <span>Table #{order.table?.tableNumber || 'N/A'}</span>
              </div>

              {/* Items */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-300">
                    <span className="font-semibold">{it.name} <strong className="text-amber-400 font-bold ml-1">x{it.qty}</strong></span>
                    <span className="font-mono">₹{(it.price * it.qty).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Math */}
              <div className="border-t border-white/[0.04] pt-3 flex justify-between items-center text-sm font-black text-white">
                <span>Total Paid</span>
                <span className="text-amber-300 font-mono text-base">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Footers buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={() => router.push('/customer/menu')} 
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs h-11 rounded-xl flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Order More Food
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex-1 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 rounded-xl text-xs"
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
          <ChefHat className="h-10 w-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Generating digital receipt...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
