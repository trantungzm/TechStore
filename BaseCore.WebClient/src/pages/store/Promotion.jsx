import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CouponCard from '../../components/store/CouponCard';
import VoucherSpinWheel from '../../components/store/VoucherSpinWheel';
import PageHero from '../../components/store/PageHero';
import { useCart } from '../../contexts/CartContext';
import { usePublicCoupons } from '../../hooks/usePublicCoupons';
import { canClaimCoupon, getCouponClaimStatus, isCouponClaimed } from '../../utils/couponUtils';
import { couponApi } from '../../services/api';
import { formatCurrency, setPageMeta } from '../../utils/store';
import { cn } from '../../utils/cn';

const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'product', label: 'Sản phẩm' },
    { id: 'shipping', label: 'Vận chuyển' },
    { id: 'available', label: 'Có thể nhận' },
    { id: 'claimed', label: 'Đã nhận' },
    { id: 'locked', label: 'Chưa đủ điều kiện' },
];

const Promotion = () => {
    const { items, totalAmount } = useCart();
    const [activeFilter, setActiveFilter] = useState('all');
    const [claimedIds, setClaimedIds] = useState([]);
    const [message, setMessage] = useState('');
    const [claimingIds, setClaimingIds] = useState([]);
    const [conditionOpen, setConditionOpen] = useState(false);
    const [conditionCoupon, setConditionCoupon] = useState(null);
    const { coupons, loading: couponsLoading } = usePublicCoupons();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const isProductCoupon = (coupon) => Array.isArray(coupon?.productIds) && coupon.productIds.length > 0;
    const isSpinCoupon = (coupon) => Boolean(coupon?.isSpinReward || coupon?.spinEnabled || Number(coupon?.spinWeight || 0) > 0);
    const promotionCoupons = useMemo(() => coupons.filter((coupon) => coupon.code && !isProductCoupon(coupon)), [coupons]);

    const claimableCoupons = useMemo(
        () => promotionCoupons.filter((coupon) => !isSpinCoupon(coupon)),
        [promotionCoupons]
    );
    const spinRewards = useMemo(
        () => promotionCoupons.filter((coupon) => isSpinCoupon(coupon)),
        [promotionCoupons]
    );

    const context = useMemo(() => ({
        currentHour: new Date().getHours(),
        subtotal: totalAmount,
        cartItems: items
    }), [items, totalAmount]);

    const claimedCoupons = useMemo(
        () => promotionCoupons.filter((coupon) => isCouponClaimed(coupon.id, claimedIds)),
        [promotionCoupons, claimedIds]
    );

    const availableCount = useMemo(
        () => claimableCoupons.filter((c) => getCouponClaimStatus(c, context, claimedIds).status === 'available').length,
        [claimableCoupons, context, claimedIds]
    );

    useEffect(() => {
        setPageMeta({
            title: 'Phiếu giảm giá | TechStore',
            description: 'Nhận phiếu mua hàng và phiếu vận chuyển để tiết kiệm hơn khi thanh toán.',
        });

        const loadClaimedCoupons = async () => {
            try {
                const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
                const ids = myCoupons.data?.items?.map((c) => String(c.couponId)) || [];
                setClaimedIds(ids);
            } catch (error) {
                console.error('Failed to load claimed coupons:', error);
                setClaimedIds([]);
            }
        };
        loadClaimedCoupons();
    }, []);

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(''), 2500);
    };

    const handleClaim = async (coupon) => {
        if (claimingIds.includes(coupon.id)) return;

        // Tối ưu: Lấy giờ thực tế ngay tại thời điểm click chuột thay vì dùng context cũ
        const currentContext = { ...context, currentHour: new Date().getHours() };

        if (!canClaimCoupon(coupon, currentContext, claimedIds)) {
            showMessage(getCouponClaimStatus(coupon, currentContext, claimedIds).message || 'Chưa đủ điều kiện');
            return;
        }

        setClaimingIds((c) => [...c, coupon.id]);
        try {
            await couponApi.claim(coupon.apiId || coupon.id);
            const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
            const newClaimedIds = myCoupons.data?.items?.map((c) => String(c.couponId)) || [];
            setClaimedIds(newClaimedIds);
            showMessage('Đã lưu phiếu vào ví');
        } catch (error) {
            const msg = error.response?.data?.message || '';
            if (error.response?.status === 400 && /nhan|đã nhận|da nhan/i.test(msg)) {
                try {
                    const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
                    const newClaimedIds = myCoupons.data?.items?.map((c) => String(c.couponId)) || [];
                    setClaimedIds(newClaimedIds);
                } catch (e) {
                    console.error('Failed to refresh claimed coupons after duplicate claim', e);
                }
                showMessage('Bạn đã nhận phiếu này');
            } else {
                showMessage(msg || 'Không thể nhận phiếu');
            }
        } finally {
            setClaimingIds((c) => c.filter((id) => id !== coupon.id));
        }
    };

    const handleCopy = async (coupon) => {
        if (!isCouponClaimed(coupon.id, claimedIds)) {
            showMessage('Bạn cần nhận phiếu trước khi sử dụng');
            return;
        }
        await navigator.clipboard?.writeText(coupon.code);
        showMessage('Đã sao chép');
    };

    const handleSpinReward = async (reward) => {
        try {
            const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
            const ids = myCoupons.data?.items?.map((c) => String(c.couponId)) || [];
            setClaimedIds(ids);
        } catch (error) {
            console.error('Failed to refresh claimed coupons:', error);
        }
        if (reward.rewardType === 'error') {
            showMessage(reward.errorMessage || 'Quay thưởng thất bại');
            return;
        }
        showMessage(reward.rewardType === 'empty' ? 'Chúc bạn may mắn lần sau' : `Đã lưu phiếu ${reward.code} vào ví`);
    };

    const openCondition = (coupon) => {
        setConditionCoupon(coupon);
        setConditionOpen(true);
    };

    const closeCondition = () => {
        setConditionOpen(false);
        setConditionCoupon(null);
    };

    const getCouponStatus = (coupon) => (
        claimedIds.includes(String(coupon.id)) ? 'claimed' : getCouponClaimStatus(coupon, context, claimedIds).status
    );

    const filteredCoupons = claimableCoupons.filter((coupon) => {
        const status = getCouponStatus(coupon);
        if (activeFilter === 'all') return true;
        if (activeFilter === 'shipping') return coupon.couponType === 'shipping';
        if (activeFilter === 'product') return coupon.couponType === 'product';
        if (activeFilter === 'available') return status === 'available';
        if (activeFilter === 'locked') return status === 'locked';
        if (activeFilter === 'claimed') return status === 'claimed';
        return true;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
    const currentCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginationGroup = useMemo(() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
        if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }, [currentPage, totalPages]);

    return (
        <>
            <PageHero title="Phiếu giảm giá" current="Promotion" kicker="Vouchers" />

            <section className="ts-container py-12">
                <div className="mb-6 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-fg-muted)]">
                    Mã gắn riêng cho sản phẩm chỉ hiển thị ở đúng trang chi tiết sản phẩm. Trang này chỉ hiển thị phiếu khuyến mãi chung và phiếu quay thưởng.
                </div>

                {/* Dashboard thống kê số lượng ví */}
                <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-3">
                    <div className="flex items-center gap-3 bg-[var(--color-surface)] p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                            <i className="fas fa-wallet"></i>
                        </div>
                        <div>
                            <p className="ts-eyebrow text-[10px]">Ví của tôi</p>
                            <p className="ts-mono mt-1 text-lg font-semibold">{claimedCoupons.length} <span className="text-xs text-[var(--color-fg-dim)]">phiếu</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[var(--color-surface)] p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                            <i className="fas fa-gift"></i>
                        </div>
                        <div>
                            <p className="ts-eyebrow text-[10px]">Có thể nhận</p>
                            <p className="ts-mono mt-1 text-lg font-semibold">{availableCount}</p>
                        </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-3 bg-[var(--color-surface)] p-5 md:col-span-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                            <i className="fas fa-tags"></i>
                        </div>
                        <div>
                            <p className="ts-eyebrow text-[10px]">Tổng phiếu</p>
                            <p className="ts-mono mt-1 text-lg font-semibold">{promotionCoupons.length}</p>
                        </div>
                    </div>
                </div>

                {/* Toast Message thông báo nhanh */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mb-6 rounded-md border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-2 text-sm text-[var(--color-fg)]"
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Vòng quay may mắn */}
                <div className="mb-10">
                    <VoucherSpinWheel rewards={spinRewards} onReward={handleSpinReward} />
                </div>

                {/* Bộ lọc filter */}
                <div className="mb-6 flex flex-wrap gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                "rounded-sm px-3 py-1.5 text-xs font-medium transition-all",
                                activeFilter === filter.id
                                    ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] text-white"
                                    : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Grid danh sách Coupon hiển thị */}
                <motion.div
                    key={activeFilter}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                    {/* SỬA LỖI: Sửa chữ lỗi font tiếng Việt khi đang tải dữ liệu */}
                    {couponsLoading ? (
                        <p className="col-span-full rounded-md border border-dashed border-[var(--color-border)] p-12 text-center text-sm text-[var(--color-fg-dim)]">
                            Đang tải phiếu từ SQL Server...
                        </p>
                    ) : filteredCoupons.length === 0 ? (
                        <p className="col-span-full ts-panel border-dashed p-12 text-center text-sm text-[var(--color-fg-dim)]">
                            Không có phiếu phù hợp.
                        </p>
                    ) : (
                        currentCoupons.map((coupon) => {
                            const status = getCouponStatus(coupon);
                            return (
                                <CouponCard
                                    key={coupon.id}
                                    coupon={coupon}
                                    status={status}
                                    claimed={status === 'claimed'}
                                    onClaim={handleClaim}
                                    onCopy={handleCopy}
                                    onViewCondition={openCondition}
                                    context={context}
                                    claimedIds={claimedIds}
                                    processing={claimingIds.includes(coupon.id)}
                                />
                            );
                        })
                    )}
                </motion.div>

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                            disabled={currentPage === 1}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50"
                        >
                            <i className="fas fa-chevron-left text-xs"></i>
                        </button>
                        {paginationGroup.map((page, index) => {
                            if (page === '...') {
                                return (
                                    <span key={`ellipsis-${index}`} className="flex h-10 w-4 items-end justify-center pb-2 text-[var(--color-fg-muted)]">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors text-sm font-medium",
                                        currentPage === page
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md"
                                            : "border-[var(--color-border)] bg-white text-[var(--color-fg)] hover:border-[var(--color-primary)]"
                                    )}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                            disabled={currentPage === totalPages}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50"
                        >
                            <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                )}
            </section>

            <AnimatePresence>
                {conditionOpen && conditionCoupon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) closeCondition();
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-lg rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
                        >
                            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] p-5">
                                <div className="min-w-0">
                                    <p className="ts-eyebrow text-[var(--color-accent)]">Điều kiện áp dụng</p>
                                    <h3 className="mt-1 text-base font-semibold text-[var(--color-fg)]">
                                        {conditionCoupon.title || conditionCoupon.code}
                                    </h3>
                                    <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                                        Mã: <span className="ts-mono font-semibold">{conditionCoupon.code}</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeCondition}
                                    className="ts-btn ts-btn-ghost px-3 py-1.5 text-xs"
                                >
                                    Đóng
                                </button>
                            </div>

                            <div className="space-y-3 p-5 text-sm text-[var(--color-fg)]">
                                {conditionCoupon.description ? (
                                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[13px] text-[var(--color-fg-muted)]">
                                        {conditionCoupon.description}
                                    </div>
                                ) : null}

                                <div className="grid gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[13px]">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[var(--color-fg-dim)]">Loại</span>
                                        <span className="font-medium">{conditionCoupon.couponType === 'shipping' ? 'Vận chuyển' : 'Sản phẩm'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[var(--color-fg-dim)]">Giảm</span>
                                        <span className="font-medium">
                                            {conditionCoupon.discountType === 'freeship'
                                                ? 'Miễn phí vận chuyển'
                                                : conditionCoupon.discountType === 'percent'
                                                    ? `${conditionCoupon.value || 0}%`
                                                    : formatCurrency(conditionCoupon.value || 0)}
                                        </span>
                                    </div>
                                    {Number(conditionCoupon.minOrder || 0) > 0 && (
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[var(--color-fg-dim)]">Đơn tối thiểu</span>
                                            <span className="font-medium">{formatCurrency(conditionCoupon.minOrder || 0)}</span>
                                        </div>
                                    )}
                                    {conditionCoupon.maxDiscount != null && (
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[var(--color-fg-dim)]">Giảm tối đa</span>
                                            <span className="font-medium">{formatCurrency(conditionCoupon.maxDiscount || 0)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[var(--color-fg-dim)]">Hạn dùng</span>
                                        <span className="font-medium">{conditionCoupon.expiresAt ? conditionCoupon.expiresAt.split('-').reverse().join('/') : 'Không giới hạn'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeCondition();
                                            handleClaim(conditionCoupon);
                                        }}
                                        disabled={!canClaimCoupon(conditionCoupon, context, claimedIds) || claimingIds.includes(conditionCoupon.id)}
                                        className={cn(
                                            "ts-btn ts-btn-primary px-4 py-2 text-xs",
                                            (claimedIds.includes(String(conditionCoupon.id)) || claimingIds.includes(conditionCoupon.id)) && "opacity-70"
                                        )}
                                    >
                                        Nhận phiếu
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Promotion;
