'use client';

import { TableManager } from '@/components/site/table-manager';

export default function AdminQRPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-300">QR Management</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Create and manage table codes</h1>
      </div>
      <TableManager />
    </section>
  );
}
