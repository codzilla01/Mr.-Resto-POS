'use client';

import React, { useState } from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { TableStatus } from '@/types/pos';

export default function TablesPage() {
  const { lang, tables, updateTableStatus, transferTable } = usePOS();
  const isAr = lang === 'ar';
  const [transferFrom, setTransferFrom] = useState<string>('');

  const statusColors: Record<TableStatus, string> = {
    available: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
    occupied: 'border-red-500/40 bg-red-500/10 text-red-500',
    reserved: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
    waiting_bill: 'border-blue-500/40 bg-blue-500/10 text-blue-500',
  };

  const statusLabels: Record<TableStatus, { ar: string; en: string }> = {
    available: { ar: 'فارغة', en: 'Available' },
    occupied: { ar: 'مشغولة', en: 'Occupied' },
    reserved: { ar: 'محجوزة', en: 'Reserved' },
    waiting_bill: { ar: 'بانتظار الحساب', en: 'Waiting Bill' },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{isAr ? 'خريطة الصالة والطاولات' : 'Floor Plan & Tables'}</h2>
        {transferFrom && (
          <div className="flex items-center gap-2 text-xs bg-orange-500/15 text-orange-500 px-3 py-2 rounded-xl font-bold">
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isAr ? 'اختر الطاولة الجديدة للنقل إليها' : 'Select destination table to transfer'}</span>
            <button onClick={() => setTransferFrom('')} className="underline ms-2">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => {
              if (transferFrom && transferFrom !== table.id) {
                transferTable(transferFrom, table.id);
                setTransferFrom('');
              }
            }}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${statusColors[table.status]} ${
              transferFrom === table.id ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-extrabold">{table.number}</span>
              <span className="flex items-center gap-1 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                {table.capacity}
              </span>
            </div>
            <p className="text-xs opacity-75 mb-3">{table.section}</p>
            <p className="text-xs font-bold mb-3">
              {isAr ? statusLabels[table.status].ar : statusLabels[table.status].en}
            </p>
            <div className="flex flex-wrap gap-1">
              {(['available', 'occupied', 'reserved', 'waiting_bill'] as TableStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTableStatus(table.id, st);
                  }}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium"
                >
                  {isAr ? statusLabels[st].ar : statusLabels[st].en}
                </button>
              ))}
              {table.currentOrderId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTransferFrom(table.id);
                  }}
                  className="text-[10px] px-2 py-1 rounded-lg bg-orange-500 text-white font-bold"
                >
                  {isAr ? 'نقل' : 'Transfer'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
