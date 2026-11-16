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
} from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { Role } from '@/types/pos';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang, theme, setTheme, role, setRole, licenseStatus } = usePOS();
  const isAr = lang === 'ar';

  const navItems = [
    { href: '/', icon: ShoppingCart, labelAr: 'الكاشير', labelEn: 'POS' },
    { href: '/tables', icon: LayoutGrid, labelAr: 'الطاولات', labelEn: 'Tables' },
    { href: '/kds', icon: ChefHat, labelAr: 'المطبخ KDS', labelEn: 'KDS' },
    { href: '/inventory', icon: Package, labelAr: 'المخزون', labelEn: 'Inventory' },
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
          {navItems.map((item) => {
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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            aria-label="Role"
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
          >
            <option value="admin">{isAr ? 'مدير (Admin)' : 'Admin'}</option>
            <option value="cashier">{isAr ? 'كاشير (Cashier)' : 'Cashier'}</option>
            <option value="waiter">{isAr ? 'ويتر (Waiter)' : 'Waiter'}</option>
            <option value="chef">{isAr ? 'شيف (Chef)' : 'Chef'}</option>
          </select>

          <Link
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
          </Link>

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
      <main className="flex-1 p-3 sm:p-4 max-w-[1600px] w-full mx-auto">{children}</main>
    </div>
  );
}
