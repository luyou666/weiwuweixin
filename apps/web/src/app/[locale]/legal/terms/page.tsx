'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function TermsPage() {
  const t = useTranslations('legal');

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700 transition-colors mb-12"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t('backToHome')}
      </Link>

      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ink-900 mb-2">
        {t('termsTitle')}
      </h1>
      <p className="text-sm text-ink-400 mb-12">
        {t('lastUpdated')}：2026-05-03
      </p>

      <div className="prose prose-ink max-w-none space-y-8 text-ink-700 leading-relaxed">
        {[1,2,3,4,5,6,7,8,9].map(i => (
          <section key={i}>
            <h2 className="font-heading text-xl font-semibold text-ink-900 mb-3">
              {t(`termsSection${i}Title`)}
            </h2>
            <p>{t(`termsSection${i}Content`)}</p>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-ink-100 text-sm text-ink-400 space-x-6">
        <Link href="/legal/privacy" className="hover:text-ink-700 transition-colors underline underline-offset-2">
          {t('privacyPolicyLink')}
        </Link>
      </div>
    </main>
  );
}
