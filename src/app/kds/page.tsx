'use client';

import React from 'react';
import { Clock, CheckCircle, Flame } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { KDSStatus } from '@/types/pos';

export default function KDSPage() {
  const { lang, orders, updateKDSStatus } = usePOS();
  const isAr = lang === 'ar';

  const activeOrders = orders.filter((o) => o.kdsStatus !== 'served' && o.status !== 'cancelled');

  const columns: { status: KDSStatus; ar: string; en: string; color: string }[] = [
    { status: 'pending', ar: 'طلبات جديدة', en: 'Pending', color: 'border-amber-500' },
    { status: 'preparing', ar: 'قيد التحضير', en: 'Preparing', color: 'border-orange-500' },
    { status: 'ready', ar: 'جاهز للتقديم', en: 'Ready', color: 'border-emerald-500' },
  ];

  const nextStatus: Record<KDSStatus, KDSStatus> = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'served',
    served: 'served',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          {isAr ? 'شاشة المطبخ (KDS)' : 'Kitchen Display System (KDS)'}
        </h2>
        <span className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold">
          {activeOrders.length} {isAr ? 'طلبات نشطة' : 'Active Tickets'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colOrders = activeOrders.filter((o) => o.kdsStatus === col.status);
          return (
            <div
              key={col.status}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border-t-4 ${col.color} border-x border-b border-slate-200 dark:border-slate-800`}
            >
              <h3 className="font-bold text-base mb-3 flex items-center justify-between">
                <span>{isAr ? col.ar : col.en}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  {colOrders.length}
                </span>
              </h3>

              <div className="space-y-3">
                {colOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    {isAr ? 'لا توجد طلبات' : 'No tickets'}
                  </p>
                ) : (
                  colOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-orange-500">
                          #{order.orderNumber} • {order.orderType.toUpperCase()}
                          {order.tableNumber ? ` (${order.tableNumber})` : ''}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <ul className="space-y-1 text-sm">
                        {order.items.map((it) => (
                          <li key={it.id} className="font-medium">
                            <span className="font-bold text-orange-500">{it.quantity}x</span>{' '}
                            {isAr ? it.nameAr : it.nameEn}
                            {it.selectedModifiers.length > 0 && (
                              <span className="block text-[11px] text-slate-400 ps-4">
                                + {it.selectedModifiers.map((m) => (isAr ? m.nameAr : m.nameEn)).join(', ')}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => updateKDSStatus(order.id, nextStatus[order.kdsStatus])}
                        className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {col.status === 'pending'
                          ? isAr
                            ? 'بدء التحضير'
                            : 'Start Preparing'
                          : col.status === 'preparing'
                          ? isAr
                            ? 'جاهز للتقديم'
                            : 'Mark Ready'
                          : isAr
                          ? 'تم التقديم'
                          : 'Mark Served'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
