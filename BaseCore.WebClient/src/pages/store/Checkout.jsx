import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCartItemKey, getItemKey, useCart } from '../../contexts/CartContext';
import { useStoreSettings } from '../../contexts/StoreSettingsContext';
import { orderApi, couponApi, settingsApi, paymentApi } from '../../services/api';
import { usePublicCoupons } from '../../hooks/usePublicCoupons';
import PageHero from '../../components/store/PageHero';
import { formatCurrency, isStoreViewOnlyUser, parseServerDateTime, resolveProductImage, setPageMeta, STORE_VIEW_ONLY_MESSAGE, t } from '../../utils/store';
import {
    calculateProductCouponDiscount,
    calculateShippingCouponDiscount,
    getCartSubtotal,
    getSelectedUsableCouponsForCart,
    validateSelectedCouponForCart,
} from '../../utils/couponUtils';
import { cn } from '../../utils/cn';

const CHECKOUT_SELECTION_KEY = 'store_checkout_selected_items';
const CHECKOUT_COUPON_KEY = 'store_checkout_applied_coupons';
const DEFAULT_SHIPPING_FEE = 30000;
const pickupTimeSlots = [
    { value: '09:00-11:00', label: '09:00 - 11:00', start: '09:00', end: '11:00' },
    { value: '11:00-13:00', label: '11:00 - 13:00', start: '11:00', end: '13:00' },
    { value: '13:00-15:00', label: '13:00 - 15:00', start: '13:00', end: '15:00' },
    { value: '15:00-17:00', label: '15:00 - 17:00', start: '15:00', end: '17:00' },
    { value: '17:00-19:00', label: '17:00 - 19:00', start: '17:00', end: '19:00' },
    { value: '19:00-21:00', label: '19:00 - 21:00', start: '19:00', end: '21:00' },
];

const formatDateInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const parseDateInput = (value) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
};

const getSlotEndAt = (dateValue, slot) => {
    const date = parseDateInput(dateValue);
    if (!date || !slot) return null;
    const [hour, minute] = String(slot.end || '0:0').split(':').map(Number);
    date.setHours(Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0, 0, 0);
    return date;
};

const getAvailablePickupSlots = (dateValue, now = new Date()) => {
    const todayValue = formatDateInput(now);
    return pickupTimeSlots.filter((slot) => {
        if (dateValue !== todayValue) return true;
        const endAt = getSlotEndAt(dateValue, slot);
        return endAt && endAt > now;
    });
};

const getDefaultPickupDate = (now = new Date()) => {
    const today = formatDateInput(now);
    return getAvailablePickupSlots(today, now).length > 0 ? today : formatDateInput(addDays(now, 1));
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildOrderCode = () => {
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('');
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `TS-${date}-${suffix}`;
};

const getCouponDescription = (coupon) => {
    if (coupon.discountType === 'freeship') return `Miễn phí vận chuyển cho đơn từ ${formatCurrency(coupon.minOrder || 0)}`;
    if (coupon.discountType === 'fixed') return `Giảm ${formatCurrency(coupon.value || 0)} cho đơn từ ${formatCurrency(coupon.minOrder || 0)}`;
    if (coupon.discountType === 'percent') {
        const cap = coupon.maxDiscount ? `, tối đa ${formatCurrency(coupon.maxDiscount)}` : '';
        return `Giảm ${coupon.value}% cho đơn từ ${formatCurrency(coupon.minOrder || 0)}${cap}`;
    }
    return `Đơn từ ${formatCurrency(coupon.minOrder || 0)}`;
};

const getPaymentLabel = (method) => ({
    store: 'Thanh toán tại cửa hàng',
    bank: 'Thanh toán trực tuyến',
}[method] || 'Chưa chọn');

const toApiPaymentMethod = (method) => ({
    store: 'StorePayment', bank: 'BankTransfer', momo: 'Momo', shopeepay: 'ShopeePay', applepay: 'ApplePay',
}[method] || 'BankTransfer');

const getCreatedOrder = (payload) => payload?.order || payload || {};
const getCreatedOrderItems = (payload, fallback) => payload?.items || payload?.details || fallback;

const normalizeBankText = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
const BANK_CODE_ALIASES = {
    vietcombank: 'VCB',
    vcb: 'VCB',
    techcombank: 'TCB',
    tcb: 'TCB',
    mbbank: 'MB',
    mb: 'MB',
    bidv: 'BIDV',
    vietinbank: 'ICB',
    vietin: 'ICB',
    agribank: 'VBA',
    acb: 'ACB',
    sacombank: 'STB',
    tpbank: 'TPB',
    vpbank: 'VPB',
};

const getBankCode = (bankName) => {
    const key = normalizeBankText(bankName);
    return BANK_CODE_ALIASES[key] || String(bankName || '').trim().toUpperCase();
};

const buildVietQrUrl = ({ bankName, accountNumber, amount, addInfo, accountName }) => {
    if (!bankName || !accountNumber) return '';
    const bankCode = encodeURIComponent(getBankCode(bankName));
    const account = encodeURIComponent(String(accountNumber).replace(/\s+/g, ''));
    const params = new URLSearchParams();
    if (amount > 0) params.set('amount', String(Math.round(amount)));
    if (addInfo) params.set('addInfo', addInfo);
    if (accountName) params.set('accountName', accountName);
    return `https://img.vietqr.io/image/${bankCode}-${account}-compact.png?${params.toString()}`;
};

// Logo ngân hàng (khác với mã QR): dùng API logo của VietQR theo mã ngân hàng.
const buildBankLogoUrl = (bankName) => {
    const code = getBankCode(bankName);
    if (!code) return '';
    return `https://api.vietqr.io/img/${encodeURIComponent(code)}.png`;
};

// 6 ngân hàng nhận chuyển khoản mặc định (dùng khi cửa hàng chưa cấu hình settings.bankAccounts).
// Số tài khoản là dữ liệu mẫu — cập nhật lại số thật của cửa hàng khi triển khai.
const DEFAULT_ONLINE_BANKS = [
    { id: 'vcb', bankName: 'Vietcombank', accountNumber: '1012345678' },
    { id: 'tcb', bankName: 'Techcombank', accountNumber: '19001234567' },
    { id: 'mb', bankName: 'MB Bank', accountNumber: '0901234567' },
    { id: 'bidv', bankName: 'BIDV', accountNumber: '21510001234567' },
    { id: 'vpb', bankName: 'VPBank', accountNumber: '0123456789' },
    { id: 'acb', bankName: 'ACB', accountNumber: '2468013579' },
];

const Checkout = () => {
    const { items, removeItem } = useCart();
    const { user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const settings = useStoreSettings();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState({});
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [paymentWait, setPaymentWait] = useState(null); // { sessionId, order, expiresAt } khi chờ thanh toán QR
    const [paymentExpired, setPaymentExpired] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(null); // đếm ngược hết hạn phiên (giây)
    const [customerInfo, setCustomerInfo] = useState({ fullName: '', phone: '', email: '', notes: '' });
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [pickupBranches, setPickupBranches] = useState([]);
    const [loadingPickupBranches, setLoadingPickupBranches] = useState(false);
    const [storePickupInfo, setStorePickupInfo] = useState({
        branchId: null,
        date: getDefaultPickupDate(),
        slot: pickupTimeSlots[0].value,
    });
    const [shippingAddress, setShippingAddress] = useState({ province: '', district: '', ward: '', address: '' });
    const [provincesData, setProvincesData] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('store');
    const [selectedOnlineBankId, setSelectedOnlineBankId] = useState('');
    const [appliedProductCoupon, setAppliedProductCoupon] = useState(null);
    const [appliedShippingCoupon, setAppliedShippingCoupon] = useState(null);
    const [couponMessage, setCouponMessage] = useState('');
    const [claimedIds, setClaimedIds] = useState([]);
    const [myCoupons, setMyCoupons] = useState([]);
    const [claimingCouponIds, setClaimingCouponIds] = useState([]);
    const [couponPreview, setCouponPreview] = useState({ loading: false, result: null, error: '' });
    const [defaultShippingFee, setDefaultShippingFee] = useState(DEFAULT_SHIPPING_FEE);
    const { coupons } = usePublicCoupons();

    const couponIdToUserCouponId = useMemo(() => {
        const map = new Map();
        (myCoupons || []).forEach((uc) => {
            const couponId = uc?.couponId;
            const userCouponId = uc?.id;
            if (couponId == null || userCouponId == null) return;
            if (!map.has(Number(couponId))) map.set(Number(couponId), Number(userCouponId));
        });
        return map;
    }, [myCoupons]);

    // Tập id phiếu đã sử dụng (theo trạng thái user-coupon) -> không cho áp dụng lại.
    const usedCouponIds = useMemo(() => {
        const set = new Set();
        (myCoupons || []).forEach((uc) => {
            const isUsed = uc?.status === 'Used' || !!uc?.usedAt;
            if (isUsed && uc?.couponId != null) set.add(Number(uc.couponId));
        });
        return set;
    }, [myCoupons]);

    const persistedCoupons = useMemo(() => {
        try {
            const stored = JSON.parse(sessionStorage.getItem(CHECKOUT_COUPON_KEY) || 'null');
            return {
                productUserCouponId: stored?.productUserCouponId ?? null,
                shippingUserCouponId: stored?.shippingUserCouponId ?? null,
            };
        } catch {
            return { productUserCouponId: null, shippingUserCouponId: null };
        }
    }, []);

    useEffect(() => {
        setPageMeta({ title: `${t('Checkout')} | TechStore`, description: t('Checkout meta description') });

        const loadClaimedCoupons = async () => {
            try {
                const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
                const list = myCoupons.data?.items || [];
                const ids = list.map((c) => String(c.couponId)) || [];
                setClaimedIds(ids);
                setMyCoupons(list);
            } catch (error) {
                console.error('Failed to load claimed coupons:', error);
                setClaimedIds([]);
                setMyCoupons([]);
            }
        };

        loadClaimedCoupons();

        const loadStoreSettings = async () => {
            try {
                const response = await settingsApi.get();
                const fee = Number(response.data?.defaultShippingFee ?? response.data?.DefaultShippingFee);
                if (Number.isFinite(fee) && fee >= 0) setDefaultShippingFee(fee);
            } catch (error) {
                console.error('Failed to load store settings:', error);
            }
        };

        loadStoreSettings();

        const loadPickupBranches = async () => {
            setLoadingPickupBranches(true);
            try {
                const response = await settingsApi.getPickupBranches();
                const list = Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.Items || []);
                setPickupBranches(list || []);
                const first = (list || [])[0];
                if (first && !storePickupInfo.branchId) {
                    setStorePickupInfo((c) => ({ ...c, branchId: Number(first.id ?? first.Id) }));
                }
            } catch (error) {
                console.error('Failed to load pickup branches:', error);
                setPickupBranches([]);
            } finally {
                setLoadingPickupBranches(false);
            }
        };

        loadPickupBranches();
    }, []);

    useEffect(() => {
        if (!user) return;
        setCustomerInfo((c) => ({ ...c, phone: c.phone || user.phone || '', fullName: c.fullName || user.name || '' }));
    }, [user]);

    // Tải danh mục Tỉnh/Phường (cấu trúc hành chính 2 cấp 2025) theo kiểu lazy để không nặng bundle.
    useEffect(() => {
        let active = true;
        import('../../data/vnAdministrative.json')
            .then((mod) => { if (active) setProvincesData(mod.default || mod); })
            .catch((err) => console.error('Failed to load address dataset:', err));
        return () => { active = false; };
    }, []);

    const wardOptions = useMemo(() => {
        const province = provincesData.find((p) => p.name === shippingAddress.province);
        return province ? province.wards : [];
    }, [provincesData, shippingAddress.province]);

    useEffect(() => {
        setPaymentMethod((c) => {
            if (deliveryMethod === 'pickup' && (!c || c === 'bank')) return 'store';
            if (deliveryMethod === 'shipping' && c === 'store') return 'bank';
            return c || (deliveryMethod === 'pickup' ? 'store' : 'bank');
        });
    }, [deliveryMethod]);

    const checkoutSelectionIds = useMemo(() => {
        try {
            const stored = JSON.parse(sessionStorage.getItem(CHECKOUT_SELECTION_KEY) || '[]');
            return Array.isArray(stored) ? stored.map((i) => i.cartItemKey || getCartItemKey(i)) : [];
        } catch { return []; }
    }, []);

    const selectedCartItems = useMemo(() => {
        if (checkoutSelectionIds.length === 0) return items;
        const sel = new Set(checkoutSelectionIds);
        return items.filter((i) => sel.has(getItemKey(i)) || sel.has(String(i.productId)));
    }, [items, checkoutSelectionIds]);

    const productSubtotal = useMemo(() => getCartSubtotal(selectedCartItems), [selectedCartItems]);
    const shippingFee = deliveryMethod === 'shipping' ? defaultShippingFee : 0;
    const couponOptions = useMemo(
        () => getSelectedUsableCouponsForCart(selectedCartItems, coupons, productSubtotal, shippingFee, claimedIds),
        [selectedCartItems, coupons, productSubtotal, shippingFee, claimedIds]
    );
    const productCouponOptions = couponOptions.filter(({ coupon }) => coupon.couponType === 'product');
    const shippingCouponOptions = couponOptions.filter(({ coupon }) => coupon.couponType === 'shipping');

    const unclaimedEligibleCoupons = useMemo(() => {
        if (!coupons.length || !selectedCartItems.length) return [];
        return (coupons || [])
            .filter((c) => c?.code)
            .filter((c) => !claimedIds.includes(String(c.id)))
            .map((c) => {
                const pretendClaimed = [...claimedIds, String(c.id)];
                const v = validateSelectedCouponForCart(c.code, selectedCartItems, productSubtotal, shippingFee, coupons, pretendClaimed);
                return { ...v, coupon: c, claimed: false };
            })
            .filter((x) => x.valid);
    }, [coupons, selectedCartItems, productSubtotal, shippingFee, claimedIds]);

    const unclaimedProductCoupons = unclaimedEligibleCoupons.filter(({ coupon }) => coupon?.couponType === 'product');
    const unclaimedShippingCoupons = unclaimedEligibleCoupons.filter(({ coupon }) => coupon?.couponType === 'shipping');

    const productValidation = appliedProductCoupon
        ? validateSelectedCouponForCart(appliedProductCoupon.code, selectedCartItems, productSubtotal, shippingFee, coupons, claimedIds) : null;
    const shippingValidation = appliedShippingCoupon
        ? validateSelectedCouponForCart(appliedShippingCoupon.code, selectedCartItems, productSubtotal, shippingFee, coupons, claimedIds) : null;

    const productDiscount = productValidation?.valid ? calculateProductCouponDiscount(appliedProductCoupon, selectedCartItems, productSubtotal) : 0;
    const shippingDiscount = shippingValidation?.valid ? calculateShippingCouponDiscount(appliedShippingCoupon, shippingFee) : 0;
    const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);
    const totalPayment = Math.max(0, productSubtotal - productDiscount + finalShippingFee);
    const serverProductDiscount = Number(couponPreview.result?.productDiscount ?? 0);
    const serverShippingFee = Number(couponPreview.result?.shippingFee ?? shippingFee);
    const serverShippingDiscount = Number(couponPreview.result?.shippingDiscount ?? 0);
    const serverTotalPayment = Number(couponPreview.result?.totalAmount ?? totalPayment);
    const pricingFromServer = Boolean((appliedProductCoupon?.userCouponId || appliedShippingCoupon?.userCouponId) && couponPreview.result && couponPreview.result.isValid !== false);
    const displayProductDiscount = pricingFromServer ? serverProductDiscount : productDiscount;
    const displayShippingFee = pricingFromServer ? serverShippingFee : shippingFee;
    const displayShippingDiscount = pricingFromServer ? serverShippingDiscount : shippingDiscount;
    const displayFinalShippingFee = Math.max(0, displayShippingFee - displayShippingDiscount);
    const displayTotalPayment = pricingFromServer ? serverTotalPayment : totalPayment;
    const transferContent = `${(settings.storeName || 'TECHSTORE').toUpperCase().replace(/\s+/g, '')} ${customerInfo.phone || 'SODIENTHOAI'}`;
    const onlineBankOptions = useMemo(() => {
        const banks = Array.isArray(settings.bankAccounts) ? settings.bankAccounts : [];
        const normalizedBanks = banks
            .map((bank, index) => ({
                id: String(bank.id ?? bank.bankName ?? index),
                bankName: bank.bankName || bank.name || '',
                accountNumber: bank.accountNumber || bank.bankAccountNumber || '',
                accountHolder: bank.accountHolder || bank.bankAccountHolder || '',
            }))
            .filter((bank) => bank.bankName && bank.accountNumber);

        if (normalizedBanks.length) return normalizedBanks;

        // Tên chủ tài khoản dùng chung: ưu tiên cấu hình, sau đó tên cửa hàng.
        const holder = settings.bankAccountHolder || settings.storeName || 'TECHSTORE';

        // Nếu cửa hàng đã cấu hình 1 TK riêng (settings.bankName/Number) -> đưa lên đầu, rồi bổ sung
        // các ngân hàng mặc định khác cho đủ ~6 lựa chọn.
        const configured = (settings.bankName && settings.bankAccountNumber)
            ? [{ id: 'configured', bankName: settings.bankName, accountNumber: settings.bankAccountNumber, accountHolder: holder }]
            : [];
        const configuredCodes = new Set(configured.map((b) => getBankCode(b.bankName)));
        const defaults = DEFAULT_ONLINE_BANKS
            .filter((b) => !configuredCodes.has(getBankCode(b.bankName)))
            .map((b) => ({ ...b, accountHolder: holder }));

        return [...configured, ...defaults].slice(0, 6);
    }, [settings.bankAccounts, settings.bankName, settings.bankAccountHolder, settings.bankAccountNumber, settings.storeName]);
    const selectedOnlineBank = useMemo(
        () => onlineBankOptions.find((bank) => bank.id === selectedOnlineBankId) || onlineBankOptions[0] || null,
        [onlineBankOptions, selectedOnlineBankId]
    );
    const selectedBankQrUrl = useMemo(() => buildVietQrUrl({
        bankName: selectedOnlineBank?.bankName,
        accountNumber: selectedOnlineBank?.accountNumber,
        accountName: selectedOnlineBank?.accountHolder,
        amount: displayTotalPayment,
        addInfo: transferContent,
    }), [displayTotalPayment, selectedOnlineBank, transferContent]);

    useEffect(() => {
        if (!onlineBankOptions.length) {
            if (selectedOnlineBankId) setSelectedOnlineBankId('');
            return;
        }
        if (!onlineBankOptions.some((bank) => bank.id === selectedOnlineBankId)) {
            setSelectedOnlineBankId(onlineBankOptions[0].id);
        }
    }, [onlineBankOptions, selectedOnlineBankId]);

    const fullShippingAddress = [shippingAddress.address, shippingAddress.ward, shippingAddress.province].filter(Boolean).join(', ');
    const selectedPickupBranch = useMemo(() => {
        const id = storePickupInfo.branchId;
        if (!id) return null;
        return (pickupBranches || []).find((b) => Number(b.id ?? b.Id) === Number(id)) || null;
    }, [pickupBranches, storePickupInfo.branchId]);

    const pickupLocationText = useMemo(() => {
        if (!selectedPickupBranch) return '';
        const name = selectedPickupBranch.name ?? selectedPickupBranch.Name ?? '';
        const address = selectedPickupBranch.address ?? selectedPickupBranch.Address ?? '';
        return [name, address].filter(Boolean).join(' — ');
    }, [selectedPickupBranch]);

    const pickupMinDate = useMemo(() => formatDateInput(new Date()), []);
    const pickupMaxDate = useMemo(() => formatDateInput(addDays(new Date(), 7)), []);
    const availablePickupSlots = useMemo(() => getAvailablePickupSlots(storePickupInfo.date), [storePickupInfo.date]);

    useEffect(() => {
        const minDate = parseDateInput(pickupMinDate);
        const maxDate = parseDateInput(pickupMaxDate);
        const selectedDate = parseDateInput(storePickupInfo.date);
        let nextDate = (!selectedDate || selectedDate < minDate || selectedDate > maxDate)
            ? getDefaultPickupDate()
            : storePickupInfo.date;
        let slots = getAvailablePickupSlots(nextDate);

        if (!slots.length) {
            nextDate = formatDateInput(addDays(parseDateInput(nextDate) || new Date(), 1));
            if (parseDateInput(nextDate) > maxDate) nextDate = pickupMaxDate;
            slots = getAvailablePickupSlots(nextDate);
        }

        const nextSlot = slots.some((slot) => slot.value === storePickupInfo.slot)
            ? storePickupInfo.slot
            : (slots[0]?.value || '');

        if (nextDate !== storePickupInfo.date || nextSlot !== storePickupInfo.slot) {
            setStorePickupInfo((current) => ({ ...current, date: nextDate, slot: nextSlot }));
        }
    }, [storePickupInfo.date, storePickupInfo.slot, pickupMinDate, pickupMaxDate]);

    const pickupSlot = useMemo(() => {
        const slotDef = pickupTimeSlots.find((s) => s.value === storePickupInfo.slot) || availablePickupSlots[0] || pickupTimeSlots[0];
        const base = parseDateInput(storePickupInfo.date) || parseDateInput(getDefaultPickupDate()) || new Date();
        base.setHours(0, 0, 0, 0);

        const parseHm = (text) => {
            const [h, m] = String(text || '0:0').split(':').map((x) => Number(x));
            return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
        };

        const startHm = parseHm(slotDef.start);
        const endHm = parseHm(slotDef.end);
        const startAt = new Date(base);
        startAt.setHours(startHm.h, startHm.m, 0, 0);
        const endAt = new Date(base);
        endAt.setHours(endHm.h, endHm.m, 0, 0);

        return {
            date: storePickupInfo.date,
            slot: slotDef.value,
            label: `${storePickupInfo.date} • ${slotDef.label}`,
            startAtIso: startAt.toISOString(),
            endAtIso: endAt.toISOString(),
        };
    }, [availablePickupSlots, storePickupInfo.date, storePickupInfo.slot]);

    useEffect(() => {
        if (!selectedCartItems.length) return;
        if (!persistedCoupons.productUserCouponId && !persistedCoupons.shippingUserCouponId) return;
        if (!coupons.length || !myCoupons.length) return;
        if (appliedProductCoupon || appliedShippingCoupon) return;

        const byUserCouponId = new Map((myCoupons || []).map((uc) => [Number(uc?.id), uc]));
        const isUcUsed = (uc) => uc?.status === 'Used' || !!uc?.usedAt;
        if (persistedCoupons.productUserCouponId) {
            const uc = byUserCouponId.get(Number(persistedCoupons.productUserCouponId));
            const c = coupons.find((x) => Number(x.apiId) === Number(uc?.couponId));
            if (c && !isUcUsed(uc)) setAppliedProductCoupon({ ...c, userCouponId: Number(uc.id) });
        }
        if (persistedCoupons.shippingUserCouponId) {
            const uc = byUserCouponId.get(Number(persistedCoupons.shippingUserCouponId));
            const c = coupons.find((x) => Number(x.apiId) === Number(uc?.couponId));
            if (c && !isUcUsed(uc)) setAppliedShippingCoupon({ ...c, userCouponId: Number(uc.id) });
        }
    }, [coupons, myCoupons, selectedCartItems.length]);

    useEffect(() => {
        let active = true;
        const run = async () => {
            if (!selectedCartItems.length) return setCouponPreview({ loading: false, result: null, error: '' });
            const productUserCouponId = appliedProductCoupon?.userCouponId ?? null;
            const shippingUserCouponId = appliedShippingCoupon?.userCouponId ?? null;
            if (!productUserCouponId && !shippingUserCouponId) return setCouponPreview({ loading: false, result: null, error: '' });

            setCouponPreview((c) => ({ ...c, loading: true, error: '' }));
            try {
                const dto = {
                    productUserCouponId: productUserCouponId ? Number(productUserCouponId) : null,
                    shippingUserCouponId: shippingUserCouponId ? Number(shippingUserCouponId) : null,
                    shippingMethod: deliveryMethod === 'pickup' ? 'StorePickup' : 'Delivery',
                    shippingFee: shippingFee,
                    paymentMethod: toApiPaymentMethod(paymentMethod),
                    cartItems: selectedCartItems.map((item) => ({
                        productId: Number(item.product?.productId || item.productId),
                        variantId: item.product?.variantId ? Number(item.product.variantId) : null,
                        quantity: Number(item.quantity || 1),
                        unitPrice: Number(item.product?.price || 0),
                    })),
                };
                const res = await couponApi.applyPreview(dto);
                if (!active) return;
                setCouponPreview({ loading: false, result: res.data || null, error: '' });
            } catch (e) {
                if (!active) return;
                const data = e.response?.data;
                setCouponPreview({ loading: false, result: null, error: data?.message || data?.detail || data?.title || 'Không thể tính khuyến mãi từ hệ thống.' });
            }
        };

        const t = setTimeout(run, 200);
        return () => {
            active = false;
            clearTimeout(t);
        };
    }, [selectedCartItems, deliveryMethod, shippingFee, paymentMethod, appliedProductCoupon?.userCouponId, appliedShippingCoupon?.userCouponId]);

    useEffect(() => {
        if (appliedProductCoupon && !productValidation?.valid) {
            setAppliedProductCoupon(null);
            setCouponMessage('Phiếu sản phẩm không còn phù hợp.');
        }
        if (appliedShippingCoupon && !shippingValidation?.valid) {
            setAppliedShippingCoupon(null);
            setCouponMessage('Phiếu vận chuyển không còn phù hợp.');
        }
    }, [appliedProductCoupon, appliedShippingCoupon, productValidation, shippingValidation]);

    useEffect(() => {
        const productUserCouponId = appliedProductCoupon?.userCouponId ?? null;
        const shippingUserCouponId = appliedShippingCoupon?.userCouponId ?? null;
        sessionStorage.setItem(CHECKOUT_COUPON_KEY, JSON.stringify({
            productUserCouponId,
            shippingUserCouponId,
        }));
    }, [appliedProductCoupon?.userCouponId, appliedShippingCoupon?.userCouponId]);

    const updateCustomerInfo = (field) => (e) => {
        setCustomerInfo((c) => ({ ...c, [field]: e.target.value }));
        setFormErrors((c) => ({ ...c, [field]: '' }));
    };
    const updateShippingAddress = (field) => (e) => {
        setShippingAddress((c) => ({ ...c, [field]: e.target.value }));
        setFormErrors((c) => ({ ...c, [`shipping.${field}`]: '' }));
    };
    const validateStepOne = () => {
        const errs = {};
        if (!customerInfo.fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên.';
        if (!customerInfo.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại.';
        if (customerInfo.email.trim() && !emailPattern.test(customerInfo.email.trim())) errs.email = 'Email chưa đúng định dạng.';

        if (deliveryMethod === 'pickup') {
            if (!storePickupInfo.branchId) errs.pickupBranch = 'Vui lòng chọn chi nhánh.';
            const selectedDate = parseDateInput(storePickupInfo.date);
            const minDate = parseDateInput(pickupMinDate);
            const maxDate = parseDateInput(pickupMaxDate);
            if (!selectedDate) errs.pickupDate = 'Vui lòng chọn ngày nhận hàng.';
            else if (selectedDate < minDate) errs.pickupDate = 'Ngày nhận không được nhỏ hơn hôm nay.';
            else if (selectedDate > maxDate) errs.pickupDate = 'Chỉ được chọn trước tối đa 7 ngày.';
            if (!storePickupInfo.slot || !availablePickupSlots.some((slot) => slot.value === storePickupInfo.slot)) {
                errs.pickupSlot = 'Vui lòng chọn khung giờ nhận hàng còn hiệu lực.';
            }
        } else {
            if (!shippingAddress.province.trim()) errs['shipping.province'] = 'Vui lòng chọn Tỉnh / Thành phố.';
            if (!shippingAddress.ward.trim()) errs['shipping.ward'] = 'Vui lòng chọn Phường / Xã.';
            if (!shippingAddress.address.trim()) errs['shipping.address'] = 'Vui lòng nhập địa chỉ cụ thể.';
        }

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const goToPaymentStep = () => {
        if (!validateStepOne()) return;
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const applyCoupon = (coupon) => {
        if (usedCouponIds.has(Number(coupon.apiId))) {
            setCouponMessage(`Phiếu ${coupon.code} đã được sử dụng, không thể áp dụng lại.`);
            return;
        }
        const v = validateSelectedCouponForCart(coupon.code, selectedCartItems, productSubtotal, shippingFee, coupons, claimedIds);
        if (!v.valid) {
            const missing = v.missingAmount > 0 ? ` Còn thiếu ${formatCurrency(v.missingAmount)}.` : '';
            setCouponMessage(`${v.message}.${missing}`);
            return;
        }
        const userCouponId = couponIdToUserCouponId.get(Number(coupon.apiId));
        if (!userCouponId) {
            setCouponMessage('Bạn cần đăng nhập và nhận phiếu trước khi sử dụng.');
            return;
        }
        const applied = { ...coupon, userCouponId };
        if (coupon.couponType === 'product') {
            setAppliedProductCoupon(applied);
            setCouponMessage(`Đã áp dụng phiếu sản phẩm ${coupon.code}.`);
        } else {
            setAppliedShippingCoupon(applied);
            setCouponMessage(`Đã áp dụng phiếu vận chuyển ${coupon.code}.`);
        }
    };

    const claimCoupon = async (coupon) => {
        if (isViewOnly) {
            setCouponMessage(STORE_VIEW_ONLY_MESSAGE);
            return;
        }
        if (!user) {
            setCouponMessage('Bạn cần đăng nhập để nhận phiếu.');
            navigate('/login');
            return;
        }
        const apiId = coupon?.apiId ?? coupon?.id;
        if (!apiId) return;
        const key = String(coupon.id);
        if (claimingCouponIds.includes(key)) return;

        setClaimingCouponIds((c) => [...c, key]);
        try {
            const res = await couponApi.claim(apiId);
            const uc = res.data;
            if (uc?.couponId != null) {
                setClaimedIds((prev) => {
                    const next = new Set((prev || []).map(String));
                    next.add(String(uc.couponId));
                    return Array.from(next);
                });
            }
            if (uc?.id != null) {
                setMyCoupons((prev) => {
                    const current = Array.isArray(prev) ? prev : [];
                    if (current.some((x) => Number(x?.id) === Number(uc.id))) return current;
                    return [uc, ...current];
                });
                const claimedCoupon = { ...coupon, userCouponId: Number(uc.id) };
                if (coupon.couponType === 'product') setAppliedProductCoupon(claimedCoupon);
                else if (coupon.couponType === 'shipping') setAppliedShippingCoupon(claimedCoupon);
            }
            setCouponMessage(`Đã nhận và áp dụng phiếu ${coupon.code}.`);
        } catch (e) {
            const data = e.response?.data;
            setCouponMessage(data?.message || data?.detail || data?.title || 'Không thể nhận phiếu.');
        } finally {
            setClaimingCouponIds((c) => c.filter((x) => x !== key));
        }
    };

    const removeCoupon = (type) => {
        if (type === 'product') { setAppliedProductCoupon(null); setCouponMessage('Đã bỏ phiếu sản phẩm.'); }
        else { setAppliedShippingCoupon(null); setCouponMessage('Đã bỏ phiếu vận chuyển.'); }
    };

    const placeOrder = async () => {
        if (isViewOnly) {
            setFormErrors({ order: STORE_VIEW_ONLY_MESSAGE });
            return;
        }
        if (!validateStepOne()) { setCurrentStep(1); return; }
        if (selectedCartItems.length === 0) { setFormErrors({ order: 'Không có sản phẩm nào để thanh toán.' }); return; }
        if (!paymentMethod) { setFormErrors({ paymentMethod: 'Vui lòng chọn phương thức thanh toán.' }); return; }
        if (paymentMethod === 'bank' && (!selectedOnlineBank?.bankName || !selectedOnlineBank?.accountNumber)) {
            setFormErrors({ paymentMethod: 'Cửa hàng chưa cấu hình ngân hàng để thanh toán trực tuyến.' });
            return;
        }
        if ((appliedProductCoupon?.userCouponId || appliedShippingCoupon?.userCouponId) && couponPreview.result && couponPreview.result.isValid === false) {
            const msg = Array.isArray(couponPreview.result?.messages) ? couponPreview.result.messages.join(' ') : 'Phiếu giảm giá không hợp lệ.';
            setFormErrors({ order: msg });
            return;
        }

        const payload = {
            customerName: customerInfo.fullName.trim(),
            customerPhone: customerInfo.phone.trim(),
            customerEmail: customerInfo.email.trim() || null,
            shippingMethod: deliveryMethod === 'pickup' ? 'StorePickup' : 'Delivery',
            province: deliveryMethod === 'shipping' ? shippingAddress.province.trim() : null,
            district: null,
            ward: deliveryMethod === 'shipping' ? shippingAddress.ward.trim() : null,
            addressDetail: deliveryMethod === 'shipping' ? shippingAddress.address.trim() : null,
            shippingAddress: deliveryMethod === 'shipping' ? fullShippingAddress : null,
            storePickupLocation: deliveryMethod === 'pickup' ? (pickupLocationText || null) : null,
            pickupWarehouseId: deliveryMethod === 'pickup' && storePickupInfo.branchId ? Number(storePickupInfo.branchId) : null,
            pickupSlotStartAt: deliveryMethod === 'pickup' ? pickupSlot.startAtIso : null,
            pickupSlotEndAt: deliveryMethod === 'pickup' ? pickupSlot.endAtIso : null,
            paymentMethod: toApiPaymentMethod(paymentMethod),
            paymentBankName: paymentMethod === 'bank' ? selectedOnlineBank?.bankName || null : null,
            paymentBankAccountNumber: paymentMethod === 'bank' ? selectedOnlineBank?.accountNumber || null : null,
            paymentBankAccountHolder: paymentMethod === 'bank' ? selectedOnlineBank?.accountHolder || null : null,
            notes: customerInfo.notes.trim() || null,
            invoiceRequired: false,
            invoiceCompanyName: null,
            invoiceTaxCode: null,
            invoiceAddress: null,
            invoiceEmail: null,
            productUserCouponId: appliedProductCoupon?.userCouponId ?? null,
            shippingUserCouponId: appliedShippingCoupon?.userCouponId ?? null,
            items: selectedCartItems.map((item) => ({
                productId: Number(item.product?.productId || item.productId),
                variantId: item.product?.variantId ? Number(item.product.variantId) : null,
                productName: item.product?.name || '',
                quantity: Number(item.quantity || 1),
                unitPrice: Number(item.product?.price || 0),
            })),
        };

        setSubmittingOrder(true);
        setFormErrors((c) => ({ ...c, order: '' }));
        try {
            if (paymentMethod === 'bank') {
                const paidAmount = Math.round(displayTotalPayment);
                const sessionRes = await paymentApi.createPendingSession(payload, paidAmount);
                const sessionId = sessionRes.data?.sessionId;
                if (!sessionId) {
                    throw new Error('Không nhận được phiên thanh toán QR.');
                }
                navigate(`/payment/waiting/${sessionId}`);
                return;
            }

            const response = await orderApi.create(payload);
            const created = getCreatedOrder(response.data);
            const createdItems = getCreatedOrderItems(response.data, selectedCartItems);
            selectedCartItems.forEach((i) => removeItem(getItemKey(i)));
            sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
            sessionStorage.removeItem(CHECKOUT_COUPON_KEY);
            const successPayload = {
                ...created,
                code: created.orderCode || created.code || buildOrderCode(),
                items: createdItems,
                totalPayment: created.totalAmount ?? serverTotalPayment,
            };

            // Thanh toán QR/chuyển khoản: tạo phiên thanh toán rồi navigate tới page chờ thanh toán
            if (paymentMethod === 'bank') {
                const orderId = created.id ?? created.orderId;
                if (orderId) {
                    try {
                        const paidAmount = Math.round(displayTotalPayment);
                        const sessionRes = await paymentApi.createSession(Number(orderId), paidAmount);
                        const sessionId = sessionRes.data?.sessionId;
                        if (sessionId) {
                            // Navigate tới page persist session
                            navigate(`/payment/waiting/${sessionId}`);
                            return;
                        }
                        throw new Error('Không nhận được phiên thanh toán QR.');
                    } catch (paymentError) {
                        setFormErrors((c) => ({
                            ...c,
                            order: paymentError?.response?.data?.message || paymentError?.message || 'Không thể tạo phiên thanh toán QR. Vui lòng thử lại.',
                        }));
                        return;
                    }
                }
                setFormErrors((c) => ({ ...c, order: 'Không tìm thấy mã đơn hàng để tạo phiên thanh toán QR.' }));
                return;
            }

            setOrderSuccess(successPayload);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            const data = e.response?.data;
            setFormErrors((c) => ({ ...c, order: data?.message || data?.detail || data?.title || 'Không thể tạo đơn hàng. Vui lòng thử lại.' }));
        } finally {
            setSubmittingOrder(false);
        }
    };

    // Polling trạng thái thanh toán QR mỗi 3 giây cho tới khi Paid/Expired.
    useEffect(() => {
        if (!paymentWait?.sessionId || orderSuccess || paymentExpired) return undefined;
        let active = true;
        const poll = async () => {
            try {
                const res = await paymentApi.getStatus(paymentWait.sessionId);
                if (!active) return;
                const status = res.data?.status;
                if (status === 'Paid') {
                    setOrderSuccess(paymentWait.order);
                    setPaymentWait(null);
                } else if (status === 'Expired') {
                    setPaymentExpired(true);
                }
            } catch {
                /* bỏ qua lỗi tạm thời, lần poll sau thử lại */
            }
        };
        poll();
        const timer = setInterval(poll, 3000);
        return () => { active = false; clearInterval(timer); };
    }, [paymentWait, orderSuccess, paymentExpired]);

    // Đếm ngược 15:00 theo expiresAt của phiên; hết giờ -> đánh dấu hết hạn.
    useEffect(() => {
        if (!paymentWait?.expiresAt || orderSuccess) { setSecondsLeft(null); return undefined; }
        const expiry = parseServerDateTime(paymentWait.expiresAt);
        if (Number.isNaN(expiry)) { setSecondsLeft(null); return undefined; }
        const tick = () => {
            const left = Math.max(0, Math.round((expiry - Date.now()) / 1000));
            setSecondsLeft(left);
            if (left <= 0) setPaymentExpired(true);
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [paymentWait, orderSuccess]);

    const formatCountdown = (s) => {
        if (s == null) return '15:00';
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const fieldErr = (key) => formErrors[key] ? <span className="mt-1 block text-[11px] text-red-600">{formErrors[key]}</span> : null;

    const renderCouponCard = ({ coupon, valid, message, missingAmount, productDiscount: ppd, shippingDiscount: psd }) => {
        const isApplied = coupon.couponType === 'product' ? appliedProductCoupon?.id === coupon.id : appliedShippingCoupon?.id === coupon.id;
        const discountPreview = coupon.couponType === 'product' ? ppd : psd;
        const isUsed = usedCouponIds.has(Number(coupon.apiId));
        const canApply = valid && !isUsed;
        return (
            <div
                key={coupon.id}
                className={cn(
                    "flex flex-col gap-2 rounded-xl border p-4 transition-colors md:flex-row md:items-center",
                    isApplied ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/5" : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
                    (!valid || isUsed) && "opacity-60"
                )}
            >
                <div className="min-w-0 flex-1">
                    <span className="ts-mono rounded-sm bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">{coupon.code}</span>
                    {isUsed ? (
                        <span className="ml-2 inline-flex rounded-full border border-red-500/40 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">Đã sử dụng</span>
                    ) : (
                        <span className="ml-2 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[10px] text-[var(--color-fg-dim)]">Đã nhận</span>
                    )}
                    <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">{getCouponDescription(coupon)}</p>
                    {discountPreview > 0 && canApply && <p className="mt-1 text-[11px] text-emerald-600">Dự kiến giảm {formatCurrency(discountPreview)}</p>}
                    {isUsed
                        ? <p className="mt-1 text-[11px] text-red-600">Phiếu này đã được sử dụng.</p>
                        : !valid && <p className="mt-1 text-[11px] text-red-600">{missingAmount > 0 ? `Còn thiếu ${formatCurrency(missingAmount)}` : message}</p>}
                </div>
                {isApplied ? (
                    <button onClick={() => removeCoupon(coupon.couponType)} className="ts-btn ts-btn-outline px-3 py-1.5 text-xs">Bỏ</button>
                ) : (
                    <button onClick={() => applyCoupon(coupon)} disabled={!canApply} className="ts-btn ts-btn-primary px-3 py-1.5 text-xs">
                        {isUsed ? 'Đã dùng' : 'Áp dụng'}
                    </button>
                )}
            </div>
        );
    };

    const renderUnclaimedCouponCard = ({ coupon, productDiscount: ppd, shippingDiscount: psd }) => {
        const discountPreview = coupon?.couponType === 'product' ? ppd : psd;
        const claiming = claimingCouponIds.includes(String(coupon.id));
        return (
            <div
                key={coupon.id}
                className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 transition-colors md:flex-row md:items-center"
            >
                <div className="min-w-0 flex-1">
                    <span className="ts-mono rounded-sm bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">{coupon.code}</span>
                    <span className="ml-2 inline-flex rounded-full border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Chưa nhận</span>
                    <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">{getCouponDescription(coupon)}</p>
                    {discountPreview > 0 && <p className="mt-1 text-[11px] text-emerald-600">Dự kiến giảm {formatCurrency(discountPreview)}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => claimCoupon(coupon)}
                        disabled={claiming}
                        className="ts-btn ts-btn-primary px-3 py-1.5 text-xs"
                    >
                        {claiming ? 'Đang nhận...' : 'Nhận & áp dụng'}
                    </button>
                    <Link to="/promotion" className="ts-btn ts-btn-outline px-3 py-1.5 text-xs">
                        Xem
                    </Link>
                </div>
            </div>
        );
    };

    const renderCouponGroup = ({ title, description, walletCoupons, unclaimedCoupons }) => {
        const hasWalletCoupons = walletCoupons.length > 0;
        const hasUnclaimedCoupons = unclaimedCoupons.length > 0;
        return (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="ts-eyebrow text-[var(--color-accent)]">{title}</p>
                        <p className="mt-1 text-xs text-[var(--color-fg-dim)]">{description}</p>
                    </div>
                    <span className="text-[11px] text-[var(--color-fg-muted)]">
                        {walletCoupons.length} trong ví · {unclaimedCoupons.length} có thể nhận
                    </span>
                </div>

                {hasWalletCoupons ? (
                    <div className="space-y-2">
                        <p className="ts-eyebrow text-[10px]">Đã có trong ví</p>
                        {walletCoupons.map(renderCouponCard)}
                    </div>
                ) : (
                    <p className="rounded-sm border border-dashed border-[var(--color-border)] px-3 py-3 text-xs text-[var(--color-fg-dim)]">
                        Chưa có phiếu loại này trong ví.
                    </p>
                )}

                {hasUnclaimedCoupons ? (
                    <div className="mt-4 space-y-2">
                        <p className="ts-eyebrow text-[10px]">Có thể nhận thêm</p>
                        {unclaimedCoupons.map(renderUnclaimedCouponCard)}
                    </div>
                ) : null}
            </div>
        );
    };

    const summary = (
        <div className="sticky top-24 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)]/8 to-[var(--color-accent)]/8 px-6 py-4">
                <p className="ts-eyebrow text-[var(--color-accent)]">Tóm tắt</p>
                <h4 className="ts-display mt-1 text-xl">Thanh toán</h4>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm">
                <div className="flex justify-between text-[var(--color-fg-muted)]"><span>Sản phẩm</span><span className="ts-mono">{selectedCartItems.length}</span></div>
                <div className="flex justify-between text-[var(--color-fg-muted)]"><span>Tạm tính</span><span className="ts-mono">{formatCurrency(productSubtotal)}</span></div>
                {displayProductDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm sản phẩm</span><span className="ts-mono">−{formatCurrency(displayProductDiscount)}</span></div>}
                <div className="flex justify-between text-[var(--color-fg-muted)]"><span>Phí vận chuyển</span><span className="ts-mono">{formatCurrency(shippingFee)}</span></div>
                {displayShippingDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm vận chuyển</span><span className="ts-mono">−{formatCurrency(displayShippingDiscount)}</span></div>}
            </div>
            <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-6 py-5">
                <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-[var(--color-fg)]">Tổng thanh toán</span>
                    <span className="ts-mono text-2xl font-bold ts-gradient-text">{formatCurrency(displayTotalPayment)}</span>
                </div>
            </div>
        </div>
    );

    if (orderSuccess) {
        return (
            <>
                <PageHero title="Đặt hàng thành công" current="Đặt hàng thành công" kicker="Cảm ơn" />
                <section className="ts-container py-12">
                    <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-8 text-center md:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10">
                            <i className="fas fa-check text-2xl text-emerald-600"></i>
                        </div>
                        <h2 className="ts-display mt-6 text-3xl">Đặt hàng thành công</h2>
                        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Cảm ơn bạn đã mua hàng tại TechStore.</p>

                        <div className="mt-8 space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-left text-sm">
                            <div className="flex justify-between"><span className="text-[var(--color-fg-dim)]">Mã đơn</span><strong className="ts-mono text-[var(--color-accent)]">{orderSuccess.code}</strong></div>
                            <div className="flex justify-between"><span className="text-[var(--color-fg-dim)]">Nhận hàng</span><strong className="text-[var(--color-fg)]">{deliveryMethod === 'pickup' ? 'Tại cửa hàng' : 'Giao tận nơi'}</strong></div>
                            <div className="flex justify-between"><span className="text-[var(--color-fg-dim)]">Thanh toán</span><strong className="text-[var(--color-fg)]">{getPaymentLabel(paymentMethod)}</strong></div>
                            <div className="flex justify-between border-t border-[var(--color-border)] pt-3"><span className="text-[var(--color-fg-dim)]">Tổng</span><strong className="ts-mono text-[var(--color-fg)]">{formatCurrency(displayTotalPayment)}</strong></div>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link to="/shop" className="ts-btn ts-btn-primary">Tiếp tục mua sắm</Link>
                            <Link to="/orders" className="ts-btn ts-btn-outline">Xem đơn hàng</Link>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (paymentWait && !orderSuccess) {
        return (
            <>
                <PageHero title="Chờ thanh toán" current="Chờ thanh toán" kicker="Thanh toán QR" />
                <section className="ts-container py-12">
                    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
                        {paymentExpired ? (
                            <>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                                    <i className="fas fa-clock text-2xl text-amber-600"></i>
                                </div>
                                <h2 className="ts-display mt-6 text-2xl">Phiên thanh toán đã hết hạn</h2>
                                <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Đơn hàng <strong>{paymentWait.order.code}</strong> đã được tạo. Bạn có thể thanh toán lại hoặc liên hệ cửa hàng.</p>
                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <Link to="/orders" className="ts-btn ts-btn-primary">Xem đơn hàng</Link>
                                    <Link to="/shop" className="ts-btn ts-btn-outline">Tiếp tục mua sắm</Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="ts-eyebrow text-[var(--color-accent)]">Đang chờ thanh toán…</p>
                                <h2 className="ts-display mt-2 text-2xl">Quét mã QR để thanh toán</h2>
                                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                                    Đơn <strong>{paymentWait.order.code}</strong>
                                    {paymentWait.bankName ? ` · ${paymentWait.bankName}` : ''} · <span className="ts-mono text-[var(--color-accent)]">{formatCurrency(paymentWait.amount)}</span>
                                </p>
                                {paymentWait.qrUrl && (
                                    <div className="mx-auto mt-6 w-56 rounded-xl border border-[var(--color-border)] bg-white p-3">
                                        <img src={paymentWait.qrUrl} alt="QR thanh toán" className="aspect-square w-full object-contain" />
                                    </div>
                                )}
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <i className="fas fa-clock text-sm text-[var(--color-fg-muted)]"></i>
                                    <span className="text-sm text-[var(--color-fg-muted)]">Mã QR còn hiệu lực:</span>
                                    <span className={cn(
                                        "ts-mono text-lg font-bold",
                                        (secondsLeft != null && secondsLeft <= 60) ? "text-red-600" : "text-[var(--color-fg)]"
                                    )}>{formatCountdown(secondsLeft)}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-fg-muted)]">
                                    <i className="fas fa-spinner fa-spin text-[var(--color-accent)]"></i>
                                    Đang chờ xác nhận thanh toán…
                                </div>
                                <p className="mt-3 text-xs text-[var(--color-fg-dim)]">Mã phiên: <span className="ts-mono">{paymentWait.sessionId}</span>. Màn hình tự cập nhật khi nhận được thanh toán.</p>
                                <div className="mt-6">
                                    <Link to="/orders" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">Thanh toán sau / Xem đơn hàng</Link>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </>
        );
    }

    if (selectedCartItems.length === 0) {
        return (
            <>
                <PageHero title={t('Checkout')} current={t('Checkout')} kicker="Thanh toán" />
                <section className="ts-container flex flex-col items-center py-20 text-center">
                    <i className="fas fa-shopping-cart text-4xl text-[var(--color-fg-dim)]"></i>
                    <p className="mt-6 text-sm text-[var(--color-fg-muted)]">Không có sản phẩm nào để thanh toán.</p>
                    <Link to="/cart" className="ts-btn ts-btn-primary mt-6">Quay lại giỏ hàng</Link>
                </section>
            </>
        );
    }

    return (
        <>
            <PageHero title={t('Checkout')} current={t('Checkout')} kicker="Thanh toán" />

            <section className="ts-container py-12">
                {/* Stepper */}
                <div className="mb-10 flex items-center justify-center gap-4">
                    {[1, 2].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={cn("flex items-center gap-2 text-sm", currentStep >= step ? "text-[var(--color-fg)]" : "text-[var(--color-fg-dim)]")}>
                                <span className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold",
                                    currentStep >= step
                                        ? "border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white"
                                        : "border-[var(--color-border)]"
                                )}>
                                    {step}
                                </span>
                                <strong>{step === 1 ? 'Thông tin' : 'Thanh toán'}</strong>
                            </div>
                            {i === 0 && <span className="h-px w-12 bg-[var(--color-border)]" />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div>
                        {currentStep === 1 ? (
                            <div className="space-y-8">
                                {/* Customer */}
                                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6">
                                    <p className="ts-eyebrow text-[var(--color-accent)]">Step 1.1</p>
                                    <h3 className="ts-display mt-1 text-xl">Thông tin khách hàng</h3>
                                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <label>
                                            <span className="ts-eyebrow mb-1.5 block text-[10px]">Họ tên *</span>
                                            <input className="ts-input" value={customerInfo.fullName} onChange={updateCustomerInfo('fullName')} />
                                            {fieldErr('fullName')}
                                        </label>
                                        <label>
                                            <span className="ts-eyebrow mb-1.5 block text-[10px]">Số điện thoại *</span>
                                            <input className="ts-input" value={customerInfo.phone} onChange={updateCustomerInfo('phone')} />
                                            {fieldErr('phone')}
                                        </label>
                                        <label className="md:col-span-2">
                                            <span className="ts-eyebrow mb-1.5 block text-[10px]">Email</span>
                                            <input className="ts-input" value={customerInfo.email} onChange={updateCustomerInfo('email')} />
                                            {fieldErr('email')}
                                        </label>
                                        <label className="md:col-span-2">
                                            <span className="ts-eyebrow mb-1.5 block text-[10px]">Ghi chú đơn hàng</span>
                                            <textarea className="ts-input resize-none" rows={3} value={customerInfo.notes} onChange={updateCustomerInfo('notes')} />
                                        </label>
                                    </div>
                                </section>

                                {/* Delivery */}
                                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6">
                                    <p className="ts-eyebrow text-[var(--color-accent)]">Step 1.2</p>
                                    <h3 className="ts-display mt-1 text-xl">Phương thức nhận hàng</h3>
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        {[['pickup', 'Tại cửa hàng', 'fa-store'], ['shipping', 'Giao tận nơi', 'fa-truck']].map(([val, label, icon]) => (
                                            <label key={val} className={cn(
                                                "flex cursor-pointer flex-col items-center gap-2 rounded-sm border p-4 transition-colors",
                                                deliveryMethod === val
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-fg)]"
                                                    : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)]"
                                            )}>
                                                <input type="radio" name="delivery" checked={deliveryMethod === val} onChange={() => setDeliveryMethod(val)} className="hidden" />
                                                <i className={`fas ${icon} text-lg ${deliveryMethod === val ? 'text-[var(--color-accent)]' : ''}`}></i>
                                                <span className="text-sm font-medium">{label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {deliveryMethod === 'pickup' ? (
                                        <div className="mt-5 space-y-3">
                                            <label>
                                                <span className="ts-eyebrow mb-1.5 block text-[10px]">Chọn chi nhánh *</span>
                                                <select
                                                    className="ts-input"
                                                    value={storePickupInfo.branchId || ''}
                                                    onChange={(e) => setStorePickupInfo((c) => ({ ...c, branchId: e.target.value ? Number(e.target.value) : null }))}
                                                    disabled={loadingPickupBranches}
                                                >
                                                    {(pickupBranches || []).map((b) => {
                                                        const id = Number(b.id ?? b.Id);
                                                        const name = b.name ?? b.Name ?? `Chi nhánh #${id}`;
                                                        const address = b.address ?? b.Address ?? '';
                                                        const label = [name, address].filter(Boolean).join(' — ');
                                                        return <option key={id} value={id}>{label}</option>;
                                                    })}
                                                </select>
                                                {fieldErr('pickupBranch')}
                                            </label>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                <label>
                                                    <span className="ts-eyebrow mb-1.5 block text-[10px]">Ngày nhận *</span>
                                                    <input
                                                        type="date"
                                                        className="ts-input"
                                                        value={storePickupInfo.date}
                                                        min={pickupMinDate}
                                                        max={pickupMaxDate}
                                                        onChange={(e) => setStorePickupInfo((c) => ({ ...c, date: e.target.value, slot: '' }))}
                                                    />
                                                    {fieldErr('pickupDate')}
                                                </label>
                                                <label>
                                                    <span className="ts-eyebrow mb-1.5 block text-[10px]">Giờ nhận *</span>
                                                    <select
                                                        className="ts-input"
                                                        value={storePickupInfo.slot}
                                                        disabled={availablePickupSlots.length === 0}
                                                        onChange={(e) => setStorePickupInfo((c) => ({ ...c, slot: e.target.value }))}
                                                    >
                                                        <option value="">Chọn khung giờ</option>
                                                        {availablePickupSlots.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                    </select>
                                                    {fieldErr('pickupSlot')}
                                                    {availablePickupSlots.length === 0 ? (
                                                        <p className="mt-1 text-xs text-[var(--color-danger)]">Hôm nay đã hết khung giờ nhận hàng, vui lòng chọn ngày khác.</p>
                                                    ) : null}
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <label>
                                                <span className="ts-eyebrow mb-1.5 block text-[10px]">Tỉnh / Thành phố *</span>
                                                <select
                                                    className="ts-input"
                                                    value={shippingAddress.province}
                                                    disabled={provincesData.length === 0}
                                                    onChange={(e) => {
                                                        const province = e.target.value;
                                                        setShippingAddress((c) => ({ ...c, province, ward: '' }));
                                                        setFormErrors((c) => ({ ...c, 'shipping.province': '', 'shipping.ward': '' }));
                                                    }}
                                                >
                                                    <option value="">{provincesData.length === 0 ? 'Đang tải…' : '— Chọn Tỉnh / Thành phố —'}</option>
                                                    {provincesData.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                                                </select>
                                                {fieldErr('shipping.province')}
                                            </label>
                                            <label>
                                                <span className="ts-eyebrow mb-1.5 block text-[10px]">Phường / Xã *</span>
                                                <select
                                                    className="ts-input"
                                                    value={shippingAddress.ward}
                                                    disabled={!shippingAddress.province}
                                                    onChange={updateShippingAddress('ward')}
                                                >
                                                    <option value="">{!shippingAddress.province ? '— Chọn Tỉnh trước —' : '— Chọn Phường / Xã —'}</option>
                                                    {wardOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                                                </select>
                                                {fieldErr('shipping.ward')}
                                            </label>
                                            <label className="md:col-span-2">
                                                <span className="ts-eyebrow mb-1.5 block text-[10px]">Địa chỉ cụ thể (số nhà, tên đường) *</span>
                                                <input
                                                    className="ts-input"
                                                    value={shippingAddress.address}
                                                    onChange={updateShippingAddress('address')}
                                                    placeholder="VD: Số 12, ngõ 34, đường Cầu Giấy"
                                                />
                                                {fieldErr('shipping.address')}
                                            </label>
                                        </div>
                                    )}
                                </section>

                                <div className="flex justify-between gap-3">
                                    <button onClick={() => navigate('/cart')} className="ts-btn ts-btn-ghost">
                                        <i className="fas fa-arrow-left text-[10px]"></i>Quay lại giỏ hàng
                                    </button>
                                    <button onClick={goToPaymentStep} className="ts-btn ts-btn-primary px-6">
                                        Tiếp tục <i className="fas fa-arrow-right text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Review */}
                                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6">
                                    <div className="mb-5 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="ts-eyebrow text-[var(--color-accent)]">Xác nhận</p>
                                            <h3 className="ts-display mt-1 text-xl">Thông tin nhận hàng</h3>
                                        </div>
                                        <button onClick={() => setCurrentStep(1)} className="ts-btn ts-btn-outline text-xs">Chỉnh sửa</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                                        {[
                                            ['Họ tên', customerInfo.fullName],
                                            ['Điện thoại', customerInfo.phone],
                                            ['Email', customerInfo.email || '—'],
                                            ['Phương thức', deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao tận nơi'],
                                            ...(deliveryMethod === 'pickup'
                                                ? [
                                                    ['Chi nhánh', pickupLocationText || '—'],
                                                    ['Khung giờ', pickupSlot.label || '—'],
                                                ]
                                                : [['Địa chỉ', fullShippingAddress]]),
                                            ['Ghi chú', customerInfo.notes || '—'],
                                        ].map(([label, value]) => (
                                            <div key={label} className="rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] p-3">
                                                <p className="ts-eyebrow text-[10px]">{label}</p>
                                                <p className="mt-1 text-[var(--color-fg)]">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Items */}
                                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6">
                                    <h3 className="ts-display mb-5 text-xl">Sản phẩm thanh toán</h3>
                                    <ul className="divide-y divide-[var(--color-border)]">
                                        {selectedCartItems.map((item) => (
                                            <li key={item.productId} className="flex items-center gap-3 py-3">
                                                <img src={resolveProductImage(item.product)} alt="" className="h-14 w-14 rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] object-contain p-1" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-1 text-sm font-medium text-[var(--color-fg)]">{item.product.name}</p>
                                                    <p className="ts-mono mt-0.5 text-xs text-[var(--color-fg-dim)]">×{item.quantity} · {formatCurrency(item.product.price)}</p>
                                                </div>
                                                <p className="ts-mono text-sm font-semibold text-[var(--color-fg)]">{formatCurrency(item.product.price * item.quantity)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Coupons */}
                                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6">
                                    <h3 className="ts-display mb-5 text-xl">Phiếu giảm giá</h3>
                                    {couponMessage && (
                                        <div className="mb-4 rounded-sm border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-fg)]">{couponMessage}</div>
                                    )}
                                    {(unclaimedProductCoupons.length > 0 || unclaimedShippingCoupons.length > 0) && (
                                        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                                            Có phiếu phù hợp nhưng chưa nằm trong ví. Khách có thể nhấn “Nhận phiếu” ngay tại đây rồi áp dụng, không cần rời trang thanh toán.
                                        </div>
                                    )}
                                    <div className="grid gap-4">
                                        {renderCouponGroup({
                                            title: 'Phiếu sản phẩm',
                                            description: 'Giảm trực tiếp vào tổng tiền sản phẩm trong đơn.',
                                            walletCoupons: productCouponOptions,
                                            unclaimedCoupons: unclaimedProductCoupons,
                                        })}
                                        {renderCouponGroup({
                                            title: 'Phiếu vận chuyển',
                                            description: deliveryMethod === 'pickup' ? 'Không áp dụng khi nhận tại cửa hàng vì phí vận chuyển bằng 0.' : 'Giảm hoặc miễn phí vận chuyển.',
                                            walletCoupons: shippingCouponOptions,
                                            unclaimedCoupons: unclaimedShippingCoupons,
                                        })}
                                    </div>
                                </section>

                                {/* Payment */}
                                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6">
                                    <p className="ts-eyebrow text-[var(--color-accent)]">Thanh toán</p>
                                    <h3 className="ts-display mt-1 mb-5 text-xl">Phương thức thanh toán</h3>
                                    {formErrors.paymentMethod && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-50 px-3 py-2 text-xs text-red-700">{formErrors.paymentMethod}</p>}
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <label
                                            className={cn(
                                                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                                                paymentMethod === 'store'
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                    : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                                                deliveryMethod !== 'pickup' && "pointer-events-none opacity-40"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={paymentMethod === 'store'}
                                                disabled={deliveryMethod !== 'pickup'}
                                                onChange={() => setPaymentMethod('store')}
                                                className="mt-1 accent-[var(--color-primary)]"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[var(--color-fg)]">Thanh toán tại cửa hàng</p>
                                                <p className="mt-0.5 text-[11px] text-[var(--color-fg-dim)]">Thanh toán trực tiếp khi nhận sản phẩm tại chi nhánh.</p>
                                                {deliveryMethod !== 'pickup' ? (
                                                    <p className="mt-2 text-[11px] text-amber-700">Chỉ dùng khi chọn nhận tại cửa hàng.</p>
                                                ) : null}
                                            </div>
                                        </label>

                                        <label
                                            className={cn(
                                                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                                                paymentMethod === 'bank'
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                    : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={paymentMethod === 'bank'}
                                                onChange={() => setPaymentMethod('bank')}
                                                className="mt-1 accent-[var(--color-primary)]"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[var(--color-fg)]">Thanh toán trực tuyến</p>
                                                <p className="mt-0.5 text-[11px] text-[var(--color-fg-dim)]">Chọn ngân hàng và quét mã QR chuyển khoản.</p>
                                            </div>
                                        </label>
                                    </div>

                                    {paymentMethod === 'bank' && (
                                        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                                            <div className="mb-3">
                                                <p className="ts-eyebrow text-[10px]">Ngân hàng thanh toán</p>
                                                <p className="mt-1 mb-2.5 text-xs text-[var(--color-fg-dim)]">Chọn ngân hàng để hiển thị mã QR tương ứng.</p>
                                                {onlineBankOptions.length === 0 ? (
                                                    <p className="text-xs text-[var(--color-fg-dim)]">Chưa cấu hình ngân hàng.</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {onlineBankOptions.map((bank) => (
                                                            <button
                                                                key={bank.id}
                                                                type="button"
                                                                onClick={() => setSelectedOnlineBankId(bank.id)}
                                                                className={cn(
                                                                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                                                                    selectedOnlineBank?.id === bank.id
                                                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                                                        : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)]"
                                                                )}
                                                            >
                                                                <img
                                                                    src={buildBankLogoUrl(bank.bankName)}
                                                                    alt=""
                                                                    aria-hidden="true"
                                                                    className="h-4 w-auto max-w-[56px] object-contain"
                                                                    loading="lazy"
                                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                                />
                                                                {bank.bankName}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedOnlineBank?.accountNumber ? (
                                                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                                                    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
                                                        {selectedBankQrUrl ? (
                                                            <img src={selectedBankQrUrl} alt={`QR ${selectedOnlineBank.bankName}`} className="aspect-square w-full object-contain" />
                                                        ) : (
                                                            <div className="flex aspect-square items-center justify-center text-center text-xs text-[var(--color-fg-dim)]">Không thể tạo QR</div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <p>Ngân hàng: <strong className="text-[var(--color-fg)]">{selectedOnlineBank.bankName}</strong></p>
                                                        <p>Số tài khoản: <strong className="ts-mono text-[var(--color-fg)]">{selectedOnlineBank.accountNumber}</strong></p>
                                                        {selectedOnlineBank.accountHolder && <p>Chủ tài khoản: <strong className="text-[var(--color-fg)]">{selectedOnlineBank.accountHolder}</strong></p>}
                                                        <p>Nội dung: <strong className="ts-mono text-[var(--color-accent)]">{transferContent}</strong></p>
                                                        <p className="border-t border-[var(--color-border)] pt-2">Tổng chuyển khoản: <strong className="ts-mono text-[var(--color-accent)]">{formatCurrency(displayTotalPayment)}</strong></p>
                                                        <p className="text-xs text-[var(--color-fg-dim)]">Bấm <strong>Đặt hàng</strong> để mở màn hình thanh toán QR — hệ thống tự xác nhận khi nhận được tiền.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 text-sm text-amber-700">Thông tin ngân hàng chưa được cấu hình. Vui lòng cấu hình trong phần Cài đặt cửa hàng.</p>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {formErrors.order && (
                                    <div className="rounded-lg border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700">{formErrors.order}</div>
                                )}

                                <div className="flex justify-between gap-3">
                                    <button onClick={() => setCurrentStep(1)} className="ts-btn ts-btn-ghost">
                                        <i className="fas fa-arrow-left text-[10px]"></i>Quay lại
                                    </button>
                                    <button
                                        onClick={placeOrder}
                                        disabled={submittingOrder}
                                        className="ts-btn ts-btn-primary px-6"
                                    >
                                        {submittingOrder ? <><i className="fas fa-spinner fa-spin"></i>Đang xử lý...</> : <>{paymentMethod === 'bank' ? 'Thanh toán trực tuyến' : 'Đặt hàng'}<i className="fas fa-arrow-right text-[10px]"></i></>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside>{summary}</aside>
                </div>
            </section>
        </>
    );
};

export default Checkout;
