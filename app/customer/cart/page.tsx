import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const cartItems = [
  { id: '1', name: 'Charred Wagyu Burger', price: '$18.50', quantity: 1 },
  { id: '2', name: 'Miso Glazed Salmon', price: '$21.90', quantity: 1 }
];

export default function CustomerCartPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-300">Cart</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Your order basket</h1>
      </div>
      <Card className="space-y-6 p-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-sm text-white/60">Quantity: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-6 text-right">
              <p className="text-lg font-semibold text-white">{item.price}</p>
            </div>
          </div>
        ))}
        <div className="flex flex-col items-end gap-4 border-t border-white/10 pt-6 text-white/80 md:flex-row md:justify-between md:items-center">
          <div>
            <p className="text-sm">Estimated total</p>
            <p className="mt-1 text-3xl font-semibold text-white">$40.40</p>
          </div>
          <Button className="w-full md:w-auto">Proceed to checkout</Button>
        </div>
      </Card>
    </section>
  );
}
