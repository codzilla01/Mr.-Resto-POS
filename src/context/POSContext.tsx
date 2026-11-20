'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AuditLog,
  Category,
  Customer,
  DeveloperSubscription,
  Ingredient,
  KDSStatus,
  Language,
  MenuItem,
  Order,
  Role,
  Shift,
  Table,
  TableStatus,
  Theme,
  WasteLog,
} from '@/types/pos';
import {
  createInitialShift,
  createSeedDeveloperSubscriptions,
  createTrialLicense,
  DEFAULT_BRANCH_ID,
  SEED_CATEGORIES,
  SEED_CUSTOMERS,
  SEED_INGREDIENTS,
  SEED_MENU_ITEMS,
  SEED_TABLES,
} from '@/lib/seed';
import {
  decryptBackup,
  encryptBackup,
  getDeviceFingerprint,
  LicenseVerificationResult,
  verifyLicense,
} from '@/lib/crypto';

interface POSState {
  categories: Category[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  tables: Table[];
  orders: Order[];
  customers: Customer[];
  shifts: Shift[];
  wasteLogs: WasteLog[];
  auditLogs: AuditLog[];
  licenseKey: string;
  developerSubscriptions: DeveloperSubscription[];
}

interface POSContextValue extends POSState {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  role: Role;
  setRole: (r: Role) => void;
  deviceId: string;
  licenseStatus: LicenseVerificationResult;
  activeShift: Shift | undefined;
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'branch_id' | 'shiftId'>) => Order;
  updateKDSStatus: (orderId: string, status: KDSStatus) => void;
  updateTableStatus: (tableId: string, status: TableStatus, orderId?: string) => void;
  transferTable: (fromTableId: string, toTableId: string) => void;
  closeShift: (closingCash: number) => void;
  logWaste: (ingredientId: string, quantity: number, reason: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'branch_id' | 'loyaltyPoints' | 'totalSpent' | 'ordersCount'>) => Customer;
  activateLicense: (key: string) => LicenseVerificationResult;
  addDeveloperSubscription: (sub: DeveloperSubscription) => void;
  updateDeveloperSubscription: (id: string, patch: Partial<DeveloperSubscription>) => void;
  exportBackup: () => string;
  importBackup: (bkzContent: string) => boolean;
  addAuditLog: (action: string, details: string) => void;
  resetDemoData: () => void;
}

const POSContext = createContext<POSContextValue | null>(null);
const STORAGE_KEY = 'restaurant_pos_state_v1';

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('dark');
  const [role, setRole] = useState<Role>('cashier');
  const [deviceId, setDeviceId] = useState<string>('POS-LOADING');
  const [hydrated, setHydrated] = useState(false);

  const [state, setState] = useState<POSState>({
    categories: SEED_CATEGORIES,
    menuItems: SEED_MENU_ITEMS,
    ingredients: SEED_INGREDIENTS,
    tables: SEED_TABLES,
    orders: [],
    customers: SEED_CUSTOMERS,
    shifts: [],
    wasteLogs: [],
    auditLogs: [],
    licenseKey: '',
    developerSubscriptions: [],
  });

  useEffect(() => {
    const fp = getDeviceFingerprint();
    setDeviceId(fp);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as POSState;
        setState(parsed);
      } catch {
        const trialKey = createTrialLicense(fp);
        setState((prev) => ({
          ...prev,
          shifts: [createInitialShift()],
          licenseKey: trialKey,
          developerSubscriptions: createSeedDeveloperSubscriptions(fp),
        }));
      }
    } else {
      const trialKey = createTrialLicense(fp);
      setState((prev) => ({
        ...prev,
        shifts: [createInitialShift()],
        licenseKey: trialKey,
        developerSubscriptions: createSeedDeveloperSubscriptions(fp),
      }));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('pos_last_seen_ts', String(Date.now()));
  }, [state, hydrated]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const lastSeenTs = typeof window !== 'undefined' ? Number(localStorage.getItem('pos_last_seen_ts') || 0) : 0;
  const licenseStatus = verifyLicense(state.licenseKey, deviceId, state.orders.length, lastSeenTs || undefined);
  const activeShift = state.shifts.find((s) => s.status === 'open');

  const addAuditLog = useCallback(
    (action: string, details: string) => {
      const entry: AuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        branch_id: DEFAULT_BRANCH_ID,
        action,
        details,
        userName: role.toUpperCase(),
        role,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, auditLogs: [entry, ...prev.auditLogs].slice(0, 200) }));
    },
    [role]
  );

  const createOrder = useCallback(
    (orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'branch_id' | 'shiftId'>): Order => {
      const currentShiftId = activeShift?.id || createInitialShift().id;
      const nextNum = state.orders.length > 0 ? Math.max(...state.orders.map((o) => o.orderNumber)) + 1 : 1001;
      const newOrder: Order = {
        ...orderInput,
        id: `ord-${Date.now()}`,
        branch_id: DEFAULT_BRANCH_ID,
        orderNumber: nextNum,
        createdAt: new Date().toISOString(),
        shiftId: currentShiftId,
      };

      setState((prev) => {
        // Deduct recipe ingredients
        const updatedIngredients = prev.ingredients.map((ing) => {
          let used = 0;
          for (const item of newOrder.items) {
            const menu = prev.menuItems.find((m) => m.id === item.menuItemId);
            const rec = menu?.recipe.find((r) => r.ingredientId === ing.id);
            if (rec) used += rec.quantity * item.quantity;
          }
          return used > 0 ? { ...ing, stock: Math.max(0, Number((ing.stock - used).toFixed(3))) } : ing;
        });

        // Update table if dine_in
        const updatedTables = prev.tables.map((t) =>
          newOrder.tableId && t.id === newOrder.tableId
            ? {
                ...t,
                status: (newOrder.status === 'paid' ? 'available' : 'occupied') as TableStatus,
                currentOrderId: newOrder.status === 'paid' ? undefined : newOrder.id,
              }
            : t
        );

        // Update customer loyalty
        const updatedCustomers = prev.customers.map((c) =>
          newOrder.customerId && c.id === newOrder.customerId
            ? {
                ...c,
                loyaltyPoints: c.loyaltyPoints + Math.floor(newOrder.total / 10),
                totalSpent: c.totalSpent + newOrder.total,
                ordersCount: c.ordersCount + 1,
                lastVisit: newOrder.createdAt,
              }
            : c
        );

        // Update active shift
        const updatedShifts = prev.shifts.map((s) =>
          s.id === currentShiftId
            ? {
                ...s,
                totalSales: s.totalSales + (newOrder.status === 'paid' ? newOrder.total : 0),
                ordersCount: s.ordersCount + 1,
              }
            : s
        );

        const auditEntry: AuditLog = {
          id: `aud-${Date.now()}`,
          branch_id: DEFAULT_BRANCH_ID,
          action: 'CREATE_ORDER',
          details: `Order #${nextNum} (${newOrder.orderType}) - ${newOrder.total.toFixed(2)}`,
          userName: newOrder.cashierName,
          role,
          createdAt: newOrder.createdAt,
        };

        return {
          ...prev,
          orders: [newOrder, ...prev.orders],
          ingredients: updatedIngredients,
          tables: updatedTables,
          customers: updatedCustomers,
          shifts: updatedShifts,
          auditLogs: [auditEntry, ...prev.auditLogs].slice(0, 200),
        };
      });

      return newOrder;
    },
    [activeShift, role, state.orders]
  );

  const updateKDSStatus = useCallback((orderId: string, status: KDSStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, kdsStatus: status } : o)),
    }));
  }, []);

  const updateTableStatus = useCallback((tableId: string, status: TableStatus, orderId?: string) => {
    setState((prev) => ({
      ...prev,
      tables: prev.tables.map((t) =>
        t.id === tableId ? { ...t, status, currentOrderId: status === 'available' ? undefined : orderId ?? t.currentOrderId } : t
      ),
    }));
  }, []);

  const transferTable = useCallback((fromTableId: string, toTableId: string) => {
    setState((prev) => {
      const from = prev.tables.find((t) => t.id === fromTableId);
      if (!from || !from.currentOrderId) return prev;
      const to = prev.tables.find((t) => t.id === toTableId);
      if (!to) return prev;

      return {
        ...prev,
        tables: prev.tables.map((t) => {
          if (t.id === fromTableId) return { ...t, status: 'available', currentOrderId: undefined };
          if (t.id === toTableId) return { ...t, status: from.status, currentOrderId: from.currentOrderId };
          return t;
        }),
        orders: prev.orders.map((o) =>
          o.id === from.currentOrderId ? { ...o, tableId: to.id, tableNumber: to.number } : o
        ),
      };
    });
  }, []);

  const closeShift = useCallback((closingCash: number) => {
    setState((prev) => {
      const open = prev.shifts.find((s) => s.status === 'open');
      if (!open) return prev;
      const closed: Shift = {
        ...open,
        status: 'closed',
        closedAt: new Date().toISOString(),
        closingCash,
        expectedCash: open.openingCash + open.totalSales,
      };
      return {
        ...prev,
        shifts: [createInitialShift(), closed, ...prev.shifts.filter((s) => s.id !== open.id)],
      };
    });
    addAuditLog('CLOSE_SHIFT', `Closed shift with cash ${closingCash}`);
  }, [addAuditLog]);

  const logWaste = useCallback(
    (ingredientId: string, quantity: number, reason: string) => {
      setState((prev) => {
        const ing = prev.ingredients.find((i) => i.id === ingredientId);
        if (!ing) return prev;
        const entry: WasteLog = {
          id: `wst-${Date.now()}`,
          branch_id: DEFAULT_BRANCH_ID,
          ingredientId,
          ingredientName: lang === 'ar' ? ing.nameAr : ing.nameEn,
          quantity,
          reason,
          createdAt: new Date().toISOString(),
          userName: role.toUpperCase(),
        };
        return {
          ...prev,
          ingredients: prev.ingredients.map((i) =>
            i.id === ingredientId ? { ...i, stock: Math.max(0, i.stock - quantity) } : i
          ),
          wasteLogs: [entry, ...prev.wasteLogs],
        };
      });
      addAuditLog('LOG_WASTE', `Ingredient ${ingredientId} qty ${quantity}: ${reason}`);
    },
    [addAuditLog, lang, role]
  );

  const addCustomer = useCallback(
    (input: Omit<Customer, 'id' | 'branch_id' | 'loyaltyPoints' | 'totalSpent' | 'ordersCount'>): Customer => {
      const created: Customer = {
        ...input,
        id: `cust-${Date.now()}`,
        branch_id: DEFAULT_BRANCH_ID,
        loyaltyPoints: 0,
        totalSpent: 0,
        ordersCount: 0,
      };
      setState((prev) => ({ ...prev, customers: [created, ...prev.customers] }));
      return created;
    },
    []
  );

  const activateLicense = useCallback(
    (key: string): LicenseVerificationResult => {
      const res = verifyLicense(key, deviceId, state.orders.length);
      if (res.valid) {
        setState((prev) => ({ ...prev, licenseKey: key.trim() }));
        addAuditLog('ACTIVATE_LICENSE', `Activated plan: ${res.payload?.plan}`);
      }
      return res;
    },
    [addAuditLog, deviceId, state.orders.length]
  );

  const addDeveloperSubscription = useCallback((sub: DeveloperSubscription) => {
    setState((prev) => ({ ...prev, developerSubscriptions: [sub, ...prev.developerSubscriptions] }));
  }, []);

  const updateDeveloperSubscription = useCallback((id: string, patch: Partial<DeveloperSubscription>) => {
    setState((prev) => ({
      ...prev,
      developerSubscriptions: prev.developerSubscriptions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const exportBackup = useCallback(() => {
    return encryptBackup(state);
  }, [state]);

  const importBackup = useCallback((bkzContent: string): boolean => {
    try {
      const restored = decryptBackup<POSState>(bkzContent);
      if (!restored || !Array.isArray(restored.menuItems)) return false;
      setState(restored);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetDemoData = useCallback(() => {
    const trialKey = createTrialLicense(deviceId);
    setState({
      categories: SEED_CATEGORIES,
      menuItems: SEED_MENU_ITEMS,
      ingredients: SEED_INGREDIENTS,
      tables: SEED_TABLES,
      orders: [],
      customers: SEED_CUSTOMERS,
      shifts: [createInitialShift()],
      wasteLogs: [],
      auditLogs: [],
      licenseKey: trialKey,
      developerSubscriptions: createSeedDeveloperSubscriptions(deviceId),
    });
  }, [deviceId]);

  return (
    <POSContext.Provider
      value={{
        ...state,
        lang,
        setLang,
        theme,
        setTheme,
        role,
        setRole,
        deviceId,
        licenseStatus,
        activeShift,
        createOrder,
        updateKDSStatus,
        updateTableStatus,
        transferTable,
        closeShift,
        logWaste,
        addCustomer,
        activateLicense,
        addDeveloperSubscription,
        updateDeveloperSubscription,
        exportBackup,
        importBackup,
        addAuditLog,
        resetDemoData,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error('usePOS must be used within POSProvider');
  return ctx;
}
