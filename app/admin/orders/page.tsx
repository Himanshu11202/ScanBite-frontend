'use client';

import React from 'react';
import { OrderManager } from '@/components/site/order-manager';

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 rounded-2xl border border-white/10 bg-black/80 p-8">
        <p className="section-label">Live Orders</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Kitchen Order Panel</h1>
        <p className="mt-2 text-sm text-white/60">
          Monitor incoming orders in real-time. Track status from pending to served.
        </p>
      </div>
      <OrderManager />
    </div>
  );
}
