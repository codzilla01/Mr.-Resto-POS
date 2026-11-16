import nacl from 'tweetnacl';
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { LicensePayload, SignedLicense } from '@/types/pos';

// Embedded Ed25519 Keypair for Demo/Production-ready Offline Verification
// In a real commercial build, ONLY DEV_PUBLIC_KEY_B64 is shipped in the POS client,
// while DEV_SECRET_KEY_B64 lives exclusively in the Developer License Manager.
const SEED_BYTES = new Uint8Array([
  82, 101, 115, 116, 97, 117, 114, 97, 110, 116, 80, 79, 83, 50, 48, 50,
  54, 69, 100, 50, 53, 53, 49, 57, 83, 101, 99, 114, 101, 116, 75, 101,
]);

const KEYPAIR = nacl.sign.keyPair.fromSeed(SEED_BYTES);

export const DEV_PUBLIC_KEY_B64 = encodeBase64(KEYPAIR.publicKey);
export const DEV_SECRET_KEY_B64 = encodeBase64(KEYPAIR.secretKey);

export function signLicense(payload: LicensePayload, secretKeyB64: string = DEV_SECRET_KEY_B64): string {
  const messageBytes = decodeUTF8(JSON.stringify(payload));
  const secretKey = decodeBase64(secretKeyB64);
  const signatureBytes = nacl.sign.detached(messageBytes, secretKey);
  const signed: SignedLicense = {
    payload,
    signature: encodeBase64(signatureBytes),
  };
  return encodeBase64(decodeUTF8(JSON.stringify(signed)));
}

export interface LicenseVerificationResult {
  valid: boolean;
  reason?: 'invalid_format' | 'invalid_signature' | 'device_mismatch' | 'expired' | 'max_invoices_reached' | 'clock_tampered';
  payload?: LicensePayload;
  daysRemaining?: number;
}

export function verifyLicense(
  licenseKeyB64: string,
  currentDeviceId: string,
  currentInvoicesCount: number = 0,
  lastSeenTimestamp?: number,
  publicKeyB64: string = DEV_PUBLIC_KEY_B64
): LicenseVerificationResult {
  try {
    const jsonStr = encodeUTF8(decodeBase64(licenseKeyB64.trim()));
    const signed: SignedLicense = JSON.parse(jsonStr);
    if (!signed?.payload || !signed?.signature) {
      return { valid: false, reason: 'invalid_format' };
    }

    const messageBytes = decodeUTF8(JSON.stringify(signed.payload));
    const sigBytes = decodeBase64(signed.signature);
    const pubBytes = decodeBase64(publicKeyB64);

    const isSigValid = nacl.sign.detached.verify(messageBytes, sigBytes, pubBytes);
    if (!isSigValid) {
      return { valid: false, reason: 'invalid_signature' };
    }

    if (signed.payload.deviceId !== currentDeviceId && signed.payload.deviceId !== '*') {
      return { valid: false, reason: 'device_mismatch', payload: signed.payload };
    }

    const now = Date.now();
    if (lastSeenTimestamp && now < lastSeenTimestamp - 60 * 60 * 1000) {
      return { valid: false, reason: 'clock_tampered', payload: signed.payload };
    }

    const expiresAtMs = new Date(signed.payload.expiresAt).getTime();
    if (signed.payload.plan !== 'lifetime' && now > expiresAtMs) {
      return { valid: false, reason: 'expired', payload: signed.payload, daysRemaining: 0 };
    }

    if (signed.payload.maxInvoices && currentInvoicesCount >= signed.payload.maxInvoices) {
      return { valid: false, reason: 'max_invoices_reached', payload: signed.payload };
    }

    const daysRemaining =
      signed.payload.plan === 'lifetime'
        ? 9999
        : Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));

    return { valid: true, payload: signed.payload, daysRemaining };
  } catch {
    return { valid: false, reason: 'invalid_format' };
  }
}

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'DEV-SERVER-0001';
  const stored = localStorage.getItem('pos_device_fp');
  if (stored) return stored;

  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 4,
    Math.random().toString(36).slice(2, 8),
  ].join('|');

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const fp = `POS-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
  localStorage.setItem('pos_device_fp', fp);
  return fp;
}

export function encryptBackup(data: unknown): string {
  const json = JSON.stringify(data);
  const bytes = decodeUTF8(json);
  const key = 0x5a;
  const xored = bytes.map((b, i) => b ^ ((key + i) % 256));
  return `BKZ1:${encodeBase64(xored)}`;
}

export function decryptBackup<T = unknown>(bkzString: string): T {
  if (!bkzString.startsWith('BKZ1:')) {
    throw new Error('Invalid backup format');
  }
  const raw = decodeBase64(bkzString.slice(5));
  const key = 0x5a;
  const restored = raw.map((b, i) => b ^ ((key + i) % 256));
  return JSON.parse(encodeUTF8(restored)) as T;
}
