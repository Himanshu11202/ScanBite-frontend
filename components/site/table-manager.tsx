'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Download, Plus, QrCode } from 'lucide-react';
import api from '@/services/apiClient';
import { toast } from 'sonner';

interface CafeTable {
  id: number;
  tableNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
  qrCode?: string;
  qrCodeUrl?: string;
}

interface ValidateResponse {
  id: number;
}

interface CafeResponse {
  id: number;
  ownerId: number;
}

export function TableManager() {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');

  // Load user, cafe, and tables
  useEffect(() => {
    async function loadData() {
      try {
        const valRes = await api.get<ValidateResponse>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<CafeResponse[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        if (userCafe) {
          setCafeId(userCafe.id);
          const tablesRes = await api.get<CafeTable[]>(`/tables/cafe/${userCafe.id}`);
          setTables(tablesRes.data);
        }
      } catch (err) {
        console.error('Failed to load tables:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function createTable() {
    if (!label.trim() || !cafeId) {
      return toast.error('Please specify a table label');
    }
    try {
      const payload = {
        tableNumber: label.trim(),
        cafe: { id: cafeId }
      };
      // 1. Create table in DB
      const res = await api.post<CafeTable>('/tables', payload);
      let newTable = res.data;
      
      // 2. Generate QR code for this table
      const qrRes = await api.post<{ qrImageUrl: string }>(`/tables/${newTable.id}/qr`);
      newTable = { ...newTable, qrCodeUrl: qrRes.data.qrImageUrl };
      
      setTables((s) => [newTable, ...s]);
      setLabel('');
      toast.success('Table created and QR generated!');
    } catch (err: unknown) {
      console.error(err);
      let message = 'Failed to create table';
      if (err && typeof err === 'object' && 'response' in err) {
        const anyErr = err as { response?: { data?: unknown } };
        if (typeof anyErr.response?.data === 'string') {
          message = anyErr.response.data;
        }
      }
      toast.error(message);
    }
  }

  async function deleteTable(id: number) {
    if (!confirm('Delete table?')) return;
    try {
      await api.delete(`/tables/${id}`);
      setTables((s) => s.filter((t) => t.id !== id));
      toast.success('Table deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete table');
    }
  }

  async function toggleStatus(t: CafeTable) {
    const nextSt = t.status === 'AVAILABLE' ? 'OCCUPIED' : t.status === 'OCCUPIED' ? 'RESERVED' : 'AVAILABLE';
    try {
      const res = await api.put<CafeTable>(`/tables/${t.id}/status?status=${nextSt}`);
      setTables((s) => s.map((x) => x.id === t.id ? res.data : x));
      toast.success(`Table status updated to ${nextSt}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  }

  function getFullQrUrl(path?: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://scanbite-backend.onrender.com';
    return `${backendBase}${path}`;
  }

  function getQrPayload(t: CafeTable) {
    const frontendUrl = typeof window !== 'undefined' ? window.location.origin : 'https://scanbite.vercel.app';
    return `${frontendUrl}/?cafeId=${cafeId}&tableNumber=${t.tableNumber}`;
  }

  async function downloadQr(t: CafeTable) {
    if (!t.qrCodeUrl) {
      return toast.error('QR code not generated yet.');
    }
    const url = getFullQrUrl(t.qrCodeUrl);
    try {
      const res = await api.get<Blob>(url, { responseType: 'blob' });
      const blob = res.data;
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `table-${t.tableNumber}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      toast.error('Failed to download QR.');
    }
  }

  if (loading) {
    return <div className="text-white/60 text-center py-8">Loading tables...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-amber-300">Tables</p>
          <h3 className="text-2xl font-bold text-white">QR Table Management</h3>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Input placeholder="Table label (e.g. 5)" value={label} onChange={(e) => setLabel(e.target.value)} />
            <Button onClick={createTable} className="inline-flex items-center gap-2"><Plus className="h-4 w-4"/> Create</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tables.length === 0 && <div className="col-span-full text-white/60">No tables yet. Create a table to generate QR codes.</div>}
            {tables.map((t) => (
              <Card key={t.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-white/5">
                    {t.qrCodeUrl ? (
                      <img src={getFullQrUrl(t.qrCodeUrl)} alt={`QR ${t.tableNumber}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/40"><QrCode className="h-8 w-8"/></div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">Table {t.tableNumber}</div>
                        <div className="text-[10px] text-white/40 break-all">{getQrPayload(t)}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => downloadQr(t)} title="Download QR"><Download className="h-4 w-4"/></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteTable(t.id)} title="Delete"><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.status === 'AVAILABLE' ? 'bg-emerald-600 text-emerald-50' : t.status === 'OCCUPIED' ? 'bg-rose-600 text-rose-50' : 'bg-amber-600 text-amber-900'}`}>{t.status}</div>
                        <div className="text-xs text-white/60">ID: {t.id}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => toggleStatus(t)}>Toggle status</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <aside>
          <Card className="p-4">
            <p className="text-sm text-white/60">Table listing</p>
            <div className="mt-3 divide-y divide-white/5">
              {tables.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <div className="text-sm text-white">Table {t.tableNumber}</div>
                    <div className="text-xs text-white/60">{t.status} • {t.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(t)}>Toggle</Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadQr(t)}>Download</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}
