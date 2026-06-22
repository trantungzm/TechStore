import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderApi } from '../../services/api';
import { formatCurrency, isStoreViewOnlyUser, setPageMeta, STORE_VIEW_ONLY_MESSAGE, t, toast } from '../../utils/store';
import { useMyOrders } from '../../hooks/useMyOrders';
import { getSeenOrderStatuses, markOrdersSeen, isOrderUnseen } from '../../utils/orderUpdates';
import PageHero from '../../components/store/PageHero';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const statusStyles = {
    Completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    Cancelled: 'border-red-500/40 bg-red-500/10 text-red-300',
    Shipped: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    Shipping: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    Processing: 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
    Confirmed: 'border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
    Pending: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

const getStatusStyle = (status = '') => {
    if (status.includes('Cancel')) return statusStyles.Cancelled;
    return statusStyles[status] || statusStyles.Pending;
};

const ORDER_STATUS_LABELS = {
    Pending: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Processing: 'Đang xử lý',
    ReadyForPickup: 'Sẵn sàng nhận hàng',
    Shipping: 'Đang giao hàng',
    Shipped: 'Đã gửi hàng',
    Delivered: 'Đã giao hàng',
    Completed: 'Hoàn thành',
    CancelRequested: 'Yêu cầu hủy',
    Cancelled: 'Đã hủy',
    CancelRejected: 'Từ chối hủy',
    Failed: 'Thất bại',
    Returned: 'Đã trả hàng',
};
const orderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || status || 'Chờ xác nhận';

const PAYMENT_STATUS_LABELS = {
    Unpaid: 'Chưa thanh toán',
    Paid: 'Đã thanh toán',
    Refunded: 'Đã hoàn tiền',
    Failed: 'Thanh toán thất bại',
    Cancelled: 'Đã hủy thanh toán',
};
const paymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] || status || 'Chưa thanh toán';

// Icon + màu theo trạng thái để dễ nhận biết nhanh trong danh sách.
const STATUS_ICONS = {
    Pending: { icon: 'fa-clock', color: 'text-amber-500' },
    Confirmed: { icon: 'fa-circle-check', color: 'text-[var(--color-gold)]' },
    Processing: { icon: 'fa-box-open', color: 'text-[var(--color-accent)]' },
    ReadyForPickup: { icon: 'fa-store', color: 'text-amber-600' },
    Shipping: { icon: 'fa-truck', color: 'text-sky-500' },
    Shipped: { icon: 'fa-truck-fast', color: 'text-sky-500' },
    Delivered: { icon: 'fa-box', color: 'text-sky-600' },
    Completed: { icon: 'fa-circle-check', color: 'text-emerald-500' },
    CancelRequested: { icon: 'fa-hourglass-half', color: 'text-amber-500' },
    Cancelled: { icon: 'fa-circle-xmark', color: 'text-red-500' },
    CancelRejected: { icon: 'fa-ban', color: 'text-red-500' },
    Returned: { icon: 'fa-rotate-left', color: 'text-red-500' },
    Failed: { icon: 'fa-triangle-exclamation', color: 'text-red-500' },
};
const getStatusIcon = (status) => STATUS_ICONS[status] || STATUS_ICONS.Pending;
// "Đã cập nhật" = shop đã xử lý nhưng chưa kết thúc -> nhấn mạnh (nhấp nháy).
const ATTENTION_STATUSES = new Set(['Confirmed', 'Processing', 'ReadyForPickup', 'Shipping', 'Shipped', 'Delivered', 'CancelRequested']);
const isAttentionStatus = (status) => ATTENTION_STATUSES.has(status);

const getCancellation = (order = {}) => order.cancellation || order.Cancellation || null;

const hasRejectedCancellation = (order = {}) => {
    const cancellation = getCancellation(order);
    const cancellationStatus = String(cancellation?.status || cancellation?.Status || '').toLowerCase();
    if (cancellationStatus === 'rejected') return true;
    return Boolean(
        (order.cancelReviewedAt || order.CancelReviewedAt) &&
        !String(order.status || order.Status || '').toLowerCase().includes('cancel') &&
        (order.cancelReviewNote || order.CancelReviewNote || order.cancelReason || order.CancelReason)
    );
};

const cancelReviewNote = (order = {}) => (
    order.cancelReviewNote ||
    order.CancelReviewNote ||
    getCancellation(order)?.adminNote ||
    getCancellation(order)?.AdminNote ||
    ''
);

const TIMELINE_TITLE_LABELS = {
    'Don hang duoc tao': 'Đơn hàng được tạo',
    'Don hang da duoc xac nhan': 'Đơn hàng đã được xác nhận',
    'Don hang dang duoc chuan bi': 'Đơn hàng đang được chuẩn bị',
    'Hang san sang nhan tai cua hang': 'Hàng sẵn sàng nhận tại cửa hàng',
    'Don hang dang duoc giao': 'Đơn hàng đang được giao',
    'Don hang da hoan tat': 'Đơn hàng đã hoàn tất',
    'Khach hang yeu cau huy don': 'Khách yêu cầu hủy đơn',
    'Yeu cau huy don da duoc chap nhan': 'Yêu cầu hủy đơn đã được chấp nhận',
    'Yeu cau huy don bi tu choi': 'Yêu cầu hủy bị từ chối',
    'Don hang tiep tuc xu ly': 'Đơn hàng tiếp tục xử lý',
};

const timelineTitleLabel = (item = {}) => (
    TIMELINE_TITLE_LABELS[item.title] || item.title || orderStatusLabel(item.status)
);

const OrderTimeline = ({ timeline = [], status, shippingMethod }) => {
    const isPickup = String(shippingMethod || '').toLowerCase().includes('pickup');
    const steps = isPickup
        ? ['Pending', 'Confirmed', 'ReadyForPickup', 'Completed']
        : ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Completed'];
    const isCancelled = status?.includes('Cancel');
    const stepLabel = (step) => orderStatusLabel(step);

    if (isCancelled) {
        return (
            <div className="my-4 inline-flex items-center gap-2 rounded-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                <i className="fas fa-times-circle"></i>{orderStatusLabel(status)}
            </div>
        );
    }

    const currentIdx = (() => {
        for (let i = steps.length - 1; i >= 0; i--) {
            if (timeline?.some((tl) => tl.status === steps[i]) || status === steps[i]) return i;
        }
        return 0;
    })();

    return (
        <div className="my-5 flex items-center gap-1">
            {steps.map((step, idx) => {
                const done = idx <= currentIdx;
                return (
                    <React.Fragment key={step}>
                        <div className="flex min-w-[64px] flex-col items-center">
                            <div className={cn(
                                "mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border text-[10px]",
                                done
                                    ? "border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white"
                                    : "border-[var(--color-border)] text-[var(--color-fg-dim)]"
                            )}>
                                <i className={`fas ${idx < currentIdx ? 'fa-check' : 'fa-circle text-[6px]'}`}></i>
                            </div>
                            <small className={cn("text-center text-[10px]", done ? "text-[var(--color-fg)] font-medium" : "text-[var(--color-fg-dim)]")}>
                                {stepLabel(step)}
                            </small>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={cn("mb-5 h-px flex-1", done && idx < currentIdx ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)]" : "bg-[var(--color-border)]")} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const ORDERS_PER_PAGE = 8;
const statusFilterOrder = ['Pending', 'Confirmed', 'Processing', 'ReadyForPickup', 'Shipping', 'Completed', 'cancelled'];

const normalizeStatusFilter = (status) => {
    const value = String(status || '');
    if (value.toLowerCase().includes('cancel')) return 'cancelled';
    if (value === 'Shipped' || value === 'Delivered') return 'Shipping';
    return value;
};

const normalizeOrderDetailResponse = (payload) => {
    if (payload?.order) {
        return {
            order: { ...payload.order, timeline: payload.order.timeline || payload.order.timelines || [] },
            details: payload.details || payload.items || [],
        };
    }
    return {
        order: { ...payload, timeline: payload?.timeline || payload?.timelines || payload?.Timeline || [] },
        details: payload?.items || payload?.details || payload?.Items || [],
    };
};

const paymentLabel = (method) => ({
    COD: 'COD', cod: 'COD',
    StorePayment: 'Tại cửa hàng',
    BankTransfer: 'Chuyển khoản', bank: 'Chuyển khoản',
    Momo: 'MoMo', ShopeePay: 'ShopeePay', ApplePay: 'Apple Pay',
    paypal: 'PayPal', check: 'Séc',
}[method] || method || 'Không xác định');

const Orders = () => {
    const { user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const { orders, loading, error, setError, reload } = useMyOrders();
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    // Ảnh chụp trạng thái "đã xem" tại thời điểm mở trang -> để đánh dấu đơn nào vừa đổi trạng thái lần này.
    const seenSnapshotRef = useRef(getSeenOrderStatuses());

    useEffect(() => {
        setPageMeta({ title: `${t('Order History')} | TechStore`, description: 'Xem và quản lý đơn hàng của bạn.' });
    }, []);

    useEffect(() => { setPage(1); }, [statusFilter]);

    // Sau khi tải đơn xong, lưu trạng thái hiện tại là "đã xem" (xoá chấm cho lần sau + cập nhật chấm ở ô user).
    useEffect(() => {
        if (orders.length > 0) markOrdersSeen(orders);
    }, [orders]);

    const handleViewDetails = async (orderId) => {
        setDetailLoading(true);
        setSelectedOrder(null);
        try {
            const response = await orderApi.getById(orderId);
            if (!response.data) throw new Error('empty');
            setSelectedOrder(normalizeOrderDetailResponse(response.data));
        } catch {
            const basicOrder = orders.find((o) => o.id === orderId);
            if (basicOrder) setSelectedOrder({ order: basicOrder, details: [] });
            else toast('Không thể tải chi tiết đơn hàng.', 'danger');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (isViewOnly) return toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
        if (!cancelReason.trim()) return toast(t('Cancel reason is required'), 'danger');
        setCancelling(true);
        try {
            await orderApi.cancel(selectedOrder.order.id, { reason: cancelReason });
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedOrder(null);
            await reload();
            toast('Gửi yêu cầu hủy đơn thành công!', 'success');
        } catch (e) {
            toast(e.response?.data?.message || 'Không thể gửi yêu cầu hủy.', 'danger');
        } finally {
            setCancelling(false);
        }
    };

    const filteredOrders = statusFilter
        ? orders.filter((o) => {
            return normalizeStatusFilter(o.status).toLowerCase() === statusFilter.toLowerCase();
        })
        : orders;

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1;
    const pagedOrders = filteredOrders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

    const statusOptions = useMemo(() => {
        const existing = new Set(orders
            .map((order) => String(order.status || ''))
            .filter(Boolean)
            .map(normalizeStatusFilter)
            .filter((status) => statusFilterOrder.includes(status)));
        const known = statusFilterOrder.filter((status) => existing.has(status));

        return [
            { value: '', label: 'Tất cả' },
            ...known.map((status) => ({
                value: status,
                label: status === 'cancelled' ? 'Đã hủy' : orderStatusLabel(status),
            })),
        ];
    }, [orders]);

    return (
        <>
            <PageHero title={t('Order History')} current={t('Order History')} kicker="Đơn của tôi" />

            <section className="ts-container py-12">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="ts-eyebrow text-[var(--color-accent)]">Tài khoản</p>
                        <h2 className="ts-display mt-2 text-3xl">Đơn hàng của tôi</h2>
                        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{loading ? 'Đang tải...' : `${orders.length} đơn hàng`}</p>
                    </div>
                    <Link to="/shop" className="ts-btn ts-btn-outline text-xs">
                        <i className="fas fa-shopping-bag"></i>Tiếp tục mua sắm
                    </Link>
                </div>

                <div className="mb-6 flex flex-wrap gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                    {statusOptions.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setStatusFilter(opt.value)}
                            className={cn(
                                "rounded-sm px-3 py-1.5 text-xs font-medium transition-all",
                                statusFilter === opt.value
                                    ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] text-white"
                                    : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                            )}
                        >
                            {opt.label}
                            {opt.value === '' && orders.length > 0 && (
                                <span className="ts-mono ml-1.5 text-[10px] opacity-70">{orders.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-16">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                        <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                        <button onClick={reload} className="ml-auto ts-btn ts-btn-outline px-3 py-1 text-xs">Thử lại</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center rounded-md border border-dashed border-[var(--color-border)] py-20 text-center">
                        <i className="fas fa-shopping-bag text-4xl text-[var(--color-fg-dim)]"></i>
                        <h4 className="ts-display mt-6 text-xl">Bạn chưa có đơn hàng nào</h4>
                        <Link to="/shop" className="ts-btn ts-btn-primary mt-6">Bắt đầu mua sắm</Link>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <p className="rounded-md border border-dashed border-[var(--color-border)] p-12 text-center text-sm text-[var(--color-fg-dim)]">
                        Không có đơn hàng nào với trạng thái này.
                    </p>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                            <div className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-5 py-3 md:grid md:grid-cols-[1fr_140px_160px_140px_100px] md:gap-4">
                                <p className="ts-eyebrow text-[10px]">Mã đơn</p>
                                <p className="ts-eyebrow text-[10px]">Ngày đặt</p>
                                <p className="ts-eyebrow text-[10px]">Trạng thái</p>
                                <p className="ts-eyebrow text-[10px]">Tổng</p>
                                <p className="ts-eyebrow text-[10px] text-right">Thao tác</p>
                            </div>
                            <ul className="divide-y divide-[var(--color-border)]">
                                {pagedOrders.map((order) => (
                                    <li key={order.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_140px_160px_140px_100px] md:items-center md:gap-4">
                                        <div>
                                            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
                                                <span className="relative inline-flex">
                                                    <i className={cn('fas', getStatusIcon(order.status).icon, getStatusIcon(order.status).color, isAttentionStatus(order.status) && 'ts-anim-pulse')} title={orderStatusLabel(order.status)}></i>
                                                    {isAttentionStatus(order.status) && (
                                                        <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    )}
                                                </span>
                                                <span className="ts-mono">#{order.orderCode || order.id}</span>
                                                {isOrderUnseen(order, seenSnapshotRef.current) && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600" title="Trạng thái vừa được cập nhật">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ts-anim-pulse" />
                                                        Cập nhật mới
                                                    </span>
                                                )}
                                            </p>
                                            {String(order.shippingMethod || '').toLowerCase().includes('pickup') &&
                                                String(order.status || '').toLowerCase() === 'readyforpickup' &&
                                                (order.pickupVerificationPin || order.PickupVerificationPin) && (
                                                    <p className="mt-1 inline-flex items-center gap-1 rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300">
                                                        <i className="fas fa-key text-[10px]"></i>
                                                        Mã nhận hàng: <span className="ts-mono">{order.pickupVerificationPin || order.PickupVerificationPin}</span>
                                                    </p>
                                                )}
                                            {hasRejectedCancellation(order) && (
                                                <p className="mt-1 inline-flex items-center gap-1 rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300">
                                                    <i className="fas fa-ban text-[10px]"></i>
                                                    Yêu cầu hủy bị từ chối
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-[var(--color-fg-muted)]">{new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                                        <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", getStatusStyle(order.status))}>
                                            {orderStatusLabel(order.status)}
                                        </span>
                                        <p className="ts-mono text-sm font-semibold text-[var(--color-accent)]">{formatCurrency(order.totalAmount)}</p>
                                        <button onClick={() => handleViewDetails(order.id)} className="ts-btn ts-btn-outline justify-self-end px-3 py-1.5 text-xs">
                                            <i className="fas fa-eye text-[10px]"></i>Chi tiết
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-1">
                                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--color-border)] text-xs hover:border-[var(--color-primary)] disabled:opacity-40">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            "h-9 min-w-9 rounded-sm border px-2 text-xs",
                                            p === page ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10" : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                                        )}
                                    >{p}</button>
                                ))}
                                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--color-border)] text-xs hover:border-[var(--color-primary)] disabled:opacity-40">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Detail loading overlay */}
            {detailLoading && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                </div>
            )}

            {/* Detail Modal */}
            {selectedOrder && !showCancelModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                            <h5 className="ts-display text-lg"><i className="fas fa-receipt mr-2 text-[var(--color-accent)]"></i>Đơn #{selectedOrder.order.id}</h5>
                            <button onClick={() => setSelectedOrder(null)} aria-label="Đóng" className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            <OrderTimeline timeline={selectedOrder.order.timeline} status={selectedOrder.order.status} shippingMethod={selectedOrder.order.shippingMethod} />

                            {Array.isArray(selectedOrder.order.timeline) && selectedOrder.order.timeline.length > 0 && (
                                <div className="mb-5 rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                                    <p className="ts-eyebrow mb-3 text-[10px] text-[var(--color-accent)]">
                                        <i className="fas fa-list-check mr-1"></i>Nhật ký đơn hàng
                                    </p>
                                    <div className="space-y-3">
                                        {selectedOrder.order.timeline.map((item) => (
                                            <div key={item.id || `${item.status}-${item.createdAt}`} className="flex gap-3 text-xs">
                                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                                                <div>
                                                    <p className="font-semibold text-[var(--color-fg)]">{timelineTitleLabel(item)}</p>
                                                    {item.note && <p className="mt-0.5 text-[var(--color-fg-muted)]">Lý do: {item.note}</p>}
                                                    {item.createdAt && <p className="mt-0.5 text-[10px] text-[var(--color-fg-dim)]">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                                    {(() => {
                                        const isPickup = String(selectedOrder.order.shippingMethod || '').toLowerCase().includes('pickup');
                                        const title = isPickup ? 'Nhận tại cửa hàng' : 'Giao hàng';
                                        const icon = isPickup ? 'fa-store' : 'fa-map-marker-alt';
                                        const location = isPickup
                                            ? (selectedOrder.order.storePickupLocation || selectedOrder.order.shippingAddress || '—')
                                            : (selectedOrder.order.shippingAddress || '—');
                                        const startAt = selectedOrder.order.pickupSlotStartAt || selectedOrder.order.PickupSlotStartAt || selectedOrder.order.expectedPickupTime || selectedOrder.order.ExpectedPickupTime || null;
                                        const endAt = selectedOrder.order.pickupSlotEndAt || selectedOrder.order.PickupSlotEndAt || null;
                                        const pickupTime = isPickup && startAt
                                            ? `${new Date(startAt).toLocaleDateString('vi-VN')} ${new Date(startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${endAt ? ` - ${new Date(endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}`
                                            : null;
                                        const pin = selectedOrder.order.pickupVerificationPin || selectedOrder.order.PickupVerificationPin || null;
                                        const showPin = isPickup && String(selectedOrder.order.status || '').toLowerCase() === 'readyforpickup' && pin;
                                        return (
                                            <>
                                                <p className="ts-eyebrow mb-2 flex items-center gap-2 text-[10px] text-[var(--color-accent)]">
                                                    <i className={`fas ${icon}`}></i>
                                                    <span>{title}</span>
                                                    {isPickup && <span className="ml-auto inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">Tại cửa hàng</span>}
                                                </p>
                                                <p className="text-sm font-medium text-[var(--color-fg)]">{selectedOrder.order.customerName || '—'}</p>
                                                <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{location}</p>
                                                {pickupTime && <p className="mt-1 text-xs text-[var(--color-fg-muted)]"><i className="far fa-clock mr-1"></i>{pickupTime}</p>}
                                                {showPin && (
                                                    <p className="mt-2 text-xs font-semibold text-amber-300">
                                                        Mã nhận hàng: <span className="ts-mono">{pin}</span>
                                                    </p>
                                                )}
                                            </>
                                        );
                                    })()}
                                    {selectedOrder.order.customerPhone && <p className="mt-1 text-xs text-[var(--color-fg-muted)]"><i className="fas fa-phone mr-1"></i>{selectedOrder.order.customerPhone}</p>}
                                    <p className="mt-1 text-xs text-[var(--color-fg-muted)]"><i className="fas fa-credit-card mr-1"></i>{paymentLabel(selectedOrder.order.paymentMethod)}</p>
                                    {selectedOrder.order.notes && <p className="mt-2 text-xs italic text-[var(--color-fg-dim)]">"{selectedOrder.order.notes}"</p>}
                                </div>
                                <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                                    <p className="ts-eyebrow mb-2 text-[10px] text-[var(--color-accent)]"><i className="fas fa-info-circle mr-1"></i>Tình trạng</p>
                                    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", getStatusStyle(selectedOrder.order.status))}>
                                        {orderStatusLabel(selectedOrder.order.status)}
                                    </span>
                                    <p className="mt-3 text-xs text-[var(--color-fg-muted)]">Đặt: {new Date(selectedOrder.order.orderDate).toLocaleString('vi-VN')}</p>
                                    {selectedOrder.order.paymentStatus && (
                                        <p className="mt-1 text-xs">Thanh toán: <span className={cn("font-semibold", selectedOrder.order.paymentStatus === 'Paid' && "text-emerald-400", selectedOrder.order.paymentStatus === 'Refunded' && "text-sky-400", selectedOrder.order.paymentStatus === 'Unpaid' && "text-amber-400")}>{paymentStatusLabel(selectedOrder.order.paymentStatus)}</span></p>
                                    )}
                                    {hasRejectedCancellation(selectedOrder.order) && (
                                        <div className="mt-3 rounded-sm border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                                            <p className="font-semibold"><i className="fas fa-ban mr-1"></i>Yêu cầu hủy bị từ chối</p>
                                            <p className="mt-1">Đơn tiếp tục xử lý sau khi yêu cầu hủy bị từ chối.</p>
                                            {cancelReviewNote(selectedOrder.order) && (
                                                <p className="mt-1">Lý do: {cancelReviewNote(selectedOrder.order)}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedOrder.details.length > 0 ? (
                                <div className="mt-6 ts-table-container">
                                    <table className="ts-table">
                                        <thead>
                                            <tr>
                                                <th className="ts-table-col-wide">Sản phẩm</th>
                                                <th className="ts-table-col-narrow text-center">SL</th>
                                                <th className="ts-table-col-medium text-right">Đơn giá</th>
                                                <th className="ts-table-col-medium text-right">Tổng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.details.map((d) => (
                                                <tr key={d.id}>
                                                    <td>
                                                        <p className="font-medium text-[var(--color-fg)]">{d.product?.name || d.productName || `#${d.productId}`}</p>
                                                        {d.product?.category?.name && <p className="ts-eyebrow text-[10px]">{d.product.category.name}</p>}
                                                        {(d.serialOrImei || d.SerialOrImei) && (
                                                            <p className="mt-1 text-[11px] text-[var(--color-fg-muted)]">
                                                                Serial/IMEI: <span className="ts-mono">{d.serialOrImei || d.SerialOrImei}</span>
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="ts-mono text-center text-[var(--color-fg-muted)]">×{d.quantity}</td>
                                                    <td className="ts-mono text-right text-[var(--color-fg-muted)]">{formatCurrency(d.unitPrice)}</td>
                                                    <td className="ts-mono text-right font-semibold text-[var(--color-fg)]">{formatCurrency(d.totalPrice ?? d.unitPrice * d.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-[var(--color-surface-2)]">
                                            <tr>
                                                <th colSpan="3" className="text-right text-xs uppercase tracking-wider text-[var(--color-fg-dim)]">Tổng cộng</th>
                                                <th className="ts-mono text-right text-base text-[var(--color-accent)]">{formatCurrency(selectedOrder.order.totalAmount)}</th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <p className="mt-6 rounded-sm border border-dashed border-[var(--color-border)] p-6 text-center text-xs text-[var(--color-fg-dim)]">Không tải được chi tiết sản phẩm.</p>
                            )}

                            {(() => {
                                const coupons = Array.isArray(selectedOrder.order.coupons)
                                    ? selectedOrder.order.coupons
                                    : Array.isArray(selectedOrder.order.Coupons)
                                        ? selectedOrder.order.Coupons
                                        : [];
                                if (!coupons.length) {
                                    return (
                                        <div className="mt-6 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-xs text-[var(--color-fg-dim)]">
                                            Phiếu giảm giá: Không áp dụng
                                        </div>
                                    );
                                }

                                return (
                                    <div className="mt-6 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                        <p className="ts-eyebrow mb-3 text-[10px] text-[var(--color-accent)]"><i className="fas fa-ticket-alt mr-1"></i>Phiếu giảm giá đã áp dụng</p>
                                        <div className="space-y-2">
                                            {coupons.map((c) => {
                                                const code = c.couponCode || c.CouponCode || c.code || c.Code || '—';
                                                const name = c.couponName || c.CouponName || c.name || c.Name || '';
                                                const type = c.couponType || c.CouponType || c.type || c.Type || '';
                                                const discountAmount = Number(c.discountAmount ?? c.DiscountAmount ?? 0);
                                                const label = String(type || '').toLowerCase().includes('ship') ? 'Vận chuyển' : 'Sản phẩm';
                                                return (
                                                    <div key={`${code}-${label}`} className="flex items-center justify-between gap-3 rounded-sm border border-dashed border-[var(--color-border)] p-3">
                                                        <div className="min-w-0">
                                                            <p className="ts-mono text-xs font-semibold text-[var(--color-fg)]">{code}</p>
                                                            <p className="mt-0.5 truncate text-[11px] text-[var(--color-fg-dim)]">{name || label}</p>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] text-[var(--color-fg-muted)]">{label}</span>
                                                            <p className="mt-1 ts-mono text-sm font-semibold text-[var(--color-accent)]">-{formatCurrency(discountAmount)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {selectedOrder.order.status.includes('Cancel') && selectedOrder.order.cancelReason && (
                                <div className="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                                    <strong><i className="fas fa-ban mr-1"></i>Lý do hủy:</strong> {selectedOrder.order.cancelReason}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-6 py-4">
                            {['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(selectedOrder.order.status) && (
                                <button onClick={() => setShowCancelModal(true)} className="ts-btn ts-btn-outline text-xs">
                                    <i className="fas fa-times text-[10px]"></i>Yêu cầu hủy
                                </button>
                            )}
                            <button onClick={() => setSelectedOrder(null)} className="ts-btn ts-btn-ghost text-xs">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}>
                    <div className="w-full max-w-md overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <h5 className="ts-display text-lg text-[var(--color-danger)]"><i className="fas fa-exclamation-triangle mr-2"></i>Xác nhận hủy</h5>
                            <button onClick={() => setShowCancelModal(false)} className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-5">
                            <p className="text-sm">Bạn đang yêu cầu hủy đơn <strong className="ts-mono text-[var(--color-accent)]">#{selectedOrder?.order?.id}</strong>.</p>
                            <div className="my-4 rounded-sm border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                                <i className="fas fa-info-circle mr-1"></i>
                                Nếu đơn chưa giao, yêu cầu sẽ được xử lý trong 5 phút. Nếu đã thanh toán, sẽ hoàn tiền trong 24h.
                            </div>
                            <label>
                                <span className="ts-eyebrow mb-1.5 block text-[10px]">Lý do hủy *</span>
                                <textarea
                                    rows="3"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Đổi ý, muốn mua sản phẩm khác..."
                                    className="ts-input resize-none"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">
                            <button onClick={() => setShowCancelModal(false)} className="ts-btn ts-btn-ghost text-xs">Quay lại</button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling || !cancelReason.trim()}
                                className="ts-btn ts-btn-primary text-xs"
                                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                            >
                                {cancelling ? <><i className="fas fa-spinner fa-spin"></i>Đang gửi...</> : <><i className="fas fa-paper-plane"></i>Gửi yêu cầu</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Orders;
