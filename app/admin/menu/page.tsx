'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MenuItemManager } from '@/components/site/menu-item-manager';
import { CategoryManager } from '@/components/site/category-manager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { UploadCloud, Plus, Trash2, Loader2, Sparkles, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '@/services/apiClient';
import { toast } from 'sonner';

interface ScannedItem {
  name: string;
  price: number;
  categoryName: string;
  veg: boolean;
  description: string;
}

interface ValidateResponse {
  id: number;
}

interface CafeResponse {
  id: number;
  ownerId: number;
}

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load user and cafe details
  useEffect(() => {
    async function loadCafe() {
      try {
        const valRes = await api.get<ValidateResponse>('/auth/validate');
        const userId = valRes.data.id;
        const cafesRes = await api.get<CafeResponse[]>('/cafes');
        const userCafe = cafesRes.data.find((c) => c.ownerId === userId);
        if (userCafe) {
          setCafeId(userCafe.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCafe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cafeId) return;

    setIsScanning(true);
    setScanError(null);
    setScannedItems([]);

    const formData = new FormData();
    // To simulate failure, if simulateFailure is checked, rename file to contain "fail"
    if (simulateFailure) {
      const renamedFile = new File([file], 'fail_menu_photo.jpg', { type: file.type });
      formData.append('file', renamedFile);
    } else {
      formData.append('file', file);
    }

    try {
      const response = await api.post<ScannedItem[]>('/menu/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScannedItems(response.data);
      toast.success('Menu scanned successfully!');
    } catch (err: unknown) {
      console.error(err);
      let errMsg = 'AI extraction failed. The photo was too blurry or lacked contrast.';
      if (err && typeof err === 'object' && 'response' in err) {
        const anyErr = err as { response?: { data?: unknown } };
        if (typeof anyErr.response?.data === 'string') {
          errMsg = anyErr.response.data;
        }
      }
      setScanError(errMsg);
      toast.error('AI Scan failed. Please input items manually.');
      // Initialize with one empty row for manual entry
      setScannedItems([{ name: '', price: 0, categoryName: '', veg: true, description: '' }]);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddRow = () => {
    setScannedItems([...scannedItems, { name: '', price: 0, categoryName: '', veg: true, description: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    setScannedItems(scannedItems.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof ScannedItem, value: string | number | boolean) => {
    const updated = [...scannedItems];
    updated[index] = { ...updated[index], [field]: value } as ScannedItem;
    setScannedItems(updated);
  };

  const handleSaveMenu = async () => {
    if (!cafeId) return;
    
    // Filter out rows without a dish name
    const validItems = scannedItems.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      toast.error('Please enter at least one valid item name.');
      return;
    }

    try {
      await api.post('/menu/batch', {
        cafeId,
        items: validItems
      });
      toast.success('AI Menu items saved to database!');
      setScannedItems([]);
      setScanError(null);
      // Switch tab to manual so they can view/edit/delete the newly imported items
      setActiveTab('manual');
      // Wait a moment and trigger reload of managers
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save menu items.');
    }
  };

  return (
    <section className="space-y-10">
      {/* Header banner */}
      <div className="relative rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.15),_transparent_60%)]" />
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Menu Management</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Organize your digital menu</h1>
        <p className="mt-2 text-sm text-white/60">Configure your menu categories, dishes, and prices manually or scan a paper menu with AI.</p>

        {/* Tab Controls */}
        <div className="mt-8 flex gap-3 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition duration-200 border-b-2 px-1 ${
              activeTab === 'ai' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Create With AI (Scanner)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition duration-200 border-b-2 px-1 ${
              activeTab === 'manual' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Cpu className="h-4 w-4" />
            Add Item Manually
          </button>
        </div>
      </div>

      {activeTab === 'manual' ? (
        /* Manual Setup: Original Components */
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <MenuItemManager />
          </div>
          <div className="border-t border-white/10 pt-8 lg:border-t-0 lg:border-l lg:border-white/10 lg:pl-8 lg:pt-0">
            <CategoryManager />
          </div>
        </div>
      ) : (
        /* AI Menu Scanner Section */
        <div className="space-y-8">
          <Card className="border-white/10 bg-neutral-950 p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
              {/* Scan Upload Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Upload Menu Photo</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Upload a high-quality picture of your physical menu. AI will automatically extract categories, dish names, descriptions, and pricing.
                  </p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 bg-white/5 hover:bg-white/10 transition cursor-pointer text-center"
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    disabled={isScanning}
                  />
                  {isScanning ? (
                    <div className="space-y-3">
                      <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
                      <p className="text-sm font-medium text-white">Extracting menu details...</p>
                      <p className="text-xs text-white/50">Calling simulated Gemini API</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <UploadCloud className="h-10 w-10 text-white/40 mx-auto" />
                      <p className="text-sm font-medium text-white">Click or drag image to upload</p>
                      <p className="text-xs text-white/50">PNG, JPG, or WEBP up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* Simulate failure toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-xs font-semibold text-white">Simulate AI Scan Failure</p>
                    <p className="text-[10px] text-white/50">Force the scanner to trigger error state.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={simulateFailure} 
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-neutral-900 text-amber-400 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Preview & Edit Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Editable Menu Preview</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Review extracted items, tweak errors, or add missing details before saving.
                  </p>
                </div>

                {scanError && (
                  <div className="flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <span className="font-semibold block mb-0.5">AI Scan Alert</span>
                      {scanError} You can still manually key in menu rows in the table below.
                    </div>
                  </div>
                )}

                {scannedItems.length > 0 ? (
                  <div className="space-y-4">
                    <div className="max-h-[380px] overflow-y-auto rounded-xl border border-white/10 bg-black/40">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-white/70 font-semibold uppercase tracking-wider">
                            <th className="p-3">Dish Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scannedItems.map((item, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="p-2">
                                <Input 
                                  value={item.name} 
                                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)} 
                                  placeholder="Dish Name"
                                  className="h-8 text-xs bg-neutral-950 border-neutral-800"
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  value={item.categoryName} 
                                  onChange={(e) => handleFieldChange(index, 'categoryName', e.target.value)} 
                                  placeholder="e.g. Starters"
                                  className="h-8 text-xs bg-neutral-950 border-neutral-800"
                                />
                              </td>
                              <td className="p-2 w-24">
                                <Input 
                                  type="number"
                                  value={item.price} 
                                  onChange={(e) => handleFieldChange(index, 'price', parseFloat(e.target.value) || 0)} 
                                  placeholder="0.00"
                                  className="h-8 text-xs bg-neutral-950 border-neutral-800"
                                />
                              </td>
                              <td className="p-2 w-28">
                                <select
                                  value={item.veg ? 'veg' : 'nonveg'}
                                  onChange={(e) => handleFieldChange(index, 'veg', e.target.value === 'veg')}
                                  className="h-8 w-full rounded-md border border-neutral-800 bg-neutral-950 px-2 text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                >
                                  <option value="veg">Veg</option>
                                  <option value="nonveg">Non-Veg</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <Input 
                                  value={item.description} 
                                  onChange={(e) => handleFieldChange(index, 'description', e.target.value)} 
                                  placeholder="Short desc"
                                  className="h-8 text-xs bg-neutral-950 border-neutral-800"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveRow(index)}
                                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-1.5 border-white/10 hover:bg-white/5"
                      >
                        <Plus className="h-4 w-4" />
                        Add Row Manually
                      </Button>
                      <Button 
                        onClick={handleSaveMenu}
                        className="inline-flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-300 font-semibold"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Save Menu Items
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-white/5 rounded-xl bg-black/20 p-12 text-center text-white/40">
                    <Sparkles className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-xs">No scanned items yet. Upload a menu image to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
