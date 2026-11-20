import { describe, expect, it } from 'vitest';
import { Account, DEFAULT_CHART, validateChart } from '../accounting/chart';

describe('chart of accounts validation', () => {
  it('provides a valid restaurant chart with five major account types', () => {
    expect(validateChart(DEFAULT_CHART)).toEqual([]);
    expect(new Set(DEFAULT_CHART.filter(a => a.parentId === null).map(a => a.type)).size).toBe(5);
  });
  it('rejects duplicate codes and missing parents', () => {
    const extra: Account = { id: 'extra', code: '1', nameAr: 'إضافي', nameEn: 'Extra', type: 'asset', parentId: 'missing', posting: true };
    expect(validateChart([...DEFAULT_CHART, extra])).toEqual(expect.arrayContaining(['Invalid or duplicate account code: 1', 'Missing parent for extra']));
  });
  it('rejects cycles, mixed account types and children under posting accounts', () => {
    const a: Account = { id: 'a', code: '11', nameAr: 'أ', nameEn: 'A', type: 'asset', parentId: 'b', posting: false };
    const b: Account = { id: 'b', code: '12', nameAr: 'ب', nameEn: 'B', type: 'asset', parentId: 'a', posting: false };
    const c: Account = { id: 'c', code: '13', nameAr: 'ج', nameEn: 'C', type: 'expense', parentId: 'cash', posting: true };
    expect(validateChart([...DEFAULT_CHART, a, b, c])).toEqual(expect.arrayContaining(['Account cycle: a', 'Account cycle: b', 'Account type differs from parent: c', 'Posting account cannot have children: cash']));
  });
});
