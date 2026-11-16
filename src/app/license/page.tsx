'use client';

import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

export default function LicensePage() {
  const { lang, deviceId, licenseStatus, activateLicense } = usePOS();
  const isAr = lang === 'ar';

  const [keyInput, setKeyInput] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    const res = activateLicense(keyInput);
    if (res.valid) {
      setMessage({
        ok: true,
        text: isAr ? 'تم تفعيل الترخيص بنجاح!' : 'License activated successfully!',
      });
      setKeyInput('');
    } else {
      setMessage({
        ok: false,
        text: isAr ? `فشل التفعيل: ${res.reason}` : `Activation failed: ${res.reason}`,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-orange-500" />
            {isAr ? 'حالة الترخيص والتفعيل (Ed25519 Offline)' : 'License & Activation (Ed25519 Offline)'}
          </h2>
          {licenseStatus.valid ? (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {isAr ? 'مفعّل' : 'Active'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-500 font-bold">
              <AlertTriangle className="w-4 h-4" />
              {isAr ? 'غير صالح' : 'Invalid'}
            </span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{isAr ? 'بصمة الجهاز (Device ID):' : 'Device Fingerprint:'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(deviceId)}
              className="font-mono font-bold text-orange-500 flex items-center gap-1.5 hover:underline"
            >
              <span>{deviceId}</span>
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          {licenseStatus.payload && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الباقة:' : 'Plan:'}</span>
                <span className="font-bold uppercase">{licenseStatus.payload.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'تاريخ الانتهاء:' : 'Expires At:'}</span>
                <span className="font-bold">
                  {licenseStatus.payload.plan === 'lifetime'
                    ? isAr
                      ? 'مدى الحياة'
                      : 'Lifetime'
                    : new Date(licenseStatus.payload.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleActivate} className="space-y-3">
          <label className="block text-sm font-bold">
            {isAr ? 'أدخل مفتاح التفعيل الموقّع من المطور:' : 'Enter Developer Signed License Key:'}
          </label>
          <textarea
            rows={4}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={isAr ? 'الصق مفتاح الترخيص هنا...' : 'Paste license key here...'}
            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm"
          >
            {isAr ? 'تفعيل الترخيص' : 'Activate License'}
          </button>
          {message && (
            <p className={`text-sm font-bold ${message.ok ? 'text-emerald-500' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
