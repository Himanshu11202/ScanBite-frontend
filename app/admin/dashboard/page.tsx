'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@/components/site/admin-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/apiClient';
import { MinimalStompClient } from '@/lib/stomp';
import { toast } from 'sonner';
import { 
  ShoppingBag, CreditCard, Users, Clock, ChefHat, 
  Sparkles, Star, Bell, Volume2, VolumeX, CheckCircle, 
  XCircle, Flame, ArrowRight, Play, Heart 
} from 'lucide-react';
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
  prepTimeMinutes?: number;
  confirmedAt?: string;
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

// Visual Countdown Timer component inside preparing cards
function KitchenOrderTimer({ confirmedAt, prepTimeMinutes }: { confirmedAt?: string; prepTimeMinutes?: number }) {
  const [timeLeft, setTimeLeft] = useState('Calculating...');

  useEffect(() => {
    if (!confirmedAt || !prepTimeMinutes) return;

    const calculateTime = () => {
      const target = new Date(confirmedAt).getTime() + prepTimeMinutes * 60 * 1000;
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft('Overdue!');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [confirmedAt, prepTimeMinutes]);

  return (
    <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 flex items-center gap-1 shrink-0">
      <Clock className="h-3 w-3 animate-pulse" />
      {timeLeft}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { cafe, user } = useAdmin();
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Sound settings
  const [mute, setMute] = useState(false);

  // New Order Overlay alert popup details
  const [newOrderAlert, setNewOrderAlert] = useState<OrderEntity | null>(null);
  const [selectedPrepMinutes, setSelectedPrepMinutes] = useState<number>(15);
  const [customPrepMinutes, setCustomPrepMinutes] = useState<string>('');

  // Focused Order Detail overlay modal
  const [focusedOrder, setFocusedOrder] = useState<OrderEntity | null>(null);
  const [detailPrepMinutes, setDetailPrepMinutes] = useState<number>(15);
  const [detailCustomPrep, setDetailCustomPrep] = useState<string>('');

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = '/' + url.replace(/^\/+/, '');
    const base = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
    return `${base}${cleanUrl}`;
  };

  // Dual tone bell chime using Web Audio API
  const playChime = () => {
    if (mute) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      playTone(587.33, ctx.currentTime, 0.4); // D5
      playTone(698.46, ctx.currentTime + 0.1, 0.5); // F5
    } catch (e) {
      console.error('Audio play failed:', e);
    }
  };

  // Fetch initial REST data
  useEffect(() => {
    if (!cafe) return;
    
    async function loadData() {
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
    }
    loadData();
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

      // Subscribe to orders
      client.subscribe('/topic/orders', (frame) => {
        try {
          const updatedOrder: OrderEntity = JSON.parse(frame.body);
          if (updatedOrder.cafe?.id === cafe.id) {
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === updatedOrder.id);
              if (exists) {
                return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
              }
              // If it's a new order and is PENDING, trigger overlay popup alert & chime
              if (updatedOrder.status === 'PENDING') {
                playChime();
                setNewOrderAlert(updatedOrder);
              }
              return [updatedOrder, ...prev];
            });
            
            // Re-sync focused order in real time
            setFocusedOrder((prev) => prev && prev.id === updatedOrder.id ? updatedOrder : prev);
          }
        } catch (e) {
          console.error('Failed parsing live order update:', e);
        }
      });

      // Subscribe to service requests
      client.subscribe('/topic/services', (frame) => {
        try {
          const req: ServiceRequestEntity = JSON.parse(frame.body);
          if (req.cafe?.id === cafe.id) {
            if (req.status === 'PENDING') {
              setServiceRequests((prev) => {
                if (prev.some((s) => s.id === req.id)) return prev;
                return [req, ...prev];
              });
              playChime();
              toast.info(`Table ${req.table?.tableNumber || 'N/A'} requested ${req.requestType.replace('_', ' ')}!`);
            } else if (req.status === 'COMPLETED') {
              setServiceRequests((prev) => prev.filter((s) => s.id !== req.id));
              toast.success(`Waiter request resolved at Table ${req.table?.tableNumber || 'N/A'}`);
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
  }, [cafe, mute]);

  // Operational pipeline updates
  async function handleConfirmOrder(orderId: number, minutes: number) {
    try {
      const res = await api.put<OrderEntity>(`/orders/${orderId}/confirm?prepTime=${minutes}`);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      toast.success(`Order #${orderId} confirmed! Started preparing (${minutes} min).`);
      setNewOrderAlert(null);
      setFocusedOrder(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to confirm order');
    }
  }

  async function handleUpdateStatus(orderId: number, status: string) {
    try {
      const res = await api.put<OrderEntity>(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      toast.success(`Order #${orderId} marked as ${status.toLowerCase()}`);
      setFocusedOrder(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  }

  async function handleTogglePaid(order: OrderEntity) {
    try {
      const res = await api.put<OrderEntity>(`/orders/${order.id}/paid?paid=${!order.paid}`);
      setOrders(prev => prev.map(o => o.id === order.id ? res.data : o));
      toast.success(order.paid ? 'Marked order as unpaid' : 'Marked order as paid');
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle billing status');
    }
  }

  async function handleResolveRequest(requestId: number) {
    try {
      await api.put(`/service-requests/${requestId}/complete`);
      setServiceRequests((prev) => prev.filter((s) => s.id !== requestId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve assistance request');
    }
  }

  // Real-Time Analytics Calculations (No Fake Data)
  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
    
    const todaysOrdersCount = todayOrders.length;
    
    const todaysRevenueVal = todayOrders
      .filter(o => o.paid && o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);

    const totalRevenueVal = orders
      .filter(o => o.paid && o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);

    const activeTablesCount = new Set(
      orders
        .filter(o => o.status === 'PENDING' || o.status === 'PREPARING')
        .map(o => o.table?.tableNumber)
        .filter(Boolean)
    ).size;

    const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

    return {
      todayCount: todaysOrdersCount,
      todayRevenue: todaysRevenueVal,
      totalRevenue: totalRevenueVal,
      activeTables: activeTablesCount,
      pendingCount: pendingOrdersCount
    };
  }, [orders]);

  // Filter items in the menu marked as popular from actual database
  const popularMenuItems = useMemo(() => {
    return menuItems.filter(item => item.popular === true);
  }, [menuItems]);

  // Order sorting by categories
  const pendingOrdersList = useMemo(() => orders.filter(o => o.status === 'PENDING'), [orders]);
  const preparingOrdersList = useMemo(() => orders.filter(o => o.status === 'PREPARING'), [orders]);
  const readyOrdersList = useMemo(() => orders.filter(o => o.status === 'READY'), [orders]);
  const completedOrdersList = useMemo(() => orders.filter(o => o.status === 'COMPLETED').slice(0, 5), [orders]);

  if (!cafe) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ChefHat className="h-10 w-10 animate-spin text-amber-400" />
      </div>
    );
  }

  const coverUrls = cafe.coverPhotos
    ? cafe.coverPhotos.split(',').map(url => url.trim()).filter(url => url !== '')
    : [];

  const mainCover = coverUrls.length > 0 ? getImageUrl(coverUrls[0]) : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200';
  const cafeLogo = cafe.imageUrl && !cafe.imageUrl.includes('placeholder.png') ? getImageUrl(cafe.imageUrl) : null;
  const ownerPhoto = user?.ownerPhoto ? getImageUrl(user.ownerPhoto) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';

  return (
    <div className="space-y-8 pb-16 min-h-screen text-white">
      
      {/* 1. Header & Dynamic Brand Cover Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] p-8 md:p-12 shadow-2xl bg-zinc-950/70 backdrop-blur-xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('${mainCover}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10 w-full">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Cafe Logo */}
            <div className="relative h-20 w-20 rounded-full overflow-hidden border border-white/10 shrink-0 bg-zinc-900 flex items-center justify-center">
              {cafeLogo ? (
                <img src={cafeLogo} alt={cafe.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-amber-400 text-2xl font-black">{cafe.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>

            {/* Title / Description */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight">{cafe.name}</h1>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-lg font-light leading-relaxed">{cafe.description || 'Premium dining menu controller panel.'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-[10px] text-zinc-500 pt-1 font-semibold uppercase tracking-wider">
                <span>📍 {cafe.address}</span>
                <span>📞 {cafe.phone}</span>
                <span>⏰ {cafe.openingTime} - {cafe.closingTime}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Owner Card Profile */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-zinc-900 border border-amber-400/20 shrink-0">
              <img src={ownerPhoto} alt={user?.fullName} className="h-full w-full object-cover" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-300">Proprietor</span>
              <span className="block text-xs font-black text-white leading-none mt-0.5">{user?.fullName || 'Cafe Admin'}</span>
              <span className="block text-[9px] text-zinc-400 font-medium mt-1">{user?.designation || 'Owner'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Premium Analytics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Orders", value: stats.todayCount, sub: "Dynamic feed", icon: ShoppingBag, color: "text-amber-400" },
          { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, sub: `Total Settled: ₹${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: "text-emerald-400" },
          { label: "Active Tables", value: `${stats.activeTables} / ${cafe.totalTables}`, sub: `Occupancy: ${cafe.totalTables > 0 ? Math.round((stats.activeTables / cafe.totalTables) * 100) : 0}%`, icon: Users, color: "text-blue-400" },
          { label: "Pending Orders", value: stats.pendingCount, sub: "Action required", icon: Clock, color: "text-rose-400" }
        ].map((item, idx) => (
          <Card key={idx} className="border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl p-6 rounded-3xl flex justify-between items-start gap-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{item.label}</span>
              <h3 className="text-2xl font-black text-white leading-none tracking-tight">{item.value}</h3>
              <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">{item.sub}</p>
            </div>
            <div className={`p-3 rounded-2xl bg-white/5 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Sound Control & Live Requests Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Waiter request feed */}
        <Card className="flex-1 border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Bell className="h-4 w-4 animate-bounce" /> Waiter Assistance Required
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Real-time tables requests queue.</p>
            </div>

            <button 
              onClick={() => setMute(!mute)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-zinc-400 hover:text-white"
            >
              {mute ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[140px] overflow-y-auto pr-1">
            {serviceRequests.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-zinc-500 font-medium">
                No active waiter assistance requested.
              </div>
            ) : (
              serviceRequests.map((req) => (
                <div key={req.id} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-white uppercase">Table {req.table?.tableNumber}</span>
                    <span className="block text-[9px] text-zinc-400 font-semibold">{req.requestType.replace('_', ' ')}</span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleResolveRequest(req.id)}
                    className="h-7 text-[9px] font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-lg px-2.5 shrink-0"
                  >
                    Done
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Real Popular Items widget */}
        <Card className="w-full md:w-[320px] border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl p-6 rounded-3xl space-y-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Popular Dishes
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Menu items toggled as Popular.</p>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {popularMenuItems.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500 font-medium">
                No items marked as popular in menu builder.
              </div>
            ) : (
              popularMenuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {item.imageUrl ? (
                      <img src={getImageUrl(item.imageUrl)} alt={item.name} className="h-8 w-8 rounded-lg object-cover bg-neutral-900 border border-white/5" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-[8px] text-zinc-600 border border-white/5">Food</div>
                    )}
                    <div>
                      <span className="block font-bold text-white line-clamp-1 leading-tight">{item.name}</span>
                      <span className="block text-[8px] text-zinc-400 mt-0.5">{item.category?.name || 'Dish'}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-amber-300 shrink-0">₹{item.price.toFixed(0)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 4. Kanban Pipeline Board (Recent & Live Orders) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" /> Kitchen Order Management Board
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Live order pipeline synced in real-time. Click order cards to configure preparation parameters.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 items-start">
          
          {/* COLUMN 1: PENDING / NEW */}
          <div className="space-y-3 bg-zinc-950/20 border border-white/[0.04] p-4 rounded-3xl min-h-[400px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Incoming ({pendingOrdersList.length})</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            
            <div className="space-y-3">
              {pendingOrdersList.map(o => (
                <Card 
                  key={o.id} 
                  onClick={() => setFocusedOrder(o)}
                  className="p-4 border-amber-400/20 bg-amber-400/[0.02] hover:border-amber-400/40 hover:bg-amber-400/[0.04] transition cursor-pointer rounded-2xl space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-extrabold text-white">Table {o.table?.tableNumber || '—'}</span>
                    <span className="text-[9px] text-amber-400 font-mono tracking-tighter">ORD-{o.id}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2 leading-snug font-medium">
                    {o.items?.map(it => `${it.name} x${it.qty}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-2">
                    <span>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-extrabold text-white">₹{o.total.toFixed(0)}</span>
                  </div>
                </Card>
              ))}
              {pendingOrdersList.length === 0 && (
                <div className="text-center py-12 text-[10px] text-zinc-600 font-medium">No incoming orders</div>
              )}
            </div>
          </div>

          {/* COLUMN 2: PREPARING / KITCHEN */}
          <div className="space-y-3 bg-zinc-950/20 border border-white/[0.04] p-4 rounded-3xl min-h-[400px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Cooking ({preparingOrdersList.length})</span>
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              {preparingOrdersList.map(o => (
                <Card 
                  key={o.id} 
                  onClick={() => setFocusedOrder(o)}
                  className="p-4 border-orange-500/20 bg-orange-500/[0.02] hover:border-orange-500/40 hover:bg-orange-500/[0.04] transition cursor-pointer rounded-2xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-extrabold text-white">Table {o.table?.tableNumber || '—'}</span>
                    <KitchenOrderTimer confirmedAt={o.confirmedAt} prepTimeMinutes={o.prepTimeMinutes} />
                  </div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2 leading-snug font-medium">
                    {o.items?.map(it => `${it.name} x${it.qty}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-2">
                    <span>Prep: {o.prepTimeMinutes}m</span>
                    <span className="font-extrabold text-white">₹{o.total.toFixed(0)}</span>
                  </div>
                </Card>
              ))}
              {preparingOrdersList.length === 0 && (
                <div className="text-center py-12 text-[10px] text-zinc-600 font-medium">Kitchen queue empty</div>
              )}
            </div>
          </div>

          {/* COLUMN 3: READY / SERVING */}
          <div className="space-y-3 bg-zinc-950/20 border border-white/[0.04] p-4 rounded-3xl min-h-[400px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ready ({readyOrdersList.length})</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-3">
              {readyOrdersList.map(o => (
                <Card 
                  key={o.id} 
                  onClick={() => setFocusedOrder(o)}
                  className="p-4 border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition cursor-pointer rounded-2xl space-y-3 animate-pulse"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-extrabold text-white">Table {o.table?.tableNumber || '—'}</span>
                    <span className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Ready</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2 leading-snug font-medium">
                    {o.items?.map(it => `${it.name} x${it.qty}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-2">
                    <span>Waiter Alert</span>
                    <span className="font-extrabold text-white">₹{o.total.toFixed(0)}</span>
                  </div>
                </Card>
              ))}
              {readyOrdersList.length === 0 && (
                <div className="text-center py-12 text-[10px] text-zinc-600 font-medium">No dishes awaiting serve</div>
              )}
            </div>
          </div>

          {/* COLUMN 4: COMPLETED */}
          <div className="space-y-3 bg-zinc-950/20 border border-white/[0.04] p-4 rounded-3xl min-h-[400px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recently Closed</span>
              <span className="h-2 w-2 rounded-full bg-zinc-600" />
            </div>

            <div className="space-y-3 opacity-60">
              {completedOrdersList.map(o => (
                <Card 
                  key={o.id} 
                  onClick={() => setFocusedOrder(o)}
                  className="p-4 border-white/5 bg-white/5 hover:bg-white/10 transition cursor-pointer rounded-2xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-extrabold text-white">Table {o.table?.tableNumber || '—'}</span>
                    <span className="text-[8px] uppercase font-bold text-zinc-400">Closed</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 line-clamp-1 leading-snug font-medium">
                    {o.items?.map(it => `${it.name} x${it.qty}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-600 border-t border-white/5 pt-2">
                    <span className={o.paid ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{o.paid ? 'Paid' : 'Unpaid'}</span>
                    <span className="font-extrabold text-white">₹{o.total.toFixed(0)}</span>
                  </div>
                </Card>
              ))}
              {completedOrdersList.length === 0 && (
                <div className="text-center py-12 text-[10px] text-zinc-600 font-medium">No recently closed orders</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          NEW ORDER WS LIVE POPUP ALERT (Part 6 & Part 7 Overlay)
          ======================================================== */}
      <AnimatePresence>
        {newOrderAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md border border-amber-400/20 bg-zinc-950 p-6 rounded-3xl shadow-2xl relative"
            >
              {/* Top Banner Alert Indicator */}
              <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-xs tracking-widest bg-amber-400/10 px-3.5 py-1.5 rounded-full w-fit mb-4">
                <Bell className="h-4 w-4 animate-bounce" /> New Order Received!
              </div>

              <div className="space-y-4">
                {/* Details */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white leading-none">Table #{newOrderAlert.table?.tableNumber || '—'}</h3>
                    <p className="text-xs text-zinc-400 mt-1">Customer: <strong className="text-white font-bold">{newOrderAlert.customerName || 'Guest'}</strong> ({newOrderAlert.customerPhone || 'N/A'})</p>
                  </div>
                  <span className="text-lg font-black text-amber-300">₹{newOrderAlert.total.toFixed(0)}</span>
                </div>

                {/* Items */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2">
                  <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Ordered Items</span>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {newOrderAlert.items?.map(it => (
                      <div key={it.id} className="flex justify-between text-xs font-semibold text-zinc-300">
                        <span>{it.name} <strong className="text-amber-400">x{it.qty}</strong></span>
                        <span>₹{(it.price * it.qty).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Estimation Selection Row (Part 7) */}
                <div className="space-y-2">
                  <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Select Kitchen Prep Time</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 20, 30].map(mins => (
                      <button
                        key={mins}
                        onClick={() => {
                          setSelectedPrepMinutes(mins);
                          setCustomPrepMinutes('');
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition border ${
                          selectedPrepMinutes === mins && !customPrepMinutes
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {mins} Min
                      </button>
                    ))}
                  </div>
                  {/* Custom minutes option */}
                  <div className="relative mt-2">
                    <input
                      type="number"
                      placeholder="Or enter custom minutes..."
                      value={customPrepMinutes}
                      onChange={(e) => {
                        setCustomPrepMinutes(e.target.value);
                        setSelectedPrepMinutes(0);
                      }}
                      className="w-full text-xs bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Confirm Action Button */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      const minutes = customPrepMinutes ? parseInt(customPrepMinutes) || 15 : selectedPrepMinutes;
                      handleConfirmOrder(newOrderAlert.id, minutes);
                    }}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs h-11 rounded-xl"
                  >
                    Confirm Order & Start Cooking
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setNewOrderAlert(null)}
                    className="text-zinc-500 hover:text-white"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          DETAILED ORDER FOCUS MODAL OVERLAY (Pipeline Details)
          ======================================================== */}
      <AnimatePresence>
        {focusedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg border border-white/10 bg-zinc-950 p-6 rounded-3xl shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setFocusedOrder(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                ✕
              </button>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-white leading-none">Table #{focusedOrder.table?.tableNumber || '—'}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      focusedOrder.status === 'PENDING' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                      focusedOrder.status === 'PREPARING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      focusedOrder.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-zinc-800 text-zinc-400 border-white/5'
                    }`}>
                      {focusedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Customer: <strong className="text-white font-bold">{focusedOrder.customerName || 'Guest'}</strong> 
                    {focusedOrder.customerPhone ? ` • ${focusedOrder.customerPhone}` : ''}
                    • {new Date(focusedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Items Summary list */}
                <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
                  <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Ordered items breakdown</span>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {focusedOrder.items?.map(it => (
                      <div key={it.id} className="flex justify-between items-center text-xs font-semibold text-zinc-300">
                        <span>{it.name} <strong className="text-amber-400">x{it.qty}</strong></span>
                        <span className="font-mono">₹{(it.price * it.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between text-sm font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-amber-300 font-mono text-base">₹{focusedOrder.total.toFixed(2)}</span>
                  </div>
                  
                  {/* Payment Details toggles */}
                  <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-semibold uppercase">Settlement status</span>
                    <button 
                      onClick={() => handleTogglePaid(focusedOrder)}
                      className={`px-2 py-0.5 rounded font-black uppercase ${
                        focusedOrder.paid 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {focusedOrder.paid ? 'Paid' : 'Unpaid (Mark Paid)'}
                    </button>
                  </div>
                </div>

                {/* Preparation confirmation controls if incoming (Part 7) */}
                {focusedOrder.status === 'PENDING' && (
                  <div className="space-y-3 bg-amber-400/[0.02] border border-amber-400/20 rounded-2xl p-4">
                    <span className="block text-[10px] uppercase font-bold text-amber-400 tracking-wider">Kitchen prep confirmation</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 15, 20, 30].map(mins => (
                        <button
                          key={mins}
                          onClick={() => {
                            setDetailPrepMinutes(mins);
                            setDetailCustomPrep('');
                          }}
                          className={`py-1.5 rounded-lg text-xs font-black transition border ${
                            detailPrepMinutes === mins && !detailCustomPrep
                              ? 'bg-amber-400 text-black border-amber-400'
                              : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder="Or enter custom minutes..."
                      value={detailCustomPrep}
                      onChange={(e) => {
                        setDetailCustomPrep(e.target.value);
                        setDetailPrepMinutes(0);
                      }}
                      className="w-full text-xs bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                    <Button
                      onClick={() => {
                        const minutes = detailCustomPrep ? parseInt(detailCustomPrep) || 15 : detailPrepMinutes;
                        handleConfirmOrder(focusedOrder.id, minutes);
                      }}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-black font-black text-xs h-10 rounded-xl mt-2"
                    >
                      Confirm Order & Start Cooking
                    </Button>
                  </div>
                )}

                {/* Status Transitions buttons for other pipeline steps */}
                {focusedOrder.status !== 'PENDING' && (
                  <div className="flex flex-col gap-2">
                    <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Update Pipeline Step</span>
                    <div className="flex flex-wrap gap-2">
                      {focusedOrder.status === 'PREPARING' && (
                        <Button 
                          onClick={() => handleUpdateStatus(focusedOrder.id, 'READY')}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black text-xs h-10 rounded-xl"
                        >
                          Mark Ready to Serve
                        </Button>
                      )}
                      {(focusedOrder.status === 'PREPARING' || focusedOrder.status === 'READY') && (
                        <Button 
                          onClick={() => handleUpdateStatus(focusedOrder.id, 'COMPLETED')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 rounded-xl"
                        >
                          Mark Completed / Closed
                        </Button>
                      )}
                      {focusedOrder.status !== 'COMPLETED' && focusedOrder.status !== 'CANCELLED' && (
                        <Button 
                          variant="ghost"
                          onClick={() => handleUpdateStatus(focusedOrder.id, 'CANCELLED')}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-550/10 font-bold text-xs h-10 rounded-xl"
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
