'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { AnalyticsStat } from '@/types';
import { ArrowUpRight, Clock, CreditCard, Users } from 'lucide-react';

const stats: AnalyticsStat[] = [
  { label: 'Total orders', value: '12,482', change: '+6%', trend: 'up' },
  { label: 'Total revenue', value: '$124,820', change: '+8%', trend: 'up' },
  { label: 'Active tables', value: '72', change: '+3%', trend: 'up' },
  { label: 'Pending bills', value: '18', change: '-4%', trend: 'down' }
];

const recentOrders = [
  { id: 'ORD-10234', table: 'T12', items: 3, total: '$24.90', status: 'Preparing', time: '2m ago' },
  { id: 'ORD-10233', table: 'T04', items: 2, total: '$12.50', status: 'Served', time: '5m ago' },
  { id: 'ORD-10232', table: 'T07', items: 1, total: '$8.00', status: 'Pending', time: '8m ago' },
  { id: 'ORD-10231', table: 'T01', items: 4, total: '$45.20', status: 'Preparing', time: '12m ago' }
];

function Sparkline({ data, color = 'currentColor' }: { data: number[]; color?: string }) {
  const width = 120;
  const height = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = max === min ? height / 2 : height - ((d - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminAnalytics() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, idx) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
            <Card className="flex items-center justify-between gap-4 border-white/10 p-5">
              <div>
                <p className="text-sm text-white/60">{s.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{s.value}</p>
                <p className={`mt-1 text-sm ${s.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>{s.change}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="mb-2 flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-xs text-white/70">
                  <ArrowUpRight className="h-3 w-3" />
                  Live
                </div>
                <Sparkline data={[5, 8, 6, 10, 9, 12, 14]} color={s.trend === 'up' ? '#34D399' : '#FB7185'} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2 border-white/10 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-white/60">Revenue (30 days)</p>
              <p className="mt-2 text-2xl font-semibold text-white">$124,820</p>
            </div>
            <div className="text-sm text-white/60">Growth: <span className="font-semibold text-emerald-400">+8%</span></div>
          </div>

          {/* Premium chart placeholder: simple area chart using SVG */}
          <div className="h-40 w-full">
            <svg viewBox="0 0 600 200" className="h-full w-full">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M0,150 C80,100 160,120 240,80 C320,40 400,60 480,30 C560,5 600,20 600,20 L600,200 L0,200 Z" fill="url(#g1)" />
              <path d="M0,150 C80,100 160,120 240,80 C320,40 400,60 480,30 C560,5 600,20" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Card>

        <Card className="border-white/10 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-white/60">Active tables</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-white/70">
              <Users className="h-4 w-4" /> 72
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Occupancy</p>
              <p className="text-sm font-semibold text-white">78%</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-2 w-[78%] bg-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-white/60">Recent orders</p>
          <p className="text-sm text-white/50">Showing latest 10</p>
        </div>

        <div className="-mx-4 overflow-x-auto">
          <table className="w-full table-auto min-w-[640px]">
            <thead>
              <tr className="text-left text-sm text-white/60">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-white/6">
                  <td className="px-4 py-3 text-sm text-white">{o.id}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{o.table}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{o.items}</td>
                  <td className="px-4 py-3 text-sm text-white">{o.total}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                      o.status === 'Preparing' ? 'bg-amber-400/10 text-amber-300' : o.status === 'Served' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-white/70'
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
