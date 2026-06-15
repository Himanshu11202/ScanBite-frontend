'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ClipboardList } from 'lucide-react';

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
}

interface OrderTableProps {
  orders: OrderEntity[];
}

export function OrderTable({ orders = [] }: OrderTableProps) {
  // Sort orders to show newest first, or showing active orders first
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10); // Limit to top 10 recent orders

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <span className="inline-flex items-center rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-0.5 text-xs font-semibold">Pending</span>;
      case 'PREPARING':
        return <span className="inline-flex items-center rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-0.5 text-xs font-semibold">Preparing</span>;
      case 'SERVED':
        return <span className="inline-flex items-center rounded-full bg-emerald-550/10 text-emerald-400 border border-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold">Served</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 text-xs font-semibold">Cancelled</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-zinc-800 text-zinc-400 px-2.5 py-0.5 text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <Card className="overflow-hidden border-white/[0.08] bg-zinc-900/40 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-amber-400" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Live Kitchen Queue</span>
            <h3 className="text-lg font-bold text-white leading-tight">Recent Orders Queue</h3>
          </div>
        </div>
        <span className="text-xs text-zinc-500 font-semibold">Showing latest 10</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead>
            <tr className="border-b border-white/5 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950/20">
              <th className="px-6 py-3.5">Order ID</th>
              <th className="px-6 py-3.5">Table</th>
              <th className="px-6 py-3.5">Ordered Items</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Settlement</th>
              <th className="px-6 py-3.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ClipboardList className="h-8 w-8 text-zinc-600" />
                    <span>No orders recorded in the database yet.</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => {
                const itemNames = order.items && order.items.length > 0
                  ? order.items.map(it => `${it.name} x${it.qty}`).join(', ')
                  : 'No items';

                return (
                  <tr key={order.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-amber-400">
                      ORD-{order.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {order.table?.tableNumber ? `Table ${order.table.tableNumber}` : 'Takeout'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-zinc-300 font-medium">
                      {itemNames}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.paid 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-800 text-zinc-400 border border-white/5'
                      }`}>
                        {order.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white text-sm">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
