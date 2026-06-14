'use client';

import React from 'react';
import { CartProvider } from '@/components/site/cart-context';
import { CheckoutClean } from '@/components/site/checkout-clean';

export default function CheckoutPage() {
  return (
    <CartProvider>
      <div className="min-h-screen p-4">
        <CheckoutClean />
      </div>
    </CartProvider>
  );
}
