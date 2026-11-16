import { describe, it, expect } from 'vitest';
import { signLicense, verifyLicense, encryptBackup, decryptBackup } from '../crypto';
import { LicensePayload } from '@/types/pos';

describe('Ed25519 License & Backup Cryptography', () => {
  const basePayload: LicensePayload = {
    licenseId: 'LIC-TEST-001',
    clientName: 'Test Restaurant',
    deviceId: 'POS-ABCD1234',
    plan: 'yearly',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    branch_id: 'branch-main-01',
  };

  it('signs and verifies a valid license for the matching device', () => {
    const key = signLicense(basePayload);
    const res = verifyLicense(key, 'POS-ABCD1234');
    expect(res.valid).toBe(true);
    expect(res.payload?.licenseId).toBe('LIC-TEST-001');
    expect(res.daysRemaining).toBeGreaterThan(0);
  });

  it('rejects a license when deviceId does not match', () => {
    const key = signLicense(basePayload);
    const res = verifyLicense(key, 'POS-DIFFERENT');
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('device_mismatch');
  });

  it('rejects an expired license', () => {
    const expiredPayload: LicensePayload = {
      ...basePayload,
      expiresAt: new Date(Date.now() - 86400000).toISOString(),
    };
    const key = signLicense(expiredPayload);
    const res = verifyLicense(key, 'POS-ABCD1234');
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('expired');
  });

  it('rejects a tampered license key', () => {
    const key = signLicense(basePayload);
    const tampered = key.slice(0, -4) + 'AAAA';
    const res = verifyLicense(tampered, 'POS-ABCD1234');
    expect(res.valid).toBe(false);
  });

  it('detects system clock tampering', () => {
    const key = signLicense(basePayload);
    const futureLastSeen = Date.now() + 5 * 3600 * 1000; // 5 hours ahead
    const res = verifyLicense(key, 'POS-ABCD1234', 0, futureLastSeen);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('clock_tampered');
  });

  it('accepts a lifetime license', () => {
    const lifetimePayload: LicensePayload = {
      ...basePayload,
      plan: 'lifetime',
    };
    const key = signLicense(lifetimePayload);
    const res = verifyLicense(key, 'POS-ABCD1234');
    expect(res.valid).toBe(true);
    expect(res.daysRemaining).toBe(9999);
  });

  it('encrypts and decrypts .bkz backup data cleanly', () => {
    const sample = { orders: [1, 2, 3], name: 'مطعم الشيف' };
    const bkz = encryptBackup(sample);
    expect(bkz.startsWith('BKZ1:')).toBe(true);
    const restored = decryptBackup<typeof sample>(bkz);
    expect(restored).toEqual(sample);
  });
});
