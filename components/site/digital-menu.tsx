'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from './cart-context';
import { StickyCart } from './sticky-cart';
import api from '@/services/apiClient';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, ChefHat, Bell, Star, Sparkles, 
  MapPin, Clock, Phone, Utensils, Heart, ChevronRight, User 
} from 'lucide-react';

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
  popular?: boolean;
}

interface CafeData {
  name: string;
  imageUrl?: string;
  coverPhotos?: string;
  address?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
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
  popular?: boolean;
  cafe?: {
    id: number;
  };
}

export function DigitalMenu() {
  const { items: cartItems, addItem, setQty, removeItem } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [tableId, setTableId] = useState<number | null>(null);
  
  const [cafeName, setCafeName] = useState('ScanBite Cafe');
  const [cafeLogo, setCafeLogo] = useState<string | null>(null);
  const [cafeCover, setCafeCover] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200');
  const [cafeDetails, setCafeDetails] = useState<CafeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Welcome Onboarding Screen state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [sendingService, setSendingService] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = '/' + url.replace(/^\/+/, '');
    const base = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
    return `${base}${cleanUrl}`;
  };

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
        // Fetch Cafe, Categories, Menu items, and Cafe Tables in parallel
        const [cafeRes, catsRes, itemsRes, tablesRes] = await Promise.all([
          api.get<CafeData>(`/cafes/${cafeId}`),
          api.get<CategoryData[]>(`/menu/categories/cafe/${cafeId}`),
          api.get<BackendItem[]>(`/menu?cafeId=${cafeId}`),
          api.get<any[]>(`/tables/cafe/${cafeId}`)
        ]);

        if (cafeRes.data) {
          setCafeDetails(cafeRes.data);
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
            available: it.available !== false,
            popular: it.popular === true
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
      sessionStorage.setItem('sb_customer_cafeId', String(cafeId));
      sessionStorage.setItem('sb_customer_tableNumber', tableNumber || '');
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
      ? items.filter((i) => i.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase()) 
      : items, 
    [items, activeCategory]
  );

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      
      {/* ========================================================
          PART 2: PREMIUM WELCOME SCREEN (GUEST ONBOARDING LANDING)
          ======================================================== */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 overflow-y-auto"
          >
            {/* Background Cover Image with Gradient Vignette */}
            <div 
              className="absolute inset-0 -z-10 bg-cover bg-center opacity-30 scale-105"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(9,9,11,0.4), rgba(9,9,11,0.95)), url('${cafeCover}')` }}
            />

            {/* Top header spacing */}
            <div className="h-6" />

            {/* Center Content Card */}
            <div className="w-full max-w-md mx-auto px-6 py-8 flex flex-col items-center justify-center space-y-8 flex-1">
              
              {/* Animated Cafe Logo */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative h-28 w-28 rounded-full bg-zinc-900 border-4 border-amber-400/40 shadow-2xl flex items-center justify-center overflow-hidden"
              >
                {cafeLogo ? (
                  <img src={cafeLogo} alt={cafeName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-amber-400 text-3xl font-black">{cafeName.substring(0, 2).toUpperCase()}</span>
                )}
              </motion.div>

              {/* Cafe Welcome Text */}
              <div className="text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-300">Welcome To</span>
                <h2 className="text-3xl font-black text-white tracking-tight">{cafeName}</h2>
                {tableNumber && (
                  <span className="inline-flex rounded-full bg-amber-400/10 border border-amber-400/25 px-4 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest mt-1">
                    Dining at Table #{tableNumber}
                  </span>
                )}
                <p className="text-xs text-zinc-400 font-light leading-relaxed pt-2 max-w-xs mx-auto">
                  Experience our digital dining menu. Place orders directly to the kitchen in seconds.
                </p>
              </div>

              {/* Registration Form */}
              <Card className="w-full border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl rounded-[2rem] shadow-2xl space-y-4">
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Your Name</span>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
                
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Mobile Number</span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <Button 
                  onClick={saveCustomerInfo} 
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black font-black text-xs h-11 rounded-xl shadow-lg shadow-amber-400/10 transition mt-2 flex items-center justify-center gap-1.5"
                >
                  Continue To Menu <ChevronRight className="h-4 w-4" />
                </Button>
              </Card>
            </div>

            {/* Bottom Copyright info */}
            <div className="py-6 text-center text-[10px] text-zinc-600 font-semibold tracking-wider uppercase">
              Powered by ScanBite ☕
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          SERVICE REQUEST ASSISTANCE MODAL
          ======================================================== */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-md border border-white/10 bg-zinc-950 p-6 shadow-2xl relative rounded-3xl">
            <button 
              onClick={() => setShowServiceModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                Service Assistance
              </span>
              <h2 className="text-xl font-black text-white mt-1">Request Service</h2>
              <p className="text-xs text-zinc-500 mt-1">Alert the waitstaff to your table instantly.</p>
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

      {/* Main Cover Banner */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="h-72 bg-cover bg-center animate-fade-in" 
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(9,9,11,0.25), rgba(9,9,11,0.95)), url('${cafeCover}')` }} 
        />
      </div>

      {/* Header Info */}
      <header className="mx-auto max-w-5xl p-4 pt-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {cafeLogo ? (
              <img src={cafeLogo} alt={cafeName} className="h-16 w-16 rounded-full object-cover border border-white/10 shadow-lg bg-zinc-900" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-black font-black text-2xl shadow-lg shadow-amber-400/10">
                {cafeName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none text-white">{cafeName}</h1>
              <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
                <span>📍 {cafeDetails?.address || 'Cafe Address'}</span>
                {tableNumber && <strong className="text-amber-400">| Table #{tableNumber}</strong>}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">Open</span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">{cafeDetails?.openingTime || '9:00 AM'} - {cafeDetails?.closingTime || '10:00 PM'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
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
            {/* ========================================================
                PART 3: STICKY CATEGORIES BAR
                ======================================================== */}
            <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.04] py-3.5 mb-6 overflow-x-auto">
              <div className="flex gap-2.5 px-1">
                <button 
                  onClick={() => setActiveCategory(null)} 
                  className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                    activeCategory === null 
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/15' 
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  All Dishes
                </button>
                {categories.map((c) => (
                  <button 
                    key={c} 
                    onClick={() => setActiveCategory(c)} 
                    className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition shrink-0 ${
                      activeCategory?.trim().toLowerCase() === c.trim().toLowerCase() 
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/15' 
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Dishes grid list */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center border border-white/5 bg-zinc-900/10 rounded-3xl backdrop-blur-sm">
                <Utensils className="h-8 w-8 text-zinc-700 mb-2" />
                <p className="text-zinc-500 text-xs">No items currently available in this category.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((it) => {
                  const cartItem = cartItems.find((ci) => ci.id === it.id);

                  return (
                    <Card 
                      key={it.id} 
                      className="overflow-hidden p-0 relative border-white/[0.06] bg-zinc-900/30 backdrop-blur-md flex flex-col justify-between h-full rounded-[2rem] shadow-xl group transition-all hover:border-white/10"
                    >
                      {/* OOS Overlay */}
                      {it.available === false && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4">
                          <span className="rounded-full bg-rose-600 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                            Out of stock
                          </span>
                          <p className="text-[9px] text-white/50 mt-1.5">Chef has disabled this item for today.</p>
                        </div>
                      )}

                      {/* Image Frame */}
                      <div className="relative h-44 w-full bg-white/5 overflow-hidden">
                        {it.image ? (
                          <img 
                            src={it.image} 
                            alt={it.name} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-white/5 flex items-center justify-center text-white/20 text-xs font-semibold">No Image</div>
                        )}
                        
                        {/* Veg / Non-Veg badge indicator (Swiggy/Zomato style square box) */}
                        <div className="absolute left-3 top-3 bg-zinc-950/80 border border-white/10 p-1.5 rounded-lg">
                          <div className={`h-2 w-2 rounded-full ${it.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        </div>

                        {/* Gold Popular Ribbon */}
                        {it.popular && (
                          <div className="absolute right-3 top-3 bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-lg flex items-center gap-0.5 z-10">
                            ★ Popular
                          </div>
                        )}
                      </div>

                      {/* Details Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-bold text-white tracking-tight leading-tight group-hover:text-amber-300 transition-colors">
                              {it.name}
                            </h3>
                            <span className="text-xs font-black text-amber-300 shrink-0 font-mono">
                              ₹{Number(it.price).toFixed(0)}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-light leading-relaxed line-clamp-2 pt-0.5">
                            {it.description || 'No description provided.'}
                          </p>
                        </div>

                        {/* Interactive Quantity control row */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <div className="flex items-center gap-1 shrink-0">
                            {Array.from({ length: it.spicy || 0 }).map((_, i) => (
                              <span key={i} role="img" aria-label="spicy" className="text-xs">🌶️</span>
                            ))}
                          </div>
                          
                          {/* Counter / Add button */}
                          <div className="shrink-0">
                            {cartItem ? (
                              <div className="flex items-center bg-amber-400 text-black rounded-xl font-bold overflow-hidden h-9 px-1">
                                <button 
                                  onClick={() => {
                                    if (cartItem.qty === 1) {
                                      removeItem(it.id);
                                    } else {
                                      setQty(it.id, cartItem.qty - 1);
                                    }
                                  }}
                                  className="h-8 w-8 flex items-center justify-center hover:bg-amber-500/20 active:scale-95 transition"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-6 text-center text-xs font-black font-mono">{cartItem.qty}</span>
                                <button 
                                  onClick={() => setQty(it.id, cartItem.qty + 1)}
                                  className="h-8 w-8 flex items-center justify-center hover:bg-amber-500/20 active:scale-95 transition"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <Button 
                                disabled={it.available === false}
                                onClick={() => addItem({ id: it.id, name: it.name, price: Number(it.price), image: it.image }, 1)} 
                                className="font-extrabold h-9 text-xs px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-black shadow-md shadow-amber-400/5 transition flex items-center gap-1"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating service assistant bell */}
      {tableNumber && (
        <div className="fixed bottom-6 left-6 z-40">
          <Button 
            onClick={() => setShowServiceModal(true)} 
            className="flex h-12 items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-5 text-xs font-semibold uppercase tracking-wider text-white shadow-2xl hover:bg-zinc-800 transition duration-300"
          >
            🛎️ Waiter Assistance
          </Button>
        </div>
      )}

      {/* Sticky Cart wrapper */}
      <div className="fixed bottom-4 right-4 z-40 w-full max-w-[340px] px-4 md:px-0">
        <StickyCart />
      </div>

    </div>
  );
}
