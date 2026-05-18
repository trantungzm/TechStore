import React, { useEffect, useMemo, useState } from 'react';
import { inventoryApi, productApi } from '../services/api';
import { toast } from '../utils/store';
import AdminFilterDropdown from '../components/AdminFilterDropdown';

const STOCK_STATUS_LABELS = {
    InStock: 'Còn trong kho',
    Reserved: 'Đã giữ hàng',
    Sold: 'Đã bán',
    Returned: 'Khách trả',
    Repairing: 'Đang sửa',
    Warranty: 'Đang bảo hành',
    Damaged: 'Hư hỏng',
    Lost: 'Thất lạc',
};

const stockStatusText = (value) => STOCK_STATUS_LABELS[value] || value || 'Không rõ';

const AdminInventory = () => {
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
    const [supplierSuggestions, setSupplierSuggestions] = useState(() => {
        try {
            const raw = localStorage.getItem('inventorySupplierSuggestions');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return [];
        }
    });
    const [returnLookup, setReturnLookup] = useState({ loading: false, data: null, error: '' });
    const [activeLeftPanel, setActiveLeftPanel] = useState('receive');

    const [form, setForm] = useState({
        supplierName: '',
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
        if (!id) return null;
        return products.find((p) => Number(p.id ?? p.Id) === id) || null;
    }, [form.productId, products]);

    const productNameById = useMemo(() => {
        const map = new Map();
        products.forEach((p) => {
            const id = Number(p.id ?? p.Id);
            if (!id) return;
            map.set(id, String(p.name ?? p.Name ?? `#${id}`));
        });
        return map;
    }, [products]);

    const requiresSerialTracking = useMemo(() => {
        if (!selectedProduct) return false;
        return Boolean(selectedProduct.requiresSerialTracking ?? selectedProduct.RequiresSerialTracking);
    }, [selectedProduct]);

    const loadProducts = async () => {
        const res = await productApi.getAll({ page: 1, pageSize: 200 });
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.items || data.Items || []);
        setProducts(list);
    };

    const loadStock = async () => {
        const res = await inventoryApi.getStockItems();
        setStockItems(Array.isArray(res.data) ? res.data : []);
    };

    const loadAll = async () => {
        setLoading(true);
        setError('');
        try {
            await Promise.all([loadProducts(), loadStock()]);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không tải được dữ liệu kho.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    useEffect(() => {
        setStockPage(1);
    }, [filters.keyword, filters.status, filters.productId, filters.minDaysInStock, serialQuickSearch]);

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const serials = useMemo(() => {
        return form.serialsText
            .split(/\r?\n/)
            .map((x) => x.trim())
            .filter(Boolean);
    }, [form.serialsText]);

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
                supplierName: form.supplierName.trim(),
                lines: [
                    {
                        productId,
                        quantity,
                        unitCost,
                        serials: requiresSerialTracking ? serials : [],
                    },
                ],
            });
            setForm((prev) => ({ ...prev, quantity: 1, unitCost: 0, serialsText: '' }));
            await loadAll();
            toast(requiresSerialTracking ? 'Đã nhập kho và tạo serial/IMEI' : 'Đã nhập kho', 'success');

            const supplier = String(form.supplierName || '').trim();
            if (supplier) {
                setSupplierSuggestions((prev) => {
                    const merged = [supplier, ...prev.filter((x) => String(x).toLowerCase() !== supplier.toLowerCase())].slice(0, 12);
                    localStorage.setItem('inventorySupplierSuggestions', JSON.stringify(merged));
                    return merged;
                });
            }
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không tạo được phiếu nhập.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const serial = String(returnForm.serialOrImei || '').trim();
        if (!serial) {
            setReturnLookup({ loading: false, data: null, error: '' });
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setReturnLookup({ loading: true, data: null, error: '' });
            try {
                const res = await inventoryApi.lookupStockItem(serial);
                if (cancelled) return;
                setReturnLookup({ loading: false, data: res.data || null, error: '' });
            } catch (err) {
                if (cancelled) return;
                const status = err?.response?.status;
                if (status === 404) {
                    setReturnLookup({ loading: false, data: null, error: 'Không tìm thấy Serial/IMEI' });
                    return;
                }
                const data = err?.response?.data;
                setReturnLookup({ loading: false, data: null, error: data?.message || data?.detail || data?.title || 'Không tra cứu được Serial/IMEI' });
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [returnForm.serialOrImei]);

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
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không xử lý được hàng trả.');
        } finally {
            setSubmitting(false);
        }
    };

    const normalizeStockItem = (x) => ({
        id: x.id ?? x.Id,
        productId: x.productId ?? x.ProductId,
        productName: x.productName ?? x.ProductName,
        serialOrImei: x.serialOrImei ?? x.SerialOrImei,
        status: x.status ?? x.Status,
        receivedAt: x.receivedAt ?? x.ReceivedAt,
        soldAt: x.soldAt ?? x.SoldAt,
    });

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
                const days = Math.floor((now - receivedTs) / (24 * 60 * 60 * 1000));
                if (days < minDays) return false;
            }

            const serial = String(s.serialOrImei || '').toLowerCase();
            if (quick && !serial.includes(quick)) return false;
            if (!keyword) return true;
            return serial.includes(keyword);
        });
    }, [stockItems, filters.keyword, filters.status, filters.productId, filters.minDaysInStock, serialQuickSearch]);

    const totalStockPages = useMemo(() => Math.max(1, Math.ceil(filteredStockItems.length / stockPageSize)), [filteredStockItems.length, stockPageSize]);

    useEffect(() => setStockPage((p) => Math.min(Math.max(1, p), totalStockPages)), [totalStockPages]);

    const pagedStockItems = useMemo(() => {
        const start = (stockPage - 1) * stockPageSize;
        return filteredStockItems.slice(start, start + stockPageSize);
    }, [filteredStockItems, stockPage, stockPageSize]);

    const productOptions = useMemo(() => {
        const q = productSearch.trim().toLowerCase();
        const list = products.slice().sort((a, b) => String(a.name ?? a.Name ?? '').localeCompare(String(b.name ?? b.Name ?? '')));
        const filtered = q
            ? list.filter((p) => String(p.name ?? p.Name ?? '').toLowerCase().includes(q) || String(p.id ?? p.Id).includes(q))
            : list;
        return filtered.slice(0, 120);
    }, [products, productSearch]);

    const activeFilterCount =
        (filters.keyword.trim() ? 1 : 0) +
        (filters.status ? 1 : 0) +
        (filters.productId ? 1 : 0) +
        (String(filters.minDaysInStock || '').trim() ? 1 : 0);

    return (
        <div className="row">
            <div className="col-lg-4">
                <div className="btn-group w-100 mb-3">
                    <button
                        type="button"
                        className={`btn ${activeLeftPanel === 'receive' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveLeftPanel('receive')}
                    >
                        Nhập hàng
                    </button>
                    <button
                        type="button"
                        className={`btn ${activeLeftPanel === 'return' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => setActiveLeftPanel('return')}
                    >
                        Trả hàng / nhập lại
                    </button>
                </div>

                {activeLeftPanel === 'receive' ? (
                    <div className="card card-primary">
                        <div className="card-header">
                            <h3 className="card-title">Nhập hàng theo phiếu</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleCreateReceipt}>
                                <div className="form-group">
                                    <label>Nhà cung cấp</label>
                                    <input
                                        className="form-control"
                                        value={form.supplierName}
                                        onChange={handleChange('supplierName')}
                                        list="inventorySupplierSuggestions"
                                        required
                                    />
                                    <datalist id="inventorySupplierSuggestions">
                                        {supplierSuggestions.map((x) => (
                                            <option key={x} value={x} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="form-group">
                                    <label>Sản phẩm</label>
                                    <input
                                        className="form-control mb-2"
                                        placeholder="Tìm sản phẩm..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                    <select className="form-control" value={form.productId} onChange={handleChange('productId')} required>
                                        <option value="">-- Chọn sản phẩm --</option>
                                        {productOptions.map((p) => (
                                            <option key={p.id ?? p.Id} value={p.id ?? p.Id}>
                                                {p.name ?? p.Name} (ID: {p.id ?? p.Id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-6">
                                        <label>Số lượng</label>
                                        <input
                                            className="form-control"
                                            type="number"
                                            min="1"
                                            value={form.quantity}
                                            onChange={handleChange('quantity')}
                                            required
                                        />
                                    </div>
                                    <div className="form-group col-6">
                                        <label>Giá nhập</label>
                                        <input className="form-control" type="number" min="0" value={form.unitCost} onChange={handleChange('unitCost')} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Serial/IMEI (mỗi dòng một mã)</label>
                                    <textarea
                                        className="form-control"
                                        rows="6"
                                        value={form.serialsText}
                                        onChange={handleChange('serialsText')}
                                        placeholder="356938035643809&#10;356938035643810"
                                        disabled={!selectedProduct || !requiresSerialTracking}
                                    />
                                    {selectedProduct && requiresSerialTracking && (
                                        <small className="text-muted">
                                            Sản phẩm này bắt buộc có Serial/IMEI. Vui lòng nhập đúng {form.quantity} dòng.
                                        </small>
                                    )}
                                    {selectedProduct && !requiresSerialTracking && (
                                        <small className="text-muted">
                                            Sản phẩm này không bắt buộc Serial/IMEI.
                                        </small>
                                    )}
                                </div>
                                <button className="btn btn-primary btn-block" disabled={submitting || loading}>
                                    {submitting ? 'Đang lưu...' : 'Tạo phiếu nhập'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="card card-warning">
                        <div className="card-header">
                            <h3 className="card-title">Trả hàng / nhập lại kho</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleReturn}>
                                <div className="form-group">
                                    <label>Serial/IMEI</label>
                                    <input
                                        className="form-control"
                                        value={returnForm.serialOrImei}
                                        onChange={(e) => setReturnForm((p) => ({ ...p, serialOrImei: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái sau xử lý</label>
                                    <select
                                        className="form-control"
                                        value={returnForm.statusAfter}
                                        onChange={(e) => setReturnForm((p) => ({ ...p, statusAfter: e.target.value }))}
                                    >
                                        <option value="InStock">Còn trong kho (bán lại)</option>
                                        <option value="Damaged">Hư hỏng (không bán)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Lý do</label>
                                    <input
                                        className="form-control"
                                        value={returnForm.reason}
                                        onChange={(e) => setReturnForm((p) => ({ ...p, reason: e.target.value }))}
                                    />
                                </div>
                                {(returnLookup.loading || returnLookup.error || returnLookup.data) && (
                                    <div className="border rounded p-2 bg-light mb-3">
                                        {returnLookup.loading ? (
                                            <div className="text-muted">Đang tra cứu serial...</div>
                                        ) : returnLookup.error ? (
                                            <div className="text-danger">{returnLookup.error}</div>
                                        ) : (
                                            <>
                                                <div className="font-weight-bold">{returnLookup.data?.productName || '-'}</div>
                                                <div className="text-muted small">
                                                    Trạng thái: <span className="text-monospace">{stockStatusText(returnLookup.data?.status)}</span>
                                                </div>
                                                <div className="text-muted small">
                                                    Bán lúc: {returnLookup.data?.soldAt ? new Date(returnLookup.data.soldAt).toLocaleString() : '-'}
                                                </div>
                                                <div className="text-muted small">
                                                    Đơn hàng: {returnLookup.data?.orderId ? `#${returnLookup.data.orderId}` : '-'}
                                                </div>
                                                <div className="text-muted small">
                                                    Khách hàng: {returnLookup.data?.customerName || '-'} {returnLookup.data?.customerPhone ? `(${returnLookup.data.customerPhone})` : ''}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                <button className="btn btn-warning btn-block" disabled={submitting}>
                                    {submitting ? 'Đang xử lý...' : 'Xác nhận nhập lại'}
                                </button>
                                <small className="text-muted d-block mt-2">Chỉ xử lý nhập lại khi serial đã bán và yêu cầu trả hàng được duyệt.</small>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Tồn kho theo Serial/IMEI</h3>
                        <div className="card-tools">
                            <input
                                className="form-control form-control-sm d-inline-block mr-2"
                                style={{ width: 240 }}
                                placeholder="Tìm nhanh serial..."
                                value={serialQuickSearch}
                                onChange={(e) => setSerialQuickSearch(e.target.value)}
                            />
                            <AdminFilterDropdown
                                open={isFilterMenuOpen}
                                onOpenChange={setIsFilterMenuOpen}
                                label="Bộ lọc"
                                activeCount={activeFilterCount}
                            >
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setIsFilterMenuOpen(false);
                                    }}
                                >
                                    <div className="form-group">
                                        <label>Serial/IMEI</label>
                                        <input
                                            className="form-control"
                                            value={filters.keyword}
                                            onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Trạng thái</label>
                                        <select
                                            className="form-control"
                                            value={filters.status}
                                            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                                        >
                                            <option value="">Tất cả</option>
                                            {Object.entries(STOCK_STATUS_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Số ngày tồn tối thiểu</label>
                                        <input
                                            className="form-control"
                                            type="number"
                                            min="0"
                                            value={filters.minDaysInStock}
                                            onChange={(e) => setFilters((p) => ({ ...p, minDaysInStock: e.target.value }))}
                                            placeholder="Ví dụ: 90"
                                        />
                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setFilters((p) => ({ ...p, minDaysInStock: '90', status: p.status || 'InStock' }))}
                                            >
                                                ≥ 90 days
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Sản phẩm</label>
                                        <select
                                            className="form-control"
                                            value={filters.productId}
                                            onChange={(e) => setFilters((p) => ({ ...p, productId: e.target.value }))}
                                        >
                                            <option value="">Tất cả</option>
                                            {products.map((p) => (
                                                <option key={p.id ?? p.Id} value={p.id ?? p.Id}>
                                                    {(p.name ?? p.Name) || `#${p.id ?? p.Id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setFilters({ keyword: '', status: '', productId: '', minDaysInStock: '' })}
                                        >
                                            Xóa lọc
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Đóng
                                        </button>
                                    </div>
                                </form>
                            </AdminFilterDropdown>
                            <button className="btn btn-sm btn-outline-primary" onClick={loadAll} disabled={loading}>
                                Làm mới
                            </button>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 80 }}>ID</th>
                                            <th style={{ width: 240 }}>Sản phẩm</th>
                                            <th style={{ width: 260 }}>Serial/IMEI</th>
                                            <th style={{ width: 130 }}>Trạng thái</th>
                                            <th style={{ width: 200 }}>Ngày nhập</th>
                                            <th style={{ width: 200 }}>Ngày bán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedStockItems.map((raw) => {
                                            const s = normalizeStockItem(raw);
                                            const productName = s.productName || productNameById.get(Number(s.productId)) || `#${s.productId}`;
                                            return (
                                                <tr key={s.id}>
                                                    <td>{s.id}</td>
                                                    <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {productName}
                                                    </td>
                                                    <td className="text-monospace" style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {s.serialOrImei}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-secondary">{stockStatusText(s.status)}</span>
                                                    </td>
                                                    <td>{s.receivedAt ? new Date(s.receivedAt).toLocaleString() : '-'}</td>
                                                    <td>{s.soldAt ? new Date(s.soldAt).toLocaleString() : '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="d-flex justify-content-between align-items-center p-2 border-top">
                                    <div className="text-muted small">
                                        Hiển thị {(stockPage - 1) * stockPageSize + 1}-{Math.min(stockPage * stockPageSize, filteredStockItems.length)} / {filteredStockItems.length}
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                                            disabled={stockPage <= 1}
                                        >
                                            Trước
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-secondary" disabled>
                                            Trang {stockPage} / {totalStockPages}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => setStockPage((p) => Math.min(totalStockPages, p + 1))}
                                            disabled={stockPage >= totalStockPages}
                                        >
                                            Sau
                                        </button>
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
