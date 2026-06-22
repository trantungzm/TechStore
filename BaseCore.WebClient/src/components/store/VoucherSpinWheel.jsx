import React, { useMemo, useRef, useState } from 'react';
import { couponApi } from '../../services/api';
import { cn } from '../../utils/cn';

const getCurrentUserKey = () => {
    try {
        const raw = localStorage.getItem('user');
        const parsed = raw ? JSON.parse(raw) : null;
        return String(parsed?.userId || parsed?.UserId || parsed?.id || parsed?.Id || 'anon');
    } catch {
        return 'anon';
    }
};

const getSpinStorageKey = () => `voucher_spin_next_at:${getCurrentUserKey()}`;

const readNextSpinAt = () => {
    try {
        const raw = localStorage.getItem(getSpinStorageKey());
        if (!raw) return null;
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
};

const writeNextSpinAt = (value) => {
    try {
        if (!value) { localStorage.removeItem(getSpinStorageKey()); return; }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return;
        localStorage.setItem(getSpinStorageKey(), date.toISOString());
    } catch {
    }
};

// Bảng màu các ô (xen kẽ) — ô "may mắn lần sau" dùng màu xám riêng.
const SLICE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const EMPTY_COLOR = '#94a3b8';

const CX = 160, CY = 160, R = 150;
const ptXY = (angleDeg, radius) => {
    const rad = (angleDeg * Math.PI) / 180;
    return [CX + radius * Math.sin(rad), CY - radius * Math.cos(rad)];
};
const sliceLabel = (reward) => {
    if (reward.__empty) return 'Lần sau';
    return (reward.code || 'VOUCHER').slice(0, 10);
};

const VoucherSpinWheel = ({ rewards, onReward }) => {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [rotation, setRotation] = useState(0);
    const pendingRef = useRef(null);
    const [canSpin, setCanSpin] = useState(() => {
        const nextSpinAt = readNextSpinAt();
        if (!nextSpinAt) return true;
        return Date.now() >= nextSpinAt.getTime();
    });

    // Các ô trên vòng quay: phần thưởng có spinWeight > 0, thêm 1 ô "may mắn lần sau".
    const segments = useMemo(() => {
        const spinRewards = (rewards || []).filter((r) => Number(r.spinWeight || 0) > 0).slice(0, 7);
        return [...spinRewards, { id: '__empty', __empty: true, code: '' }];
    }, [rewards]);

    const N = segments.length;
    const seg = 360 / N;

    const findSegmentIndex = (rewardType, id) => {
        if (rewardType === 'coupon' && id != null) {
            const i = segments.findIndex((s) => !s.__empty && String(s.id) === String(id));
            if (i >= 0) return i;
        }
        const empty = segments.findIndex((s) => s.__empty);
        return empty >= 0 ? empty : 0;
    };

    const handleSpin = async () => {
        if (!canSpin || spinning || N < 2) return;
        setSpinning(true);
        setResult(null);
        try {
            const response = await couponApi.spin();
            const spinResult = response.data;
            const nextSpinAt = spinResult?.nextSpinAt || spinResult?.NextSpinAt || null;
            if (nextSpinAt) writeNextSpinAt(nextSpinAt);

            const rewardType = spinResult.resultType === 'NoReward' ? 'empty' : 'coupon';
            const code = spinResult.coupon?.coupon?.code || '';
            const id = spinResult.coupon?.couponId != null ? String(spinResult.coupon.couponId) : null;
            const payload = { rewardType, code, id, message: spinResult.message || '' };
            pendingRef.current = payload;

            // Tính góc dừng: tâm ô trúng phải về vị trí kim (đỉnh, 12h).
            const k = findSegmentIndex(rewardType, id);
            const center = k * seg + seg / 2;
            const want = ((360 - center) % 360 + 360) % 360;
            const jitter = (Math.random() - 0.5) * seg * 0.55;
            setRotation((prev) => {
                const cur = ((prev % 360) + 360) % 360;
                let delta = want - cur;
                if (delta <= 0) delta += 360;
                return prev + 360 * 5 + delta + jitter; // quay 5 vòng + dừng đúng ô
            });
        } catch (error) {
            setSpinning(false);
            const message = error.response?.data?.message || 'Không thể quay thưởng';
            setResult({ rewardType: 'error', code: '', id: null, errorMessage: message });
            onReward?.({ rewardType: 'error', code: '', id: null, errorMessage: message });
        }
    };

    const handleTransitionEnd = () => {
        const payload = pendingRef.current;
        if (!payload) return;
        pendingRef.current = null;
        setSpinning(false);
        setCanSpin(false);
        setResult(payload);
        onReward?.({ rewardType: payload.rewardType, code: payload.code, id: payload.id });
    };

    return (
        <section className="rounded-md border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-6">
            <div className="grid items-center gap-6 md:grid-cols-[320px_1fr]">
                {/* Vòng quay */}
                <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
                    {/* Kim chỉ (đỉnh) */}
                    <div
                        className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2"
                        style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid var(--color-accent, #ef4444)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.3))' }}
                    />
                    <svg
                        width="320" height="320" viewBox="0 0 320 320"
                        onTransitionEnd={handleTransitionEnd}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: spinning ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.18, 0.99)' : 'none',
                            borderRadius: '50%',
                            boxShadow: '0 6px 20px rgba(0,0,0,.18)',
                        }}
                    >
                        <circle cx={CX} cy={CY} r={R + 6} fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
                        {segments.map((s, i) => {
                            const a0 = i * seg, a1 = (i + 1) * seg, mid = a0 + seg / 2;
                            const [x0, y0] = ptXY(a0, R);
                            const [x1, y1] = ptXY(a1, R);
                            const large = seg > 180 ? 1 : 0;
                            const fill = s.__empty ? EMPTY_COLOR : SLICE_COLORS[i % SLICE_COLORS.length];
                            const [lx, ly] = ptXY(mid, R * 0.62);
                            const flip = mid > 90 && mid < 270;
                            return (
                                <g key={s.id}>
                                    <path d={`M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`} fill={fill} stroke="#fff" strokeWidth="2" />
                                    <text
                                        x={lx} y={ly}
                                        fill="#fff" fontSize="13" fontWeight="700" textAnchor="middle" dominantBaseline="middle"
                                        transform={`rotate(${mid + (flip ? 180 : 0)}, ${lx}, ${ly})`}
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {sliceLabel(s)}
                                    </text>
                                </g>
                            );
                        })}
                        <circle cx={CX} cy={CY} r="34" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
                    </svg>
                    {/* Nút quay ở tâm */}
                    <button
                        type="button"
                        disabled={!canSpin || spinning || N < 2}
                        onClick={handleSpin}
                        className="absolute left-1/2 top-1/2 z-10 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-accent,#ef4444)] text-xs font-bold uppercase text-white shadow-md transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {spinning ? <i className="fas fa-spinner fa-spin"></i> : 'QUAY'}
                    </button>
                </div>

                {/* Thông tin & kết quả */}
                <div>
                    <p className="ts-eyebrow text-[var(--color-accent)]">Vòng quay may mắn</p>
                    <h3 className="ts-display mt-2 text-xl text-[var(--color-fg)]">Quay thưởng nhận voucher</h3>
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                        Mỗi ngày 1 lượt quay · Còn lại:{' '}
                        <span className="ts-mono font-bold text-[var(--color-accent)]">{canSpin ? 1 : 0}</span>
                    </p>

                    {N < 2 && (
                        <p className="mt-4 text-sm text-[var(--color-fg-dim)]">Hiện chưa có phần thưởng cho vòng quay.</p>
                    )}

                    {result && (
                        <div
                            className={cn(
                                'mt-4 rounded-md border p-3 text-sm',
                                result.rewardType === 'empty'
                                    ? 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg-muted)]'
                                    : result.rewardType === 'error'
                                        ? 'border-red-400/40 bg-red-50 text-red-600'
                                        : 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-fg)]'
                            )}
                        >
                            {result.rewardType === 'error'
                                ? result.errorMessage
                                : result.message
                                    ? result.message
                                    : result.rewardType === 'empty'
                                        ? 'Chúc bạn may mắn lần sau!'
                                        : <>🎉 Bạn nhận được phiếu <strong className="ts-mono">{result.code}</strong></>}
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                        {segments.filter((s) => !s.__empty).map((reward) => (
                            <span
                                key={reward.id}
                                className={cn(
                                    'ts-mono rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-wider transition-all',
                                    result?.id === reward.id
                                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)] shadow-[0_0_0_2px_var(--color-accent-soft)]'
                                        : 'border-[var(--color-border)] text-[var(--color-fg-dim)]'
                                )}
                            >
                                {reward.code || 'Lucky'}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VoucherSpinWheel;
