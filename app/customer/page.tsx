import Link from 'next/link';

export default function CustomerIndexPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-24 text-center">
        <div className="rounded-[2rem] border border-white/10 bg-black/80 p-10 shadow-soft">
          <h1 className="text-4xl font-semibold text-white">Customer Experience</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">Browse the digital menu, add items to your cart, and complete checkout with one tap.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/customer/menu" className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-orange-400">
              Open menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
