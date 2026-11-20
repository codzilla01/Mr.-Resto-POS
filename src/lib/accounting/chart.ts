/** Domain model for a chart of accounts. This module does not persist or authorize data. */
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: AccountType;
  parentId: string | null;
  /** Only leaf accounts marked as posting may receive journal entries. */
  posting: boolean;
}

export const DEFAULT_CHART: readonly Account[] = [
  { id: 'assets', code: '1', nameAr: 'الأصول', nameEn: 'Assets', type: 'asset', parentId: null, posting: false },
  { id: 'cash', code: '1101', nameAr: 'الصندوق', nameEn: 'Cash', type: 'asset', parentId: 'assets', posting: true },
  { id: 'bank', code: '1102', nameAr: 'البنك', nameEn: 'Bank', type: 'asset', parentId: 'assets', posting: true },
  { id: 'inventory', code: '1201', nameAr: 'المخزون', nameEn: 'Inventory', type: 'asset', parentId: 'assets', posting: true },
  { id: 'liabilities', code: '2', nameAr: 'الخصوم', nameEn: 'Liabilities', type: 'liability', parentId: null, posting: false },
  { id: 'payables', code: '2101', nameAr: 'الدائنون', nameEn: 'Accounts payable', type: 'liability', parentId: 'liabilities', posting: true },
  { id: 'equity', code: '3', nameAr: 'حقوق الملكية', nameEn: 'Equity', type: 'equity', parentId: null, posting: false },
  { id: 'capital', code: '3101', nameAr: 'رأس المال', nameEn: 'Capital', type: 'equity', parentId: 'equity', posting: true },
  { id: 'revenue', code: '4', nameAr: 'الإيرادات', nameEn: 'Revenue', type: 'revenue', parentId: null, posting: false },
  { id: 'sales', code: '4101', nameAr: 'المبيعات', nameEn: 'Sales', type: 'revenue', parentId: 'revenue', posting: true },
  { id: 'expenses', code: '5', nameAr: 'المصروفات', nameEn: 'Expenses', type: 'expense', parentId: null, posting: false },
  { id: 'cost-of-sales', code: '5101', nameAr: 'تكلفة المبيعات', nameEn: 'Cost of sales', type: 'expense', parentId: 'expenses', posting: true },
  { id: 'operating-expenses', code: '5201', nameAr: 'مصروفات التشغيل', nameEn: 'Operating expenses', type: 'expense', parentId: 'expenses', posting: true },
];

/** Validate the entire chart before committing changes; callers must enforce authorization separately. */
export function validateChart(accounts: readonly Account[]): string[] {
  const errors: string[] = [];
  const byId = new Map<string, Account>();
  const codes = new Set<string>();
  for (const account of accounts) {
    if (!account.id.trim() || byId.has(account.id)) errors.push(`Invalid or duplicate account id: ${account.id}`);
    else byId.set(account.id, account);
    if (!/^\d{1,20}$/.test(account.code) || codes.has(account.code)) errors.push(`Invalid or duplicate account code: ${account.code}`);
    codes.add(account.code);
    if (!account.nameAr.trim() || !account.nameEn.trim()) errors.push(`Account ${account.id} requires both names`);
    if (!['asset', 'liability', 'equity', 'revenue', 'expense'].includes(account.type)) errors.push(`Invalid account type: ${account.id}`);
  }
  for (const account of accounts) {
    if (account.parentId === null) continue;
    const parent = byId.get(account.parentId);
    if (!parent) { errors.push(`Missing parent for ${account.id}`); continue; }
    if (parent.type !== account.type) errors.push(`Account type differs from parent: ${account.id}`);
    if (parent.posting) errors.push(`Posting account cannot have children: ${parent.id}`);
    const visited = new Set([account.id]);
    let current: Account | undefined = parent;
    while (current) {
      if (visited.has(current.id)) { errors.push(`Account cycle: ${account.id}`); break; }
      visited.add(current.id);
      current = current.parentId === null ? undefined : byId.get(current.parentId);
    }
  }
  return errors;
}
