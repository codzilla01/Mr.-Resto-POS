'use client';

import React, { useState } from 'react';
import { UserPlus, Award } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

export default function CustomersPage() {
  const { lang, customers, addCustomer } = usePOS();
  const isAr = lang === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    addCustomer({ name: name.trim(), phone: phone.trim(), address: address.trim() });
    setName('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-4">{isAr ? 'العملاء ونقاط الولاء' : 'Customers & Loyalty'}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <th className="py-2 text-start">{isAr ? 'الاسم' : 'Name'}</th>
                <th className="py-2 text-start">{isAr ? 'الهاتف' : 'Phone'}</th>
                <th className="py-2 text-start">{isAr ? 'العنوان' : 'Address'}</th>
                <th className="py-2 text-start">{isAr ? 'النقاط' : 'Points'}</th>
                <th className="py-2 text-start">{isAr ? 'إجمالي الإنفاق' : 'Total Spent'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 font-bold">{c.name}</td>
                  <td className="py-3 font-mono text-xs">{c.phone}</td>
                  <td className="py-3 text-xs text-slate-400">{c.address}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-500/15 text-amber-500 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      {c.loyaltyPoints}
                    </span>
                  </td>
                  <td className="py-3 font-bold">{c.totalSpent.toFixed(2)} EGP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 h-fit"
      >
        <h3 className="font-bold text-base flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-orange-500" />
          {isAr ? 'إضافة عميل جديد' : 'Add Customer'}
        </h3>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isAr ? 'اسم العميل' : 'Customer Name'}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
        />
        <input
          type="text"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={isAr ? 'رقم الهاتف' : 'Phone Number'}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={isAr ? 'عنوان التوصيل' : 'Delivery Address'}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
        />
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm"
        >
          {isAr ? 'حفظ العميل' : 'Save Customer'}
        </button>
      </form>
    </div>
  );
}
