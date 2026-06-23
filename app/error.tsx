'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Boundary Caught Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-8 md:p-12 shadow-2xl max-w-md backdrop-blur-md">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mx-auto mb-6">
          <AlertCircle className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Something Went Wrong</h2>
        <p className="mt-2 text-sm text-zinc-400 font-light leading-relaxed">
          The application encountered an unexpected error. Don't worry, your cart and session are safe.
        </p>

        {error.message && (
          <div className="mt-4 rounded-xl bg-black/40 border border-white/5 p-3 text-left">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Error Details</span>
            <p className="text-xs text-zinc-400 font-mono mt-1 break-all">{error.message}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => reset()} 
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-semibold inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'} 
            className="flex-1 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
