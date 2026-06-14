'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Github, Twitter } from 'lucide-react';

import { useRouter } from 'next/navigation';
import api from '@/services/apiClient';
import { toast } from 'sonner';

const signupSchema = z
  .object({
    restaurantName: z.string().min(2, { message: 'Enter your restaurant name' }),
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
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.18),_transparent_40%)]" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.16),_transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <aside className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-black/70 p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <span className="inline-flex rounded-full bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-pink-300">
                Build your brand
              </span>
            </div>
            <div className="space-y-6">
              <div className="space-y-3 rounded-3xl border border-white/10 bg-black/50 p-5">
                <h2 className="text-xl font-semibold text-white">Launch faster</h2>
                <p className="text-sm text-white/60">
                  Sign up quickly and start publishing QR menus, managing tables, and accepting orders instantly.
                </p>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-black/50 p-5">
                <h2 className="text-xl font-semibold text-white">Scale effortlessly</h2>
                <p className="text-sm text-white/60">
                  One dashboard for all locations, billing, and order flows means consistent operations across restaurants.
                </p>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-black/50 p-5">
                <h2 className="text-xl font-semibold text-white">Premium experience</h2>
                <p className="text-sm text-white/60">
                  Glassmorphism panels, subtle motion, and modern interactions deliver a luxury SaaS feel.
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10">
            <div className="mb-8 space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-pink-300">New account</p>
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Create your ScanBite account</h1>
              <p className="max-w-xl text-sm leading-7 text-white/65">
                Build your restaurant profile, manage menus, and start accepting orders with a premium digital ordering platform.
              </p>
            </div>

            <div className="space-y-4 rounded-3xl bg-black/50 p-6">
              {[
                { icon: <Globe className="h-4 w-4" />, label: 'Continue with Google' },
                { icon: <Github className="h-4 w-4" />, label: 'Continue with GitHub' },
                { icon: <Twitter className="h-4 w-4" />, label: 'Continue with Twitter' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative my-8 flex items-center justify-center text-sm text-white/40">
              <span className="absolute inset-x-0 h-px bg-white/10" />
              <span className="relative bg-black/5 px-4">Or sign up with email</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Restaurant name</label>
                <Input
                  placeholder="Your restaurant name"
                  {...register('restaurantName')}
                />
                {errors.restaurantName && <p className="text-sm text-rose-400">{errors.restaurantName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Email</label>
                <Input
                  type="email"
                  placeholder="owner@scanbite.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Mobile Number</label>
                <Input
                  type="text"
                  placeholder="10-digit mobile number"
                  {...register('mobileNumber')}
                />
                {errors.mobileNumber && <p className="text-sm text-rose-400">{errors.mobileNumber.message}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    {...register('password')}
                  />
                  {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Confirm password</label>
                  <Input
                    type="password"
                    placeholder="Repeat your password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && <p className="text-sm text-rose-400">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full py-4" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-pink-300 hover:text-pink-200">
                Log in
              </Link>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
