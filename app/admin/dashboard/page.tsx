'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/components/site/admin-context';
import { AdminAnalytics } from '@/components/site/admin-analytics';
import { OrderTable } from '@/components/site/order-table';
import api from '@/services/apiClient';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderEntity {
  id: number;
  customerName?: string;
  customerPhone?: string;
  status: string;
  paid: boolean;
  subtotal: number;
  total: number;
  createdAt: string;
  table?: {
    id: number;
    tableNumber: string;
  };
  items: OrderItem[];
}

export default function AdminDashboardPage() {
  const { cafe, user } = useAdmin();
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
  
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${backendBase}${url}`;
  };

  useEffect(() => {
    if (!cafe) return;
    
    const fetchOrders = async () => {
      try {
        const res = await api.get<OrderEntity[]>(`/orders?cafeId=${cafe.id}`);
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load dashboard orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [cafe]);

  if (!cafe) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  // Parse cover photos
  const coverUrls = cafe.coverPhotos
    ? cafe.coverPhotos.split(',').map(url => url.trim()).filter(url => url !== '')
    : [];

  const mainCover = coverUrls.length > 0 ? getImageUrl(coverUrls[0]) : null;
  const cafeLogo = cafe.imageUrl ? getImageUrl(cafe.imageUrl) : null;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Dynamic Personalized Brand Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-8 md:p-12 shadow-2xl bg-zinc-950">
        
        {/* Dynamic Cover Image Background */}
        {mainCover ? (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('${mainCover}')` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 opacity-30" />
        )}
        
        {/* Luxury dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />

        {/* Content layout */}
        <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
          
          {/* Cafe Brand Logo */}
          {cafeLogo ? (
            <img 
              src={cafeLogo} 
              alt={cafe.name} 
              className="h-24 w-24 rounded-full object-cover border-2 border-amber-400/40 shadow-2xl shrink-0" 
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-3xl font-black shrink-0">
              {cafe.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* Welcome and Cafe name details */}
          <div className="text-center md:text-left space-y-2">
            <span className="inline-flex rounded-full bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              Welcome back, {user?.fullName || 'Proprietor'}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              {cafe.name}
            </h1>
            <p className="text-sm text-zinc-300 max-w-xl font-light line-clamp-2 leading-relaxed">
              {cafe.description || 'Welcome to your premium cafe control room. Manage menus, tables, and track live order flow.'}
            </p>
            
            {/* Quick Metadata Bar */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-zinc-400 pt-2 font-medium">
              <span className="flex items-center gap-1">📍 {cafe.address}</span>
              <span className="flex items-center gap-1">📞 {cafe.phone}</span>
              <span className="flex items-center gap-1">⏰ {cafe.openingTime} - {cafe.closingTime}</span>
              <span className="flex items-center gap-1">🪑 {cafe.totalTables} Dining Tables</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Analytics Section */}
      {loadingOrders ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-zinc-900/40 border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : (
        <AdminAnalytics orders={orders} totalTables={cafe.totalTables} />
      )}

      {/* 3. Live Order Queue table */}
      {loadingOrders ? (
        <div className="h-80 rounded-2xl bg-zinc-900/40 border border-white/[0.05] animate-pulse" />
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  );
}
