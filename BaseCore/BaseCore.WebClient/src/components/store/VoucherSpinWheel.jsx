import React, { useMemo, useState } from 'react';
import { claimCoupon, isCouponClaimed } from '../../utils/couponUtils';

const SPIN_STORAGE_KEY = 'voucherSpinDate';

const todayKey = () => new Date().toISOString().slice(0, 10);

const pickWeightedReward = (rewards) => {
    const totalWeight = rewards.reduce((sum, reward) => sum + Number(reward.spinWeight || 0), 0);
    let cursor = Math.random() * totalWeight;
    for (const reward of rewards) {
        cursor -= Number(reward.spinWeight || 0);
        if (cursor <= 0) return reward;
    }
    return rewards[rewards.length - 1];
};

const VoucherSpinWheel = ({ rewards, onReward }) => {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [spinDate, setSpinDate] = useState(localStorage.getItem(SPIN_STORAGE_KEY) || '');

    const canSpin = spinDate !== todayKey();
    const spinRewards = useMemo(() => rewards.filter((reward) => Number(reward.spinWeight || 0) > 0), [rewards]);

    const handleSpin = () => {
        if (!canSpin || spinning || spinRewards.length === 0) return;
        setSpinning(true);
        setResult(null);
        setTimeout(() => {
            const reward = pickWeightedReward(spinRewards);
            localStorage.setItem(SPIN_STORAGE_KEY, todayKey());
            setSpinDate(todayKey());
            setResult(reward);
            setSpinning(false);

            if (reward.rewardType !== 'empty' && reward.id && !isCouponClaimed(reward.id)) {
                claimCoupon(reward.id);
            }
            onReward?.(reward);
        }, 1200);
    };

    return (
        <section className="voucher-spin-compact mb-3">
            <div>
                <h3>Quay thưởng nhận voucher</h3>
                <p>Mỗi ngày 1 lượt quay. Lượt quay còn lại: <strong>{canSpin ? 1 : 0}</strong></p>
                {result && (
                    <div className={`voucher-spin-result ${result.rewardType === 'empty' ? 'is-empty' : ''}`}>
                        {result.rewardType === 'empty' ? 'Chúc bạn may mắn lần sau' : `Bạn nhận được phiếu ${result.code}`}
                    </div>
                )}
            </div>

            <div className="voucher-spin-rewards">
                {spinRewards.slice(0, 6).map((reward) => (
                    <span className={result?.id === reward.id ? 'is-winner' : ''} key={reward.id}>
                        {reward.code || 'May mắn lần sau'}
                    </span>
                ))}
            </div>

            <button type="button" className="btn btn-primary rounded-pill btn-sm px-4" disabled={!canSpin || spinning} onClick={handleSpin}>
                {spinning ? 'Đang quay...' : canSpin ? 'Quay ngay' : 'Hôm nay đã quay'}
            </button>
        </section>
    );
};

export default VoucherSpinWheel;
