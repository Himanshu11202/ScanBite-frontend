import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GridMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
}

const menuItems: GridMenuItem[] = [
  { id: '1', name: 'Charred Wagyu Burger', description: 'Truffle aioli, smoked cheddar, brioche bun.', price: 18.5, category: 'Mains' },
  { id: '2', name: 'Golden Cauliflower Wings', description: 'Spicy yuzu glaze, sesame crunch.', price: 12.9, category: 'Starters' },
  { id: '3', name: 'Smoked Salmon Toast', description: 'Ricotta, capers, lemon zest.', price: 15.2, category: 'Brunch' }
];

export function MenuGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {menuItems.map((item) => (
        <Card key={item.id} className="flex flex-col justify-between gap-6 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-orange-200">{'Signature'}</p>
            <h3 className="mt-4 text-xl font-semibold text-white">{item.name}</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xl font-semibold text-white">${item.price.toFixed(2)}</p>
            <Button variant="outline">Add to cart</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
