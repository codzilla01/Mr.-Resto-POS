export type Role = 'admin' | 'developer' | 'cashier' | 'waiter' | 'chef';
export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'credit';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'waiting_bill';
export type KDSStatus = 'pending' | 'preparing' | 'ready' | 'served';
export type LicensePlan = 'trial' | 'monthly' | 'yearly' | 'lifetime';
export type LicenseStatus = 'active' | 'expired' | 'suspended';

export interface Modifier {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface Category {
  id: string;
  branch_id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  branch_id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  cost: number;
  taxRate: number;
  modifiers: Modifier[];
  recipe: RecipeItem[];
  available: boolean;
  kitchenStation: 'kitchen' | 'bar' | 'grill';
}

export interface Table {
  id: string;
  branch_id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  section: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  nameAr: string;
  nameEn: string;
  unitPrice: number;
  cost: number;
  quantity: number;
  selectedModifiers: Modifier[];
  notes?: string;
  kitchenStation: 'kitchen' | 'bar' | 'grill';
}

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface Order {
  id: string;
  branch_id: string;
  orderNumber: number;
  orderType: OrderType;
  tableId?: string;
  tableNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  driverName?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percent';
  tax: number;
  serviceCharge: number;
  total: number;
  payments: PaymentSplit[];
  status: 'open' | 'paid' | 'cancelled';
  kdsStatus: KDSStatus;
  createdAt: string;
  paidAt?: string;
  cashierName: string;
  shiftId: string;
}

export interface Ingredient {
  id: string;
  branch_id: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  stock: number;
  reorderLevel: number;
  costPerUnit: number;
}

export interface WasteLog {
  id: string;
  branch_id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  reason: string;
  createdAt: string;
  userName: string;
}

export interface Customer {
  id: string;
  branch_id: string;
  name: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  totalSpent: number;
  ordersCount: number;
  lastVisit?: string;
}

export interface Shift {
  id: string;
  branch_id: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  totalSales: number;
  ordersCount: number;
  status: 'open' | 'closed';
}

export interface AuditLog {
  id: string;
  branch_id: string;
  action: string;
  details: string;
  userName: string;
  role: Role;
  createdAt: string;
}

export interface LicensePayload {
  licenseId: string;
  clientName: string;
  deviceId: string;
  plan: LicensePlan;
  issuedAt: string;
  expiresAt: string;
  maxInvoices?: number;
  branch_id: string;
}

export interface SignedLicense {
  payload: LicensePayload;
  signature: string;
}

export interface DeveloperSubscription {
  id: string;
  clientName: string;
  restaurantName: string;
  phone: string;
  deviceId: string;
  plan: LicensePlan;
  status: LicenseStatus;
  issuedAt: string;
  expiresAt: string;
  licenseKey: string;
  renewalsCount: number;
}
