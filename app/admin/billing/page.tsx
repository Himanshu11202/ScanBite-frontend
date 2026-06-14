'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '@/services/apiClient';
import { toast } from 'sonner';

type StoredOrder = {
  id: number;
  items: Array<{ id: number; name: string; qty: number; price: number }>;
  subtotal: number;
  total: number;
  paid: boolean;
  status: string;
  customerName?: string;
  customerPhone?: string;
  table?: { id: number; tableNumber: string };
  createdAt: string;
};

export default function AdminBillingPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user cafe
  useEffect(() => {
    async function loadCafe() {
      try {
        const valRes = await api.get('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get('/cafes');
        const userCafe = cafesRes.data.find((c: any) => c.ownerId === userId);
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

  // Fetch orders/invoices
  useEffect(() => {
    if (!cafeId) return;

    async function fetchOrders() {
      try {
        const res = await api.get(`/orders?cafeId=${cafeId}`);
        setOrders(res.data.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)));
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      }
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [cafeId]);

  async function togglePaid(o: StoredOrder) {
    try {
      const res = await api.put(`/orders/${o.id}/paid?paid=${!o.paid}`);
      setOrders((s) => s.map((x) => x.id === o.id ? res.data : x));
      toast.success(o.paid ? 'Marked as Unpaid' : 'Marked as Paid');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payment status');
    }
  }

  // Dynamic statistics calculation
  const totalRevenue = orders.filter(o => o.paid).reduce((sum, o) => sum + o.total, 0);
  const paidCount = orders.filter(o => o.paid).length;
  const pendingCount = orders.filter(o => !o.paid).length;
  const overdueCount = orders.filter(o => {
    if (o.paid) return false;
    const diffMs = Date.now() - new Date(o.createdAt).getTime();
    return diffMs > 30 * 60 * 1000; // Unpaid and older than 30 mins
  }).length;

  const summaryStats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+100%', icon: TrendingUp, color: 'text-orange-400' },
    { label: 'Paid Invoices', value: paidCount.toString(), change: '+100%', icon: CheckCircle, color: 'text-green-400' },
    { label: 'Pending', value: pendingCount.toString(), change: '0%', icon: Clock, color: 'text-amber-400' },
    { label: 'Overdue', value: overdueCount.toString(), change: '0%', icon: XCircle, color: 'text-rose-400' },
  ];

  if (loading) {
    return <div className="text-white/60 text-center py-8">Loading billing panel...</div>;
  }

  if (!cafeId) {
    return <div className="text-white/60 text-center py-8">Please register and set up your cafe first.</div>;
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-black/80 p-8">
        <p className="section-label">Billing</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Invoices &amp; Payments</h1>
        <p className="mt-2 text-sm text-white/60">
          Manage all restaurant invoices, track payment status, and review billing history.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-white/55">{s.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
                  <p className={`mt-1 text-xs ${s.color}`}>{s.change} live</p>
                </div>
                <div className={`rounded-xl bg-white/5 p-3 ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Orders list */}
      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Invoices</h2>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <CreditCard className="h-4 w-4" />
            {orders.length} total
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm text-white/50">No invoices yet. Orders placed via the digital menu will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    #{o.id} &bull; {o.customerName || 'Guest'}
                  </p>
                  <p className="mt-0.5 text-xs text-white/50">
                    Table {o.table?.tableNumber || '—'} &bull; {new Date(o.createdAt).toLocaleDateString()} &bull;{' '}
                    {o.items?.length ?? 0} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">₹{Number(o.total || 0).toFixed(2)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      o.paid
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {o.paid ? 'Paid' : 'Pending'}
                  </span>
                  <Link href={`/admin/billing/${o.id}`}>
                    <Button size="sm" variant="ghost">View</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => togglePaid(o)}>
                    {o.paid ? 'Mark Unpaid' : 'Mark Paid'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
