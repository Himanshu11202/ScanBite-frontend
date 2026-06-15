'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/apiClient';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().refine(
    (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    },
    { message: 'Enter a valid email or 10-digit mobile number' }
  ),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
}

interface ValidateResponse {
  id: number;
  username: string;
  email: string;
  mobileNumber: string;
  roles: string[];
}

interface CafeResponse {
  id: string;
  ownerId: number;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        username: values.email,
        password: values.password,
      });
      const token = response.data.token;
      if (token) {
        localStorage.setItem('sb_token', token);
        
        // Validate token to retrieve user ID
        const valRes = await api.get<ValidateResponse>('/auth/validate', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userId = valRes.data.id;
        
        // Fetch cafes to verify if user has onboarding completed
        const cafesRes = await api.get<CafeResponse[]>('/cafes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userCafes = cafesRes.data.filter((c) => c.ownerId === userId);
        
        toast.success('Logged in successfully!');
        
        if (userCafes.length > 0) {
          router.push('/admin/dashboard');
        } else {
          router.push('/admin/cafe/onboarding');
        }
      } else {
        toast.error('Authentication succeeded, but no session token was received.');
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'Invalid credentials. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const anyErr = err as { response?: { data?: unknown } };
        if (typeof anyErr.response?.data === 'string') {
          message = anyErr.response.data;
        }
      }
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 py-12">
      {/* Background Image with elegant overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950" />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Centered Glassmorphic login card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-black/40 p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-black/80"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent inline-block mb-3">
            ScanBite
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-zinc-400 mt-1.5">Enter details to manage your luxury establishment</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Email or Mobile Number</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="you@restaurant.com or 10-digit number"
                className="pl-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Password</label>
              <Link href="#" className="text-xs text-amber-400 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                {...register('password')}
              />
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-black font-semibold mt-2" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          New to ScanBite?{' '}
          <Link href="/signup" className="font-semibold text-amber-400 hover:underline">
            Register Cafe
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
