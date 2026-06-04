import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { orderApi, couponApi, settingsApi } from '../../services/api';
import { usePublicCoupons } from '../../hooks/usePublicCoupons';
import PageHero from '../../components/store/PageHero';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';
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
const pickupDateOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'tomorrow', label: 'Ngày mai' },
];

const pickupTimeSlots = [
    { value: '09:00-11:00', label: '09:00 - 11:00', start: '09:00', end: '11:00' },
    { value: '13:00-15:00', label: '13:00 - 15:00', start: '13:00', end: '15:00' },
    { value: '18:00-20:00', label: '18:00 - 20:00', start: '18:00', end: '20:00' },
];

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
    bank: 'Chuyển khoản ngân hàng',
    momo: 'MoMo',
    shopeepay: 'ShopeePay',
    applepay: 'Apple Pay',
}[method] || 'Chưa chọn');

const toApiPaymentMethod = (method) => ({
    store: 'StorePayment', bank: 'BankTransfer', momo: 'Momo', shopeepay: 'ShopeePay', applepay: 'ApplePay',
}[method] || 'BankTransfer');

const getCreatedOrder = (payload) => payload?.order || payload || {};
const getCreatedOrderItems = (payload, fallback) => payload?.items || payload?.details || fallback;

const paymentOptions = [
    { value: 'store', label: 'Tại cửa hàng', desc: 'Thanh toán khi nhận sản phẩm', icon: 'fa-store' },
    { value: 'bank', label: 'Chuyển khoản', desc: 'Chuyển khoản qua mã QR', icon: 'fa-university' },
    { value: 'momo', label: 'MoMo', desc: 'Thanh toán qua ví MoMo', icon: 'fa-wallet' },
    { value: 'shopeepay', label: 'ShopeePay', desc: 'Thanh toán qua ShopeePay', icon: 'fa-wallet' },
    { value: 'applepay', label: 'Apple Pay', desc: 'Thanh toán qua Apple Pay', icon: 'fa-apple-pay' },
];

const Checkout = () => {
    const { items, removeItem } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState({});
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({ fullName: '', phone: '', email: '', notes: '' });
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [pickupBranches, setPickupBranches] = useState([]);
    const [loadingPickupBranches, setLoadingPickupBranches] = useState(false);
    const [storePickupInfo, setStorePickupInfo] = useState({
        branchId: null,
        date: pickupDateOptions[0].value,
        slot: pickupTimeSlots[0].value,
    });
    const [shippingAddress, setShippingAddress] = useState({ province: '', district: '', ward: '', address: '' });
    const [invoiceRequired, setInvoiceRequired] = useState(false);
    const [invoiceInfo, setInvoiceInfo] = useState({ name: '', taxCode: '', address: '', email: '' });
    const [paymentMethod, setPaymentMethod] = useState('store');
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
            return Array.isArray(stored) ? stored.map((i) => String(i.productId)) : [];
        } catch { return []; }
    }, []);

    const selectedCartItems = useMemo(() => {
        if (checkoutSelectionIds.length === 0) return items;
        const sel = new Set(checkoutSelectionIds);
        return items.filter((i) => sel.has(String(i.productId)));
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

    const fullShippingAddress = [shippingAddress.address, shippingAddress.ward, shippingAddress.district, shippingAddress.province].filter(Boolean).join(', ');
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

    const pickupSlot = useMemo(() => {
        const slotDef = pickupTimeSlots.find((s) => s.value === storePickupInfo.slot) || pickupTimeSlots[0];
        const base = new Date();
        if (storePickupInfo.date === 'tomorrow') base.setDate(base.getDate() + 1);
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
            label: `${pickupDateOptions.find((d) => d.value === storePickupInfo.date)?.label || ''} • ${slotDef.label}`,
            startAtIso: startAt.toISOString(),
            endAtIso: endAt.toISOString(),
        };
    }, [storePickupInfo.date, storePickupInfo.slot]);

    useEffect(() => {
        if (!selectedCartItems.length) return;
        if (!persistedCoupons.productUserCouponId && !persistedCoupons.shippingUserCouponId) return;
        if (!coupons.length || !myCoupons.length) return;
        if (appliedProductCoupon || appliedShippingCoupon) return;

        const byUserCouponId = new Map((myCoupons || []).map((uc) => [Number(uc?.id), uc]));
        if (persistedCoupons.productUserCouponId) {
            const uc = byUserCouponId.get(Number(persistedCoupons.productUserCouponId));
            const c = coupons.find((x) => Number(x.apiId) === Number(uc?.couponId));
            if (c) setAppliedProductCoupon({ ...c, userCouponId: Number(uc.id) });
        }
        if (persistedCoupons.shippingUserCouponId) {
            const uc = byUserCouponId.get(Number(persistedCoupons.shippingUserCouponId));
            const c = coupons.find((x) => Number(x.apiId) === Number(uc?.couponId));
            if (c) setAppliedShippingCoupon({ ...c, userCouponId: Number(uc.id) });
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
    }, [selectedCartItems, deliveryMethod, shippingFee, appliedProductCoupon?.userCouponId, appliedShippingCoupon?.userCouponId]);

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
    const updateInvoiceInfo = (field) => (e) => {
        setInvoiceInfo((c) => ({ ...c, [field]: e.target.value }));
        setFormErrors((c) => ({ ...c, [`invoice.${field}`]: '' }));
    };

    const validateStepOne = () => {
        const errs = {};
        if (!customerInfo.fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên.';
        if (!customerInfo.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại.';
        if (customerInfo.email.trim() && !emailPattern.test(customerInfo.email.trim())) errs.email = 'Email chưa đúng định dạng.';

        if (deliveryMethod === 'pickup') {
            if (!storePickupInfo.branchId) errs.pickupBranch = 'Vui lòng chọn chi nhánh.';
            if (!storePickupInfo.slot) errs.pickupSlot = 'Vui lòng chọn khung giờ nhận hàng.';
        } else {
            if (!shippingAddress.province.trim()) errs['shipping.province'] = 'Bắt buộc.';
            if (!shippingAddress.district.trim()) errs['shipping.district'] = 'Bắt buộc.';
            if (!shippingAddress.ward.trim()) errs['shipping.ward'] = 'Bắt buộc.';
            if (!shippingAddress.address.trim()) errs['shipping.address'] = 'Bắt buộc.';
        }

        if (invoiceRequired) {
            if (!invoiceInfo.name.trim()) errs['invoice.name'] = 'Bắt buộc.';
            if (!invoiceInfo.taxCode.trim()) errs['invoice.taxCode'] = 'Bắt buộc.';
            if (invoiceInfo.email.trim() && !emailPattern.test(invoiceInfo.email.trim())) errs['invoice.email'] = 'Email chưa đúng định dạng.';
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
            }
            setCouponMessage(`Đã nhận phiếu ${coupon.code}. Bạn có thể áp dụng ngay.`);
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
        if (!validateStepOne()) { setCurrentStep(1); return; }
        if (selectedCartItems.length === 0) { setFormErrors({ order: 'Không có sản phẩm nào để thanh toán.' }); return; }
        if (!paymentMethod) { setFormErrors({ paymentMethod: 'Vui lòng chọn phương thức thanh toán.' }); return; }
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
            district: deliveryMethod === 'shipping' ? shippingAddress.district.trim() : null,
            ward: deliveryMethod === 'shipping' ? shippingAddress.ward.trim() : null,
            addressDetail: deliveryMethod === 'shipping' ? shippingAddress.address.trim() : null,
            shippingAddress: deliveryMethod === 'shipping' ? fullShippingAddress : null,
            storePickupLocation: deliveryMethod === 'pickup' ? (pickupLocationText || null) : null,
            pickupWarehouseId: deliveryMethod === 'pickup' && storePickupInfo.branchId ? Number(storePickupInfo.branchId) : null,
            pickupSlotStartAt: deliveryMethod === 'pickup' ? pickupSlot.startAtIso : null,
            pickupSlotEndAt: deliveryMethod === 'pickup' ? pickupSlot.endAtIso : null,
            paymentMethod: toApiPaymentMethod(paymentMethod),
            notes: customerInfo.notes.trim() || null,
            invoiceRequired,
            invoiceCompanyName: invoiceRequired ? invoiceInfo.name.trim() : null,
            invoiceTaxCode: invoiceRequired ? invoiceInfo.taxCode.trim() : null,
            invoiceAddress: invoiceRequired ? invoiceInfo.address.trim() : null,
            invoiceEmail: invoiceRequired ? invoiceInfo.email.trim() : null,
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
            const response = await orderApi.create(payload);
            const created = getCreatedOrder(response.data);
            const createdItems = getCreatedOrderItems(response.data, selectedCartItems);
            selectedCartItems.forEach((i) => removeItem(i.productId));
            sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
            sessionStorage.removeItem(CHECKOUT_COUPON_KEY);
            setOrderSuccess({
                ...created,
                code: created.orderCode || created.code || buildOrderCode(),
                items: createdItems,
                totalPayment: created.totalAmount ?? serverTotalPayment,
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            const data = e.response?.data;
            setFormErrors((c) => ({ ...c, order: data?.message || data?.detail || data?.title || 'Không thể tạo đơn hàng. Vui lòng thử lại.' }));
        } finally {
            setSubmittingOrder(false);
        }
    };

    const fieldErr = (key) => formErrors[key] ? <span className="mt-1 block text-[11px] text-red-400">{formErrors[key]}</span> : null;

    const renderCouponCard = ({ coupon, valid, message, missingAmount, productDiscount: ppd, shippingDiscount: psd }) => {
        const isApplied = coupon.couponType === 'product' ? appliedProductCoupon?.id === coupon.id : appliedShippingCoupon?.id === coupon.id;
        const discountPreview = coupon.couponType === 'product' ? ppd : psd;
        return (
            <div
                key={coupon.id}
                className={cn(
                    "flex flex-col gap-2 rounded-md border p-4 transition-colors md:flex-row md:items-center",
                    isApplied ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/5" : "border-[var(--color-border)] bg-[var(--color-surface-2)]",
                    !valid && "opacity-60"
                )}
            >
                <div className="min-w-0 flex-1">
                    <span className="ts-mono rounded-sm bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">{coupon.code}</span>
                    <span className="ml-2 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[10px] text-[var(--color-fg-dim)]">Đã nhận</span>
                    <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">{getCouponDescription(coupon)}</p>
                    {discountPreview > 0 && valid && <p className="mt-1 text-[11px] text-emerald-400">Dự kiến giảm {formatCurrency(discountPreview)}</p>}
                    {!valid && <p className="mt-1 text-[11px] text-red-400">{missingAmount > 0 ? `Còn thiếu ${formatCurrency(missingAmount)}` : message}</p>}
                </div>
                {isApplied ? (
                    <button onClick={() => removeCoupon(coupon.couponType)} className="ts-btn ts-btn-outline px-3 py-1.5 text-xs">Bỏ</button>
                ) : (
                    <button onClick={() => applyCoupon(coupon)} disabled={!valid} className="ts-btn ts-btn-primary px-3 py-1.5 text-xs">Áp dụng</button>
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
                    <span className="ml-2 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">Chưa nhận</span>
                    <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">{getCouponDescription(coupon)}</p>
                    {discountPreview > 0 && <p className="mt-1 text-[11px] text-emerald-400">Dự kiến giảm {formatCurrency(discountPreview)}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => claimCoupon(coupon)}
                        disabled={claiming}
                        className="ts-btn ts-btn-primary px-3 py-1.5 text-xs"
                    >
                        {claiming ? 'Đang nhận...' : 'Nhận phiếu'}
                    </button>
                    <Link to="/promotion" className="ts-btn ts-btn-outline px-3 py-1.5 text-xs">
                        Xem
                    </Link>
                </div>
            </div>
        );
    };

    const summary = (
        <div className="sticky top-24 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
                <p className="ts-eyebrow text-[var(--color-accent)]">Order Summary</p>
                <h4 className="ts-display mt-1 text-xl">Tóm tắt thanh toán</h4>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm">
                <div className="flex justify-between text-[var(--color-fg-muted)]"><span>Sản phẩm</span><span className="ts-mono">{selectedCartItems.length}</span></div>
                <div className="flex justify-between text-[var(--color-fg-muted)]"><span>Tạm tính</span><span className="ts-mono">{formatCurrency(productSubtotal)}</span></div>
                {displayProductDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Giảm sản phẩm</span><span className="ts-mono">−{formatCurrency(displayProductDiscount)}</span></div>}
                <div className="flex justify-between text-[var(--color-fg-muted)]"><span>Phí vận chuyển</span><span className="ts-mono">{formatCurrency(shippingFee)}</span></div>
                {displayShippingDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Giảm vận chuyển</span><span className="ts-mono">−{formatCurrency(displayShippingDiscount)}</span></div>}
            </div>
            <div className="border-t border-[var(--color-border)] px-6 py-5">
                <div className="flex items-baseline justify-between">
                    <span className="ts-eyebrow text-[10px]">Tổng thanh toán</span>
                    <span className="ts-mono text-2xl font-bold ts-gradient-text">{formatCurrency(displayTotalPayment)}</span>
                </div>
            </div>
        </div>
    );

    if (orderSuccess) {
        return (
            <>
                <PageHero title="Đặt hàng thành công" current="Order success" kicker="Thank you" />
                <section className="ts-container py-12">
                    <div className="mx-auto max-w-2xl rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center md:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10">
                            <i className="fas fa-check text-2xl text-emerald-400"></i>
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

    if (selectedCartItems.length === 0) {
        return (
            <>
                <PageHero title={t('Checkout')} current={t('Checkout')} kicker="Checkout" />
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
            <PageHero title={t('Checkout')} current={t('Checkout')} kicker="Checkout" />

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
                                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
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
                                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
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
                                                    <select className="ts-input" value={storePickupInfo.date} onChange={(e) => setStorePickupInfo((c) => ({ ...c, date: e.target.value }))}>
                                                        {pickupDateOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                                                    </select>
                                                </label>
                                                <label>
                                                    <span className="ts-eyebrow mb-1.5 block text-[10px]">Giờ nhận *</span>
                                                    <select className="ts-input" value={storePickupInfo.slot} onChange={(e) => setStorePickupInfo((c) => ({ ...c, slot: e.target.value }))}>
                                                        {pickupTimeSlots.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                    </select>
                                                    {fieldErr('pickupSlot')}
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {[
                                                ['province', 'Tỉnh / TP *'],
                                                ['district', 'Quận / Huyện *'],
                                                ['ward', 'Phường / Xã *'],
                                                ['address', 'Địa chỉ cụ thể *'],
                                            ].map(([field, label]) => (
                                                <label key={field} className={field === 'address' ? 'md:col-span-2' : ''}>
                                                    <span className="ts-eyebrow mb-1.5 block text-[10px]">{label}</span>
                                                    <input className="ts-input" value={shippingAddress[field]} onChange={updateShippingAddress(field)} />
                                                    {fieldErr(`shipping.${field}`)}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* Invoice */}
                                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                                    <p className="ts-eyebrow text-[var(--color-accent)]">Step 1.3</p>
                                    <h3 className="ts-display mt-1 text-xl">Xuất hóa đơn?</h3>
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        {[[false, 'Không'], [true, 'Có']].map(([val, label]) => (
                                            <label key={String(val)} className={cn(
                                                "flex cursor-pointer items-center justify-center gap-2 rounded-sm border p-3 transition-colors",
                                                invoiceRequired === val
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-fg)]"
                                                    : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)]"
                                            )}>
                                                <input type="radio" name="invoice" checked={invoiceRequired === val} onChange={() => setInvoiceRequired(val)} className="hidden" />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                    {invoiceRequired && (
                                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {[
                                                ['name', 'Tên công ty *'],
                                                ['taxCode', 'Mã số thuế *'],
                                                ['address', 'Địa chỉ'],
                                                ['email', 'Email nhận hóa đơn'],
                                            ].map(([field, label]) => (
                                                <label key={field}>
                                                    <span className="ts-eyebrow mb-1.5 block text-[10px]">{label}</span>
                                                    <input className="ts-input" value={invoiceInfo[field]} onChange={updateInvoiceInfo(field)} />
                                                    {fieldErr(`invoice.${field}`)}
                                                </label>
                                            ))}
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
                                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                                    <div className="mb-5 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="ts-eyebrow text-[var(--color-accent)]">Review</p>
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
                                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
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
                                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                                    <h3 className="ts-display mb-5 text-xl">Phiếu giảm giá</h3>
                                    {couponMessage && (
                                        <div className="mb-4 rounded-sm border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-fg)]">{couponMessage}</div>
                                    )}
                                    {(unclaimedProductCoupons.length > 0 || unclaimedShippingCoupons.length > 0) && (
                                        <div className="mb-6 rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                                            Có phiếu phù hợp nhưng bạn chưa nhận. Nhấn “Nhận phiếu” để đưa vào ví trước khi áp dụng.
                                        </div>
                                    )}
                                    {unclaimedProductCoupons.length > 0 && (
                                        <div className="mb-4">
                                            <p className="ts-eyebrow mb-2 text-[10px]">Phiếu sản phẩm (chưa nhận)</p>
                                            <div className="space-y-2">{unclaimedProductCoupons.map(renderUnclaimedCouponCard)}</div>
                                        </div>
                                    )}
                                    {unclaimedShippingCoupons.length > 0 && (
                                        <div className="mb-4">
                                            <p className="ts-eyebrow mb-2 text-[10px]">Phiếu vận chuyển (chưa nhận)</p>
                                            <div className="space-y-2">{unclaimedShippingCoupons.map(renderUnclaimedCouponCard)}</div>
                                        </div>
                                    )}
                                    {productCouponOptions.length > 0 && (
                                        <div className="mb-4">
                                            <p className="ts-eyebrow mb-2 text-[10px]">Phiếu sản phẩm</p>
                                            <div className="space-y-2">{productCouponOptions.map(renderCouponCard)}</div>
                                        </div>
                                    )}
                                    {shippingCouponOptions.length > 0 && (
                                        <div>
                                            <p className="ts-eyebrow mb-2 text-[10px]">Phiếu vận chuyển</p>
                                            <div className="space-y-2">{shippingCouponOptions.map(renderCouponCard)}</div>
                                        </div>
                                    )}
                                    {productCouponOptions.length === 0 && shippingCouponOptions.length === 0 && unclaimedProductCoupons.length === 0 && unclaimedShippingCoupons.length === 0 && (
                                        <p className="rounded-sm border border-dashed border-[var(--color-border)] p-6 text-center text-xs text-[var(--color-fg-dim)]">Không có phiếu nào áp dụng cho đơn này.</p>
                                    )}
                                </section>

                                {/* Payment */}
                                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                                    <p className="ts-eyebrow text-[var(--color-accent)]">Payment</p>
                                    <h3 className="ts-display mt-1 mb-5 text-xl">Phương thức thanh toán</h3>
                                    {formErrors.paymentMethod && <p className="mb-3 rounded-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{formErrors.paymentMethod}</p>}
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {paymentOptions.map((opt) => {
                                            const disabled = opt.value === 'store' && deliveryMethod !== 'pickup';
                                            return (
                                                <label
                                                    key={opt.value}
                                                    className={cn(
                                                        "flex cursor-pointer items-start gap-3 rounded-sm border p-3 transition-colors",
                                                        paymentMethod === opt.value
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                            : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                                                        disabled && "pointer-events-none opacity-40"
                                                    )}
                                                >
                                                    <input type="radio" name="paymentMethod" checked={paymentMethod === opt.value} disabled={disabled} onChange={() => setPaymentMethod(opt.value)} className="mt-1 accent-[var(--color-primary)]" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[var(--color-fg)]">{opt.label}</p>
                                                        <p className="mt-0.5 text-[11px] text-[var(--color-fg-dim)]">{opt.desc}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {paymentMethod === 'bank' && (
                                        <div className="mt-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                                            <p className="ts-eyebrow mb-2 text-[10px]">Thông tin chuyển khoản</p>
                                            <div className="space-y-1 text-sm">
                                                <p>Ngân hàng: <strong className="text-[var(--color-fg)]">Vietcombank</strong></p>
                                                <p>Số tài khoản: <strong className="ts-mono text-[var(--color-fg)]">0123456789</strong></p>
                                                <p>Chủ tài khoản: <strong className="text-[var(--color-fg)]">TECHSTORE</strong></p>
                                                <p>Nội dung: <strong className="ts-mono text-[var(--color-accent)]">TECHSTORE {customerInfo.phone || 'SODIENTHOAI'}</strong></p>
                                                <p className="mt-2 border-t border-[var(--color-border)] pt-2">Tổng: <strong className="ts-mono text-[var(--color-accent)]">{formatCurrency(displayTotalPayment)}</strong></p>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {formErrors.order && (
                                    <div className="rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{formErrors.order}</div>
                                )}

                                <div className="flex justify-between gap-3">
                                    <button onClick={() => setCurrentStep(1)} className="ts-btn ts-btn-ghost">
                                        <i className="fas fa-arrow-left text-[10px]"></i>Quay lại
                                    </button>
                                    <button onClick={placeOrder} disabled={submittingOrder} className="ts-btn ts-btn-primary px-6">
                                        {submittingOrder ? <><i className="fas fa-spinner fa-spin"></i>Đang xử lý...</> : <>Đặt hàng<i className="fas fa-arrow-right text-[10px]"></i></>}
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
