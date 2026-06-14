import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHero from '../../components/store/PageHero';
import { ticketApi } from '../../services/api';
import { isStoreViewOnlyUser, setPageMeta, STORE_VIEW_ONLY_MESSAGE, t, toast } from '../../utils/store';
import { cn } from '../../utils/cn';

const formatTime = (value) => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    } catch {
        return '';
    }
};

const statusLabel = (value) => ({
    Open: 'Mở',
    InProgress: 'Đang xử lý',
    WaitingCustomer: 'Chờ khách',
    Resolved: 'Đã xử lý',
    Closed: 'Đã đóng',
    Cancelled: 'Đã hủy',
}[value] || value || 'Không rõ');

const Tickets = () => {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const { user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState(ticketId ? Number(ticketId) : null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const selected = useMemo(() => tickets.find((x) => x.id === selectedId) || null, [tickets, selectedId]);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await ticketApi.getMy();
            const items = Array.isArray(res.data) ? res.data : [];
            items.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
            setTickets(items);

            if (items.length) {
                const requestedId = ticketId ? Number(ticketId) : null;
                const foundId = requestedId && items.some((x) => x.id === requestedId) ? requestedId : items[0].id;
                setSelectedId(foundId);
                if (!ticketId || foundId !== requestedId) {
                    navigate(`/tickets/${foundId}`, { replace: true });
                }
            }
        } catch (e) {
            const data = e.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không tải được danh sách ticket.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPageMeta({ title: `Tickets | TechStore`, description: 'Trao đổi với bộ phận hỗ trợ.' });
        load();
    }, []);

    const handleSend = async () => {
        if (!selected) return;
        if (isViewOnly) return toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
        if (!message.trim()) return toast('Vui lòng nhập nội dung.', 'danger');
        setSending(true);
        try {
            await ticketApi.addUpdate(selected.id, { message: message.trim() });
            setMessage('');
            await load();
            toast('Đã gửi tin nhắn.', 'success');
        } catch (e) {
            const data = e.response?.data;
            toast(data?.message || data?.detail || data?.title || 'Không gửi được tin nhắn.', 'danger');
        } finally {
            setSending(false);
        }
    };

    const updates = (selected?.updates || []).slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return (
        <>
            <PageHero title="Ticket hỗ trợ" current="Ticket hỗ trợ" kicker="Tài khoản" />
            <section className="ts-container py-12">
                <div className="mb-8">
                    <p className="ts-eyebrow text-[var(--color-accent)]">Tài khoản</p>
                    <h2 className="ts-display mt-2 text-3xl">Trao đổi với hỗ trợ</h2>
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">Xem lại ticket và nhắn tin với admin.</p>
                </div>

                {error && (
                    <div className="mb-5 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                            <div className="text-sm font-semibold text-[var(--color-fg)]">Danh sách ticket</div>
                            <button type="button" className="ts-btn ts-btn-outline text-xs" onClick={load} disabled={loading}>
                                <i className="fas fa-rotate"></i>Làm mới
                            </button>
                        </div>
                        <div className="max-h-[520px] overflow-auto">
                            {loading ? (
                                <div className="px-4 py-6 text-sm text-[var(--color-fg-muted)]">Đang tải...</div>
                            ) : tickets.length === 0 ? (
                                <div className="px-4 py-6 text-sm text-[var(--color-fg-muted)]">Chưa có ticket nào.</div>
                            ) : (
                                tickets.map((item) => {
                                    const active = item.id === selectedId;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className={cn(
                                                "w-full border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors",
                                                active ? "bg-[var(--color-surface-2)]" : "hover:bg-[var(--color-surface-2)]/70"
                                            )}
                                            onClick={() => {
                                        setSelectedId(item.id);
                                        navigate(`/tickets/${item.id}`);
                                    }}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-[var(--color-fg)]">{item.subject}</div>
                                                    <div className="mt-0.5 truncate text-xs text-[var(--color-fg-muted)]">{item.ticketCode}</div>
                                                </div>
                                                <span className="shrink-0 rounded-sm border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-fg-muted)]">
                                                    {statusLabel(item.status)}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--color-fg-muted)]">
                                                <span className="truncate">{item.category}</span>
                                                <span>{formatTime(item.updatedAt || item.createdAt)}</span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                        <div className="border-b border-[var(--color-border)] px-4 py-3">
                            <div className="text-sm font-semibold text-[var(--color-fg)]">{selected?.subject || 'Chọn ticket để xem'}</div>
                            {selected && (
                                <div className="mt-1 text-xs text-[var(--color-fg-muted)]">
                                    {selected.ticketCode} • {statusLabel(selected.status)} • {selected.priority}
                                </div>
                            )}
                        </div>

                        <div className="max-h-[420px] overflow-auto px-4 py-4">
                            {!selected ? (
                                <div className="text-sm text-[var(--color-fg-muted)]">Chọn ticket ở danh sách bên trái.</div>
                            ) : updates.length === 0 ? (
                                <div className="text-sm text-[var(--color-fg-muted)]">Chưa có nội dung trao đổi.</div>
                            ) : (
                                <div className="space-y-3">
                                    {updates.map((u) => (
                                        <div key={u.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2">
                                            <div className="whitespace-pre-wrap text-sm text-[var(--color-fg)]">{u.message}</div>
                                            <div className="mt-1 text-[10px] text-[var(--color-fg-muted)]">{formatTime(u.createdAt)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[var(--color-border)] px-4 py-3">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
                                    placeholder="Nhập tin nhắn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    disabled={!selected || sending}
                                />
                                <button type="button" className="ts-btn ts-btn-primary" onClick={handleSend} disabled={!selected || sending}>
                                    Gửi
                                </button>
                            </div>
                            <div className="mt-1 text-[10px] text-[var(--color-fg-muted)]">{t('Enter')} để gửi.</div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Tickets;
