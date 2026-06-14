import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const menuItems = [
  { id: '1', name: 'Charred Wagyu Burger', description: 'Truffle aioli, smoked cheddar, brioche bun.', price: 18.5 },
  { id: '2', name: 'Golden Cauliflower Wings', description: 'Spicy yuzu glaze, sesame crunch.', price: 12.9 },
  { id: '3', name: 'Smoked Salmon Toast', description: 'Ricotta, capers, lemon zest.', price: 15.2 }
];

export function MenuGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {menuItems.map((item) => (
        <Card key={item.id} className="flex flex-col justify-between gap-6 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-orange-200">{item.category ?? 'Signature'}</p>
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
