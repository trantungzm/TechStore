import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationApi, orderApi } from '../services/api';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin, hasRole } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
    const [cancelRequestCount, setCancelRequestCount] = useState(0);
    const [notificationState, setNotificationState] = useState({
        items: [],
        loading: false,
        error: '',
        unreadCount: 0,
        page: 1,
        pageSize: 8,
    });
    const shouldLoadOrderAlerts =
        hasRole(['Admin', 'Warehouse', 'StockManager']) &&
        (location.pathname === '/admin' || location.pathname.startsWith('/admin/orders'));

    useEffect(() => {
        const previousBodyClass = document.body.className;

        const stylesheetUrls = [
            'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css',
        ];

        const scriptUrls = [
            'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js',
        ];

        const appendedLinks = stylesheetUrls.map((href) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.adminAsset = 'true';
            document.head.appendChild(link);
            return link;
        });

        const appendedScripts = [];
        let cancelled = false;

        const loadScripts = async () => {
            for (const src of scriptUrls) {
                if (cancelled) return;
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.dataset.adminAsset = 'true';
                    script.onload = resolve;
                    script.onerror = resolve;
                    document.body.appendChild(script);
                    appendedScripts.push(script);
                });
            }
        };

        loadScripts();
        document.body.className = 'hold-transition sidebar-mini layout-fixed text-sm admin-shell';

        return () => {
            cancelled = true;
            appendedLinks.forEach((link) => link.remove());
            appendedScripts.forEach((script) => script.remove());
            document.body.className = previousBodyClass || 'hold-transition sidebar-mini';
        };
    }, []);

    // Apply the body class when the sidebar state changes
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.remove('sidebar-collapse');
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
            document.body.classList.add('sidebar-collapse');
        }
    }, [isSidebarOpen]);

    useEffect(() => {
        setIsUserMenuOpen(false);
        setIsNotificationMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isUserMenuOpen && !isNotificationMenuOpen) return;
        const handler = (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (target.closest('.nav-item.dropdown')) return;
            setIsUserMenuOpen(false);
            setIsNotificationMenuOpen(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [isUserMenuOpen, isNotificationMenuOpen]);

    const loadUnreadCount = async () => {
        try {
            const res = await notificationApi.getUnreadCount();
            const count = Number(res.data?.count ?? res.data?.Count ?? 0);
            setNotificationState((prev) => ({ ...prev, unreadCount: Number.isFinite(count) ? count : 0 }));
        } catch {
            setNotificationState((prev) => ({ ...prev, unreadCount: 0 }));
        }
    };

    const loadNotifications = async (page = 1) => {
        setNotificationState((prev) => ({ ...prev, loading: true, error: '' }));
        try {
            const pageSize = notificationState.pageSize;
            const res = await notificationApi.getMy({ page, pageSize, unreadOnly: false });
            const data = res.data || {};
            const items = Array.isArray(data.items) ? data.items : [];
            setNotificationState((prev) => ({
                ...prev,
                items,
                loading: false,
                page: Number(page) || 1,
            }));
        } catch (err) {
            const data = err.response?.data;
            setNotificationState((prev) => ({
                ...prev,
                items: [],
                loading: false,
                error: data?.message || data?.detail || data?.title || 'Unable to load notifications.',
            }));
        }
    };

    const markAllRead = async () => {
        try {
            await notificationApi.markAllRead();
        } finally {
            await loadUnreadCount();
            await loadNotifications(notificationState.page);
        }
    };

    const markReadAndNavigate = async (n) => {
        const id = n?.id ?? n?.Id;
        const link = String(n?.link ?? n?.Link ?? '').trim();
        const isUnread = (n?.readAt ?? n?.ReadAt) == null;
        try {
            if (isUnread && id != null) {
                await notificationApi.markRead(id);
            }
        } finally {
            setIsNotificationMenuOpen(false);
            await loadUnreadCount();
            await loadNotifications(notificationState.page);
            if (link) {
                navigate(link);
            }
        }
    };

    const formatNotificationTime = (value) => {
        const raw = value ? new Date(value) : null;
        if (!raw || Number.isNaN(raw.getTime())) return '';
        return raw.toLocaleString();
    };

    useEffect(() => {
        loadUnreadCount();
    }, []);

    useEffect(() => {
        if (!isNotificationMenuOpen) return;
        loadNotifications(1);
    }, [isNotificationMenuOpen]);

    useEffect(() => {
        if (!shouldLoadOrderAlerts) {
            setCancelRequestCount(0);
            return;
        }

        let cancelled = false;
        const refresh = async () => {
            try {
                const response = await orderApi.getAll();
                const list = response.data || [];
                const count = list.filter((order) => order.status === 'Cancel Requested').length;
                if (!cancelled) setCancelRequestCount(count);
            } catch {
                if (!cancelled) setCancelRequestCount(0);
            }
        };

        const onUpdated = () => refresh();
        const onStorage = (e) => {
            if (e.key === 'basecore_admin_orders_updated_at') {
                refresh();
            }
        };
        window.addEventListener('basecore:admin-orders-updated', onUpdated);
        window.addEventListener('storage', onStorage);
        refresh();

        const interval = window.setInterval(refresh, 30000);
        return () => {
            cancelled = true;
            window.removeEventListener('basecore:admin-orders-updated', onUpdated);
            window.removeEventListener('storage', onStorage);
            window.clearInterval(interval);
        };
    }, [shouldLoadOrderAlerts]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = (e) => {
        e.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
    };

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin' ? 'active' : '';
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    const routeMeta = {
        '/admin': { title: 'Dashboard', icon: 'tachometer-alt', crumbs: [{ label: 'Admin', to: '/admin' }] },
        '/admin/products': { title: 'Products', icon: 'box', crumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Products', to: '/admin/products' }] },
        '/admin/categories': { title: 'Categories', icon: 'tags', crumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Categories', to: '/admin/categories' }] },
        '/admin/orders': { title: 'Orders', icon: 'shopping-cart', crumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Orders', to: '/admin/orders' }] },
        '/admin/users': { title: 'Users', icon: 'users', crumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Users', to: '/admin/users' }] },
        '/admin/inventory': { title: 'Inventory', icon: 'warehouse', crumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Inventory', to: '/admin/inventory' }] },
        '/admin/tickets': { title: 'Tickets', icon: 'headset', crumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Tickets', to: '/admin/tickets' }] },
        '/admin/repairs': { title: 'Repairs', icon: 'tools', crumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Repairs', to: '/admin/repairs' }] },
    };

    const currentMeta = (() => {
        const keys = Object.keys(routeMeta).sort((a, b) => b.length - a.length);
        const key = keys.find((k) => (k === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(k))) || '/admin';
        return routeMeta[key] || routeMeta['/admin'];
    })();

    return (
        <div className="wrapper">
            {/* Navbar */}
            <nav className="main-header navbar navbar-expand navbar-dark navbar-primary">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={toggleSidebar} role="button">
                            <i className="fas fa-bars"></i>
                        </a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <Link to="/admin" className="nav-link">Admin</Link>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <Link to="/" className="nav-link">Store</Link>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className={`nav-item dropdown ${isNotificationMenuOpen ? 'show' : ''}`}>
                        <a
                            className="nav-link position-relative"
                            href="#"
                            role="button"
                            aria-haspopup="true"
                            aria-expanded={isNotificationMenuOpen}
                            title="Notifications"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsNotificationMenuOpen((v) => !v);
                            }}
                        >
                            <i className="far fa-bell"></i>
                            {notificationState.unreadCount > 0 && (
                                <span className="badge badge-danger navbar-badge" title="Unread notifications">
                                    {notificationState.unreadCount > 99 ? '99+' : notificationState.unreadCount}
                                </span>
                            )}
                        </a>
                        <div className={`dropdown-menu dropdown-menu-lg dropdown-menu-right ${isNotificationMenuOpen ? 'show' : ''}`} style={{ width: 380, maxWidth: '92vw' }}>
                            <span className="dropdown-item dropdown-header d-flex align-items-center justify-content-between">
                                <span>Notifications</span>
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={markAllRead}>
                                    Mark all read
                                </button>
                            </span>
                            <div className="dropdown-divider"></div>
                            {notificationState.loading ? (
                                <div className="dropdown-item text-center text-muted">
                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                </div>
                            ) : notificationState.error ? (
                                <div className="dropdown-item text-danger">{notificationState.error}</div>
                            ) : notificationState.items.length === 0 ? (
                                <div className="dropdown-item text-muted">No notifications yet.</div>
                            ) : (
                                notificationState.items.map((n) => {
                                    const id = n?.id ?? n?.Id ?? Math.random();
                                    const title = String(n?.title ?? n?.Title ?? '').trim() || 'Notification';
                                    const message = String(n?.message ?? n?.Message ?? '').trim();
                                    const createdAt = n?.createdAt ?? n?.CreatedAt;
                                    const isUnread = (n?.readAt ?? n?.ReadAt) == null;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            className="dropdown-item"
                                            onClick={() => markReadAndNavigate(n)}
                                            style={{ whiteSpace: 'normal' }}
                                        >
                                            <div className="d-flex align-items-start" style={{ gap: 10 }}>
                                                <div className={`mt-1 ${isUnread ? 'text-warning' : 'text-muted'}`}>
                                                    <i className={isUnread ? 'fas fa-circle' : 'far fa-circle'} style={{ fontSize: 10 }}></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between" style={{ gap: 10 }}>
                                                        <div className="font-weight-bold">{title}</div>
                                                        <div className="text-muted" style={{ fontSize: 12 }}>{formatNotificationTime(createdAt)}</div>
                                                    </div>
                                                    {message && <div className="text-muted" style={{ fontSize: 13 }}>{message}</div>}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </li>
                    {hasRole(['Admin', 'Warehouse', 'StockManager']) && (
                        <li className="nav-item">
                            <Link to="/admin/orders" className="nav-link position-relative" title="Orders">
                                <i className="fas fa-receipt"></i>
                                {cancelRequestCount > 0 && (
                                    <span
                                        className="badge badge-danger navbar-badge"
                                        style={{ right: '-2px', top: '6px' }}
                                        title="Cancellation requests"
                                    >
                                        {cancelRequestCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                    )}
                    <li className={`nav-item dropdown ${isUserMenuOpen ? 'show' : ''}`}>
                        <a
                            className="nav-link"
                            href="#"
                            role="button"
                            aria-haspopup="true"
                            aria-expanded={isUserMenuOpen}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsUserMenuOpen((v) => !v);
                            }}
                        >
                            <i className="far fa-user mr-2"></i>
                            <span className="d-none d-sm-inline">{user?.name || user?.username}</span>
                            <i className="fas fa-caret-down ml-2"></i>
                        </a>
                        <div className={`dropdown-menu dropdown-menu-right ${isUserMenuOpen ? 'show' : ''}`}>
                            <Link className="dropdown-item" to="/admin">
                                <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
                            </Link>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item text-danger" onClick={handleLogout} type="button">
                                <i className="fas fa-sign-out-alt mr-2"></i> Logout
                            </button>
                        </div>
                    </li>
                </ul>
            </nav>

            {/* Sidebar */}
            <aside className="main-sidebar sidebar-dark-primary elevation-4">
                <Link to="/admin" className="brand-link">
                    <span className="brand-image">
                        <i className="fas fa-store text-white"></i>
                    </span>
                    <span className="brand-text font-weight-light">
                        <b>BaseCore</b> Admin
                    </span>
                </Link>

                <div className="sidebar">
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <i className="fas fa-user-circle fa-2x text-light"></i>
                        </div>
                        <div className="info">
                            <Link to="#" className="d-block">{user?.name || user?.username}</Link>
                        </div>
                    </div>

                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar nav-compact flex-column text-sm" data-widget="treeview" role="menu">
                            <li className="nav-item">
                                <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                                    <i className="nav-icon fas fa-tachometer-alt"></i>
                                    <p>Dashboard</p>
                                </Link>
                            </li>
                            <li className="nav-header">MANAGEMENT</li>
                            {hasRole(['Admin', 'Warehouse', 'Technical', 'StockManager']) && (
                                <>
                                    <li className="nav-item">
                                        <Link to="/admin/products" className={`nav-link ${isActive('/admin/products')}`}>
                                            <i className="nav-icon fas fa-box"></i>
                                            <p>Products</p>
                                        </Link>
                                    </li>
                                </>
                            )}
                            {hasRole(['Admin']) && (
                                <li className="nav-item">
                                    <Link to="/admin/categories" className={`nav-link ${isActive('/admin/categories')}`}>
                                        <i className="nav-icon fas fa-tags"></i>
                                        <p>Categories</p>
                                    </Link>
                                </li>
                            )}
                            {hasRole(['Admin', 'Warehouse', 'StockManager']) && (
                                <li className="nav-item">
                                    <Link to="/admin/orders" className={`nav-link ${isActive('/admin/orders')}`}>
                                        <i className="nav-icon fas fa-shopping-cart"></i>
                                        <p>Orders</p>
                                    </Link>
                                </li>
                            )}
                            {hasRole(['Admin', 'Warehouse', 'StockManager']) && (
                                <li className="nav-item">
                                    <Link to="/admin/inventory" className={`nav-link ${isActive('/admin/inventory')}`}>
                                        <i className="nav-icon fas fa-warehouse"></i>
                                        <p>Inventory</p>
                                    </Link>
                                </li>
                            )}
                            {hasRole(['Admin', 'Technical', 'Warranty']) && (
                                <li className="nav-item">
                                    <Link to="/admin/tickets" className={`nav-link ${isActive('/admin/tickets')}`}>
                                        <i className="nav-icon fas fa-headset"></i>
                                        <p>Tickets</p>
                                    </Link>
                                </li>
                            )}
                            {hasRole(['Admin', 'Warranty']) && (
                                <li className="nav-item">
                                    <Link to="/admin/repairs" className={`nav-link ${isActive('/admin/repairs')}`}>
                                        <i className="nav-icon fas fa-tools"></i>
                                        <p>Repairs</p>
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
                                        <i className="nav-icon fas fa-users"></i>
                                        <p>Users</p>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </aside>

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2 align-items-center">
                            <div className="col-sm-6">
                                <h1 className="m-0">
                                    <i className={`fas fa-${currentMeta.icon} mr-2 text-primary`}></i>
                                    {currentMeta.title}
                                </h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    {currentMeta.crumbs.map((c, idx) => (
                                        <li key={`${c.to}-${idx}`} className={`breadcrumb-item ${idx === currentMeta.crumbs.length - 1 ? 'active' : ''}`}>
                                            {idx === currentMeta.crumbs.length - 1 ? (
                                                c.label
                                            ) : (
                                                <Link to={c.to}>{c.label}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="content" id="admin-main" tabIndex={-1}>
                    <div className="container-fluid pb-3">{children}</div>
                </section>
            </div>

            {/* Footer */}
            <footer className="main-footer">
                <strong>Copyright &copy; 2024 <a href="#">BaseCore Sales</a>.</strong>
                <div className="float-right d-none d-sm-inline-block">
                    <b>Version</b> 1.0.0
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
