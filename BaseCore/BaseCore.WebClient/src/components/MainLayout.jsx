import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../services/api';

const LAST_SEEN_ORDER_KEY = 'admin_last_seen_order_at';

const navGroups = [
    {
        title: 'Tổng quan',
        items: [
            { to: '/admin', label: 'Dashboard', icon: 'fas fa-chart-line' },
        ],
    },
    {
        title: 'Cửa hàng',
        items: [
            { to: '/admin/orders', label: 'Đơn hàng', icon: 'fas fa-shopping-cart' },
            { to: '/admin/products', label: 'Sản phẩm', icon: 'fas fa-box' },
            { to: '/admin/categories', label: 'Danh mục', icon: 'fas fa-tags' },
            { to: '/admin/suppliers', label: 'Nhà cung cấp', icon: 'fas fa-truck' },
            { to: '/admin/coupons', label: 'Phiếu giảm giá', icon: 'fas fa-ticket-alt' },
        ],
    },
    {
        title: 'Kho hàng',
        items: [
            { to: '/admin/inventory/receipts', label: 'Nhập/xuất kho', icon: 'fas fa-warehouse' },
            { to: '/admin/inventory/returns', label: 'Trả hàng', icon: 'fas fa-rotate-left' },
        ],
    },
    {
        title: 'Hỗ trợ',
        items: [
            { to: '/admin/warranty', label: 'Bảo hành', icon: 'fas fa-shield-alt' },
            { to: '/admin/repairs', label: 'Sửa chữa', icon: 'fas fa-screwdriver-wrench' },
            { to: '/admin/tickets', label: 'Ticket hỗ trợ', icon: 'fas fa-headset' },
        ],
    },
];

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasNewOrderNotification, setHasNewOrderNotification] = useState(false);
    const [latestOrderTime, setLatestOrderTime] = useState(0);
    const adminAccess = isAdmin();
    const role = user?.role || '';
    const canManageStock = ['Admin', 'Warehouse'].includes(role);
    const canManageReturns = ['Admin', 'Technical'].includes(role);
    const canViewOrders = ['Admin', 'Warehouse'].includes(role);
    const shouldLoadOrderNotification = adminAccess &&
        (location.pathname === '/admin' || location.pathname.startsWith('/admin/orders'));

    const groups = adminAccess
        ? [
            ...navGroups,
            {
                title: 'Hệ thống',
                items: [
                    { to: '/admin/users', label: 'Người dùng', icon: 'fas fa-users' },
                    { to: '/admin/roles', label: 'Vai trò / Phân quyền', icon: 'fas fa-user-shield' },
                    { to: '/admin/settings', label: 'Cấu hình', icon: 'fas fa-cog' },
                ],
            },
        ]
        : navGroups;

    const visibleGroups = groups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => {
                if (item.to === '/admin/inventory/receipts') return canManageStock;
                if (item.to === '/admin/inventory/returns') return canManageReturns;
                if (item.to === '/admin/inventory/serials') return canManageStock || canManageReturns;
                if (item.to === '/admin/suppliers') return canManageStock;
                if (item.to === '/admin/orders') return canViewOrders;
                if (item.to === '/admin/categories') return adminAccess;
                if (item.to === '/admin/coupons') return adminAccess;
                return true;
            }),
        }))
        .filter((group) => group.items.length > 0);

    const isActive = (path) => {
        if (path === '/admin' || path === '/admin/inventory') return location.pathname === path;
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const userName = user?.name || user?.username || 'Administrator';
    const initials = String(userName)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'AD';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationClick = () => {
        if (latestOrderTime) {
            localStorage.setItem(LAST_SEEN_ORDER_KEY, String(latestOrderTime));
            setHasNewOrderNotification(false);
        }
        navigate('/admin/orders');
    };

    useEffect(() => {
        let cancelled = false;

        const loadOrderNotification = async () => {
            if (!shouldLoadOrderNotification) return;

            try {
                const response = await orderApi.getAll({ page: 1, pageSize: 1, sortBy: 'newest' });
                const latestTime = (response.data || []).reduce((latest, order) => {
                    const time = new Date(order.orderDate || order.createdAt || order.updatedAt || 0).getTime();
                    return Number.isFinite(time) ? Math.max(latest, time) : latest;
                }, 0);

                if (cancelled || latestTime === 0) return;

                const lastSeenTime = Number(localStorage.getItem(LAST_SEEN_ORDER_KEY) || 0);
                setLatestOrderTime(latestTime);

                if (!lastSeenTime) {
                    localStorage.setItem(LAST_SEEN_ORDER_KEY, String(latestTime));
                    setHasNewOrderNotification(false);
                    return;
                }

                setHasNewOrderNotification(latestTime > lastSeenTime);
            } catch (error) {
                console.error('Failed to load order notification:', error);
            }
        };

        if (!shouldLoadOrderNotification) {
            setHasNewOrderNotification(false);
            return undefined;
        }

        loadOrderNotification();
        const intervalId = window.setInterval(loadOrderNotification, 30000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [shouldLoadOrderNotification]);

    useEffect(() => {
        if (location.pathname === '/admin/orders' && latestOrderTime) {
            localStorage.setItem(LAST_SEEN_ORDER_KEY, String(latestOrderTime));
            setHasNewOrderNotification(false);
        }
    }, [latestOrderTime, location.pathname]);

    return (
        <div className="min-h-screen bg-admin-bg font-sans text-admin-ink">
            {isSidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
                    aria-label="Đóng menu"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={[
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-amber-100 bg-white text-admin-ink shadow-sm transition-transform duration-200 lg:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                <div className="flex h-20 items-center gap-3 border-b border-amber-100 px-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-admin-accent text-white shadow-sm">
                        <i className="fas fa-bolt text-sm"></i>
                    </div>
                    <div className="min-w-0 leading-tight">
                        <Link to="/admin" className="block truncate text-[15px] font-extrabold tracking-tight text-admin-ink no-underline">
                            Quản trị bán hàng
                        </Link>
                        <p className="mb-0 mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-admin-brand">
                            Khu vực quản trị
                        </p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {visibleGroups.map((group) => (
                        <div key={group.title} className="mb-5">
                            <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-admin-muted">
                                {group.title}
                            </div>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.to);
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={[
                                                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold no-underline transition',
                                                active
                                                    ? 'bg-amber-50 text-admin-brand shadow-sm ring-1 ring-amber-100'
                                                    : 'text-slate-600 hover:bg-amber-50 hover:text-admin-brand',
                                            ].join(' ')}
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <i className={`${item.icon} w-5 text-center ${active ? 'text-admin-brand' : 'text-admin-muted'}`}></i>
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-amber-100 p-4">
                    <Link to="/" className="mb-3 flex items-center gap-3 rounded-md px-1 py-2 no-underline transition hover:bg-amber-50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-brand text-xs font-extrabold text-white">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="mb-0 truncate text-sm font-semibold text-admin-ink">{userName}</p>
                            <p className="mb-0 text-xs text-admin-muted">{adminAccess ? 'Quản trị' : 'Nhân viên'}</p>
                        </div>
                        <i className="fas fa-right-from-bracket text-admin-muted"></i>
                    </Link>
                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-admin-accent"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-sign-out-alt w-5 text-center text-admin-muted"></i>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <div className="min-h-screen lg:pl-64">
                <header className="sticky top-0 z-20 border-b border-amber-100 bg-white/95 backdrop-blur">
                    <div className="flex h-12 items-center px-4 lg:px-6">
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-100 bg-white text-slate-700 shadow-sm lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Mở menu"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className="ml-auto flex items-center gap-4">
                            <button
                                type="button"
                                className="relative hidden h-6 w-6 appearance-none items-center justify-center border-0 bg-transparent p-0 text-slate-700 shadow-none outline-none transition hover:text-admin-brand focus:outline-none sm:inline-flex"
                                aria-label="Thông báo"
                                onClick={handleNotificationClick}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                                {hasNewOrderNotification && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-admin-accent"></span>}
                            </button>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-admin-brand">
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                <main>{children}</main>

                <footer className="border-t border-amber-100 bg-white px-4 py-4 text-sm text-admin-muted lg:px-8">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span>Bản quyền &copy; 2024 BaseCore Sales.</span>
                        <span>Phiên bản 1.0.0</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
