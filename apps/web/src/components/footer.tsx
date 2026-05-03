'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('footer');
  const pathname = usePathname();

  // 不在 auth 或 legal 页面显示
  if (pathname.includes('/auth') || pathname.includes('/legal')) return null;

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500">
        <span>&copy; {new Date().getFullYear()} {t('copyright')}</span>
        <div className="flex items-center gap-4">
          <Link href="/legal/terms" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline underline-offset-2">
            {t('termsOfService')}
          </Link>
          <Link href="/legal/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline underline-offset-2">
            {t('privacyPolicy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
