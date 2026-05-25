import React, { useEffect, useMemo, useState } from 'react';
import { inventoryApi, repairApi, warrantyApi } from '../services/api';
import AdminFilterDropdown from '../components/AdminFilterDropdown';

const REPAIR_STATUS_LABELS = {
    Pending: 'Chờ tiếp nhận',
    Intake: 'Đã tiếp nhận',
    Received: 'Đã tiếp nhận',
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

const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-admin-brand focus:ring-2 focus:ring-blue-100';
const labelClass = 'mb-1 block text-sm font-semibold text-admin-ink';

const repairStatusText = (value) => REPAIR_STATUS_LABELS[value] || value || 'Không rõ';

const normalize = (item) => ({
    id: item.id ?? item.Id,
    stockItemId: item.stockItemId ?? item.StockItemId,
    repairCode: item.repairCode ?? item.RepairCode,
    stockItem: item.stockItem ?? item.StockItem ?? null,
    warrantyId: item.warrantyId ?? item.WarrantyId,
    serialOrImei: item.serialOrImei ?? item.SerialOrImei,
    productName: item.productName ?? item.ProductName,
    customerName: item.customerName ?? item.CustomerName,
    customerPhone: item.customerPhone ?? item.CustomerPhone,
    status: item.status ?? item.Status,
    issueDescription: item.issueDescription ?? item.IssueDescription,
    receivedAt: item.receivedAt ?? item.ReceivedAt,
    updatedAt: item.updatedAt ?? item.UpdatedAt,
    updatedBy: item.updatedBy ?? item.UpdatedBy,
    updates: item.updates ?? item.Updates ?? [],
});

const statusClass = (value) => {
    const status = String(value || '').toLowerCase();
    if (status === 'pending' || status === 'intake' || status === 'received') return 'bg-blue-50 text-blue-700';
    if (status === 'diagnosing' || status === 'testing') return 'bg-cyan-50 text-cyan-700';
    if (status === 'repairing') return 'bg-amber-50 text-amber-700';
    if (status === 'waitingparts' || status === 'waitingcustomerapproval') return 'bg-violet-50 text-violet-700';
    if (status === 'completed' || status === 'delivered') return 'bg-emerald-50 text-emerald-700';
    if (status === 'cancelled' || status === 'rejected') return 'bg-rose-50 text-rose-700';
    return 'bg-slate-100 text-slate-700';
};

const readError = (err, fallback) => {
    const data = err?.response?.data;
    return data?.message || data?.detail || data?.title || err?.message || fallback;
};

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
            setError(readError(err, 'Không tải được hồ sơ sửa chữa.'));
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
            return undefined;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            setDeviceLookup({ loading: true, data: null, error: '' });
            try {
                const res = await inventoryApi.lookupStockItem(serial);
                if (!cancelled) setDeviceLookup({ loading: false, data: res.data || null, error: '' });
            } catch (err) {
                if (!cancelled) setDeviceLookup({ loading: false, data: null, error: readError(err, 'Không tìm thấy mã thiết bị') });
            }

            setWarrantyLookup({ loading: true, data: null, error: '' });
            try {
                const res = await warrantyApi.lookup(serial);
                const payload = res.data;
                const warranty = Array.isArray(payload?.warranties) ? payload.warranties[0] : payload;
                if (!cancelled) setWarrantyLookup({ loading: false, data: warranty || null, error: '' });
            } catch (err) {
                if (!cancelled) setWarrantyLookup({ loading: false, data: null, error: readError(err, 'Không tìm thấy bảo hành') });
            }
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [intake.serialOrImei]);

    const filteredCases = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const status = filters.status.trim().toLowerCase();
        return cases.filter((raw) => {
            const item = normalize(raw);
            if (status && String(item.status || '').toLowerCase() !== status) return false;
            if (!keyword) return true;
            const serial = item.serialOrImei || item.stockItem?.serialOrImei || item.stockItem?.SerialOrImei || '';
            const productName = item.productName || item.stockItem?.product?.name || item.stockItem?.Product?.Name || '';
            return [item.id, item.stockItemId, item.warrantyId, serial, productName, item.issueDescription]
                .map((value) => String(value || '').toLowerCase())
                .join(' ')
                .includes(keyword);
        });
    }, [cases, filters]);

    useEffect(() => {
        setPage(1);
    }, [filters.keyword, filters.status]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCases.length / pageSize)), [filteredCases.length]);

    useEffect(() => {
        setPage((current) => Math.min(Math.max(1, current), totalPages));
    }, [totalPages]);

    const pagedCases = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredCases.slice(start, start + pageSize);
    }, [filteredCases, page]);

    const activeFilterCount = (filters.keyword.trim() ? 1 : 0) + (filters.status ? 1 : 0);
    const from = filteredCases.length ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, filteredCases.length);

    const handleIntake = async (event) => {
        event.preventDefault();
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
            setError(readError(err, 'Không tạo được hồ sơ sửa chữa.'));
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
            setError(readError(err, 'Không cập nhật được hồ sơ sửa chữa.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="px-4 py-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-admin-muted">Bảo hành</p>
                    <h2 className="mb-0 text-2xl font-bold text-admin-ink">Hồ sơ sửa chữa</h2>
                </div>
                <button type="button" className="rounded-md border border-admin-brand px-4 py-2 text-sm font-semibold text-admin-brand hover:bg-orange-50 disabled:opacity-60" onClick={load} disabled={loading}>
                    Làm mới
                </button>
            </div>

            {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}

            <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
                <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-admin-ink">Tiếp nhận sửa chữa</h3>
                    </div>
                    <div className="p-4">
                        <form className="space-y-4" onSubmit={handleIntake}>
                            <label className="block">
                                <span className={labelClass}>Mã thiết bị (Serial/IMEI)</span>
                                <input
                                    className={inputClass}
                                    value={intake.serialOrImei}
                                    onChange={(e) => setIntake((p) => ({ ...p, serialOrImei: e.target.value }))}
                                    placeholder="Nhập serial/IMEI cần tiếp nhận"
                                    required
                                />
                            </label>

                            {(deviceLookup.loading || deviceLookup.error || deviceLookup.data || warrantyLookup.loading || warrantyLookup.error || warrantyLookup.data) && (
                                <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-admin-ink">Thiết bị</span>
                                            {deviceLookup.loading && <span className="text-xs font-semibold text-admin-muted">Đang tải...</span>}
                                        </div>
                                        {deviceLookup.error ? (
                                            <div className="text-sm font-semibold text-rose-700">{deviceLookup.error}</div>
                                        ) : deviceLookup.data ? (
                                            <div className="space-y-1 text-sm text-admin-muted">
                                                <div className="font-semibold text-admin-ink">{deviceLookup.data.productName || '-'}</div>
                                                <div>Trạng thái: {deviceLookup.data.status || '-'}</div>
                                                <div>Bán lúc: {deviceLookup.data.soldAt ? new Date(deviceLookup.data.soldAt).toLocaleString() : '-'}</div>
                                                <div>Khách hàng: {deviceLookup.data.customerName || '-'} {deviceLookup.data.customerPhone ? `(${deviceLookup.data.customerPhone})` : ''}</div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-admin-muted">-</div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-admin-ink">Bảo hành</span>
                                            {warrantyLookup.loading && <span className="text-xs font-semibold text-admin-muted">Đang tải...</span>}
                                        </div>
                                        {warrantyLookup.error ? (
                                            <div className="text-sm font-semibold text-admin-muted">{warrantyLookup.error}</div>
                                        ) : warrantyLookup.data ? (
                                            <div className="space-y-1 text-sm text-admin-muted">
                                                <div>Trạng thái: {warrantyLookup.data.status || warrantyLookup.data.Status || '-'}</div>
                                                <div>
                                                    Hết hạn: {warrantyLookup.data.endDate || warrantyLookup.data.EndDate || warrantyLookup.data.expiresAt || warrantyLookup.data.ExpiresAt
                                                        ? new Date(warrantyLookup.data.endDate || warrantyLookup.data.EndDate || warrantyLookup.data.expiresAt || warrantyLookup.data.ExpiresAt).toLocaleString()
                                                        : '-'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-admin-muted">-</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <label className="block">
                                <span className={labelClass}>Mô tả lỗi</span>
                                <textarea
                                    className={`${inputClass} min-h-32 resize-y`}
                                    value={intake.issueDescription}
                                    onChange={(e) => setIntake((p) => ({ ...p, issueDescription: e.target.value }))}
                                    placeholder="Ghi nhận lỗi khách báo hoặc tình trạng máy khi tiếp nhận"
                                />
                            </label>

                            <button className="w-full rounded-md bg-admin-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60" disabled={submitting}>
                                {submitting ? 'Đang lưu...' : 'Tạo hồ sơ sửa chữa'}
                            </button>
                        </form>
                    </div>
                </section>

                <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <h3 className="mb-0 text-base font-bold text-admin-ink">Danh sách hồ sơ</h3>
                        <AdminFilterDropdown open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen} label="Bộ lọc" activeCount={activeFilterCount}>
                            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setIsFilterMenuOpen(false); }}>
                                <label className="block">
                                    <span className={labelClass}>Từ khóa</span>
                                    <input className={inputClass} value={filters.keyword} onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))} />
                                </label>
                                <label className="block">
                                    <span className={labelClass}>Trạng thái</span>
                                    <select className={inputClass} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                                        <option value="">Tất cả</option>
                                        {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                </label>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setFilters({ keyword: '', status: '' })}>Xóa lọc</button>
                                    <button type="submit" className="rounded-md bg-admin-brand px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600">Đóng</button>
                                </div>
                            </form>
                        </AdminFilterDropdown>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="py-12 text-center text-sm font-semibold text-admin-muted">Đang tải hồ sơ sửa chữa...</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border border-slate-200">
                                    <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                            <tr>
                                                <th className="w-[80px] px-4 py-3">ID</th>
                                                <th className="w-[220px] px-4 py-3">Thiết bị</th>
                                                <th className="w-[140px] px-4 py-3">Bảo hành</th>
                                                <th className="w-[170px] px-4 py-3">Trạng thái</th>
                                                <th className="px-4 py-3">Mô tả</th>
                                                <th className="w-[280px] px-4 py-3">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {pagedCases.map((raw) => {
                                                const item = normalize(raw);
                                                const local = updateById[item.id] || { message: '', statusAfter: '' };
                                                const serial = item.serialOrImei || item.stockItem?.serialOrImei || item.stockItem?.SerialOrImei || item.stockItemId || '-';
                                                const productName = item.productName || item.stockItem?.product?.name || item.stockItem?.Product?.Name || '-';
                                                return (
                                                    <tr key={item.id} className="align-top hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-semibold text-admin-ink">#{item.id}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-mono text-sm font-semibold text-admin-ink">{serial}</div>
                                                            <div className="mt-1 text-sm text-admin-muted">{productName}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-admin-muted">{item.warrantyId ?? '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(item.status)}`}>{repairStatusText(item.status)}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="mb-1 text-xs font-semibold text-admin-muted">Tiếp nhận: {item.receivedAt ? new Date(item.receivedAt).toLocaleString() : '-'}</div>
                                                            <div className="max-w-[320px] whitespace-pre-wrap text-admin-ink">{item.issueDescription || '-'}</div>
                                                            {item.updatedAt && (
                                                                <div className="mt-1 text-xs font-semibold text-admin-muted">
                                                                    Cập nhật: {new Date(item.updatedAt).toLocaleString()} ({item.updatedBy || 'nhân viên'})
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="space-y-2">
                                                                <select className={inputClass} value={local.statusAfter} onChange={(e) => setUpdateById((prev) => ({ ...prev, [item.id]: { ...local, statusAfter: e.target.value } }))}>
                                                                    <option value="">-- Trạng thái --</option>
                                                                    {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                                                </select>
                                                                <input className={inputClass} placeholder="Ghi chú kỹ thuật" value={local.message} onChange={(e) => setUpdateById((prev) => ({ ...prev, [item.id]: { ...local, message: e.target.value } }))} />
                                                                <button type="button" className="w-full rounded-md bg-admin-brand px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60" onClick={() => handleUpdate(item.id)} disabled={updatingId === item.id}>
                                                                    {updatingId === item.id ? 'Đang cập nhật...' : 'Cập nhật'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {!pagedCases.length && (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-8 text-center text-sm font-semibold text-admin-muted">Chưa có hồ sơ sửa chữa phù hợp.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-admin-muted sm:flex-row sm:items-center sm:justify-between">
                                    <div>Hiển thị {from}-{to} trong {filteredCases.length} hồ sơ</div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Trước</button>
                                        <span className="rounded-md bg-slate-100 px-3 py-2 font-semibold text-admin-ink">Trang {page} / {totalPages}</span>
                                        <button type="button" className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Sau</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminRepairs;
