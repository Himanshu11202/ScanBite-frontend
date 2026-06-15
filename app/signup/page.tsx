'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Phone, Store, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/apiClient';
import { toast } from 'sonner';

const signupSchema = z
  .object({
    restaurantName: z.string().min(2, { message: 'Enter your cafe/restaurant name' }),
    email: z.string().email({ message: 'Enter a valid email' }),
    mobileNumber: z.string().regex(/^\d{10}$/, { message: 'Enter a valid 10-digit mobile number' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().min(8, { message: 'Confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type SignupFormValues = z.infer<typeof signupSchema>;

interface RegisterResponse {
  token: string;
}

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        username: values.email,
        email: values.email,
        mobileNumber: values.mobileNumber,
        password: values.password,
        fullName: values.restaurantName,
        role: 'CAFE_ADMIN',
      });
      const token = response.data.token;
      if (token) {
        localStorage.setItem('sb_token', token);
        toast.success('Account created successfully!');
        router.push('/admin/cafe/onboarding');
      } else {
        toast.error('Registration completed, but no session token was received.');
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'Registration failed. Please try again.';
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

      {/* Centered Glassmorphic Signup Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/[0.08] bg-black/40 p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-black/80 animate-fade-in"
      >
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent inline-block mb-3">
            ScanBite
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Cafe Account</h2>
          <p className="text-sm text-zinc-400 mt-1.5 font-light">Onboard your venue and start digital table operations</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Cafe / Restaurant Name</label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="La Parisienne Bistro"
                className="pl-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                {...register('restaurantName')}
              />
            </div>
            {errors.restaurantName && <p className="text-xs text-red-400 mt-1">{errors.restaurantName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
              <Input
                type="email"
                placeholder="owner@restaurant.com"
                className="pl-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="10-digit phone number"
                className="pl-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                {...register('mobileNumber')}
              />
            </div>
            {errors.mobileNumber && <p className="text-xs text-red-400 mt-1">{errors.mobileNumber.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Password</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 bg-zinc-900/60 border-white/10 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-black font-semibold mt-4" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have a cafe?{' '}
          <Link href="/login" className="font-semibold text-amber-400 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
