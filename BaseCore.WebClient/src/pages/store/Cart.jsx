import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getItemKey, useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { orderApi, couponApi } from '../../services/api';
import { formatCurrency, isStoreViewOnlyUser, resolveProductImage, setPageMeta, STORE_VIEW_ONLY_MESSAGE, t } from '../../utils/store';
import { usePublicCoupons } from '../../hooks/usePublicCoupons';
import {
    calculateProductCouponDiscount,
    calculateShippingCouponDiscount,
    getCartSubtotal,
    getSelectedCouponUnavailableReason,
    getSelectedUsableCouponsForCart,
    validateSelectedCouponForCart,
} from '../../utils/couponUtils';
import PageHero from '../../components/store/PageHero';
import { cn } from '../../utils/cn';

const SHIPPING_FEE = 30000;
const CHECKOUT_SELECTION_KEY = 'store_checkout_selected_items';
const CHECKOUT_COUPON_KEY = 'store_checkout_applied_coupons';

const isItemOutOfStock = (item) => item?.product?.inStock === false || Number(item?.product?.stock ?? 0) <= 0;

const Cart = () => {
    const { user } = useAuth();
    const { items, updateQuantity, removeItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isViewOnly = isStoreViewOnlyUser(user);
    const navigate = useNavigate();
    const selectionInitializedRef = useRef(false);
    const knownItemIdsRef = useRef(new Set());
    const [selectedIds, setSelectedIds] = useState([]);
    const [appliedProductCoupon, setAppliedProductCoupon] = useState(null);
    const [appliedShippingCoupon, setAppliedShippingCoupon] = useState(null);
    const [couponMessage, setCouponMessage] = useState('');
    const [couponMessageType, setCouponMessageType] = useState('info');
    const [claimedIds, setClaimedIds] = useState([]);
    const [myCoupons, setMyCoupons] = useState([]);
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

    const availableItems = useMemo(() => items.filter((i) => !isItemOutOfStock(i)), [items]);
    const selectedCartItems = useMemo(
        () => items.filter((i) => selectedIds.includes(getItemKey(i)) && !isItemOutOfStock(i)),
        [items, selectedIds]
    );
    const selectedSubtotal = useMemo(() => getCartSubtotal(selectedCartItems), [selectedCartItems]);
    const selectedCount = selectedCartItems.length;
    const allAvailableSelected = availableItems.length > 0 && availableItems.every((i) => selectedIds.includes(getItemKey(i)));

    const claimedCoupons = useMemo(
        () => coupons.filter((c) => c?.code && claimedIds.includes(c.id)),
        [claimedIds]
    );
    const cartCoupons = useMemo(
        () => getSelectedUsableCouponsForCart(selectedCartItems, coupons, selectedSubtotal, SHIPPING_FEE, claimedIds),
        [selectedCartItems, selectedSubtotal, claimedIds]
    );
    const productCouponOptions = cartCoupons.filter(({ coupon }) => coupon.couponType === 'product');
    const shippingCouponOptions = cartCoupons.filter(({ coupon }) => coupon.couponType === 'shipping');

    const appliedProductValidation = appliedProductCoupon
        ? validateSelectedCouponForCart(appliedProductCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons, claimedIds) : null;
    const appliedShippingValidation = appliedShippingCoupon
        ? validateSelectedCouponForCart(appliedShippingCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons, claimedIds) : null;

    const productDiscount = appliedProductValidation?.valid
        ? calculateProductCouponDiscount(appliedProductCoupon, selectedCartItems, selectedSubtotal) : 0;
    const shippingDiscount = appliedShippingValidation?.valid
        ? calculateShippingCouponDiscount(appliedShippingCoupon, SHIPPING_FEE) : 0;
    const finalShippingFee = selectedCount > 0 ? Math.max(0, SHIPPING_FEE - shippingDiscount) : 0;
    const finalTotal = selectedCount > 0 ? Math.max(0, selectedSubtotal - productDiscount + finalShippingFee) : 0;
    const canCheckout = selectedCount > 0 && finalTotal > 0;

    useEffect(() => {
        setPageMeta({ title: `${t('Shop Cart')} | TechStore`, description: t('Cart meta description') });

        const loadClaimedCoupons = async () => {
            try {
                const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
                const list = myCoupons.data?.items || [];
                const ids = list.map((c) => c.couponId) || [];
                setClaimedIds(ids);
                setMyCoupons(list);
            } catch (error) {
                console.error('Failed to load claimed coupons:', error);
                setClaimedIds([]);
                setMyCoupons([]);
            }
        };

        loadClaimedCoupons();
    }, []);

    useEffect(() => {
        const existingIds = new Set(items.map(getItemKey));
        const availableIds = availableItems.map(getItemKey);

        setSelectedIds((current) => {
            if (!selectionInitializedRef.current) {
                selectionInitializedRef.current = true;
                knownItemIdsRef.current = existingIds;
                return availableIds;
            }
            const next = current.filter((id) => existingIds.has(id));
            const nextSet = new Set(next);
            availableIds.forEach((id) => {
                if (!knownItemIdsRef.current.has(id)) nextSet.add(id);
            });
            return Array.from(nextSet);
        });
        knownItemIdsRef.current = existingIds;
    }, [items, availableItems]);

    useEffect(() => {
        if (appliedProductCoupon) {
            const r = validateSelectedCouponForCart(appliedProductCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons, claimedIds);
            if (!r.valid || r.coupon?.couponType !== 'product') {
                setAppliedProductCoupon(null);
                setCouponMessage('Phiếu sản phẩm không còn phù hợp.');
                setCouponMessageType('warning');
            }
        }
        if (appliedShippingCoupon) {
            const r = validateSelectedCouponForCart(appliedShippingCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons, claimedIds);
            if (!r.valid || r.coupon?.couponType !== 'shipping') {
                setAppliedShippingCoupon(null);
                setCouponMessage('Phiếu vận chuyển không còn phù hợp.');
                setCouponMessageType('warning');
            }
        }
    }, [selectedCartItems, selectedSubtotal, appliedProductCoupon, appliedShippingCoupon]);

    const showCouponMessage = (msg, type = 'info') => {
        setCouponMessage(msg);
        setCouponMessageType(type);
    };

    const toggleItemSelection = (item) => {
        if (isItemOutOfStock(item)) return;
        const id = getItemKey(item);
        setSelectedIds((c) => c.includes(id) ? c.filter((i) => i !== id) : [...c, id]);
    };

    const toggleSelectAll = () => {
        if (allAvailableSelected) return setSelectedIds([]);
        setSelectedIds(availableItems.map(getItemKey));
    };

    const handleRemoveSelected = () => {
        if (isViewOnly) {
            showCouponMessage(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        selectedCartItems.forEach((i) => removeItem(getItemKey(i)));
        setSelectedIds([]);
    };

    const handleMoveToWishlist = (item) => {
        if (isViewOnly) {
            showCouponMessage(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        if (!isInWishlist(item.product.id)) toggleWishlist(item.product);
        removeItem(getItemKey(item));
    };

    const handleApplyCoupon = (coupon) => {
        if (isViewOnly) {
            showCouponMessage(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        const r = validateSelectedCouponForCart(coupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons, claimedIds);
        if (!r.valid) {
            const u = getSelectedCouponUnavailableReason(coupon, selectedCartItems, selectedSubtotal, SHIPPING_FEE, claimedIds);
            const msg = u?.missingAmount > 0 ? `Còn thiếu ${formatCurrency(u.missingAmount)}` : u?.message || r.message || 'Không áp dụng được';
            showCouponMessage(msg, 'danger');
            return;
        }
        const userCouponId = couponIdToUserCouponId.get(Number(coupon.apiId));
        if (!userCouponId) {
            showCouponMessage('Bạn cần đăng nhập và nhận phiếu trước khi sử dụng.', 'warning');
            return;
        }
        const applied = { ...coupon, userCouponId };
        if (coupon.couponType === 'product') {
            setAppliedProductCoupon(applied);
            showCouponMessage(`Đã áp dụng phiếu sản phẩm ${coupon.code}.`, 'success');
        } else if (coupon.couponType === 'shipping') {
            setAppliedShippingCoupon(applied);
            showCouponMessage(`Đã áp dụng phiếu vận chuyển ${coupon.code}.`, 'success');
        }
    };

    const handleRemoveCoupon = (kind) => {
        if (isViewOnly) {
            showCouponMessage(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        if (kind === 'product') { setAppliedProductCoupon(null); showCouponMessage('Đã bỏ phiếu sản phẩm.', 'info'); }
        else { setAppliedShippingCoupon(null); showCouponMessage('Đã bỏ phiếu vận chuyển.', 'info'); }
    };

    const handleCheckout = () => {
        if (isViewOnly) return showCouponMessage(STORE_VIEW_ONLY_MESSAGE, 'warning');
        if (!canCheckout) return showCouponMessage('Vui lòng chọn sản phẩm.', 'warning');
        sessionStorage.setItem(CHECKOUT_SELECTION_KEY, JSON.stringify(selectedCartItems));
        sessionStorage.setItem(CHECKOUT_COUPON_KEY, JSON.stringify({
            productUserCouponId: appliedProductCoupon?.userCouponId ?? null,
            shippingUserCouponId: appliedShippingCoupon?.userCouponId ?? null,
        }));
        navigate('/checkout');
    };

    const messageStyles = {
        success: 'border-emerald-500/40 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-500/40 bg-amber-50 text-amber-700',
        danger: 'border-red-500/40 bg-red-50 text-red-700',
        info: 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg-muted)]',
    };

    const renderCouponCard = ({ coupon, valid, message, missingAmount, productDiscount: ppd, shippingDiscount: psd }) => {
        const isApplied = coupon.couponType === 'product' ? appliedProductCoupon?.id === coupon.id : appliedShippingCoupon?.id === coupon.id;
        const discountPreview = coupon.couponType === 'product' ? ppd : psd;
        const statusText = isApplied ? 'Đang áp dụng' : message;
        return (
            <div
                key={coupon.id}
                className={cn(
                    "flex flex-col gap-3 rounded-xl border p-4 transition-colors md:flex-row md:items-center",
                    isApplied ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/5" : "border-[var(--color-border)] bg-[var(--color-surface)]",
                    !valid && "opacity-60"
                )}
            >
                <div className="min-w-0 flex-1">
                    <span className="ts-mono rounded-sm bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">{coupon.code}</span>
                    <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">{coupon.title}</p>
                    <p className="text-xs text-[var(--color-fg-muted)]">{coupon.description}</p>
                    {discountPreview > 0 && valid && (
                        <p className="mt-1 text-[11px] text-emerald-600">Dự kiến giảm {formatCurrency(discountPreview)}</p>
                    )}
                    {!valid && (
                        <p className="mt-1 text-[11px] text-red-600">{missingAmount > 0 ? `Còn thiếu ${formatCurrency(missingAmount)}` : statusText}</p>
                    )}
                </div>
                <div className="shrink-0">
                    {isApplied ? (
                        <button onClick={() => handleRemoveCoupon(coupon.couponType)} className="ts-btn ts-btn-outline px-3 py-1.5 text-xs">Bỏ áp dụng</button>
                    ) : (
                        <button onClick={() => handleApplyCoupon(coupon)} disabled={!valid} className="ts-btn ts-btn-primary px-3 py-1.5 text-xs">Áp dụng</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <PageHero title={t('Shop Cart')} current={t('Shop Cart')} kicker="Giỏ hàng" />

            <section className="ts-container py-12">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center rounded-md border border-dashed border-[var(--color-border)] py-20 text-center">
                        <i className="fas fa-shopping-cart text-4xl text-[var(--color-fg-dim)]"></i>
                        <h4 className="ts-display mt-6 text-2xl">Giỏ hàng đang trống</h4>
                        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Nhanh tay chọn sản phẩm yêu thích để mua sắm ngay.</p>
                        <Link to="/shop" className="ts-btn ts-btn-primary mt-6">Tiếp tục mua sắm</Link>
                    </div>
                ) : (
                    <>
                        {/* Selection bar */}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-4">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-fg)]">
                                <input
                                    type="checkbox"
                                    checked={allAvailableSelected}
                                    onChange={toggleSelectAll}
                                    disabled={availableItems.length === 0}
                                    className="h-4 w-4 accent-[var(--color-primary)]"
                                />
                                Chọn tất cả
                            </label>
                            <span className="text-xs text-[var(--color-fg-muted)]">Đã chọn {selectedCount} sản phẩm</span>
                            <button
                                type="button"
                                disabled={selectedCount === 0}
                                onClick={handleRemoveSelected}
                                className="ts-btn ts-btn-outline px-3 py-1.5 text-xs"
                            >
                                <i className="fas fa-trash text-[10px]"></i>Xóa đã chọn
                            </button>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                            <div>
                                {/* Items */}
                                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                                    <div className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-5 py-3 md:grid md:grid-cols-[1fr_120px_140px_120px_80px] md:gap-4">
                                        <p className="ts-eyebrow text-[10px]">Sản phẩm</p>
                                        <p className="ts-eyebrow text-[10px]">Đơn giá</p>
                                        <p className="ts-eyebrow text-[10px]">Số lượng</p>
                                        <p className="ts-eyebrow text-[10px]">Thành tiền</p>
                                        <p className="ts-eyebrow text-[10px] text-right">Thao tác</p>
                                    </div>

                                    <ul className="divide-y divide-[var(--color-border)]">
                                        {items.map((item) => {
                                            const outOfStock = isItemOutOfStock(item);
                                            const itemKey = getItemKey(item);
                                            const selected = selectedIds.includes(itemKey) && !outOfStock;
                                            const stock = Number(item.product?.stock ?? 0);
                                            return (
                                                <li
                                                    key={itemKey}
                                                    className={cn(
                                                        "grid gap-4 px-5 py-5 md:grid-cols-[1fr_120px_140px_120px_80px] md:items-center",
                                                        outOfStock && "opacity-50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            disabled={outOfStock}
                                                            onChange={() => toggleItemSelection(item)}
                                                            className="h-4 w-4 accent-[var(--color-primary)]"
                                                        />
                                                        <img src={resolveProductImage(item.product)} alt={item.product.name} className="h-16 w-16 rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] object-contain p-1" />
                                                        <div className="min-w-0">
                                                            <p className="line-clamp-2 text-sm font-medium text-[var(--color-fg)]">{item.product.name}</p>
                                                            <p className="ts-eyebrow mt-0.5 text-[10px] text-[var(--color-fg-dim)]">{item.product.category?.name || `Mã: G${item.product.id}`}</p>
                                                            {outOfStock ? (
                                                                <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">Hết hàng</span>
                                                            ) : stock > 0 && stock <= 5 ? (
                                                                <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Chỉ còn {stock}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="ts-mono text-sm text-[var(--color-fg-muted)] md:text-[var(--color-fg)]">
                                                        <span className="md:hidden ts-eyebrow text-[10px] block">Đơn giá</span>
                                                        {formatCurrency(item.product.price)}
                                                    </div>
                                                    <div>
                                                        <div className="inline-flex items-center rounded-sm border border-[var(--color-border)] bg-[var(--color-background)]">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(itemKey, Math.max(1, item.quantity - 1))}
                                                                disabled={item.quantity <= 1}
                                                                aria-label="Giảm"
                                                                className="flex h-8 w-8 items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] disabled:opacity-40"
                                                            >
                                                                <i className="fas fa-minus text-[10px]"></i>
                                                            </button>
                                                            <span className="ts-mono w-8 text-center text-sm">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(itemKey, Math.min(item.quantity + 1, stock || item.quantity + 1))}
                                                                disabled={outOfStock || (stock > 0 && item.quantity >= stock)}
                                                                aria-label="Tăng"
                                                                className="flex h-8 w-8 items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] disabled:opacity-40"
                                                            >
                                                                <i className="fas fa-plus text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="ts-mono text-sm font-semibold text-[var(--color-fg)]">
                                                        <span className="md:hidden ts-eyebrow text-[10px] block">Thành tiền</span>
                                                        {formatCurrency(item.product.price * item.quantity)}
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveToWishlist(item)}
                                                            aria-label="Yêu thích"
                                                            className="flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--color-border)] text-xs text-[var(--color-fg-dim)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                                        >
                                                            <i className="far fa-heart"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(itemKey)}
                                                            aria-label="Xóa"
                                                            className="flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--color-border)] text-xs text-[var(--color-fg-dim)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <Link to="/shop" className="ts-btn ts-btn-ghost mt-6">
                                    <i className="fas fa-arrow-left text-[10px]"></i>Tiếp tục mua sắm
                                </Link>

                                {/* Coupons */}
                                {claimedCoupons.length > 0 && (
                                    <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-5">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="ts-eyebrow text-[var(--color-accent)]">Phiếu giảm giá</p>
                                                <h4 className="ts-display mt-1 text-lg">Phiếu giảm giá</h4>
                                            </div>
                                            <Link to="/promotion" className="ts-btn ts-btn-outline text-xs">Săn thêm</Link>
                                        </div>

                                        {selectedCount === 0 && (
                                            <p className="mb-3 rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                                Chọn sản phẩm để xem phiếu có thể áp dụng.
                                            </p>
                                        )}

                                        {productCouponOptions.length > 0 && (
                                            <div className="mb-4">
                                                <p className="ts-eyebrow mb-2 text-[10px]">Phiếu sản phẩm</p>
                                                <div className="space-y-2">
                                                    {productCouponOptions.map(renderCouponCard)}
                                                </div>
                                            </div>
                                        )}
                                        {shippingCouponOptions.length > 0 && (
                                            <div>
                                                <p className="ts-eyebrow mb-2 text-[10px]">Phiếu vận chuyển</p>
                                                <div className="space-y-2">
                                                    {shippingCouponOptions.map(renderCouponCard)}
                                                </div>
                                            </div>
                                        )}

                                        {couponMessage && (
                                            <div className={cn("mt-4 rounded-sm border px-3 py-2 text-xs", messageStyles[couponMessageType])}>
                                                {couponMessage}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <aside>
                                <div className="sticky top-24 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                                    <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)]/8 to-[var(--color-accent)]/8 px-6 py-5">
                                        <p className="ts-eyebrow text-[var(--color-accent)]">Tóm tắt</p>
                                        <h3 className="ts-display mt-1 text-2xl">Đơn hàng của bạn</h3>
                                    </div>
                                    <div className="space-y-3 px-6 py-5 text-sm">
                                        <div className="flex justify-between text-[var(--color-fg-muted)]">
                                            <span>Sản phẩm đã chọn</span>
                                            <span className="ts-mono">{selectedCount}</span>
                                        </div>
                                        <div className="flex justify-between text-[var(--color-fg-muted)]">
                                            <span>Tạm tính</span>
                                            <span className="ts-mono">{formatCurrency(selectedSubtotal)}</span>
                                        </div>
                                        {productDiscount > 0 && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>Giảm sản phẩm</span>
                                                <span className="ts-mono">−{formatCurrency(productDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-[var(--color-fg-muted)]">
                                            <span>Phí vận chuyển</span>
                                            <span className="ts-mono">{formatCurrency(selectedCount > 0 ? SHIPPING_FEE : 0)}</span>
                                        </div>
                                        {shippingDiscount > 0 && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>Giảm vận chuyển</span>
                                                <span className="ts-mono">−{formatCurrency(shippingDiscount)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-6 py-5">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm font-semibold text-[var(--color-fg)]">Tổng thanh toán</span>
                                            <span className="ts-mono text-2xl font-bold ts-gradient-text">{formatCurrency(finalTotal)}</span>
                                        </div>
                                    </div>
                                    <div className="px-6 pb-6">
                                        <button
                                            type="button"
                                            disabled={!canCheckout}
                                            onClick={handleCheckout}
                                            className="ts-btn ts-btn-primary w-full text-sm"
                                        >
                                            Tiến hành thanh toán
                                            <i className="fas fa-arrow-right text-xs"></i>
                                        </button>
                                        {!canCheckout && (
                                            <p className="mt-2 text-center text-[11px] text-[var(--color-fg-dim)]">Chọn ít nhất 1 sản phẩm để thanh toán</p>
                                        )}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </section>
        </>
    );
};

export default Cart;
