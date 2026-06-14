import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSettingsPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-300">Settings</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Account and restaurant settings</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-white">Business settings</h2>
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm text-white/70">Restaurant name</label>
              <Input placeholder="Eastside Bistro" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">Contact email</label>
              <Input type="email" placeholder="owner@eastside.com" />
            </div>
            <Button className="mt-3">Save changes</Button>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-white">Billing contact</h2>
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm text-white/70">Billing address</label>
              <Input placeholder="123 Modern Avenue" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">VAT ID</label>
              <Input placeholder="GB123456789" />
            </div>
            <Button variant="outline" className="mt-3">Update billing</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
