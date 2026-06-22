import React, { useEffect, useMemo, useState } from 'react';
import { inventoryApi, repairApi, warrantyApi } from '../../services/api';
import AdminFilterDropdown from '../../components/admin/AdminFilterDropdown';
import { useAuth } from '../../contexts/AuthContext';
import { readApiError as readError } from '../../utils/store';
import { useRepairs } from '../../hooks/useRepairs';
import { REPAIR_STATUS_LABELS, repairStatusLabel, warrantyStatusLabel } from '../../utils/warrantyStatus';

// Màn quản trị sửa chữa: tiếp nhận máy, tra cứu bảo hành/thiết bị và cập nhật tiến độ repair case.
// Đây là điểm nối giữa inventory, warranty claim và quy trình sửa chữa sau bán hàng.
const inputClass = 'w-full rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15';
const labelClass = 'mb-1 block text-sm font-semibold text-[var(--color-fg)]';

const repairStatusText = repairStatusLabel;

// Chuẩn hóa repair case để bảng, filter và form update không phải xử lý nhiều kiểu casing.
const normalize = (item) => ({
    id: item.id ?? item.Id,
    repairCode: item.repairCode ?? item.RepairCode,
    warrantyClaimId: item.warrantyClaimId ?? item.WarrantyClaimId,
    ticketId: item.ticketId ?? item.TicketId,
    stockItemId: item.stockItemId ?? item.StockItemId,
    stockItem: item.stockItem ?? item.StockItem ?? null,
    serialOrImei: item.serialOrImei ?? item.SerialOrImei,
    productName: item.productName ?? item.ProductName,
    customerName: item.customerName ?? item.CustomerName,
    customerPhone: item.customerPhone ?? item.CustomerPhone,
    status: item.status ?? item.Status,
    issueDescription: item.issueDescription ?? item.IssueDescription,
    receivedAt: item.receivedAt ?? item.ReceivedAt,
    updatedAt: item.updatedAt ?? item.UpdatedAt,
    note: item.note ?? item.Note,
    updates: item.updates ?? item.Updates ?? [],
});

const statusClass = (value) => {
    const status = String(value || '').toLowerCase();
    if (status === 'pending' || status === 'intake' || status === 'received') return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]';
    if (status === 'diagnosing' || status === 'testing') return 'bg-cyan-50 text-cyan-700';
    if (status === 'repairing') return 'bg-[var(--color-surface-2)] text-amber-300';
    if (status === 'waitingparts' || status === 'waitingcustomerapproval') return 'bg-violet-50 text-violet-700';
    if (status === 'completed' || status === 'delivered') return 'bg-emerald-500/10 text-emerald-300';
    if (status === 'cancelled' || status === 'rejected') return 'bg-red-500/10 text-red-300';
    return 'bg-[var(--color-surface-3)] text-[var(--color-fg)]';
};


const AdminRepairs = () => {
    const { user } = useAuth();
    const canOperate = (user?.role || '') === 'Technical'; // Admin chỉ xem; thao tác do Technical
    const { cases, loading, error, setError, reload } = useRepairs();
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [activatingWarranty, setActivatingWarranty] = useState(false);
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

    // Khi nhập serial/IMEI ở form tiếp nhận, FE tự tra cứu song song:
    // 1) thiết bị trong kho, 2) thông tin bảo hành hiện có.

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

    // Bộ lọc ở FE giúp kỹ thuật tra nhanh hồ sơ theo serial, khách hàng hoặc trạng thái.
    const filteredCases = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const status = filters.status.trim().toLowerCase();
        return cases.filter((raw) => {
            const item = normalize(raw);
            if (status && String(item.status || '').toLowerCase() !== status) return false;
            if (!keyword) return true;
            const serial = item.serialOrImei || item.stockItem?.serialOrImei || item.stockItem?.SerialOrImei || '';
            const productName = item.productName || item.stockItem?.product?.name || item.stockItem?.Product?.Name || '';
            return [item.id, item.repairCode, item.stockItemId, item.warrantyClaimId, item.ticketId, serial, productName, item.customerName, item.customerPhone, item.issueDescription]
                .map((value) => String(value || '').toLowerCase())
                .join(' ')
                .includes(keyword);
        });
    }, [cases, filters]);

    // Mỗi khi bộ lọc đổi thì quay về trang 1 để tránh rơi vào trang không còn dữ liệu.
    useEffect(() => {
        setPage(1);
    }, [filters.keyword, filters.status]);

    // Tính phân trang ở FE vì danh sách đang được load toàn bộ trước rồi mới lọc.
    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCases.length / pageSize)), [filteredCases.length]);

    // Chặn page vượt giới hạn sau khi bộ lọc làm thay đổi số lượng hồ sơ.
    useEffect(() => {
        setPage((current) => Math.min(Math.max(1, current), totalPages));
    }, [totalPages]);

    // Slice danh sách đã lọc cho bảng hiện tại.
    const pagedCases = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredCases.slice(start, start + pageSize);
    }, [filteredCases, page]);

    const activeFilterCount = (filters.keyword.trim() ? 1 : 0) + (filters.status ? 1 : 0);
    const from = filteredCases.length ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, filteredCases.length);

    // Intake tạo một repair case mới từ serial/IMEI đang tiếp nhận tại quầy kỹ thuật.
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
            await reload();
        } catch (err) {
            setError(readError(err, 'Không tạo được hồ sơ sửa chữa.'));
        } finally {
            setSubmitting(false);
        }
    };

    // Mỗi lần cập nhật case có thể kèm message và trạng thái sau, backend sẽ ghi vào timeline sửa chữa.
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
            await reload();
        } catch (err) {
            setError(readError(err, 'Không cập nhật được hồ sơ sửa chữa.'));
        } finally {
            setUpdatingId(null);
        }
    };

    // Trường hợp khách có bảo hành nhưng record chưa active, kỹ thuật có thể kích hoạt ngay tại đây
    // rồi tra cứu lại để UI hiển thị thời hạn bảo hành mới nhất.
    const handleActivateWarranty = async () => {
        const warrantyId = warrantyLookup.data?.id ?? warrantyLookup.data?.Id;
        const serial = String(intake.serialOrImei || '').trim();
        if (!warrantyId) return;
        setActivatingWarranty(true);
        setError('');
        try {
            await warrantyApi.activateAdmin(warrantyId);
            if (serial) {
                const res = await warrantyApi.lookup(serial);
                const payload = res.data;
                const warranty = Array.isArray(payload?.warranties) ? payload.warranties[0] : payload;
                setWarrantyLookup({ loading: false, data: warranty || null, error: '' });
            }
        } catch (err) {
            setError(readError(err, 'Không kích hoạt được bảo hành.'));
        } finally {
            setActivatingWarranty(false);
        }
    };

    return (
        <div className="px-4 py-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Bảo hành</p>
                    <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Hồ sơ sửa chữa</h2>
                </div>
                <button type="button" className="rounded-md border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-60" onClick={reload} disabled={loading}>
                    Làm mới
                </button>
            </div>

            {error && <div className="mb-4 rounded-md border border-rose-200 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300">{error}</div>}

            <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
                {canOperate ? (
                    <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                        <div className="border-b border-[var(--color-border)] px-4 py-3">
                            <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Tiếp nhận sửa chữa</h3>
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
                                    <div className="space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                                        <div>
                                            <div className="mb-1 flex items-center justify-between gap-2">
                                                <span className="text-sm font-bold text-[var(--color-fg)]">Thiết bị</span>
                                                {deviceLookup.loading && <span className="text-xs font-semibold text-[var(--color-fg-muted)]">Đang tải...</span>}
                                            </div>
                                            {deviceLookup.error ? (
                                                <div className="text-sm font-semibold text-red-300">{deviceLookup.error}</div>
                                            ) : deviceLookup.data ? (
                                                <div className="space-y-1 text-sm text-[var(--color-fg-muted)]">
                                                    <div className="font-semibold text-[var(--color-fg)]">{deviceLookup.data.productName || '-'}</div>
                                                    <div>Trạng thái: {deviceLookup.data.status || '-'}</div>
                                                    <div>Bán lúc: {deviceLookup.data.soldAt ? new Date(deviceLookup.data.soldAt).toLocaleString() : '-'}</div>
                                                    <div>Khách hàng: {deviceLookup.data.customerName || '-'} {deviceLookup.data.customerPhone ? `(${deviceLookup.data.customerPhone})` : ''}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-[var(--color-fg-muted)]">-</div>
                                            )}
                                        </div>

                                        <div className="border-t border-[var(--color-border)] pt-3">
                                            <div className="mb-1 flex items-center justify-between gap-2">
                                                <span className="text-sm font-bold text-[var(--color-fg)]">Bảo hành</span>
                                                {warrantyLookup.loading && <span className="text-xs font-semibold text-[var(--color-fg-muted)]">Đang tải...</span>}
                                            </div>
                                            {warrantyLookup.error ? (
                                                <div className="text-sm font-semibold text-[var(--color-fg-muted)]">{warrantyLookup.error}</div>
                                            ) : warrantyLookup.data ? (
                                                <div className="space-y-1 text-sm text-[var(--color-fg-muted)]">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span>Trạng thái: {warrantyStatusLabel(warrantyLookup.data.status || warrantyLookup.data.Status)}</span>
                                                        {String(warrantyLookup.data.status || warrantyLookup.data.Status || '') === 'NotActivated' && (
                                                            <button
                                                                type="button"
                                                                className="rounded-md border border-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-60"
                                                                onClick={handleActivateWarranty}
                                                                disabled={activatingWarranty}
                                                            >
                                                                {activatingWarranty ? 'Đang kích hoạt...' : 'Kích hoạt'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div>
                                                        Hết hạn: {warrantyLookup.data.endDate || warrantyLookup.data.EndDate || warrantyLookup.data.expiresAt || warrantyLookup.data.ExpiresAt
                                                            ? new Date(warrantyLookup.data.endDate || warrantyLookup.data.EndDate || warrantyLookup.data.expiresAt || warrantyLookup.data.ExpiresAt).toLocaleString()
                                                            : '-'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-[var(--color-fg-muted)]">-</div>
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

                                <button className="w-full rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary)] disabled:opacity-60" disabled={submitting}>
                                    {submitting ? 'Đang lưu...' : 'Tạo hồ sơ sửa chữa'}
                                </button>
                            </form>
                        </div>
                    </section>
                ) : (
                    <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                        <div className="border-b border-[var(--color-border)] px-4 py-3">
                            <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Tiếp nhận sửa chữa</h3>
                        </div>
                        <div className="p-4">
                            <div className="rounded-md border border-amber-200 bg-amber-500/10 px-3 py-3 text-sm font-semibold text-amber-400">
                                Chế độ chỉ xem — thao tác tiếp nhận và cập nhật hồ sơ dành cho nhân viên Kỹ thuật (Technical).
                            </div>
                        </div>
                    </section>
                )}

                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Danh sách hồ sơ</h3>
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
                                    <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]" onClick={() => setFilters({ keyword: '', status: '' })}>Xóa lọc</button>
                                    <button type="submit" className="rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)]">Đóng</button>
                                </div>
                            </form>
                        </AdminFilterDropdown>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="py-12 text-center text-sm font-semibold text-[var(--color-fg-muted)]">Đang tải hồ sơ sửa chữa...</div>
                        ) : (
                            <>
                                <div className="ts-table-container">
                                    <table className="ts-table">
                                        <thead>
                                            <tr>
                                                <th className="ts-table-col-narrow">ID</th>
                                                <th className="ts-table-col-wide">Thiết bị</th>
                                                <th className="ts-table-col-medium ts-table-hide-mobile">Yêu cầu BH</th>
                                                <th className="ts-table-col-medium ts-table-hide-mobile">Trạng thái</th>
                                                <th className="ts-table-col-auto ts-table-hide-tablet">Mô tả</th>
                                                <th className="ts-table-col-wide text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedCases.map((raw) => {
                                                const item = normalize(raw);
                                                const local = updateById[item.id] || { message: '', statusAfter: '' };
                                                const serial = item.serialOrImei || item.stockItem?.serialOrImei || item.stockItem?.SerialOrImei || item.stockItemId || '-';
                                                const productName = item.productName || item.stockItem?.product?.name || item.stockItem?.Product?.Name || '-';
                                                return (
                                                    <tr key={item.id} className="align-top">
                                                        <td className="font-semibold text-[var(--color-fg)]">#{item.id}</td>
                                                        <td>
                                                            <div className="font-mono text-sm font-semibold text-[var(--color-fg)]">{serial}</div>
                                                            <div className="mt-1 text-sm text-[var(--color-fg-muted)]">{productName}</div>
                                                        </td>
                                                        <td className="ts-table-hide-mobile text-[var(--color-fg-muted)]">{item.warrantyClaimId ?? '-'}</td>
                                                        <td className="ts-table-hide-mobile">
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(item.status)}`}>{repairStatusText(item.status)}</span>
                                                        </td>
                                                        <td className="ts-table-hide-tablet">
                                                            <div className="mb-1 text-xs font-semibold text-[var(--color-fg-muted)]">Tiếp nhận: {item.receivedAt ? new Date(item.receivedAt).toLocaleString() : '-'}</div>
                                                            <div className="max-w-[320px] whitespace-pre-wrap text-[var(--color-fg)]">{item.issueDescription || '-'}</div>
                                                            {item.updatedAt && (
                                                                <div className="mt-1 text-xs font-semibold text-[var(--color-fg-muted)]">
                                                                    Cập nhật: {new Date(item.updatedAt).toLocaleString()}
                                                                </div>
                                                            )}
                                                        </td>
                                                        {canOperate ? (
                                                            <td>
                                                                <div className="space-y-2">
                                                                    <select className={inputClass} value={local.statusAfter} onChange={(e) => setUpdateById((prev) => ({ ...prev, [item.id]: { ...local, statusAfter: e.target.value } }))}>
                                                                        <option value="">-- Trạng thái --</option>
                                                                        {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                                                    </select>
                                                                    <input className={inputClass} placeholder="Ghi chú kỹ thuật" value={local.message} onChange={(e) => setUpdateById((prev) => ({ ...prev, [item.id]: { ...local, message: e.target.value } }))} />
                                                                    <button type="button" className="w-full rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)] disabled:opacity-60" onClick={() => handleUpdate(item.id)} disabled={updatingId === item.id}>
                                                                        {updatingId === item.id ? 'Đang cập nhật...' : 'Cập nhật'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        ) : (
                                                            <td className="px-4 py-3 text-xs text-[var(--color-fg-dim)]">Chỉ xem</td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                            {!pagedCases.length && (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-8 text-center text-sm font-semibold text-[var(--color-fg-muted)]">Chưa có hồ sơ sửa chữa phù hợp.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
                                    <div>Hiển thị {from}-{to} trong {filteredCases.length} hồ sơ</div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Trước</button>
                                        <span className="rounded-md bg-[var(--color-surface-3)] px-3 py-2 font-semibold text-[var(--color-fg)]">Trang {page} / {totalPages}</span>
                                        <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Sau</button>
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
