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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-950/80 backdrop-blur-xl border-b border-ink-800/30'
          : 'bg-transparent'
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo + 导航 */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-paper hover:opacity-80 transition-opacity"
          >
            <span className="w-7 h-7 rounded-full border border-cinnabar/60 flex items-center justify-center text-cinnabar text-xs font-bold font-heading">
              围
            </span>
            <span className="font-heading font-semibold text-paper text-sm tracking-wider hidden sm:block">
              围物为心
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/explore"
              className="text-ink-300 hover:text-paper text-sm transition-colors"
            >
              探索
            </Link>
            <Link
              href="/about"
              className="text-ink-300 hover:text-paper text-sm transition-colors"
            >
              关于
            </Link>
          </nav>
        </div>

        {/* 右侧：用户区 */}
        <div className="flex items-center gap-3">
          {/* 新建榜单 */}
          <Link
            href="/list/new"
            className="hidden sm:flex items-center gap-1.5 text-sm text-ink-300 hover:text-paper transition-colors"
          >
            <span>+</span>
            <span>新建</span>
          </Link>

          {/* 登录/用户菜单 */}
          {isHydrated && user && user.isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-cinnabar/20 border border-cinnabar/40 flex items-center justify-center text-cinnabar text-xs font-bold overflow-hidden">
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
                <span className="text-paper text-sm hidden sm:block group-hover:text-cinnabar transition-colors">
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
                    className="absolute right-0 top-full mt-2 w-52 bg-ink-900/95 backdrop-blur-xl border border-ink-700/40 rounded-xl shadow-xl shadow-ink-950/50 overflow-hidden py-1"
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
                        className="w-full text-left px-4 py-2.5 text-sm text-cinnabar/80 hover:text-cinnabar hover:bg-cinnabar/5 transition-colors"
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
              className="px-5 py-1.5 rounded-pill text-sm font-medium bg-cinnabar/90 hover:bg-cinnabar text-paper transition-all duration-200"
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}