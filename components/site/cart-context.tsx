'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface CartContextValue {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('scanbite:cart');
        return raw ? JSON.parse(raw) : [];
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try { localStorage.setItem('scanbite:cart', JSON.stringify(items)); } catch (e) {}
  }, [items]);

  const total = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);

  function addItem(item: Omit<CartItem, 'qty'>, qty = 1) {
    setItems((s) => {
      const idx = s.findIndex((x) => x.id === item.id);
      if (idx === -1) return [{ ...item, qty }, ...s];
      const copy = [...s];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
      return copy;
    });
  }

  function removeItem(id: string) { setItems((s) => s.filter((x) => x.id !== id)); }

  function setQty(id: string, qty: number) {
    setItems((s) => s.map((x) => x.id === id ? { ...x, qty } : x));
  }

  function clear() { setItems([]); }

  return (
    <CartContext.Provider value={{ items, total, addItem, removeItem, setQty, clear }}>{children}</CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
