import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { couponApi } from '../../services/api';
import { isStoreViewOnlyUser, STORE_VIEW_ONLY_MESSAGE } from '../../utils/store';
import { cn } from '../../utils/cn';

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
    const { user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [canSpin, setCanSpin] = useState(true);
    const spinRewards = useMemo(() => rewards.filter((reward) => Number(reward.spinWeight || 0) > 0), [rewards]);

    const handleSpin = async () => {
        if (isViewOnly) {
            const result = { rewardType: 'error', code: '', id: null, errorMessage: STORE_VIEW_ONLY_MESSAGE };
            setResult(result);
            onReward?.(result);
            return;
        }
        if (!canSpin || spinning || spinRewards.length === 0) return;
        setSpinning(true);
        setResult(null);
        try {
            const response = await couponApi.spin();
            const spinResult = response.data;
            setCanSpin(false);
            const rewardType = spinResult.resultType === 'NoReward' ? 'empty' : 'coupon';
            const code = spinResult.coupon?.coupon?.code || '';
            const id = spinResult.coupon?.couponId != null ? String(spinResult.coupon.couponId) : null;
            setResult({
                rewardType,
                code,
                id,
                message: spinResult.message || ''
            });
            setSpinning(false);
            onReward?.({
                rewardType,
                code,
                id
            });
        } catch (error) {
            setSpinning(false);
            const message = error.response?.data?.message || 'Không thể quay thưởng';
            setResult({ rewardType: 'error', code: '', id: null, errorMessage: message });
            onReward?.({ rewardType: 'error', code: '', id: null, errorMessage: message });
        }
    };

    return (
        <section className="rounded-md border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="ts-eyebrow text-[var(--color-accent)]">Vòng quay may mắn</p>
                    <h3 className="ts-display mt-2 text-xl text-[var(--color-fg)]">Quay thưởng nhận voucher</h3>
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                        Mỗi ngày 1 lượt quay · Còn lại: <span className="ts-mono font-bold text-[var(--color-accent)]">{canSpin ? 1 : 0}</span>
                    </p>
                </div>
                <button
                    type="button"
                    disabled={!canSpin || spinning}
                    onClick={handleSpin}
                    className={cn(
                        "ts-btn ts-btn-primary px-6",
                        spinning && "ts-anim-pulse"
                    )}
                >
                    {spinning ? (
                        <><i className="fas fa-spinner fa-spin"></i>Đang quay...</>
                    ) : canSpin ? 'Quay ngay' : 'Hôm nay đã quay'}
                </button>
            </div>

            {result && (
                <div
                    className={cn(
                        "mt-4 rounded-md border p-3 text-sm",
                        result.rewardType === 'empty'
                            ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg-muted)]"
                            : "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-fg)]"
                    )}
                >
                    {result.rewardType === 'error'
                        ? result.errorMessage
                        : result.message
                            ? result.message
                            : result.rewardType === 'empty'
                                ? 'Chúc bạn may mắn lần sau!'
                                : <>Bạn nhận được phiếu <strong className="ts-mono">{result.code}</strong></>}
                </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
                {spinRewards.slice(0, 6).map((reward) => (
                    <span
                        key={reward.id}
                        className={cn(
                            "ts-mono rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-wider transition-all",
                            result?.id === reward.id
                                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)] shadow-[0_0_0_2px_var(--color-accent-soft)]"
                                : "border-[var(--color-border)] text-[var(--color-fg-dim)]"
                        )}
                    >
                        {reward.code || 'Lucky'}
                    </span>
                ))}
            </div>
        </section>
    );
};

export default VoucherSpinWheel;
