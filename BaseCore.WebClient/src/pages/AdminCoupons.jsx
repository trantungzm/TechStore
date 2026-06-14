import React, { useEffect, useMemo, useState } from 'react';
import { categoryApi, couponApi, brandApi } from '../services/api';
import { confirmDialog } from '../utils/notify';

const inputClass = 'rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100';

const defaultForm = () => {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
        code: '',
        name: '',
        description: '',
        type: 'Product',
        discountType: 'Amount',
        discountValue: 0,
        maxDiscountAmount: '',
        minOrderAmount: 0,
        startAt: toInputDateTime(now),
        endAt: toInputDateTime(nextMonth),
        totalQuantity: 100,
        perUserLimit: 1,
        isActive: true,
        isPublic: true,
        isAutoClaimable: true,
        isSpinReward: false,
        spinWeight: 0,
        allowedPaymentMethods: [],
        dailyUsageLimit: 0,
        scopeType: 'All',
        productId: '',
        categoryId: '',
        brand: '',
    };
};

const toInputDateTime = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const toApiDateTime = (value) => (value ? new Date(value).toISOString() : new Date().toISOString());

const unwrapItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const unwrapPageMeta = (payload, fallbackItems, fallbackPage, fallbackPageSize) => {
    if (!payload || Array.isArray(payload)) {
        const totalCount = fallbackItems.length;
        return { totalCount, totalPages: Math.ceil(totalCount / fallbackPageSize) || 1 };
    }

    const totalCount = Number(payload.totalCount ?? payload.total ?? payload.count ?? fallbackItems.length);
    const totalPages = Number(payload.totalPages ?? (Math.ceil(totalCount / fallbackPageSize) || 1));
    return {
        totalCount,
        totalPages: Math.max(1, totalPages),
        page: Number(payload.page || fallbackPage),
        pageSize: Number(payload.pageSize || fallbackPageSize),
    };
};

const getStatusLabel = (coupon) => {
    const status = String(coupon.status || '').toLowerCase();
    if (status === 'active' || (!status && coupon.isActive)) return 'Hoạt động';
    if (status === 'disabled' || status === 'inactive' || !coupon.isActive) return 'Tạm dừng';
    if (status === 'expired') return 'Hết hạn';
    if (status === 'scheduled') return 'Sắp diễn ra';
    return coupon.status || 'Tạm dừng';
};

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [form, setForm] = useState(defaultForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [keywordInput, setKeywordInput] = useState('');
    const [filters, setFilters] = useState({ keyword: '', type: '', status: '' });
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const activeCoupons = useMemo(
        () => coupons.filter((item) => String(item.status || '').toLowerCase() === 'active' || item.isActive).length,
        [coupons]
    );

    // Lấy dữ liệu tĩnh / Thống kê tổng quan duy nhất một lần khi Mount
    useEffect(() => {
        const initData = async () => {
            try {
                const [categoryRes, statsRes, analyticsRes, brandRes] = await Promise.all([
                    categoryApi.getAll(),
                    couponApi.getStats(),
                    couponApi.getAnalytics({ top: 10 }),
                    brandApi.getByCategory()
                ]);
                setCategories(unwrapItems(categoryRes.data));
                setStats(statsRes.data || null);
                setAnalytics(unwrapItems(analyticsRes.data));
                const brandList = Array.isArray(brandRes.data) ? brandRes.data : [];
                setBrands([...new Set(brandList.map((b) => b.name ?? b.Name).filter(Boolean))].sort());
            } catch (err) {
                console.error("Lỗi khởi tạo dữ liệu Admin Coupons:", err);
            }
        };
        initData();
    }, []);

    // Fetch lại danh sách khi chuyển trang HOẶC khi áp dụng bộ lọc (React 18 gộp setPage + setFilters -> chỉ 1 lần fetch)
    useEffect(() => {
        loadCoupons(page);
    }, [page, filters]);

    const loadCoupons = async (nextPage = page) => {
        setLoading(true);
        setError('');
        try {
            const couponRes = await couponApi.getAll({
                page: nextPage,
                pageSize,
                keyword: filters.keyword.trim() || undefined,
                type: filters.type || undefined,
                status: filters.status || undefined,
            });
            const items = unwrapItems(couponRes.data);
            const meta = unwrapPageMeta(couponRes.data, items, nextPage, pageSize);
            
            setCoupons(items);
            setTotalCount(meta.totalCount);
            setTotalPages(meta.totalPages);
            
            if (meta.page && meta.page !== page) {
                setPage(meta.page);
            }
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không thể tải danh sách phiếu giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                couponApi.getStats(),
                couponApi.getAnalytics({ top: 10 })
            ]);
            setStats(statsRes.data || null);
            setAnalytics(unwrapItems(analyticsRes.data));
        } catch (err) {
            console.error("Không thể cập nhật bảng thống kê:", err);
        }
    };

    const applySearch = (event) => {
        event?.preventDefault();
        setFilters((current) => ({ ...current, keyword: keywordInput.trim() }));
        setPage(1);
    };

    const changeFilter = (patch) => {
        setFilters((current) => ({ ...current, ...patch }));
        setPage(1);
    };

    const clearFilters = () => {
        setKeywordInput('');
        setFilters({ keyword: '', type: '', status: '' });
        setPage(1);
    };

    const hasActiveFilters = Boolean(filters.keyword || filters.type || filters.status);

    const updateField = (field, value) => {
        setForm((current) => {
            const updated = { ...current, [field]: value };
            // Nếu đổi sang FreeShipping thì tự động đưa trị giảm giá về 0 cho sạch form
            if (field === 'discountType' && value === 'FreeShipping') {
                updated.discountValue = 0;
            }
            return updated;
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(defaultForm());
        setError('');
        setSuccess('');
        setShowForm(false);
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm(defaultForm());
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const editCoupon = (coupon) => {
        const scope = coupon.scopes?.[0] || { scopeType: 'All' };
        setEditingId(coupon.id);
        setForm({
            code: coupon.code || '',
            name: coupon.name || '',
            description: coupon.description || '',
            type: coupon.type || 'Product',
            discountType: coupon.discountType || 'Amount',
            discountValue: Number(coupon.discountValue || 0),
            maxDiscountAmount: coupon.maxDiscountAmount ?? '',
            minOrderAmount: Number(coupon.minOrderAmount || 0),
            startAt: toInputDateTime(coupon.startAt),
            endAt: toInputDateTime(coupon.endAt),
            totalQuantity: Number(coupon.totalQuantity || 0),
            perUserLimit: Number(coupon.perUserLimit || 1),
            isActive: Boolean(coupon.isActive),
            isPublic: Boolean(coupon.isPublic),
            isAutoClaimable: Boolean(coupon.isAutoClaimable),
            isSpinReward: Boolean(coupon.isSpinReward),
            spinWeight: Number(coupon.spinWeight || 0),
            allowedPaymentMethods: String(coupon.allowedPaymentMethods || '')
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
            dailyUsageLimit: Number(coupon.dailyUsageLimit || 0),
            scopeType: scope.scopeType || 'All',
            productId: scope.productId || '',
            categoryId: scope.categoryId || '',
            brand: scope.brand || '',
        });
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const buildPayload = () => {
        const scope = {
            scopeType: form.scopeType,
            productId: form.scopeType === 'Product' && form.productId ? Number(form.productId) : null,
            categoryId: form.scopeType === 'Category' && form.categoryId ? Number(form.categoryId) : null,
            brand: form.scopeType === 'Brand' ? form.brand.trim() : null,
        };

        return {
            code: form.code.trim(),
            name: form.name.trim(),
            description: form.description.trim(),
            type: form.type,
            discountType: form.discountType,
            discountValue: form.discountType === 'FreeShipping' ? 0 : Number(form.discountValue || 0),
            maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
            minOrderAmount: Number(form.minOrderAmount || 0),
            startAt: toApiDateTime(form.startAt),
            endAt: toApiDateTime(form.endAt),
            totalQuantity: Number(form.totalQuantity || 0),
            perUserLimit: Number(form.perUserLimit || 1),
            isActive: form.isActive,
            isPublic: form.isPublic,
            isAutoClaimable: form.isAutoClaimable,
            isSpinReward: form.isSpinReward,
            spinWeight: Number(form.spinWeight || 0),
            allowedPaymentMethods: Array.isArray(form.allowedPaymentMethods) && form.allowedPaymentMethods.length
                ? form.allowedPaymentMethods.join(',')
                : null,
            dailyUsageLimit: Number(form.dailyUsageLimit || 0),
            scopes: [scope],
        };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = buildPayload();
            if (editingId) {
                await couponApi.update(editingId, payload);
                setSuccess('Đã cập nhật phiếu giảm giá');
            } else {
                await couponApi.create(payload);
                setSuccess('Đã tạo phiếu giảm giá');
            }
            resetForm();
            refreshStats(); // Cập nhật số liệu thống kê ở top bar riêng biệt
            
            if (!editingId && page !== 1) {
                setPage(1);
            } else {
                await loadCoupons(page);
            }
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không thể lưu phiếu giảm giá');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (coupon) => {
        setError('');
        try {
            await couponApi.toggle(coupon.id);
            await Promise.all([loadCoupons(page), refreshStats()]);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Không thể đổi trạng thái phiếu');
        }
    };

    const handleDelete = async (coupon) => {
        if (!(await confirmDialog({ title: 'Xóa phiếu giảm giá', message: `Xóa phiếu "${coupon.code}"? Phiếu đã có người nhận sẽ chỉ bị tắt.`, tone: 'danger', confirmText: 'Xóa' }))) return;
        setError('');
        try {
            await couponApi.delete(coupon.id);
            refreshStats();
            
            const nextTotal = Math.max(0, totalCount - 1);
            const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
            const nextPage = Math.min(page, nextTotalPages);
            
            if (nextPage !== page) {
                setPage(nextPage);
            } else {
                await loadCoupons(nextPage);
            }
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Không thể xóa phiếu');
        }
    };

    const fromItem = coupons.length ? (page - 1) * pageSize + 1 : 0;
    const toItem = coupons.length ? (page - 1) * pageSize + coupons.length : 0;

    return (
        // Giữ nguyên phần Render UI của bạn ở đây...
        <div className="px-4 py-6 lg:px-8">
            {/* ... JSX Content giữ nguyên hoàn toàn ... */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Khuyến mãi</p>
                    <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Phiếu giảm giá / Voucher</h2>
                </div>
                <button type="button" className="rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)]" onClick={openCreateForm}>
                    <i className="fas fa-plus mr-2"></i>
                    Thêm phiếu
                </button>
            </div>

            {error && <div className="mb-4 rounded-md border border-rose-200 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{error}</div>}
            {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">{success}</div>}

            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Tổng phiếu</div>
                    <div className="mt-1 text-2xl font-extrabold text-[var(--color-fg)]">{stats?.totalCoupons ?? coupons.length}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Đang hoạt động</div>
                    <div className="mt-1 text-2xl font-extrabold text-[var(--color-accent)]">{stats?.activeCoupons ?? activeCoupons}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Đã nhận</div>
                    <div className="mt-1 text-2xl font-extrabold text-[var(--color-fg)]">{stats?.totalClaimed ?? 0}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Đã dùng</div>
                    <div className="mt-1 text-2xl font-extrabold text-[var(--color-fg)]">{stats?.totalUsed ?? 0}</div>
                </div>
            </div>

            {analytics.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="border-b border-[var(--color-border)] px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Hiệu quả voucher (Top 10)</h3>
                    </div>
                    <div className="p-4">
                        <div className="ts-table-container">
                            <table className="ts-table">
                                <thead>
                                    <tr>
                                        <th className="ts-table-col-medium">Mã</th>
                                        <th className="ts-table-col-medium ts-table-hide-mobile">Đơn</th>
                                        <th className="ts-table-col-medium">Tổng giảm</th>
                                        <th className="ts-table-col-medium ts-table-hide-mobile">Tỷ lệ dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((item) => (
                                        <tr key={item.couponId || item.code}>
                                            <td>
                                                <div className="font-extrabold text-[var(--color-fg)]">{item.code}</div>
                                                <div className="text-xs text-[var(--color-fg-muted)] line-clamp-1">{item.name}</div>
                                            </td>
                                            <td className="ts-table-hide-mobile">{item.ordersCount || 0}</td>
                                            <td>{Number(item.totalDiscountAmount || 0).toLocaleString('vi-VN')}đ</td>
                                            <td className="ts-table-hide-mobile">{Math.round(Number(item.redemptionRate || 0) * 100)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-5">
                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                    <div className="border-b border-[var(--color-border)] px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Danh sách phiếu</h3>
                    </div>
                    {/* Tìm kiếm 3 tiêu chí: Từ khóa (mã/tên) · Loại · Trạng thái */}
                    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                        <form onSubmit={applySearch} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_180px_auto]">
                            <div className="relative">
                                <i className="fas fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-dim)]"></i>
                                <input
                                    className={`${inputClass} w-full pl-9`}
                                    placeholder="Tìm theo mã hoặc tên phiếu..."
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                />
                            </div>
                            <select className={`${inputClass} w-full`} value={filters.type} onChange={(e) => changeFilter({ type: e.target.value })}>
                                <option value="">Tất cả loại</option>
                                <option value="Product">Sản phẩm</option>
                                <option value="Shipping">Vận chuyển</option>
                            </select>
                            <select className={`${inputClass} w-full`} value={filters.status} onChange={(e) => changeFilter({ status: e.target.value })}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="disabled">Tạm dừng</option>
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="expired">Hết hạn</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent)]/90">
                                    <i className="fas fa-magnifying-glass mr-1"></i>Tìm
                                </button>
                                {hasActiveFilters && (
                                    <button type="button" onClick={clearFilters} className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-3)]" title="Xóa lọc">
                                        <i className="fas fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <div className="py-12 text-center text-sm font-semibold text-[var(--color-fg-muted)]">Đang tải phiếu giảm giá...</div>
                        ) : (
                            <>
                            <div className="ts-table-container">
                                <table className="ts-table">
                                    <thead>
                                        <tr>
                                            <th className="ts-table-col-medium">Mã phiếu</th>
                                            <th className="ts-table-col-medium ts-table-hide-mobile">Loại</th>
                                            <th className="ts-table-col-medium ts-table-hide-mobile">Giảm giá</th>
                                            <th className="ts-table-col-medium ts-table-hide-tablet">Điều kiện</th>
                                            <th className="ts-table-col-medium ts-table-hide-tablet">Lượt</th>
                                            <th className="ts-table-col-medium ts-table-hide-mobile">Trạng thái</th>
                                            <th className="ts-table-col-medium text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="py-10 text-center text-sm font-semibold text-[var(--color-fg-muted)]">
                                                    {hasActiveFilters ? 'Không tìm thấy phiếu phù hợp bộ lọc.' : 'Chưa có phiếu giảm giá nào.'}
                                                </td>
                                            </tr>
                                        )}
                                        {coupons.map((coupon) => (
                                            <tr key={coupon.id}>
                                                <td>
                                                    <div className="font-extrabold text-[var(--color-fg)]">{coupon.code}</div>
                                                    <div className="text-xs text-[var(--color-fg-muted)]">{coupon.name}</div>
                                                </td>
                                                <td className="ts-table-hide-mobile">{coupon.type === 'Shipping' ? 'Vận chuyển' : 'Sản phẩm'}</td>
                                                <td className="ts-table-hide-mobile">
                                                    {coupon.discountType === 'FreeShipping' ? 'Miễn phí ship' : `${coupon.discountValue}${coupon.discountType === 'Percent' ? '%' : 'đ'}`}
                                                </td>
                                                <td className="ts-table-hide-tablet">{Number(coupon.minOrderAmount || 0).toLocaleString('vi-VN')}đ</td>
                                                <td className="ts-table-hide-tablet">{coupon.claimedQuantity || 0}/{coupon.totalQuantity || '∞'} nhận, {coupon.usedQuantity || 0} dùng</td>
                                                <td className="ts-table-hide-mobile">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${(coupon.status === 'Active' || coupon.isActive) ? 'bg-emerald-500/10 text-emerald-300' : 'bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]'}`}>
                                                        {getStatusLabel(coupon)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-2">
                                                        <button type="button" className="h-9 w-9 rounded-md bg-[var(--color-surface-3)] text-[var(--color-fg)] hover:bg-slate-200" onClick={() => handleToggle(coupon)} title="Bật/tắt">
                                                            <i className="fas fa-power-off"></i>
                                                        </button>
                                                        <button type="button" className="h-9 w-9 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]" onClick={() => editCoupon(coupon)} title="Sửa">
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button type="button" className="h-9 w-9 rounded-md bg-rose-600 text-white hover:bg-rose-700" onClick={() => handleDelete(coupon)} title="Xóa">
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Hiển thị {fromItem}-{toItem} trong {totalCount} phiếu
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="rounded-md border border-[var(--color-border)] px-3 py-2 font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={page <= 1}
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    >
                                        Trước
                                    </button>
                                    <span className="rounded-md bg-[var(--color-surface-3)] px-3 py-2 font-semibold text-[var(--color-fg)]">
                                        {page}/{totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        className="rounded-md border border-[var(--color-border)] px-3 py-2 font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                </section>

                {showForm && (
                <div className="fixed bottom-0 left-0 right-0 top-14 z-[70] flex items-center justify-center bg-slate-950/50 px-4 pb-8 pt-4 lg:left-64">
                <aside className="flex max-h-[calc(100vh-7rem)] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">{editingId ? 'Sửa phiếu' : 'Thêm phiếu'}</h3>
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-fg-dim)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-fg)]"
                            onClick={resetForm}
                            aria-label="Đóng"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mã</span>
                                <input className={`${inputClass} w-full uppercase`} value={form.code} onChange={(e) => updateField('code', e.target.value)} required />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Loại</span>
                                <select className={`${inputClass} w-full`} value={form.type} onChange={(e) => updateField('type', e.target.value)}>
                                    <option value="Product">Sản phẩm</option>
                                    <option value="Shipping">Vận chuyển</option>
                                </select>
                            </label>
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Tên phiếu</span>
                            <input className={`${inputClass} w-full`} value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mô tả</span>
                            <textarea className={`${inputClass} min-h-20 w-full resize-y`} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Kiểu giảm</span>
                                <select className={`${inputClass} w-full`} value={form.discountType} onChange={(e) => updateField('discountType', e.target.value)}>
                                    <option value="Amount">Số tiền</option>
                                    <option value="Percent">Phần trăm</option>
                                    <option value="FreeShipping">Free ship</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giá trị</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.discountValue} onChange={(e) => updateField('discountValue', e.target.value)} disabled={form.discountType === 'FreeShipping'} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giảm tối đa</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.maxDiscountAmount} onChange={(e) => updateField('maxDiscountAmount', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Đơn tối thiểu</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.minOrderAmount} onChange={(e) => updateField('minOrderAmount', e.target.value)} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Số lượng</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.totalQuantity} onChange={(e) => updateField('totalQuantity', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mỗi user</span>
                                <input type="number" min="1" className={`${inputClass} w-full`} value={form.perUserLimit} onChange={(e) => updateField('perUserLimit', e.target.value)} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Bắt đầu</span>
                                <input type="datetime-local" className={`${inputClass} w-full`} value={form.startAt} onChange={(e) => updateField('startAt', e.target.value)} required />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Kết thúc</span>
                                <input type="datetime-local" className={`${inputClass} w-full`} value={form.endAt} onChange={(e) => updateField('endAt', e.target.value)} required />
                            </label>
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Phạm vi</span>
                            <select className={`${inputClass} w-full`} value={form.scopeType} onChange={(e) => updateField('scopeType', e.target.value)}>
                                <option value="All">Tất cả</option>
                                <option value="Product">Theo sản phẩm</option>
                                <option value="Category">Theo danh mục</option>
                                <option value="Brand">Theo thương hiệu</option>
                            </select>
                        </label>
                        {form.scopeType === 'Product' && (
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Product ID</span>
                                <input type="number" min="1" className={`${inputClass} w-full`} value={form.productId} onChange={(e) => updateField('productId', e.target.value)} />
                            </label>
                        )}
                        {form.scopeType === 'Category' && (
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Danh mục</span>
                                <select className={`${inputClass} w-full`} value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)}>
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                            </label>
                        )}
                        {form.scopeType === 'Brand' && (
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Thương hiệu</span>
                                <select className={`${inputClass} w-full`} value={form.brand} onChange={(e) => updateField('brand', e.target.value)}>
                                    <option value="">Chọn thương hiệu</option>
                                    {form.brand && !brands.includes(form.brand) && <option value={form.brand}>{form.brand}</option>}
                                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </label>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-[var(--color-fg)]">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} /> Bật</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublic} onChange={(e) => updateField('isPublic', e.target.checked)} /> Public</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAutoClaimable} onChange={(e) => updateField('isAutoClaimable', e.target.checked)} /> Tự nhận</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
                                <input type="checkbox" checked={form.isSpinReward} onChange={(e) => updateField('isSpinReward', e.target.checked)} />
                                Quà quay
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Trọng số quay</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.spinWeight} onChange={(e) => updateField('spinWeight', e.target.value)} disabled={!form.isSpinReward} />
                            </label>
                        </div>
                        <div className="grid gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                            <p className="mb-0 text-sm font-bold text-[var(--color-fg)]">Rule nâng cao</p>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giới hạn dùng/ngày</span>
                                    <input type="number" min="0" className={`${inputClass} w-full`} value={form.dailyUsageLimit} onChange={(e) => updateField('dailyUsageLimit', e.target.value)} />
                                </label>
                                <div className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Phương thức thanh toán</span>
                                    <div className="mb-2 text-xs font-semibold text-[var(--color-fg-muted)]">Không chọn mục nào = áp dụng tất cả phương thức</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-[var(--color-fg)]">
                                        {['StorePayment', 'BankTransfer', 'Momo', 'ShopeePay', 'ApplePay'].map((pm) => (
                                            <label key={pm} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(form.allowedPaymentMethods) && form.allowedPaymentMethods.includes(pm)}
                                                    onChange={(e) => {
                                                        const next = new Set(Array.isArray(form.allowedPaymentMethods) ? form.allowedPaymentMethods : []);
                                                        if (e.target.checked) next.add(pm); else next.delete(pm);
                                                        updateField('allowedPaymentMethods', Array.from(next));
                                                    }}
                                                />
                                                {pm}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]" onClick={resetForm}>Hủy</button>
                            <button type="submit" className="rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)] disabled:opacity-60" disabled={saving}>
                                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo phiếu'}
                            </button>
                        </div>
                    </form>
                </aside>
                </div>
                )}
            </div>
        </div>
    );
};

export default AdminCoupons;
