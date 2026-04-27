import type { Config } from 'tailwindcss';
import formsPlugin from '@tailwindcss/forms';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@weiwuweixin/ui/src/**/*.{ts,tsx,css}',
  ],
  theme: {
    extend: {
      /* ── 水墨色板 ── */
      colors: {
        ink: {
          900: 'var(--ink-900)',
          700: 'var(--ink-700)',
          500: 'var(--ink-500)',
          300: 'var(--ink-300)',
          100: 'var(--ink-100)',
        },
        paper: 'var(--paper)',
        rice: 'var(--rice)',
        vermilion: {
          DEFAULT: 'var(--vermilion)',
          light: 'var(--vermilion-light)',
          dark: 'var(--vermilion-dark)',
        },
        celadon: {
          DEFAULT: 'var(--celadon)',
          light: 'var(--celadon-light)',
          dark: 'var(--celadon-dark)',
        },
        apricot: {
          DEFAULT: 'var(--apricot)',
          light: 'var(--apricot-light)',
          dark: 'var(--apricot-dark)',
        },
        indigo: {
          DEFAULT: 'var(--indigo)',
          light: 'var(--indigo-light)',
          dark: 'var(--indigo-dark)',
        },
        mist: 'var(--mist)',
        'mist-heavy': 'var(--mist-heavy)',
      },

      /* ── 字体族 ── */
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      /* ── 字号 ── */
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },

      /* ── 间距 ── */
      spacing: {
        '3xs': 'var(--space-3xs)',
        '2xs': 'var(--space-2xs)',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
      },

      /* ── 圆角 ── */
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },

      /* ── 阴影 ── */
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        sticker: 'var(--shadow-sticker)',
        'sticker-hover': 'var(--shadow-sticker-hover)',
      },

      /* ── 过渡 ── */
      transitionTimingFunction: {
        spring: 'var(--spring)',
        'spring-bounce': 'var(--spring-bounce)',
        ease: 'var(--ease-out)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      /* ── Z-index ── */
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  plugins: [
    
    // focus-visible ring utility via plugin
    function plugin({ addUtilities }: { addUtilities: (utils: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.focus-ring': {
          'outline': '2px solid var(--vermilion)',
          'outline-offset': '2px',
          'border-radius': 'var(--radius-sm)',
        },
      });
    },
  ],
};

export default config;