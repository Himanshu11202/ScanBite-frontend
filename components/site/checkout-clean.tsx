'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './cart-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CheckoutClean() {
  const router = useRouter();
  const { items, total, setQty, removeItem, clear } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [table, setTable] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = total;

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

  async function placeOrder() {
    if (!name.trim() || !phone.trim()) return alert('Please enter name and phone');
    if (items.length === 0) return alert('Cart is empty');
    setLoading(true);
    try {
      const id = Date.now().toString();
      const order = { id, items, subtotal, customer: { name, phone, table, instructions }, createdAt: new Date().toISOString() };
      const raw = localStorage.getItem('scanbite:orders');
      const existing = raw ? JSON.parse(raw) : [];
      localStorage.setItem('scanbite:orders', JSON.stringify([order, ...existing]));
      clear();
      router.push(`/checkout/success?orderId=${id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="grid gap-6 md:grid-cols-3">
        <main className="md:col-span-2">
          <h2 className="text-2xl font-bold text-white">Review order</h2>
          <p className="text-sm text-white/60">Confirm items and add any special instructions.</p>

          <div className="mt-4 space-y-3">
            {items.length === 0 && <Card className="p-4 text-white/60">Your cart is empty.</Card>}

            {items.map((it) => (
              <Card key={it.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {it.image ? <img src={it.image} alt={it.name} className="h-16 w-16 rounded-md object-cover"/> : <div className="h-16 w-16 rounded-md bg-white/5"/>}
                  <div>
                    <div className="text-sm font-semibold text-white">{it.name}</div>
                    <div className="text-xs text-white/60">₹{it.price.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => dec(it.id)}>-</Button>
                  <div className="px-3 text-white">{it.qty}</div>
                  <Button variant="outline" size="sm" onClick={() => inc(it.id)}>+</Button>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(it.id)}>Remove</Button>
                </div>
              </Card>
            ))}
          </div>
        </main>

        <aside>
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-white">Order summary</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-white/70"><span>Items</span><span>{items.length}</span></div>
              <div className="flex items-center justify-between text-white/90 text-xl font-semibold"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            </div>

            <hr className="my-3 border-white/5" />

            <div className="space-y-2">
              <input className="w-full rounded-md bg-transparent p-2 text-white/90" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
              <input className="w-full rounded-md bg-transparent p-2 text-white/90" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              <input className="w-full rounded-md bg-transparent p-2 text-white/90" placeholder="Table number (optional)" value={table} onChange={(e)=>setTable(e.target.value)} />
              <textarea className="w-full rounded-md bg-transparent p-2 text-white/90" rows={3} placeholder="Special instructions" value={instructions} onChange={(e)=>setInstructions(e.target.value)} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button onClick={placeOrder} className="flex-1 bg-amber-500 text-black" disabled={loading}>{loading ? 'Placing...' : 'Place order'}</Button>
              <Button variant="ghost" onClick={() => { setName(''); setPhone(''); setTable(''); setInstructions(''); }}>Reset</Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
