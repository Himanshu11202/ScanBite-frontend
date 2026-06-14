'use client';

import React from 'react';
import { useCart } from './cart-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function StickyCart() {
  const { items, total, setQty, removeItem, clear } = useCart();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:relative sm:bottom-auto sm:right-auto sm:max-w-none">
      <Card className="bg-gradient-to-br from-neutral-900/60 to-neutral-900/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Cart</div>
            <div className="text-xs text-white/60">{items.length} items • ₹{total.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => clear()}>Clear</Button>
            <Button onClick={() => alert('Checkout flow not implemented')} className="bg-amber-500 text-black">Checkout</Button>
          </div>
        </div>

        <div className="mt-3 max-h-56 overflow-auto">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-3">
                {it.image ? <img src={it.image} alt={it.name} className="h-12 w-12 rounded-md object-cover"/> : <div className="h-12 w-12 rounded-md bg-white/5" />}
                <div>
                  <div className="text-sm text-white">{it.name}</div>
                  <div className="text-xs text-white/60">₹{(it.price).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={it.qty} onChange={(e)=>setQty(it.id, Math.max(1, Number(e.target.value)||1))} className="w-14 rounded-md bg-transparent p-1 text-sm text-white/80" />
                <Button variant="ghost" onClick={()=>removeItem(it.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
