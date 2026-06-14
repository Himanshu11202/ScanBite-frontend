import Link from 'next/link';
import { siteNavigation } from '@/constants/navigation';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/80 py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 text-sm text-white/70 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-8">
        <div>
          <p className="font-semibold text-white">ScanBite</p>
          <p className="mt-3 max-w-md text-sm text-white/60">
            Premium QR ordering and restaurant discovery designed for modern food-tech brands.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {siteNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
