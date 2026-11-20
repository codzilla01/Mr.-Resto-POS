'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { normalizeWhatsAppPhone, whatsappUrl } from '@/lib/whatsapp';

export default function MarketingPage() {
  const { lang, customers, menuItems, categories } = usePOS();
  const isAr = lang === 'ar';
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const menu = categories.map(category => {
    const items = menuItems.filter(item => item.available && item.categoryId === category.id);
    if (!items.length) return '';
    return `*${isAr ? category.nameAr : category.nameEn}*\n` + items.map(item => `${isAr ? item.nameAr : item.nameEn} - ${item.price.toFixed(2)} EGP`).join('\n');
  }).filter(Boolean).join('\n\n');
  const appendMenu = () => setMessage(current => [current.trim(), isAr ? '*قائمة الطعام*' : '*Menu*', menu || (isAr ? 'لا توجد أصناف متاحة حالياً.' : 'No items currently available.')].filter(Boolean).join('\n\n'));
  const openWhatsApp = (usePhone: boolean) => {
    if (!message.trim()) { setError(isAr ? 'اكتب العرض أو أضف المنيو أولاً.' : 'Write an offer or add the menu first.'); return; }
    const normalized = usePhone ? normalizeWhatsAppPhone(phone) : undefined;
    if (usePhone && !normalized) { setError(isAr ? 'أدخل رقم هاتف صالحاً مع رمز الدولة، أو رقم محمول مصرياً.' : 'Enter a valid number with country code, or an Egyptian mobile number.'); return; }
    setError('');
    window.open(whatsappUrl(message.trim(), normalized || undefined), '_blank', 'noopener,noreferrer');
  };
  return <div className="max-w-3xl mx-auto space-y-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      <h2 className="text-xl font-bold">{isAr ? 'إرسال العروض والمنيو عبر واتساب' : 'Share offers and menu via WhatsApp'}</h2>
      <p className="text-sm text-slate-500">{isAr ? 'اكتب العرض وأضف المنيو إن رغبت، ثم اختر عميلاً أو أدخل رقماً، أو اختر جهة اتصال داخل واتساب. راجع الرسالة وأرسلها بنفسك؛ أرسل فقط لمن وافق على التواصل.' : 'Write an offer and optionally add the menu. Select a customer, enter a number, or choose a contact in WhatsApp. Review and send the message yourself; contact only people who have consented.'}</p>
      <label className="block text-sm font-bold" htmlFor="message">{isAr ? 'الرسالة أو العرض' : 'Message or offer'}</label>
      <textarea id="message" rows={8} value={message} onChange={e => setMessage(e.target.value)} placeholder={isAr ? 'اكتب تفاصيل العرض هنا...' : 'Write your offer here...'} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800" />
      <button type="button" onClick={appendMenu} className="px-4 py-2 rounded-xl border border-orange-500 text-orange-500 font-bold">{isAr ? 'إضافة المنيو المتاح للرسالة' : 'Add available menu to message'}</button>
      <label className="block text-sm font-bold" htmlFor="customer">{isAr ? 'عميل مسجل' : 'Registered customer'}</label>
      <select id="customer" defaultValue="" onChange={e => { const customer = customers.find(c => c.id === e.target.value); if (customer) setPhone(customer.phone); }} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
        <option value="">{isAr ? 'اختر عميلاً (اختياري)' : 'Choose a customer (optional)'}</option>
        {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
      </select>
      <label className="block text-sm font-bold" htmlFor="phone">{isAr ? 'رقم واتساب' : 'WhatsApp number'}</label>
      <input id="phone" type="tel" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01012345678 / +201012345678" className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800" />
      <p className="text-xs text-slate-500">{isAr ? 'للأرقام خارج مصر أدخل رمز الدولة، مثال +966…' : 'For numbers outside Egypt include the country code, e.g. +966…'}</p>
      {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => openWhatsApp(true)} className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold">{isAr ? 'فتح المحادثة مع الرقم' : 'Open chat with number'}</button><button type="button" onClick={() => openWhatsApp(false)} className="px-4 py-3 rounded-xl bg-emerald-700 text-white font-bold">{isAr ? 'اختيار جهة اتصال في واتساب' : 'Choose a contact in WhatsApp'}</button></div>
      <p className="text-xs text-slate-500">{isAr ? 'تُفتح محادثة واحدة في كل مرة، ولا يتم الإرسال تلقائياً. يتطلب واتساب واتصالاً بالإنترنت.' : 'One chat is opened at a time; messages are not sent automatically. WhatsApp and internet access are required.'}</p>
    </div>
  </div>;
}
