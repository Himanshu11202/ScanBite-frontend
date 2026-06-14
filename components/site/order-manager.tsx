'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/apiClient';
import { toast } from 'sonner';

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  subtotal: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  table?: { id: number; tableNumber: string };
  status: OrderStatus;
  paid: boolean;
  createdAt: string;
}

interface ValidateResponse {
  id: number;
}

interface CafeResponse {
  id: number;
  ownerId: number;
}

function playBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 150);
  } catch (e) {
    // fallback: no-op
  }
}

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mute, setMute] = useState(() => { try { return localStorage.getItem('scanbite:orders:mute') === '1'; } catch { return false; } });
  const prevIds = useRef(new Set<number>());

  // Load user, cafe
  useEffect(() => {
    async function loadCafe() {
      try {
        const valRes = await api.get<ValidateResponse>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<CafeResponse[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        if (userCafe) {
          setCafeId(userCafe.id);
        }
      } catch (err) {
        console.error('Failed to validate owner:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCafe();
  }, []);

  // Poll orders
  useEffect(() => {
    if (!cafeId) return;

    async function fetchOrders() {
      try {
        const res = await api.get<Order[]>(`/orders?cafeId=${cafeId}`);
        const list: Order[] = res.data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setOrders(list);
      } catch (err) {
        console.error('Failed to poll orders:', err);
      }
    }

    fetchOrders();
    const poll = setInterval(fetchOrders, 3000);
    return () => clearInterval(poll);
  }, [cafeId]);

  // Notify on new orders
  useEffect(() => {
    const currentIds = new Set(orders.map(o => o.id));
    let hasNew = false;
    for (const id of currentIds) {
      if (!prevIds.current.has(id)) {
        hasNew = true;
      }
    }
    if (hasNew && prevIds.current.size > 0 && !mute) {
      playBeep();
      toast.info('New order received!');
    }
    prevIds.current = currentIds;
  }, [orders, mute]);

  async function updateOrderStatus(id: number, status: OrderStatus) {
    try {
      const res = await api.put(`/orders/${id}/status`, { status });
      setOrders((s) => s.map((o) => o.id === id ? res.data : o));
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  }

  async function togglePaid(o: Order) {
    try {
      const res = await api.put(`/orders/${o.id}/paid?paid=${!o.paid}`);
      setOrders((s) => s.map((x) => x.id === o.id ? res.data : x));
      toast.success(o.paid ? 'Marked order as unpaid' : 'Marked order as paid');
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle payment status');
    }
  }

  const incoming = orders.filter(o => o.status === 'PENDING');
  const inProgress = orders.filter(o => o.status === 'PREPARING');
  const ready = orders.filter(o => o.status === 'READY');
  const completed = orders.filter(o => o.status === 'COMPLETED');

  const [focused, setFocused] = useState<Order | null>(null);

  // Sync focused order state when orders list is refreshed
  const activeFocused = focused ? orders.find(o => o.id === focused.id) || focused : null;

  if (loading) {
    return <div className="text-white/60 text-center py-8">Loading order panel...</div>;
  }

  if (!cafeId) {
    return <div className="text-white/60 text-center py-8">Please register and set up your cafe first.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-amber-300">Kitchen</p>
          <h2 className="text-2xl font-bold text-white">Order Panel</h2>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/70">Sound</label>
          <Button variant="ghost" onClick={() => { const v = !mute; setMute(v); try { localStorage.setItem('scanbite:orders:mute', v ? '1' : '0'); } catch {} }}>{mute ? 'Muted' : 'On'}</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <section>
          <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">Incoming ({incoming.length})</h3>
          <div className="mt-3 space-y-3">
            {incoming.map(o => (
              <Card key={o.id} className="p-3 cursor-pointer hover:bg-white/5 transition border border-white/5" onClick={() => setFocused(o)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{o.customerName || 'Guest'} • Table {o.table?.tableNumber || '—'}</div>
                    <div className="text-xs text-white/60">{new Date(o.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-xs text-white/60">{o.items?.reduce((s, i) => s + i.qty, 0) || 0} items</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">In progress ({inProgress.length})</h3>
          <div className="mt-3 space-y-3">
            {inProgress.map(o => (
              <Card key={o.id} className="p-3 cursor-pointer hover:bg-white/5 transition border border-white/5" onClick={() => setFocused(o)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Table {o.table?.tableNumber || '—'}</div>
                    <div className="text-xs text-white/60">{o.customerName || 'Guest'}</div>
                  </div>
                  <div className="text-xs text-white/60">{o.items?.reduce((s, i) => s + i.qty, 0) || 0} items</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">Ready ({ready.length})</h3>
          <div className="mt-3 space-y-3">
            {ready.map(o => (
              <Card key={o.id} className="p-3 cursor-pointer hover:bg-white/5 transition border border-white/5 animate-pulse" onClick={() => setFocused(o)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Table {o.table?.tableNumber || '—'}</div>
                    <div className="text-xs text-white/60">{o.customerName || 'Guest'}</div>
                  </div>
                  <div className="text-xs text-white/60">{o.items?.reduce((s, i) => s + i.qty, 0) || 0} items</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">Completed ({completed.length})</h3>
          <div className="mt-3 space-y-3">
            {completed.map(o => (
              <Card key={o.id} className="p-3 cursor-pointer hover:bg-white/5 transition border border-white/5 opacity-70" onClick={() => setFocused(o)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Table {o.table?.tableNumber || '—'}</div>
                    <div className="text-xs text-white/60">{o.customerName || 'Guest'}</div>
                  </div>
                  <div className="text-xs text-white/60">{o.items?.reduce((s, i) => s + i.qty, 0) || 0} items</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {activeFocused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 border border-white/10 bg-neutral-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-5xl font-extrabold text-amber-400">Table {activeFocused.table?.tableNumber || '—'}</div>
                <div className="mt-2 text-sm text-white/70">
                  <span className="font-semibold text-white">{activeFocused.customerName || 'Guest'}</span> 
                  {activeFocused.customerPhone ? ` • ${activeFocused.customerPhone}` : ''} 
                  • {new Date(activeFocused.createdAt).toLocaleTimeString()}
                </div>
                <div className="mt-4 border-t border-white/5 pt-3 space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {activeFocused.items?.map(it => (
                    <div key={it.id} className="flex items-center justify-between text-sm">
                      <div className="text-white">{it.name} x {it.qty}</div>
                      <div className="text-white/70">₹{(it.qty * it.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-white/10 pt-2 flex items-center justify-between text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>₹{activeFocused.total.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-white/50">Payment Status:</span>
                  <span className={activeFocused.paid ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {activeFocused.paid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
              </div>

              <aside className="w-40 flex flex-col gap-2 pt-2">
                <Button onClick={() => updateOrderStatus(activeFocused.id, 'PREPARING')} className="bg-amber-500 hover:bg-amber-600 text-black">Start Cooking</Button>
                <Button onClick={() => updateOrderStatus(activeFocused.id, 'READY')} className="bg-orange-500 hover:bg-orange-600 text-black">Mark Ready</Button>
                <Button onClick={() => updateOrderStatus(activeFocused.id, 'COMPLETED')} className="bg-emerald-600 hover:bg-emerald-700 text-white">Complete</Button>
                <Button variant="outline" onClick={() => togglePaid(activeFocused)}>{activeFocused.paid ? 'Mark Unpaid' : 'Mark Paid'}</Button>
                <Button variant="ghost" className="mt-2 text-white/50 hover:text-white" onClick={() => setFocused(null)}>Close</Button>
              </aside>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
