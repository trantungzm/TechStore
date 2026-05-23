import React from 'react';
import { formatCurrency } from '../../utils/store';
import { getCouponClaimStatus } from '../../utils/couponUtils';

const getScopeLabel = (coupon) => (coupon.couponType === 'shipping' ? 'Vận chuyển' : 'Sản phẩm');

const getShortCondition = (coupon, claimStatus) => {
    if (claimStatus?.missingAmount > 0) return `Còn thiếu ${formatCurrency(claimStatus.missingAmount)}`;
    if (claimStatus?.missingQuantity > 0) return `Cần thêm ${claimStatus.missingQuantity} sản phẩm`;
    if (Number(coupon.minOrder || 0) > 0) return `Đơn từ ${formatCurrency(coupon.minOrder)}`;
    if (coupon.unlockCondition?.type === 'flash_time') return `Mở ${coupon.unlockCondition.startHour}h-${coupon.unlockCondition.endHour}h`;
    return 'Không yêu cầu điều kiện';
};

const getDiscountText = (coupon) => {
    if (coupon.discountType === 'freeship') return 'Miễn phí vận chuyển';
    if (coupon.discountType === 'fixed') return `Giảm ${formatCurrency(coupon.value || 0)}`;
    if (coupon.discountType === 'percent') return `Giảm ${coupon.value}%`;
    return coupon.title;
};

const getStatusText = (status, claimStatus) => {
    if (status === 'available') return 'Có thể nhận';
    if (status === 'claimed') return 'Đã nhận';
    if (status === 'expired') return 'Hết hạn';
    if (status === 'out_of_stock') return 'Hết lượt';
    if (status === 'locked') return 'Chưa đủ điều kiện';
    return claimStatus?.message || 'Chưa đủ điều kiện';
};

const CouponCard = ({ coupon, status, claimed, onClaim, onCopy, compact = false, context = {} }) => {
    const claimStatus = getCouponClaimStatus(coupon, context);
    const currentStatus = claimed ? 'claimed' : (status || claimStatus.status);
    const isClaimed = currentStatus === 'claimed';
    const canClaim = currentStatus === 'available';
    const disabled = ['expired', 'out_of_stock'].includes(currentStatus);
    const statusText = getStatusText(currentStatus, claimStatus);

    return (
        <div className={`coupon-card coupon-card-compact-v2 ${compact ? 'is-compact' : ''} ${disabled ? 'is-disabled' : ''}`}>
            <div className="coupon-code-box">
                <strong>{coupon.code}</strong>
                <span>{getScopeLabel(coupon)}</span>
            </div>

            <div className="coupon-content">
                <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="min-w-0">
                        <h5 className="coupon-title">{getDiscountText(coupon)}</h5>
                        <p className="coupon-desc">{coupon.description || getShortCondition(coupon, claimStatus)}</p>
                    </div>
                    <span className={`coupon-status-pill status-${currentStatus}`}>{statusText}</span>
                </div>

                <div className="coupon-meta-row">
                    <span>{getShortCondition(coupon, claimStatus)}</span>
                    <span>HSD: {coupon.expiresAt ? coupon.expiresAt.split('-').reverse().join('/') : 'Không giới hạn'}</span>
                </div>

                <div className="coupon-actions">
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill ${isClaimed ? 'btn-outline-primary' : canClaim ? 'btn-primary' : 'btn-outline-secondary'}`}
                        disabled={!canClaim}
                        onClick={() => onClaim?.(coupon)}
                    >
                        {isClaimed ? 'Đã nhận' : canClaim ? 'Nhận phiếu' : disabled ? statusText : 'Chưa đủ điều kiện'}
                    </button>
                    {isClaimed ? (
                        <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => onCopy?.(coupon)}>
                            Sao chép
                        </button>
                    ) : (
                        <span className="coupon-condition-link">Xem điều kiện</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CouponCard;
