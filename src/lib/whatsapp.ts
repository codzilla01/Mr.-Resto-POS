/** Normalise Egyptian local mobile numbers or an international number with its country code. */
export function normalizeWhatsAppPhone(input: string): string | null {
  const digits = input.trim().replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
  if (!/^[+\d\s().-]+$/.test(digits)) return null;
  let number = digits.replace(/[^\d]/g, '');
  if (number.startsWith('00')) number = number.slice(2);
  else if (/^01[0125]\d{8}$/.test(number)) number = '2' + number;
  if (!/^[1-9]\d{7,14}$/.test(number)) return null;
  return number;
}

export function whatsappUrl(message: string, phone?: string): string {
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(message)}`;
}
