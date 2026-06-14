import { AdminAnalytics } from '@/components/site/admin-analytics';
import { OrderTable } from '@/components/site/order-table';

export function DashboardOverview() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">Overview</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Operations at a glance</h2>
          <p className="mt-3 text-sm text-white/60">Track your menu performance, live orders, and revenue from one premium dashboard.</p>
        </div>
      </div>
      <AdminAnalytics />
      <OrderTable />
    </section>
  );
}
