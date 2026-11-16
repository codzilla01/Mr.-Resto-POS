import { Category, Customer, DeveloperSubscription, Ingredient, MenuItem, Shift, Table } from '@/types/pos';
import { signLicense } from './crypto';

export const DEFAULT_BRANCH_ID = 'branch-main-01';

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', branch_id: DEFAULT_BRANCH_ID, nameAr: 'برجر وساندوتشات', nameEn: 'Burgers & Sandwiches', color: '#f97316', sortOrder: 1 },
  { id: 'cat-2', branch_id: DEFAULT_BRANCH_ID, nameAr: 'مشويات', nameEn: 'Grills', color: '#ef4444', sortOrder: 2 },
  { id: 'cat-3', branch_id: DEFAULT_BRANCH_ID, nameAr: 'بيتزا', nameEn: 'Pizza', color: '#eab308', sortOrder: 3 },
  { id: 'cat-4', branch_id: DEFAULT_BRANCH_ID, nameAr: 'مشروبات', nameEn: 'Drinks', color: '#3b82f6', sortOrder: 4 },
  { id: 'cat-5', branch_id: DEFAULT_BRANCH_ID, nameAr: 'حلويات', nameEn: 'Desserts', color: '#ec4899', sortOrder: 5 },
];

export const SEED_INGREDIENTS: Ingredient[] = [
  { id: 'ing-1', branch_id: DEFAULT_BRANCH_ID, nameAr: 'لحم برجر طازج', nameEn: 'Beef Patty', unit: 'pcs', stock: 120, reorderLevel: 25, costPerUnit: 35 },
  { id: 'ing-2', branch_id: DEFAULT_BRANCH_ID, nameAr: 'خبز برجر بريوش', nameEn: 'Brioche Bun', unit: 'pcs', stock: 140, reorderLevel: 30, costPerUnit: 8 },
  { id: 'ing-3', branch_id: DEFAULT_BRANCH_ID, nameAr: 'جبنة شيدر', nameEn: 'Cheddar Cheese', unit: 'slice', stock: 200, reorderLevel: 40, costPerUnit: 6 },
  { id: 'ing-4', branch_id: DEFAULT_BRANCH_ID, nameAr: 'صدور دجاج', nameEn: 'Chicken Breast', unit: 'kg', stock: 25, reorderLevel: 5, costPerUnit: 180 },
  { id: 'ing-5', branch_id: DEFAULT_BRANCH_ID, nameAr: 'عجينة بيتزا', nameEn: 'Pizza Dough', unit: 'pcs', stock: 60, reorderLevel: 15, costPerUnit: 15 },
  { id: 'ing-6', branch_id: DEFAULT_BRANCH_ID, nameAr: 'جبنة موزاريلا', nameEn: 'Mozzarella', unit: 'kg', stock: 18, reorderLevel: 4, costPerUnit: 220 },
  { id: 'ing-7', branch_id: DEFAULT_BRANCH_ID, nameAr: 'بن إسبريسو', nameEn: 'Espresso Beans', unit: 'kg', stock: 8, reorderLevel: 2, costPerUnit: 650 },
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    branch_id: DEFAULT_BRANCH_ID,
    categoryId: 'cat-1',
    nameAr: 'كلاسيك بيف برجر',
    nameEn: 'Classic Beef Burger',
    price: 165,
    cost: 65,
    taxRate: 14,
    kitchenStation: 'grill',
    available: true,
    modifiers: [
      { id: 'mod-1', nameAr: 'جبنة إضافية', nameEn: 'Extra Cheese', price: 20 },
      { id: 'mod-2', nameAr: 'دبل لحم', nameEn: 'Double Patty', price: 65 },
      { id: 'mod-3', nameAr: 'بدون بصل', nameEn: 'No Onion', price: 0 },
    ],
    recipe: [
      { ingredientId: 'ing-1', quantity: 1 },
      { ingredientId: 'ing-2', quantity: 1 },
      { ingredientId: 'ing-3', quantity: 1 },
    ],
  },
  {
    id: 'item-2',
    branch_id: DEFAULT_BRANCH_ID,
    categoryId: 'cat-1',
    nameAr: 'كريسبي تشيكن برجر',
    nameEn: 'Crispy Chicken Burger',
    price: 145,
    cost: 55,
    taxRate: 14,
    kitchenStation: 'kitchen',
    available: true,
    modifiers: [
      { id: 'mod-1', nameAr: 'جبنة إضافية', nameEn: 'Extra Cheese', price: 20 },
      { id: 'mod-4', nameAr: 'سبايسي', nameEn: 'Spicy', price: 5 },
    ],
    recipe: [
      { ingredientId: 'ing-2', quantity: 1 },
      { ingredientId: 'ing-4', quantity: 0.2 },
    ],
  },
  {
    id: 'item-3',
    branch_id: DEFAULT_BRANCH_ID,
    categoryId: 'cat-2',
    nameAr: 'كباب مشوي على الفحم',
    nameEn: 'Charcoal Grilled Kebab',
    price: 320,
    cost: 140,
    taxRate: 14,
    kitchenStation: 'grill',
    available: true,
    modifiers: [
      { id: 'mod-5', nameAr: 'أرز بسمتي إضافي', nameEn: 'Extra Basmati Rice', price: 35 },
    ],
    recipe: [{ ingredientId: 'ing-1', quantity: 2 }],
  },
  {
    id: 'item-4',
    branch_id: DEFAULT_BRANCH_ID,
    categoryId: 'cat-3',
    nameAr: 'بيتزا مارجريتا',
    nameEn: 'Margherita Pizza',
    price: 180,
    cost: 60,
    taxRate: 14,
    kitchenStation: 'kitchen',
    available: true,
    modifiers: [
      { id: 'mod-6', nameAr: 'حجم كبير', nameEn: 'Large Size', price: 45 },
      { id: 'mod-7', nameAr: 'أطراف محشية', nameEn: 'Stuffed Crust', price: 35 },
    ],
    recipe: [
      { ingredientId: 'ing-5', quantity: 1 },
      { ingredientId: 'ing-6', quantity: 0.15 },
    ],
  },
  {
    id: 'item-5',
    branch_id: DEFAULT_BRANCH_ID,
    categoryId: 'cat-4',
    nameAr: 'آيس سبانيش لاتيه',
    nameEn: 'Iced Spanish Latte',
    price: 85,
    cost: 22,
    taxRate: 14,
    kitchenStation: 'bar',
    available: true,
    modifiers: [
      { id: 'mod-8', nameAr: 'حليب شوفان', nameEn: 'Oat Milk', price: 20 },
      { id: 'mod-9', nameAr: 'إكسترا شوت', nameEn: 'Extra Shot', price: 15 },
    ],
    recipe: [{ ingredientId: 'ing-7', quantity: 0.02 }],
  },
  {
    id: 'item-6',
    branch_id: DEFAULT_BRANCH_ID,
    categoryId: 'cat-4',
    nameAr: 'موهيتو ليمون نعناع',
    nameEn: 'Lemon Mint Mojito',
    price: 65,
    cost: 15,
    taxRate: 14,
    kitchenStation: 'bar',
    available: true,
    modifiers: [],
    recipe: [],
  },
  {
    id: 'item-7',
    branch_id: DEFAULT_BRANCH_ID,
    categoryId: 'cat-5',
    nameAr: 'مولتن كيك شوكولاتة',
    nameEn: 'Chocolate Molten Cake',
    price: 110,
    cost: 38,
    taxRate: 14,
    kitchenStation: 'kitchen',
    available: true,
    modifiers: [{ id: 'mod-10', nameAr: 'بولة آيس كريم', nameEn: 'Ice Cream Scoop', price: 25 }],
    recipe: [],
  },
];

export const SEED_TABLES: Table[] = [
  { id: 'tbl-1', branch_id: DEFAULT_BRANCH_ID, number: 'T1', capacity: 2, status: 'available', section: 'Main Hall' },
  { id: 'tbl-2', branch_id: DEFAULT_BRANCH_ID, number: 'T2', capacity: 4, status: 'available', section: 'Main Hall' },
  { id: 'tbl-3', branch_id: DEFAULT_BRANCH_ID, number: 'T3', capacity: 4, status: 'available', section: 'Main Hall' },
  { id: 'tbl-4', branch_id: DEFAULT_BRANCH_ID, number: 'T4', capacity: 6, status: 'reserved', section: 'Main Hall' },
  { id: 'tbl-5', branch_id: DEFAULT_BRANCH_ID, number: 'VIP-1', capacity: 8, status: 'available', section: 'VIP' },
  { id: 'tbl-6', branch_id: DEFAULT_BRANCH_ID, number: 'OUT-1', capacity: 4, status: 'available', section: 'Terrace' },
];

export const SEED_CUSTOMERS: Customer[] = [
  { id: 'cust-1', branch_id: DEFAULT_BRANCH_ID, name: 'أحمد محمود', phone: '01012345678', address: 'المعادي، شارع 9', loyaltyPoints: 140, totalSpent: 1400, ordersCount: 5 },
  { id: 'cust-2', branch_id: DEFAULT_BRANCH_ID, name: 'سارة علي', phone: '01198765432', address: 'مدينة نصر، عباس العقاد', loyaltyPoints: 85, totalSpent: 850, ordersCount: 3 },
];

export function createInitialShift(): Shift {
  return {
    id: `shift-${Date.now()}`,
    branch_id: DEFAULT_BRANCH_ID,
    cashierName: 'Admin',
    openedAt: new Date().toISOString(),
    openingCash: 1000,
    totalSales: 0,
    ordersCount: 0,
    status: 'open',
  };
}

export function createTrialLicense(deviceId: string): string {
  const now = new Date();
  const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  return signLicense({
    licenseId: `LIC-TRIAL-${Date.now()}`,
    clientName: 'Demo Restaurant',
    deviceId,
    plan: 'trial',
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    branch_id: DEFAULT_BRANCH_ID,
  });
}

export function createSeedDeveloperSubscriptions(currentDeviceId: string): DeveloperSubscription[] {
  const now = new Date();
  const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const in365Days = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expiredDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'sub-1',
      clientName: 'كريم حسن',
      restaurantName: 'مطعم الشيف كريم',
      phone: '01001122334',
      deviceId: currentDeviceId,
      plan: 'yearly',
      status: 'active',
      issuedAt: now.toISOString(),
      expiresAt: in365Days.toISOString(),
      licenseKey: signLicense({
        licenseId: 'LIC-SUB-1',
        clientName: 'مطعم الشيف كريم',
        deviceId: currentDeviceId,
        plan: 'yearly',
        issuedAt: now.toISOString(),
        expiresAt: in365Days.toISOString(),
        branch_id: DEFAULT_BRANCH_ID,
      }),
      renewalsCount: 1,
    },
    {
      id: 'sub-2',
      clientName: 'محمد طارق',
      restaurantName: 'برجر ستيشن',
      phone: '01223344556',
      deviceId: 'POS-9F4A21C0',
      plan: 'monthly',
      status: 'active',
      issuedAt: now.toISOString(),
      expiresAt: in5Days.toISOString(),
      licenseKey: signLicense({
        licenseId: 'LIC-SUB-2',
        clientName: 'برجر ستيشن',
        deviceId: 'POS-9F4A21C0',
        plan: 'monthly',
        issuedAt: now.toISOString(),
        expiresAt: in5Days.toISOString(),
        branch_id: DEFAULT_BRANCH_ID,
      }),
      renewalsCount: 2,
    },
    {
      id: 'sub-3',
      clientName: 'ياسر نبيل',
      restaurantName: 'كافيه روما',
      phone: '01556677889',
      deviceId: 'POS-3B7E88A1',
      plan: 'monthly',
      status: 'expired',
      issuedAt: expiredDate.toISOString(),
      expiresAt: expiredDate.toISOString(),
      licenseKey: '',
      renewalsCount: 0,
    },
  ];
}
