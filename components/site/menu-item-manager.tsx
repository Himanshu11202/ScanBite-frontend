'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3, Trash2, Image as ImageIcon, Plus, Square, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isVeg: boolean;
  spicy: number; // 0-5
  image?: string; // data URL
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

import api from '@/services/apiClient';
import { toast } from 'sonner';

interface ValidateResponse {
  id: number;
}

interface CafeResponse {
  id: number;
  ownerId: number;
}

interface CategoryItem {
  id: number;
  name: string;
}

interface MenuItemData {
  id: number;
  name: string;
  price: number;
  description?: string;
  veg: boolean;
  spicy?: number;
  imageUrl?: string;
  image?: string;
  category?: {
    id: number;
    name: string;
  };
  available?: boolean;
  cafe?: {
    id: number;
  };
}

export function MenuItemManager() {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanUrl}`;
  };

  const [editing, setEditing] = useState<MenuItemData | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [spicy, setSpicy] = useState(0);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [available, setAvailable] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Load user, cafe, items and categories
  useEffect(() => {
    async function loadData() {
      try {
        const valRes = await api.get<ValidateResponse>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<CafeResponse[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        if (userCafe) {
          setCafeId(userCafe.id);
          
          // Load items for this cafe only
          const itemsRes = await api.get<MenuItemData[]>(`/menu?cafeId=${userCafe.id}`);
          setItems(itemsRes.data);

          // Load categories
          const catsRes = await api.get<CategoryItem[]>(`/menu/categories/cafe/${userCafe.id}`);
          setCategories(catsRes.data);
        }
      } catch (err) {
        console.error('Failed to load menu items data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setPrice(editing.price);
      setDescription(editing.description || '');
      setIsVeg(editing.veg);
      setSpicy(editing.spicy || 0);
      setSelectedCatId(editing.category?.id?.toString() || '');
      setImagePreview(editing.imageUrl ? getImageUrl(editing.imageUrl) : undefined);
      setAvailable(editing.available !== false);
    } else {
      setName(''); setPrice(''); setDescription(''); setIsVeg(true); setSpicy(0); setSelectedCatId(''); setImagePreview(undefined); setImageFile(null);
      setAvailable(true);
    }
  }, [editing]);

  function onPickImage(files: FileList | null) {
    const f = files && files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function saveItem() {
    if (!name.trim() || price === '' || Number(price) < 0 || !cafeId) {
      return toast.error('Please provide name and valid price');
    }

    try {
      const payload = {
        name: name.trim(),
        price: Number(price),
        description,
        veg: isVeg,
        spicy,
        cafe: { id: cafeId },
        category: selectedCatId ? { id: Number(selectedCatId) } : null,
        available: available
      };

      let savedItem: MenuItemData | null = null;
      if (editing && editing.id) {
        // Update
        const res = await api.put<MenuItemData>(`/menu/${editing.id}`, payload);
        savedItem = res.data;
        toast.success('Dish updated successfully!');
      } else {
        // Create
        const res = await api.post<MenuItemData>('/menu', payload);
        savedItem = res.data;
        toast.success('Dish added successfully!');
      }

      // Upload image if specified
      if (imageFile && savedItem && savedItem.id) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const imgRes = await api.post<MenuItemData>(`/menu/${savedItem.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        savedItem = imgRes.data;
      }

      // Update local state list
      if (editing && editing.id) {
        setItems((s) => s.map((it) => it.id === editing.id ? savedItem! : it));
      } else {
        setItems((s) => [savedItem!, ...s]);
      }

      setEditing(null);
      if (imageFile) {
        URL.revokeObjectURL(imagePreview || '');
        setImageFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save menu item');
    }
  }

  function startAdd() {
    setEditing(null);
    setName(''); setPrice(''); setDescription(''); setIsVeg(true); setSpicy(0); setSelectedCatId(''); setImagePreview(undefined); setImageFile(null);
  }

  function editItem(it: MenuItemData) {
    setEditing(it);
  }

  async function deleteItem(id: number) {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      setItems((s) => s.filter((x) => x.id !== id));
      toast.success('Dish deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete dish');
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 w-full rounded-2xl bg-zinc-900/40 border border-white/[0.05] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-[450px] rounded-2xl bg-zinc-900/40 border border-white/[0.05] animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-amber-300">Menu</p>
          <h3 className="text-2xl font-bold text-white">Items</h3>
        </div>
        <div>
          <Button onClick={startAdd} className="inline-flex items-center gap-2"><Plus className="h-4 w-4"/> New Item</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.length === 0 && <div className="col-span-full text-white/60">No menu items yet. Add one with the button above.</div>}
            {items.map((it) => (
              <motion.article key={it.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-gradient-to-br from-neutral-900/40 to-neutral-900/20 p-3">
                <div className="relative h-44 w-full overflow-hidden rounded-md bg-white/5">
                  {(it.imageUrl || it.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={getImageUrl(it.imageUrl || it.image)} 
                      alt={it.name} 
                      className="h-full w-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/40"><ImageIcon className="h-8 w-8"/></div>
                  )}
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-semibold text-white ${it.available === false ? 'line-through text-white/50' : ''}`}>{it.name}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${it.veg ? 'bg-emerald-600 text-emerald-50' : 'bg-rose-600 text-rose-50'}`}>{it.veg ? 'Veg' : 'Non-Veg'}</span>
                      {it.available === false && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">OUT OF STOCK</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/60">{it.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                      <span className="font-semibold">₹{it.price.toFixed(2)}</span>
                      <span className="text-xs text-white/50">{Array.from({length: it.spicy || 0}).map((_,i)=>(<span key={i} role="img" aria-label="spicy">🌶️</span>))}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => editItem(it)} title="Edit"><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" onClick={() => deleteItem(it.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <aside>
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Item editor</p>
                <p className="text-xs text-white/50">Create or edit menu items with images, price and tags.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-white/70">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dish name" />

              <label className="text-sm text-white/70">Price</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" />

              <label className="text-sm text-white/70">Category</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-2 text-sm text-white/80 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <label className="text-sm text-white/70">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md bg-transparent border border-neutral-800 p-2 text-sm text-white/80" rows={3} />

              <div className="flex items-center gap-3">
                <div>
                  <label className="text-sm text-white/70">Type</label>
                  <div className="mt-1 flex gap-2">
                    <Button variant={isVeg ? 'default' : 'ghost'} onClick={() => setIsVeg(true)}>Veg</Button>
                    <Button variant={!isVeg ? 'default' : 'ghost'} onClick={() => setIsVeg(false)}>Non-Veg</Button>
                  </div>
                </div>

                <div className="ml-auto">
                  <label className="text-sm text-white/70">Spicy</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="range" min={0} max={5} value={spicy} onChange={(e) => setSpicy(Number(e.target.value))} />
                    <div className="text-xs text-white/60">{spicy} / 5</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <span className="text-xs font-semibold text-white">Item Availability</span>
                  <p className="text-[9px] text-white/50">Mark if item is available for ordering.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={available} 
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Image</label>
                <div className="mt-2 flex items-center gap-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onPickImage(e.target.files)} className="hidden" />
                  <Button type="button" onClick={() => fileRef.current?.click()} variant="outline" className="inline-flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Choose</Button>
                  {imagePreview && <div className="ml-2 h-12 w-12 overflow-hidden rounded-md"><img src={imagePreview} alt="preview" className="h-full w-full object-cover"/></div>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => { saveItem(); }} className="flex-1">Save Item</Button>
                <Button variant="outline" onClick={() => { setEditing(null); startAdd(); }}>Reset</Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}
