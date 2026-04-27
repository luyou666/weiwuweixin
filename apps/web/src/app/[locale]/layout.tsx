import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/navigation';
import { QueryProvider } from '@/lib/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import type { Metadata } from 'next';

/* ── next/font/google: 替代 CSS @import，消除 FOIT/FOUT ── */
import { Noto_Serif_SC, Inter } from 'next/font/google';

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
});

/* ── SEO Metadata ── */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weiwuweixin.com';

export const metadata: Metadata = {
  title: {
    default: '围物为心 — 以心度物，以物观心',
    template: '%s | 围物为心',
  },
  description:
    '保护你的主观性。围物为心是一个水墨风格的榜单与评测工具，让评分不再是冷冰冰的数字，而是承载态度与置信度的活物。',
  keywords: ['榜单', '评测', '评分', '置信度', '水墨风格', '主观评测', '围物为心'],
  authors: [{ name: '围物为心' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    siteName: '围物为心',
    title: '围物为心 — 以心度物，以物观心',
    description:
      '保护你的主观性。水墨风格榜单与评测工具，让评分承载态度与置信度。',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '围物为心 — 以心度物，以物观心',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '围物为心 — 以心度物，以物观心',
    description:
      '保护你的主观性。水墨风格榜单与评测工具，让评分承载态度与置信度。',
    images: [`${siteUrl}/og-image.png`],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${notoSerifSC.variable} ${inter.variable}`}
    >
      <head>
        {/* KaTeX CSS for algorithm formulas */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          crossOrigin="anonymous"
        />
        {/* Inline script to prevent dark mode FOUC — sets both dark class and data-theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('weiwu-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="weiwuweixin-root">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ThemeProvider>
              <Navbar />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}