'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PremiumMenuBuilder } from '@/components/site/premium-menu-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  UploadCloud, Plus, Trash2, Loader2, Sparkles, 
  Cpu, AlertTriangle, CheckCircle2 
} from 'lucide-react';
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
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
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

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cafeId) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanStage('Compressing image...');
    setScanError(null);
    setScannedItems([]);
    setConfidence(null);

    // 1. Compress image before uploading
    const compressedFile = await compressImage(file);

    // Start progress intervals for UX
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        const nextProgress = prev + Math.floor(Math.random() * 8) + 3;
        
        if (nextProgress < 20) {
          setScanStage('Uploading compressed image...');
        } else if (nextProgress < 40) {
          setScanStage('Detecting menu boundaries...');
        } else if (nextProgress < 60) {
          setScanStage('Extracting categories...');
        } else if (nextProgress < 80) {
          setScanStage('Parsing items & prices...');
        } else {
          setScanStage('Building layout preview...');
        }
        return nextProgress;
      });
    }, 250);

    const formData = new FormData();
    if (simulateFailure) {
      const renamedFile = new File([compressedFile], 'fail_menu_photo.jpg', { type: compressedFile.type });
      formData.append('file', renamedFile);
    } else {
      formData.append('file', compressedFile);
    }

    try {
      const response = await api.post<any>('/menu/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStage('Extraction Complete!');
      
      setConfidence(response.data.confidence);
      setScannedItems(response.data.items);
      toast.success('Menu scanned successfully!');
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      let errMsg = 'AI extraction failed. The photo was too blurry or lacked contrast.';
      if (err.response?.data && typeof err.response.data === 'string') {
        errMsg = err.response.data;
      }
      setScanError(errMsg);
      toast.error(errMsg);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 500);
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

    // Front-end validations
    const hasNegative = validItems.some(it => it.price < 0);
    if (hasNegative) {
      toast.error('Prices cannot be negative. Please correct before saving.');
      return;
    }

    // Check duplicates inside request itself
    const keys = new Set<string>();
    let hasDuplicate = false;
    for (const item of validItems) {
      const key = (item.categoryName?.trim().toLowerCase() || 'uncategorized') + ':' + item.name.trim().toLowerCase();
      if (keys.has(key)) {
        toast.error(`Duplicate item "${item.name}" in category "${item.categoryName || 'Uncategorized'}" detected.`);
        hasDuplicate = true;
        break;
      }
      keys.add(key);
    }
    if (hasDuplicate) return;

    try {
      await api.post('/menu/batch', {
        cafeId,
        items: validItems
      });
      toast.success('AI Menu items saved to database!');
      setScannedItems([]);
      setScanError(null);
      setConfidence(null);
      // Switch tab to manual so they can view/edit/delete the newly imported items
      setActiveTab('manual');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data || 'Failed to save menu items.';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to save menu items.');
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
        /* Manual Setup: Redesigned premium nested Category Board */
        <PremiumMenuBuilder />
      ) : (
        /* AI Menu Scanner Section */
        <div className="space-y-8">
          <Card className="border-white/10 bg-neutral-950 p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.45fr_0.55fr]">
              
              {/* Scan Upload Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Upload Menu Photo</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Upload a high-quality picture of your physical menu. AI will automatically check for menus, extract headings, dish names, and pricing.
                  </p>
                </div>

                <div 
                  onClick={() => !isScanning && fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 bg-white/5 hover:bg-white/10 transition text-center ${
                    isScanning ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  }`}
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
                    <div className="space-y-4 w-full max-w-xs mx-auto">
                      <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-bold text-white">{scanStage}</p>
                        <p className="text-xs text-amber-400 font-mono">{scanProgress}%</p>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
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
                    <p className="text-xs font-semibold text-white">Simulate Non-Menu or Low Contrast</p>
                    <p className="text-[10px] text-white/50">Forces scanner to trigger detection warning.</p>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Editable Menu Preview</h3>
                    <p className="text-xs text-white/60 mt-1">
                      Review extracted items, categories, and prices before saving to the menu.
                    </p>
                  </div>

                  {confidence !== null && (
                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Confidence:</span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                        confidence >= 70 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {confidence.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {scanError && (
                  <div className="flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300 animate-fade-in">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <span className="font-semibold block mb-0.5">Menu Scan Error</span>
                      {scanError}
                    </div>
                  </div>
                )}

                {confidence !== null && confidence < 70 && (
                  <div className="flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300 animate-pulse">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <span className="font-semibold block mb-0.5">Low Contrast / Quality Warning</span>
                      Menu image quality is low. Please review extracted items.
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
                            <th className="p-3 w-24">Price (₹)</th>
                            <th className="p-3 w-28">Type</th>
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
                              <td className="p-2">
                                <Input 
                                  type="number"
                                  value={item.price} 
                                  onChange={(e) => handleFieldChange(index, 'price', parseFloat(e.target.value) || 0)} 
                                  placeholder="0.00"
                                  className="h-8 text-xs bg-neutral-950 border-neutral-800"
                                />
                              </td>
                              <td className="p-2">
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
                        className="inline-flex items-center gap-1.5 border-white/10 hover:bg-white/5 text-xs text-zinc-300"
                      >
                        <Plus className="h-4 w-4" />
                        Add Row Manually
                      </Button>
                      <Button 
                        onClick={handleSaveMenu}
                        className="inline-flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-300 font-semibold text-xs px-4"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Save To Menu
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-white/5 rounded-xl bg-black/20 p-12 text-center text-white/40">
                    <Sparkles className="h-8 w-8 mb-2 opacity-50 text-amber-400" />
                    <p className="text-xs">No scanned items yet. Upload a menu image to start extraction.</p>
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
