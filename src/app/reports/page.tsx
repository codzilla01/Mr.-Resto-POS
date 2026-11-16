'use client';

import React, { useState } from 'react';
import { Download, Upload, Lock, FileText, DollarSign } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

export default function ReportsPage() {
  const {
    lang,
    role,
    orders,
    activeShift,
    closeShift,
    auditLogs,
    exportBackup,
    importBackup,
  } = usePOS();
  const isAr = lang === 'ar';

  const [closingCash, setClosingCash] = useState(1000);
  const [backupMsg, setBackupMsg] = useState('');

  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const totalCost = paidOrders.reduce(
    (s, o) => s + o.items.reduce((is, it) => is + it.cost * it.quantity, 0),
    0
  );
  const grossProfit = totalRevenue - totalCost;

  const handleDownloadBackup = () => {
    const bkz = exportBackup();
    const blob = new Blob([bkz], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restopos-backup-${new Date().toISOString().slice(0, 10)}.bkz`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg(isAr ? 'تم تنزيل النسخة الاحتياطية المشفرة (.bkz)' : 'Encrypted .bkz backup downloaded');
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importBackup(String(reader.result || ''));
      setBackupMsg(
        ok
          ? isAr
            ? 'تم استرجاع النسخة الاحتياطية بنجاح!'
            : 'Backup restored successfully!'
          : isAr
          ? 'ملف غير صالح!'
          : 'Invalid backup file!'
      );
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{isAr ? 'التقارير، الورديات، والنسخ الاحتياطي' : 'Reports, Shifts & Backup'}</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">{isAr ? 'إجمالي المبيعات' : 'Total Sales'}</p>
          <p className="text-2xl font-extrabold text-orange-500 mt-1">{totalRevenue.toFixed(2)} EGP</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">{isAr ? 'عدد الفواتير' : 'Paid Orders'}</p>
          <p className="text-2xl font-extrabold mt-1">{paidOrders.length}</p>
        </div>

        {role === 'admin' ? (
          <>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400">{isAr ? 'تكلفة المكونات (Food Cost)' : 'Food Cost'}</p>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">{totalCost.toFixed(2)} EGP</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400">{isAr ? 'صافي الربح التقديري' : 'Gross Profit'}</p>
              <p className="text-2xl font-extrabold text-emerald-500 mt-1">{grossProfit.toFixed(2)} EGP</p>
            </div>
          </>
        ) : (
          <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 flex items-center gap-3 text-slate-400 text-sm">
            <Lock className="w-5 h-5" />
            <span>
              {isAr
                ? 'تقارير التكلفة والأرباح متاحة للمدير (Admin) فقط'
                : 'Food Cost & Profit reports are restricted to Admin role'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Shift Close (Z-Report) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            {isAr ? 'إغلاق الوردية (Z-Report)' : 'Close Shift (Z-Report)'}
          </h3>
          {activeShift && (
            <div className="text-sm space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <p>
                {isAr ? 'الكاش الافتتاحي:' : 'Opening Cash:'} <b>{activeShift.openingCash} EGP</b>
              </p>
              <p>
                {isAr ? 'مبيعات الوردية:' : 'Shift Sales:'} <b>{activeShift.totalSales.toFixed(2)} EGP</b>
              </p>
              <p>
                {isAr ? 'الكاش المتوقع:' : 'Expected Cash:'}{' '}
                <b>{(activeShift.openingCash + activeShift.totalSales).toFixed(2)} EGP</b>
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              value={closingCash}
              onChange={(e) => setClosingCash(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
              placeholder={isAr ? 'جرد الكاش الفعلي' : 'Actual Cash Count'}
            />
            <button
              onClick={() => closeShift(closingCash)}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm"
            >
              {isAr ? 'إغلاق الوردية' : 'Close Shift'}
            </button>
          </div>
        </div>

        {/* Encrypted Backup (.bkz) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-base">{isAr ? 'النسخ الاحتياطي المشفّر (.bkz)' : 'Encrypted Backup (.bkz)'}</h3>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تصدير واستيراد قاعدة البيانات كاملة بصيغة مشفرة ومضغوطة.'
              : 'Export and restore the entire local database in encrypted .bkz format.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm"
            >
              <Download className="w-4 h-4" />
              {isAr ? 'تصدير نسخة (.bkz)' : 'Export Backup (.bkz)'}
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'استرجاع نسخة' : 'Restore Backup'}</span>
              <input type="file" accept=".bkz,.txt" onChange={handleUploadBackup} className="hidden" />
            </label>
          </div>
          {backupMsg && <p className="text-xs text-emerald-500 font-bold">{backupMsg}</p>}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-500" />
          {isAr ? 'سجل التدقيق (Audit Log)' : 'Audit Log'}
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
          {auditLogs.length === 0 ? (
            <p className="text-slate-400">{isAr ? 'لا توجد عمليات مسجلة بعد' : 'No audit events yet'}</p>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
              >
                <div>
                  <span className="font-bold text-orange-500">[{log.action}]</span>{' '}
                  <span>{log.details}</span>
                </div>
                <span className="text-slate-400">
                  {log.userName} • {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
