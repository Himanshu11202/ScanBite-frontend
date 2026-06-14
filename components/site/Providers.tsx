"use client";

import React from 'react';
import { Toaster } from 'sonner';
import { CartProvider } from './cart-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="top-right" richColors />
    </CartProvider>
  );
}
