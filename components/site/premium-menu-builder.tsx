'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Move, Plus, Trash2, Image as ImageIcon, Star, StarOff, 
  Check, Edit2, ToggleLeft, ToggleRight, Loader2, Sparkles 
} from 'lucide-react';
import api from '@/services/apiClient';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  description?: string;
}

interface MenuItemData {
  id: string;
  name: string;
  price: number;
  description?: string;
  veg: boolean;
  spicy?: number;
  imageUrl?: string;
  available?: boolean;
  popular?: boolean;
  category?: {
    id: number;
    name: string;
  } | null;
  isDraft?: boolean;
}

export function PremiumMenuBuilder() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [dishes, setDishes] = useState<MenuItemData[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [cafeName, setCafeName] = useState('My Cafe');
  const [cafeCover, setCafeCover] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600');
  const [loading, setLoading] = useState(true);

  // Focus and inline edit states
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [draggingDishId, setDraggingDishId] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = '/' + url.replace(/^\/+/, '');
    const base = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
    return `${base}${cleanUrl}`;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const valRes = await api.get<{ id: number }>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<any[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        
        if (userCafe) {
          setCafeId(userCafe.id);
          setCafeName(userCafe.name);
          if (userCafe.coverPhotos) {
            const firstCover = userCafe.coverPhotos.split(',')[0].trim();
            if (firstCover) setCafeCover(getImageUrl(firstCover));
          }

          const [catsRes, itemsRes] = await Promise.all([
            api.get<CategoryItem[]>(`/menu/categories/cafe/${userCafe.id}`),
            api.get<any[]>(`/menu?cafeId=${userCafe.id}`)
          ]);

          setCategories(catsRes.data);
          // Standardize response fields
          const mappedItems = itemsRes.data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            price: item.price,
            description: item.description,
            veg: item.veg !== false,
            spicy: item.spicy || 0,
            imageUrl: item.imageUrl,
            available: item.available !== false,
            popular: item.popular === true,
            category: item.category ? { id: item.category.id, name: item.category.name } : null
          }));
          setDishes(mappedItems);

          if (catsRes.data.length > 0) {
            setActiveCategoryTab(catsRes.data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load menu builder:', err);
        toast.error('Failed to load menu details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Category Actions
  async function handleAddCategory() {
    if (!cafeId) return;
    const newName = 'New Category ' + (categories.length + 1);
    try {
      const res = await api.post<CategoryItem>('/menu/categories', {
        name: newName,
        description: 'Category description',
        cafe: { id: cafeId }
      });
      setCategories([...categories, res.data]);
      if (!activeCategoryTab) {
        setActiveCategoryTab(res.data.name);
      }
      toast.success('Category created!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create category.');
    }
  }

  async function handleSaveCategory(cat: CategoryItem, field: 'name' | 'description', value: string) {
    if (!cafeId) return;
    if (field === 'name' && !value.trim()) {
      return toast.error('Category name cannot be empty.');
    }

    try {
      const payload = {
        id: Number(cat.id),
        name: field === 'name' ? value.trim() : cat.name,
        description: field === 'description' ? value.trim() : cat.description,
        cafe: { id: cafeId }
      };
      const res = await api.put<CategoryItem>(`/menu/categories/${cat.id}`, payload);
      setCategories(prev => prev.map(c => c.id === cat.id ? res.data : c));
      if (field === 'name') {
        if (activeCategoryTab === cat.name) {
          setActiveCategoryTab(res.data.name);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update category.');
    }
  }

  async function handleDeleteCategory(catId: string) {
    if (!confirm('Are you sure you want to delete this category? All its items will be uncategorized.')) return;
    try {
      await api.delete(`/menu/categories/${catId}`);
      setCategories(prev => prev.filter(c => c.id !== catId));
      setDishes(prev => prev.map(d => d.category?.id.toString() === catId ? { ...d, category: null } : d));
      toast.success('Category deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete category.');
    }
  }

  // Dish Actions
  function handleAddDraftDish(catId: string) {
    if (!cafeId) return;
    const cat = categories.find(c => c.id === catId);
    const draftId = 'draft_' + Math.random().toString(36).substring(2, 9);
    const newDish: MenuItemData = {
      id: draftId,
      name: '',
      price: 0,
      description: '',
      veg: true,
      spicy: 0,
      imageUrl: '',
      available: true,
      popular: false,
      category: cat ? { id: Number(cat.id), name: cat.name } : null,
      isDraft: true
    };
    setDishes(prev => [...prev, newDish]);
  }

  async function handleSaveDish(dish: MenuItemData) {
    if (!cafeId) return;
    if (!dish.name.trim()) {
      return toast.error('Dish name cannot be blank.');
    }
    if (dish.price < 0) {
      return toast.error('Price cannot be negative.');
    }

    // Duplicate check in category
    const catId = dish.category?.id;
    if (catId) {
      const duplicate = dishes.some(d => 
        d.id !== dish.id && 
        d.category?.id === catId && 
        d.name.trim().toLowerCase() === dish.name.trim().toLowerCase()
      );
      if (duplicate) {
        return toast.error(`Item "${dish.name}" already exists in this category.`);
      }
    }

    try {
      const payload = {
        name: dish.name.trim(),
        price: dish.price,
        description: dish.description,
        veg: dish.veg,
        spicy: dish.spicy || 0,
        available: dish.available !== false,
        popular: dish.popular === true,
        cafe: { id: cafeId },
        category: catId ? { id: catId } : null
      };

      if (dish.isDraft) {
        // Create new
        const res = await api.post<any>('/menu', payload);
        const saved: MenuItemData = {
          id: res.data.id.toString(),
          name: res.data.name,
          price: res.data.price,
          description: res.data.description,
          veg: res.data.veg,
          spicy: res.data.spicy,
          imageUrl: res.data.imageUrl,
          available: res.data.available !== false,
          popular: res.data.popular === true,
          category: res.data.category ? { id: res.data.category.id, name: res.data.category.name } : null
        };
        setDishes(prev => prev.map(d => d.id === dish.id ? saved : d));
        toast.success(`Dish "${dish.name}" added successfully!`);
      } else {
        // Update existing
        const res = await api.put<any>(`/menu/${dish.id}`, payload);
        const saved: MenuItemData = {
          id: res.data.id.toString(),
          name: res.data.name,
          price: res.data.price,
          description: res.data.description,
          veg: res.data.veg,
          spicy: res.data.spicy,
          imageUrl: res.data.imageUrl,
          available: res.data.available !== false,
          popular: res.data.popular === true,
          category: res.data.category ? { id: res.data.category.id, name: res.data.category.name } : null
        };
        setDishes(prev => prev.map(d => d.id === dish.id ? saved : d));
        toast.success(`Changes to "${dish.name}" saved!`);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data || 'Failed to save dish';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to save dish');
    }
  }

  async function handleDeleteDish(dish: MenuItemData) {
    if (dish.isDraft) {
      setDishes(prev => prev.filter(d => d.id !== dish.id));
      return;
    }
    if (!confirm(`Are you sure you want to delete "${dish.name}"?`)) return;
    try {
      await api.delete(`/menu/${dish.id}`);
      setDishes(prev => prev.filter(d => d.id !== dish.id));
      toast.success('Dish deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete dish.');
    }
  }

  // Batch property updates for inline ease
  function handleLocalPropertyChange(dishId: string, field: keyof MenuItemData, value: any) {
    setDishes(prev => prev.map(d => {
      if (d.id === dishId) {
        const updated = { ...d, [field]: value };
        // Eagerly auto-save toggles to backend if it's already saved
        if (!d.isDraft && (field === 'veg' || field === 'available' || field === 'popular')) {
          handleSaveDish(updated);
        }
        return updated;
      }
      return d;
    }));
  }

  // Image Upload
  async function handleImagePick(dish: MenuItemData, files: FileList | null) {
    const file = files && files[0];
    if (!file || !cafeId) return;

    if (dish.isDraft) {
      return toast.error('Please save the dish name and price first before uploading an image.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.loading('Uploading image...', { id: 'img-upload' });
      const imgRes = await api.post<any>(`/menu/${dish.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, imageUrl: imgRes.data.imageUrl } : d));
      toast.success('Image uploaded successfully!', { id: 'img-upload' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image.', { id: 'img-upload' });
    }
  }

  // HTML5 Drag and Drop Sorting for Dishes
  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingDishId(id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!draggingDishId || draggingDishId === overId) return;

    setDishes(list => {
      const fromIndex = list.findIndex(d => d.id === draggingDishId);
      const toIndex = list.findIndex(d => d.id === overId);
      if (fromIndex === -1 || toIndex === -1) return list;

      const newList = [...list];
      const [moved] = newList.splice(fromIndex, 1);

      // Inherit the category of the item we drag over
      moved.category = newList[toIndex].category;

      newList.splice(toIndex, 0, moved);
      return newList;
    });
  }

  function handleDragEnd() {
    setDraggingDishId(null);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2-Column Board: Categories Editor (Left) & Smartphone Preview (Right) */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* Left Column: Nested Category Board */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">Interactive Board</span>
              <h2 className="text-xl font-bold text-white mt-0.5">Category Cards Builder</h2>
            </div>
            <Button 
              onClick={handleAddCategory}
              className="bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-2xl text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 bg-zinc-900/10 rounded-2xl">
              <Sparkles className="h-8 w-8 text-amber-400/50 mb-2" />
              <p className="text-xs text-zinc-400">No categories created yet. Click "Add Category" above to begin.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((cat) => {
                const catDishes = dishes.filter(d => d.category?.id.toString() === cat.id);

                return (
                  <Card key={cat.id} className="border-white/[0.08] bg-zinc-950/70 p-6 rounded-[2rem] space-y-4 backdrop-blur-md shadow-2xl">
                    {/* Category Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: val } : c));
                          }}
                          onBlur={(e) => handleSaveCategory(cat, 'name', e.target.value)}
                          placeholder="Category Name"
                          className="w-full text-base font-bold bg-transparent border-0 border-b border-transparent focus:border-amber-400 focus:outline-none text-white transition py-0.5"
                        />
                        <input
                          type="text"
                          value={cat.description || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, description: val } : c));
                          }}
                          onBlur={(e) => handleSaveCategory(cat, 'description', e.target.value)}
                          placeholder="Short category details"
                          className="w-full text-xs bg-transparent border-0 border-b border-transparent focus:border-amber-400 focus:outline-none text-zinc-400 transition"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>

                    {/* Dish rows */}
                    <div className="space-y-2">
                      {catDishes.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl text-[10px] text-zinc-500">
                          Empty category. Click "+ Add Dish" below.
                        </div>
                      ) : (
                        catDishes.map((dish) => (
                          <div
                            key={dish.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, dish.id)}
                            onDragOver={(e) => handleDragOver(e, dish.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex flex-col md:flex-row items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 hover:border-white/10 transition ${
                              draggingDishId === dish.id ? 'opacity-40' : ''
                            }`}
                          >
                            {/* Drag handle */}
                            <div className="cursor-grab p-1 text-zinc-500 hover:text-white shrink-0">
                              <Move className="h-4 w-4" />
                            </div>

                            {/* Food image picker */}
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-neutral-900 flex items-center justify-center">
                              {dish.imageUrl ? (
                                <img src={getImageUrl(dish.imageUrl)} alt={dish.name} className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-zinc-600" />
                              )}
                              <input
                                ref={el => { fileInputRefs.current[dish.id] = el; }}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImagePick(dish, e.target.files)}
                                className="hidden"
                              />
                              <button
                                onClick={() => fileInputRefs.current[dish.id]?.click()}
                                className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition"
                              >
                                Upload
                              </button>
                            </div>

                            {/* Text inputs */}
                            <div className="flex-1 min-w-[150px] space-y-1">
                              <Input
                                value={dish.name}
                                onChange={(e) => handleLocalPropertyChange(dish.id, 'name', e.target.value)}
                                placeholder="Dish name"
                                className="h-8 text-xs bg-neutral-950 border-neutral-800"
                              />
                              <Input
                                value={dish.description || ''}
                                onChange={(e) => handleLocalPropertyChange(dish.id, 'description', e.target.value)}
                                placeholder="Description (optional)"
                                className="h-7 text-[10px] bg-neutral-950 border-neutral-800"
                              />
                            </div>

                            {/* Price */}
                            <div className="w-20 shrink-0">
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-[10px] text-zinc-500">₹</span>
                                <Input
                                  type="number"
                                  value={dish.price || ''}
                                  onChange={(e) => handleLocalPropertyChange(dish.id, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="Price"
                                  className="h-8 pl-5 text-xs bg-neutral-950 border-neutral-800"
                                />
                              </div>
                            </div>

                            {/* Controls: veg, popular, available */}
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Veg Toggle */}
                              <button
                                onClick={() => handleLocalPropertyChange(dish.id, 'veg', !dish.veg)}
                                className={`h-7 px-2.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition ${
                                  dish.veg 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}
                              >
                                {dish.veg ? 'Veg' : 'N-Veg'}
                              </button>

                              {/* Popular star */}
                              <button
                                onClick={() => handleLocalPropertyChange(dish.id, 'popular', !dish.popular)}
                                className={`h-8 w-8 rounded-lg flex items-center justify-center transition border ${
                                  dish.popular 
                                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' 
                                    : 'border-white/5 text-zinc-600 hover:text-zinc-300'
                                }`}
                              >
                                <Star className="h-4.5 w-4.5 fill-current" />
                              </button>

                              {/* Availability switch */}
                              <button
                                onClick={() => handleLocalPropertyChange(dish.id, 'available', !dish.available)}
                                className={`flex items-center justify-center transition ${
                                  dish.available !== false ? 'text-amber-400' : 'text-zinc-600'
                                }`}
                              >
                                {dish.available !== false ? (
                                  <ToggleRight className="h-8 w-8" />
                                ) : (
                                  <ToggleLeft className="h-8 w-8" />
                                )}
                              </button>
                            </div>

                            {/* Actions: Save & Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleSaveDish(dish)}
                                className="h-8 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] px-2.5 font-bold"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteDish(dish)}
                                className="h-8 w-8 p-0 text-zinc-500 hover:text-rose-400 rounded-xl"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom row: Add Dish button */}
                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddDraftDish(cat.id)}
                        className="text-xs text-amber-300 hover:text-amber-400 hover:bg-white/5 rounded-xl w-full border border-dashed border-white/5 py-5"
                      >
                        <Plus className="h-4 w-4 mr-1.5" /> Add Dish inside Category
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live smartphone mockup */}
        <div className="relative shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Real-time sync</span>
              <h3 className="text-sm font-bold text-white">Live Customer Menu Preview</h3>
            </div>

            {/* Smartphone mockup frame */}
            <div className="w-[325px] h-[610px] rounded-[3.2rem] border-8 border-zinc-800 bg-zinc-950 overflow-hidden relative shadow-2xl mx-auto flex flex-col">
              
              {/* Speaker & notch */}
              <div className="absolute top-0 inset-x-0 h-5 bg-zinc-800 rounded-b-xl flex items-center justify-center z-30">
                <div className="h-1.5 w-16 bg-black rounded-full" />
              </div>

              {/* Cover photo banner */}
              <div 
                className="h-28 bg-cover bg-center shrink-0 relative"
                style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(9,9,11,0.9)), url('${cafeCover}')` }}
              >
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center text-black font-black text-xs border border-white/10 shadow-lg shrink-0">
                    {cafeName.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-none">{cafeName}</h4>
                    <p className="text-[8px] text-white/70 mt-0.5 font-medium">Digital Menu</p>
                  </div>
                </div>
              </div>

              {/* Category tabs */}
              <div className="border-b border-white/5 bg-zinc-900/60 p-2 overflow-x-auto shrink-0 flex gap-1.5 z-20">
                {categories.length === 0 ? (
                  <span className="text-[9px] text-zinc-600">No categories</span>
                ) : (
                  categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategoryTab(c.name)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition ${
                        activeCategoryTab === c.name 
                          ? 'bg-amber-400 text-black shadow-md shadow-amber-400/10' 
                          : 'text-zinc-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>

              {/* Scrollable dishes feed */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Sparkles className="h-6 w-6 text-zinc-700 mb-1" />
                    <p className="text-[9px] text-zinc-500">Board categories will sync here.</p>
                  </div>
                ) : (() => {
                  const activeCat = categories.find(c => c.name === activeCategoryTab);
                  if (!activeCat) return <p className="text-[9px] text-zinc-500 text-center">Select a category tab</p>;

                  const activeDishes = dishes.filter(d => d.category?.id.toString() === activeCat.id && d.name.trim() !== '');

                  if (activeDishes.length === 0) {
                    return (
                      <div className="text-center py-12 text-zinc-600 text-[10px]">
                        No active items in this category
                      </div>
                    );
                  }

                  return activeDishes.map((d) => (
                    <div 
                      key={d.id}
                      className={`relative border border-white/5 bg-zinc-900/40 p-2.5 rounded-xl flex items-center justify-between gap-3 ${
                        d.available === false ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Popular ribbon */}
                      {d.popular && (
                        <div className="absolute top-1 right-2 bg-amber-400/10 border border-amber-400/20 rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase text-amber-400 flex items-center gap-0.5 z-10 shrink-0">
                          ★ Popular
                        </div>
                      )}

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${d.veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <h5 className="text-[10px] font-bold text-white tracking-tight leading-tight">{d.name}</h5>
                        </div>
                        <p className="text-[8px] text-zinc-400 line-clamp-1 leading-normal">{d.description || 'No description provided'}</p>
                        <span className="text-[10px] font-extrabold text-amber-300 block pt-0.5">₹{d.price.toFixed(2)}</span>
                      </div>

                      {/* Right thumb */}
                      <div className="h-10 w-10 bg-zinc-900 border border-white/5 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                        {d.imageUrl ? (
                          <img src={getImageUrl(d.imageUrl)} alt={d.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-zinc-700" />
                        )}
                        {d.available === false && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[7px] font-black uppercase text-rose-500 tracking-wider">
                            OOS
                          </div>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Bottom bar indicator */}
              <div className="h-4 bg-zinc-900 shrink-0 flex items-center justify-center">
                <div className="h-1 w-20 bg-zinc-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
