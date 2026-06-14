'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice } from '@/components/site/invoice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/services/apiClient';
import { toast } from 'sonner';

interface BackendItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface BackendOrder {
  id: number;
  items: BackendItem[];
  subtotal: number;
  customerName?: string;
  customerPhone?: string;
  table?: {
    tableNumber: string;
  };
  paid: boolean;
  createdAt: string;
}

interface MappedOrder {
  id: string;
  items: Array<{
    id: string;
    name: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  customer: {
    name: string;
    phone: string;
    table: string;
    instructions: string;
  };
  paid: boolean;
  createdAt: string;
}

export default function BillingOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params as { orderId: string };
  const [order, setOrder] = useState<MappedOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await api.get<BackendOrder>(`/orders/${orderId}`);
        const backendOrder = res.data;
        const mapped: MappedOrder = {
          id: backendOrder.id.toString(),
          items: backendOrder.items.map((it) => ({
            id: it.id.toString(),
            name: it.name,
            qty: it.qty,
            price: it.price
          })),
          subtotal: backendOrder.subtotal,
          customer: {
            name: backendOrder.customerName || 'Guest',
            phone: backendOrder.customerPhone || '',
            table: backendOrder.table?.tableNumber || '',
            instructions: ''
          },
          paid: backendOrder.paid,
          createdAt: backendOrder.createdAt
        };
        setOrder(mapped);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load order invoice details.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  async function togglePaid() {
    if (!order) return;
    try {
      const res = await api.put<BackendOrder>(`/orders/${order.id}/paid?paid=${!order.paid}`);
      const backendOrder = res.data;
      const mapped: MappedOrder = {
        id: backendOrder.id.toString(),
        items: backendOrder.items.map((it) => ({
          id: it.id.toString(),
          name: it.name,
          qty: it.qty,
          price: it.price
        })),
        subtotal: backendOrder.subtotal,
        customer: {
          name: backendOrder.customerName || 'Guest',
          phone: backendOrder.customerPhone || '',
          table: backendOrder.table?.tableNumber || '',
          instructions: ''
        },
        paid: backendOrder.paid,
        createdAt: backendOrder.createdAt
      };
      setOrder(mapped);
      toast.success(backendOrder.paid ? 'Marked as Paid' : 'Marked as Unpaid');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update payment status.');
    }
  }

  function printInvoice() {
    window.print();
  }

  if (loading) return <div className="min-h-screen p-6"><div className="text-white/60">Loading invoice...</div></div>;
  if (!order) return <div className="min-h-screen p-6"><div className="text-white/60">Order not found.</div></div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-amber-300">Invoice</p>
            <h2 className="text-2xl font-bold text-white">Order #{order.id}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.back()} variant="ghost">Back</Button>
            <Button onClick={togglePaid} variant="outline">{order.paid ? 'Mark Unpaid' : 'Mark Paid'}</Button>
            <Button onClick={printInvoice}>Print Bill</Button>
          </div>
        </div>

        <Card className="p-0">
          <div className="p-6 bg-neutral-900/5">
            <Invoice order={order} />
          </div>
        </Card>
      </div>
    </div>
  );
}
