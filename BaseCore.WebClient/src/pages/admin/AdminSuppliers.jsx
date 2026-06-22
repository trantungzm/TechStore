import React, { useMemo, useState } from 'react';
import { supplierApi } from '../../services/api';
import { toast, readApiError as readError } from '../../utils/store';
import { confirmDialog } from '../../utils/notify';
import { useSuppliers } from '../../hooks/useSuppliers';

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
    const { items, loading, error, setError, reload } = useSuppliers();
    const [saving, setSaving] = useState(false);
    const [query, setQuery] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);

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
                toast('Đã cập nhật nhà cung cấp', 'success');
            } else {
                await supplierApi.create(payload);
                toast('Đã thêm nhà cung cấp', 'success');
            }

            resetForm();
            await reload();
        } catch (err) {
            setError(readError(err, 'Không lưu được nhà cung cấp.'));
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
        const action = item.isActive ? 'Ngừng hoạt động' : 'Kích hoạt';
        if (!(await confirmDialog({ title: `${action} nhà cung cấp`, message: `${action} nhà cung cấp "${item.name}"?`, tone: item.isActive ? 'danger' : undefined, confirmText: action }))) return;
        setSaving(true);
        setError('');
        try {
            if (supplierApi.toggleActive) await supplierApi.toggleActive(item.id);
            else await supplierApi.delete(item.id);
            toast('Đã cập nhật trạng thái nhà cung cấp', 'success');
            await reload();
        } catch (err) {
            setError(readError(err, 'Không cập nhật được nhà cung cấp.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Kho hàng</p>
                    <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Nhà cung cấp</h2>
                </div>
                <button type="button" className="rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)]" onClick={openCreateForm}>
                    <i className="fas fa-plus mr-2"></i>
                    Thêm nhà cung cấp
                </button>
            </div>

            {error && <div className="mb-4 rounded-md border border-rose-200 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{error}</div>}

            <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                    <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Danh sách nhà cung cấp</h3>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            className="rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100 sm:min-w-[320px]"
                            placeholder="Tìm nhà cung cấp..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="button" className="rounded-md border border-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-60" onClick={reload} disabled={loading}>
                            Làm mới
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm font-semibold text-[var(--color-fg-muted)]">Đang tải nhà cung cấp...</div>
                    ) : (
                        <div className="ts-table-container">
                            <table className="ts-table">
                                <thead>
                                    <tr>
                                        <th className="ts-table-col-narrow">Mã</th>
                                        <th className="ts-table-col-wide">Tên nhà cung cấp</th>
                                        <th className="ts-table-col-medium ts-table-hide-mobile">Điện thoại</th>
                                        <th className="ts-table-col-medium ts-table-hide-tablet">Email</th>
                                        <th className="ts-table-col-medium ts-table-hide-tablet">Địa chỉ</th>
                                        <th className="ts-table-col-medium ts-table-hide-mobile">Trạng thái</th>
                                        <th className="ts-table-col-medium text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="truncate font-mono font-bold text-[var(--color-fg)]">{item.code || '-'}</td>
                                            <td className="truncate font-bold text-[var(--color-fg)]">{item.name}</td>
                                            <td className="ts-table-hide-mobile truncate">{item.phone || '-'}</td>
                                            <td className="ts-table-hide-tablet">
                                                <span className="block truncate">{item.email || '-'}</span>
                                            </td>
                                            <td className="ts-table-hide-tablet">
                                                <span className="block truncate">{item.address || '-'}</span>
                                            </td>
                                            <td className="ts-table-hide-mobile">
                                                <span className={`inline-block rounded-full px-2 py-1 text-[11px] font-bold ${item.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                                                    {item.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex justify-end gap-1.5">
                                                    <button type="button" className="h-8 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-2.5 text-xs font-semibold text-white hover:bg-[var(--color-primary)]" onClick={() => handleEdit(item)}>
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
                                            <td colSpan="7" className="px-4 py-8 text-center text-sm font-semibold text-[var(--color-fg-muted)]">
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
                <div className="fixed bottom-0 left-0 right-0 top-14 z-[70] flex items-center justify-center bg-black/70 px-4 pb-8 pt-4 backdrop-blur-sm lg:left-64" onClick={resetForm}>
                    <div className="w-full max-w-2xl overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] font-sans shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                                <h5 className="mb-0 text-lg font-bold text-[var(--color-fg)]">{form.id ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'}</h5>
                                <button type="button" aria-label="Đóng" onClick={resetForm} className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">Mã nhà cung cấp</span>
                                    <input className="ts-input font-sans" value={form.code} onChange={handleChange('code')} placeholder="Bỏ trống để tự tạo" />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">Tên nhà cung cấp *</span>
                                    <input className="ts-input font-sans" value={form.name} onChange={handleChange('name')} required />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">Điện thoại</span>
                                    <input className="ts-input font-sans" value={form.phone} onChange={handleChange('phone')} />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">Email</span>
                                    <input className="ts-input font-sans" value={form.email} onChange={handleChange('email')} />
                                </label>
                                <label className="block md:col-span-2">
                                    <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">Địa chỉ</span>
                                    <input className="ts-input font-sans" value={form.address} onChange={handleChange('address')} />
                                </label>
                                <label className="inline-flex items-center gap-2 md:col-span-2">
                                    <input
                                        type="checkbox"
                                        id="supplierIsActive"
                                        checked={Boolean(form.isActive)}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                        className="h-4 w-4 accent-[var(--color-primary)]"
                                    />
                                    <span className="text-sm font-semibold text-[var(--color-fg)]">Kích hoạt</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">
                                <button type="button" className="ts-btn ts-btn-ghost text-xs font-semibold" onClick={resetForm}>Đóng</button>
                                <button type="submit" className="ts-btn ts-btn-primary text-xs font-semibold" disabled={saving}>
                                    {saving ? <><i className="fas fa-spinner fa-spin"></i>Đang lưu...</> : form.id ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSuppliers;
