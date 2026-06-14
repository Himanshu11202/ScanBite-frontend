import { Card } from '@/components/ui/card';
import { AnalyticsStat } from '@/types';

const stats: AnalyticsStat[] = [
  { label: 'Daily orders', value: '842', change: '+12%', trend: 'up' },
  { label: 'Revenue', value: '$26.4k', change: '+8%', trend: 'up' },
  { label: 'New cafes', value: '14', change: '+29%', trend: 'up' },
  { label: 'Average rating', value: '4.9/5', change: 'Stable', trend: 'up' }
];

export function AnalyticsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-white/10 p-6">
          <p className="text-sm text-white/60">{stat.label}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
          <p className="mt-2 text-sm text-white/50">{stat.change}</p>
        </Card>
      ))}
    </div>
  );
}
