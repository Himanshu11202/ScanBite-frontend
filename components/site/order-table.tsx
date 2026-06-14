import { Card } from '@/components/ui/card';

const orders = [
  { id: 'ORD-1039', item: 'Spicy Szechuan Ramen', table: '02', status: 'Preparing', total: '$18.50' },
  { id: 'ORD-1041', item: 'Black Truffle Pizza', table: '09', status: 'Served', total: '$22.90' },
  { id: 'ORD-1044', item: 'Citrus Avocado Salad', table: '11', status: 'Pending', total: '$12.40' }
];

export function OrderTable() {
  return (
    <Card className="overflow-hidden border-white/10">
      <div className="flex items-center justify-between px-5 py-5">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">Recent orders</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Order queue</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3 px-5 text-left text-sm text-white/70">
          <thead className="text-white/60">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Item</th>
              <th className="px-5 py-3">Table</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="bg-white/5 transition hover:bg-white/10">
                <td className="px-5 py-4 font-mono text-sm text-orange-300">{order.id}</td>
                <td className="px-5 py-4">{order.item}</td>
                <td className="px-5 py-4">{order.table}</td>
                <td className="px-5 py-4 text-white/80">{order.status}</td>
                <td className="px-5 py-4 font-semibold text-white">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
