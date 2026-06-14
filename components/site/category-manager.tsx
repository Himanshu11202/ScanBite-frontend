'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3, Trash2, Plus, Move } from 'lucide-react';
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
  id: string;
  name: string;
  description?: string;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Load user, cafe and categories
  useEffect(() => {
    async function loadData() {
      try {
        const valRes = await api.get<ValidateResponse>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<CafeResponse[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        if (userCafe) {
          setCafeId(userCafe.id);
          const catsRes = await api.get<CategoryItem[]>(`/menu/categories/cafe/${userCafe.id}`);
          setCategories(catsRes.data);
        } else {
          toast.error('Please onboard a cafe location first');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function startAdd() {
    setEditing({ id: '', name: '' });
    setName('');
    setDesc('');
  }

  async function saveCategory() {
    if (!name.trim() || !cafeId) return;
    try {
      if (editing && editing.id) {
        const res = await api.put<CategoryItem>(`/menu/categories/${editing.id}`, {
          id: editing.id,
          name: name.trim(),
          description: desc,
          cafe: { id: cafeId }
        });
        setCategories((c) => c.map((cat) => (cat.id === editing.id ? res.data : cat)));
        toast.success('Category updated!');
      } else {
        const res = await api.post<CategoryItem>('/menu/categories', {
          name: name.trim(),
          description: desc,
          cafe: { id: cafeId }
        });
        setCategories((c) => [res.data, ...c]);
        toast.success('Category created!');
      }
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save category');
    }
  }

  function editCategory(cat: CategoryItem) {
    setEditing(cat);
    setName(cat.name);
    setDesc(cat.description || '');
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/menu/categories/${id}`);
      setCategories((c) => c.filter((x) => x.id !== id));
      toast.success('Category deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete category');
    }
  }

  // Simple HTML5 drag and drop reorder
  function onDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    setCategories((list) => {
      const fromIndex = list.findIndex((i) => i.id === draggingId);
      const toIndex = list.findIndex((i) => i.id === overId);
      if (fromIndex === -1 || toIndex === -1) return list;
      const newList = [...list];
      const [moved] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, moved);
      return newList;
    });
  }

  function onDragEnd() {
    setDraggingId(null);
    // Here: persist order to backend
    console.log('New category order', categories.map((c) => c.name));
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Menu</p>
          <h3 className="text-2xl font-bold text-white">Categories</h3>
        </div>
        <div>
          <Button onClick={startAdd} className="inline-flex items-center gap-2"><Plus className="h-4 w-4"/> Add category</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="space-y-2">
            {categories.map((cat) => (
              <motion.div key={cat.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card
                  draggable
                  onDragStart={(e) => onDragStart(e, cat.id)}
                  onDragOver={(e) => onDragOver(e, cat.id)}
                  onDragEnd={onDragEnd}
                  className={`flex items-center justify-between gap-4 p-4 ${draggingId === cat.id ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center rounded-md bg-white/5 p-2 text-white/70"><Move className="h-4 w-4" /></div>
                    <div>
                      <div className="text-sm font-semibold text-white">{cat.name}</div>
                      {cat.description && <div className="text-xs text-white/60">{cat.description}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => editCategory(cat)} title="Edit"><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" onClick={() => deleteCategory(cat.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Category editor</p>
                <p className="text-xs text-white/50">Add or update categories and reorder by dragging.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-white/70">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />

              <label className="text-sm text-white/70">Description</label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description" />

              <div className="flex items-center gap-2">
                <Button onClick={saveCategory} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => { setEditing(null); setName(''); setDesc(''); }}>Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
