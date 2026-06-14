'use client';

import React, { useState, useEffect } from 'react';
import { DashboardOverview } from '@/features/dashboard/overview';
import api from '@/services/apiClient';

interface ValidateResponse {
  id: number;
  username: string;
}

interface CafeDetails {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  totalTables: number;
  isActive: boolean;
  ownerId: number;
  coverPhotos?: string;
  imageUrl?: string;
}

export default function AdminDashboardPage() {
  const [cafe, setCafe] = useState<CafeDetails | null>(null);

  useEffect(() => {
    async function loadCafe() {
      try {
        const valRes = await api.get<ValidateResponse>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<CafeDetails[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        if (userCafe) {
          setCafe(userCafe);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCafe();
  }, []);

  const coverUrls = cafe?.coverPhotos 
    ? cafe.coverPhotos.split(',').filter((url: string) => url.trim() !== '') 
    : [];

  return (
    <div className="space-y-10">
      {cafe && (
        <div className="space-y-6">
          {/* Main Brand Banner */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-soft bg-slate-950">
            {coverUrls.length > 0 && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-700 blur-[2px]" 
                style={{ backgroundImage: `url(http://localhost:8080${coverUrls[0]})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {cafe.imageUrl ? (
                <img 
                  src={`http://localhost:8080${cafe.imageUrl}`} 
                  alt={cafe.name} 
                  className="h-24 w-24 rounded-full object-cover border-2 border-amber-400/40 shadow-xl" 
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 text-lg font-bold">Logo</div>
              )}
              <div className="text-center md:text-left space-y-2">
                <span className="inline-flex rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Premium Venue
                </span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{cafe.name}</h1>
                <p className="text-sm text-white/70 max-w-xl">{cafe.description}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-white/50 pt-1">
                  <span>📍 {cafe.address}</span>
                  <span>📞 {cafe.phone}</span>
                  <span>⏰ {cafe.openingTime} - {cafe.closingTime}</span>
                  <span>🪑 {cafe.totalTables} Tables</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Photos Gallery */}
          {coverUrls.length > 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">Venue Cover Images Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {coverUrls.map((url: string, index: number) => (
                  <div 
                    key={index}
                    className="group relative h-28 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-lg"
                  >
                    <img 
                      src={`http://localhost:8080${url}`} 
                      alt={`Cover ${index + 1}`} 
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">View Cover</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-300">Dashboard</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">Restaurant operations overview</h2>
        <p className="mt-3 text-sm leading-7 text-white/70">Monitor orders, table performance, and billing from a single premium console.</p>
      </div>
      <DashboardOverview />
    </div>
  );
}
