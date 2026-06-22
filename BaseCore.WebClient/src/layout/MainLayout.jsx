import React, { useCallback, useEffect, useRef, useState } from 'react';
import { STOCK_ROLES, RETURN_ROLES } from '../constants/roles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderApi, ticketApi, warrantyApi } from '../services/api';
import { cn } from '../utils/cn';

const LAST_SEEN_ORDER_KEY = 'admin_last_seen_order_at';
const LAST_SEEN_TICKET_KEY = 'admin_last_seen_ticket_at';
const LAST_SEEN_WARRANTY_KEY = 'admin_last_seen_warranty_at';

/* ─── helpers ───────────────────────────────────────────────────────── */
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
};

const statusLabel = {
    Pending: 'Chờ xử lý',
    Processing: 'Đang xử lý',
    Shipped: 'Đang giao',
    Delivered: 'Đã giao',
    Cancelled: 'Đã huỷ',
    Open: 'Mới',
    InProgress: 'Đang xử lý',
    Resolved: 'Đã giải quyết',
    Closed: 'Đóng',
    Active: 'Còn hạn',
    Expired: 'Hết hạn',
    ClaimPending: 'Yêu cầu BH',
};

const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'order', label: 'Đơn hàng' },
    { key: 'warranty', label: 'Bảo hành' },
    { key: 'ticket', label: 'Hỗ trợ' },
];

/* ─── NotificationPanel ─────────────────────────────────────────────── */
const NotificationPanel = ({ onClose, navigate }) => {
    const [tab, setTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [warranties, setWarranties] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.allSettled([
            orderApi.getAll({ page: 1, pageSize: 8, sortBy: 'newest' }),
            warrantyApi.getClaimsAll({ page: 1, pageSize: 8, sortBy: 'newest' }),
            ticketApi.getAll({ page: 1, pageSize: 8, sortBy: 'newest' }),
        ]).then(([oRes, wRes, tRes]) => {
            if (cancelled) return;
            if (oRes.status === 'fulfilled') setOrders(oRes.value.data || []);
            if (wRes.status === 'fulfilled') setWarranties(wRes.value.data || []);
            if (tRes.status === 'fulfilled') setTickets(tRes.value.data || []);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    const allItems = [
        ...orders.slice(0, 5).map(o => ({
            type: 'order',
            id: o.orderId || o.id,
            icon: 'fas fa-shopping-bag',
            color: '#2563eb',
            bg: 'rgba(37,99,235,0.10)',
            title: `Đơn hàng #${o.orderId || o.id}`,
            sub: `${o.customerName || o.fullName || 'Khách hàng'} — ${statusLabel[o.status] || o.status || ''}`,
            time: o.orderDate || o.createdAt,
            path: '/admin/orders',
            isNew: (() => {
                const t = new Date(o.orderDate || o.createdAt || 0).getTime();
                const seen = Number(localStorage.getItem(LAST_SEEN_ORDER_KEY) || 0);
                return t > seen;
            })(),
        })),
        ...warranties.slice(0, 5).map(w => ({
            type: 'warranty',
            id: w.claimId || w.id,
            icon: 'fas fa-shield-alt',
            color: '#7c3aed',
            bg: 'rgba(124,58,237,0.10)',
            title: `Yêu cầu bảo hành #${w.claimId || w.id}`,
            sub: `${w.customerName || w.fullName || 'Khách hàng'} — ${statusLabel[w.status] || w.status || ''}`,
            time: w.createdAt || w.claimDate,
            path: '/admin/warranty',
            isNew: (() => {
                const t = new Date(w.createdAt || 0).getTime();
                const seen = Number(localStorage.getItem(LAST_SEEN_WARRANTY_KEY) || 0);
                return t > seen;
            })(),
        })),
        ...tickets.slice(0, 5).map(tk => ({
            type: 'ticket',
            id: tk.ticketId || tk.id,
            icon: 'fas fa-headset',
            color: '#059669',
            bg: 'rgba(5,150,105,0.10)',
            title: `Ticket hỗ trợ #${tk.ticketId || tk.id}`,
            sub: `${tk.subject || tk.title || 'Yêu cầu hỗ trợ'} — ${statusLabel[tk.status] || tk.status || ''}`,
            time: tk.createdAt,
            path: '/admin/tickets',
            isNew: (() => {
                const t = new Date(tk.createdAt || 0).getTime();
                const seen = Number(localStorage.getItem(LAST_SEEN_TICKET_KEY) || 0);
                return t > seen;
            })(),
        })),
    ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

    const displayed = tab === 'all' ? allItems : allItems.filter(i => i.type === tab);
    const unreadCount = allItems.filter(i => i.isNew).length;

    const handleItemClick = (item) => {
        onClose();
        navigate(item.path);
    };

    const handleMarkAll = () => {
        const now = String(Date.now());
        localStorage.setItem(LAST_SEEN_ORDER_KEY, now);
        localStorage.setItem(LAST_SEEN_WARRANTY_KEY, now);
        localStorage.setItem(LAST_SEEN_TICKET_KEY, now);
        onClose();
    };

    return (
        <div style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '380px',
            maxWidth: 'calc(100vw - 24px)',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(37,99,235,0.13)',
            borderRadius: '20px',
            boxShadow: '0 24px 64px -12px rgba(15,23,42,0.22), 0 4px 20px -4px rgba(37,99,235,0.12)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'notifPanelIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
            <style>{`
                @keyframes notifPanelIn {
                    from { opacity: 0; transform: translateY(-12px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes notifItemIn {
                    from { opacity: 0; transform: translateX(8px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .notif-item { animation: notifItemIn 0.18s ease both; }
                .notif-item:hover { background: rgba(37,99,235,0.04) !important; }
                .notif-tab-btn.active {
                    background: linear-gradient(135deg, var(--color-primary, #2563eb), #7c3aed);
                    color: #fff;
                    box-shadow: 0 4px 14px -4px rgba(37,99,235,0.45);
                }
                .notif-tab-btn:not(.active):hover {
                    background: rgba(37,99,235,0.07);
                    color: var(--color-primary, #2563eb);
                }
                .notif-scroll::-webkit-scrollbar { width: 4px; }
                .notif-scroll::-webkit-scrollbar-track { background: transparent; }
                .notif-scroll::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.18); border-radius: 4px; }
            `}</style>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 20px 14px', borderBottom: '1px solid rgba(15,23,42,0.07)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px -3px rgba(37,99,235,0.4)',
                    }}>
                        <i className="fas fa-bell" style={{ color: '#fff', fontSize: 14 }} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.01em' }}>
                            Thông báo
                        </p>
                        {unreadCount > 0 && (
                            <p style={{ margin: 0, fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                                {unreadCount} chưa đọc
                            </p>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAll} style={{
                            border: 'none', background: 'rgba(37,99,235,0.08)', color: '#2563eb',
                            borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', transition: 'background 0.15s',
                        }} title="Đánh dấu tất cả đã đọc">
                            <i className="fas fa-check-double" style={{ marginRight: 4 }} />
                            Đọc tất cả
                        </button>
                    )}
                    <button onClick={onClose} style={{
                        border: 'none', background: 'rgba(15,23,42,0.06)', color: '#64748b',
                        borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s',
                    }}>
                        <i className="fas fa-times" style={{ fontSize: 12 }} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, padding: '12px 16px 8px', overflowX: 'auto' }}>
                {TABS.map(t => {
                    const cnt = t.key === 'all'
                        ? allItems.filter(i => i.isNew).length
                        : allItems.filter(i => i.type === t.key && i.isNew).length;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`notif-tab-btn ${tab === t.key ? 'active' : ''}`}
                            style={{
                                border: 'none', borderRadius: 20, padding: '5px 13px',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                whiteSpace: 'nowrap', transition: 'all 0.18s',
                                background: tab === t.key ? '' : 'rgba(15,23,42,0.05)',
                                color: tab === t.key ? '' : '#64748b',
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}
                        >
                            {t.label}
                            {cnt > 0 && (
                                <span style={{
                                    background: tab === t.key ? 'rgba(255,255,255,0.3)' : '#2563eb',
                                    color: '#fff', borderRadius: 10, padding: '1px 6px',
                                    fontSize: 10, fontWeight: 700, minWidth: 16, textAlign: 'center',
                                }}>{cnt}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Notification List */}
            <div className="notif-scroll" style={{ maxHeight: 360, overflowY: 'auto', padding: '4px 8px 12px' }}>
                {loading ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            border: '3px solid rgba(37,99,235,0.15)',
                            borderTopColor: '#2563eb',
                            animation: 'spin 0.7s linear infinite',
                            margin: '0 auto 12px',
                        }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Đang tải thông báo...</p>
                    </div>
                ) : displayed.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.08))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 14px',
                        }}>
                            <i className="fas fa-bell-slash" style={{ fontSize: 22, color: '#cbd5e1' }} />
                        </div>
                        <p style={{ fontWeight: 600, color: '#475569', fontSize: 14, margin: '0 0 4px' }}>
                            Ở đây hơi trống trải.
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                            Chưa có thông báo nào trong mục này.<br />Mọi hoạt động mới sẽ hiển thị ở đây!
                        </p>
                    </div>
                ) : (
                    displayed.map((item, idx) => (
                        <button
                            key={`${item.type}-${item.id}-${idx}`}
                            className="notif-item"
                            onClick={() => handleItemClick(item)}
                            style={{
                                width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
                                background: item.isNew ? 'rgba(37,99,235,0.04)' : 'transparent',
                                borderRadius: 14, padding: '10px 12px', marginBottom: 2,
                                display: 'flex', alignItems: 'flex-start', gap: 11,
                                transition: 'background 0.15s',
                                animationDelay: `${idx * 0.04}s`,
                                position: 'relative',
                            }}
                        >
                            {/* Icon bubble */}
                            <div style={{
                                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                background: item.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: 1,
                            }}>
                                <i className={item.icon} style={{ color: item.color, fontSize: 15 }} />
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    margin: '0 0 2px', fontWeight: item.isNew ? 700 : 600,
                                    fontSize: 13, color: '#0f172a',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    {item.title}
                                    {item.isNew && (
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: '#2563eb', flexShrink: 0, display: 'inline-block',
                                        }} />
                                    )}
                                </p>
                                <p style={{
                                    margin: '0 0 4px', fontSize: 11.5, color: '#64748b',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    maxWidth: 240,
                                }}>
                                    {item.sub}
                                </p>
                                <p style={{ margin: 0, fontSize: 10.5, color: '#94a3b8', fontWeight: 500 }}>
                                    <i className="fas fa-clock" style={{ marginRight: 4, fontSize: 9 }} />
                                    {formatRelativeTime(item.time)}
                                </p>
                            </div>

                            {/* Arrow */}
                            <i className="fas fa-chevron-right" style={{
                                fontSize: 10, color: '#cbd5e1', alignSelf: 'center', flexShrink: 0,
                            }} />
                        </button>
                    ))
                )}
            </div>

            {/* Footer */}
            <div style={{
                borderTop: '1px solid rgba(15,23,42,0.07)',
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            }}>
                {[
                    { label: 'Đơn hàng', path: '/admin/orders', icon: 'fas fa-shopping-bag', color: '#2563eb' },
                    { label: 'Bảo hành', path: '/admin/warranty', icon: 'fas fa-shield-alt', color: '#7c3aed' },
                    { label: 'Hỗ trợ', path: '/admin/tickets', icon: 'fas fa-headset', color: '#059669' },
                ].map((link, i) => (
                    <button key={i} onClick={() => { onClose(); navigate(link.path); }} style={{
                        border: 'none', background: 'none', cursor: 'pointer', padding: '12px 8px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        borderRight: i < 2 ? '1px solid rgba(15,23,42,0.07)' : 'none',
                        transition: 'background 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <i className={link.icon} style={{ color: link.color, fontSize: 14 }} />
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{link.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ─── navGroups ─────────────────────────────────────────────────────── */
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
            { to: '/admin/banners', label: 'Banner trang chủ', icon: 'fas fa-images' },
        ],
    },
    {
        title: 'Kho hàng',
        items: [
            { to: '/admin/inventory/receipts', label: 'Quản lý kho', icon: 'fas fa-warehouse' },
        ],
    },
    {
        title: 'Hỗ trợ',
        items: [
            { to: '/admin/warranty', label: 'Bảo hành', icon: 'fas fa-shield-alt' },
            { to: '/admin/tickets', label: 'Ticket hỗ trợ', icon: 'fas fa-headset' },
        ],
    },
];

/* ─── MainLayout ────────────────────────────────────────────────────── */
const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [hasNewOrderNotification, setHasNewOrderNotification] = useState(false);
    const [hasNewTicketNotification, setHasNewTicketNotification] = useState(false);
    const [hasNewWarrantyNotification, setHasNewWarrantyNotification] = useState(false);
    const [latestOrderTime, setLatestOrderTime] = useState(0);
    const [latestTicketTime, setLatestTicketTime] = useState(0);
    const notifRef = useRef(null);

    const adminAccess = isAdmin();
    const role = user?.role || '';
    const canManageStock = STOCK_ROLES.includes(role);
    const canManageReturns = RETURN_ROLES.includes(role);
    const canViewOrders = STOCK_ROLES.includes(role);
    const shouldLoadOrderNotification = adminAccess;

    const groups = adminAccess
        ? [
            ...navGroups,
            {
                title: 'Hệ thống',
                items: [
                    { to: '/admin/users', label: 'Người dùng', icon: 'fas fa-users' },
                    { to: '/admin/roles', label: 'Vai trò / Phân quyền', icon: 'fas fa-user-shield' },
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
                if (item.to === '/admin/banners') return adminAccess;
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

    /* Close on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        if (isNotifOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isNotifOpen]);

    /* Close notification panel on route change */
    useEffect(() => { setIsNotifOpen(false); }, [location.pathname]);

    /* Background poll for notification dots */
    useEffect(() => {
        let cancelled = false;
        const loadNotifications = async () => {
            if (!shouldLoadOrderNotification) return;
            try {
                const response = await orderApi.getAll({ page: 1, pageSize: 1, sortBy: 'newest' });
                const latestTime = (response.data || []).reduce((latest, order) => {
                    const time = new Date(order.orderDate || order.createdAt || order.updatedAt || 0).getTime();
                    return Number.isFinite(time) ? Math.max(latest, time) : latest;
                }, 0);
                if (!cancelled && latestTime > 0) {
                    const lastSeenTime = Number(localStorage.getItem(LAST_SEEN_ORDER_KEY) || 0);
                    setLatestOrderTime(latestTime);
                    if (!lastSeenTime) {
                        localStorage.setItem(LAST_SEEN_ORDER_KEY, String(latestTime));
                        setHasNewOrderNotification(false);
                    } else {
                        setHasNewOrderNotification(latestTime > lastSeenTime);
                    }
                }
            } catch { /* ignore */ }

            try {
                const resTicket = await ticketApi.getAll({ page: 1, pageSize: 1, sortBy: 'newest' });
                const latestTimeTicket = (resTicket.data || []).reduce((latest, ticket) => {
                    const time = new Date(ticket.createdAt || ticket.updatedAt || 0).getTime();
                    return Number.isFinite(time) ? Math.max(latest, time) : latest;
                }, 0);
                if (!cancelled && latestTimeTicket > 0) {
                    const lastSeenTicketTime = Number(localStorage.getItem(LAST_SEEN_TICKET_KEY) || 0);
                    setLatestTicketTime(latestTimeTicket);
                    if (!lastSeenTicketTime) {
                        localStorage.setItem(LAST_SEEN_TICKET_KEY, String(latestTimeTicket));
                        setHasNewTicketNotification(false);
                    } else {
                        setHasNewTicketNotification(latestTimeTicket > lastSeenTicketTime);
                    }
                }
            } catch { /* ignore */ }

            try {
                const resW = await warrantyApi.getClaimsAll({ page: 1, pageSize: 1, sortBy: 'newest' });
                const latestW = (resW.data || []).reduce((latest, w) => {
                    const time = new Date(w.createdAt || 0).getTime();
                    return Number.isFinite(time) ? Math.max(latest, time) : latest;
                }, 0);
                if (!cancelled && latestW > 0) {
                    const seen = Number(localStorage.getItem(LAST_SEEN_WARRANTY_KEY) || 0);
                    if (!seen) {
                        localStorage.setItem(LAST_SEEN_WARRANTY_KEY, String(latestW));
                        setHasNewWarrantyNotification(false);
                    } else {
                        setHasNewWarrantyNotification(latestW > seen);
                    }
                }
            } catch { /* ignore */ }
        };

        if (!shouldLoadOrderNotification) {
            setHasNewOrderNotification(false);
            setHasNewTicketNotification(false);
            setHasNewWarrantyNotification(false);
            return undefined;
        }
        loadNotifications();
        const id = window.setInterval(loadNotifications, 30000);
        return () => { cancelled = true; window.clearInterval(id); };
    }, [shouldLoadOrderNotification]);

    useEffect(() => {
        if (location.pathname === '/admin/orders' && latestOrderTime) {
            localStorage.setItem(LAST_SEEN_ORDER_KEY, String(latestOrderTime));
            setHasNewOrderNotification(false);
        }
        if (location.pathname === '/admin/tickets') {
            const now = String(Date.now());
            localStorage.setItem(LAST_SEEN_TICKET_KEY, now);
            setHasNewTicketNotification(false);
        }
        if (location.pathname === '/admin/warranty') {
            const now = String(Date.now());
            localStorage.setItem(LAST_SEEN_WARRANTY_KEY, now);
            setHasNewWarrantyNotification(false);
        }
    }, [latestOrderTime, location.pathname]);

    const hasAnyNotif = hasNewOrderNotification || hasNewTicketNotification || hasNewWarrantyNotification;

    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-background)] font-sans text-[var(--color-fg)]">
            <div aria-hidden className="pointer-events-none absolute inset-0 ts-grid-glow opacity-40" />
            <div aria-hidden className="pointer-events-none absolute left-[-12rem] top-[-10rem] h-80 w-80 rounded-full bg-[var(--color-primary)]/12 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] h-72 w-72 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />
            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Đóng menu"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/28 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-3 left-3 z-40 flex w-64 flex-col overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-glass)] shadow-[var(--shadow-card)] backdrop-blur-xl transition-transform duration-200 lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-24 items-center gap-3 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-background-elevated)]/70 via-white/55 to-transparent px-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] text-white shadow-[var(--shadow-glow-primary)]">
                        <i className="fas fa-bolt text-sm"></i>
                    </div>
                    <div className="min-w-0 leading-tight">
                        <Link to="/admin" className="ts-display block truncate text-lg text-[var(--color-fg)] no-underline">
                            TechStore <span className="ts-gradient-text">Admin</span>
                        </Link>
                        <p className="ts-eyebrow mt-1 text-[10px] text-[var(--color-primary)]">Khu vực quản trị</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    {visibleGroups.map((group) => (
                        <div key={group.title} className="mb-6">
                            <p className="ts-eyebrow mb-2 px-3 text-[var(--color-primary)]/80">{group.title}</p>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.to);
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={cn(
                                                "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium no-underline transition-all duration-200",
                                                active
                                                    ? "bg-gradient-to-r from-[var(--color-primary)]/12 via-[var(--color-background-elevated)] to-white/60 text-[var(--color-fg)] shadow-[0_10px_24px_-20px_rgba(37,99,235,0.85)]"
                                                    : "text-[var(--color-fg-muted)] hover:bg-white/70 hover:text-[var(--color-fg)] hover:shadow-[0_10px_24px_-24px_rgba(15,23,42,0.55)]"
                                            )}
                                        >
                                            {active && (
                                                <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]" />
                                            )}
                                            <i className={cn(item.icon, "w-5 text-center text-xs transition-colors", active ? "text-[var(--color-primary)]" : "text-[var(--color-fg-dim)] group-hover:text-[var(--color-primary)]")}></i>
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-[var(--color-border)] bg-white/35 p-3">
                    <Link
                        to="/"
                        className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2 no-underline transition-all hover:bg-white/70"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] text-xs font-bold text-white shadow-[var(--shadow-soft)]">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[var(--color-fg)]">{userName}</p>
                            <p className="text-[11px] uppercase tracking-wider text-[var(--color-fg-dim)]">{adminAccess ? 'Quản trị' : 'Nhân viên'}</p>
                        </div>
                        <i className="fas fa-arrow-up-right-from-square text-[10px] text-[var(--color-fg-dim)]"></i>
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--color-fg-muted)] transition-all hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
                    >
                        <i className="fas fa-sign-out-alt w-5 text-center text-xs"></i>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <div className="relative min-h-screen lg:pl-[17.5rem]">
                <header className="sticky top-0 z-20 px-3 pt-3 lg:px-5">
                    <div className="flex h-16 items-center rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:px-8">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Mở menu"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white/70 text-[var(--color-fg-muted)] lg:hidden"
                        >
                            <i className="fas fa-bars text-sm"></i>
                        </button>
                        <div className="ml-auto flex items-center gap-3">
                            {/* Notification bell with dropdown */}
                            <div ref={notifRef} style={{ position: 'relative' }}>
                                <button
                                    type="button"
                                    id="admin-notification-bell"
                                    onClick={() => setIsNotifOpen(prev => !prev)}
                                    aria-label="Thông báo"
                                    aria-expanded={isNotifOpen}
                                    className={cn(
                                        "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                                        isNotifOpen
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                            : "border-[var(--color-border)] bg-white/70 text-[var(--color-fg-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-fg)]"
                                    )}
                                >
                                    <i className="fas fa-bell text-sm"></i>
                                    {hasAnyNotif && (
                                        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_0_4px_rgba(37,99,235,0.12)] ts-anim-pulse" />
                                    )}
                                </button>

                                {isNotifOpen && (
                                    <NotificationPanel
                                        onClose={() => setIsNotifOpen(false)}
                                        navigate={navigate}
                                    />
                                )}
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-gradient-to-br from-white to-[var(--color-background-elevated)] text-xs font-bold text-[var(--color-primary)]">
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 px-3 py-4 lg:px-5">{children}</main>

                <footer className="px-3 pb-3 lg:px-5">
                    <div className="flex flex-col gap-1 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 py-4 text-xs text-[var(--color-fg-dim)] shadow-[var(--shadow-soft)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <span>© {new Date().getFullYear()} TechStore — Khu vực quản trị</span>
                        <span className="ts-mono">v1.0.0</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
