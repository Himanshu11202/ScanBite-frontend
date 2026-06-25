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
import { motion } from 'framer-motion';
import { 
  ShoppingBag, CreditCard, ArrowLeft, ArrowRight, 
  Trash2, Plus, Minus, ClipboardCheck, Sparkles 
} from 'lucide-react';

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

type PaymentMethod = 'card' | 'upi' | 'cash';

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { items, total, setQty, removeItem, clear } = useCart();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  
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

  const tax = total * 0.05; // 5% GST
  const grandTotal = total + tax;

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
      
      // 1. Authenticate Guest Customer
      let token = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null;
      if (!token) {
        const authRes = await api.post<AuthResponse>('/auth/guest-auth', {
          phone: phone.trim(),
          name: name.trim()
        });
        token = authRes.data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('sb_token', token);
        }
      }

      // 2. Resolve tableNumber and validate customer ID
      const [tablesRes, valRes] = await Promise.all([
        api.get<TableItem[]>(`/tables/cafe/${cafeIdStr}`),
        api.get<ValidateResponse>('/auth/validate', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const matchedTable = tablesRes.data.find(
        (t) => t.tableNumber.toString().trim() === tableNum.toString().trim()
      );
      
      if (!matchedTable) {
        throw new Error(`Table ${tableNum} is not registered in this cafe.`);
      }

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
    <div className="min-h-screen bg-zinc-950 text-white pb-16">
      
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => router.push('/customer/menu')} 
            variant="ghost" 
            className="text-zinc-400 hover:text-white rounded-xl text-xs gap-1.5 px-3"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Menu
          </Button>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-300">Dining Table #{tableNumber}</span>
        </div>

        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.08),_transparent_60%)]" />
          <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Checkout Room</p>
          <h1 className="mt-2 text-3xl font-black text-white tracking-tight leading-none">Review & Place Order</h1>
          <p className="mt-2 text-xs text-zinc-400 font-light max-w-md">Verify your cart contents and table destination before dispatching to the kitchen.</p>
        </div>

        {/* Columns Grid */}
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] items-start">
          
          {/* Left Column: Guest Info & Payment Choices */}
          <Card className="border-white/[0.08] bg-zinc-900/40 p-6 md:p-8 backdrop-blur-xl rounded-[2rem] shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Billing & Guest Details</h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Your Name</label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="bg-black/30 border-white/5 text-xs h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Mobile Number</label>
                <Input 
                  placeholder="e.g. 9876543210" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="bg-black/30 border-white/5 text-xs h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Table Destination</label>
                <Input 
                  placeholder="e.g. 12" 
                  value={tableNumber} 
                  disabled={hasSavedTable} 
                  onChange={(e) => setTableNumber(e.target.value)} 
                  className="bg-black/30 border-white/5 text-xs h-11 rounded-xl"
                />
              </div>

              <hr className="border-white/5 my-2" />

              {/* Payment Tabs */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-1 rounded-xl">
                  {(['card', 'upi', 'cash'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                        paymentMethod === method
                          ? 'bg-amber-400 text-black font-extrabold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 bg-black/20 rounded-2xl border border-white/5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Card Number</label>
                    <Input 
                      placeholder="4111 2222 3333 4444" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-black/30 border-white/5 text-xs h-10 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Expiry Date</label>
                      <Input 
                        placeholder="MM/YY" 
                        value={expiry} 
                        onChange={(e) => setExpiry(e.target.value)}
                        className="bg-black/30 border-white/5 text-xs h-10 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">CVC</label>
                      <Input 
                        placeholder="123" 
                        type="password"
                        maxLength={3}
                        value={cvc} 
                        onChange={(e) => setCvc(e.target.value)}
                        className="bg-black/30 border-white/5 text-xs h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Info */}
              {paymentMethod === 'upi' && (
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 text-center text-xs text-zinc-400 animate-fade-in">
                  ⚡ Pay using any UPI app (PhonePe, GPay, Paytm) on confirmation.
                </div>
              )}

              {/* Cash Info */}
              {paymentMethod === 'cash' && (
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 text-center text-xs text-zinc-400 animate-fade-in">
                  💵 Cash payment can be settled with the waiter at your table.
                </div>
              )}

              <Button 
                onClick={handlePlaceOrder} 
                disabled={submitting || items.length === 0} 
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-black text-xs h-12 rounded-xl mt-4 shadow-lg shadow-amber-400/10 flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Placing Order...' : 'Place Order Now'} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Right Column: modern order items breakdown */}
          <Card className="border-white/[0.08] bg-zinc-900/40 p-6 md:p-8 backdrop-blur-xl rounded-[2rem] shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Order summary</h2>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500 font-medium">Your cart is empty.</div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      {it.image ? (
                        <img src={it.image} alt={it.name} className="h-10 w-10 rounded-xl object-cover border border-white/5 bg-neutral-900 shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-[9px] text-zinc-600 shrink-0">Food</div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{it.name}</h4>
                        <span className="text-[10px] font-extrabold text-amber-300 font-mono mt-0.5 block">₹{it.price.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Counter selector inside checkout summary */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden h-8 px-0.5">
                      <button 
                        onClick={() => {
                          if (it.qty === 1) {
                            removeItem(it.id);
                          } else {
                            setQty(it.id, it.qty - 1);
                          }
                        }}
                        className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono">{it.qty}</span>
                      <button 
                        onClick={() => setQty(it.id, it.qty + 1)}
                        className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-white/5 pt-4 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>GST Tax (5%)</span>
                <span className="font-mono">₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between text-base font-black text-white">
                <span>Grand Total</span>
                <span className="text-amber-300 font-mono text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </Card>

        </div>
      </div>
      
    </div>
  );
}
