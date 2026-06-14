import Link from 'next/link';
import { customerNavigation } from '@/constants/navigation';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-white/10 bg-black/40 px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-orange-200">Customer portal</p>
            <h1 className="text-lg font-semibold">ScanBite digital menu</h1>
          </div>
          <nav className="hidden items-center gap-4 md:flex">
            {customerNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-white/70 transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
