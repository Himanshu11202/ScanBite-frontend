'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/site/cart-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/apiClient';
import { toast } from 'sonner';

interface TableItem {
  id: number;
  tableNumber: string;
}

interface AuthResponse {
  token: string;
}

interface ValidateResponse {
  id: number;
}

interface OrderResponse {
  id: string;
}

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { items, total, setQty, removeItem, clear } = useCart();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [hasSavedTable, setHasSavedTable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = sessionStorage.getItem('sb_customer_name') || '';
      const savedPhone = sessionStorage.getItem('sb_customer_phone') || '';
      const savedTable = sessionStorage.getItem('sb_customer_tableNumber') || '';
      setName(savedName);
      setPhone(savedPhone);
      setTableNumber(savedTable);
      if (savedTable) {
        setHasSavedTable(true);
      }
    }
  }, []);

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

  async function handlePlaceOrder() {
    if (items.length === 0) {
      return toast.error('Your cart is empty');
    }
    if (!name.trim() || !phone.trim()) {
      return toast.error('Name and Phone are required');
    }

    setSubmitting(true);
    try {
      const cafeIdStr = typeof window !== 'undefined' ? sessionStorage.getItem('sb_customer_cafeId') : null;
      const tableNum = (typeof window !== 'undefined' ? sessionStorage.getItem('sb_customer_tableNumber') : null) || tableNumber;
      
      if (!cafeIdStr || !tableNum) {
        throw new Error('Cafe or table details missing. Please re-scan the QR code.');
      }
      
      // 1. Register/Login Guest Customer
      let token: string | null = null;
      try {
        const regRes = await api.post<AuthResponse>('/auth/register', {
          username: phone.trim(),
          password: phone.trim(),
          fullName: name.trim(),
          role: 'CUSTOMER'
        });
        token = regRes.data.token;
      } catch (err: unknown) {
        // If username exists, login instead
        let isUsernameExists = false;
        if (err && typeof err === 'object' && 'response' in err) {
          const anyErr = err as { response?: { status?: number; data?: unknown } };
          if (anyErr.response?.status === 400 || anyErr.response?.data === 'Username exists') {
            isUsernameExists = true;
          }
        }
        if (isUsernameExists) {
          const loginRes = await api.post<AuthResponse>('/auth/login', {
            username: phone.trim(),
            password: phone.trim()
          });
          token = loginRes.data.token;
        } else {
          throw err;
        }
      }

      if (!token) {
        throw new Error('Failed to authenticate guest account.');
      }

      // Store guest token so further requests use it
      if (typeof window !== 'undefined') {
        localStorage.setItem('sb_token', token);
      }

      // 2. Resolve tableNumber to tableId (now authenticated)
      const tablesRes = await api.get<TableItem[]>(`/tables/cafe/${cafeIdStr}`);
      const matchedTable = tablesRes.data.find(
        (t) => t.tableNumber.toString().trim() === tableNum.toString().trim()
      );
      
      if (!matchedTable) {
        throw new Error(`Table ${tableNum} is not registered in this cafe.`);
      }

      // Validate token to retrieve customer database ID
      const valRes = await api.get<ValidateResponse>('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const customerId = valRes.data.id;

      // 3. Place order in DB
      const orderPayload = {
        tableId: matchedTable.id,
        customerId: customerId,
        items: items.map((it) => ({
          menuItemId: Number(it.id),
          quantity: it.qty
        }))
      };

      const orderRes = await api.post<OrderResponse>('/orders', orderPayload);
      const savedOrder = orderRes.data;

      // Clean cart
      clear();
      toast.success('Order placed successfully!');
      
      // Redirect to success page
      router.push(`/checkout/success?orderId=${savedOrder.id}`);
    } catch (err: unknown) {
      console.error(err);
      let errMsg = 'Failed to place order.';
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const anyErr = err as { response?: { data?: unknown } };
        if (typeof anyErr.response?.data === 'string') {
          errMsg = anyErr.response.data;
        }
      }
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-8 p-4 max-w-6xl mx-auto">
      <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-300">Checkout</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Review and Place Order</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft space-y-6">
          <h2 className="text-2xl font-semibold text-white">Billing Details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/70">Full Name</label>
              <Input placeholder="Alex Jordan" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Phone / Mobile Number</label>
              <Input placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Table Number</label>
              <Input placeholder="e.g. 5" value={tableNumber} disabled={hasSavedTable} onChange={(e) => setTableNumber(e.target.value)} />
            </div>
            <hr className="border-white/10" />
            <h3 className="text-lg font-semibold text-white">Mock Payment details</h3>
            <div>
              <label className="mb-2 block text-sm text-white/70">Card Number</label>
              <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">Expiry</label>
                <Input placeholder="MM / YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">CVC</label>
                <Input placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} />
              </div>
            </div>
            <Button onClick={handlePlaceOrder} disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft space-y-6">
          <h2 className="text-2xl font-semibold text-white">Order Summary</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {items.length === 0 && <p className="text-white/50">Your cart is empty.</p>}
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="h-12 w-12 rounded-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-white/5 flex items-center justify-center text-white/20 text-xs">No Image</div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-white">{it.name}</h4>
                    <p className="text-xs text-white/50">₹{it.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => dec(it.id)}>-</Button>
                  <span className="text-sm text-white px-1">{it.qty}</span>
                  <Button variant="outline" size="sm" onClick={() => inc(it.id)}>+</Button>
                  <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600" onClick={() => removeItem(it.id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-semibold text-white">
            <span>Total</span>
            <span className="text-amber-300">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
