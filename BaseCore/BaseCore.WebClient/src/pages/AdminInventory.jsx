import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { categoryApi, categorySupplierApi, inventoryApi, productApi } from '../services/api';
import { toast } from '../utils/store';
import AdminFilterDropdown from '../components/AdminFilterDropdown';
import { useAuth } from '../contexts/AuthContext';

const STOCK_STATUS_LABELS = {
    InStock: 'Con trong kho',
    Reserved: 'Da giu hang',
    Sold: 'Da ban',
    Returned: 'Khach tra',
    Repairing: 'Dang sua',
    Warranty: 'Dang bao hanh',
    Damaged: 'Hu hong',
    Lost: 'That lac',
};

const stockStatusText = (value) => STOCK_STATUS_LABELS[value] || value || 'Khong ro';

const normalizeStockItem = (x) => ({
    id: x.id ?? x.Id,
    productId: x.productId ?? x.ProductId,
    productName: x.productName ?? x.ProductName,
    serialOrImei: x.serialOrImei ?? x.SerialOrImei,
    status: x.status ?? x.Status,
    receivedAt: x.receivedAt ?? x.ReceivedAt,
    soldAt: x.soldAt ?? x.SoldAt,
});

const readError = (err, fallback) => {
    const data = err?.response?.data;
    return data?.message || data?.detail || data?.title || err?.message || fallback;
};

const AdminInventory = () => {
    const { user } = useAuth();
    const location = useLocation();
    const role = user?.role || '';
    const canReceive = ['Admin', 'Warehouse'].includes(role);
    const canReturn = ['Admin', 'Technical'].includes(role);

    const [products, setProducts] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filters, setFilters] = useState({ keyword: '', status: '', productId: '', minDaysInStock: '' });
    const [serialQuickSearch, setSerialQuickSearch] = useState('');
    const [stockPage, setStockPage] = useState(1);
    const [stockPageSize] = useState(10);
    const [productSearch, setProductSearch] = useState('');
    const [returnLookup, setReturnLookup] = useState({ loading: false, data: null, error: '' });
    const [activeLeftPanel, setActiveLeftPanel] = useState(canReceive ? 'receive' : 'return');
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        categoryId: '',
        supplierId: '',
        productId: '',
        quantity: 1,
        unitCost: 0,
        serialsText: '',
    });

    const [returnForm, setReturnForm] = useState({
        serialOrImei: '',
        reason: '',
        statusAfter: 'InStock',
    });

    const selectedProduct = useMemo(() => {
        const id = Number(form.productId);
        return id ? products.find((p) => Number(p.id ?? p.Id) === id) || null : null;
    }, [form.productId, products]);

    const requiresSerialTracking = Boolean(selectedProduct?.requiresSerialTracking ?? selectedProduct?.RequiresSerialTracking);

    const selectedSupplier = useMemo(() => {
        const id = Number(form.supplierId);
        return id ? suppliers.find((s) => Number(s.id ?? s.Id) === id) || null : null;
    }, [form.supplierId, suppliers]);

    const serials = useMemo(
        () => form.serialsText.split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
        [form.serialsText]
    );

    const productNameById = useMemo(() => {
        const map = new Map();
        products.forEach((p) => {
            const id = Number(p.id ?? p.Id);
            if (id) map.set(id, String(p.name ?? p.Name ?? `#${id}`));
        });
        return map;
    }, [products]);

    const loadProducts = async () => {
        const res = await productApi.getAll({ page: 1, pageSize: 200 });
        const data = res.data;
        setProducts(Array.isArray(data) ? data : data.items || data.Items || []);
    };

    const loadCategories = async () => {
        const res = await categoryApi.getAll();
        const data = res.data;
        setCategories(Array.isArray(data) ? data : data.items || data.Items || []);
    };

    const loadSuppliersByCategory = async (categoryId) => {
        if (!categoryId) {
            setSuppliers([]);
            return;
        }

        const res = await categorySupplierApi.getByCategory(categoryId);
        const data = res.data;
        const mappings = Array.isArray(data) ? data : data.items || data.Items || [];
        setSuppliers(mappings.map((item) => ({
            id: item.supplierId ?? item.SupplierId,
            name: item.supplierName ?? item.SupplierName,
            code: item.supplierCode ?? item.SupplierCode,
            supplierType: item.supplierType ?? item.SupplierType,
        })));
    };

    const loadStock = async () => {
        const res = await inventoryApi.getStockItems();
        setStockItems(Array.isArray(res.data) ? res.data : []);
    };

    const loadAll = async () => {
        setLoading(true);
        setError('');
        try {
            await Promise.all([loadProducts(), loadCategories(), loadStock()]);
        } catch (err) {
            setError(readError(err, 'Khong tai duoc du lieu kho.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    useEffect(() => {
        loadSuppliersByCategory(form.categoryId).catch((err) => setError(readError(err, 'Khong tai duoc nha cung cap theo danh muc.')));
        setForm((prev) => ({ ...prev, supplierId: '', productId: '' }));
    }, [form.categoryId]);

    useEffect(() => {
        if (location.pathname.includes('/returns')) {
            setActiveLeftPanel('return');
            return;
        }
        if (location.pathname.includes('/receipts')) {
            setActiveLeftPanel(canReceive ? 'receive' : 'return');
            return;
        }
        if (!canReceive) setActiveLeftPanel('return');
    }, [location.pathname, canReceive]);

    useEffect(() => {
        setStockPage(1);
    }, [filters.keyword, filters.status, filters.productId, filters.minDaysInStock, serialQuickSearch]);

    useEffect(() => {
        const serial = String(returnForm.serialOrImei || '').trim();
        if (!serial) {
            setReturnLookup({ loading: false, data: null, error: '' });
            return undefined;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            setReturnLookup({ loading: true, data: null, error: '' });
            try {
                const res = await inventoryApi.lookupStockItem(serial);
                if (!cancelled) setReturnLookup({ loading: false, data: res.data || null, error: '' });
            } catch (err) {
                if (cancelled) return;
                if (err?.response?.status === 404) {
                    setReturnLookup({ loading: false, data: null, error: 'Khong tim thay Serial/IMEI' });
                    return;
                }
                setReturnLookup({ loading: false, data: null, error: readError(err, 'Khong tra cuu duoc Serial/IMEI') });
            }
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [returnForm.serialOrImei]);

    const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleCreateReceipt = async (e) => {
        e.preventDefault();
        const productId = Number(form.productId);
        const quantity = Number(form.quantity);
        const unitCost = Number(form.unitCost);
        if (!productId || quantity <= 0) return;

        setSubmitting(true);
        setError('');
        try {
            await inventoryApi.createReceipt({
                categoryId: Number(form.categoryId),
                supplierId: Number(form.supplierId),
                lines: [{ productId, quantity, unitCost, serials: requiresSerialTracking ? serials : [] }],
            });
            setForm((prev) => ({ ...prev, quantity: 1, unitCost: 0, serialsText: '' }));
            await loadAll();
            toast(requiresSerialTracking ? 'Da nhap kho va tao serial/IMEI' : 'Da nhap kho', 'success');
        } catch (err) {
            setError(readError(err, 'Khong tao duoc phieu nhap.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (e) => {
        e.preventDefault();
        if (!returnForm.serialOrImei.trim()) return;

        setSubmitting(true);
        setError('');
        try {
            await inventoryApi.returnItem({
                serialOrImei: returnForm.serialOrImei.trim(),
                reason: returnForm.reason.trim() || null,
                statusAfter: returnForm.statusAfter || 'InStock',
                condition: returnForm.statusAfter === 'Damaged' ? 'Damaged' : 'Used',
            });
            setReturnForm({ serialOrImei: '', reason: '', statusAfter: 'InStock' });
            await loadAll();
            toast('Da xu ly hang tra', 'success');
        } catch (err) {
            setError(readError(err, 'Khong xu ly duoc hang tra.'));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStockItems = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const status = filters.status.trim().toLowerCase();
        const pid = filters.productId ? Number(filters.productId) : null;
        const quick = serialQuickSearch.trim().toLowerCase();
        const minDays = Number(filters.minDaysInStock || 0);
        const now = Date.now();

        return stockItems.filter((raw) => {
            const s = normalizeStockItem(raw);
            if (pid && Number(s.productId) !== pid) return false;
            const itemStatus = String(s.status || '').toLowerCase();
            if (status && itemStatus !== status) return false;

            if (minDays > 0) {
                if (!status && itemStatus !== 'instock') return false;
                const receivedTs = Date.parse(String(s.receivedAt || ''));
                if (!Number.isFinite(receivedTs)) return false;
                const days = Math.floor((now - receivedTs) / 86400000);
                if (days < minDays) return false;
            }

            const serial = String(s.serialOrImei || '').toLowerCase();
            if (quick && !serial.includes(quick)) return false;
            return !keyword || serial.includes(keyword);
        });
    }, [stockItems, filters, serialQuickSearch]);

    const totalStockPages = Math.max(1, Math.ceil(filteredStockItems.length / stockPageSize));
    const pagedStockItems = filteredStockItems.slice((stockPage - 1) * stockPageSize, stockPage * stockPageSize);

    useEffect(() => {
        setStockPage((p) => Math.min(Math.max(1, p), totalStockPages));
    }, [totalStockPages]);

    const productOptions = useMemo(() => {
        const q = productSearch.trim().toLowerCase();
        const categoryId = Number(form.categoryId || 0);
        const list = products
            .filter((p) => !categoryId || Number(p.categoryId ?? p.CategoryId) === categoryId)
            .slice()
            .sort((a, b) => String(a.name ?? a.Name ?? '').localeCompare(String(b.name ?? b.Name ?? '')));
        return (q
            ? list.filter((p) => String(p.name ?? p.Name ?? '').toLowerCase().includes(q) || String(p.id ?? p.Id).includes(q))
            : list
        ).slice(0, 120);
    }, [products, productSearch, form.categoryId]);

    const activeFilterCount =
        (filters.keyword.trim() ? 1 : 0) +
        (filters.status ? 1 : 0) +
        (filters.productId ? 1 : 0) +
        (String(filters.minDaysInStock || '').trim() ? 1 : 0);

    return (
        <div className="row">
            <div className="col-lg-4">
                <div className="btn-group w-100 mb-3">
                    {canReceive && (
                        <button
                            type="button"
                            className={`btn ${activeLeftPanel === 'receive' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveLeftPanel('receive')}
                        >
                            Nhap/xuat kho
                        </button>
                    )}
                    {canReturn && (
                        <button
                            type="button"
                            className={`btn ${activeLeftPanel === 'return' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setActiveLeftPanel('return')}
                        >
                            Tra hang / nhap lai
                        </button>
                    )}
                </div>

                {activeLeftPanel === 'receive' && canReceive ? (
                    <div className="card card-primary">
                        <div className="card-header">
                            <h3 className="card-title">Nhap/xuat kho theo phieu</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleCreateReceipt}>
                                <div className="form-group">
                                    <label>Danh muc</label>
                                    <select className="form-control" value={form.categoryId} onChange={handleChange('categoryId')} required>
                                        <option value="">-- Chon danh muc --</option>
                                        {categories.map((category) => (
                                            <option key={category.id ?? category.Id} value={category.id ?? category.Id}>
                                                {category.name ?? category.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nha cung cap</label>
                                    <select
                                        className="form-control"
                                        value={form.supplierId}
                                        onChange={handleChange('supplierId')}
                                        required
                                        disabled={!form.categoryId || suppliers.length === 0}
                                    >
                                        <option value="">-- Chon nha cung cap --</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id ?? s.Id} value={s.id ?? s.Id}>
                                                {s.name ?? s.Name} {s.code ? `(${s.code})` : s.Code ? `(${s.Code})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedSupplier && (
                                        <small className="text-muted d-block mt-1">
                                            {[selectedSupplier.phone || selectedSupplier.Phone, selectedSupplier.email || selectedSupplier.Email].filter(Boolean).join(' - ')}
                                        </small>
                                    )}
                                    {form.categoryId && suppliers.length === 0 && <small className="text-muted d-block mt-1">Danh muc nay chua co nha cung cap.</small>}
                                </div>
                                <div className="form-group">
                                    <label>San pham</label>
                                    <input className="form-control mb-2" placeholder="Tim san pham..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} disabled={!form.categoryId} />
                                    <select className="form-control" value={form.productId} onChange={handleChange('productId')} required disabled={!form.categoryId}>
                                        <option value="">-- Chon san pham --</option>
                                        {productOptions.map((p) => (
                                            <option key={p.id ?? p.Id} value={p.id ?? p.Id}>
                                                {p.name ?? p.Name} (ID: {p.id ?? p.Id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-6">
                                        <label>So luong</label>
                                        <input className="form-control" type="number" min="1" value={form.quantity} onChange={handleChange('quantity')} required />
                                    </div>
                                    <div className="form-group col-6">
                                        <label>Gia nhap</label>
                                        <input className="form-control" type="number" min="0" value={form.unitCost} onChange={handleChange('unitCost')} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Serial/IMEI (moi dong mot ma)</label>
                                    <textarea
                                        className="form-control"
                                        rows="6"
                                        value={form.serialsText}
                                        onChange={handleChange('serialsText')}
                                        placeholder={'356938035643809\n356938035643810'}
                                        disabled={!selectedProduct || !requiresSerialTracking}
                                    />
                                    {selectedProduct && requiresSerialTracking && (
                                        <small className="text-muted">San pham nay bat buoc co Serial/IMEI. Vui long nhap dung {form.quantity} dong.</small>
                                    )}
                                    {selectedProduct && !requiresSerialTracking && (
                                        <small className="text-muted">San pham nay khong bat buoc Serial/IMEI.</small>
                                    )}
                                </div>
                                <button className="btn btn-primary btn-block" disabled={submitting || loading}>
                                    {submitting ? 'Dang luu...' : 'Tao phieu nhap'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : activeLeftPanel === 'return' && canReturn ? (
                    <div className="card card-warning">
                        <div className="card-header">
                            <h3 className="card-title">Tra hang / nhap lai kho</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleReturn}>
                                <div className="form-group">
                                    <label>Serial/IMEI</label>
                                    <input className="form-control" value={returnForm.serialOrImei} onChange={(e) => setReturnForm((p) => ({ ...p, serialOrImei: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Trang thai sau xu ly</label>
                                    <select className="form-control" value={returnForm.statusAfter} onChange={(e) => setReturnForm((p) => ({ ...p, statusAfter: e.target.value }))}>
                                        <option value="InStock">Con trong kho (ban lai)</option>
                                        <option value="Damaged">Hu hong (khong ban)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ly do</label>
                                    <input className="form-control" value={returnForm.reason} onChange={(e) => setReturnForm((p) => ({ ...p, reason: e.target.value }))} />
                                </div>
                                {(returnLookup.loading || returnLookup.error || returnLookup.data) && (
                                    <div className="border rounded p-2 bg-light mb-3">
                                        {returnLookup.loading ? (
                                            <div className="text-muted">Dang tra cuu serial...</div>
                                        ) : returnLookup.error ? (
                                            <div className="text-danger">{returnLookup.error}</div>
                                        ) : (
                                            <>
                                                <div className="font-weight-bold">{returnLookup.data?.productName || '-'}</div>
                                                <div className="text-muted small">Trang thai: <span className="text-monospace">{stockStatusText(returnLookup.data?.status)}</span></div>
                                                <div className="text-muted small">Ban luc: {returnLookup.data?.soldAt ? new Date(returnLookup.data.soldAt).toLocaleString() : '-'}</div>
                                                <div className="text-muted small">Don hang: {returnLookup.data?.orderCode || (returnLookup.data?.orderId ? `#${returnLookup.data.orderId}` : '-')}</div>
                                                <div className="text-muted small">Khach hang: {returnLookup.data?.customerName || '-'} {returnLookup.data?.customerPhone ? `(${returnLookup.data.customerPhone})` : ''}</div>
                                            </>
                                        )}
                                    </div>
                                )}
                                <button className="btn btn-warning btn-block" disabled={submitting}>
                                    {submitting ? 'Dang xu ly...' : 'Xac nhan nhap lai'}
                                </button>
                                <small className="text-muted d-block mt-2">Chi xu ly nhap lai khi serial da ban va yeu cau tra hang duoc duyet.</small>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-info">Khong co quyen truy cap chuc nang nay.</div>
                )}
            </div>

            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Ton kho theo Serial/IMEI</h3>
                        <div className="card-tools">
                            <input className="form-control form-control-sm d-inline-block mr-2" style={{ width: 240 }} placeholder="Tim nhanh serial..." value={serialQuickSearch} onChange={(e) => setSerialQuickSearch(e.target.value)} />
                            <AdminFilterDropdown open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen} label="Bo loc" activeCount={activeFilterCount}>
                                <form onSubmit={(e) => { e.preventDefault(); setIsFilterMenuOpen(false); }}>
                                    <div className="form-group">
                                        <label>Serial/IMEI</label>
                                        <input className="form-control" value={filters.keyword} onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label>Trang thai</label>
                                        <select className="form-control" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                                            <option value="">Tat ca</option>
                                            {Object.entries(STOCK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>So ngay ton toi thieu</label>
                                        <input className="form-control" type="number" min="0" value={filters.minDaysInStock} onChange={(e) => setFilters((p) => ({ ...p, minDaysInStock: e.target.value }))} placeholder="Vi du: 90" />
                                        <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setFilters((p) => ({ ...p, minDaysInStock: '90', status: p.status || 'InStock' }))}>
                                            {'>= 90 ngay'}
                                        </button>
                                    </div>
                                    <div className="form-group">
                                        <label>San pham</label>
                                        <select className="form-control" value={filters.productId} onChange={(e) => setFilters((p) => ({ ...p, productId: e.target.value }))}>
                                            <option value="">Tat ca</option>
                                            {products.map((p) => <option key={p.id ?? p.Id} value={p.id ?? p.Id}>{(p.name ?? p.Name) || `#${p.id ?? p.Id}`}</option>)}
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setFilters({ keyword: '', status: '', productId: '', minDaysInStock: '' })}>Xoa loc</button>
                                        <button type="submit" className="btn btn-primary">Dong</button>
                                    </div>
                                </form>
                            </AdminFilterDropdown>
                            <button className="btn btn-sm btn-outline-primary" onClick={loadAll} disabled={loading}>Lam moi</button>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-4 text-center"><div className="spinner-border text-primary"></div></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 80 }}>ID</th>
                                            <th style={{ width: 240 }}>San pham</th>
                                            <th style={{ width: 260 }}>Serial/IMEI</th>
                                            <th style={{ width: 130 }}>Trang thai</th>
                                            <th style={{ width: 200 }}>Ngay nhap</th>
                                            <th style={{ width: 200 }}>Ngay ban</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedStockItems.map((raw) => {
                                            const s = normalizeStockItem(raw);
                                            const productName = s.productName || productNameById.get(Number(s.productId)) || `#${s.productId}`;
                                            return (
                                                <tr key={s.id}>
                                                    <td>{s.id}</td>
                                                    <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productName}</td>
                                                    <td className="text-monospace" style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.serialOrImei}</td>
                                                    <td><span className="badge badge-secondary">{stockStatusText(s.status)}</span></td>
                                                    <td>{s.receivedAt ? new Date(s.receivedAt).toLocaleString() : '-'}</td>
                                                    <td>{s.soldAt ? new Date(s.soldAt).toLocaleString() : '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="d-flex justify-content-between align-items-center p-2 border-top">
                                    <div className="text-muted small">
                                        Hien thi {(stockPage - 1) * stockPageSize + 1}-{Math.min(stockPage * stockPageSize, filteredStockItems.length)} / {filteredStockItems.length}
                                    </div>
                                    <div className="btn-group">
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStockPage((p) => Math.max(1, p - 1))} disabled={stockPage <= 1}>Truoc</button>
                                        <button type="button" className="btn btn-sm btn-outline-secondary" disabled>Trang {stockPage} / {totalStockPages}</button>
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStockPage((p) => Math.min(totalStockPages, p + 1))} disabled={stockPage >= totalStockPages}>Sau</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;
