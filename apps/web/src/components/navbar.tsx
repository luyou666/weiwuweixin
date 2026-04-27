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
  const menuRef = useRef<HTMLDivElement>(null);

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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
      // 关键: fixed + mix-blend-difference 让文字始终对比背景
      // text-white + 在 difference 模式下会自动反色
      className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
    >
      <nav className="flex items-center justify-between px-[6vw] py-[2.4vh]">
        {/* 左：Logo */}
        <Link
          href="/"
          className="group inline-flex items-center gap-sm"
        >
          {/* 小印章符号 */}
          <span className="font-heading text-base text-white tracking-[0.05em] select-none">
            围
          </span>
          {/* 主文字 — 字重稍粗、字距收紧、字号略放大 */}
          <span className="font-heading text-[15px] font-medium text-white tracking-[0.08em]">
            围物为心
          </span>
        </Link>

        {/* 中：导航菜单（只在桌面显示） */}
        <div className="hidden md:flex items-center gap-2xl">
          <NavLink href="/explore" label="EXPLORE" cn="探索" />
          <NavLink href="/about" label="ABOUT" cn="关于" />
        </div>

        {/* 右：操作 */}
        <div className="flex items-center gap-xl">
          {/* 新建 — 强调 */}
          <NavLink href="/list/new" label="NEW" cn="新建" emphasis />

          {/* 登录/用户菜单 */}
          {isHydrated && user && user.isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="group relative inline-flex flex-col items-start leading-none"
              >
                {/* 小英文标签 */}
                <span className="font-mono text-[10px] tracking-[0.3em] text-white opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                  ACCOUNT
                </span>
                {/* 中文 */}
                <span className="font-heading text-[13px] text-white tracking-[0.15em] mt-[3px] opacity-95 group-hover:opacity-100 transition-opacity duration-500">
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
            <NavLink href="/auth" label="LOG IN" cn="登录" emphasis />
          )}
        </div>
      </nav>
    </motion.header>
  );
}

/* ── 单个导航项：英文 mono small caps + 中文衬线 双行布局 ── */
function NavLink({
  href,
  label,
  cn,
  emphasis,
}: {
  href: string;
  label: string;
  cn: string;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex flex-col items-start leading-none"
    >
      {/* 顶部小英文标签（mono small caps） */}
      <span
        className={`font-mono text-[10px] tracking-[0.3em] text-white ${
          emphasis ? 'opacity-100' : 'opacity-70'
        } group-hover:opacity-100 transition-opacity duration-500`}
      >
        {label}
      </span>
      {/* 下方中文（衬线） */}
      <span className="font-heading text-[13px] text-white tracking-[0.15em] mt-[3px] opacity-95 group-hover:opacity-100 transition-opacity duration-500">
        {cn}
      </span>
      {/* hover 下划线 — 0 → 100% 从左滑入 */}
      <span className="absolute -bottom-[6px] left-0 h-[1px] w-0 bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
    </Link>
  );
}