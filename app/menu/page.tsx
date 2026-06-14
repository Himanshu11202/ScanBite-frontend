'use client';

import React from 'react';
import { CartProvider } from '@/components/site/cart-context';
import { DigitalMenu } from '@/components/site/digital-menu';

export default function MenuPage() {
  return (
    <CartProvider>
      <DigitalMenu />
    </CartProvider>
  );
}
