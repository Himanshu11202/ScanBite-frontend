import Link from 'next/link';

export default function AdminIndexPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-24 text-center">
        <div className="rounded-[2rem] border border-white/10 bg-black/80 p-10 shadow-soft">
          <h1 className="text-4xl font-semibold text-white">Admin Portal</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">Select a section from the sidebar to manage cafes, menus, orders, and billing.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/admin/dashboard" className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-orange-400">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
