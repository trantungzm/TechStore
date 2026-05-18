import React, { useEffect, useMemo, useRef, useState } from 'react';
import { orderApi, userApi } from '../services/api';
import { formatCurrency, resolveProductImage, t } from '../utils/store';

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Completed', 'CancelRequested', 'Cancelled', 'CancelRejected'];
const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Refunded', 'Failed', 'Cancelled'];
const PAYMENT_METHODS = ['COD', 'BankTransfer', 'Momo', 'ShopeePay', 'ApplePay', 'StorePayment'];

const STATUS_LABELS = {
    Pending: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Processing: 'Đang chuẩn bị',
    Shipping: 'Đang giao',
    Completed: 'Hoàn tất',
    CancelRequested: 'Yêu cầu hủy',
    Cancelled: 'Đã hủy',
    CancelRejected: 'Từ chối hủy',
};

const PAYMENT_STATUS_LABELS = {
    Unpaid: 'Chưa thanh toán',
    Paid: 'Đã thanh toán',
    Refunded: 'Đã hoàn tiền',
    Failed: 'Thanh toán lỗi',
    Cancelled: 'Đã hủy',
};

const PAYMENT_METHOD_LABELS = {
    COD: 'Thanh toán khi nhận hàng',
    cod: 'Thanh toán khi nhận hàng',
    BankTransfer: 'Chuyển khoản',
    bank: 'Chuyển khoản',
    Momo: 'Momo',
    ShopeePay: 'ShopeePay',
    ApplePay: 'Apple Pay',
    StorePayment: 'Thanh toán tại cửa hàng',
};

const statusText = (value) => STATUS_LABELS[value] || value || 'Không rõ';
const paymentStatusText = (value) => PAYMENT_STATUS_LABELS[value] || value || 'Không rõ';
const paymentMethodText = (value) => PAYMENT_METHOD_LABELS[value] || value || 'Không rõ';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [filters, setFilters] = useState({
        orderKeyword: '',
        customerKeyword: '',
        status: '',
        paymentStatus: '',
        paymentMethod: '',
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: '',
        sortOrder: 'date_desc',
    });
    const [orderDetails, setOrderDetails] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [processingActionId, setProcessingActionId] = useState(null);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const filterMenuRef = useRef(null);
    const filterButtonRef = useRef(null);
    const [actionDialog, setActionDialog] = useState({
        isOpen: false,
        orderId: null,
        title: '',
        confirmText: '',
        buttonClass: 'btn-primary',
        mode: 'status',
        payload: {},
        note: '',
    });
    const locale = (localStorage.getItem('language') || 'English') === 'Vietnamese' ? 'vi-VN' : 'en-US';
    const dash = '—';
    const userByEmail = useMemo(() => {
        const map = {};
        const seen = new Set();
        Object.values(users).forEach((user) => {
            if (!user || seen.has(user.id)) return;
            seen.add(user.id);
            const email = String(user.email || '').trim().toLowerCase();
            if (email) map[email] = user;
        });
        return map;
    }, [users]);

    const displayText = (value) => {
        if (value === null || value === undefined) return dash;
        const text = String(value).trim();
        return text ? text : dash;
    };

    const getShortId = (value) => {
        if (value === null || value === undefined) return '';
        const text = String(value);
        return text.length > 10 ? text.slice(0, 8) : text;
    };

    const getInitials = (value) => {
        const text = String(value || '').trim();
        if (!text) return '?';
        const parts = text.split(/\s+/).filter(Boolean);
        const first = (parts[0] || '').slice(0, 1).toUpperCase();
        const last = (parts.length > 1 ? parts[parts.length - 1] : '').slice(0, 1).toUpperCase();
        return (first + last) || '?';
    };

    const getAvatarColor = (seed) => {
        const text = String(seed || '');
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue} 70% 40%)`;
    };

    const getUserRecord = (orderOrUserId) => {
        const isOrder = typeof orderOrUserId === 'object' && orderOrUserId !== null;
        const userId = isOrder ? orderOrUserId?.userId : orderOrUserId;
        const direct = users[userId] || users[String(userId)];
        if (direct) return direct;
        if (isOrder) {
            const email = String(orderOrUserId?.customerEmail || '').trim().toLowerCase();
            if (email && userByEmail[email]) return userByEmail[email];
        }
        return undefined;
    };

    const getUserDisplayName = (order) => {
        const user = getUserRecord(order);
        return order?.customerName || user?.name || user?.username || `${t('User')} #${getShortId(order?.userId)}`.trim();
    };

    const getUserEmail = (order) => {
        const user = getUserRecord(order);
        return order?.customerEmail || user?.email || '';
    };

    const getUserPhone = (order) => {
        const user = getUserRecord(order);
        return order?.customerPhone || user?.phone || '';
    };

    const computePaymentStatus = (order) => {
        const method = order?.paymentMethod || 'COD';
        const status = order?.status || '';
        const explicit = order?.paymentStatus;
        if (explicit && explicit !== 'Unpaid') return explicit;

        if (status === 'Cancelled') {
            return method === 'COD' || method === 'cod' ? 'Cancelled' : 'Refunded';
        }
        if (method !== 'COD' && method !== 'cod') {
            return 'Paid';
        }
        if (status === 'Completed') return 'Paid';
        return explicit || 'Unpaid';
    };

    const buildTimeline = (order) => {
        const timeline = Array.isArray(order?.timeline) ? order.timeline : [];
        if (timeline.length > 0) {
            return timeline.map((step) => ({
                status: step.status,
                timestamp: step.createdAt || step.timestamp,
                by: step.createdByUserId || step.by || 'Hệ thống',
                note: step.note || step.title || '',
            }));
        }

        const createdAt = order?.orderDate ? new Date(order.orderDate).toISOString() : new Date().toISOString();
        const updatedAt = order?.updatedAt ? new Date(order.updatedAt).toISOString() : createdAt;
        const updatedBy = order?.updatedBy || 'System';
        const createdBy = order?.customerEmail || order?.customerName || order?.userId || 'customer';

        const steps = [
            { status: 'Created', timestamp: createdAt, by: createdBy, note: t('Order created') },
        ];

        if (order?.status) {
            steps.push({ status: order.status, timestamp: updatedAt, by: updatedBy, note: t('Latest status') });
        }

        return steps;
    };

    useEffect(() => {
        const onMouseDown = (e) => {
            const menuEl = filterMenuRef.current;
            const buttonEl = filterButtonRef.current;
            if (!menuEl || !buttonEl) return;
            if (menuEl.contains(e.target) || buttonEl.contains(e.target)) return;
            setIsFilterMenuOpen(false);
        };
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            setLoading(true);
            try {
                const [ordersRes, usersRes] = await Promise.all([
                    orderApi.getAll(),
                    userApi.getAll({ page: 1, pageSize: 500 }),
                ]);

                const usersMap = {};
                (usersRes.data?.data || []).forEach((user) => {
                    usersMap[user.id] = user;
                    usersMap[String(user.id)] = user;
                });

                setUsers(usersMap);
                setOrders(ordersRes.data || []);
                setError('');
            } catch (err) {
                console.error('Failed to load orders:', err);
                setError(t('Unable to load admin orders.'));
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const refresh = async () => {
            try {
                const response = await orderApi.getAll();
                if (!cancelled) setOrders(response.data || []);
            } catch {}
        };
        const onUpdated = () => refresh();
        const onStorage = (e) => {
            if (e.key === 'basecore_admin_orders_updated_at') {
                refresh();
            }
        };
        window.addEventListener('basecore:admin-orders-updated', onUpdated);
        window.addEventListener('storage', onStorage);
        return () => {
            cancelled = true;
            window.removeEventListener('basecore:admin-orders-updated', onUpdated);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const refreshOrders = async () => {
        const response = await orderApi.getAll();
        setOrders(response.data || []);
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return 'badge-secondary';
        if (status === 'Completed') return 'badge-success';
        if (status === 'Shipping') return 'badge-primary';
        if (status === 'Confirmed' || status === 'Processing') return 'badge-warning';
        if (status.includes('Cancel')) return 'badge-danger';
        return 'badge-secondary';
    };

    const getPaymentBadgeClass = (status) => {
        switch (status) {
            case 'Paid':
                return 'badge-success';
            case 'Refunded':
                return 'badge-warning';
            case 'Cancelled':
                return 'badge-danger';
            default:
                return 'badge-secondary';
        }
    };

    const activeFilterCount = useMemo(() => {
        const keys = ['status', 'paymentStatus', 'paymentMethod', 'dateFrom', 'dateTo', 'amountMin', 'amountMax'];
        return keys.reduce((count, key) => count + (filters[key] ? 1 : 0), 0);
    }, [filters]);

    const filteredOrders = useMemo(() => {
        const orderKeyword = filters.orderKeyword.trim().toLowerCase();
        const customerKeyword = filters.customerKeyword.trim().toLowerCase();
        const amountMin = filters.amountMin ? Number(filters.amountMin) : null;
        const amountMax = filters.amountMax ? Number(filters.amountMax) : null;

        let result = orders.filter((order) => {
            const matchesOrderKeyword = !orderKeyword || String(order.id).includes(orderKeyword);
            const customerFields = [
                order.customerName,
                order.customerPhone,
                order.customerEmail,
                getUserDisplayName(order),
                getUserEmail(order),
                getUserPhone(order),
            ].join(' ').toLowerCase();
            const matchesCustomerKeyword = !customerKeyword || customerFields.includes(customerKeyword);
            const matchesStatus = !filters.status || order.status === filters.status;
            const matchesPaymentStatus = !filters.paymentStatus || computePaymentStatus(order) === filters.paymentStatus;
            const matchesPaymentMethod = !filters.paymentMethod || (order.paymentMethod || 'cod') === filters.paymentMethod;
            const orderDate = new Date(order.orderDate);
            const matchesDateFrom = !filters.dateFrom || orderDate >= new Date(`${filters.dateFrom}T00:00:00`);
            const matchesDateTo = !filters.dateTo || orderDate <= new Date(`${filters.dateTo}T23:59:59`);
            const matchesAmountMin = amountMin === null || Number(order.totalAmount || 0) >= amountMin;
            const matchesAmountMax = amountMax === null || Number(order.totalAmount || 0) <= amountMax;

            return (
                matchesOrderKeyword &&
                matchesCustomerKeyword &&
                matchesStatus &&
                matchesPaymentStatus &&
                matchesPaymentMethod &&
                matchesDateFrom &&
                matchesDateTo &&
                matchesAmountMin &&
                matchesAmountMax
            );
        });

        result = result.slice().sort((a, b) => {
            switch (filters.sortOrder) {
                case 'date_asc':
                    return new Date(a.orderDate) - new Date(b.orderDate);
                case 'amount_desc':
                    return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
                case 'amount_asc':
                    return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
                case 'status':
                    return String(a.status || '').localeCompare(String(b.status || ''));
                case 'date_desc':
                default:
                    return new Date(b.orderDate) - new Date(a.orderDate);
            }
        });

        return result;
    }, [filters, orders, users]);

    const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
    const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

    const summary = useMemo(() => {
        const totalRevenue = orders
            .filter((order) => order.status === 'Completed')
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
        return {
            total: orders.length,
            waitingReview: orders.filter((order) => order.status === 'CancelRequested').length,
            unpaid: orders.filter((order) => computePaymentStatus(order) === 'Unpaid').length,
            completedRevenue: totalRevenue,
        };
    }, [orders]);

    useEffect(() => {
        setPage(1);
    }, [filters]);

    const handleViewDetails = async (orderId) => {
        try {
            const response = await orderApi.getById(orderId);
            const data = response.data;
            const normalized = data?.order
                ? data
                : {
                    order: data?.data?.order || data,
                    details: data?.data?.details || data?.details || data?.items || data?.Items || [],
                };
            if (!normalized?.order) {
                throw new Error('Empty order details');
            }
            if (!Array.isArray(normalized.details)) {
                normalized.details = normalized.order?.items || normalized.order?.Items || [];
            }
            setOrderDetails(normalized);
            setShowDetailModal(true);
        } catch (err) {
            console.error('Failed to load order detail:', err);
            const basic = orders.find((o) => o.id === orderId);
            if (basic) {
                setOrderDetails({
                    order: basic,
                    details: [],
                });
                setShowDetailModal(true);
                setError('');
            } else {
                setError(t('Unable to load order details.'));
            }
        }
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setOrderDetails(null);
    };

    const openActionDialog = (config) => {
        setActionDialog({
            isOpen: true,
            note: '',
            buttonClass: 'btn-primary',
            ...config,
        });
    };

    const closeActionDialog = () => {
        setActionDialog({
            isOpen: false,
            orderId: null,
            title: '',
            confirmText: '',
            buttonClass: 'btn-primary',
            mode: 'status',
            payload: {},
            note: '',
        });
    };

    const submitAction = async () => {
        if (!actionDialog.orderId) return;
        setProcessingActionId(actionDialog.orderId);
        try {
            if (actionDialog.mode === 'review-cancel') {
                await orderApi.reviewCancellation(actionDialog.orderId, {
                    approved: actionDialog.payload.approved,
                    adminNote: actionDialog.note,
                });
            } else {
                await orderApi.updateStatus(actionDialog.orderId, {
                    ...actionDialog.payload,
                    note: actionDialog.note,
                });
            }

            await refreshOrders();
            if (showDetailModal && orderDetails?.order?.id === actionDialog.orderId) {
                const refreshed = await orderApi.getById(actionDialog.orderId);
                setOrderDetails(refreshed.data);
            }
            closeActionDialog();
            setError('');
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || t('Unable to update order.'));
        } finally {
            setProcessingActionId(null);
        }
    };

    const getQuickActions = (order) => {
        const actions = [
            {
                key: 'detail',
                label: t('Details'),
                icon: 'eye',
                className: 'btn-info',
                onClick: () => handleViewDetails(order.id),
            },
        ];

        if (order.status === 'Pending') {
            actions.push({
                key: 'confirm',
                label: t('Confirm'),
                icon: 'check',
                className: 'btn-success',
                onClick: () => openActionDialog({
                    orderId: order.id,
                    title: `${t('Confirm order')} #${order.id}`,
                    confirmText: t('Confirm order'),
                    buttonClass: 'btn-success',
                    payload: { status: 'Confirmed' },
                }),
            });
        }
        if (order.status === 'Confirmed') {
            actions.push({
                key: 'process',
                label: t('Start processing'),
                icon: 'boxes',
                className: 'btn-primary',
                onClick: () => openActionDialog({
                    orderId: order.id,
                    title: `${t('Move order to Processing')} #${order.id}`,
                    confirmText: t('Start processing'),
                    buttonClass: 'btn-primary',
                    payload: { status: 'Processing' },
                }),
            });
        }
        if (order.status === 'Processing') {
            actions.push({
                key: 'ship',
                label: 'Chuyển sang đang giao',
                icon: 'truck',
                className: 'btn-primary',
                onClick: () => openActionDialog({
                    orderId: order.id,
                    title: `Chuyển đơn #${order.id} sang đang giao`,
                    confirmText: 'Xác nhận đang giao',
                    buttonClass: 'btn-primary',
                    payload: { status: 'Shipping' },
                }),
            });
        }
        if (order.status === 'Shipping') {
            actions.push({
                key: 'complete',
                label: t('Complete'),
                icon: 'flag-checkered',
                className: 'btn-success',
                onClick: () => openActionDialog({
                    orderId: order.id,
                    title: `${t('Complete order')} #${order.id}`,
                    confirmText: t('Complete order'),
                    buttonClass: 'btn-success',
                    payload: { status: 'Completed' },
                }),
            });
        }
        if (order.status === 'CancelRequested') {
            actions.push({
                key: 'approve-cancel',
                label: t('Approve cancellation'),
                icon: 'ban',
                className: 'btn-danger',
                onClick: () => openActionDialog({
                    orderId: order.id,
                    title: `${t('Review cancellation request for order')} #${order.id}`,
                    confirmText: t('Approve cancellation'),
                    buttonClass: 'btn-danger',
                    mode: 'review-cancel',
                    payload: { approved: true },
                }),
            });
            actions.push({
                key: 'reject-cancel',
                label: t('Reject cancellation'),
                icon: 'undo',
                className: 'btn-warning',
                onClick: () => openActionDialog({
                    orderId: order.id,
                    title: `${t('Review cancellation request for order')} #${order.id}`,
                    confirmText: t('Reject cancellation'),
                    buttonClass: 'btn-warning',
                    mode: 'review-cancel',
                    payload: { approved: false },
                }),
            });
        }
        if (!['Completed', 'Cancelled', 'CancelRequested', 'CancelRejected'].includes(order.status)) {
            actions.push({
                key: 'cancel',
                label: t('Cancel'),
                icon: 'times',
                className: 'btn-outline-danger',
                onClick: () => openActionDialog({
                    orderId: order.id,
                    title: `${t('Cancel order')} #${order.id}`,
                    confirmText: t('Cancel order'),
                    buttonClass: 'btn-danger',
                    payload: { status: 'Cancelled', restockItems: true },
                }),
            });
        }

        return actions;
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i += 1) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                </li>
            );
        }
        return pages;
    };

    return (
        <>
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-info">
                        <div className="inner">
                            <h3>{summary.total}</h3>
                            <p>{t('Total orders')}</p>
                        </div>
                        <div className="icon"><i className="fas fa-file-invoice"></i></div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning">
                        <div className="inner">
                            <h3>{summary.waitingReview}</h3>
                            <p>{t('Pending cancellation review')}</p>
                        </div>
                        <div className="icon"><i className="fas fa-exclamation-circle"></i></div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-success">
                        <div className="inner">
                            <h3>{formatCurrency(summary.completedRevenue)}</h3>
                            <p>{t('Completed revenue')}</p>
                        </div>
                        <div className="icon"><i className="fas fa-money-bill-wave"></i></div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-danger">
                        <div className="inner">
                            <h3>{summary.unpaid}</h3>
                            <p>{t('Unpaid orders')}</p>
                        </div>
                        <div className="icon"><i className="fas fa-wallet"></i></div>
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-header">
                    <h3 className="card-title mb-0">{t('Order filters')}</h3>
                </div>
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setPage(1);
                        }}
                    >
                        <div className="d-flex flex-wrap align-items-center" style={{ gap: '10px' }}>
                            <input
                                type="text"
                                className="form-control"
                                style={{ minWidth: '140px', width: '160px' }}
                                placeholder={t('e.g. 1001')}
                                value={filters.orderKeyword}
                                onChange={(e) => setFilters((prev) => ({ ...prev, orderKeyword: e.target.value }))}
                            />
                            <input
                                type="text"
                                className="form-control"
                                style={{ minWidth: '240px', flex: '1 1 320px' }}
                                placeholder={t('Name, email, phone')}
                                value={filters.customerKeyword}
                                onChange={(e) => setFilters((prev) => ({ ...prev, customerKeyword: e.target.value }))}
                            />

                            <div className="position-relative">
                                <button
                                    ref={filterButtonRef}
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setIsFilterMenuOpen((v) => !v)}
                                >
                                    <i className="fas fa-sliders-h mr-1"></i>
                                    {t('Filters')}
                                    {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                                </button>

                                {isFilterMenuOpen && (
                                    <div
                                        ref={filterMenuRef}
                                        className="border bg-white rounded shadow p-3"
                                        style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 20, width: '360px' }}
                                    >
                                        <div className="form-row">
                                            <div className="col-6 mb-2">
                                                <label className="small text-muted mb-1">{t('Order status')}</label>
                                                <select
                                                    className="form-control"
                                                    value={filters.status}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                                                >
                                                    <option value="">{t('All')}</option>
                                                    {STATUSES.map((status) => (
                                                        <option key={status} value={status}>{statusText(status)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-6 mb-2">
                                                <label className="small text-muted mb-1">{t('Payment status')}</label>
                                                <select
                                                    className="form-control"
                                                    value={filters.paymentStatus}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                                                >
                                                    <option value="">{t('All')}</option>
                                                    {PAYMENT_STATUSES.map((status) => (
                                                        <option key={status} value={status}>{paymentStatusText(status)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 mb-2">
                                                <label className="small text-muted mb-1">{t('Payment method')}</label>
                                                <select
                                                    className="form-control"
                                                    value={filters.paymentMethod}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                                                >
                                                    <option value="">{t('All')}</option>
                                                    {PAYMENT_METHODS.map((method) => (
                                                        <option key={method} value={method}>{paymentMethodText(method)}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-6 mb-2">
                                                <label className="small text-muted mb-1">{t('From date')}</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={filters.dateFrom}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-6 mb-2">
                                                <label className="small text-muted mb-1">{t('To date')}</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={filters.dateTo}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                                                />
                                            </div>

                                            <div className="col-6 mb-2">
                                                <label className="small text-muted mb-1">{t('Min amount')}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={filters.amountMin}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, amountMin: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-6 mb-2">
                                                <label className="small text-muted mb-1">{t('Max amount')}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={filters.amountMax}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, amountMax: e.target.value }))}
                                                />
                                            </div>

                                            <div className="col-12 mb-3">
                                                <label className="small text-muted mb-1">{t('Sort')}</label>
                                                <select
                                                    className="form-control"
                                                    value={filters.sortOrder}
                                                    onChange={(e) => setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))}
                                                >
                                                    <option value="date_desc">{t('Newest')}</option>
                                                    <option value="date_asc">{t('Oldest')}</option>
                                                    <option value="amount_desc">{t('Highest amount')}</option>
                                                    <option value="amount_asc">{t('Lowest amount')}</option>
                                                    <option value="status">{t('By status')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                    setFilters({
                                                        orderKeyword: '',
                                                        customerKeyword: '',
                                                        status: '',
                                                        paymentStatus: '',
                                                        paymentMethod: '',
                                                        dateFrom: '',
                                                        dateTo: '',
                                                        amountMin: '',
                                                        amountMax: '',
                                                        sortOrder: 'date_desc',
                                                    });
                                                }}
                                            >
                                                <i className="fas fa-sync-alt mr-1"></i> {t('Reset filters')}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-dark"
                                                onClick={() => setIsFilterMenuOpen(false)}
                                            >
                                                {t('Close')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-search mr-1"></i> {t('Search')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="card-title mb-0">{t('Orders list')}</h3>
                        <span className="text-muted">{t('Results')}: <strong>{filteredOrders.length}</strong></span>
                    </div>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {summary.waitingReview > 0 && (
                        <div className="alert alert-warning d-flex align-items-center justify-content-between">
                            <div>
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                {t('You have cancellation requests pending review.')}{' '}
                                <strong>{summary.waitingReview}</strong>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-dark"
                                onClick={() => setFilters((prev) => ({ ...prev, status: 'CancelRequested' }))}
                            >
                                {t('View requests')}
                            </button>
                        </div>
                    )}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : paginatedOrders.length === 0 ? (
                        <div className="alert alert-light border mb-0">{t('No orders match the current filters.')}</div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '110px' }}>{t('Order ID')}</th>
                                            <th>{t('Customer')}</th>
                                            <th style={{ width: '170px' }}>{t('Created at')}</th>
                                            <th style={{ width: '140px' }}>{t('Payment')}</th>
                                            <th style={{ width: '150px' }}>{t('Amount')}</th>
                                            <th style={{ width: '150px' }}>{t('Status')}</th>
                                            <th>{t('Address')}</th>
                                            <th style={{ width: '220px' }}>{t('Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedOrders.map((order) => (
                                            <tr key={order.id} className={order.status === 'CancelRequested' ? 'table-warning' : ''}>
                                                <td><strong>#{order.id}</strong></td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="rounded-circle text-white d-flex align-items-center justify-content-center mr-2"
                                                            style={{
                                                                width: '34px',
                                                                height: '34px',
                                                                background: getAvatarColor(order.userId),
                                                                fontSize: '12px',
                                                                fontWeight: 700,
                                                                flex: '0 0 auto',
                                                            }}
                                                            title={getUserDisplayName(order)}
                                                        >
                                                            {getInitials(getUserDisplayName(order))}
                                                        </div>
                                                        <div>
                                                            <div><strong>{getUserDisplayName(order)}</strong></div>
                                                            <div className="small text-muted">{displayText(getUserPhone(order) || getUserEmail(order))}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{new Date(order.orderDate).toLocaleString(locale)}</td>
                                                <td>
                                                    <div className="small">{paymentMethodText(order.paymentMethod)}</div>
                                                    <span className={`badge ${getPaymentBadgeClass(computePaymentStatus(order))}`}>
                                                        {paymentStatusText(computePaymentStatus(order))}
                                                    </span>
                                                </td>
                                                <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                                        {statusText(order.status)}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: '240px' }}>
                                                    <span className="text-truncate d-inline-block" style={{ maxWidth: '220px' }}>
                                                        {displayText(order.shippingAddress || order.deliveryAddress || t('No address'))}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm flex-wrap">
                                                        {getQuickActions(order).map((action) => (
                                                            <button
                                                                key={action.key}
                                                                className={`btn ${action.className}`}
                                                                onClick={action.onClick}
                                                                disabled={processingActionId === order.id}
                                                                title={action.label}
                                                            >
                                                                {processingActionId === order.id && action.key !== 'detail'
                                                                    ? <i className="fas fa-spinner fa-spin"></i>
                                                                    : <i className={`fas fa-${action.icon}`}></i>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted">
                                    {t('Showing')} {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredOrders.length)} / {filteredOrders.length}
                                </div>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Trước</button>
                                        </li>
                                        {renderPagination()}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Sau</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showDetailModal && orderDetails && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{t('Order details')} #{orderDetails.order.id}</h5>
                                <button type="button" className="close" onClick={closeDetailModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {orderDetails.order.status === 'CancelRequested' && (
                                    <div className="alert alert-warning">
                                        <i className="fas fa-bell mr-2"></i>
                                        {t('Customer requested cancellation. Admin review is required.')}
                                    </div>
                                )}
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="border rounded p-3 h-100">
                                            <h6 className="text-primary"><i className="fas fa-file-invoice mr-2"></i>{t('Order info')}</h6>
                                            <p className="mb-1"><strong>{t('Order ID')}:</strong> #{orderDetails.order.id}</p>
                                            <p className="mb-1"><strong>{t('Created at')}:</strong> {new Date(orderDetails.order.orderDate).toLocaleString(locale)}</p>
                                            <p className="mb-1">
                                                <strong>{t('Status')}:</strong>{' '}
                                                <span className={`badge ${getStatusBadgeClass(orderDetails.order.status)}`}>{statusText(orderDetails.order.status)}</span>
                                            </p>
                                            <p className="mb-1"><strong>{t('Updated by')}:</strong> {displayText(orderDetails.order.updatedBy || 'System')}</p>
                                            <p className="mb-0"><strong>{t('Updated at')}:</strong> {new Date(orderDetails.order.updatedAt || orderDetails.order.orderDate).toLocaleString(locale)}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="border rounded p-3 h-100">
                                            <h6 className="text-primary"><i className="fas fa-user mr-2"></i>{t('Customer')}</h6>
                                            <div className="d-flex align-items-center mb-2">
                                                <div
                                                    className="rounded-circle text-white d-flex align-items-center justify-content-center mr-2"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        background: getAvatarColor(orderDetails.order.userId),
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        flex: '0 0 auto',
                                                    }}
                                                >
                                                    {getInitials(getUserDisplayName(orderDetails.order))}
                                                </div>
                                                <div className="text-truncate" style={{ maxWidth: '240px' }}>
                                                    <div className="font-weight-bold">{getUserDisplayName(orderDetails.order)}</div>
                                                    <div className="small text-muted">{displayText(getUserEmail(orderDetails.order))}</div>
                                                </div>
                                            </div>
                                            <p className="mb-1"><strong>{t('Phone')}:</strong> {displayText(getUserPhone(orderDetails.order))}</p>
                                            <p className="mb-0"><strong>{t('Shipping address')}:</strong> {displayText(orderDetails.order.shippingAddress || orderDetails.order.deliveryAddress)}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="border rounded p-3 h-100">
                                            <h6 className="text-primary"><i className="fas fa-credit-card mr-2"></i>{t('Payment')}</h6>
                                            <p className="mb-1"><strong>{t('Payment method')}:</strong> {paymentMethodText(orderDetails.order.paymentMethod)}</p>
                                            <p className="mb-1">
                                                <strong>{t('Payment status')}:</strong>{' '}
                                                <span className={`badge ${getPaymentBadgeClass(computePaymentStatus(orderDetails.order))}`}>
                                                    {paymentStatusText(computePaymentStatus(orderDetails.order))}
                                                </span>
                                            </p>
                                            <p className="mb-1"><strong>{t('Amount')}:</strong> {formatCurrency(orderDetails.order.totalAmount)}</p>
                                            <p className="mb-0"><strong>{t('Transaction ID')}:</strong> {displayText(orderDetails.order.transactionId)}</p>
                                        </div>
                                    </div>
                                </div>

                                {orderDetails.order.cancelReason && (
                                    <div className="alert alert-danger mt-3 mb-0">
                                        <strong>{t('Cancellation reason')}:</strong> {orderDetails.order.cancelReason}
                                    </div>
                                )}

                                {buildTimeline(orderDetails.order).length > 0 && (
                                    <div className="mt-4">
                                        <h6 className="text-primary mb-3"><i className="fas fa-stream mr-2"></i>{t('Order timeline')}</h6>
                                        <div className="row">
                                            {buildTimeline(orderDetails.order).map((step, index) => (
                                                <div className="col-md-4 mb-3" key={`${step.status}-${index}`}>
                                                    <div className="border rounded p-3 h-100 bg-light">
                                                        <div className={`badge ${getStatusBadgeClass(step.status)} mb-2`}>{statusText(step.status)}</div>
                                                        <div className="small text-muted mb-1">{new Date(step.timestamp).toLocaleString(locale)}</div>
                                                        <div className="small mb-1"><strong>{t('By')}:</strong> {step.by || 'System'}</div>
                                                        <div className="small">{step.note || t('No notes.')}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <h6 className="text-primary mb-3"><i className="fas fa-box-open mr-2"></i>{t('Order items')}</h6>
                                    {(orderDetails.details || []).length === 0 ? (
                                        <div className="alert alert-light border mb-0">
                                            {t('Order items are not available for this order.')}
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm table-striped table-bordered">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>{t('Product')}</th>
                                                        <th className="text-center">{t('Quantity')}</th>
                                                        <th className="text-right">{t('Unit price')}</th>
                                                        <th className="text-right">{t('Total')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(orderDetails.details || []).map((item) => (
                                                        <tr key={item.id}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <img
                                                                        src={resolveProductImage(item.product || { id: item.productId, imageUrl: item.productImage || item.product?.imageUrl || '' })}
                                                                        alt=""
                                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                        className="rounded border mr-2"
                                                                    />
                                                                    <div className="text-truncate" style={{ maxWidth: '420px' }}>
                                                                        {item.productName || item.product?.name || `${t('Product')} #${item.productId}`}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                                                            <td className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline-secondary mr-auto" onClick={() => window.print()}>
                                    <i className="fas fa-print mr-1"></i> {t('Print')}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={closeDetailModal}>{t('Close')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {actionDialog.isOpen && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{actionDialog.title}</h5>
                                <button type="button" className="close" onClick={closeActionDialog}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-0">
                                    <label>{t('Admin note')}</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder={t('Add a note for the order timeline...')}
                                        value={actionDialog.note}
                                        onChange={(e) => setActionDialog((prev) => ({ ...prev, note: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeActionDialog}>{t('Close')}</button>
                                <button type="button" className={`btn ${actionDialog.buttonClass}`} onClick={submitAction}>
                                    {actionDialog.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminOrders;
