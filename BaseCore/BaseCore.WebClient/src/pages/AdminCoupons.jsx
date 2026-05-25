import React, { useEffect, useMemo, useState } from 'react';
import { categoryApi, couponApi } from '../services/api';

const inputClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-admin-brand focus:ring-2 focus:ring-blue-100';

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
    if (status === 'active' || (!status && coupon.isActive)) return ' Hoạt động';
    if (status === 'disabled' || status === 'inactive' || !coupon.isActive) return 'Tạm dừng';
    if (status === 'expired') return 'ết hạn';
    if (status === 'scheduled') return 'ắp diễn ra';
    return coupon.status || 'ạm dung';
};

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const activeCoupons = useMemo(() => coupons.filter((item) => item.status === 'Active' || item.isActive).length, [coupons]);

    useEffect(() => {
        loadData(page);
    }, [page]);

    const loadData = async (nextPage = page) => {
        setLoading(true);
        setError('');
        try {
            const [couponRes, statsRes, categoryRes] = await Promise.all([
                couponApi.getAll({ page: nextPage, pageSize }),
                couponApi.getStats(),
                categoryApi.getAll(),
            ]);
            const items = unwrapItems(couponRes.data);
            const meta = unwrapPageMeta(couponRes.data, items, nextPage, pageSize);
            setCoupons(items);
            setTotalCount(meta.totalCount);
            setTotalPages(meta.totalPages);
            if (meta.page && meta.page !== page) {
                setPage(meta.page);
            }
            setStats(statsRes.data || null);
            setCategories(unwrapItems(categoryRes.data));
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không thể tải danh sách phiếu giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(defaultForm());
        setError('');
        setSuccess('');
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
            scopeType: scope.scopeType || 'All',
            productId: scope.productId || '',
            categoryId: scope.categoryId || '',
            brand: scope.brand || '',
        });
        setError('');
        setSuccess('');
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
            discountValue: form.discountType === 'FreeShipping' ? 100 : Number(form.discountValue || 0),
            maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
            minOrderAmount: Number(form.minOrderAmount || 0),
            startAt: toApiDateTime(form.startAt),
            endAt: toApiDateTime(form.endAt),
            totalQuantity: Number(form.totalQuantity || 0),
            perUserLimit: Number(form.perUserLimit || 1),
            isActive: form.isActive,
            isPublic: form.isPublic,
            isAutoClaimable: form.isAutoClaimable,
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
            if (!editingId && page !== 1) {
                setPage(1);
            } else {
                await loadData(page);
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
            await loadData(page);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Không thể đổi trạng thái phiếu');
        }
    };

    const handleDelete = async (coupon) => {
        if (!window.confirm(`Xóa phiếu "${coupon.code}"? Phiếu đã có người nhận sẽ chỉ bị tắt.`)) return;
        setError('');
        try {
            await couponApi.delete(coupon.id);
            const nextTotal = Math.max(0, totalCount - 1);
            const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
            const nextPage = Math.min(page, nextTotalPages);
            if (nextPage !== page) {
                setPage(nextPage);
            } else {
                await loadData(nextPage);
            }
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Không thể xóa phiếu');
        }
    };

    const fromItem = coupons.length ? (page - 1) * pageSize + 1 : 0;
    const toItem = coupons.length ? (page - 1) * pageSize + coupons.length : 0;

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-admin-muted">Khuyến mãi</p>
                    <h2 className="mb-0 text-2xl font-bold text-admin-ink">Phiếu giảm giá / Voucher</h2>
                </div>
                <button type="button" className="rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600" onClick={resetForm}>
                    <i className="fas fa-plus mr-2"></i>
                    Thêm phiếu
                </button>
            </div>

            {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
            {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase text-admin-muted">Tổng phiếu</div>
                    <div className="mt-1 text-2xl font-extrabold text-admin-ink">{stats?.totalCoupons ?? coupons.length}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase text-admin-muted">Đang hoạt động</div>
                    <div className="mt-1 text-2xl font-extrabold text-admin-brand">{stats?.activeCoupons ?? activeCoupons}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase text-admin-muted">Đã nhận</div>
                    <div className="mt-1 text-2xl font-extrabold text-admin-ink">{stats?.totalClaimed ?? 0}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase text-admin-muted">Đã dùng</div>
                    <div className="mt-1 text-2xl font-extrabold text-admin-ink">{stats?.totalUsed ?? 0}</div>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-admin-ink">Danh sách phiếu</h3>
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <div className="py-12 text-center text-sm font-semibold text-admin-muted">Đang tải phiếu giảm giá...</div>
                        ) : (
                            <>
                            <div className="overflow-x-auto rounded-md border border-slate-200">
                                <table className="min-w-[920px] divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                        <tr>
                                            <th className="px-4 py-3">Mã phiếu</th>
                                            <th className="px-4 py-3">Loại</th>
                                            <th className="px-4 py-3">Giảm giá</th>
                                            <th className="px-4 py-3">Điều kiện</th>
                                            <th className="px-4 py-3">Lượt</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {coupons.map((coupon) => (
                                            <tr key={coupon.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-extrabold text-admin-ink">{coupon.code}</div>
                                                    <div className="text-xs text-admin-muted">{coupon.name}</div>
                                                </td>
                                                <td className="px-4 py-3">{coupon.type === 'Shipping' ? 'Vận chuyển' : 'Sản phẩm'}</td>
                                                <td className="px-4 py-3">
                                                    {coupon.discountType === 'FreeShipping' ? 'Miễn phí ship' : `${coupon.discountValue}${coupon.discountType === 'Percent' ? '%' : 'đ'}`}
                                                </td>
                                                <td className="px-4 py-3">{Number(coupon.minOrderAmount || 0).toLocaleString('vi-VN')}đ</td>
                                                <td className="px-4 py-3">{coupon.claimedQuantity || 0}/{coupon.totalQuantity || '∞'} nhận, {coupon.usedQuantity || 0} dùng</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${(coupon.status === 'Active' || coupon.isActive) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {getStatusLabel(coupon)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button type="button" className="h-9 w-9 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={() => handleToggle(coupon)} title="Bật/tắt">
                                                            <i className="fas fa-power-off"></i>
                                                        </button>
                                                        <button type="button" className="h-9 w-9 rounded-md bg-admin-brand text-white hover:bg-orange-600" onClick={() => editCoupon(coupon)} title="Sửa">
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
                            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-admin-muted sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Hiển thị {fromItem}-{toItem} trong {totalCount} phiếu
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={page <= 1}
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    >
                                        Trước
                                    </button>
                                    <span className="rounded-md bg-slate-100 px-3 py-2 font-semibold text-admin-ink">
                                        {page}/{totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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

                <aside className="rounded-md border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-admin-ink">{editingId ? 'Sửa phiếu' : 'Thêm phiếu'}</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Mã</span>
                                <input className={`${inputClass} w-full uppercase`} value={form.code} onChange={(e) => updateField('code', e.target.value)} required />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Loại</span>
                                <select className={`${inputClass} w-full`} value={form.type} onChange={(e) => updateField('type', e.target.value)}>
                                    <option value="Product">Sản phẩm</option>
                                    <option value="Shipping">Vận chuyển</option>
                                </select>
                            </label>
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-admin-ink">Tên phiếu</span>
                            <input className={`${inputClass} w-full`} value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-admin-ink">Mô tả</span>
                            <textarea className={`${inputClass} min-h-20 w-full resize-y`} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Kiểu giảm</span>
                                <select className={`${inputClass} w-full`} value={form.discountType} onChange={(e) => updateField('discountType', e.target.value)}>
                                    <option value="Amount">Số tiền</option>
                                    <option value="Percent">Phần trăm</option>
                                    <option value="FreeShipping">Free ship</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Giá trị</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.discountValue} onChange={(e) => updateField('discountValue', e.target.value)} disabled={form.discountType === 'FreeShipping'} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Giảm tối đa</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.maxDiscountAmount} onChange={(e) => updateField('maxDiscountAmount', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Đơn tối thiểu</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.minOrderAmount} onChange={(e) => updateField('minOrderAmount', e.target.value)} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Số lượng</span>
                                <input type="number" min="0" className={`${inputClass} w-full`} value={form.totalQuantity} onChange={(e) => updateField('totalQuantity', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Mỗi user</span>
                                <input type="number" min="1" className={`${inputClass} w-full`} value={form.perUserLimit} onChange={(e) => updateField('perUserLimit', e.target.value)} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Bắt đầu</span>
                                <input type="datetime-local" className={`${inputClass} w-full`} value={form.startAt} onChange={(e) => updateField('startAt', e.target.value)} required />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Kết thúc</span>
                                <input type="datetime-local" className={`${inputClass} w-full`} value={form.endAt} onChange={(e) => updateField('endAt', e.target.value)} required />
                            </label>
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-admin-ink">Phạm vi</span>
                            <select className={`${inputClass} w-full`} value={form.scopeType} onChange={(e) => updateField('scopeType', e.target.value)}>
                                <option value="All">Tất cả</option>
                                <option value="Product">Theo sản phẩm</option>
                                <option value="Category">Theo danh mục</option>
                                <option value="Brand">Theo thương hiệu</option>
                            </select>
                        </label>
                        {form.scopeType === 'Product' && (
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Product ID</span>
                                <input type="number" min="1" className={`${inputClass} w-full`} value={form.productId} onChange={(e) => updateField('productId', e.target.value)} />
                            </label>
                        )}
                        {form.scopeType === 'Category' && (
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Danh mục</span>
                                <select className={`${inputClass} w-full`} value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)}>
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                            </label>
                        )}
                        {form.scopeType === 'Brand' && (
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-admin-ink">Thương hiệu</span>
                                <input className={`${inputClass} w-full`} value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
                            </label>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-admin-ink">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} /> Bật</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublic} onChange={(e) => updateField('isPublic', e.target.checked)} /> Public</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAutoClaimable} onChange={(e) => updateField('isAutoClaimable', e.target.checked)} /> Tự nhận</label>
                        </div>
                        <div className="flex justify-end gap-2">
                            {editingId && <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetForm}>Hủy</button>}
                            <button type="submit" className="rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60" disabled={saving}>
                                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo phiếu'}
                            </button>
                        </div>
                    </form>
                </aside>
            </div>
        </div>
    );
};

export default AdminCoupons;
