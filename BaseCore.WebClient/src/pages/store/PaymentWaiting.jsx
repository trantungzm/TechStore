import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paymentApi } from '../../services/api';
import { getCartItemKey, useCart } from '../../contexts/CartContext';
import PageHero from '../../components/store/PageHero';
import { formatCurrency, parseServerDateTime, t } from '../../utils/store';
import { cn } from '../../utils/cn';

const CHECKOUT_SELECTION_KEY = 'store_checkout_selected_items';
const CHECKOUT_COUPON_KEY = 'store_checkout_applied_coupons';

const PaymentWaiting = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentExpired, setPaymentExpired] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(null);
    const [qrLoadFailed, setQrLoadFailed] = useState(false);
    const { removeItem, clearCart } = useCart();
    const cartClearedRef = useRef(false);

    // Chỉ xóa giỏ SAU KHI thanh toán thành công (đơn đã được tạo & xác nhận).
    // Xóa đúng các món đã chọn ở checkout; nếu không có thông tin chọn -> xóa toàn giỏ.
    const clearPurchasedCart = () => {
        if (cartClearedRef.current) return;
        cartClearedRef.current = true;
        try {
            const selected = JSON.parse(sessionStorage.getItem(CHECKOUT_SELECTION_KEY) || 'null');
            if (Array.isArray(selected) && selected.length) {
                selected.forEach((i) => removeItem(i.cartItemKey || getCartItemKey(i)));
            } else {
                clearCart();
            }
        } catch {
            clearCart();
        }
        sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
        sessionStorage.removeItem(CHECKOUT_COUPON_KEY);
    };

    // Load session data
    useEffect(() => {
        const loadSession = async () => {
            try {
                const res = await paymentApi.getDetail(sessionId);
                setSessionData(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load session:', error);
                setLoading(false);
            }
        };

        loadSession();
    }, [sessionId]);

    // Polling thanh toán mỗi 3 giây
    useEffect(() => {
        if (!sessionData || orderSuccess || paymentExpired) return;

        let active = true;
        const poll = async () => {
            try {
                const res = await paymentApi.getStatus(sessionId);
                if (!active) return;
                const status = res.data?.status;
                if (status === 'Paid') {
                    clearPurchasedCart(); // chỉ xóa giỏ khi đã thanh toán thành công
                    setSessionData((current) => ({ ...(current || {}), ...(res.data || {}) }));
                    setOrderSuccess(res.data || sessionData);
                } else if (status === 'Expired') {
                    setPaymentExpired(true);
                }
            } catch {
                /* bỏ qua lỗi tạm thời */
            }
        };

        poll();
        const timer = setInterval(poll, 3000);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [sessionData, sessionId, orderSuccess, paymentExpired]);

    // Đếm ngược hết hạn
    useEffect(() => {
        if (!sessionData?.expiresAt || orderSuccess) {
            setSecondsLeft(null);
            return;
        }

        const expiry = parseServerDateTime(sessionData.expiresAt);
        if (Number.isNaN(expiry)) {
            setSecondsLeft(null);
            return undefined;
        }
        const tick = () => {
            const left = Math.max(0, Math.round((expiry - Date.now()) / 1000));
            setSecondsLeft(left);
            if (left <= 0) setPaymentExpired(true);
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [sessionData, orderSuccess]);

    const formatCountdown = (s) => {
        if (s == null) return '15:00';
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <>
                <PageHero title="Đang tải..." current="Đang tải..." kicker="Thanh toán" />
                <section className="ts-container py-12 flex items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                </section>
            </>
        );
    }

    if (orderSuccess) {
        return (
            <>
                <PageHero title="Thanh toán thành công" current="Thanh toán thành công" kicker="Cảm ơn" />
                <section className="ts-container py-12">
                    <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-8 text-center md:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10">
                            <i className="fas fa-check text-2xl text-emerald-600"></i>
                        </div>
                        <h2 className="ts-display mt-6 text-3xl">Thanh toán thành công</h2>
                        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Đơn hàng của bạn đã được xác nhận.</p>

                        <div className="mt-8 space-y-2 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-left text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-fg-dim)]">Phiên thanh toán</span>
                                <strong className="ts-mono text-[var(--color-accent)]">{sessionId}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-fg-dim)]">Số tiền</span>
                                <strong className="ts-mono text-[var(--color-fg)]">{formatCurrency(sessionData?.amount || 0)}</strong>
                            </div>
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

    if (paymentExpired) {
        return (
            <>
                <PageHero title="Phiên hết hạn" current="Phiên hết hạn" kicker="Thanh toán QR" />
                <section className="ts-container py-12">
                    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                            <i className="fas fa-clock text-2xl text-amber-600"></i>
                        </div>
                        <h2 className="ts-display mt-6 text-2xl">Phiên thanh toán đã hết hạn</h2>
                        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Phiên <strong>{sessionId}</strong> không còn hiệu lực. Vui lòng quay lại giỏ hàng và tạo đơn mới.</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Link to="/cart" className="ts-btn ts-btn-primary">Quay lại giỏ hàng</Link>
                            <Link to="/shop" className="ts-btn ts-btn-outline">Tiếp tục mua sắm</Link>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (!sessionData) {
        return (
            <>
                <PageHero title="Không tìm thấy phiên" current="Không tìm thấy phiên" kicker="Thanh toán" />
                <section className="ts-container py-12 text-center">
                    <p className="text-sm text-[var(--color-fg-muted)]">Phiên thanh toán không tồn tại.</p>
                    <Link to="/cart" className="ts-btn ts-btn-primary mt-6">Quay lại giỏ hàng</Link>
                </section>
            </>
        );
    }

    return (
        <>
            <PageHero title="Chờ thanh toán" current="Chờ thanh toán" kicker="Thanh toán QR" />
            <section className="ts-container py-12">
                <div className="mx-auto max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
                    <p className="ts-eyebrow text-[var(--color-accent)]">Đang chờ thanh toán…</p>
                    <h2 className="ts-display mt-2 text-2xl">Quét mã QR để thanh toán</h2>
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                        Phiên <strong>{sessionId}</strong> · <span className="ts-mono text-[var(--color-accent)]">{formatCurrency(sessionData?.amount || 0)}</span>
                    </p>

                    <div className="mx-auto mt-6 w-56 rounded-xl border border-[var(--color-border)] bg-white p-3">
                        {sessionData.qrUrl && !qrLoadFailed ? (
                            <img
                                src={sessionData.qrUrl}
                                alt={`QR thanh toán ${sessionData.bankName || ''}`.trim()}
                                className="aspect-square w-full object-contain"
                                onError={() => setQrLoadFailed(true)}
                            />
                        ) : (
                            <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded bg-gray-100 px-3 text-gray-400">
                                <i className="fas fa-qrcode text-4xl"></i>
                                <span className="text-xs">Không tải được mã QR</span>
                            </div>
                        )}
                        {sessionData.bankName && (
                            <p className="mt-2 text-xs text-[var(--color-fg-dim)]">
                                {sessionData.bankName} · <span className="ts-mono">{sessionData.accountNumber}</span>
                            </p>
                        )}
                    </div>

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

                    <p className="mt-3 text-xs text-[var(--color-fg-dim)]">Mã phiên: <span className="ts-mono">{sessionId}</span>. Màn hình tự cập nhật khi nhận được thanh toán.</p>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link to="/cart" className="ts-btn ts-btn-outline">Quay lại giỏ hàng</Link>
                        <Link to="/shop" className="ts-btn ts-btn-outline">Tiếp tục mua sắm</Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PaymentWaiting;
