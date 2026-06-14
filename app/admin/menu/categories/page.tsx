'use client';

import React from 'react';
import { CategoryManager } from '@/components/site/category-manager';

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen p-6">
      <CategoryManager />
    </div>
  );
}
