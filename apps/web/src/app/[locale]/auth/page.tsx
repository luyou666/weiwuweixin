'use client';

/**
 * 围物为心 — 登录/注册页面
 *
 * Gucci 式沉浸式设计：全幅深色背景 + 居中卡片 + 优雅表单动画
 * 登录 ↔ 注册 无缝切换，framer-motion 驱动转场
 * 支持密码可见性切换、Toast 提示、第三方登录占位
 */

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { login, register, ApiError } from '@/lib/api-client';
import { useUserStore } from '@/stores/user-store';
import { useAuthStore } from '@/stores/auth-store';

/* ============================================================
   类型
   ============================================================ */
type AuthMode = 'login' | 'register';

/* ============================================================
   动画配置
   ============================================================ */
const formVariants = {
  enter: { opacity: 0, x: 40, filter: 'blur(4px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -40, filter: 'blur(4px)' },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ============================================================
   眼睛图标（密码可见性切换）
   ============================================================ */
function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    // 眼睛打开 — 可以看到
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  // 眼睛关闭 — 看不到
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

/* ============================================================
   Toast 组件
   ============================================================ */
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-xl ${
        type === 'success'
          ? 'bg-vermilion/90 text-paper border border-vermilion-light/30'
          : 'bg-ink-900/95 text-vermilion border border-vermilion/30'
      } backdrop-blur-xl text-sm font-medium`}
    >
      {type === 'success' && (
        <span className="mr-2">✓</span>
      )}
      {message}
    </motion.div>
  );
}

/* ============================================================
   输入框组件（带密码可见性切换）
   ============================================================ */
function AuthInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  custom,
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePassword,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  custom: number;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
}) {
  return (
    <motion.div
      className="mb-5"
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
      custom={custom}
    >
      <label className="block text-white/70 text-sm font-medium mb-1.5 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswordToggle ? (passwordVisible ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/5 border
            text-white placeholder:text-white/60
            focus:outline-none focus:ring-2 focus:ring-vermilion/40 focus:border-vermilion/60
            transition-all duration-200
            ${showPasswordToggle ? 'pr-10' : ''}
            ${error ? 'border-vermilion' : 'border-white/10'}
          `}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
            tabIndex={-1}
          >
            <EyeIcon visible={passwordVisible} />
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-vermilion text-xs mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ============================================================
   分割线
   ============================================================ */
function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-white/40 text-xs tracking-wider">{text}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

/* ============================================================
   主页面
   ============================================================ */
export default function AuthPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const deviceId = useUserStore((s) => s.deviceId);

  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 表单字段
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  // 密码可见性
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 本地验证
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      e.email = t('emailInvalid');
    }

    if (password.length < 6) {
      e.password = t('passwordTooShort');
    }

    if (mode === 'register' && password !== confirmPassword) {
      e.confirmPassword = t('passwordMismatch');
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password, confirmPassword, mode, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError('');

      if (!validate()) return;

      setLoading(true);
      try {
        if (mode === 'login') {
          await login({ email, password, deviceId });
          showToast(t('loginSuccess'), 'success');
        } else {
          await register({ email, password, nickname: nickname || undefined, deviceId });
          showToast(t('registerSuccess'), 'success');
        }

        // 延迟跳转，让用户看到 toast
        setTimeout(() => {
          router.push('/');
        }, 800);
      } catch (err) {
        if (err instanceof ApiError) {
          setServerError(err.message);
        } else {
          setServerError('操作失败，请稍后再试');
        }
      } finally {
        setLoading(false);
      }
    },
    [mode, email, password, nickname, confirmPassword, deviceId, validate, router, t, showToast],
  );

  const switchMode = useCallback(() => {
    setServerError('');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* ── 背景层 ── */}
      <div className="absolute inset-0 bg-[#0A0A14]">
        {/* 朱砂光晕 */}
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(204,68,44,0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* 靛蓝光晕 */}
        <motion.div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(45,55,120,0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* 青瓷光晕 */}
        <motion.div
          className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(127,179,163,0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* ── 表单卡片 ── */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 印章 Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-vermilion/40 mb-4 cursor-pointer hover:border-vermilion/70 hover:scale-105 transition-all duration-300">
              <span className="text-vermilion text-2xl font-heading font-bold">围</span>
            </div>
          </Link>
        </motion.div>

        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={formVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 标题 */}
              <h1 className="text-2xl font-heading font-semibold text-white text-center mb-1">
                {mode === 'login' ? t('loginTitle') : t('registerTitle')}
              </h1>
              <p className="text-white/50 text-sm text-center mb-6">
                {mode === 'login' ? t('loginDesc') : t('registerDesc')}
              </p>

              {/* 服务端错误 */}
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-vermilion/10 border border-vermilion/30 rounded-lg px-4 py-3 mb-4 text-vermilion text-sm text-center"
                >
                  {serverError}
                </motion.div>
              )}

              {/* 表单 */}
              <form onSubmit={handleSubmit}>
                <AuthInput
                  label={t('email')}
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  custom={0}
                />

                {mode === 'register' && (
                  <AuthInput
                    label={t('nickname')}
                    placeholder={t('nicknamePlaceholder')}
                    value={nickname}
                    onChange={setNickname}
                    custom={1}
                  />
                )}

                <AuthInput
                  label={t('password')}
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={setPassword}
                  error={errors.password}
                  custom={mode === 'register' ? 2 : 1}
                  showPasswordToggle
                  passwordVisible={showPassword}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                />

                {mode === 'register' && (
                  <AuthInput
                    label={t('confirmPassword')}
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    error={errors.confirmPassword}
                    custom={3}
                    showPasswordToggle
                    passwordVisible={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword((v) => !v)}
                  />
                )}

                {mode === 'login' && (
                  <div className="text-right mb-4">
                    <button
                      type="button"
                      className="text-vermilion/70 text-xs hover:text-vermilion transition-colors"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>
                )}

                {/* 提交按钮 */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3 rounded-pill text-white font-medium
                    bg-vermilion hover:bg-vermilion-light
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    mt-2
                  "
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      {mode === 'login' ? t('loggingIn') : t('registering')}
                    </span>
                  ) : (
                    mode === 'login' ? t('login') : t('register')
                  )}
                </motion.button>
              </form>

              {/* 分割线 */}
              <Divider text={mode === 'login' ? '或' : '或'} />

              {/* 第三方登录占位 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:border-white/20 hover:text-white/60 transition-all duration-200 opacity-60 cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:border-white/20 hover:text-white/60 transition-all duration-200 opacity-60 cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.69 2.18a10.08 10.08 0 0 0-5.33 4.65l3.2 2.48A6.04 6.04 0 0 1 8.69 2.18zM2.18 8.69a10.08 10.08 0 0 0 .01 6.62l3.2-2.48a6.04 6.04 0 0 1-3.21-4.14zM5.36 17.17a10.08 10.08 0 0 0 5.33 4.65l-2.15-3.72a6.04 6.04 0 0 1-3.18-0.93zM12.65 21.82a10.08 10.08 0 0 0 5.65-3.17l-3.2-2.48a6.04 6.04 0 0 1-2.45 5.65zM21.82 15.31a10.08 10.08 0 0 0 0-6.62l-3.2 2.48a6.04 6.04 0 0 1 3.2 4.14zM18.64 6.83A10.08 10.08 0 0 0 12.65 2.18l2.15 3.72a6.04 6.04 0 0 1 3.84 0.93z" />
                  </svg>
                  GitHub
                </button>
              </div>

              {/* 切换模式 */}
              <div className="text-center mt-6 text-sm text-white/50">
                {mode === 'login' ? t('noAccount') : t('hasAccount')}{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-vermilion hover:text-vermilion-light transition-colors font-medium"
                >
                  {mode === 'login' ? t('goRegister') : t('goLogin')}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 游客继续 */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => router.push('/')}
            className="text-white/40 text-sm hover:text-white/70 transition-colors"
          >
            {t('orContinueAsGuest')} →
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

