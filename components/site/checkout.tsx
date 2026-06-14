'use client';

import React, { useState } from 'react';
import { useCart } from './cart-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Checkout() {
  const { items, total, setQty, removeItem, clear } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [table, setTable] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = total; // already computed by cart

  function inc(id: string) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    setQty(id, it.qty + 1);
  }

  function dec(id: string) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    setQty(id, Math.max(1, it.qty - 1));
  }

  async function submitOrder() {
    if (!name.trim() || !phone.trim()) return alert('Please enter name and phone');
    if (items.length === 0) return alert('Cart is empty');
    setSubmitting(true);
    try {
      const order = { id: Date.now().toString(), items, subtotal, customer: { name, phone, table, instructions }, createdAt: new Date().toISOString() };
      const raw = localStorage.getItem('scanbite:orders');
      const existing = raw ? JSON.parse(raw) : [];
      localStorage.setItem('scanbite:orders', JSON.stringify([order, ...existing]));
      clear();
      alert('Order placed — saved locally (no backend).');
    } catch (e) {
      console.error(e);
      alert('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="mb-4 text-2xl font-bold text-white">Checkout</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Card className="p-3">
            <h3 className="text-sm font-semibold text-white">Your items</h3>
            <div className="mt-3 space-y-3">
              {items.length === 0 && <div className="text-white/60">Your cart is empty.</div>}
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {it.image ? <img src={it.image} alt={it.name} className="h-12 w-12 rounded-md object-cover"/> : <div className="h-12 w-12 rounded-md bg-white/5"/>}
                    <div>
                      <div className="text-sm text-white">{it.name}</div>
                      <div className="text-xs text-white/60">₹{it.price.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => dec(it.id)}>-</Button>
                    <div className="px-2 text-white">{it.qty}</div>
                    <Button variant="outline" size="sm" onClick={() => inc(it.id)}>+</Button>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(it.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-white/70">Subtotal</div>
              <div className="text-lg font-semibold text-amber-300">₹{subtotal.toFixed(2)}</div>
            </div>
          </Card>
        </div>

        <aside>
          <Card className="p-3">
            <h3 className="text-sm font-semibold text-white">Customer details</h3>

            <div className="mt-3 space-y-3">
              <input className="w-full rounded-md bg-transparent p-2 text-white/90" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
              <input className="w-full rounded-md bg-transparent p-2 text-white/90" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              <input className="w-full rounded-md bg-transparent p-2 text-white/90" placeholder="Table number (optional)" value={table} onChange={(e)=>setTable(e.target.value)} />
              <textarea className="w-full rounded-md bg-transparent p-2 text-white/90" rows={3} placeholder="Special instructions" value={instructions} onChange={(e)=>setInstructions(e.target.value)} />

              <div className="flex items-center gap-2">
                <Button onClick={submitOrder} className="flex-1" disabled={submitting}>{submitting ? 'Placing...' : 'Place order'}</Button>
                <Button variant="outline" onClick={() => { setName(''); setPhone(''); setTable(''); setInstructions(''); }}>Reset</Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
