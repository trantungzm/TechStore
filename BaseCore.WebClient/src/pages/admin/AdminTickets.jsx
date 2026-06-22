import React, { useEffect, useMemo, useState } from 'react';
import { ticketApi } from '../../services/api';
import AdminFilterDropdown from '../../components/admin/AdminFilterDropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../hooks/useTickets';

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

const inputClass = 'w-full rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100';

const ticketStatusText = (value) => TICKET_STATUS_LABELS[value] || value || 'Không rõ';
const priorityText = (value) => PRIORITY_LABELS[value] || value || 'Không rõ';

const normalize = (t) => ({
    id: t.id ?? t.Id,
    userId: t.userId ?? t.UserId ?? null,
    subject: t.subject ?? t.Subject,
    description: t.description ?? t.Description,
    status: t.status ?? t.Status,
    priority: t.priority ?? t.Priority ?? 'Normal',
    createdAt: t.createdAt ?? t.CreatedAt,
    updatedAt: t.updatedAt ?? t.UpdatedAt,
    category: t.category ?? t.Category ?? 'Khác',
    serialOrImei: t.serialOrImei ?? t.SerialOrImei ?? t.stockItem?.serialOrImei ?? t.StockItem?.SerialOrImei ?? null,
    updates: t.updates ?? t.Updates ?? [],
});

const statusClass = (value) => {
    const s = String(value || '').toLowerCase();
    if (s === 'open') return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]';
    if (s === 'inprogress') return 'bg-[var(--color-surface-2)] text-amber-300';
    if (s === 'waitingcustomer') return 'bg-violet-50 text-violet-700';
    if (s === 'resolved') return 'bg-emerald-500/10 text-emerald-300';
    if (s === 'closed') return 'bg-[var(--color-surface-3)] text-[var(--color-fg)]';
    if (s === 'cancelled') return 'bg-red-500/10 text-red-300';
    return 'bg-[var(--color-surface-3)] text-[var(--color-fg)]';
};

const priorityClass = (value) => {
    const p = String(value || '').toLowerCase();
    if (p === 'urgent') return 'bg-red-500/10 text-red-300';
    if (p === 'high') return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]';
    if (p === 'low') return 'bg-[var(--color-surface-3)] text-[var(--color-fg)]';
    return 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]';
};

const splitMessageParts = (text) => {
    const raw = String(text || '').trim();
    if (!raw) return { text: '', images: [] };
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const images = [];
    const textLines = [];

    const isImageUrl = (url) => {
        if (url.startsWith('data:image/')) return true;
        const lower = url.toLowerCase();
        if (!(lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('/'))) return false;
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) => lower.endsWith(ext));
    };

    lines.forEach((line) => {
        if (isImageUrl(line)) images.push(line);
        else textLines.push(line);
    });

    return { text: textLines.join('\n'), images };
};

const REPLY_TEMPLATES = {
    Review: [
        { id: 'thank', label: 'Cảm ơn đánh giá', message: 'Cảm ơn bạn đã dành thời gian đánh giá sản phẩm. Chúng tôi rất trân trọng ý kiến của bạn và sẽ tiếp tục cải thiện để phục vụ bạn tốt hơn.' },
        { id: 'apology', label: 'Xin lỗi & Giải quyết', message: 'Chúng tôi xin lỗi về trải nghiệm không tốt của bạn. Vui lòng liên hệ với chúng tôi qua hotline hoặc đến cửa hàng gần nhất để được hỗ trợ và giải quyết vấn đề.' },
        { id: 'technical', label: 'Hỗ trợ kỹ thuật', message: 'Cảm ơn phản hồi của bạn. Về vấn đề kỹ thuật bạn gặp phải, vui lòng cung cấp thêm thông tin chi tiết để đội ngũ kỹ thuật của chúng tôi có thể hỗ trợ bạn tốt hơn.' },
    ],
    QA: [
        { id: 'general', label: 'Trả lời chung', message: 'Cảm ơn bạn đã đặt câu hỏi. Chúng tôi sẽ phản hồi chi tiết trong thời gian sớm nhất.' },
        { id: 'stock', label: 'Kiểm tra tồn kho', message: 'Về tình trạng tồn kho, vui lòng liên hệ trực tiếp với cửa hàng để kiểm tra số lượng thực tế tại thời điểm bạn cần.' },
        { id: 'warranty', label: 'Chính sách bảo hành', message: 'Sản phẩm của chúng tôi được bảo hành theo chính sách của hãng. Bạn có thể xem chi tiết chính sách bảo hành tại trang bảo hành hoặc liên hệ hotline để được tư vấn.' },
    ],
    Contact: [
        { id: 'received', label: 'Đã nhận thông tin', message: 'Chúng tôi đã nhận được thông tin liên hệ của bạn. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24-48 giờ làm việc.' },
        { id: 'escalate', label: 'Chuyển chuyên gia', message: 'Vấn đề của bạn đã được chuyển đến đội ngũ chuyên gia để xử lý. Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.' },
        { id: 'resolved', label: 'Đã giải quyết', message: 'Vấn đề của bạn đã được giải quyết. Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ lại với chúng tôi.' },
    ],
};

const AdminTickets = () => {
    const { user } = useAuth();
    const canOperate = (user?.role || '') === 'Technical'; // Admin chỉ xem; thao tác do Technical
    const { tickets, loading, error, setError, reload } = useTickets();
    const [updatingId, setUpdatingId] = useState(null);
    const [noteById, setNoteById] = useState({});
    const [statusById, setStatusById] = useState({});
    const [priorityById, setPriorityById] = useState({});
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filters, setFilters] = useState({ keyword: '', status: '', priority: '' });
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [selectedTemplateById, setSelectedTemplateById] = useState({});

    const filteredTickets = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const status = filters.status.trim().toLowerCase();
        const priority = filters.priority.trim().toLowerCase();
        return tickets.filter((raw) => {
            const ticket = normalize(raw);
            if (status && String(ticket.status || '').toLowerCase() !== status) return false;
            if (priority && String(ticket.priority || '').toLowerCase() !== priority) return false;
            if (!keyword) return true;
            return [ticket.subject, ticket.description, ticket.serialOrImei, ticket.userId, ticket.id]
                .map((value) => String(value || '').toLowerCase())
                .join(' ')
                .includes(keyword);
        });
    }, [tickets, filters]);

    useEffect(() => {
        setPage(1);
    }, [filters.keyword, filters.status, filters.priority]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTickets.length / pageSize)), [filteredTickets.length]);

    useEffect(() => {
        setPage((current) => Math.min(Math.max(1, current), totalPages));
    }, [totalPages]);

    const pagedTickets = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredTickets.slice(start, start + pageSize);
    }, [filteredTickets, page]);

    const activeFilterCount = (filters.keyword.trim() ? 1 : 0) + (filters.status ? 1 : 0) + (filters.priority ? 1 : 0);
    const from = filteredTickets.length ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, filteredTickets.length);

    const handleUpdate = async (ticketId) => {
        setUpdatingId(ticketId);
        setError('');
        try {
            const ticket = tickets.find(t => t.id === ticketId);
            let newStatus = statusById[ticketId] || null;
            
            // Automatic status transition logic
            if (!newStatus && ticket) {
                if (ticket.status === 'Open') {
                    newStatus = 'InProgress';
                } else if (ticket.status === 'InProgress') {
                    newStatus = 'WaitingCustomer';
                } else if (ticket.status === 'WaitingCustomer') {
                    newStatus = 'Resolved';
                }
            }
            
            await ticketApi.addUpdate(ticketId, {
                message: noteById[ticketId] || null,
                statusAfter: newStatus,
                priorityAfter: priorityById[ticketId] || null,
            });
            setNoteById((prev) => ({ ...prev, [ticketId]: '' }));
            setStatusById((prev) => ({ ...prev, [ticketId]: '' }));
            setSelectedTemplateById((prev) => ({ ...prev, [ticketId]: '' }));
            await reload();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không cập nhật được ticket.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleTemplateSelect = (ticketId, templateId) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        const templates = REPLY_TEMPLATES[ticket.category] || [];
        const template = templates.find(t => t.id === templateId);
        
        if (template) {
            setNoteById((prev) => ({ ...prev, [ticketId]: template.message }));
            setSelectedTemplateById((prev) => ({ ...prev, [ticketId]: templateId }));
        }
    };

    return (
        <div className="px-4 py-6">
            <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Hỗ trợ</p>
                        <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Ticket hỗ trợ</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <AdminFilterDropdown open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen} label="Bộ lọc" activeCount={activeFilterCount}>
                            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setIsFilterMenuOpen(false); }}>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Từ khóa</span>
                                    <input className={inputClass} value={filters.keyword} onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))} />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Trạng thái</span>
                                    <select className={inputClass} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                                        <option value="">Tất cả</option>
                                        {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Độ ưu tiên</span>
                                    <select className={inputClass} value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}>
                                        <option value="">Tất cả</option>
                                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                </label>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]" onClick={() => setFilters({ keyword: '', status: '', priority: '' })}>Xóa lọc</button>
                                    <button type="submit" className="rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)]">Đóng</button>
                                </div>
                            </form>
                        </AdminFilterDropdown>
                        <button type="button" className="rounded-md border border-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-60" onClick={reload} disabled={loading}>
                            Làm mới
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {!canOperate && (
                        <div className="mb-4 rounded-md border border-amber-200 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-400">
                            Chế độ chỉ xem — thao tác nghiệp vụ dành cho nhân viên Hỗ trợ kỹ thuật (Technical).
                        </div>
                    )}
                    {error && <div className="mb-4 rounded-md border border-rose-200 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300">{error}</div>}
                    {loading ? (
                        <div className="py-12 text-center text-sm font-semibold text-[var(--color-fg-muted)]">Đang tải ticket...</div>
                    ) : (
                        <>
                            <div className="ts-table-container">
                                <table className="ts-table">
                                    <thead>
                                        <tr>
                                            <th className="ts-table-col-narrow">ID</th>
                                            <th className="ts-table-col-auto">Nội dung</th>
                                            <th className="ts-table-col-medium ts-table-hide-mobile">Trạng thái</th>
                                            <th className="ts-table-col-medium ts-table-hide-tablet">Ngày tạo</th>
                                            <th className="ts-table-col-wide text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedTickets.map((raw) => {
                                            const ticket = normalize(raw);
                                            return (
                                                <tr key={ticket.id} className="align-top">
                                                    <td className="font-semibold text-[var(--color-fg)]">
                                                        #{ticket.id}
                                                        <span className="block mt-1 text-[10px] text-[var(--color-accent)] uppercase tracking-wider font-bold">
                                                            {ticket.category === 'QA' ? 'Hỏi Đáp' : ticket.category === 'Contact' ? 'Liên Hệ' : ticket.category === 'Review' ? 'Đánh Giá' : ticket.category}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="font-bold text-[var(--color-fg)]">
                                                            {ticket.subject || '-'}
                                                            {ticket.serialOrImei && <span className="ml-2 font-mono text-xs text-[var(--color-fg-muted)]">({ticket.serialOrImei})</span>}
                                                        </div>
                                                        <div className="mt-1 max-w-[460px] whitespace-pre-wrap text-sm text-[var(--color-fg-muted)]">
                                                            {(() => {
                                                                if (!ticket.description) return '-';
                                                                if (ticket.category === 'Review' || String(ticket.description).startsWith('{')) {
                                                                    try {
                                                                        const parsed = JSON.parse(ticket.description);
                                                                        return (
                                                                            <div className="space-y-1 rounded border border-dashed border-[var(--color-border)] p-2 bg-[var(--color-surface-2)] text-xs mt-2">
                                                                                {parsed.rating && <div><strong className="text-[var(--color-fg)]">Đánh giá:</strong> {parsed.rating} sao</div>}
                                                                                {parsed.content && <div><strong className="text-[var(--color-fg)]">Nội dung:</strong> {parsed.content}</div>}
                                                                                {parsed.experienceRatings && Object.keys(parsed.experienceRatings).length > 0 && (
                                                                                    <div><strong className="text-[var(--color-fg)]">Tiêu chí:</strong> {Object.entries(parsed.experienceRatings).map(([k,v]) => `${k} (${v}/5)`).join(', ')}</div>
                                                                                )}
                                                                                {parsed.images && parsed.images.length > 0 && (
                                                                                    <div className="flex gap-2 mt-2">
                                                                                        {parsed.images.map((img, i) => <img key={i} src={img} alt="review" className="h-10 w-10 object-cover rounded border border-[var(--color-border)]" />)}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    } catch(e) {
                                                                        // Fallback to text
                                                                    }
                                                                }
                                                                return ticket.description;
                                                            })()}
                                                        </div>
                                                        {ticket.updates?.length > 0 && (
                                                            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                                                <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-fg-muted)]">Trao đổi</div>
                                                                {ticket.updates.map((update, index) => {
                                                                    const actor = update.actorUserId || update.ActorUserId || null;
                                                                    const owner = ticket.userId || null;
                                                                    const byText = update.by || update.By || (actor && owner && String(actor).toLowerCase() === String(owner).toLowerCase() ? 'Customer' : 'Support');
                                                                    const isCustomer = String(byText).toLowerCase() === 'customer';
                                                                    const parts = splitMessageParts(update.message || update.Message || '');
                                                                    const createdAt = update.createdAt || update.CreatedAt;
                                                                    return (
                                                                        <div key={`${ticket.id}-${index}`} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                                                                            <div className={`max-w-[78%] rounded-md px-3 py-2 ${isCustomer ? 'bg-blue-600 text-white' : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg)]'}`}>
                                                                                <div className={`text-xs font-semibold ${isCustomer ? 'text-blue-100' : 'text-[var(--color-fg-muted)]'}`}>
                                                                                    {isCustomer ? 'Khách hàng' : 'Hỗ trợ'} - {createdAt ? new Date(createdAt).toLocaleString() : '-'}
                                                                                </div>
                                                                                {parts.text && <div className="mt-1 whitespace-pre-wrap">{parts.text}</div>}
                                                                                {parts.images.length > 0 && (
                                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                                        {parts.images.map((url) => (
                                                                                            <a key={url} href={url} target="_blank" rel="noreferrer">
                                                                                                <img src={url} alt="Đính kèm" className="h-20 w-20 rounded-md object-cover" />
                                                                                            </a>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col items-start gap-2">
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityClass(ticket.priority)}`}>{priorityText(ticket.priority)}</span>
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(ticket.status)}`}>{ticketStatusText(ticket.status)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-[var(--color-fg-muted)]">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}</td>
                                                    {canOperate ? (
                                                        <td className="px-4 py-3">
                                                            <div className="space-y-2">
                                                                <select className={inputClass} value={priorityById[ticket.id] ?? ''} onChange={(e) => setPriorityById((prev) => ({ ...prev, [ticket.id]: e.target.value }))}>
                                                                    <option value="">-- Độ ưu tiên --</option>
                                                                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                                                </select>
                                                                <select className={inputClass} value={statusById[ticket.id] ?? ''} onChange={(e) => setStatusById((prev) => ({ ...prev, [ticket.id]: e.target.value }))}>
                                                                    <option value="">-- Trạng thái --</option>
                                                                    {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                                                </select>
                                                                {REPLY_TEMPLATES[ticket.category] && (
                                                                    <select className={inputClass} value={selectedTemplateById[ticket.id] ?? ''} onChange={(e) => handleTemplateSelect(ticket.id, e.target.value)}>
                                                                        <option value="">-- Mẫu phản hồi --</option>
                                                                        {REPLY_TEMPLATES[ticket.category].map((template) => (
                                                                            <option key={template.id} value={template.id}>{template.label}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                                <input className={inputClass} placeholder="Ghi chú / phản hồi" value={noteById[ticket.id] ?? ''} onChange={(e) => setNoteById((prev) => ({ ...prev, [ticket.id]: e.target.value }))} />
                                                                <button type="button" className="w-full rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)] disabled:opacity-60" onClick={() => handleUpdate(ticket.id)} disabled={updatingId === ticket.id}>
                                                                    {updatingId === ticket.id ? 'Đang cập nhật...' : 'Cập nhật'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    ) : (
                                                        <td className="px-4 py-3 text-xs text-[var(--color-fg-dim)]">Chỉ xem</td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                        {!pagedTickets.length && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-sm font-semibold text-[var(--color-fg-muted)]">Chưa có ticket phù hợp.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
                                <div>Hiển thị {from}-{to} trong {filteredTickets.length} ticket</div>
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
    );
};

export default AdminTickets;
