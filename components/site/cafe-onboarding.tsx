'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, UploadCloud, Store, User, Clock, MapPin, Sparkles, ChefHat, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/apiClient';
import { toast } from 'sonner';

const onboardingSchema = z.object({
  // Step 1: Cafe details
  cafeName: z.string().min(2, 'Enter your cafe name'),
  address: z.string().min(5, 'Enter your cafe address'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit cafe contact number'),
  openingTime: z.string().min(2, 'Enter opening time (e.g. 08:00 AM)'),
  closingTime: z.string().min(2, 'Enter closing time (e.g. 10:00 PM)'),
  totalTables: z.string().regex(/^\d+$/, 'Enter a valid number of tables'),
  description: z.string().min(5, 'Enter a brief description of your cafe'),

  // Step 2: Owner details
  ownerName: z.string().min(2, 'Enter owner name'),
  ownerPhone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  ownerEmail: z.string().email('Enter a valid email address'),
  designation: z.string().min(2, 'Enter designation (e.g. Owner, General Manager, Director)')
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface ValidateResponse {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  designation?: string;
  ownerPhoto?: string;
}

interface CafeResponse {
  id: number;
}

export function CafeOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [covers, setCovers] = useState<File[]>([]);
  const [coverPreviews, setCoverPreviews] = useState<string[]>([]);

  const [ownerPhoto, setOwnerPhoto] = useState<File | null>(null);
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState<string | null>(null);

  // Upload progress states (0 to 100)
  const [logoProgress, setLogoProgress] = useState(0);
  const [coversProgress, setCoversProgress] = useState(0);
  const [ownerPhotoProgress, setOwnerPhotoProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const logoRef = useRef<HTMLInputElement | null>(null);
  const coversRef = useRef<HTMLInputElement | null>(null);
  const ownerPhotoRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      designation: 'Owner'
    }
  });

  // Prefill owner details from the logged in user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('sb_token');
        if (!token) return;
        const res = await api.get<ValidateResponse>('/auth/validate');
        if (res.data) {
          setValue('ownerName', res.data.fullName || '');
          setValue('ownerEmail', res.data.email || '');
          setValue('ownerPhone', res.data.mobileNumber || '');
          if (res.data.designation) {
            setValue('designation', res.data.designation);
          }
        }
      } catch (err) {
        console.error('Failed to prefill owner profile onboarding details:', err);
      }
    };
    fetchUserData();
  }, [setValue]);

  // Handle Logo selection
  const handleLogoChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      setLogo(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  // Handle Cover selection
  const handleCoversChange = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const combinedFiles = [...covers, ...validFiles].slice(0, 6);
    setCovers(combinedFiles);
    
    // Generate previews
    const previews = combinedFiles.map(f => URL.createObjectURL(f));
    setCoverPreviews(previews);
  };

  // Handle Owner Photo selection
  const handleOwnerPhotoChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      setOwnerPhoto(file);
      const url = URL.createObjectURL(file);
      setOwnerPhotoPreview(url);
    }
  };

  // Step navigation validation
  const handleNextStep = async () => {
    const fieldsToValidate = [
      'cafeName',
      'address',
      'phone',
      'openingTime',
      'closingTime',
      'totalTables',
      'description'
    ] as const;

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
    } else {
      toast.error('Please resolve validation errors in Step 1 before proceeding.');
    }
  };

  // API submit flow
  const onSubmit = async (data: OnboardingFormValues) => {
    setIsUploading(true);
    try {
      // 1. Validate owner session
      const valRes = await api.get<ValidateResponse>('/auth/validate');
      const ownerId = valRes.data.id;

      // 2. Create the cafe record
      const cafeResponse = await api.post<CafeResponse>('/cafes', {
        name: data.cafeName,
        address: data.address,
        phone: data.phone,
        ownerId: ownerId,
        imageUrl: '/uploads/cafes/placeholder.png', // Fallback URL
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        totalTables: parseInt(data.totalTables, 10),
        description: data.description
      });
      const cafeId = cafeResponse.data.id;

      // 3. Update the owner profile metadata (designation, name, phone, etc.)
      await api.put('/auth/profile', {
        fullName: data.ownerName,
        email: data.ownerEmail,
        mobileNumber: data.ownerPhone,
        designation: data.designation
      });

      // 4. Fire off file uploads in parallel
      const uploadPromises: Promise<any>[] = [];

      // Helper function to handle Axios upload progress
      const uploadWithProgress = (url: string, file: File, fieldName: string, setProgress: (progress: number) => void) => {
        const formData = new FormData();
        formData.append(fieldName, file);
        return api.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const completed = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
            setProgress(completed);
          }
        });
      };

      // Handle logo upload
      if (logo) {
        uploadPromises.push(
          uploadWithProgress(`/cafes/${cafeId}/image`, logo, 'file', setLogoProgress)
        );
      } else {
        setLogoProgress(100);
      }

      // Handle covers upload
      if (covers.length > 0) {
        const coversFormData = new FormData();
        covers.forEach(f => coversFormData.append('files', f));
        uploadPromises.push(
          api.post(`/cafes/${cafeId}/covers`, coversFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const completed = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
              setCoversProgress(completed);
            }
          })
        );
      } else {
        setCoversProgress(100);
      }

      // Handle owner profile photo upload
      if (ownerPhoto) {
        uploadPromises.push(
          uploadWithProgress('/auth/profile/photo', ownerPhoto, 'file', setOwnerPhotoProgress)
        );
      } else {
        setOwnerPhotoProgress(100);
      }

      // Resolve all image uploads in parallel
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      toast.success('Luxury Cafe and Owner Onboarding completed successfully!');
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      console.error('Onboarding flow error:', err);
      let errMsg = 'Failed to save onboarding configuration. Please check network speed and image size.';
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = err as { response?: { data?: unknown } };
        if (typeof resErr.response?.data === 'string') {
          errMsg = resErr.response.data;
        } else if (resErr.response?.data && typeof resErr.response.data === 'object' && 'error' in resErr.response.data) {
          errMsg = String((resErr.response.data as { error: unknown }).error);
        }
      }
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Step Tracker Indicator */}
      <div className="mb-10 flex items-center justify-between max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 font-bold ${
            step >= 1 ? 'border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-400/25' : 'border-zinc-800 bg-zinc-950 text-zinc-500'
          }`}>
            {step > 1 ? <Check className="h-5 w-5" /> : '1'}
          </div>
          <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${step === 1 ? 'text-amber-400' : 'text-zinc-500'}`}>Cafe Details</span>
        </div>
        
        <div className="flex-1 h-0.5 mx-4 bg-zinc-800 relative">
          <div className={`absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`} />
        </div>

        <div className="flex flex-col items-center">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 font-bold ${
            step === 2 ? 'border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-400/25' : 'border-zinc-800 bg-zinc-950 text-zinc-500'
          }`}>
            2
          </div>
          <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${step === 2 ? 'text-amber-400' : 'text-zinc-500'}`}>Owner Profile</span>
        </div>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl shadow-2xl p-6 md:p-10">
        
        {/* Decorative Lighting */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

        <div className="mb-8 border-b border-white/5 pb-6">
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
            Step {step} of 2
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {step === 1 ? 'Establishment Details' : 'Owner & Executive Profile'}
          </h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            {step === 1 
              ? 'Provide core operating parameters, address details, logo branding, and gallery cover photos.' 
              : 'Complete your executive administrator settings. Upload your headshot photo to personalize your dashboard header.'}
          </p>
        </div>

        {/* Upload Process Modal Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
            >
              <ChefHat className="h-12 w-12 text-amber-400 animate-bounce mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Publishing Onboarding Profile</h3>
              <p className="text-zinc-400 text-sm max-w-sm mb-8">Please stand by while we sync details and upload files to the Render production server...</p>
              
              <div className="w-full max-w-md space-y-4 text-left">
                {/* Logo upload progress */}
                {logo && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-zinc-300">
                      <span>Cafe Brand Logo</span>
                      <span>{logoProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${logoProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Covers upload progress */}
                {covers.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-zinc-300">
                      <span>Cover Images ({covers.length} files)</span>
                      <span>{coversProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${coversProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Owner photo upload progress */}
                {ownerPhoto && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-zinc-300">
                      <span>Owner Executive Photo</span>
                      <span>{ownerPhotoProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${ownerPhotoProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* STEP 1: CAFE DETAILS */}
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Cafe Name</label>
                  <Input 
                    placeholder="e.g., Le Parisienne Gourmet" 
                    className="bg-zinc-900/40 border-white/10 text-white placeholder:text-zinc-650 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                    {...register('cafeName')} 
                  />
                  {errors.cafeName && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.cafeName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Cafe Phone</label>
                  <Input 
                    placeholder="e.g., 9876543210" 
                    className="bg-zinc-900/40 border-white/10 text-white placeholder:text-zinc-650 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                    {...register('phone')} 
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Total Dining Tables</label>
                  <Input 
                    placeholder="e.g., 24" 
                    className="bg-zinc-900/40 border-white/10 text-white placeholder:text-zinc-650 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                    {...register('totalTables')} 
                  />
                  {errors.totalTables && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.totalTables.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Opening Time</label>
                    <Input 
                      placeholder="e.g., 08:00 AM" 
                      className="bg-zinc-900/40 border-white/10 text-white placeholder:text-zinc-650 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                      {...register('openingTime')} 
                    />
                    {errors.openingTime && <p className="text-xs text-red-400 mt-1">{errors.openingTime.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Closing Time</label>
                    <Input 
                      placeholder="e.g., 11:00 PM" 
                      className="bg-zinc-900/40 border-white/10 text-white placeholder:text-zinc-650 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                      {...register('closingTime')} 
                    />
                    {errors.closingTime && <p className="text-xs text-red-400 mt-1">{errors.closingTime.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Street Address</label>
                  <Input 
                    placeholder="e.g., 5th Avenue, Suite 100, New York" 
                    className="bg-zinc-900/40 border-white/10 text-white placeholder:text-zinc-650 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                    {...register('address')} 
                  />
                  {errors.address && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.address.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Establishment Bio</label>
                  <textarea 
                    placeholder="Describe your bistro experience, specialty cuisine, and atmosphere..." 
                    {...register('description')}
                    className="w-full rounded-md bg-zinc-900/40 border border-white/10 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                    rows={3}
                  />
                  {errors.description && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.description.message}</p>}
                </div>

                {/* LOGO DRAG-AND-DROP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Cafe Brand Logo</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleLogoChange(e.dataTransfer.files);
                    }}
                    className="relative flex items-center gap-4 rounded-xl border border-dashed border-white/15 bg-zinc-900/20 p-4 transition hover:border-amber-500/40"
                  >
                    <input 
                      ref={logoRef} 
                      onChange={(e) => handleLogoChange(e.target.files)} 
                      accept="image/*" 
                      type="file" 
                      className="hidden" 
                    />
                    
                    {logoPreview ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-zinc-900 border border-white/10 shrink-0">
                        <img src={logoPreview} alt="Brand Logo Preview" className="h-full w-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => { setLogo(null); setLogoPreview(null); }} 
                          className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white/80 hover:bg-black"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => logoRef.current?.click()}
                        className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 text-zinc-500 border border-white/5 hover:bg-zinc-800 hover:text-zinc-400 transition"
                      >
                        <UploadCloud className="h-6 w-6" />
                      </div>
                    )}

                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Upload Brand Logo</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Drag and drop or <span onClick={() => logoRef.current?.click()} className="text-amber-400 cursor-pointer hover:underline text-xs">browse</span></p>
                    </div>
                  </div>
                </div>

                {/* COVERS DRAG-AND-DROP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Cafe Cover Photos (Up to 6)</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleCoversChange(e.dataTransfer.files);
                    }}
                    className="rounded-xl border border-dashed border-white/15 bg-zinc-900/20 p-4 transition hover:border-amber-500/40"
                  >
                    <input 
                      ref={coversRef} 
                      onChange={(e) => handleCoversChange(e.target.files)} 
                      accept="image/*" 
                      multiple 
                      type="file" 
                      className="hidden" 
                    />
                    
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs text-zinc-400">Add vibrant images of the venue and signature dishes</p>
                      <button 
                        type="button" 
                        onClick={() => coversRef.current?.click()} 
                        className="text-xs font-semibold text-amber-400 hover:underline"
                      >
                        Select Files
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {coverPreviews.map((url, idx) => (
                        <div key={idx} className="relative h-20 w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                          <img src={url} alt={`Cover Preview ${idx + 1}`} className="h-full w-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newCovers = covers.filter((_, i) => i !== idx);
                              const newPreviews = coverPreviews.filter((_, i) => i !== idx);
                              setCovers(newCovers);
                              setCoverPreviews(newPreviews);
                            }} 
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white/80 hover:bg-black"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      {covers.length < 6 && (
                        <div 
                          onClick={() => coversRef.current?.click()}
                          className="flex h-20 items-center justify-center rounded-lg border border-dashed border-white/5 bg-zinc-900/40 hover:bg-zinc-900 cursor-pointer text-zinc-650 hover:text-zinc-400 transition"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end mt-4">
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  className="h-12 px-8 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-black font-semibold shadow-lg shadow-amber-400/25"
                >
                  Save & Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: OWNER PROFILE DETAILS */}
          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Executive Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                    <Input 
                      placeholder="e.g. Jean-Luc Picard" 
                      className="pl-11 bg-zinc-900/40 border-white/10 text-white focus:border-amber-500/50"
                      {...register('ownerName')} 
                    />
                  </div>
                  {errors.ownerName && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.ownerName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Corporate Position / Designation</label>
                  <Input 
                    placeholder="e.g., Managing Partner, Proprietor, General Manager" 
                    className="bg-zinc-900/40 border-white/10 text-white focus:border-amber-500/50"
                    {...register('designation')} 
                  />
                  {errors.designation && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.designation.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Mobile Number</label>
                  <Input 
                    placeholder="e.g., 9999888877" 
                    className="bg-zinc-900/40 border-white/10 text-white focus:border-amber-500/50"
                    {...register('ownerPhone')} 
                  />
                  {errors.ownerPhone && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.ownerPhone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Corporate Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="e.g. executive@yourcafe.com" 
                    className="bg-zinc-900/40 border-white/10 text-white focus:border-amber-500/50"
                    {...register('ownerEmail')} 
                  />
                  {errors.ownerEmail && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.ownerEmail.message}</p>}
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                {/* OWNER PHOTO DRAG-AND-DROP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Owner Profile Photo</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleOwnerPhotoChange(e.dataTransfer.files);
                    }}
                    className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-900/20 p-8 text-center transition hover:border-amber-500/40"
                  >
                    <input 
                      ref={ownerPhotoRef} 
                      onChange={(e) => handleOwnerPhotoChange(e.target.files)} 
                      accept="image/*" 
                      type="file" 
                      className="hidden" 
                    />
                    
                    {ownerPhotoPreview ? (
                      <div className="relative h-28 w-28 overflow-hidden rounded-full border border-amber-500/30 bg-zinc-900 mb-3 shadow-lg shadow-amber-500/10">
                        <img src={ownerPhotoPreview} alt="Owner Preview" className="h-full w-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => { setOwnerPhoto(null); setOwnerPhotoPreview(null); }} 
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white/80 hover:bg-black"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => ownerPhotoRef.current?.click()}
                        className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-zinc-650 border border-white/5 hover:bg-zinc-800 hover:text-zinc-500 transition mb-3"
                      >
                        <User className="h-12 w-12" />
                      </div>
                    )}

                    <p className="text-sm font-semibold text-white">Upload Headshot Photo</p>
                    <p className="text-xs text-zinc-500 mt-1">Used in the header of the admin panel. Drag & drop or <span onClick={() => ownerPhotoRef.current?.click()} className="text-amber-400 cursor-pointer hover:underline text-xs">browse</span></p>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="flex gap-4 mt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12 w-1/3 border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-12 w-2/3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-black font-semibold shadow-lg shadow-amber-400/25"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Syncing...' : 'Complete Onboarding'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

        </form>
      </div>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
