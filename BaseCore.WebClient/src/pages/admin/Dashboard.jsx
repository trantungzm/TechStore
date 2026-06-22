import React, { useEffect, useMemo, useState } from 'react';
import { STOCK_ROLES } from '../../constants/roles';
import { Link } from 'react-router-dom';
import { productApi, userApi, categoryApi, orderApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/store';
import { cn } from '../../utils/cn';

// Dashboard là màn tổng hợp chỉ số vận hành cho admin:
// gom dữ liệu từ sản phẩm, danh mục, người dùng và đơn hàng để hiển thị KPI.
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const normalizeStatusKey = (raw) => {
    const value = String(raw || '').trim();
    if (!value) return 'Pending';
    const lowered = value.toLowerCase();
    if (lowered.includes('cancel')) return 'Cancelled';
    if (lowered === 'cancelrequested') return 'Cancelled';
    if (lowered === 'cancel rejected' || lowered === 'cancelrejected') return 'Cancelled';
    if (lowered === 'cancel requested') return 'Cancelled';
    if (lowered === 'shipped' || lowered === 'shipping' || lowered === 'delivered') return 'Shipping';
    if (lowered === 'readyforpickup') return 'ReadyForPickup';
    if (lowered === 'confirmed') return 'Confirmed';
    if (lowered === 'processing') return 'Processing';
    if (lowered === 'completed') return 'Completed';
    if (lowered === 'pending') return 'Pending';
    return value;
};

const normalizePaymentStatus = (raw) => {
    const v = String(raw || '').trim().toLowerCase();
    if (v === 'paid') return 'Paid';
    if (v === 'refunded') return 'Refunded';
    if (v === 'cancelled') return 'Cancelled';
    return 'Unpaid';
};

const isPaidOrder = (o) => normalizePaymentStatus(o.paymentStatus || o.PaymentStatus) === 'Paid';
const isCompletedOrder = (o) => normalizeStatusKey(o.status || o.Status) === 'Completed';
const isOpenOrder = (o) => !['Completed', 'Cancelled'].includes(normalizeStatusKey(o.status || o.Status));

const statusLabels = {
    Pending: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Processing: 'Đang xử lý',
    ReadyForPickup: 'Sẵn sàng nhận',
    Shipping: 'Đang giao',
    Completed: 'Hoàn tất',
    Cancelled: 'Đã hủy',
};
const statusLabel = (s) => statusLabels[s] || s || 'Chờ xác nhận';

const statusStyles = {
    Completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
    Cancelled: 'border-red-500/30 bg-red-500/10 text-red-700',
    Shipping: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
    ReadyForPickup: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
    Processing: 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    Confirmed: 'border-[var(--color-gold)]/35 bg-[var(--color-gold)]/10 text-[#b45309]',
    Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
};
const getStatusStyle = (s = '') => {
    const key = normalizeStatusKey(s);
    return statusStyles[key] || statusStyles.Pending;
};

const StatCard = ({ label, value, hint, icon, tone = 'primary', to }) => {
    const tones = {
        accent: 'from-[var(--color-primary)]/18 via-[var(--color-primary)]/10 to-transparent text-[var(--color-primary)]',
        primary: 'from-[var(--color-primary)]/18 via-[var(--color-accent)]/8 to-transparent text-[var(--color-primary)]',
        success: 'from-emerald-500/16 via-emerald-500/8 to-transparent text-emerald-600',
        warning: 'from-amber-500/16 via-amber-500/8 to-transparent text-amber-600',
        danger: 'from-red-500/16 via-red-500/8 to-transparent text-red-600',
        gold: 'from-[var(--color-gold)]/16 via-[var(--color-gold)]/8 to-transparent text-[#b45309]',
    };
    const content = (
        <div className="ts-panel group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/18 hover:shadow-[var(--shadow-lift)]">
            <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-br opacity-90", tones[tone])} />
            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="ts-eyebrow text-[10px]">{label}</p>
                    <p className="ts-display mt-3 text-3xl font-bold text-[var(--color-fg)]">{value}</p>
                    {hint && <p className="mt-2 text-[11px] text-[var(--color-fg-dim)]">{hint}</p>}
                </div>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/80 shadow-[var(--shadow-soft)]", tones[tone])}>
                    <i className={icon}></i>
                </div>
            </div>
        </div>
    );
    return to ? <Link to={to} className="block no-underline">{content}</Link> : content;
};

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [productsTotalCount, setProductsTotalCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useAuth();
    const canViewOrders = STOCK_ROLES.includes(user?.role);

    useEffect(() => { loadDashboard(); }, []);

    // Tải dữ liệu nền của dashboard. Mỗi nhóm dữ liệu phục vụ một cụm widget khác nhau.
    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes, ordersRes] = await Promise.all([
                productApi.getAll({ page: 1, pageSize: 500 }),
                categoryApi.getAll(),
                canViewOrders ? orderApi.getAll() : Promise.resolve({ data: [] }),
            ]);
            const productPayload = productsRes.data;
            const productItems = productPayload?.items || productPayload?.data || productPayload || [];
            setProducts(Array.isArray(productItems) ? productItems : []);
            setProductsTotalCount(Number(productPayload?.totalCount || productPayload?.TotalCount || (Array.isArray(productItems) ? productItems.length : 0)) || 0);
            setCategories(categoriesRes.data || []);
            setOrders(ordersRes.data || []);

            if (isAdmin()) {
                try {
                    const usersRes = await userApi.getAll({ page: 1, pageSize: 1 });
                    setUsersCount(usersRes.data.totalCount || 0);
                } catch { setUsersCount(0); }
            }
        } catch (e) {
            console.error('Failed to load dashboard:', e);
        } finally { setLoading(false); }
    };

    // Gom KPI chính từ orders và products để các card phía trên chỉ cần render dữ liệu đã tính sẵn.
    const metrics = useMemo(() => {
        const now = new Date();
        const today = startOfDay(now);
        const month = startOfMonth(now);
        const paid = orders.filter((o) => isPaidOrder(o) && normalizeStatusKey(o.status || o.Status) !== 'Cancelled');
        const completed = orders.filter((o) => isCompletedOrder(o) && normalizeStatusKey(o.status || o.Status) !== 'Cancelled');
        const openOrders = orders.filter(isOpenOrder);
        return {
            revenueToday: paid.filter((o) => new Date(o.orderDate) >= today).reduce((s, o) => s + Number(o.totalAmount || 0), 0),
            revenueMonth: paid.filter((o) => new Date(o.orderDate) >= month).reduce((s, o) => s + Number(o.totalAmount || 0), 0),
            completedOrders: completed.length,
            paidOrders: paid.length,
            averageOrderValue: paid.length ? paid.reduce((s, o) => s + Number(o.totalAmount || 0), 0) / paid.length : 0,
            pendingOrders: openOrders,
            lowStock: products.filter((p) => Number(p.stock || p.totalStock || 0) <= 10),
        };
    }, [orders, products]);

    // Phân rã trạng thái đơn để vẽ badge/tổng hợp số lượng theo từng bước vận hành.
    const statusCounts = useMemo(() => orders.reduce((acc, o) => {
        const s = normalizeStatusKey(o.status || o.Status);
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {}), [orders]);

    // Top sản phẩm bán chạy được suy ra từ chi tiết đơn hàng, không lưu riêng ở backend.
    const topProducts = useMemo(() => {
        const sales = {};
        orders.forEach((o) => {
            (o.details || o.orderDetails || []).forEach((item) => {
                const pid = Number(item.productId ?? item.ProductId ?? item.productID ?? item.ProductID);
                if (!Number.isFinite(pid) || pid <= 0) return;
                const qty = Number(item.quantity ?? item.Quantity ?? 0) || 0;
                sales[pid] = (sales[pid] || 0) + qty;
            });
        });
        return products
            .map((p) => ({ ...p, sold: sales[p.id] || 0 }))
            .sort((a, b) => b.sold - a.sold || Number(b.price || 0) - Number(a.price || 0))
            .slice(0, 5);
    }, [orders, products]);

    const recentOrders = useMemo(() => orders.slice().sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 6), [orders]);
    const statusBreakdown = useMemo(() => Object.entries(statusCounts).sort((a, b) => b[1] - a[1]), [statusCounts]);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 px-1 py-2 lg:px-2">
            <section className="ts-panel relative overflow-hidden px-6 py-6 lg:px-7">
                <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_58%)]" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="ts-eyebrow text-[var(--color-primary)]">Dashboard</p>
                        <h2 className="ts-display mt-2 text-3xl text-[var(--color-fg)] lg:text-4xl">Tổng quan bán hàng</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-fg-muted)]">
                            Theo dõi doanh thu, hiệu suất xử lý đơn và sức khỏe tồn kho trong một giao diện sáng hơn, dễ quét hơn.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="ts-pill">Đơn hoàn tất: {metrics.completedOrders}</span>
                        <span className="ts-pill">Giá trị TB: {formatCurrency(metrics.averageOrderValue)}</span>
                        <span className="ts-pill">Cảnh báo kho: {metrics.lowStock.length}</span>
                        <Link to="/admin/orders" className="ts-btn ts-btn-primary text-xs">
                            <i className="fas fa-clipboard-list"></i>Xem đơn hàng
                        </Link>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Doanh thu hôm nay" value={formatCurrency(metrics.revenueToday)} hint="Chỉ tính đơn đã thanh toán" icon="fas fa-coins" tone="success" />
                <StatCard label="Doanh thu tháng" value={formatCurrency(metrics.revenueMonth)} hint={`${metrics.paidOrders} đơn đã thanh toán`} icon="fas fa-chart-line" tone="primary" />
                <StatCard label="Đơn cần xử lý" value={metrics.pendingOrders.length} hint="Đang chờ, xử lý" icon="fas fa-bell" tone="warning" to="/admin/orders" />
                <StatCard label="Sản phẩm sắp hết" value={metrics.lowStock.length} hint="≤ 10 sản phẩm" icon="fas fa-triangle-exclamation" tone="danger" to="/admin/products" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <StatCard label="Sản phẩm" value={productsTotalCount || products.length} hint={`${categories.length} danh mục`} icon="fas fa-box" tone="primary" to="/admin/products" />
                <StatCard label="Danh mục" value={categories.length} hint="Nhóm sản phẩm" icon="fas fa-tags" tone="primary" to="/admin/categories" />
                {isAdmin() && <StatCard label="Tài khoản" value={usersCount} hint="Khách & nhân viên" icon="fas fa-users" tone="gold" to="/admin/users" />}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                <section className="ts-panel overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-background-elevated)]/60 via-white/30 to-transparent px-5 py-4">
                        <div>
                            <h3 className="ts-display text-lg">Đơn hàng gần đây</h3>
                            <p className="mt-1 text-xs text-[var(--color-fg-dim)]">Danh sách đơn mới nhất cần theo dõi</p>
                        </div>
                        <Link to="/admin/orders" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="ts-table-container">
                        <table className="ts-table">
                            <thead>
                                <tr>
                                    <th className="ts-table-col-narrow">Đơn</th>
                                    <th className="ts-table-col-medium ts-table-hide-mobile">Ngày</th>
                                    <th className="ts-table-col-medium">Giá trị</th>
                                    <th className="ts-table-col-medium">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((o) => (
                                    <tr key={o.id}>
                                        <td>
                                            <div className="min-w-0">
                                                <p className="ts-mono font-semibold text-[var(--color-fg)]">#{o.id}</p>
                                                <p className="mt-0.5 text-[11px] text-[var(--color-fg-dim)]">{(o.details || o.orderDetails || []).length} sản phẩm</p>
                                            </div>
                                        </td>
                                        <td className="ts-table-hide-mobile text-[var(--color-fg-dim)]">{new Date(o.orderDate).toLocaleString('vi-VN')}</td>
                                        <td className="ts-mono font-semibold text-[var(--color-primary)]">{formatCurrency(o.totalAmount)}</td>
                                        <td>
                                            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", getStatusStyle(o.status))}>
                                                {statusLabel(o.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="space-y-6">
                    <section className="ts-panel p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="ts-display text-lg">Phân bố trạng thái</h3>
                            <span className="ts-pill">{orders.length} đơn</span>
                        </div>
                        <div className="space-y-3">
                            {statusBreakdown.map(([s, count]) => (
                                <div key={s}>
                                    <div className="mb-1 flex justify-between text-xs">
                                        <span className="text-[var(--color-fg-muted)]">{statusLabel(s)}</span>
                                        <span className="ts-mono text-[var(--color-fg)]">{count}</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-3)]">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]"
                                            style={{ width: `${Math.max(6, (count / Math.max(orders.length, 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="ts-panel p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="ts-display text-lg">Tồn kho cảnh báo</h3>
                            <Link to="/admin/products" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">Quản lý</Link>
                        </div>
                        <div className="space-y-2">
                            {metrics.lowStock.slice(0, 5).map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white/65 px-3 py-3 text-sm">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-[var(--color-fg)]">{p.name}</p>
                                        <p className="mt-0.5 text-[11px] text-[var(--color-fg-dim)]">ID #{p.id}</p>
                                    </div>
                                    <span className="ts-mono rounded-full bg-red-500/12 px-2.5 py-1 text-xs font-bold text-red-700">{p.stock}</span>
                                </div>
                            ))}
                            {!metrics.lowStock.length && <p className="text-xs text-[var(--color-fg-dim)]">Không có sản phẩm sắp hết.</p>}
                        </div>
                    </section>

                    <section className="ts-panel p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="ts-display text-lg">Sản phẩm bán chạy</h3>
                            <span className="text-xs text-[var(--color-fg-dim)]">Top {topProducts.length}</span>
                        </div>
                        <div className="space-y-3">
                            {topProducts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-white/65 px-3 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[var(--color-fg)]">{p.name}</p>
                                        <p className="ts-mono mt-0.5 text-xs text-[var(--color-fg-dim)]">{formatCurrency(p.price)}</p>
                                    </div>
                                    <span className="ts-mono rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-sm font-bold text-[var(--color-primary)]">{p.sold} bán</span>
                                </div>
                            ))}
                            {!topProducts.length && <p className="text-xs text-[var(--color-fg-dim)]">Chưa có đủ dữ liệu bán hàng.</p>}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
