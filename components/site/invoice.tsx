'use client';

import React from 'react';

type Order = {
  id: string;
  items: Array<{ id: string; name: string; qty: number; price: number }>;
  subtotal: number;
  customer: { name: string; phone: string; table?: string; instructions?: string };
  status?: string;
  paid?: boolean;
  createdAt: string;
};

export function Invoice({ order }: { order: Order }) {
  const gstRate = 18; // percent
  const gstAmount = order.subtotal * gstRate / 100;
  const total = order.subtotal + gstAmount;

  return (
    <div className="invoice printable max-w-2xl mx-auto bg-white text-black p-6 rounded-md shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ScanBite Cafe</h2>
          <div className="text-sm">Professional POS Invoice</div>
        </div>
        <div className="text-right text-sm">
          <div>Invoice: #{order.id}</div>
          <div>Date: {new Date(order.createdAt).toLocaleString()}</div>
        </div>
      </header>

      <section className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">Bill To</div>
          <div className="text-sm">{order.customer.name}</div>
          <div className="text-sm">{order.customer.phone}</div>
          <div className="text-sm">Table: {order.customer.table || '-'}</div>
        </div>
        <div className="text-sm">
          <div>Status: {order.paid ? 'Paid' : 'Unpaid'}</div>
          {order.customer.instructions && <div className="mt-2">Note: {order.customer.instructions}</div>}
        </div>
      </section>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-sm">
            <th className="pb-2">Item</th>
            <th className="pb-2">Qty</th>
            <th className="pb-2">Rate</th>
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="py-2 text-sm">{it.name}</td>
              <td className="py-2 text-sm">{it.qty}</td>
              <td className="py-2 text-sm">₹{it.price.toFixed(2)}</td>
              <td className="py-2 text-sm text-right">₹{(it.price * it.qty).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-y-2 text-right">
        <div className="text-sm">Subtotal: ₹{order.subtotal.toFixed(2)}</div>
        <div className="text-sm">GST ({gstRate}%): ₹{gstAmount.toFixed(2)}</div>
        <div className="text-lg font-semibold">Total: ₹{total.toFixed(2)}</div>
      </div>

      <footer className="mt-6 text-xs text-gray-600">This is a computer-generated invoice.</footer>
    </div>
  );
}
