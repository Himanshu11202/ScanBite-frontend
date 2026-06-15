'use client';

import React, { createContext, useContext } from 'react';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  designation: string;
  ownerPhoto: string;
}

export interface CafeDetails {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  totalTables: number;
  imageUrl?: string;
  coverPhotos?: string;
  ownerId: number;
}

export interface AdminContextType {
  user: UserProfile | null;
  cafe: CafeDetails | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType>({
  user: null,
  cafe: null,
  loading: true,
  refreshData: async () => {}
});

export const useAdmin = () => useContext(AdminContext);
