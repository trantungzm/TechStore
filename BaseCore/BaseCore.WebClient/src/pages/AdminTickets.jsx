import React, { useEffect, useMemo, useState } from 'react';
import { ticketApi } from '../services/api';
import AdminFilterDropdown from '../components/AdminFilterDropdown';

const TICKET_STATUS_LABELS = {
    Open: 'Mới mở',
    InProgress: 'Đang xử lý',
    WaitingCustomer: 'Chờ khách phản hồi',
    Resolved: 'Đã xử lý',
    Closed: 'Đã đóng',
    Cancelled: 'Đã hủy',
};

const PRIORITY_LABELS = {
    Low: 'Thấp',
    Normal: 'Bình thường',
    High: 'Cao',
    Urgent: 'Khẩn cấp',
};

const ticketStatusText = (value) => TICKET_STATUS_LABELS[value] || value || 'Không rõ';
const priorityText = (value) => PRIORITY_LABELS[value] || value || 'Không rõ';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [noteById, setNoteById] = useState({});
    const [statusById, setStatusById] = useState({});
    const [priorityById, setPriorityById] = useState({});
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filters, setFilters] = useState({ keyword: '', status: '', priority: '' });
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await ticketApi.getAll();
            setTickets(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không tải được ticket.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const normalize = (t) => ({
        id: t.id ?? t.Id,
        userId: t.userId ?? t.UserId ?? null,
        subject: t.subject ?? t.Subject,
        description: t.description ?? t.Description,
        status: t.status ?? t.Status,
        priority: t.priority ?? t.Priority ?? 'Normal',
        createdAt: t.createdAt ?? t.CreatedAt,
        updatedAt: t.updatedAt ?? t.UpdatedAt,
        stockItem: t.stockItem ?? t.StockItem ?? null,
        serialOrImei: t.serialOrImei ?? t.SerialOrImei ?? t.stockItem?.serialOrImei ?? t.StockItem?.SerialOrImei ?? null,
        updates: t.updates ?? t.Updates ?? [],
    });

    const filteredTickets = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const status = filters.status.trim().toLowerCase();
        const priority = filters.priority.trim().toLowerCase();
        return tickets.filter((raw) => {
            const t = normalize(raw);
            if (status && String(t.status || '').toLowerCase() !== status) return false;
            if (priority && String(t.priority || '').toLowerCase() !== priority) return false;
            if (!keyword) return true;
            const hay = [
                t.subject,
                t.description,
                t.serialOrImei,
                t.userId,
                t.id,
            ]
                .map((x) => String(x || '').toLowerCase())
                .join(' ');
            return hay.includes(keyword);
        });
    }, [tickets, filters.keyword, filters.status, filters.priority]);

    useEffect(() => {
        setPage(1);
    }, [filters.keyword, filters.status, filters.priority]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTickets.length / pageSize)), [filteredTickets.length]);

    useEffect(() => {
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const pagedTickets = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredTickets.slice(start, start + pageSize);
    }, [filteredTickets, page]);

    const activeFilterCount = (filters.keyword.trim() ? 1 : 0) + (filters.status ? 1 : 0) + (filters.priority ? 1 : 0);

    const statusBadge = (value) => {
        const s = String(value || '').toLowerCase();
        if (s === 'open') return 'badge-primary';
        if (s === 'inprogress') return 'badge-info';
        if (s === 'waitingcustomer') return 'badge-warning';
        if (s === 'resolved') return 'badge-success';
        if (s === 'pending') return 'badge-danger';
        if (s === 'closed') return 'badge-secondary';
        return 'badge-secondary';
    };

    const priorityBadge = (value) => {
        const p = String(value || '').toLowerCase();
        if (p === 'urgent') return 'badge-danger';
        if (p === 'high') return 'badge-warning';
        if (p === 'low') return 'badge-secondary';
        return 'badge-primary';
    };

    const splitMessageParts = (text) => {
        const raw = String(text || '').trim();
        if (!raw) return { text: '', images: [] };
        const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const imageUrls = [];
        const textLines = [];
        const isImageUrl = (url) => {
            if (url.startsWith('data:image/')) return true;
            const lower = url.toLowerCase();
            if (!(lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('/'))) return false;
            return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif');
        };
        lines.forEach((line) => {
            if (isImageUrl(line)) imageUrls.push(line);
            else textLines.push(line);
        });
        return { text: textLines.join('\n'), images: imageUrls };
    };

    const handleUpdate = async (ticketId) => {
        setUpdatingId(ticketId);
        setError('');
        try {
            await ticketApi.addUpdate(ticketId, {
                message: noteById[ticketId] || null,
                statusAfter: statusById[ticketId] || null,
                priorityAfter: priorityById[ticketId] || null,
            });
            setNoteById((prev) => ({ ...prev, [ticketId]: '' }));
            await load();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không cập nhật được ticket.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Ticket hỗ trợ</h3>
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
                                    {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Độ ưu tiên</label>
                                <select
                                    className="form-control"
                                    value={filters.priority}
                                    onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
                                >
                                    <option value="">Tất cả</option>
                                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setFilters({ keyword: '', status: '', priority: '' })}
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
                {error && <div className="alert alert-danger">{error}</div>}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="alert alert-light border mb-0">Chưa có ticket</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th style={{ width: 80 }}>ID</th>
                                    <th>Nội dung</th>
                                    <th style={{ width: 130 }}>Trạng thái</th>
                                    <th style={{ width: 200 }}>Ngày tạo</th>
                                    <th style={{ width: 260 }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedTickets.map((raw) => {
                                    const ticket = normalize(raw);
                                    return (
                                        <tr key={ticket.id}>
                                            <td>#{ticket.id}</td>
                                            <td>
                                                <div className="font-weight-bold">
                                                    {ticket.subject}
                                                    {ticket.serialOrImei && <span className="text-muted ml-2">({ticket.serialOrImei})</span>}
                                                </div>
                                                <div className="text-muted small">{ticket.description}</div>
                                                {ticket.updates?.length > 0 && (
                                                    <div className="mt-2 border rounded p-2 bg-white" style={{ maxHeight: 260, overflowY: 'auto' }}>
                                                        <div className="text-muted small mb-1">Trao đổi</div>
                                                        {ticket.updates.map((u, idx) => {
                                                            const actor = u.actorUserId || u.ActorUserId || null;
                                                            const owner = ticket.userId || null;
                                                            const byText = (() => {
                                                                if (u.by || u.By) return u.by || u.By;
                                                                if (!actor || !owner) return '';
                                                                return String(actor).toLowerCase() === String(owner).toLowerCase() ? 'Customer' : 'Support';
                                                            })();
                                                            const isCustomer = String(byText).toLowerCase() === 'customer';
                                                            const parts = splitMessageParts(u.message || u.Message || '');
                                                            const timeText = new Date(u.createdAt || u.CreatedAt).toLocaleString();
                                                            return (
                                                                <div key={idx} className={`d-flex ${isCustomer ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                                                                    <div
                                                                        className={`${isCustomer ? 'bg-primary text-white' : 'bg-light border'} p-2 rounded`}
                                                                        style={{ maxWidth: '78%', whiteSpace: 'pre-wrap' }}
                                                                    >
                                                                        <div className={`small ${isCustomer ? 'text-white-50' : 'text-muted'}`}>
                                                                            {byText} · {timeText}
                                                                        </div>
                                                                        {parts.text && <div className="mt-1">{parts.text}</div>}
                                                                        {parts.images.length > 0 && (
                                                                            <div className="mt-2 d-flex flex-wrap" style={{ gap: 8 }}>
                                                                                {parts.images.map((url) => (
                                                                                    <a key={url} href={url} target="_blank" rel="noreferrer">
                                                                                        <img src={url} alt="attachment" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 10 }} />
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        {(u.statusAfter || u.StatusAfter) && (
                                                                            <div className={`small mt-2 ${isCustomer ? 'text-white-50' : 'text-muted'}`}>
                                                                                Trạng thái: {ticketStatusText(u.statusAfter || u.StatusAfter)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column" style={{ gap: 6 }}>
                                                    <span className={`badge ${priorityBadge(ticket.priority)}`}>{priorityText(ticket.priority)}</span>
                                                    <span className={`badge ${statusBadge(ticket.status)}`}>{ticketStatusText(ticket.status)}</span>
                                                </div>
                                            </td>
                                            <td>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}</td>
                                            <td>
                                                <div className="d-flex flex-column" style={{ gap: 8 }}>
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={priorityById[ticket.id] ?? ''}
                                                        onChange={(e) => setPriorityById((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                                                    >
                                                        <option value="">-- Độ ưu tiên --</option>
                                                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={statusById[ticket.id] ?? ''}
                                                        onChange={(e) => setStatusById((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                                                    >
                                                        <option value="">-- Trạng thái --</option>
                                                        {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        className="form-control form-control-sm"
                                                        placeholder="Ghi chú / phản hồi"
                                                        value={noteById[ticket.id] ?? ''}
                                                        onChange={(e) => setNoteById((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                                                    />
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleUpdate(ticket.id)}
                                                        disabled={updatingId === ticket.id}
                                                    >
                                                        {updatingId === ticket.id ? 'Đang cập nhật...' : 'Cập nhật'}
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
                                Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTickets.length)} / {filteredTickets.length}
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
    );
};

export default AdminTickets;
