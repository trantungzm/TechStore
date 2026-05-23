import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, userApi, categoryApi, orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/store';

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const isCompletedOrder = (order) => ['Completed', 'Shipped', 'Confirmed', 'Processing'].includes(order.status);

const statusLabels = {
    Pending: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Processing: 'Đang xử lý',
    Shipped: 'Đang giao',
    Completed: 'Hoàn tất',
    Cancelled: 'Đã hủy',
    'Cancel Requested': 'Yêu cầu hủy',
    'Cancelled & Refunded': 'Đã hủy & hoàn tiền',
};

const statusLabel = (status) => statusLabels[status] || status || 'Chờ xác nhận';

const StatCard = ({ label, value, hint, icon, tone = 'blue', to }) => {
    const tones = {
        blue: 'bg-blue-50 text-blue-700 ring-blue-100',
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100',
        rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    };

    const content = (
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="mb-1 text-sm font-medium text-admin-muted">{label}</p>
                    <div className="text-2xl font-bold text-admin-ink">{value}</div>
                    {hint && <p className="mb-0 mt-2 text-xs text-admin-muted">{hint}</p>}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-md ring-1 ${tones[tone]}`}>
                    <i className={icon}></i>
                </div>
            </div>
        </div>
    );

    return to ? <Link to={to} className="block no-underline">{content}</Link> : content;
};

const StatusBadge = ({ status }) => {
    const className = status?.includes('Cancel')
        ? 'bg-rose-50 text-rose-700 ring-rose-100'
        : status === 'Completed'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
            : status === 'Shipped'
                ? 'bg-blue-50 text-blue-700 ring-blue-100'
                : status === 'Pending'
                    ? 'bg-slate-100 text-slate-700 ring-slate-200'
                    : 'bg-amber-50 text-amber-700 ring-amber-100';

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>
            {statusLabel(status)}
        </span>
    );
};

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes, ordersRes] = await Promise.all([
                productApi.getAll({ page: 1, pageSize: 200 }),
                categoryApi.getAll(),
                orderApi.getAll(),
            ]);

            const productItems = productsRes.data?.items || productsRes.data?.data || productsRes.data || [];
            setProducts(productItems);
            setCategories(categoriesRes.data || []);
            setOrders(ordersRes.data || []);

            if (isAdmin()) {
                try {
                    const usersRes = await userApi.getAll({ page: 1, pageSize: 1 });
                    setUsersCount(usersRes.data.totalCount || 0);
                } catch (error) {
                    setUsersCount(0);
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const metrics = useMemo(() => {
        const now = new Date();
        const today = startOfDay(now);
        const month = startOfMonth(now);
        const activeOrders = orders.filter(isCompletedOrder);
        const revenueToday = activeOrders
            .filter((order) => new Date(order.orderDate) >= today)
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
        const revenueMonth = activeOrders
            .filter((order) => new Date(order.orderDate) >= month)
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
        const pendingOrders = orders.filter((order) => ['Pending', 'Confirmed', 'Processing', 'Cancel Requested'].includes(order.status));
        const lowStock = products.filter((product) => Number(product.stock || 0) <= 10);

        return {
            revenueToday,
            revenueMonth,
            pendingOrders,
            lowStock,
        };
    }, [orders, products]);

    const statusCounts = useMemo(() => {
        return orders.reduce((acc, order) => {
            const status = order.status || 'Pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [orders]);

    const topProducts = useMemo(() => {
        const sales = {};
        orders.forEach((order) => {
            const details = order.details || order.orderDetails || [];
            details.forEach((item) => {
                sales[item.productId] = (sales[item.productId] || 0) + Number(item.quantity || 0);
            });
        });

        return products
            .map((product) => ({ ...product, sold: sales[product.id] || 0 }))
            .sort((a, b) => b.sold - a.sold || Number(b.price || 0) - Number(a.price || 0))
            .slice(0, 5);
    }, [orders, products]);

    const recentOrders = useMemo(() => {
        return orders
            .slice()
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 6);
    }, [orders]);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-admin-brand"></div>
                    <p className="text-sm font-medium text-admin-muted">Đang tải tổng quan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-admin-muted">Tổng quan</p>
                    <h2 className="mb-0 text-2xl font-bold text-admin-ink">Tình hình bán hàng</h2>
                </div>
                <Link to="/admin/orders" className="inline-flex items-center justify-center gap-2 rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-orange-600">
                    <i className="fas fa-clipboard-list"></i>
                    Xem đơn hàng
                </Link>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Doanh thu hôm nay" value={formatCurrency(metrics.revenueToday)} hint="Tính các đơn đã xác nhận, xử lý, giao, hoàn tất" icon="fas fa-coins" tone="green" />
                <StatCard label="Doanh thu tháng này" value={formatCurrency(metrics.revenueMonth)} hint={`${orders.length} đơn hàng đang theo dõi`} icon="fas fa-chart-line" tone="blue" />
                <StatCard label="Đơn cần xử lý" value={metrics.pendingOrders.length} hint="Đơn chờ, đang xử lý, yêu cầu hủy" icon="fas fa-bell" tone="amber" to="/admin/orders" />
                <StatCard label="Sản phẩm sắp hết" value={metrics.lowStock.length} hint="Tồn kho từ 10 sản phẩm trở xuống" icon="fas fa-triangle-exclamation" tone="rose" to="/admin/products" />
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <StatCard label="Sản phẩm" value={products.length} hint={`${categories.length} danh mục`} icon="fas fa-box" tone="blue" to="/admin/products" />
                <StatCard label="Danh mục" value={categories.length} hint="Nhóm sản phẩm trên cửa hàng" icon="fas fa-tags" tone="green" to="/admin/categories" />
                {isAdmin() && <StatCard label="Khách hàng & nhân viên" value={usersCount} hint="Tài khoản đã đăng ký" icon="fas fa-users" tone="amber" to="/admin/users" />}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h3 className="mb-0 text-base font-bold text-admin-ink">Đơn hàng gần đây</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                <tr>
                                    <th className="px-5 py-3">Đơn hàng</th>
                                    <th className="px-5 py-3">Ngày đặt</th>
                                    <th className="px-5 py-3">Giá trị</th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-3 font-semibold text-admin-ink">#{order.id}</td>
                                        <td className="px-5 py-3 text-admin-muted">{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                                        <td className="px-5 py-3 font-semibold text-admin-ink">{formatCurrency(order.totalAmount)}</td>
                                        <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="space-y-6">
                    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-admin-ink">Trạng thái đơn hàng</h3>
                        <div className="space-y-3">
                            {Object.entries(statusCounts).map(([status, count]) => (
                                <div key={status}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-medium text-admin-ink">{statusLabel(status)}</span>
                                        <span className="text-admin-muted">{count}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100">
                                        <div className="h-2 rounded-full bg-admin-brand" style={{ width: `${Math.max(6, (count / Math.max(orders.length, 1)) * 100)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-admin-ink">Theo dõi tồn kho</h3>
                        <div className="space-y-3">
                            {metrics.lowStock.slice(0, 5).map((product) => (
                                <div key={product.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                                    <span className="truncate text-sm font-medium text-admin-ink">{product.name}</span>
                                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">{product.stock}</span>
                                </div>
                            ))}
                            {!metrics.lowStock.length && <p className="mb-0 text-sm text-admin-muted">Không có sản phẩm sắp hết hàng.</p>}
                        </div>
                    </section>

                    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-admin-ink">Sản phẩm nổi bật</h3>
                        <div className="space-y-3">
                            {topProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="mb-0 truncate text-sm font-semibold text-admin-ink">{product.name}</p>
                                        <p className="mb-0 text-xs text-admin-muted">{formatCurrency(product.price)}</p>
                                    </div>
                                    <span className="text-sm font-bold text-admin-brand">{product.sold} đã bán</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
