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
  coverPhotos?: string;
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
  const [tableId, setTableId] = useState<number | null>(null);
  
  const [cafeName, setCafeName] = useState('ScanBite Cafe');
  const [cafeLogo, setCafeLogo] = useState<string | null>(null);
  const [cafeCover, setCafeCover] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200');
  const [loading, setLoading] = useState(true);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [sendingService, setSendingService] = useState(false);
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
      } else {
        // Run silent guest-auth to ensure fresh session token
        api.post('/auth/guest-auth', {
          phone: savedPhone.trim(),
          name: savedName.trim()
        }).then(res => {
          if (res.data?.token) {
            localStorage.setItem('sb_token', res.data.token);
          }
        }).catch(err => {
          console.error('Silent guest auth failed:', err);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!cafeId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
        
        const getImageUrl = (url?: string) => {
          if (!url) return '';
          if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
          const cleanUrl = '/' + url.replace(/^\/+/, '');
          const base = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
          return `${base}${cleanUrl}`;
        };

        // Fetch Cafe, Categories, Menu items, and Cafe Tables in parallel
        const [cafeRes, catsRes, itemsRes, tablesRes] = await Promise.all([
          api.get<CafeData>(`/cafes/${cafeId}`),
          api.get<CategoryData[]>(`/menu/categories/cafe/${cafeId}`),
          api.get<BackendItem[]>(`/menu?cafeId=${cafeId}`),
          api.get<any[]>(`/tables/cafe/${cafeId}`)
        ]);

        if (cafeRes.data) {
          setCafeName(cafeRes.data.name);
          if (cafeRes.data.imageUrl && !cafeRes.data.imageUrl.includes('placeholder.png')) {
            setCafeLogo(getImageUrl(cafeRes.data.imageUrl));
          } else {
            setCafeLogo(null);
          }
          if (cafeRes.data.coverPhotos) {
            const firstCover = cafeRes.data.coverPhotos.split(',')[0].trim();
            if (firstCover) {
              setCafeCover(getImageUrl(firstCover));
            }
          }
        }

        if (tablesRes.data && tableNumber) {
          const matched = tablesRes.data.find(
            (t) => t.tableNumber.toString().trim() === tableNumber.toString().trim()
          );
          if (matched) {
            setTableId(matched.id);
          }
        }

        const dbCategories = catsRes.data.map((c) => c.name.trim());
        const itemCategories = new Set<string>();
        const mapped = itemsRes.data.map((it) => {
          const catName = it.category?.name?.trim() || 'Other';
          itemCategories.add(catName);
          const cleanItemPath = it.imageUrl ? (it.imageUrl.startsWith('/') ? it.imageUrl : `/${it.imageUrl}`) : '';
          return {
            id: it.id.toString(),
            name: it.name,
            price: it.price,
            description: it.description,
            isVeg: it.veg,
            spicy: it.spicy,
            image: it.imageUrl ? (it.imageUrl.startsWith('http') ? it.imageUrl : `${backendBase}${cleanItemPath}`) : undefined,
            category: catName,
            available: it.available !== false
          };
        });

        // Merge categories to ensure no items are hidden
        const mergedCategories = [...dbCategories];
        itemCategories.forEach((cat) => {
          if (!mergedCategories.some((c) => c.toLowerCase() === cat.toLowerCase())) {
            mergedCategories.push(cat);
          }
        });

        setCategories(mergedCategories);
        setItems(mapped);
      } catch (err) {
        console.error('Failed to load digital menu data:', err);
        toast.error('Failed to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cafeId, tableNumber]);

  async function saveCustomerInfo() {
    if (!custName.trim() || !custPhone.trim()) {
      return toast.error('Please enter your name and phone number');
    }
    if (custPhone.trim().length < 10) {
      return toast.error('Please enter a valid phone number (at least 10 digits)');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/guest-auth', {
        phone: custPhone.trim(),
        name: custName.trim()
      });
      if (res.data?.token) {
        localStorage.setItem('sb_token', res.data.token);
      }
      sessionStorage.setItem('sb_customer_name', custName.trim());
      sessionStorage.setItem('sb_customer_phone', custPhone.trim());
      setShowOnboarding(false);
      toast.success(`Welcome, ${custName.trim()}!`);
    } catch (err) {
      console.error(err);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleServiceRequest(type: string) {
    if (!tableId) {
      return toast.error('Session table not resolved. Please scan QR again.');
    }
    setSendingService(true);
    try {
      await api.post('/service-requests', {
        tableId,
        requestType: type
      });
      toast.success(`${type.replace('_', ' ')} request sent to waiter!`);
      setShowServiceModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to request waiter assistance.');
    } finally {
      setSendingService(false);
    }
  }

  // Case-insensitive filtering
  const filtered = useMemo(() => 
    activeCategory 
      ? items.filter((i) => i.category.trim().toLowerCase() === activeCategory.trim().toLowerCase()) 
      : items, 
    [items, activeCategory]
  );

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

      {/* Service Request Assistance Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <Card className="w-full max-w-md border border-white/10 bg-zinc-950 p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowServiceModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-sm"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                Service Assistance
              </span>
              <h2 className="text-xl font-black text-white mt-1">Request Service</h2>
              <p className="text-xs text-zinc-500 mt-1">Need help? Alert the waitstaff instantly.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Call Waiter', value: 'WAITER', icon: '🙋‍♂️' },
                { label: 'Water Bottle', value: 'WATER', icon: '💧' },
                { label: 'Tissue Paper', value: 'TISSUE_PAPER', icon: '🧻' },
                { label: 'Extra Plates', value: 'EXTRA_PLATE', icon: '🍽️' },
                { label: 'Extra Spoons', value: 'EXTRA_SPOON', icon: '🥄' },
                { label: 'Extra Roti', value: 'EXTRA_ROTI', icon: '🫓' }
              ].map((service) => (
                <button
                  key={service.value}
                  disabled={sendingService}
                  onClick={() => handleServiceRequest(service.value)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-center hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-2xl">{service.icon}</span>
                  <span className="text-xs font-bold text-white tracking-tight">{service.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="absolute inset-0 -z-10">
        <div className="h-64 bg-cover bg-center animate-fade-in" style={{ backgroundImage: `linear-gradient(to bottom, rgba(7,7,7,0.45), rgba(7,7,7,0.7)), url('${cafeCover}')` }} />
      </div>

      <header className="mx-auto max-w-5xl p-4 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {cafeLogo ? (
              <img 
                src={cafeLogo} 
                alt={cafeName} 
                className="h-14 w-14 rounded-full object-cover border-2 border-amber-400/40 shadow-lg bg-zinc-900"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-black font-black text-xl shadow-lg shadow-amber-400/10">
                {cafeName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">{cafeName}</h1>
              <p className="text-xs text-white/80 mt-1">Welcome {tableNumber ? `at Table ${tableNumber}` : ''} — explore our physical menu categories</p>
            </div>
          </div>
          <div className="hidden sm:block text-right text-white/80 text-xs font-semibold">Open • 9am - 10pm</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 pb-32">
        {loading ? (
          <div className="space-y-8">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-20 shrink-0 rounded-full bg-white/5 animate-pulse" />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 w-full rounded-2xl bg-zinc-900/40 border border-white/[0.05] animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveCategory(null)} 
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    activeCategory === null ? 'bg-amber-400 text-black' : 'bg-white/5 text-white/85 hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button 
                    key={c} 
                    onClick={() => setActiveCategory(c)} 
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      activeCategory?.trim().toLowerCase() === c.trim().toLowerCase() 
                        ? 'bg-amber-400 text-black' 
                        : 'bg-white/5 text-white/85 hover:bg-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 bg-zinc-900/10 rounded-2xl backdrop-blur-sm">
                <p className="text-zinc-400 text-sm">No items found under this category.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((it) => (
                  <Card key={it.id} className="overflow-hidden p-0 relative border-white/[0.06] bg-zinc-900/30 backdrop-blur-md flex flex-col justify-between h-full">
                    {it.available === false && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4">
                        <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">Out of stock</span>
                        <p className="text-[10px] text-white/60 mt-1">This dish is currently unavailable.</p>
                      </div>
                    )}
                    <div className="relative h-44 w-full bg-white/5">
                      {it.image ? (
                        <img 
                          src={it.image} 
                          alt={it.name} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-white/5 flex items-center justify-center text-white/20 text-xs">No Image</div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        {it.isVeg ? 'Veg' : 'Non-Veg'}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-white tracking-tight">{it.name}</h3>
                          <p className="mt-1 text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">{it.description}</p>
                        </div>
                        <div className="text-sm font-bold text-amber-300 shrink-0">₹{Number(it.price).toFixed(2)}</div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: it.spicy || 0 }).map((_, i) => (
                            <span key={i} role="img" aria-label="spicy" className="text-xs">🌶️</span>
                          ))}
                        </div>
                        <Button 
                          disabled={it.available === false}
                          onClick={() => addItem({ id: it.id, name: it.name, price: Number(it.price), image: it.image }, 1)} 
                          className={`font-semibold h-9 text-xs px-4 ${
                            it.available === false ? 'bg-neutral-800 text-white/45 cursor-not-allowed' : 'bg-amber-400 hover:bg-amber-500 text-black'
                          }`}
                        >
                          {it.available === false ? 'Unavailable' : 'Add to Order'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Service Request assistance bell button */}
      {tableNumber && (
        <div className="fixed bottom-6 left-6 z-40">
          <Button 
            onClick={() => setShowServiceModal(true)} 
            className="flex h-12 items-center gap-2 rounded-full bg-zinc-900 border border-white/10 px-5 text-xs font-semibold uppercase tracking-wider text-white shadow-2xl hover:bg-zinc-800 transition duration-300"
          >
            🛎️ Request Service
          </Button>
        </div>
      )}

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
