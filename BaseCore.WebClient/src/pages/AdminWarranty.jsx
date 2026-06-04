import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminFilterDropdown from '../components/AdminFilterDropdown';
import { repairApi, warrantyApi } from '../services/api';
import { toast } from '../utils/store';

const inputClass = 'w-full rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100';

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
};

const normalizeWarranty = (w) => ({
    id: w.id ?? w.Id,
    warrantyCode: w.warrantyCode ?? w.WarrantyCode,
    status: w.status ?? w.Status,
    productName: w.productName ?? w.ProductName,
    serialOrImei: w.serialOrImei ?? w.SerialOrImei,
    customerName: w.customerName ?? w.CustomerName,
    customerPhone: w.customerPhone ?? w.CustomerPhone,
    orderCode: w.orderCode ?? w.OrderCode,
    purchaseDate: w.purchaseDate ?? w.PurchaseDate,
    activatedAt: w.activatedAt ?? w.ActivatedAt,
    expiresAt: w.expiresAt ?? w.ExpiresAt,
});

const normalizeClaim = (c) => ({
    id: c.id ?? c.Id,
    claimCode: c.claimCode ?? c.ClaimCode,
    status: c.status ?? c.Status,
    warrantyId: c.warrantyId ?? c.WarrantyId,
    warrantyCode: c.warrantyCode ?? c.WarrantyCode ?? c.warranty?.warrantyCode ?? c.Warranty?.WarrantyCode,
    productName: c.productName ?? c.ProductName ?? c.product?.name ?? c.Product?.Name,
    serialOrImei: c.serialOrImei ?? c.SerialOrImei,
    customerName: c.customerName ?? c.CustomerName,
    customerPhone: c.customerPhone ?? c.CustomerPhone,
    issueDescription: c.issueDescription ?? c.IssueDescription,
    receiveMethod: c.receiveMethod ?? c.ReceiveMethod,
    createdAt: c.createdAt ?? c.CreatedAt,
});

const WARRANTY_STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'NotActivated', label: 'Chưa kích hoạt' },
    { value: 'Active', label: 'Đang hiệu lực' },
    { value: 'Expired', label: 'Hết hạn' },
];

const CLAIM_STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'Pending', label: 'Mới' },
    { value: 'Confirmed', label: 'Đã xác nhận' },
    { value: 'Rejected', label: 'Từ chối' },
    { value: 'Received', label: 'Đã tiếp nhận' },
    { value: 'Diagnosing', label: 'Đang chẩn đoán' },
    { value: 'Repairing', label: 'Đang sửa' },
    { value: 'Completed', label: 'Hoàn tất' },
    { value: 'Cancelled', label: 'Đã hủy' },
];

const AdminWarranty = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('warranties');
    const [warranties, setWarranties] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [creatingRepairId, setCreatingRepairId] = useState(null);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        status: '',
        serialOrImei: '',
        phone: '',
    });
    const [claimFilters, setClaimFilters] = useState({
        keyword: '',
        status: '',
        serialOrImei: '',
        phone: '',
    });
    const [claimStatusById, setClaimStatusById] = useState({});
    const [claimNoteById, setClaimNoteById] = useState({});
    const [claimRejectReasonById, setClaimRejectReasonById] = useState({});
    const [openClaimId, setOpenClaimId] = useState(null);
    const [claimUpdatesById, setClaimUpdatesById] = useState({});

    const readError = (err, fallback) => {
        const data = err?.response?.data;
        return data?.message || data?.detail || data?.title || fallback;
    };

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [wRes, cRes] = await Promise.all([
                warrantyApi.getAll({ page: 1, pageSize: 200 }),
                warrantyApi.getClaimsAll({ page: 1, pageSize: 200 }),
            ]);
            setWarranties(Array.isArray(wRes.data) ? wRes.data : []);
            setClaims(Array.isArray(cRes.data) ? cRes.data : []);
        } catch (err) {
            setError(readError(err, 'Không tải được dữ liệu bảo hành.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filteredWarranties = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const status = filters.status.trim();
        const serial = filters.serialOrImei.trim().toLowerCase();
        const phone = filters.phone.trim();
        return warranties
            .map(normalizeWarranty)
            .filter((w) => {
                if (status && w.status !== status) return false;
                if (serial && String(w.serialOrImei || '').toLowerCase() !== serial) return false;
                if (phone && String(w.customerPhone || '') !== phone) return false;
                if (!keyword) return true;
                return [
                    w.warrantyCode,
                    w.orderCode,
                    w.productName,
                    w.serialOrImei,
                    w.customerName,
                    w.customerPhone,
                    w.status,
                    w.id,
                ]
                    .map((x) => String(x || '').toLowerCase())
                    .join(' ')
                    .includes(keyword);
            });
    }, [warranties, filters]);

    const filteredClaims = useMemo(() => {
        const keyword = claimFilters.keyword.trim().toLowerCase();
        const status = claimFilters.status.trim();
        const serial = claimFilters.serialOrImei.trim().toLowerCase();
        const phone = claimFilters.phone.trim();
        return claims
            .map(normalizeClaim)
            .filter((c) => {
                if (status && c.status !== status) return false;
                if (serial && String(c.serialOrImei || '').toLowerCase() !== serial) return false;
                if (phone && String(c.customerPhone || '') !== phone) return false;
                if (!keyword) return true;
                return [
                    c.claimCode,
                    c.warrantyCode,
                    c.productName,
                    c.serialOrImei,
                    c.customerName,
                    c.customerPhone,
                    c.status,
                    c.id,
                ]
                    .map((x) => String(x || '').toLowerCase())
                    .join(' ')
                    .includes(keyword);
            });
    }, [claims, claimFilters]);

    const activeFilterCount = (filters.keyword.trim() ? 1 : 0) + (filters.status ? 1 : 0) + (filters.serialOrImei.trim() ? 1 : 0) + (filters.phone.trim() ? 1 : 0);
    const activeClaimFilterCount = (claimFilters.keyword.trim() ? 1 : 0) + (claimFilters.status ? 1 : 0) + (claimFilters.serialOrImei.trim() ? 1 : 0) + (claimFilters.phone.trim() ? 1 : 0);

    const warrantyStats = useMemo(() => {
        const items = warranties.map(normalizeWarranty);
        const countBy = (value) => items.filter((x) => x.status === value).length;
        return {
            total: items.length,
            notActivated: countBy('NotActivated'),
            active: countBy('Active'),
            expired: countBy('Expired'),
        };
    }, [warranties]);

    const claimStats = useMemo(() => {
        const items = claims.map(normalizeClaim);
        const countBy = (value) => items.filter((x) => x.status === value).length;
        return {
            total: items.length,
            pending: countBy('Pending'),
            confirmed: countBy('Confirmed'),
            repairing: countBy('Repairing'),
            completed: countBy('Completed'),
            rejected: countBy('Rejected'),
        };
    }, [claims]);

    const handleActivate = async (id) => {
        setUpdatingId(id);
        setError('');
        try {
            await warrantyApi.activateAdmin(id);
            toast('Đã kích hoạt bảo hành', 'success');
            await load();
        } catch (err) {
            setError(readError(err, 'Không kích hoạt được bảo hành.'));
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleClaim = async (claimId) => {
        const next = openClaimId === claimId ? null : claimId;
        setOpenClaimId(next);
        if (!next) return;
        if (claimUpdatesById[next]) return;
        try {
            const res = await warrantyApi.getClaimUpdates(next);
            setClaimUpdatesById((p) => ({ ...p, [next]: Array.isArray(res.data) ? res.data : [] }));
        } catch {
            setClaimUpdatesById((p) => ({ ...p, [next]: [] }));
        }
    };

    const handleUpdateClaimStatus = async (id) => {
        const status = String(claimStatusById[id] || '').trim();
        if (!status) return;
        setUpdatingId(id);
        setError('');
        try {
            await warrantyApi.updateClaimStatus(id, {
                status,
                note: claimNoteById[id] || null,
                rejectedReason: claimRejectReasonById[id] || null,
            });
            toast('Đã cập nhật trạng thái yêu cầu', 'success');
            setClaimNoteById((p) => ({ ...p, [id]: '' }));
            setClaimRejectReasonById((p) => ({ ...p, [id]: '' }));
            await load();
        } catch (err) {
            setError(readError(err, 'Không cập nhật được yêu cầu bảo hành.'));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCreateRepair = async (claim) => {
        const id = claim.id;
        setCreatingRepairId(id);
        setError('');
        try {
            const res = await repairApi.intake({
                warrantyClaimId: id,
                serialOrImei: claim.serialOrImei || null,
                customerName: claim.customerName || null,
                customerPhone: claim.customerPhone || null,
                issueDescription: claim.issueDescription || null,
            });
            toast('Đã tạo phiếu sửa chữa', 'success');
            navigate('/admin/repairs');
        } catch (err) {
            setError(readError(err, 'Không tạo được phiếu sửa chữa.'));
        } finally {
            setCreatingRepairId(null);
        }
    };

    return (
        <div className="px-4 py-6">
            <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Hỗ trợ</p>
                        <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Bảo hành</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex overflow-hidden rounded-md border border-[var(--color-border)]">
                            <button
                                type="button"
                                onClick={() => setTab('warranties')}
                                className={`px-4 py-2 text-sm font-semibold ${tab === 'warranties' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]'}`}
                            >
                                Danh sách bảo hành
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('claims')}
                                className={`px-4 py-2 text-sm font-semibold ${tab === 'claims' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]'}`}
                            >
                                Yêu cầu bảo hành
                            </button>
                        </div>
                        <AdminFilterDropdown
                            open={isFilterMenuOpen}
                            onOpenChange={setIsFilterMenuOpen}
                            label="Bộ lọc"
                            activeCount={tab === 'warranties' ? activeFilterCount : activeClaimFilterCount}
                        >
                            {tab === 'warranties' ? (
                                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setIsFilterMenuOpen(false); }}>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Từ khóa</span>
                                        <input className={inputClass} value={filters.keyword} onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Trạng thái</span>
                                        <select className={inputClass} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                                            {WARRANTY_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Serial/IMEI</span>
                                        <input className={inputClass} value={filters.serialOrImei} onChange={(e) => setFilters((p) => ({ ...p, serialOrImei: e.target.value }))} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">SĐT</span>
                                        <input className={inputClass} value={filters.phone} onChange={(e) => setFilters((p) => ({ ...p, phone: e.target.value }))} />
                                    </label>
                                </form>
                            ) : (
                                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setIsFilterMenuOpen(false); }}>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Từ khóa</span>
                                        <input className={inputClass} value={claimFilters.keyword} onChange={(e) => setClaimFilters((p) => ({ ...p, keyword: e.target.value }))} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Trạng thái</span>
                                        <select className={inputClass} value={claimFilters.status} onChange={(e) => setClaimFilters((p) => ({ ...p, status: e.target.value }))}>
                                            {CLAIM_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Serial/IMEI</span>
                                        <input className={inputClass} value={claimFilters.serialOrImei} onChange={(e) => setClaimFilters((p) => ({ ...p, serialOrImei: e.target.value }))} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">SĐT</span>
                                        <input className={inputClass} value={claimFilters.phone} onChange={(e) => setClaimFilters((p) => ({ ...p, phone: e.target.value }))} />
                                    </label>
                                </form>
                            )}
                        </AdminFilterDropdown>
                        <button
                            type="button"
                            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]"
                            onClick={load}
                            disabled={loading}
                        >
                            Làm mới
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 border-b border-[var(--color-border)] px-4 py-4 md:grid-cols-4">
                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Tổng bảo hành</div>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-fg)]">{warrantyStats.total}</div>
                        <div className="mt-2 text-xs text-[var(--color-fg-muted)]">Chưa kích hoạt: {warrantyStats.notActivated} • Active: {warrantyStats.active} • Hết hạn: {warrantyStats.expired}</div>
                    </div>
                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Yêu cầu bảo hành</div>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-fg)]">{claimStats.total}</div>
                        <div className="mt-2 text-xs text-[var(--color-fg-muted)]">Mới: {claimStats.pending} • Xác nhận: {claimStats.confirmed} • Từ chối: {claimStats.rejected}</div>
                    </div>
                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Đang xử lý</div>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-fg)]">{claimStats.repairing}</div>
                        <div className="mt-2 text-xs text-[var(--color-fg-muted)]">Theo claim status = Repairing</div>
                    </div>
                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Hoàn tất</div>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-fg)]">{claimStats.completed}</div>
                        <div className="mt-2 text-xs text-[var(--color-fg-muted)]">Theo claim status = Completed</div>
                    </div>
                </div>

                {error && (
                    <div className="border-b border-[var(--color-border)] px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="p-6 text-sm text-[var(--color-fg-muted)]">Đang tải...</div>
                ) : tab === 'warranties' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead className="bg-[var(--color-surface-2)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
                                <tr>
                                    <th className="px-4 py-3">Mã BH</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3">Serial/IMEI</th>
                                    <th className="px-4 py-3">Kích hoạt</th>
                                    <th className="px-4 py-3">Hết hạn</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)] text-sm">
                                {filteredWarranties.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-6 text-center text-[var(--color-fg-muted)]">Không có dữ liệu.</td></tr>
                                ) : filteredWarranties.map((w) => (
                                    <tr key={w.id} className="hover:bg-[var(--color-surface-2)]/30">
                                        <td className="px-4 py-3 font-semibold">{w.warrantyCode}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-[var(--color-fg)]">{w.customerName || '-'}</div>
                                            <div className="text-xs text-[var(--color-fg-muted)]">{w.customerPhone || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">{w.productName || '-'}</td>
                                        <td className="px-4 py-3">{w.serialOrImei || '-'}</td>
                                        <td className="px-4 py-3">{formatDate(w.activatedAt)}</td>
                                        <td className="px-4 py-3">{formatDate(w.expiresAt)}</td>
                                        <td className="px-4 py-3">{w.status || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            {w.status === 'NotActivated' ? (
                                                <button
                                                    type="button"
                                                    className="rounded-md border border-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-60"
                                                    onClick={() => handleActivate(w.id)}
                                                    disabled={updatingId === w.id}
                                                >
                                                    {updatingId === w.id ? 'Đang kích hoạt...' : 'Kích hoạt'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-[var(--color-fg-dim)]">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead className="bg-[var(--color-surface-2)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
                                <tr>
                                    <th className="px-4 py-3">Mã yêu cầu</th>
                                    <th className="px-4 py-3">Mã BH</th>
                                    <th className="px-4 py-3">Thiết bị</th>
                                    <th className="px-4 py-3">Serial/IMEI</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Ngày tạo</th>
                                    <th className="px-4 py-3 text-right">Xử lý</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)] text-sm">
                                {filteredClaims.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-6 text-center text-[var(--color-fg-muted)]">Không có dữ liệu.</td></tr>
                                ) : filteredClaims.map((c) => (
                                    <tr key={c.id} className="align-top hover:bg-[var(--color-surface-2)]/30">
                                        <td className="px-4 py-3 font-semibold">
                                            <button type="button" className="text-left text-[var(--color-accent)] hover:underline" onClick={() => toggleClaim(c.id)}>
                                                {c.claimCode}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">{c.warrantyCode || '-'}</td>
                                        <td className="px-4 py-3">{c.productName || '-'}</td>
                                        <td className="px-4 py-3">{c.serialOrImei || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-[var(--color-fg)]">{c.customerName || '-'}</div>
                                            <div className="text-xs text-[var(--color-fg-muted)]">{c.customerPhone || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">{c.status || '-'}</td>
                                        <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="grid w-72 grid-cols-1 gap-2">
                                                    <select
                                                        className={inputClass}
                                                        value={claimStatusById[c.id] ?? ''}
                                                        onChange={(e) => setClaimStatusById((p) => ({ ...p, [c.id]: e.target.value }))}
                                                    >
                                                        <option value="">Chọn trạng thái...</option>
                                                        {CLAIM_STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                                                            <option key={o.value} value={o.value}>{o.value}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        className={inputClass}
                                                        placeholder="Ghi chú"
                                                        value={claimNoteById[c.id] ?? ''}
                                                        onChange={(e) => setClaimNoteById((p) => ({ ...p, [c.id]: e.target.value }))}
                                                    />
                                                    <input
                                                        className={inputClass}
                                                        placeholder="Lý do từ chối (nếu có)"
                                                        value={claimRejectReasonById[c.id] ?? ''}
                                                        onChange={(e) => setClaimRejectReasonById((p) => ({ ...p, [c.id]: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] disabled:opacity-60"
                                                        onClick={() => handleUpdateClaimStatus(c.id)}
                                                        disabled={updatingId === c.id}
                                                    >
                                                        {updatingId === c.id ? 'Đang lưu...' : 'Cập nhật'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-60"
                                                        onClick={() => handleCreateRepair(c)}
                                                        disabled={creatingRepairId === c.id}
                                                    >
                                                        {creatingRepairId === c.id ? 'Đang tạo...' : 'Tạo repair'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]"
                                                        onClick={() => toggleClaim(c.id)}
                                                    >
                                                        {openClaimId === c.id ? 'Đóng' : 'Chi tiết'}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )).flatMap((row, idx) => {
                                    const claim = filteredClaims[idx];
                                    if (!claim || openClaimId !== claim.id) return [row];
                                    const updates = claimUpdatesById[claim.id] || [];
                                    return [
                                        row,
                                        (
                                            <tr key={`${claim.id}-details`} className="bg-[var(--color-background)]">
                                                <td colSpan={8} className="px-4 py-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                                            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Mô tả lỗi</div>
                                                            <div className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-fg)]">{claim.issueDescription || '-'}</div>
                                                            <div className="mt-3 text-xs text-[var(--color-fg-muted)]">Hình thức: {claim.receiveMethod || '-'}</div>
                                                        </div>
                                                        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                                            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Timeline</div>
                                                            {updates.length === 0 ? (
                                                                <div className="mt-2 text-sm text-[var(--color-fg-muted)]">Chưa có cập nhật.</div>
                                                            ) : (
                                                                <div className="mt-2 space-y-2">
                                                                    {updates.map((u) => (
                                                                        <div key={u.id ?? u.Id} className="flex items-start justify-between gap-3 text-sm">
                                                                            <div>
                                                                                <div className="font-semibold text-[var(--color-fg)]">{u.title ?? u.Title ?? '-'}</div>
                                                                                {(u.message ?? u.Message) && <div className="text-xs text-[var(--color-fg-muted)]">{u.message ?? u.Message}</div>}
                                                                            </div>
                                                                            <div className="ts-mono text-[10px] text-[var(--color-fg-dim)]">{formatDate(u.createdAt ?? u.CreatedAt)}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    ];
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminWarranty;
