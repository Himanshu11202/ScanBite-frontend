import { MenuGrid } from '@/features/menu/menu-grid';

export default function CustomerMenuPage() {
  return (
    <section className="space-y-10">
      <div className="rounded-[2rem] border border-white/10 bg-black/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-orange-300">Digital menu</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Scan, browse, and order from your table.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
          Explore the restaurant menu with a premium mobile-first ordering experience built for food lovers.
        </p>
      </div>
      <MenuGrid />
    </section>
  );
}
