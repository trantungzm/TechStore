import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CouponCard from '../../components/store/CouponCard';
import VoucherSpinWheel from '../../components/store/VoucherSpinWheel';
import { useCart } from '../../contexts/CartContext';
import coupons from '../../data/coupons';
import { canClaimCoupon, claimCoupon, getClaimedCoupons, getCouponClaimStatus, isCouponClaimed } from '../../utils/couponUtils';
import { fadeInUp, motionTransition, motionViewport, staggerContainer } from '../../utils/motionVariants';
import { setPageMeta } from '../../utils/store';

const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'product', label: 'Phiếu sản phẩm' },
    { id: 'shipping', label: 'Phiếu vận chuyển' },
    { id: 'available', label: 'Có thể nhận' },
    { id: 'claimed', label: 'Đã nhận' },
    { id: 'locked', label: 'Chưa đủ điều kiện' },
];

const Promotion = () => {
    const { items, totalAmount } = useCart();
    const [activeFilter, setActiveFilter] = useState('all');
    const [claimedIds, setClaimedIds] = useState([]);
    const [message, setMessage] = useState('');

    const claimableCoupons = useMemo(() => coupons.filter((coupon) => coupon.code), []);
    const spinRewards = useMemo(() => coupons.filter((coupon) => coupon.spinWeight > 0), []);
    const context = useMemo(() => ({ currentHour: new Date().getHours(), subtotal: totalAmount, cartItems: items }), [items, totalAmount]);
    const claimedCoupons = useMemo(() => claimableCoupons.filter((coupon) => claimedIds.includes(coupon.id)), [claimableCoupons, claimedIds]);
    const availableCount = useMemo(
        () => claimableCoupons.filter((coupon) => getCouponClaimStatus(coupon, context).status === 'available').length,
        [claimableCoupons, context]
    );

    useEffect(() => {
        setPageMeta({
            title: 'Phiếu giảm giá | Electro',
            description: 'Nhận phiếu mua hàng và phiếu vận chuyển để tiết kiệm hơn khi thanh toán.',
        });
        setClaimedIds(getClaimedCoupons());
    }, []);

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(''), 2500);
    };

    const handleClaim = (coupon) => {
        if (!canClaimCoupon(coupon, context)) {
            showMessage(getCouponClaimStatus(coupon, context).message || 'Chưa đủ điều kiện');
            return;
        }
        const result = claimCoupon(coupon.id);
        setClaimedIds(getClaimedCoupons());
        showMessage(result.success ? 'Đã lưu phiếu vào ví' : result.message);
    };

    const handleCopy = async (coupon) => {
        if (!isCouponClaimed(coupon.id)) {
            showMessage('Bạn cần nhận phiếu trước khi sử dụng');
            return;
        }
        await navigator.clipboard?.writeText(coupon.code);
        showMessage('Đã sao chép');
    };

    const handleSpinReward = (reward) => {
        setClaimedIds(getClaimedCoupons());
        showMessage(reward.rewardType === 'empty' ? 'Chúc bạn may mắn lần sau' : `Đã lưu phiếu ${reward.code} vào ví`);
    };

    const getCouponStatus = (coupon) => (
        claimedIds.includes(coupon.id) ? 'claimed' : getCouponClaimStatus(coupon, context).status
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

    return (
        <div className="container-fluid promotion-page py-4">
            <div className="container py-3">
                <motion.header
                    className="promotion-compact-header mb-3"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={motionTransition}
                >
                    <div>
                        <h1>Phiếu giảm giá</h1>
                        <p>Nhận phiếu mua hàng và phiếu vận chuyển để tiết kiệm hơn khi thanh toán.</p>
                    </div>
                    <div className="promotion-stats">
                        <span>Phiếu đã nhận: <strong>{claimedCoupons.length}</strong></span>
                        <span>Phiếu có thể nhận: <strong>{availableCount}</strong></span>
                    </div>
                </motion.header>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            className="alert alert-primary py-2 mb-3"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="promotion-wallet-bar mb-3"
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={motionViewport}
                    transition={{ ...motionTransition, delay: 0.06 }}
                >
                    <span>Ví của tôi: <strong>{claimedCoupons.length}</strong> phiếu đã nhận</span>
                    <button type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setActiveFilter('claimed')}>
                        Xem phiếu đã nhận
                    </button>
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={motionViewport}
                    transition={{ ...motionTransition, delay: 0.1 }}
                >
                    <VoucherSpinWheel rewards={spinRewards} onReward={handleSpinReward} />
                </motion.div>

                <motion.section
                    className="promotion-list-section"
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={motionViewport}
                    transition={{ ...motionTransition, delay: 0.12 }}
                >
                    <div className="promotion-filter-tabs mb-3">
                        {filters.map((filter) => (
                            <button
                                type="button"
                                key={filter.id}
                                className={activeFilter === filter.id ? 'is-active' : ''}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <motion.div
                        key={activeFilter}
                        className="promotion-coupon-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={motionViewport}
                    >
                        {filteredCoupons.map((coupon) => {
                            const status = getCouponStatus(coupon);
                            return (
                                <motion.div
                                    key={coupon.id}
                                    variants={fadeInUp}
                                    transition={{ ...motionTransition, duration: 0.85 }}
                                >
                                    <CouponCard
                                        coupon={coupon}
                                        status={status}
                                        claimed={status === 'claimed'}
                                        onClaim={handleClaim}
                                        onCopy={handleCopy}
                                        context={context}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.section>
            </div>
        </div>
    );
};

export default Promotion;
