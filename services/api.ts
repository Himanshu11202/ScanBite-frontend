export async function fetchDashboardStats() {
  return Promise.resolve({
    visitors: '15.8k',
    orders: '842',
    revenue: '₹26.4k',
    ratings: '4.9/5'
  });
}

export async function fetchMenuItems() {
  return Promise.resolve([]);
}
