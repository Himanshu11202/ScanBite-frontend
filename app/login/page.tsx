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

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', {
        username: values.email,
        password: values.password,
      });
      const token = response.data.token;
      if (token) {
        localStorage.setItem('sb_token', token);
        
        // Validate token to retrieve user ID
        const valRes = await api.get('/auth/validate', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userId = valRes.data.id;
        
        // Fetch cafes to verify if user has onboarding completed
        const cafesRes = await api.get('/cafes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userCafes = cafesRes.data.filter((c: any) => c.ownerId === userId);
        
        toast.success('Logged in successfully!');
        
        if (userCafes.length > 0) {
          router.push('/admin/dashboard');
        } else {
          router.push('/admin/cafe/onboarding');
        }
      } else {
        toast.error('Authentication succeeded, but no session token was received.');
      }
    } catch (err: any) {
      console.error(err);
      const message = typeof err.response?.data === 'string' ? err.response.data : 'Invalid credentials. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(255,184,28,0.2),_transparent_40%)]" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(circle_at_bottom,_rgba(96,165,250,0.16),_transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <section className="order-2 lg:order-1 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10">
            <div className="mb-8 space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Welcome back</p>
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Log in to ScanBite</h1>
              <p className="max-w-xl text-sm leading-7 text-white/65">
                Access your restaurant control panel, manage live orders, billing, and AI-driven menus from one premium dashboard.
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
              <span className="relative bg-black/5 px-4">Or continue with email</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Email or Mobile Number</label>
                <Input
                  type="text"
                  placeholder="you@restaurant.com or 10-digit number"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Password</label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                />
                {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-sm text-white/60">
                <Link href="#" className="hover:text-white">Forgot password?</Link>
                <span className="text-white/40">Secure access</span>
              </div>

              <Button type="submit" className="w-full py-4" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Continue'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
              New to ScanBite?{' '}
              <Link href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
                Create account
              </Link>
            </p>
          </section>

          <aside className="order-1 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-black/70 p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <span className="inline-flex rounded-full bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                Premium Design
              </span>
            </div>
            <div className="space-y-6">
              <div className="space-y-3 rounded-3xl border border-white/10 bg-black/50 p-5">
                <h2 className="text-xl font-semibold text-white">Glassmorphism UI</h2>
                <p className="text-sm text-white/60">
                  A premium experience with blurred layers, soft gradients, and elegant spacing for hospitality teams.
                </p>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-black/50 p-5">
                <h2 className="text-xl font-semibold text-white">Fast validation</h2>
                <p className="text-sm text-white/60">
                  Form validation built with Zod and React Hook Form ensures clear error handling and modern UX.
                </p>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-black/50 p-5">
                <h2 className="text-xl font-semibold text-white">Secure access</h2>
                <p className="text-sm text-white/60">
                  Secure login flow with encrypted credentials and social login placeholders for future integration.
                </p>
              </div>
            </div>
          </aside>
        </motion.div>
      </div>
    </div>
  );
}
