'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  LayoutGrid,
  ChefHat,
  Package,
  Users,
  BarChart3,
  KeyRound,
  ShieldCheck,
  Sun,
  Moon,
  Languages,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { usePOS } from '@/context/POSContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang, theme, setTheme, role, setRole, licenseStatus } = usePOS();
  const isAr = lang === 'ar';
  const [authOpen, setAuthOpen] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [account, setAccount] = React.useState<'admin' | 'developer'>('admin');
  const [configured, setConfigured] = React.useState(false);
  const [error, setError] = React.useState('');
  const openAuth = () => { setConfigured(Boolean(localStorage.getItem('pos_owner_password'))); setAuthOpen(true); };
  const privileged = role === 'admin' || role === 'developer';
  const restricted = ['/inventory', '/reports', '/license', '/dev-license', '/marketing'];
  const isRestricted = restricted.some((path) => pathname === path || pathname.startsWith(path + '/'));
  const passwordHash = async (value: string) => {
    const bytes = new TextEncoder().encode('restopos-owner-v1:' + value);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!configured && (password.length < 8 || password !== confirm)) {
      setError(isAr ? 'كلمة المرور ٨ أحرف على الأقل ويجب أن تتطابق.' : 'Passwords must match and contain at least 8 characters.');
      return;
    }
    try {
      const hash = await passwordHash(password);
      const stored = localStorage.getItem('pos_owner_password');
      if (stored && stored !== hash) { setError(isAr ? 'كلمة المرور غير صحيحة.' : 'Incorrect password.'); return; }
      if (!stored) localStorage.setItem('pos_owner_password', hash);
      setRole(account); setAuthOpen(false); setPassword(''); setConfirm('');
    } catch { setError(isAr ? 'تعذر تسجيل الدخول؛ استخدم اتصالاً آمناً.' : 'Sign-in failed; use a secure connection.'); }
  };

  const navItems = [
    { href: '/', icon: ShoppingCart, labelAr: 'الكاشير', labelEn: 'POS' },
    { href: '/tables', icon: LayoutGrid, labelAr: 'الطاولات', labelEn: 'Tables' },
    { href: '/kds', icon: ChefHat, labelAr: 'المطبخ KDS', labelEn: 'KDS' },
    { href: '/inventory', icon: Package, labelAr: 'المخزون', labelEn: 'Inventory' },
    { href: '/marketing', icon: MessageCircle, labelAr: 'واتساب', labelEn: 'WhatsApp' },
    { href: '/customers', icon: Users, labelAr: 'العملاء', labelEn: 'Customers' },
    { href: '/reports', icon: BarChart3, labelAr: 'التقارير', labelEn: 'Reports' },
    { href: '/license', icon: KeyRound, labelAr: 'الترخيص', labelEn: 'License' },
    { href: '/dev-license', icon: ShieldCheck, labelAr: 'أداة المطور', labelEn: 'Dev Tool' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-2 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            R
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">
              {isAr ? 'ريستو POS' : 'RestoPOS Pro'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr ? 'نظام إدارة المطاعم أوفلاين' : 'Offline Restaurant System'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.filter((item) => privileged || !restricted.includes(item.href)).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const isDev = item.href === '/dev-license';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? isDev
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-orange-500 text-white shadow-sm'
                    : isDev
                    ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? item.labelAr : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controls: Role, License Badge, Theme, Lang */}
        <div className="flex items-center gap-2">
          {privileged ? (
            <button onClick={() => setRole('cashier')} className="text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              {isAr ? 'خروج إلى الكاشير' : 'Return to cashier'}
            </button>
          ) : (
            <button onClick={openAuth} className="text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              {isAr ? 'دخول المالك / المطور' : 'Owner / developer sign in'}
            </button>
          )}

          {privileged && <Link
            href="/license"
            className={`hidden sm:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium ${
              licenseStatus.valid
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/15 text-red-600 dark:text-red-400'
            }`}
          >
            {!licenseStatus.valid && <AlertTriangle className="w-3.5 h-3.5" />}
            <span>
              {licenseStatus.valid
                ? licenseStatus.payload?.plan === 'lifetime'
                  ? isAr
                    ? 'مرخّص دائم'
                    : 'Lifetime'
                  : isAr
                  ? `${licenseStatus.daysRemaining} يوم`
                  : `${licenseStatus.daysRemaining}d left`
                : isAr
                ? 'غير مرخص'
                : 'Unlicensed'}
            </span>
          </Link>}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
          >
            <Languages className="w-4 h-4" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 max-w-[1600px] w-full mx-auto">
        {isRestricted && !privileged ? <div className="p-6 rounded-2xl bg-white dark:bg-slate-900"><h2 className="font-bold">{isAr ? 'هذه الصفحة للمالك أو المطور فقط' : 'Owner or developer access required'}</h2><button className="mt-4 rounded-xl bg-orange-500 text-white px-4 py-2" onClick={openAuth}>{isAr ? 'تسجيل الدخول' : 'Sign in'}</button></div> : children}
      </main>
      {authOpen && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-bold text-lg">{configured ? (isAr ? 'دخول المالك أو المطور' : 'Owner or developer sign in') : (isAr ? 'إعداد كلمة مرور المالك لأول مرة' : 'Set up the owner password')}</h2>
        {!configured && <p className="text-sm text-amber-500">{isAr ? 'يجب أن يُعدّ المالك كلمة المرور على هذا الجهاز قبل تسليمه للكاشير. الحسابان يستخدمان كلمة المرور نفسها.' : 'The owner must set this password on this device before handing it to the cashier. Both roles share the password.'}</p>}
        <p className="text-xs text-slate-500">{isAr ? 'تنبيه: هذا قفل محلي للواجهة فقط، ويمكن تجاوزه عبر أدوات المتصفح أو مسح بياناته. لا يوفر حماية حقيقية للبيانات.' : 'Warning: this is a local UI lock only. Browser tools or clearing storage can bypass it; it does not securely protect data.'}</p>
        <select aria-label={isAr ? 'الحساب' : 'Account'} value={account} onChange={e => setAccount(e.target.value as 'admin' | 'developer')} className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800"><option value="admin">{isAr ? 'المالك' : 'Owner'}</option><option value="developer">{isAr ? 'المطور' : 'Developer'}</option></select>
        <input aria-label={isAr ? 'كلمة المرور' : 'Password'} type="password" autoComplete={configured ? 'current-password' : 'new-password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder={isAr ? 'كلمة المرور' : 'Password'} className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800" />
        {!configured && <input aria-label={isAr ? 'تأكيد كلمة المرور' : 'Confirm password'} type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={isAr ? 'تأكيد كلمة المرور' : 'Confirm password'} className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800" />}
        {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2"><button className="bg-orange-500 text-white px-4 py-2 rounded-xl" type="submit">{isAr ? 'دخول' : 'Sign in'}</button><button className="px-4 py-2" type="button" onClick={() => { setAuthOpen(false); setPassword(''); setConfirm(''); setError(''); }}>{isAr ? 'إلغاء' : 'Cancel'}</button></div>
      </form></div>}
    </div>
  );
}
