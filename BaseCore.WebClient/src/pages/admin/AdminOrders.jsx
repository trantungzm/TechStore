import React, { useEffect, useMemo, useState } from 'react';
import { orderApi, userApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast, confirmDialog, promptDialog } from '../../utils/notify';
import { formatCurrency } from '../../utils/store';
import { useAdminOrders } from '../../hooks/useAdminOrders';

const deliveryStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Completed', 'CancelRequested', 'CancelRejected', 'Cancelled'];
const pickupStatuses = ['Pending', 'Confirmed', 'ReadyForPickup', 'Completed', 'CancelRequested', 'CancelRejected', 'Cancelled'];
const allActiveStatuses = [...new Set([...deliveryStatuses, ...pickupStatuses])];

const statusLabels = {
    Pending: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Processing: 'Đang xử lý',
    ReadyForPickup: 'Sẵn sàng nhận hàng',
    Shipping: 'Đang giao hàng',
    Shipped: 'Đã gửi hàng',
    Delivered: 'Đã giao hàng',
    Completed: 'Hoàn thành',
    Cancelled: 'Đã hủy',
    CancelRequested: 'Yêu cầu hủy',
    'Cancel Requested': 'Yêu cầu hủy',
    'Cancelled & Refunded': 'Đã hủy & hoàn tiền',
    CancelRejected: 'Từ chối hủy',
    Failed: 'Thất bại',
    Returned: 'Đã trả hàng'
};

const paymentStatusLabels = {
    Unpaid: 'Chưa thanh toán',
    Paid: 'Đã thanh toán',
    Refunded: 'Đã hoàn tiền',
    Failed: 'Thanh toán thất bại',
    Cancelled: 'Đã hủy thanh toán'
};

const paymentStatusLabel = (status) => paymentStatusLabels[status] || status || 'Chưa thanh toán';

const statusLabel = (status) => statusLabels[status] || status || 'Chờ xác nhận';

const paymentLabel = (method) => ({
    COD: 'Thanh toán khi nhận hàng (COD)',
    cod: 'Thanh toán khi nhận hàng (COD)',
    StorePayment: 'Thanh toán tại cửa hàng',
    BankTransfer: 'Chuyển khoản ngân hàng',
    Momo: 'MoMo',
    ShopeePay: 'ShopeePay',
    ApplePay: 'Apple Pay',
}[method] || String(method || 'Không xác định'));

// Luồng chuyển đổi trạng thái chuẩn của hệ thống Admin
const deliveryNextActions = {
    Pending: [{ status: 'Confirmed', label: 'Xác nhận đơn', icon: 'fas fa-check', tone: 'blue' }],
    Confirmed: [{ status: 'Processing', label: 'Xử lý đơn', icon: 'fas fa-box-open', tone: 'amber' }],
    Processing: [{ status: 'Shipping', label: 'Giao hàng', icon: 'fas fa-truck', tone: 'blue' }],
    Shipping: [{ status: 'Completed', label: 'Hoàn tất', icon: 'fas fa-flag-checkered', tone: 'green' }],
    Shipped: [{ status: 'Completed', label: 'Hoàn tất', icon: 'fas fa-flag-checkered', tone: 'green' }],
    CancelRequested: [
        { status: 'Cancelled', label: 'Duyệt hủy đơn', icon: 'fas fa-rotate-left', tone: 'rose' },
        { status: 'CancelRejected', label: 'Từ chối hủy', icon: 'fas fa-ban', tone: 'amber' },
    ]
};

const statusClass = (status) => {
    if (status?.includes('Cancel')) return 'bg-rose-500/10 text-rose-600 ring-rose-500/20';
    if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20';
    if (status === 'ReadyForPickup') return 'bg-amber-500/10 text-amber-600 ring-amber-500/20';
    if (status === 'Shipping' || status === 'Shipped' || status === 'Delivered') return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] ring-[var(--color-accent)]/20';
    if (status === 'Confirmed' || status === 'Processing') return 'bg-amber-500/10 text-amber-600 ring-amber-500/20';
    return 'bg-[var(--color-surface-3)] text-[var(--color-fg)] ring-[var(--color-border)]';
};

const actionClass = (tone) => {
    const classes = {
        blue: 'bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] hover:opacity-90',
        amber: 'bg-amber-600 hover:bg-amber-700',
        green: 'bg-emerald-600 hover:bg-emerald-700',
        rose: 'bg-rose-600 hover:bg-rose-700',
    };
    return classes[tone] || classes.blue;
};

const AdminOrders = () => {
    const { allOrders, users, loading, error, setError, reload } = useAdminOrders();
    const [keyword, setKeyword] = useState('');
    const [customerKeyword, setCustomerKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterShippingMethod, setFilterShippingMethod] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [processingActionId, setProcessingActionId] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const { isAdmin } = useAuth();

    const isPickupOrder = (order) => String(order?.shippingMethod || order?.ShippingMethod || '').toLowerCase().includes('pickup');

    const getNextActions = (order) => {
        if (!order) return [];
        if (isPickupOrder(order)) {
            const map = {
                Pending: [{ status: 'Confirmed', label: 'Xác nhận đơn', icon: 'fas fa-check', tone: 'blue' }],
                Confirmed: [{ status: 'ReadyForPickup', label: 'Sẵn sàng nhận', icon: 'fas fa-store', tone: 'amber' }],
                ReadyForPickup: [{ status: 'Completed', label: 'Hoàn tất', icon: 'fas fa-flag-checkered', tone: 'green', requiresPin: true }],
                CancelRequested: [
                    { status: 'Cancelled', label: 'Duyệt hủy đơn', icon: 'fas fa-rotate-left', tone: 'rose' },
                    { status: 'CancelRejected', label: 'Từ chối hủy', icon: 'fas fa-ban', tone: 'amber' },
                ],
            };
            return map[order.status] || [];
        }
        return deliveryNextActions[order.status] || [];
    };

    const getUserName = (userId) => users[userId]?.name || users[userId]?.username || `Người dùng #${userId}`;

    const filteredOrders = useMemo(() => {
        let items = allOrders.slice();
        if (keyword.trim()) {
            items = items.filter((order) => String(order.id).toLowerCase().includes(keyword.trim().toLowerCase()));
        }
        if (customerKeyword.trim()) {
            const q = customerKeyword.trim().toLowerCase();
            items = items.filter((order) => getUserName(order.userId).toLowerCase().includes(q));
        }
        if (filterStatus) {
            // Gom dữ liệu lịch sử Shipped/Delivered vào trạng thái vận chuyển hiện hành.
            if (filterStatus === 'Shipping') {
                items = items.filter((order) => ['Shipping', 'Shipped', 'Delivered'].includes(order.status));
            } else {
                items = items.filter((order) => order.status === filterStatus);
            }
        }
        if (filterShippingMethod) {
            const method = String(filterShippingMethod).toLowerCase();
            items = items.filter((order) => String(order.shippingMethod || '').toLowerCase() === method);
        }
        items.sort((a, b) => {
            if (sortOrder === 'date_asc') return new Date(a.orderDate) - new Date(b.orderDate);
            if (sortOrder === 'amount_desc') return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
            if (sortOrder === 'amount_asc') return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
            return new Date(b.orderDate) - new Date(a.orderDate);
        });
        return items;
    }, [allOrders, keyword, customerKeyword, filterStatus, filterShippingMethod, sortOrder, users]);

    const availableStatuses = filterShippingMethod === 'StorePickup'
        ? pickupStatuses
        : filterShippingMethod === 'Delivery'
            ? deliveryStatuses
            : allActiveStatuses;

    const updateShippingMethodFilter = (shippingMethod) => {
        setFilterShippingMethod(shippingMethod);
        const nextStatuses = shippingMethod === 'StorePickup'
            ? pickupStatuses
            : shippingMethod === 'Delivery'
                ? deliveryStatuses
                : allActiveStatuses;
        if (filterStatus && !nextStatuses.includes(filterStatus)) setFilterStatus('');
        setPage(1);
    };

    const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
    const orders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

    // Tính toán số lượng cho từng trạng thái hiển thị trên Top Cards đám mây
    const statusCounts = useMemo(() => {
        return allOrders.reduce((acc, order) => {
            let status = order.status || 'Pending';
            if (status === 'Shipped') status = 'Shipping'; // Nhóm Shipped vào mục Vận chuyển hiển thị
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [allOrders]);

    const updateFilterStatus = (status) => {
        setFilterStatus(status);
        setPage(1);
    };

    const handleQuickAction = async (orderId, action) => {
        const status = action?.status;
        if (!status) return;
        if (!(await confirmDialog(`Xác nhận chuyển đơn hàng sang trạng thái [${statusLabel(status)}]?`))) return;
        setProcessingActionId(orderId);
        try {
            const currentOrder = allOrders.find((order) => order.id === orderId);
            const pickup = isPickupOrder(currentOrder);
            if (currentOrder?.status === 'CancelRequested' && (status === 'Cancelled' || status === 'CancelRejected')) {
                await orderApi.reviewCancellation(orderId, {
                    approved: status === 'Cancelled',
                    adminNote: status === 'Cancelled' ? 'Admin duyệt yêu cầu hủy đơn' : 'Admin từ chối yêu cầu hủy đơn',
                });
            } else {
                if (pickup && String(currentOrder?.status) === 'ReadyForPickup' && status === 'Completed') {
                    const pin = await promptDialog('Nhập mã PIN nhận hàng (khách hàng cung cấp):', '');
                    if (!pin) return;
                    await orderApi.updateStatus(orderId, { status, paymentStatus: 'Paid', pickupVerificationPin: String(pin).trim() });
                } else {
                    await orderApi.updateStatus(orderId, { status });
                }
            }
            await reload();
            if (orderDetails?.order?.id === orderId) {
                const detailRes = await orderApi.getById(orderId);
                setOrderDetails({ order: detailRes.data, details: detailRes.data?.items || detailRes.data?.details || [] });
            }
        } catch (err) {
            const data = err.response?.data;
            toast.error(data?.message || data?.detail || data?.title || 'Không thể cập nhật trạng thái đơn hàng');
        } finally {
            setProcessingActionId(null);
        }
    };

    const handleViewDetails = async (orderId) => {
        try {
            const response = await orderApi.getById(orderId);
            setOrderDetails({ order: response.data, details: response.data?.items || response.data?.details || [] });
        } catch (err) {
            toast.error('Không thể tải chi tiết đơn hàng');
        }
    };

    const canCancel = (order) => !String(order.status || '').includes('Cancel') && order.status !== 'Completed';

    return (
        <div className="px-4 py-6 lg:px-8">
            {/* Header section */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Vận hành</p>
                    <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Quản lý đơn hàng</h2>
                </div>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors" onClick={reload}>
                    <i className="fas fa-rotate"></i> Làm mới
                </button>
            </div>

            {/* Top Cards đếm trạng thái */}
            <div className="mb-5 grid gap-3 grid-cols-2 md:grid-cols-4">
                {['Pending', 'Confirmed', 'Processing', 'Shipping'].map((status) => (
                    <button
                        key={status}
                        type="button"
                        className={`rounded-xl border p-4 text-left transition-all ${filterStatus === status ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)]/20' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]'}`}
                        onClick={() => updateFilterStatus(filterStatus === status ? '' : status)}
                    >
                        <div className="text-sm font-semibold text-[var(--color-fg-muted)]">{statusLabel(status)}</div>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-fg)]">{statusCounts[status] || 0}</div>
                    </button>
                ))}
            </div>

            {/* Bộ lọc nâng cao */}
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
                <div className="border-b border-[var(--color-border)] p-4 bg-[var(--color-surface-2)]/30">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_220px_220px_220px]">
                        <input
                            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-500/20 text-[var(--color-fg)]"
                            placeholder="Tìm mã đơn hàng..."
                            value={keyword}
                            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                        />
                        <input
                            className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-500/20 text-[var(--color-fg)]"
                            placeholder="Tìm khách hàng..."
                            value={customerKeyword}
                            onChange={(e) => { setCustomerKeyword(e.target.value); setPage(1); }}
                        />
                        <select
                            className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-2 pl-3 pr-9 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-500/20 text-[var(--color-fg)]"
                            value={filterStatus}
                            onChange={(e) => updateFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            {availableStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                        </select>
                        <select
                            className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-2 pl-3 pr-9 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-500/20 text-[var(--color-fg)]"
                            value={filterShippingMethod}
                            onChange={(e) => updateShippingMethodFilter(e.target.value)}
                        >
                            <option value="">Tất cả hình thức</option>
                            <option value="Delivery">Giao hàng</option>
                            <option value="StorePickup">Nhận tại cửa hàng</option>
                        </select>
                        <select
                            className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-2 pl-3 pr-9 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-500/20 text-[var(--color-fg)]"
                            value={sortOrder}
                            onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
                        >
                            <option value="date_desc">Mới nhất trước</option>
                            <option value="date_asc">Cũ nhất trước</option>
                            <option value="amount_desc">Giá trị cao nhất</option>
                            <option value="amount_asc">Giá trị thấp nhất</option>
                        </select>
                    </div>
                </div>

                {/* Bảng dữ liệu chính */}
                <div className="p-4">
                    {error && <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}
                    {loading ? (
                        <div className="py-12 text-center text-sm font-medium text-[var(--color-fg-muted)]">
                            <i className="fas fa-spinner fa-spin mr-2"></i> Đang tải đơn hàng...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] p-12 text-center text-sm text-[var(--color-fg-muted)] bg-[var(--color-surface-2)]/20">
                            Không tìm thấy dữ liệu đơn hàng phù hợp.
                        </div>
                    ) : (
                        <div className="ts-table-container overflow-x-auto rounded-lg border border-[var(--color-border)]">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                                    <tr>
                                        <th className="px-3 py-3 w-24">Đơn hàng</th>
                                        <th className="px-3 py-3 ts-table-hide-mobile">Khách hàng</th>
                                        <th className="px-3 py-3 ts-table-hide-mobile">Ngày đặt</th>
                                        <th className="px-3 py-3">Giá trị</th>
                                        <th className="px-3 py-3">Trạng thái</th>
                                        <th className="px-3 py-3 ts-table-hide-tablet">Địa chỉ</th>
                                        <th className="px-3 py-3 text-right w-56 whitespace-nowrap">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-[var(--color-surface-2)]/40 transition-colors">
                                            <td className="px-3 py-3.5 font-bold text-[var(--color-fg)]">
                                                <div className="flex items-center gap-2">
                                                    <span>#{order.id}</span>
                                                    {isPickupOrder(order) && (
                                                        <span className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                                            Tại cửa hàng
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 ts-table-hide-mobile text-[var(--color-fg)]">{getUserName(order.userId)}</td>
                                            <td className="px-3 py-3.5 ts-table-hide-mobile text-[var(--color-fg-muted)]">{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                                            <td className="px-3 py-3.5 font-semibold text-[var(--color-fg)]">{formatCurrency(order.totalAmount)}</td>
                                            <td className="px-3 py-3.5">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${statusClass(order.status)}`}>
                                                    {statusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 ts-table-hide-tablet max-w-[200px] truncate text-[var(--color-fg-muted)]">
                                                {isPickupOrder(order)
                                                    ? `[Tại cửa hàng] - ${order.storePickupLocation || order.shippingAddress || 'Chưa có chi nhánh'}`
                                                    : (order.shippingAddress || order.deliveryAddress || 'Chưa có địa chỉ')}
                                            </td>
                                            <td className="px-3 py-3.5 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[var(--color-surface-3)] transition-colors" onClick={() => handleViewDetails(order.id)} title="Xem chi tiết">
                                                        <i className="fas fa-eye text-xs"></i>
                                                    </button>
                                                    {getNextActions(order).map((action) => (
                                                        <button
                                                            key={action.status}
                                                            type="button"
                                                            className={`inline-flex h-8 w-28 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-bold text-white shadow-sm transition-opacity ${actionClass(action.tone)}`}
                                                            onClick={() => handleQuickAction(order.id, action)}
                                                            disabled={processingActionId === order.id}
                                                        >
                                                            <i className={processingActionId === order.id ? 'fas fa-spinner fa-spin' : action.icon}></i>
                                                            <span>{action.label}</span>
                                                        </button>
                                                    ))}
                                                    {canCancel(order) && (
                                                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors" onClick={() => handleQuickAction(order.id, { status: 'Cancelled' })} disabled={processingActionId === order.id} title="Hủy đơn">
                                                            <i className="fas fa-times text-xs"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Phân trang */}
                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-3 py-3.5 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between bg-[var(--color-surface-2)]/10">
                    <span>Hiển thị {orders.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, filteredOrders.length)} trong {filteredOrders.length} đơn hàng</span>
                    <div className="flex items-center gap-2">
                        <button type="button" className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-semibold disabled:opacity-40 hover:bg-[var(--color-surface-2)] transition-colors" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button>
                        <span className="font-medium">Trang {page} / {totalPages}</span>
                        <button type="button" className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-semibold disabled:opacity-40 hover:bg-[var(--color-surface-2)] transition-colors" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sau</button>
                    </div>
                </div>
            </section>

            {/* Modal: Xem chi tiết hóa đơn (Đã sửa lỗi đóng nhầm bằng stopPropagation) */}
            {orderDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => setOrderDetails(null)}></div>
                    {/* Thêm onClick={(e) => e.stopPropagation()} để chặn nổi bọt sự kiện click */}
                    <div className="relative z-10 max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-xl bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 bg-[var(--color-surface)]">
                            <div>
                                <h3 className="mb-0 text-lg font-bold text-[var(--color-fg)]">Đơn hàng #{orderDetails.order.id}</h3>
                                <p className="mb-0 text-xs text-[var(--color-fg-muted)]">Ngày khởi tạo: {new Date(orderDetails.order.orderDate).toLocaleString('vi-VN')}</p>
                            </div>
                            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-fg-dim)] hover:bg-[var(--color-surface-3)] text-lg hover:text-[var(--color-fg)]" onClick={() => setOrderDetails(null)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1 space-y-5 custom-scrollbar">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl bg-[var(--color-surface-2)]/60 p-4 border border-[var(--color-border)]/50">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2">Khách hàng</h4>
                                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg)]">{orderDetails.order.customerName || getUserName(orderDetails.order.userId)}</p>
                                    <p className="mb-1 text-xs text-[var(--color-fg-muted)]"><i className="fas fa-phone fa-fw mr-1"></i> {orderDetails.order.customerPhone || 'Không có số điện thoại'}</p>
                                    <p className="mb-0 text-xs text-[var(--color-fg-muted)]"><i className="far fa-envelope fa-fw mr-1"></i> {orderDetails.order.customerEmail || 'Không có email'}</p>
                                </div>
                                <div className="rounded-xl bg-[var(--color-surface-2)]/60 p-4 border border-[var(--color-border)]/50">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2">{isPickupOrder(orderDetails.order) ? 'Nhận tại cửa hàng' : 'Giao hàng'}</h4>
                                    <p className="mb-0 text-xs text-[var(--color-fg)] leading-relaxed">
                                        {isPickupOrder(orderDetails.order)
                                            ? `[Tại cửa hàng] - ${orderDetails.order.storePickupLocation || orderDetails.order.shippingAddress || 'Chưa có chi nhánh'}`
                                            : (orderDetails.order.shippingAddress || orderDetails.order.deliveryAddress || 'Chưa có địa chỉ nhận hàng')}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[var(--color-surface-2)]/60 p-4 border border-[var(--color-border)]/50">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2">Thanh toán</h4>
                                    <p className="mb-1 text-xs font-medium text-[var(--color-fg)]">{paymentLabel(orderDetails.order.paymentMethod)}</p>
                                    <p className="mb-2 text-xs text-[var(--color-fg-muted)]">Trạng thái: <span className="font-semibold text-[var(--color-fg)]">{paymentStatusLabel(orderDetails.order.paymentStatus)}</span></p>
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${statusClass(orderDetails.order.status)}`}>
                                        {statusLabel(orderDetails.order.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-fg-muted)] border-b border-[var(--color-border)]">
                                        <tr>
                                            <th className="px-4 py-2.5">Sản phẩm</th>
                                            <th className="px-4 py-2.5">Serial/IMEI</th>
                                            <th className="px-4 py-2.5 text-center w-16">SL</th>
                                            <th className="px-4 py-2.5 text-right w-32">Đơn giá</th>
                                            <th className="px-4 py-2.5 text-right w-36">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--color-border)]">
                                        {(orderDetails.details || []).map((item, index) => (
                                            <tr key={item.id || index} className="bg-[var(--color-surface)]">
                                                <td className="px-4 py-3 font-medium text-[var(--color-fg)]">{item.productName || item.product?.name || `Sản phẩm #${item.productId}`}</td>
                                                <td className="px-4 py-3">
                                                    {item.serialOrImei ? <span className="font-semibold text-[var(--color-fg)]">{item.serialOrImei}</span> : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center text-[var(--color-fg-muted)]">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-[var(--color-fg-muted)]">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-[var(--color-fg)]">{formatCurrency(Number(item.unitPrice || 0) * Number(item.quantity || 0))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
                                        <tr>
                                            <th colSpan="3" className="px-4 py-3 text-right font-bold text-[var(--color-fg-muted)]">Tổng giá trị đơn hàng</th>
                                            <th className="px-4 py-3 text-right text-base font-extrabold text-[var(--color-accent)]">{formatCurrency(orderDetails.order.totalAmount)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-6 py-4 bg-[var(--color-surface-2)]/40">
                            <button type="button" className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-3)] transition-colors" onClick={() => window.print()}>
                                <i className="fas fa-print mr-2"></i>In hóa đơn
                            </button>
                            <button type="button" className="rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 shadow-sm" onClick={() => setOrderDetails(null)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
