import { describe, expect, it } from 'vitest';
import { normalizeWhatsAppPhone, whatsappUrl } from '../whatsapp';

describe('WhatsApp sharing', () => {
  it('normalizes local Egyptian, international and Arabic-digit numbers', () => {
    expect(normalizeWhatsAppPhone('01012345678')).toBe('201012345678');
    expect(normalizeWhatsAppPhone('+20 101 234 5678')).toBe('201012345678');
    expect(normalizeWhatsAppPhone('٠١٠١٢٣٤٥٦٧٨')).toBe('201012345678');
    expect(normalizeWhatsAppPhone('00966501234567')).toBe('966501234567');
  });
  it('rejects invalid numbers and encodes the message', () => {
    expect(normalizeWhatsAppPhone('abc')).toBeNull();
    expect(normalizeWhatsAppPhone('123')).toBeNull();
    expect(whatsappUrl('عرض & منيو', '201012345678')).toBe('https://wa.me/201012345678?text=%D8%B9%D8%B1%D8%B6%20%26%20%D9%85%D9%86%D9%8A%D9%88');
    expect(whatsappUrl('menu')).toBe('https://wa.me/?text=menu');
  });
});
