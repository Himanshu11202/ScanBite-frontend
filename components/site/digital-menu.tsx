'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from './cart-context';
import { StickyCart } from './sticky-cart';
import api from '@/services/apiClient';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isVeg?: boolean;
  spicy?: number;
  image?: string;
  category?: string;
  available?: boolean;
}

interface CafeData {
  name: string;
  imageUrl?: string;
}

interface CategoryData {
  name: string;
}

interface BackendItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  veg?: boolean;
  spicy?: number;
  imageUrl?: string;
  category?: {
    name: string;
  };
  available?: boolean;
  cafe?: {
    id: number;
  };
}

export function DigitalMenu() {
  const { addItem } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  
  const [cafeName, setCafeName] = useState('ScanBite Cafe');
  const [cafeImage, setCafeImage] = useState('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=60');

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      let cid = params.get('cafeId');
      let tnum = params.get('tableNumber');
      if (!cid) cid = sessionStorage.getItem('sb_customer_cafeId');
      if (!tnum) tnum = sessionStorage.getItem('sb_customer_tableNumber');
      
      if (cid) setCafeId(Number(cid));
      if (tnum) setTableNumber(tnum);

      const savedName = sessionStorage.getItem('sb_customer_name');
      const savedPhone = sessionStorage.getItem('sb_customer_phone');
      if (!savedName || !savedPhone) {
        setShowOnboarding(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!cafeId) return;

    async function fetchData() {
      try {
        // Fetch Cafe details
        const cafeRes = await api.get<CafeData>(`/cafes/${cafeId}`);
        if (cafeRes.data) {
          setCafeName(cafeRes.data.name);
          if (cafeRes.data.imageUrl) {
            const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
            const fullUrl = cafeRes.data.imageUrl.startsWith('http') ? cafeRes.data.imageUrl : `${backendBase}${cafeRes.data.imageUrl}`;
            setCafeImage(fullUrl);
          }
        }

        // Fetch categories
        const catsRes = await api.get<CategoryData[]>(`/menu/categories/cafe/${cafeId}`);
        setCategories(catsRes.data.map((c) => c.name));

        // Fetch menu items
        const itemsRes = await api.get<BackendItem[]>('/menu');
        const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
        const mapped = itemsRes.data
          .filter((it) => it.cafe?.id === cafeId)
          .map((it) => ({
            id: it.id.toString(),
            name: it.name,
            price: it.price,
            description: it.description,
            isVeg: it.veg,
            spicy: it.spicy,
            image: it.imageUrl ? (it.imageUrl.startsWith('http') ? it.imageUrl : `${backendBase}${it.imageUrl}`) : undefined,
            category: it.category?.name || '',
            available: it.available !== false
          }));
        setItems(mapped);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load menu. Please try again.');
      }
    }

    fetchData();
  }, [cafeId]);

  function saveCustomerInfo() {
    if (!custName.trim() || !custPhone.trim()) {
      return toast.error('Please enter your name and phone number');
    }
    if (custPhone.trim().length < 10) {
      return toast.error('Please enter a valid phone number (at least 10 digits)');
    }
    sessionStorage.setItem('sb_customer_name', custName.trim());
    sessionStorage.setItem('sb_customer_phone', custPhone.trim());
    setShowOnboarding(false);
    toast.success(`Welcome, ${custName.trim()}!`);
  }

  const filtered = useMemo(() => activeCategory ? items.filter(i=>i.category===activeCategory) : items, [items, activeCategory]);

  return (
    <div className="relative min-h-screen">
      {/* Onboarding Modal Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <Card className="w-full max-w-md border border-white/10 bg-neutral-900/90 p-6 shadow-2xl">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-amber-300">Welcome to {cafeName}</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Guest Registration</h2>
              <p className="mt-1 text-sm text-white/50">Please enter your details to view menu & place orders.</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-white/70">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-white/70">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <Button onClick={saveCustomerInfo} className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                Proceed to Menu
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="absolute inset-0 -z-10">
        <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(7,7,7,0.45), rgba(7,7,7,0.7)), url('${cafeImage}')` }} />
      </div>

      <header className="mx-auto max-w-5xl p-4 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{cafeName}</h1>
            <p className="text-sm text-white/80">Welcome {tableNumber ? `at Table ${tableNumber}` : ''} — explore our curated menu</p>
          </div>
          <div className="hidden sm:block text-right text-white/80">Open • 9am - 10pm</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 pb-32">
        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-3">
            <button onClick={()=>setActiveCategory(null)} className={`rounded-full px-3 py-1 text-sm ${activeCategory===null ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/80'}`}>All</button>
            {categories.map((c) => (
              <button key={c} onClick={()=>setActiveCategory(c)} className={`rounded-full px-3 py-1 text-sm ${activeCategory===c ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/80'}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <Card key={it.id} className="overflow-hidden p-0 relative">
              {it.available === false && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4">
                  <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">Out of stock</span>
                  <p className="text-[10px] text-white/60 mt-1">This dish is currently unavailable.</p>
                </div>
              )}
              <div className="relative h-44 w-full bg-white/5">
                {it.image ? <img src={it.image} alt={it.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-white/5 flex items-center justify-center text-white/20">No Image</div>}
                <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{it.isVeg ? 'Veg' : 'Non-Veg'}</div>
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{it.name}</h3>
                    <p className="mt-1 text-xs text-white/70">{it.description}</p>
                  </div>
                  <div className="text-sm font-semibold text-amber-300">₹{Number(it.price).toFixed(2)}</div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/60">{Array.from({length: it.spicy||0}).map((_,i)=>(<span key={i} role="img" aria-label="spicy">🌶️</span>))}</div>
                  <Button 
                    disabled={it.available === false}
                    onClick={()=>addItem({ id: it.id, name: it.name, price: Number(it.price), image: it.image }, 1)} 
                    className={`font-semibold ${it.available === false ? 'bg-neutral-800 text-white/40 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}
                  >
                    {it.available === false ? 'Unavailable' : 'Add'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <CartOverlay />
      <StickyCartWrapper />
    </div>
  );
}

function CartOverlay() {
  return null;
}

function StickyCartWrapper() {
  return (
    <div>
      <StickyCart />
    </div>
  );
}
