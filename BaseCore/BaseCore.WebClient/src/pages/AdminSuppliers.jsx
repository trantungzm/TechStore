import React, { useEffect, useMemo, useState } from 'react';
import { categoryApi, categorySupplierApi, supplierApi } from '../services/api';
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
    supplierType: x.supplierType ?? x.SupplierType ?? 'AuthorizedDistributor',
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
    supplierType: 'AuthorizedDistributor',
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
    const [categories, setCategories] = useState([]);
    const [categorySuppliers, setCategorySuppliers] = useState([]);

    const loadItems = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await supplierApi.getAll({ page: 1, pageSize: 200 });
            const data = res.data;
            const list = Array.isArray(data) ? data : data.items || data.Items || [];
            setItems(list.map(normalizeSupplier));
            const [categoryRes, mappingRes] = await Promise.all([categoryApi.getAll(), categorySupplierApi.getAll()]);
            setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : categoryRes.data?.items || []);
            setCategorySuppliers(Array.isArray(mappingRes.data) ? mappingRes.data : mappingRes.data?.items || []);
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

    const supplierMapByCategory = useMemo(() => {
        const map = new Map();
        categorySuppliers.forEach((item) => {
            const categoryId = Number(item.categoryId ?? item.CategoryId);
            if (!categoryId) return;
            if (!map.has(categoryId)) map.set(categoryId, []);
            map.get(categoryId).push(item);
        });
        map.forEach((list) => list.sort((a, b) => Number(a.sortOrder ?? a.SortOrder ?? 0) - Number(b.sortOrder ?? b.SortOrder ?? 0)));
        return map;
    }, [categorySuppliers]);

    const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const resetForm = () => setForm(emptyForm);

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
                supplierType: form.supplierType || 'AuthorizedDistributor',
                note: form.note.trim() || null,
                isActive: Boolean(form.isActive),
            };

            if (form.id) {
                await supplierApi.update(form.id, payload);
                toast('Da cap nhat nha cung cap', 'success');
            } else {
                await supplierApi.create(payload);
                toast('Da tao nha cung cap', 'success');
            }

            resetForm();
            await loadItems();
        } catch (err) {
            setError(readError(err, 'Khong luu duoc nha cung cap.'));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => setForm({ ...item });

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
        <div className="p-3 p-lg-4">
            <div className="row">
                <div className="col-lg-7 mb-3 mb-lg-0">
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title mb-0">Nha cung cap theo danh muc</h3>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>Danh muc</th>
                                            <th>Nha cung cap</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => {
                                            const categoryId = Number(category.id ?? category.Id);
                                            const mappings = supplierMapByCategory.get(categoryId) || [];
                                            return (
                                                <tr key={categoryId}>
                                                    <td className="font-weight-bold">{category.name ?? category.Name}</td>
                                                    <td>
                                                        {mappings.length ? mappings.map((mapping) => (
                                                            <span key={mapping.id ?? mapping.Id} className="badge badge-info mr-2">
                                                                {mapping.supplierName ?? mapping.SupplierName}
                                                            </span>
                                                        )) : <span className="text-muted">Chua cau hinh</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h3 className="card-title mb-0">Nha cung cap</h3>
                            <div className="d-flex align-items-center gap-2">
                                <input className="form-control form-control-sm" style={{ width: 240 }} placeholder="Tim nha cung cap..." value={query} onChange={(e) => setQuery(e.target.value)} />
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={loadItems} disabled={loading}>
                                    Lam moi
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {error && <div className="alert alert-danger m-3">{error}</div>}
                            {loading ? (
                                <div className="p-4 text-center">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped mb-0">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 120 }}>Ma</th>
                                                <th>Ten</th>
                                                <th style={{ width: 170 }}>Loai</th>
                                                <th style={{ width: 160 }}>Dien thoai</th>
                                                <th style={{ width: 110 }}>Trang thai</th>
                                                <th style={{ width: 150 }}>Thao tac</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="text-monospace">{item.code || '-'}</td>
                                                    <td>
                                                        <div className="font-weight-bold">{item.name}</div>
                                                        <div className="text-muted small text-truncate" style={{ maxWidth: 280 }}>
                                                            {item.contactPerson || item.address || '-'}
                                                        </div>
                                                    </td>
                                                    <td>{item.supplierType || '-'}</td>
                                                    <td>{item.phone || '-'}</td>
                                                    <td>
                                                        <span className={`badge ${item.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                            {item.isActive ? 'Dang hoat dong' : 'Tam dung'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)}>
                                                                Sua
                                                            </button>
                                                            <button type="button" className={`btn btn-sm ${item.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => handleToggleActive(item)} disabled={saving}>
                                                                {item.isActive ? 'Ngung' : 'Bat'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!filteredItems.length && (
                                                <tr>
                                                    <td colSpan="6" className="text-center text-muted py-4">
                                                        Khong co du lieu phu hop.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card card-primary">
                        <div className="card-header">
                            <h3 className="card-title mb-0">{form.id ? 'Cap nhat nha cung cap' : 'Tao nha cung cap'}</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Ma NCC</label>
                                    <input className="form-control" value={form.code} onChange={handleChange('code')} placeholder="Bo trong de tu tao" />
                                </div>
                                <div className="form-group">
                                    <label>Ten NCC</label>
                                    <input className="form-control" value={form.name} onChange={handleChange('name')} required />
                                </div>
                                <div className="form-group">
                                    <label>Dien thoai</label>
                                    <input className="form-control" value={form.phone} onChange={handleChange('phone')} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input className="form-control" value={form.email} onChange={handleChange('email')} />
                                </div>
                                <div className="form-group">
                                    <label>Dia chi</label>
                                    <input className="form-control" value={form.address} onChange={handleChange('address')} />
                                </div>
                                <div className="form-group">
                                    <label>Ma so thue</label>
                                    <input className="form-control" value={form.taxCode} onChange={handleChange('taxCode')} />
                                </div>
                                <div className="form-group">
                                    <label>Nguoi lien he</label>
                                    <input className="form-control" value={form.contactPerson} onChange={handleChange('contactPerson')} />
                                </div>
                                <div className="form-group">
                                    <label>Loai nha cung cap</label>
                                    <select className="form-control" value={form.supplierType} onChange={handleChange('supplierType')}>
                                        <option value="OfficialBrand">OfficialBrand</option>
                                        <option value="AuthorizedDistributor">AuthorizedDistributor</option>
                                        <option value="Tier1Distributor">Tier1Distributor</option>
                                        <option value="WholesalePartner">WholesalePartner</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ghi chu</label>
                                    <textarea className="form-control" rows="3" value={form.note} onChange={handleChange('note')} />
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
                                        <label className="custom-control-label" htmlFor="supplierIsActive">Kich hoat</label>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                        Dat lai
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Dang luu...' : form.id ? 'Cap nhat' : 'Tao moi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSuppliers;
