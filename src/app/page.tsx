'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  Wallet,
  Utensils,
  ShoppingBag,
  Truck,
  Percent,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { usePOS } from '@/context/POSContext';
import { MenuItem, Modifier, Order, OrderItem, OrderType, PaymentMethod } from '@/types/pos';

export default function POSPage() {
  const {
    lang,
    categories,
    menuItems,
    tables,
    customers,
    role,
    licenseStatus,
    createOrder,
  } = usePOS();
  const isAr = lang === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [driverName, setDriverName] = useState('');

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');

  // Modals
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);
  const [selectedMods, setSelectedMods] = useState<Modifier[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q || item.nameAr.toLowerCase().includes(q) || item.nameEn.toLowerCase().includes(q);
      return matchCat && matchSearch && item.available;
    });
  }, [menuItems, selectedCategory, search]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const modsTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.price, 0);
      return sum + (item.unitPrice + modsTotal) * item.quantity;
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') return Math.min(subtotal, (subtotal * discount) / 100);
    return Math.min(subtotal, discount);
  }, [subtotal, discount, discountType]);

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = Number((afterDiscount * 0.14).toFixed(2));
  const serviceCharge = orderType === 'dine_in' ? Number((afterDiscount * 0.12).toFixed(2)) : 0;
  const total = Number((afterDiscount + tax + serviceCharge).toFixed(2));

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' && cart.length > 0) {
        e.preventDefault();
        setShowPayModal(true);
      } else if (e.key === 'Escape') {
        setModifierItem(null);
        setShowPayModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cart.length]);

  const handleItemClick = (item: MenuItem) => {
    if (item.modifiers.length > 0) {
      setModifierItem(item);
      setSelectedMods([]);
    } else {
      addToCart(item, []);
    }
  };

  const addToCart = (item: MenuItem, mods: Modifier[]) => {
    const modIds = mods.map((m) => m.id).sort().join(',');
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (c) =>
          c.menuItemId === item.id &&
          c.selectedModifiers.map((m) => m.id).sort().join(',') === modIds
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], quantity: copy[existingIdx].quantity + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          menuItemId: item.id,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          unitPrice: item.price,
          cost: item.cost,
          quantity: 1,
          selectedModifiers: mods,
          kitchenStation: item.kitchenStation,
        },
      ];
    });
    setModifierItem(null);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const handleCompleteOrder = () => {
    if (!licenseStatus.valid) return;
    const table = tables.find((t) => t.id === selectedTableId);
    const customer = customers.find((c) => c.id === selectedCustomerId);

    const created = createOrder({
      orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableNumber: orderType === 'dine_in' ? table?.number : undefined,
      customerId: customer?.id,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress || customer?.address : undefined,
      driverName: orderType === 'delivery' ? driverName : undefined,
      items: cart,
      subtotal,
      discount: discountAmount,
      discountType,
      tax,
      serviceCharge,
      total,
      payments: [{ method: paymentMethod, amount: total }],
      status: 'paid',
      kdsStatus: 'pending',
      paidAt: new Date().toISOString(),
      cashierName: role.toUpperCase(),
    });

    setLastOrder(created);
    setCart([]);
    setDiscount(0);
    setShowPayModal(false);
  };

  if (!licenseStatus.valid) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-red-500/40 text-center shadow-xl">
        <Lock className="w-14 h-14 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">
          {isAr ? 'الترخيص منتهي أو غير صالح' : 'License Expired or Invalid'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isAr
            ? 'تم إيقاف عمليات البيع مؤقتًا. يرجى تفعيل النظام باستخدام مفتاح ترخيص صالح.'
            : 'POS sales are paused. Please activate the system with a valid license key.'}
        </p>
        <Link
          href="/license"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600"
        >
          {isAr ? 'الذهاب لصفحة التفعيل' : 'Go to Activation'}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* Left/Main: Categories & Menu Grid */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 print:hidden">
        {/* Search & Order Type */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن صنف...' : 'Search menu items...'}
              className="w-full ps-9 pe-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'dine_in', icon: Utensils, ar: 'صالة', en: 'Dine-in' },
                { id: 'takeaway', icon: ShoppingBag, ar: 'تيك أواي', en: 'Takeaway' },
                { id: 'delivery', icon: Truck, ar: 'دليفري', en: 'Delivery' },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setOrderType(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    orderType === t.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isAr ? t.ar : t.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-400'
              }`}
            >
              {isAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="group text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[120px] shadow-sm"
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {item.kitchenStation}
                </span>
                <h3 className="font-bold text-sm sm:text-base mt-2 group-hover:text-orange-500 transition-colors">
                  {isAr ? item.nameAr : item.nameEn}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-orange-500 text-base">
                  {item.price} {isAr ? 'ج.م' : 'EGP'}
                </span>
                {item.modifiers.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    +{item.modifiers.length} {isAr ? 'إضافات' : 'mods'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between h-fit lg:sticky lg:top-20 print:hidden">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-base">
              {isAr ? 'الطلب الحالي' : 'Current Order'} ({cart.reduce((s, c) => s + c.quantity, 0)})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isAr ? 'إفراغ' : 'Clear'}
              </button>
            )}
          </div>

          {/* Order Type Extra Fields */}
          <div className="grid grid-cols-1 gap-2 my-3">
            {orderType === 'dine_in' && (
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isAr ? `طاولة ${t.number} (${t.capacity} أفراد)` : `Table ${t.number} (${t.capacity} seats)`}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="">{isAr ? 'عميل عادي (بدون ملف)' : 'Walk-in Customer'}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.phone} ({c.loyaltyPoints} pts)
                </option>
              ))}
            </select>

            {orderType === 'delivery' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={isAr ? 'عنوان التوصيل' : 'Delivery Address'}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs"
                />
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder={isAr ? 'اسم السائق' : 'Driver Name'}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs"
                />
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto my-2">
            {cart.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-10">
                {isAr ? 'اختر أصنافًا من القائمة للبدء' : 'Select items from the menu to start'}
              </p>
            ) : (
              cart.map((item) => {
                const modsTotal = item.selectedModifiers.reduce((s, m) => s + m.price, 0);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">
                        {isAr ? item.nameAr : item.nameEn}
                      </p>
                      {item.selectedModifiers.length > 0 && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.selectedModifiers.map((m) => (isAr ? m.nameAr : m.nameEn)).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-orange-500 font-bold mt-0.5">
                        {((item.unitPrice + modsTotal) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Totals & Pay Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-slate-400" />
            <input
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder={isAr ? 'خصم' : 'Discount'}
              className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percent')}
              className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
            >
              <option value="fixed">{isAr ? 'ج.م' : 'EGP'}</option>
              <option value="percent">%</option>
            </select>
          </div>

          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-500">
                <span>{isAr ? 'الخصم' : 'Discount'}</span>
                <span>-{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{isAr ? 'الضريبة (14%)' : 'Tax (14%)'}</span>
              <span>{tax.toFixed(2)}</span>
            </div>
            {serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>{isAr ? 'خدمة الصالة (12%)' : 'Service (12%)'}</span>
                <span>{serviceCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>{isAr ? 'الإجمالي' : 'Total'}</span>
              <span>
                {total.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setShowPayModal(true)}
            className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all"
          >
            {isAr ? 'دفع وإصدار الفاتورة (F2)' : 'Pay & Print (F2)'}
          </button>
        </div>
      </div>

      {/* Modifiers Modal */}
      {modifierItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-3">
              {isAr ? modifierItem.nameAr : modifierItem.nameEn}
            </h3>
            <div className="space-y-2 mb-5">
              {modifierItem.modifiers.map((mod) => {
                const checked = selectedMods.some((m) => m.id === mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() =>
                      setSelectedMods((prev) =>
                        checked ? prev.filter((m) => m.id !== mod.id) : [...prev, mod]
                      )
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium ${
                      checked
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{isAr ? mod.nameAr : mod.nameEn}</span>
                    <span>+{mod.price}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setModifierItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => addToCart(modifierItem, selectedMods)}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm"
              >
                {isAr ? 'إضافة للطلب' : 'Add to Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-1">{isAr ? 'تأكيد الدفع' : 'Confirm Payment'}</h3>
            <p className="text-2xl font-extrabold text-orange-500 mb-4">
              {total.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {(
                [
                  { id: 'cash', icon: Banknote, ar: 'كاش', en: 'Cash' },
                  { id: 'card', icon: CreditCard, ar: 'بطاقة', en: 'Card' },
                  { id: 'wallet', icon: Wallet, ar: 'محفظة', en: 'Wallet' },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold ${
                      paymentMethod === m.id
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{isAr ? m.ar : m.en}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm"
              >
                {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={handleCompleteOrder}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm"
              >
                {isAr ? 'تأكيد وإصدار' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal (80mm print ready) */}
      {lastOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-xs w-full shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold mb-3 print:hidden">
              <CheckCircle2 className="w-5 h-5" />
              <span>{isAr ? 'تم إصدار الفاتورة' : 'Order Completed'}</span>
            </div>
            <div className="border-y border-dashed border-slate-300 py-3 text-xs font-mono space-y-1">
              <p className="text-center font-bold text-sm">RestoPOS Pro</p>
              <p className="text-center">Order #{lastOrder.orderNumber}</p>
              <p className="text-center">{new Date(lastOrder.createdAt).toLocaleString()}</p>
              <div className="border-t border-dashed border-slate-300 my-2 pt-2 space-y-1">
                {lastOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.quantity}x {isAr ? it.nameAr : it.nameEn}
                    </span>
                    <span>{(it.unitPrice * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>{lastOrder.total.toFixed(2)} EGP</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                {isAr ? 'طباعة 80mm' : 'Print 80mm'}
              </button>
              <button
                onClick={() => setLastOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-900 font-bold text-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
