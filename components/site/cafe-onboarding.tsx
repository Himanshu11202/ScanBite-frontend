'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/apiClient';
import { toast } from 'sonner';

const cafeSchema = z.object({
  cafeName: z.string().min(2, 'Enter cafe name'),
  address: z.string().min(5, 'Enter address'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  openingTime: z.string().min(2, 'Enter opening time'),
  closingTime: z.string().min(2, 'Enter closing time'),
  totalTables: z.string().regex(/^\d+$/, 'Enter number of tables'),
  description: z.string().min(5, 'Enter description')
});

type CafeForm = z.infer<typeof cafeSchema>;

export function CafeOnboarding() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CafeForm>({ resolver: zodResolver(cafeSchema) });

  const [logo, setLogo] = useState<File | null>(null);
  const [covers, setCovers] = useState<File[]>([]);
  const logoRef = useRef<HTMLInputElement | null>(null);
  const coversRef = useRef<HTMLInputElement | null>(null);

  const onDropCovers = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setCovers((p) => [...p, ...arr].slice(0, 6));
  };

  const onDropLogo = (fileList: FileList | null) => {
    if (!fileList) return;
    const f = fileList[0];
    if (f && f.type.startsWith('image/')) setLogo(f);
  };

  function removeCover(idx: number) {
    setCovers((p) => p.filter((_, i) => i !== idx));
  }

  function removeLogo() {
    setLogo(null);
    if (logoRef.current) logoRef.current.value = '';
  }

  const onSubmit = async (data: CafeForm) => {
    try {
      const valRes = await api.get('/auth/validate');
      const ownerId = valRes.data.id;
      const response = await api.post('/cafes', {
        name: data.cafeName,
        address: data.address,
        phone: data.phone,
        ownerId: ownerId,
        imageUrl: '/uploads/cafes/placeholder.png',
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        totalTables: parseInt(data.totalTables, 10),
        description: data.description
      });
      const cafeId = response.data.id;
      if (logo && cafeId) {
        const formData = new FormData();
        formData.append('file', logo);
        await api.post(`/cafes/${cafeId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      if (covers.length > 0 && cafeId) {
        const formData = new FormData();
        covers.forEach((c) => {
          formData.append('files', c);
        });
        await api.post(`/cafes/${cafeId}/covers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.success('Restaurant onboarding completed!');
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      const message = typeof err.response?.data === 'string' ? err.response.data : 'Onboarding failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-2xl border border-white/10 bg-black/80 p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">New cafe</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Onboard your cafe</h2>
          <p className="mt-2 text-sm text-white/60">Add basic details and images to get started.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70">Cafe name</label>
              <Input placeholder="e.g., Bluebird Cafe" {...register('cafeName')} />
              {errors.cafeName && <p className="text-sm text-rose-400">{errors.cafeName.message}</p>}
            </div>

            <div>
              <label className="text-sm text-white/70">Mobile Number</label>
              <Input placeholder="e.g. 9999999999" {...register('phone')} />
              {errors.phone && <p className="text-sm text-rose-400">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="text-sm text-white/70">Total tables</label>
              <Input placeholder="e.g., 20" {...register('totalTables')} />
              {errors.totalTables && <p className="text-sm text-rose-400">{errors.totalTables.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70">Opening Time</label>
                <Input placeholder="e.g., 09:00 AM" {...register('openingTime')} />
                {errors.openingTime && <p className="text-sm text-rose-400">{errors.openingTime.message}</p>}
              </div>
              <div>
                <label className="text-sm text-white/70">Closing Time</label>
                <Input placeholder="e.g., 10:00 PM" {...register('closingTime')} />
                {errors.closingTime && <p className="text-sm text-rose-400">{errors.closingTime.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70">Address</label>
              <Input placeholder="Full address" {...register('address')} />
              {errors.address && <p className="text-sm text-rose-400">{errors.address.message}</p>}
            </div>

            <div>
              <label className="text-sm text-white/70">Description</label>
              <textarea 
                placeholder="Tell us about your restaurant..." 
                {...register('description')}
                className="w-full rounded-md bg-transparent border border-neutral-800 p-2 text-sm text-white/85 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={2}
              />
              {errors.description && <p className="text-sm text-rose-400">{errors.description.message}</p>}
            </div>

            <div>
              <label className="text-sm text-white/70">Logo</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropLogo(e.dataTransfer.files);
                }}
                className="relative flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <input ref={logoRef} onChange={(e) => onDropLogo(e.target.files)} accept="image/*" type="file" className="hidden" />
                <div className="flex items-center gap-3">
                  {logo ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white/5">
                      <img src={URL.createObjectURL(logo)} alt="logo" className="h-full w-full object-cover" />
                      <button type="button" onClick={removeLogo} className="absolute right-1 top-1 rounded-full bg-white/10 p-1 text-white/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-white/60">Logo</div>
                  )}

                  <div>
                    <div className="mb-1 text-sm text-white/60">Drag & drop logo or click</div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => logoRef.current?.click()}>Upload</Button>
                      <Button type="button" onClick={() => { setLogo(null); if (logoRef.current) logoRef.current.value = ''; }}>Remove</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Cover images</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropCovers(e.dataTransfer.files);
                }}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <input ref={coversRef} onChange={(e) => onDropCovers(e.target.files)} accept="image/*" multiple type="file" className="hidden" />
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm text-white/60">Drag & drop up to 6 images</div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => coversRef.current?.click()}>Upload</Button>
                    <Button type="button" onClick={() => setCovers([])}>Clear</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {covers.length === 0 && <div className="col-span-full text-sm text-white/60">No images yet</div>}
                  {covers.map((c, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="relative overflow-hidden rounded-lg">
                      <img src={URL.createObjectURL(c)} alt={`cover-${idx}`} className="h-28 w-full object-cover" />
                      <button type="button" onClick={() => removeCover(idx)} className="absolute right-2 top-2 rounded-full bg-white/10 p-1 text-white/80">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 mt-2 flex justify-end">
            <Button type="submit" className="w-full max-w-xs" disabled={isSubmitting}>Save & Continue</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
