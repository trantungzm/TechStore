import React, { useEffect, useMemo, useState } from 'react';
import { inventoryApi, repairApi, warrantyApi } from '../services/api';
import AdminFilterDropdown from '../components/AdminFilterDropdown';

const REPAIR_STATUS_LABELS = {
    Pending: 'Chờ tiếp nhận',
    Intake: 'Đã tiếp nhận',
    Diagnosing: 'Đang chẩn đoán',
    WaitingCustomerApproval: 'Chờ khách duyệt chi phí',
    WaitingParts: 'Chờ linh kiện',
    Repairing: 'Đang sửa',
    Testing: 'Đang kiểm tra',
    Completed: 'Hoàn tất sửa chữa',
    Delivered: 'Đã trả khách',
    Cancelled: 'Đã hủy',
    Rejected: 'Từ chối',
};

const repairStatusText = (value) => REPAIR_STATUS_LABELS[value] || value || 'Không rõ';

const AdminRepairs = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filters, setFilters] = useState({ keyword: '', status: '' });
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [intake, setIntake] = useState({
        serialOrImei: '',
        issueDescription: '',
    });

    const [updateById, setUpdateById] = useState({});
    const [deviceLookup, setDeviceLookup] = useState({ loading: false, data: null, error: '' });
    const [warrantyLookup, setWarrantyLookup] = useState({ loading: false, data: null, error: '' });

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await repairApi.getAll();
            setCases(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không tải được hồ sơ sửa chữa.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const serial = String(intake.serialOrImei || '').trim();
        if (!serial) {
            setDeviceLookup({ loading: false, data: null, error: '' });
            setWarrantyLookup({ loading: false, data: null, error: '' });
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setDeviceLookup({ loading: true, data: null, error: '' });
            try {
                const res = await inventoryApi.lookupStockItem(serial);
                if (!cancelled) setDeviceLookup({ loading: false, data: res.data || null, error: '' });
            } catch (err) {
                if (cancelled) return;
                const status = err?.response?.status;
                if (status === 404) setDeviceLookup({ loading: false, data: null, error: 'Không tìm thấy mã thiết bị' });
                else {
                    const data = err?.response?.data;
                    setDeviceLookup({ loading: false, data: null, error: data?.message || data?.detail || data?.title || 'Không tra cứu được thiết bị' });
                }
            }

            setWarrantyLookup({ loading: true, data: null, error: '' });
            try {
                const res = await warrantyApi.lookup(serial);
                const payload = res.data;
                const warranty = Array.isArray(payload?.warranties) ? payload.warranties[0] : payload;
                if (!cancelled) setWarrantyLookup({ loading: false, data: warranty || null, error: '' });
            } catch (err) {
                if (cancelled) return;
                const data = err?.response?.data;
                setWarrantyLookup({ loading: false, data: null, error: data?.message || data?.detail || data?.title || 'Không tìm thấy bảo hành' });
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [intake.serialOrImei]);

    const normalize = (c) => ({
        id: c.id ?? c.Id,
        stockItemId: c.stockItemId ?? c.StockItemId,
        repairCode: c.repairCode ?? c.RepairCode,
        stockItem: c.stockItem ?? c.StockItem ?? null,
        warrantyId: c.warrantyId ?? c.WarrantyId,
        serialOrImei: c.serialOrImei ?? c.SerialOrImei,
        productName: c.productName ?? c.ProductName,
        customerName: c.customerName ?? c.CustomerName,
        customerPhone: c.customerPhone ?? c.CustomerPhone,
        status: c.status ?? c.Status,
        issueDescription: c.issueDescription ?? c.IssueDescription,
        receivedAt: c.receivedAt ?? c.ReceivedAt,
        updatedAt: c.updatedAt ?? c.UpdatedAt,
        updatedBy: c.updatedBy ?? c.UpdatedBy,
        updates: c.updates ?? c.Updates ?? [],
    });

    const filteredCases = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const status = filters.status.trim().toLowerCase();
        return cases.filter((raw) => {
            const c = normalize(raw);
            if (status && String(c.status || '').toLowerCase() !== status) return false;
            if (!keyword) return true;
            const serial = c.stockItem?.serialOrImei || c.stockItem?.SerialOrImei || '';
            const productName = c.stockItem?.product?.name || c.stockItem?.Product?.Name || '';
            const hay = [
                c.id,
                c.stockItemId,
                c.warrantyId,
                serial,
                productName,
                c.issueDescription,
            ]
                .map((x) => String(x || '').toLowerCase())
                .join(' ');
            return hay.includes(keyword);
        });
    }, [cases, filters.keyword, filters.status]);

    useEffect(() => {
        setPage(1);
    }, [filters.keyword, filters.status]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCases.length / pageSize)), [filteredCases.length]);

    useEffect(() => {
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const pagedCases = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredCases.slice(start, start + pageSize);
    }, [filteredCases, page]);

    const activeFilterCount = (filters.keyword.trim() ? 1 : 0) + (filters.status ? 1 : 0);

    const statusBadge = (value) => {
        const s = String(value || '').toLowerCase();
        if (s === 'pending' || s === 'intake') return 'badge-primary';
        if (s === 'diagnosing') return 'badge-info';
        if (s === 'repairing') return 'badge-warning';
        if (s === 'waitingparts' || s === 'waitingcustomerapproval') return 'badge-secondary';
        if (s === 'completed') return 'badge-success';
        if (s === 'delivered') return 'badge-dark';
        return 'badge-secondary';
    };

    const handleIntake = async (e) => {
        e.preventDefault();
        if (!intake.serialOrImei.trim()) return;
        setSubmitting(true);
        setError('');
        try {
            await repairApi.intake({
                serialOrImei: intake.serialOrImei.trim(),
                issueDescription: intake.issueDescription.trim() || null,
                priority: 'Normal',
            });
            setIntake({ serialOrImei: '', issueDescription: '' });
            await load();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không tạo được hồ sơ sửa chữa.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id) => {
        setUpdatingId(id);
        setError('');
        try {
            const payload = updateById[id] || {};
            await repairApi.update(id, {
                message: payload.message || null,
                statusAfter: payload.statusAfter || null,
            });
            setUpdateById((prev) => ({ ...prev, [id]: { message: '', statusAfter: '' } }));
            await load();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không cập nhật được hồ sơ sửa chữa.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="row">
            <div className="col-lg-4">
                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Tiếp nhận sửa chữa</h3>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleIntake}>
                            <div className="form-group">
                                <label>Mã thiết bị (Serial/IMEI)</label>
                                <input
                                    className="form-control"
                                    value={intake.serialOrImei}
                                    onChange={(e) => setIntake((p) => ({ ...p, serialOrImei: e.target.value }))}
                                    required
                                />
                            </div>
                            {(deviceLookup.loading || deviceLookup.error || deviceLookup.data || warrantyLookup.loading || warrantyLookup.error || warrantyLookup.data) && (
                                <div className="border rounded p-2 bg-light mb-3">
                                    <div className="d-flex justify-content-between flex-wrap" style={{ gap: 8 }}>
                                        <div className="font-weight-bold">Thiết bị</div>
                                        {deviceLookup.loading && <span className="text-muted small">Đang tải...</span>}
                                    </div>
                                    {deviceLookup.error ? (
                                        <div className="text-danger small">{deviceLookup.error}</div>
                                    ) : deviceLookup.data ? (
                                        <>
                                            <div className="small text-muted">{deviceLookup.data.productName || '-'}</div>
                                            <div className="small text-muted">
                                                Trạng thái: <span className="text-monospace">{deviceLookup.data.status || '-'}</span>
                                            </div>
                                            <div className="small text-muted">
                                                Bán lúc: {deviceLookup.data.soldAt ? new Date(deviceLookup.data.soldAt).toLocaleString() : '-'}
                                            </div>
                                            <div className="small text-muted">
                                                Khách hàng: {deviceLookup.data.customerName || '-'} {deviceLookup.data.customerPhone ? `(${deviceLookup.data.customerPhone})` : ''}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-muted small">-</div>
                                    )}

                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between flex-wrap" style={{ gap: 8 }}>
                                        <div className="font-weight-bold">Bảo hành</div>
                                        {warrantyLookup.loading && <span className="text-muted small">Đang tải...</span>}
                                    </div>
                                    {warrantyLookup.error ? (
                                        <div className="text-muted small">{warrantyLookup.error}</div>
                                    ) : warrantyLookup.data ? (
                                        <>
                                            <div className="small text-muted">
                                                Trạng thái: <span className="text-monospace">{warrantyLookup.data.status || warrantyLookup.data.Status || '-'}</span>
                                            </div>
                                            <div className="small text-muted">
                                                Hết hạn: {warrantyLookup.data.endDate || warrantyLookup.data.EndDate || warrantyLookup.data.expiresAt || warrantyLookup.data.ExpiresAt ? new Date(warrantyLookup.data.endDate || warrantyLookup.data.EndDate || warrantyLookup.data.expiresAt || warrantyLookup.data.ExpiresAt).toLocaleString() : '-'}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-muted small">-</div>
                                    )}
                                </div>
                            )}
                            <div className="form-group">
                                <label>Mô tả lỗi</label>
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    value={intake.issueDescription}
                                    onChange={(e) => setIntake((p) => ({ ...p, issueDescription: e.target.value }))}
                                />
                            </div>
                            <button className="btn btn-primary btn-block" disabled={submitting}>
                                {submitting ? 'Đang lưu...' : 'Tạo hồ sơ sửa chữa'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Hồ sơ sửa chữa</h3>
                        <div className="card-tools">
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
                                        <label>Từ khóa</label>
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
                                            {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setFilters({ keyword: '', status: '' })}
                                        >
                                            Xóa lọc
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Đóng
                                        </button>
                                    </div>
                                </form>
                            </AdminFilterDropdown>
                            <button className="btn btn-sm btn-outline-primary" onClick={load} disabled={loading}>
                                Làm mới
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : filteredCases.length === 0 ? (
                            <div className="alert alert-light border mb-0">Chưa có hồ sơ sửa chữa</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 70 }}>ID</th>
                                            <th style={{ width: 110 }}>Serial</th>
                                            <th style={{ width: 120 }}>Bảo hành</th>
                                            <th style={{ width: 140 }}>Trạng thái</th>
                                            <th>Mô tả</th>
                                            <th style={{ width: 260 }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedCases.map((raw) => {
                                            const c = normalize(raw);
                                            const local = updateById[c.id] || { message: '', statusAfter: '' };
                                            return (
                                                <tr key={c.id}>
                                                    <td>#{c.id}</td>
                                                    <td>
                                                        <div>{c.serialOrImei || c.stockItemId || '-'}</div>
                                                        {(c.stockItem?.serialOrImei || c.stockItem?.SerialOrImei) && (
                                                            <div className="text-muted small text-monospace">
                                                                {c.stockItem.serialOrImei || c.stockItem.SerialOrImei}
                                                            </div>
                                                        )}
                                                        {(c.productName || c.stockItem?.product?.name || c.stockItem?.Product?.Name) && (
                                                            <div className="text-muted small">
                                                                {c.productName || c.stockItem.product?.name || c.stockItem.Product?.Name}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>{c.warrantyId ?? '-'}</td>
                                                    <td>
                                                        <span className={`badge ${statusBadge(c.status)}`}>{repairStatusText(c.status)}</span>
                                                    </td>
                                                    <td>
                                                        <div className="text-muted small">
                                                            Tiếp nhận: {c.receivedAt ? new Date(c.receivedAt).toLocaleString() : '-'}
                                                        </div>
                                                        <div>{c.issueDescription || '-'}</div>
                                                        {c.updatedAt && (
                                                            <div className="text-muted small">
                                                                Cập nhật: {new Date(c.updatedAt).toLocaleString()} ({c.updatedBy || 'nhân viên'})
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column" style={{ gap: 8 }}>
                                                            <select
                                                                className="form-control form-control-sm"
                                                                value={local.statusAfter}
                                                                onChange={(e) =>
                                                                    setUpdateById((prev) => ({
                                                                        ...prev,
                                                                        [c.id]: { ...local, statusAfter: e.target.value },
                                                                    }))
                                                                }
                                                            >
                                                                <option value="">-- Trạng thái --</option>
                                                                {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => (
                                                                    <option key={value} value={value}>{label}</option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                className="form-control form-control-sm"
                                                                placeholder="Ghi chú kỹ thuật"
                                                                value={local.message}
                                                                onChange={(e) =>
                                                                    setUpdateById((prev) => ({
                                                                        ...prev,
                                                                        [c.id]: { ...local, message: e.target.value },
                                                                    }))
                                                                }
                                                            />
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleUpdate(c.id)}
                                                                disabled={updatingId === c.id}
                                                            >
                                                                {updatingId === c.id ? 'Đang cập nhật...' : 'Cập nhật'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="text-muted small">
                                        Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredCases.length)} / {filteredCases.length}
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                        >
                                            Trước
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-secondary" disabled>
                                            Trang {page} / {totalPages}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
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

export default AdminRepairs;
