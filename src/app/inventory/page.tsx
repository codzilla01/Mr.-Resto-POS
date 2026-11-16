'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

export default function InventoryPage() {
  const { lang, ingredients, wasteLogs, logWaste } = usePOS();
  const isAr = lang === 'ar';

  const [selectedIng, setSelectedIng] = useState(ingredients[0]?.id || '');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState('');

  const handleLogWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIng || wasteQty <= 0) return;
    logWaste(selectedIng, wasteQty, wasteReason || (isAr ? 'تلف / هدر' : 'Spoilage / Waste'));
    setWasteQty(1);
    setWasteReason('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-4">
          {isAr ? 'المخزون والخامات (الخصم التلقائي بالوصفات)' : 'Inventory & Ingredients (Auto-BOM)'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <th className="py-2 text-start">{isAr ? 'الخامة' : 'Ingredient'}</th>
                <th className="py-2 text-start">{isAr ? 'الرصيد' : 'Stock'}</th>
                <th className="py-2 text-start">{isAr ? 'حد الطلب' : 'Reorder'}</th>
                <th className="py-2 text-start">{isAr ? 'التكلفة/وحدة' : 'Cost/Unit'}</th>
                <th className="py-2 text-start">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ingredients.map((ing) => {
                const low = ing.stock <= ing.reorderLevel;
                return (
                  <tr key={ing.id}>
                    <td className="py-3 font-bold">{isAr ? ing.nameAr : ing.nameEn}</td>
                    <td className="py-3">
                      {ing.stock} {ing.unit}
                    </td>
                    <td className="py-3 text-slate-400">
                      {ing.reorderLevel} {ing.unit}
                    </td>
                    <td className="py-3">{ing.costPerUnit} EGP</td>
                    <td className="py-3">
                      {low ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-500/15 text-red-500 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {isAr ? 'نقص مخزون' : 'Low Stock'}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 font-bold">
                          {isAr ? 'متوفر' : 'OK'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waste Logging */}
      <div className="space-y-4">
        <form
          onSubmit={handleLogWaste}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <h3 className="font-bold text-base flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            {isAr ? 'تسجيل هدر (Waste)' : 'Log Waste'}
          </h3>
          <select
            value={selectedIng}
            onChange={(e) => setSelectedIng(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
          >
            {ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {isAr ? i.nameAr : i.nameEn} ({i.stock} {i.unit})
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={wasteQty}
            onChange={(e) => setWasteQty(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
            placeholder={isAr ? 'الكمية' : 'Quantity'}
          />
          <input
            type="text"
            value={wasteReason}
            onChange={(e) => setWasteReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
            placeholder={isAr ? 'سبب الهدر' : 'Reason'}
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm"
          >
            {isAr ? 'خصم من المخزون' : 'Record Waste'}
          </button>
        </form>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm mb-3">{isAr ? 'سجل الهدر الأخير' : 'Recent Waste Logs'}</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {wasteLogs.length === 0 ? (
              <p className="text-xs text-slate-400">{isAr ? 'لا يوجد هدر مسجل' : 'No waste logged'}</p>
            ) : (
              wasteLogs.map((w) => (
                <div key={w.id} className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="font-bold">
                    {w.ingredientName} (-{w.quantity})
                  </p>
                  <p className="text-slate-400">{w.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
