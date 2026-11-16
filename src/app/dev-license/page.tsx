'use client';

import React, { useState } from 'react';
import { ShieldCheck, Key, Copy, RefreshCw, Ban, BellRing, Check } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { signLicense } from '@/lib/crypto';
import { DEFAULT_BRANCH_ID } from '@/lib/seed';
import { DeveloperSubscription, LicensePlan } from '@/types/pos';

export default function DeveloperLicensePage() {
  const { lang, deviceId, developerSubscriptions, addDeveloperSubscription, updateDeveloperSubscription } = usePOS();
  const isAr = lang === 'ar';

  const [clientName, setClientName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetDeviceId, setTargetDeviceId] = useState(deviceId);
  const [plan, setPlan] = useState<LicensePlan>('yearly');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const computeExpiry = (p: LicensePlan) => {
    const now = Date.now();
    if (p === 'trial') return new Date(now + 14 * 86400000).toISOString();
    if (p === 'monthly') return new Date(now + 30 * 86400000).toISOString();
    if (p === 'yearly') return new Date(now + 365 * 86400000).toISOString();
    return new Date(now + 36500 * 86400000).toISOString();
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !targetDeviceId.trim()) return;
    const nowIso = new Date().toISOString();
    const expIso = computeExpiry(plan);
    const licId = `LIC-${Date.now().toString(36).toUpperCase()}`;

    const key = signLicense({
      licenseId: licId,
      clientName: restaurantName || clientName,
      deviceId: targetDeviceId.trim(),
      plan,
      issuedAt: nowIso,
      expiresAt: expIso,
      branch_id: DEFAULT_BRANCH_ID,
    });

    const newSub: DeveloperSubscription = {
      id: `sub-${Date.now()}`,
      clientName: clientName.trim(),
      restaurantName: restaurantName.trim() || clientName.trim(),
      phone: phone.trim(),
      deviceId: targetDeviceId.trim(),
      plan,
      status: 'active',
      issuedAt: nowIso,
      expiresAt: expIso,
      licenseKey: key,
      renewalsCount: 0,
    };

    addDeveloperSubscription(newSub);
    setGeneratedKey(key);
    setClientName('');
    setRestaurantName('');
    setPhone('');
  };

  const handleRenew = (sub: DeveloperSubscription) => {
    const expIso = computeExpiry(sub.plan);
    const key = signLicense({
      licenseId: `LIC-REN-${Date.now().toString(36).toUpperCase()}`,
      clientName: sub.restaurantName,
      deviceId: sub.deviceId,
      plan: sub.plan,
      issuedAt: new Date().toISOString(),
      expiresAt: expIso,
      branch_id: DEFAULT_BRANCH_ID,
    });
    updateDeveloperSubscription(sub.id, {
      status: 'active',
      expiresAt: expIso,
      licenseKey: key,
      renewalsCount: sub.renewalsCount + 1,
    });
    setGeneratedKey(key);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const expiringSoon = developerSubscriptions.filter((s) => {
    if (s.status !== 'active' || s.plan === 'lifetime') return false;
    const days = (new Date(s.expiresAt).getTime() - Date.now()) / 86400000;
    return days <= 7 && days >= 0;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-6 h-6" />
            {isAr ? 'أداة المطور: إدارة التراخيص والاشتراكات' : 'Developer Tool: License & Subscription Manager'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'إصدار مفاتيح Ed25519 موقّعة رقميًا ومتابعة اشتراكات المطاعم'
              : 'Generate Ed25519-signed keys & track client restaurant subscriptions'}
          </p>
        </div>

        {expiringSoon.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-500 text-xs font-bold">
            <BellRing className="w-4 h-4" />
            <span>
              {expiringSoon.length}{' '}
              {isAr ? 'اشتراك يقترب من الانتهاء خلال 7 أيام' : 'subscription(s) expiring within 7 days'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Generate License Form */}
        <form
          onSubmit={handleGenerate}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-purple-500/30 space-y-3 h-fit"
        >
          <h3 className="font-bold text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-500" />
            {isAr ? 'إصدار مفتاح ترخيص جديد' : 'Issue New License Key'}
          </h3>

          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={isAr ? 'اسم العميل' : 'Client Name'}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
          />
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder={isAr ? 'اسم المطعم' : 'Restaurant Name'}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
          />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isAr ? 'رقم الهاتف' : 'Phone'}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
          />
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              {isAr ? 'بصمة جهاز العميل (Device ID)' : 'Client Device Fingerprint'}
            </label>
            <input
              type="text"
              required
              value={targetDeviceId}
              onChange={(e) => setTargetDeviceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs"
            />
          </div>

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as LicensePlan)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold"
          >
            <option value="trial">{isAr ? 'تجريبي (14 يوم)' : 'Trial (14 Days)'}</option>
            <option value="monthly">{isAr ? 'شهري (30 يوم)' : 'Monthly (30 Days)'}</option>
            <option value="yearly">{isAr ? 'سنوي (365 يوم)' : 'Yearly (365 Days)'}</option>
            <option value="lifetime">{isAr ? 'مدى الحياة' : 'Lifetime'}</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm"
          >
            {isAr ? 'توليد المفتاح الموقّع' : 'Generate Signed Key'}
          </button>

          {generatedKey && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-500">
                <span>{isAr ? 'المفتاح جاهز للنسخ:' : 'Generated Key:'}</span>
                <button
                  type="button"
                  onClick={() => copyText(generatedKey, 'gen')}
                  className="flex items-center gap-1 underline"
                >
                  {copiedId === 'gen' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isAr ? 'نسخ' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-[10px] break-all max-h-24 overflow-y-auto">{generatedKey}</p>
            </div>
          )}
        </form>

        {/* Subscriptions Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <h3 className="font-bold text-base mb-4">
            {isAr ? 'سجل اشتراكات العملاء' : 'Client Subscriptions'} ({developerSubscriptions.length})
          </h3>
          <table className="w-full text-sm text-start">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <th className="py-2 text-start">{isAr ? 'المطعم / العميل' : 'Restaurant / Client'}</th>
                <th className="py-2 text-start">{isAr ? 'الجهاز' : 'Device ID'}</th>
                <th className="py-2 text-start">{isAr ? 'الباقة' : 'Plan'}</th>
                <th className="py-2 text-start">{isAr ? 'الانتهاء' : 'Expires'}</th>
                <th className="py-2 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-2 text-start">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {developerSubscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="py-3">
                    <p className="font-bold">{sub.restaurantName}</p>
                    <p className="text-xs text-slate-400">
                      {sub.clientName} {sub.phone ? `• ${sub.phone}` : ''}
                    </p>
                  </td>
                  <td className="py-3 font-mono text-xs">{sub.deviceId}</td>
                  <td className="py-3 uppercase text-xs font-bold">{sub.plan}</td>
                  <td className="py-3 text-xs">
                    {sub.plan === 'lifetime' ? '∞' : new Date(sub.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-lg font-bold ${
                        sub.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : sub.status === 'suspended'
                          ? 'bg-red-500/15 text-red-500'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRenew(sub)}
                        title={isAr ? 'تجديد' : 'Renew'}
                        className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      {sub.licenseKey && (
                        <button
                          onClick={() => copyText(sub.licenseKey, sub.id)}
                          title={isAr ? 'نسخ المفتاح' : 'Copy Key'}
                          className="p-1.5 rounded-lg bg-purple-500/15 text-purple-500 hover:bg-purple-500/25"
                        >
                          {copiedId === sub.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          updateDeveloperSubscription(sub.id, {
                            status: sub.status === 'suspended' ? 'active' : 'suspended',
                          })
                        }
                        title={isAr ? 'إيقاف/تفعيل' : 'Suspend/Activate'}
                        className="p-1.5 rounded-lg bg-red-500/15 text-red-500 hover:bg-red-500/25"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
