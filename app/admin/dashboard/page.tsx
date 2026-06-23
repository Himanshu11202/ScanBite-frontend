'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@/components/site/admin-context';
import { AdminAnalytics } from '@/components/site/admin-analytics';
import { OrderTable } from '@/components/site/order-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/apiClient';
import { MinimalStompClient } from '@/lib/stomp';
import { toast } from 'sonner';
import { DollarSign, Clock, Bell, Users, CheckCircle, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderEntity {
  id: number;
  customerName?: string;
  customerPhone?: string;
  status: string;
  paid: boolean;
  subtotal: number;
  total: number;
  createdAt: string;
  table?: {
    id: number;
    tableNumber: string;
  };
  items: OrderItem[];
  cafe?: {
    id: number;
  };
}

interface ServiceRequestEntity {
  id: number;
  cafe: { id: number };
  table: { id: number; tableNumber: string };
  requestType: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { cafe, user } = useAdmin();
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [bellShake, setBellShake] = useState(false);

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanUrl}`;
  };

  // Synthesize beautiful bell sound using HTML5 Web Audio API
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      // Dual tone bell chime
      playTone(587.33, ctx.currentTime, 0.45); // D5
      playTone(698.46, ctx.currentTime + 0.12, 0.55); // F5
    } catch (e) {
      console.error('Audio play failed:', e);
    }
  };

  // Initial Rest data fetching
  useEffect(() => {
    if (!cafe) return;
    
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, menuRes, servicesRes] = await Promise.all([
          api.get<OrderEntity[]>(`/orders?cafeId=${cafe.id}`),
          api.get<any[]>(`/menu?cafeId=${cafe.id}`),
          api.get<ServiceRequestEntity[]>(`/service-requests?cafeId=${cafe.id}&status=PENDING`)
        ]);
        setOrders(ordersRes.data);
        setMenuItems(menuRes.data);
        setServiceRequests(servicesRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [cafe]);

  // STOMP WebSocket Live Connection
  useEffect(() => {
    if (!cafe) return;

    const wsUrl = (() => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://scanbite-backend.onrender.com/api';
      const wsProto = apiUrl.startsWith('https') ? 'wss' : 'ws';
      const host = apiUrl.replace('https://', '').replace('http://', '').split('/')[0];
      return `${wsProto}://${host}/ws/websocket`;
    })();

    const client = new MinimalStompClient(wsUrl);

    client.connect(() => {
      console.log('[STOMP] Live Dashboard subscriber connected.');

      // 1. Subscribe to order creations
      client.subscribe('/topic/orders', (frame) => {
        try {
          const newOrder: OrderEntity = JSON.parse(frame.body);
          if (newOrder.cafe?.id === cafe.id) {
            setOrders((prev) => {
              if (prev.some((o) => o.id === newOrder.id)) {
                return prev.map((o) => (o.id === newOrder.id ? newOrder : o));
              }
              return [newOrder, ...prev];
            });
            
            // Trigger UI sound & shake cues
            playChime();
            setBellShake(true);
            setTimeout(() => setBellShake(false), 1000);
            toast.success(`New Order #${newOrder.id} received from Table ${newOrder.table?.tableNumber || 'N/A'}!`);
          }
        } catch (e) {
          console.error('Failed parsing live order update:', e);
        }
      });

      // 2. Subscribe to table service requests
      client.subscribe('/topic/services', (frame) => {
        try {
          const req: ServiceRequestEntity = JSON.parse(frame.body);
          if (req.cafe?.id === cafe.id) {
            if (req.status === 'PENDING') {
              setServiceRequests((prev) => {
                if (prev.some((s) => s.id === req.id)) return prev;
                return [req, ...prev];
              });
              
              // Trigger UI cues
              playChime();
              setBellShake(true);
              setTimeout(() => setBellShake(false), 1000);
              toast.info(`Table ${req.table?.tableNumber || 'N/A'} requested ${req.requestType.replace('_', ' ')}!`);
            } else if (req.status === 'COMPLETED') {
              setServiceRequests((prev) => prev.filter((s) => s.id !== req.id));
              toast.success(`Assistance resolved at Table ${req.table?.tableNumber || 'N/A'}`);
            }
          }
        } catch (e) {
          console.error('Failed parsing live service request update:', e);
        }
      });
    });

    return () => {
      client.disconnect();
    };
  }, [cafe]);

  // Resolve service requests
  async function handleResolveRequest(requestId: number) {
    try {
      await api.put(`/service-requests/${requestId}/complete`);
      setServiceRequests((prev) => prev.filter((s) => s.id !== requestId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve service request');
    }
  }

  // Calculated Real-Time Stats
  const todaysRevenue = useMemo(() => {
    const todayStr = new Date().toDateString();
    return orders
      .filter((o) => new Date(o.createdAt).toDateString() === todayStr)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const activeTablesCount = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PREPARING');
    const tableNumbers = activeOrders.map((o) => o.table?.tableNumber).filter(Boolean);
    return new Set(tableNumbers).size;
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING').length;
  }, [orders]);

  const activeRequestsCount = serviceRequests.length;

  if (!cafe) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  // Cover image parsing
  const coverUrls = cafe.coverPhotos
    ? cafe.coverPhotos.split(',').map(url => url.trim()).filter(url => url !== '')
    : [];

  const mainCover = coverUrls.length > 0 ? getImageUrl(coverUrls[0]) : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200';
  const cafeLogo = cafe.imageUrl ? getImageUrl(cafe.imageUrl) : null;
  const ownerPhoto = user?.ownerPhoto ? getImageUrl(user.ownerPhoto) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Dynamic Personalized Brand Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-8 md:p-12 shadow-2xl bg-zinc-950">
        
        {/* Dynamic Cover Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('${mainCover}')` }}
        />
        
        {/* Luxury dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />

        {/* Content layout */}
        <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
          
          {/* Cafe Brand Logo */}
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-2xl shrink-0 bg-zinc-900">
            {cafeLogo ? (
              <img 
                src={cafeLogo} 
                alt={cafe.name} 
                className="h-full w-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=120';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-amber-400 text-3xl font-black">
                {cafe.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Welcome and Cafe name details */}
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-col md:flex-row items-center gap-3 md:justify-start justify-center">
              <span className="inline-flex rounded-full bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
                Welcome back, {user?.fullName || 'Proprietor'}
              </span>
              
              {/* Small Owner Avatar */}
              <div className="h-6 w-6 rounded-full overflow-hidden border border-amber-400/30 shrink-0 bg-zinc-900">
                <img 
                  src={ownerPhoto} 
                  alt={user?.fullName} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';
                  }}
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              {cafe.name}
            </h1>
            <p className="text-sm text-zinc-300 max-w-xl font-light line-clamp-2 leading-relaxed">
              {cafe.description || 'Welcome to your premium cafe control room. Manage menus, tables, and track live order flow.'}
            </p>
            
            {/* Quick Metadata Bar */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-zinc-400 pt-2 font-medium">
              <span className="flex items-center gap-1">📍 {cafe.address}</span>
              <span className="flex items-center gap-1">📞 {cafe.phone}</span>
              <span className="flex items-center gap-1">⏰ {cafe.openingTime} - {cafe.closingTime}</span>
              <span className="flex items-center gap-1">🪑 {cafe.totalTables} Dining Tables</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <Card className="border-white/[0.08] bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Today's Revenue</span>
            <h3 className="text-xl font-bold text-white mt-0.5">₹{todaysRevenue.toFixed(2)}</h3>
          </div>
        </Card>

        {/* Active Tables */}
        <Card className="border-white/[0.08] bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Active Tables</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{activeTablesCount} / {cafe.totalTables}</h3>
          </div>
        </Card>

        {/* Pending Orders */}
        <Card className="border-white/[0.08] bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Pending Orders</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{pendingOrdersCount} Queue</h3>
          </div>
        </Card>

        {/* Active Service Requests */}
        <Card className="border-white/[0.08] bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4 relative overflow-hidden">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 shrink-0 ${bellShake ? 'animate-bounce' : ''}`}>
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Active Requests</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{activeRequestsCount} Tickets</h3>
          </div>
          {activeRequestsCount > 0 && (
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </Card>
      </div>

      {/* 3. Operational Grid (Live Orders Queue + Active Service Requests) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3): Live Order Queue */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-80 rounded-2xl bg-zinc-900/40 border border-white/[0.05] animate-pulse" />
          ) : (
            <OrderTable orders={orders} />
          )}
        </div>

        {/* Right Column (1/3): Active Service Requests Timeline */}
        <div className="space-y-6">
          <Card className="border-white/[0.08] bg-zinc-900/40 p-6 backdrop-blur-md flex flex-col h-full">
            <div className="mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Live Assistance</span>
              <h4 className="text-base font-bold text-white mt-1">Active Table Requests</h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Service assistant request logs instantly.</p>
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 w-full rounded bg-white/5 animate-pulse" />
                ))
              ) : serviceRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-white/5 bg-zinc-900/10 rounded-2xl">
                  <span className="text-2xl mb-2">🎉</span>
                  <p className="text-xs text-zinc-500 font-medium">All service requests resolved!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {serviceRequests.map((req) => {
                    const elapsedMins = Math.round((Date.now() - new Date(req.createdAt).getTime()) / 60000);
                    return (
                      <motion.div 
                        key={req.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="border border-white/5 bg-white/5 rounded-2xl p-4 flex justify-between items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                              Table {req.table?.tableNumber || 'N/A'}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-medium flex items-center gap-0.5">
                              🕒 {elapsedMins === 0 ? 'Just now' : `${elapsedMins}m ago`}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white mt-1">
                            {req.requestType.replace('_', ' ')}
                          </h5>
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveRequest(req.id)}
                          className="h-8 text-[10px] font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-3 shrink-0"
                        >
                          Resolve
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
