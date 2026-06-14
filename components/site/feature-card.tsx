import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card className="group overflow-hidden border-white/10 p-6 transition hover:-translate-y-1 hover:border-orange-400/20">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-orange-300 transition group-hover:bg-orange-500/10">
        <CheckCircle className="h-5 w-5" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm text-white/70">{description}</p>
    </Card>
  );
}
