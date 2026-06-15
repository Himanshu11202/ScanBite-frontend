export interface NavigationItem {
  label: string;
  href: string;
}

export const siteNavigation: NavigationItem[] = [];

export const adminNavigation: NavigationItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Cafe', href: '/admin/cafe' },
  { label: 'Menu', href: '/admin/menu' },
  { label: 'QR Codes', href: '/admin/qr' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Billing', href: '/admin/billing' },
  { label: 'Settings', href: '/admin/settings' }
];

export const customerNavigation: NavigationItem[] = [
  { label: 'Digital Menu', href: '/customer/menu' },
  { label: 'Cart', href: '/customer/cart' },
  { label: 'Checkout', href: '/customer/checkout' }
];
