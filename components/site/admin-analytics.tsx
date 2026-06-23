'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { TrendingUp, CreditCard, Users, Clock, ChefHat } from 'lucide-react';

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
}

interface AdminAnalyticsProps {
  orders?: OrderEntity[];
  totalTables?: number;
  totalMenuItems?: number;
}

export function AdminAnalytics({ orders = [], totalTables = 10, totalMenuItems = 0 }: AdminAnalyticsProps) {
  // 1. Calculate live statistics
  const totalOrdersCount = orders.length;
  
  const totalRevenue = orders
    .filter(o => o.paid && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  // Active tables: tables that currently have active (pending, preparing) orders
  const activeTablesCount = new Set(
    orders
      .filter(o => o.status !== 'SERVED' && o.status !== 'CANCELLED' && o.table)
      .map(o => o.table?.id)
  ).size;

  const pendingBillsCount = orders.filter(o => !o.paid && o.status !== 'CANCELLED').length;

  const stats = [
    { 
      label: 'Total Orders', 
      value: totalOrdersCount.toLocaleString(), 
      change: 'Real-time sync', 
      icon: ShoppingBagIcon 
    },
    { 
      label: 'Gross Revenue', 
      value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: 'Settled payments', 
      icon: CreditCard 
    },
    { 
      label: 'Active Tables', 
      value: `${activeTablesCount} / ${totalTables}`, 
      change: `Occupancy: ${totalTables > 0 ? Math.round((activeTablesCount / totalTables) * 100) : 0}%`, 
      icon: Users 
    },
    { 
      label: 'Total Menu Items', 
      value: totalMenuItems.toString(), 
      change: 'Active menu', 
      icon: ChefHat 
    },
    { 
      label: 'Pending Settlements', 
      value: pendingBillsCount.toString(), 
      change: 'Awaiting billing', 
      icon: Clock 
    }
  ];

  // 2. Compute dynamic chart data for the last 7 days
  const getDailyRevenueData = () => {
    const dailyMap: { [key: string]: number } = {};
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dailyMap[dateString] = 0;
    }

    // Accumulate paid order values
    orders.forEach(o => {
      if (o.paid && o.status !== 'CANCELLED') {
        const orderDate = new Date(o.createdAt);
        const dateString = orderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dateString in dailyMap) {
          dailyMap[dateString] += o.total;
        }
      }
    });

    return Object.entries(dailyMap).map(([label, value]) => ({ label, value }));
  };

  const chartData = getDailyRevenueData();
  const maxRevenueVal = Math.max(...chartData.map(d => d.value), 10);

  // Construct SVG Area Chart Points
  const svgWidth = 500;
  const svgHeight = 150;
  const points = chartData.map((d, idx) => {
    const x = (idx / (chartData.length - 1)) * svgWidth;
    const y = svgHeight - (d.value / maxRevenueVal) * (svgHeight - 20); // leave padding at top
    return `${x},${y}`;
  });

  const areaPoints = `${points.length > 0 ? `0,${svgHeight} ` : ''}${points.join(' ')} ${svgWidth},${svgHeight}`;
  const pathData = points.length > 0 ? `M ${points.join(' L ')}` : '';

  return (
    <div className="space-y-6">
      {/* 5 Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Card className="relative overflow-hidden border-white/[0.08] bg-zinc-900/40 p-5 md:p-6 backdrop-blur-md h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block truncate">
                      {s.label}
                    </span>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-white truncate">
                      {s.value}
                    </h3>
                    <p className="mt-1.5 text-[10px] font-medium text-zinc-500">
                      {s.change}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5 text-amber-400 shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* 7-Day Revenue Trend */}
        <Card className="md:col-span-2 border-white/[0.08] bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Revenue Stream</span>
              <h4 className="text-lg font-bold text-white mt-1">7-Day Financial Performance</h4>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Live Sync
            </div>
          </div>

          <div className="h-44 w-full relative">
            {maxRevenueVal === 10 && orders.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500 font-medium">
                No revenue records generated in the last 7 days
              </div>
            ) : (
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="revenueGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                
                {/* Area Fill */}
                <path d={areaPoints} fill="url(#revenueGlow)" />
                
                {/* Stroke Line */}
                <path d={pathData} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-4">
            {chartData.map((d, idx) => (
              <span key={idx}>{d.label}</span>
            ))}
          </div>
        </Card>

        {/* Occupancy Card */}
        <Card className="border-white/[0.08] bg-zinc-900/40 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Capacity Metrics</span>
            <h4 className="text-lg font-bold text-white mt-1">Live Occupancy Status</h4>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">Percentage of dining tables currently hosting guests with active orders.</p>
          </div>

          <div className="my-6 space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Utilization</span>
              <span className="text-2xl font-black text-amber-400">
                {totalTables > 0 ? Math.round((activeTablesCount / totalTables) * 100) : 0}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000" 
                style={{ width: `${totalTables > 0 ? Math.min((activeTablesCount / totalTables) * 100, 100) : 0}%` }} 
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between text-xs text-zinc-500">
            <span>Occupied: <strong>{activeTablesCount}</strong></span>
            <span>Available: <strong>{Math.max(totalTables - activeTablesCount, 0)}</strong></span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
