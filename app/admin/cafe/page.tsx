'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/apiClient';
import { Plus, MapPin, Phone } from 'lucide-react';

interface CafeItem {
  id: number;
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
  ownerId: number;
}

export default function AdminCafePage() {
  const [cafes, setCafes] = useState<CafeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const valRes = await api.get('/auth/validate');
        const userId = valRes.data.id;
        const res = await api.get('/cafes');
        const list = res.data.filter((c: any) => c.ownerId === userId);
        setCafes(list);
      } catch (e) {
        console.error('Failed to load cafes:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-orange-300">Cafe Management</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Manage your restaurant locations</h1>
        </div>
        <Link href="/admin/cafe/onboarding">
          <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black">
            <Plus className="h-5 w-5" /> Add Location
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-white/60">Loading cafes...</div>
      ) : cafes.length === 0 ? (
        <Card className="p-8 text-center text-white/50">
          <p className="mb-4">No cafes onboarded yet. Create your first location to get started!</p>
          <Link href="/admin/cafe/onboarding">
            <Button>Onboard Cafe</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {cafes.map((cafe) => (
            <Card key={cafe.id} className="p-6 overflow-hidden relative">
              <div className="h-40 -mx-6 -mt-6 bg-cover bg-center mb-4 bg-white/5" style={cafe.imageUrl ? { backgroundImage: `url('${cafe.imageUrl}')` } : {}} />
              <p className="text-xs uppercase tracking-[0.22em] text-orange-200">ID: {cafe.id}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{cafe.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/70"><MapPin className="h-4 w-4 text-orange-400"/> {cafe.address}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/70"><Phone className="h-4 w-4 text-orange-400"/> {cafe.phone}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
