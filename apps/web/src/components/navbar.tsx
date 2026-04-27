'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { logout } from '@/lib/api-client';

export function Navbar() {
  const t = useTranslations('auth');
  const router = useRouter();
  const pathname = usePathname();

  const { user, isHydrated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push('/');
  };

  // 认证页面不显示导航栏
  if (pathname.includes('/auth')) return null;

  return (
    <motion.header
      className={`fixed top-[6vh] left-[6vw] right-[6vw] z-50 transition-all duration-500 ${
        scrolled
          ? 'mix-blend-difference'
          : 'mix-blend-difference'
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        {/* Logo — 极小 24px */}
        <div className="flex items-center gap-2xl">
          <Link
            href="/"
            className="flex items-center gap-sm text-paper hover:opacity-80 transition-opacity"
          >
            <span className="text-paper text-2xl font-heading leading-none">围物为心</span>
          </Link>

          {/* 导航 — small caps mono 间距 2xl */}
          <nav className="hidden md:flex items-center gap-2xl">
            <Link
              href="/explore"
              className="font-mono text-[11px] tracking-[0.25em] text-paper/70 hover:text-paper transition-colors duration-300"
            >
              探索
            </Link>
            <Link
              href="/about"
              className="font-mono text-[11px] tracking-[0.25em] text-paper/70 hover:text-paper transition-colors duration-300"
            >
              关于
            </Link>
            <Link
              href="/list/new"
              className="font-mono text-[11px] tracking-[0.25em] text-paper/70 hover:text-paper transition-colors duration-300"
            >
              新建
            </Link>
          </nav>
        </div>

        {/* 右侧：用户区 */}
        <div className="flex items-center gap-2xl">
          {/* 登录/用户菜单 */}
          {isHydrated && user && user.isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-sm group"
              >
                <div className="w-8 h-8 rounded-full border border-paper/30 flex items-center justify-center text-paper text-xs font-bold overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.nickname || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user.nickname?.[0] ?? user.handle[0])
                  )}
                </div>
                <span className="font-mono text-[11px] tracking-[0.2em] text-paper/70 group-hover:text-paper transition-colors hidden sm:block">
                  {user.nickname || user.handle}
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-ink-900/95 backdrop-blur-xl border border-ink-700/40 rounded-none shadow-xl shadow-ink-950/50 overflow-hidden py-1"
                  >
                    <div className="px-4 py-3 border-b border-ink-800/40">
                      <p className="text-paper text-sm font-medium truncate">
                        {user.nickname || user.handle}
                      </p>
                      <p className="text-ink-400 text-xs truncate">{user.email}</p>
                    </div>
                    <Link
                      href={`/u/${user.handle}`}
                      className="block px-4 py-2.5 text-sm text-ink-300 hover:text-paper hover:bg-ink-800/40 transition-colors"
                    >
                      我的主页
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2.5 text-sm text-ink-300 hover:text-paper hover:bg-ink-800/40 transition-colors"
                    >
                      设置
                    </Link>
                    <div className="border-t border-ink-800/40 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-vermilion/80 hover:text-vermilion hover:bg-vermilion/5 transition-colors"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth"
              className="font-mono text-[11px] tracking-[0.25em] text-paper/70 hover:text-paper border-b border-paper/30 hover:border-paper transition-all duration-300 pb-px"
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}