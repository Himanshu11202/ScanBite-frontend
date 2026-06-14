export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export type AnalyticsStat = {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paid: boolean;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  customer?: {
    name: string;
    phone: string;
    table: string;
  };
};

export type TableStatus = 'available' | 'occupied' | 'reserved';

export type Table = {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
};

export type Cafe = {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  totalTables: number;
  isActive: boolean;
};

export type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type Testimonial = {
  name: string;
  role: string;
  restaurant: string;
  avatar: string;
  content: string;
  rating: number;
};
