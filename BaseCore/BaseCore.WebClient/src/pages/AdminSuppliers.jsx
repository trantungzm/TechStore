import React, { useEffect, useMemo, useState } from 'react';
import { supplierApi } from '../services/api';
import { toast } from '../utils/store';

const readError = (err, fallback) => err?.response?.data?.message || err?.response?.data?.detail || err?.message || fallback;

const normalizeSupplier = (x) => ({
    id: x.id ?? x.Id,
    supplierCode: x.supplierCode ?? x.SupplierCode ?? x.code ?? x.Code ?? '',
    code: x.supplierCode ?? x.SupplierCode ?? x.code ?? x.Code ?? '',
    name: x.name ?? x.Name ?? '',
    phone: x.phone ?? x.Phone ?? '',
    email: x.email ?? x.Email ?? '',
    address: x.address ?? x.Address ?? '',
    taxCode: x.taxCode ?? x.TaxCode ?? '',
    contactPerson: x.contactPerson ?? x.ContactPerson ?? '',
    note: x.note ?? x.Note ?? '',
    isActive: x.isActive ?? x.IsActive ?? true,
    createdAt: x.createdAt ?? x.CreatedAt ?? null,
    updatedAt: x.updatedAt ?? x.UpdatedAt ?? null,
});

const emptyForm = {
    id: null,
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    contactPerson: '',
    note: '',
    isActive: true,
};

const AdminSuppliers = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);

    const loadItems = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await supplierApi.getAll({ page: 1, pageSize: 200 });
            const data = res.data;
            const list = Array.isArray(data) ? data : data.items || data.Items || [];
            setItems(list.map(normalizeSupplier));
        } catch (err) {
            setError(readError(err, 'Khong tai duoc danh sach nha cung cap.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((x) =>
            String(x.code).toLowerCase().includes(q) ||
            String(x.name).toLowerCase().includes(q) ||
            String(x.phone).toLowerCase().includes(q) ||
            String(x.email).toLowerCase().includes(q)
        );
    }, [items, query]);

    const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const resetForm = () => {
        setForm(emptyForm);
        setShowForm(false);
    };

    const openCreateForm = () => {
        setForm(emptyForm);
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                code: form.code.trim() || null,
                supplierCode: form.code.trim() || null,
                name: form.name.trim(),
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
                address: form.address.trim() || null,
                taxCode: form.taxCode.trim() || null,
                contactPerson: form.contactPerson.trim() || null,
                supplierType: 'AuthorizedDistributor',
                note: form.note.trim() || null,
                isActive: Boolean(form.isActive),
            };

            if (form.id) {
                await supplierApi.update(form.id, payload);
                toast('Da cap nhat nha cung cap', 'success');
            } else {
                await supplierApi.create(payload);
                toast('Da them nha cung cap', 'success');
            }

            resetForm();
            await loadItems();
        } catch (err) {
            setError(readError(err, 'Khong luu duoc nha cung cap.'));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setForm({ ...item });
        setError('');
        setShowForm(true);
    };

    const handleToggleActive = async (item) => {
        const action = item.isActive ? 'Ngung hoat dong' : 'Kich hoat';
        if (!window.confirm(`${action} nha cung cap "${item.name}"?`)) return;
        setSaving(true);
        setError('');
        try {
            if (supplierApi.toggleActive) await supplierApi.toggleActive(item.id);
            else await supplierApi.delete(item.id);
            toast('Da cap nhat trang thai nha cung cap', 'success');
            await loadItems();
        } catch (err) {
            setError(readError(err, 'Khong cap nhat duoc nha cung cap.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-admin-muted">Kho hàng</p>
                    <h2 className="mb-0 text-2xl font-bold text-admin-ink">Nhà cung cấp</h2>
                </div>
                <button type="button" className="rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600" onClick={openCreateForm}>
                    <i className="fas fa-plus mr-2"></i>
                    Thêm nhà cung cấp
                </button>
            </div>

            {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                    <h3 className="mb-0 text-base font-bold text-admin-ink">Danh sách nhà cung cấp</h3>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-admin-brand focus:ring-2 focus:ring-blue-100 sm:min-w-[320px]"
                            placeholder="Tìm nhà cung cấp..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="button" className="rounded-md border border-admin-brand px-4 py-2 text-sm font-semibold text-admin-brand hover:bg-orange-50 disabled:opacity-60" onClick={loadItems} disabled={loading}>
                            Lam moi
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm font-semibold text-admin-muted">Đang tải nhà cung cấp...</div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-slate-200">
                            <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                    <tr>
                                        <th className="w-[16%] px-4 py-3">Mã</th>
                                        <th className="w-[22%] px-4 py-3">Tên nhà cung cấp</th>
                                        <th className="w-[13%] px-4 py-3">Điện thoại</th>
                                        <th className="w-[19%] px-4 py-3">Email</th>
                                        <th className="w-[16%] px-4 py-3">Địa chỉ</th>
                                        <th className="w-[16%] px-3 py-3">Trạng thái</th>
                                        <th className="w-[132px] px-3 py-3 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="truncate px-4 py-3 font-mono font-bold text-admin-ink">{item.code || '-'}</td>
                                            <td className="truncate px-4 py-3 font-bold text-admin-ink">{item.name}</td>
                                            <td className="truncate px-4 py-3">{item.phone || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className="block truncate">{item.email || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="block truncate">{item.address || '-'}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-block rounded-full px-2 py-1 text-[11px] font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                    {item.isActive ? ' Hoạt động' : 'Tạm dừng'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-end gap-1.5">
                                                    <button type="button" className="h-8 rounded-md bg-admin-brand px-2.5 text-xs font-semibold text-white hover:bg-orange-600" onClick={() => handleEdit(item)}>
                                                        Sửa
                                                    </button>
                                                    <button type="button" className={`h-8 rounded-md px-2.5 text-xs font-semibold ${item.isActive ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`} onClick={() => handleToggleActive(item)} disabled={saving}>
                                                        {item.isActive ? 'Ngừng' : 'Bật'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!filteredItems.length && (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-sm font-semibold text-admin-muted">
                                                Không có dữ liệu phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {showForm && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{form.id ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'}</h5>
                                    <button type="button" className="close" aria-label="Close" onClick={resetForm}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                    <label>Mã nhà cung cấp</label>
                                    <input className="form-control" value={form.code} onChange={handleChange('code')} placeholder="Bỏ trống để tự tạo" />
                                </div>
                                        <div className="form-group col-md-6">
                                    <label>Tên nhà cung cấp</label>
                                    <input className="form-control" value={form.name} onChange={handleChange('name')} required />
                                </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                    <label>Điện thoại</label>
                                    <input className="form-control" value={form.phone} onChange={handleChange('phone')} />
                                </div>
                                        <div className="form-group col-md-6">
                                    <label>Email</label>
                                    <input className="form-control" value={form.email} onChange={handleChange('email')} />
                                </div>
                                    </div>
                                <div className="form-group">
                                    <label>Địa chỉ</label>
                                    <input className="form-control" value={form.address} onChange={handleChange('address')} />
                                </div>
                                <div className="form-group">
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="supplierIsActive"
                                            checked={Boolean(form.isActive)}
                                            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                        />
                                        <label className="custom-control-label" htmlFor="supplierIsActive">Kích hoạt</label>
                                    </div>
                                </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Đóng</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Đang lưu...' : form.id ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSuppliers;
