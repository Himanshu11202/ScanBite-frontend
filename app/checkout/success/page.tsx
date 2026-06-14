'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/apiClient';

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
}

function SuccessPageContent() {
  const search = useSearchParams();
  const router = useRouter();
  const orderId = search.get('orderId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="text-white/60 text-center py-16">Loading order confirmation...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Thank you — order placed!</h2>
          <p className="mt-2 text-sm text-white/70">We've received your order{order ? ` (#${order.id})` : ''}.</p>

          {order && (
            <div className="mt-4 text-left border border-white/5 bg-white/5 rounded-xl p-4 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">Customer</div>
                <div className="text-sm font-semibold text-white">{order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">Table</div>
                <div className="text-sm font-semibold text-white">Table {order.table?.tableNumber || 'N/A'}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">Items</div>
                <div className="mt-2 space-y-2">
                  {order.items?.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-1">
                      <div className="text-white">{it.name} x {it.qty}</div>
                      <div className="text-white/80">₹{(it.price * it.qty).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-white font-semibold text-lg border-t border-white/10 pt-3">
                <div>Total</div>
                <div className="text-amber-300">₹{order.total.toFixed(2)}</div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={() => router.push('/customer/menu')} className="bg-amber-500 hover:bg-amber-600 text-black">Back to menu</Button>
            <Button variant="outline" onClick={() => router.push('/')}>Home</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-white/60 text-center py-16">Loading order confirmation...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
