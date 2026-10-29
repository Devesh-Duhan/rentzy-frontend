import { pageMetadata } from '@/seo';
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = pageMetadata('/offline');

export default function OfflinePage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <WifiOff size={28} className="text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          You&apos;re offline
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          We couldn&apos;t reach the network. Check your connection and try again.
        </p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
