import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ticketApi } from '../../services/api';
import { isStoreViewOnlyUser, STORE_VIEW_ONLY_MESSAGE } from '../../utils/store';
import { cn } from '../../utils/cn';

const SUPPORT_CATEGORY = 'Contact';

const isClosedStatus = (status) => ['Closed', 'Resolved', 'Cancelled'].includes(status);

const pickContactTicket = (tickets) => {
    const contacts = (tickets || []).filter((t) => String(t?.category || '').toLowerCase() === SUPPORT_CATEGORY.toLowerCase());
    if (!contacts.length) return null;

    const byNewest = (a, b) => {
        const at = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (bt !== at) return bt - at;
        return Number(b?.id || 0) - Number(a?.id || 0);
    };

    const openContacts = contacts.filter((t) => !isClosedStatus(t?.status));
    openContacts.sort(byNewest);
    if (openContacts.length) return openContacts[0];

    contacts.sort(byNewest);
    return contacts[0];
};

const formatTime = (value) => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

const appendMessageOnce = (messages, newMessage) => {
    if (!newMessage) return messages;
    if (newMessage.id != null && messages.some((message) => message.id === newMessage.id)) {
        return messages;
    }
    return [...messages, newMessage];
};

export default function ChatWidget() {
    const { isAuthenticated, user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [loadingTicket, setLoadingTicket] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const connectionRef = useRef(null);
    const scrollRef = useRef(null);

    const canShow = useMemo(() => true, []);

    useEffect(() => {
        if (!isOpen || !isAuthenticated) return undefined;
        let cancelled = false;

        const load = async () => {
            setLoadingTicket(true);
            try {
                const res = await ticketApi.getMy();
                const items = res.data || [];
                const contactTickets = items.filter((t) => String(t?.category || '').toLowerCase() === SUPPORT_CATEGORY.toLowerCase());
                let active = pickContactTicket(contactTickets);

                if (!active && contactTickets.length === 0 && !isViewOnly) {
                    const created = await ticketApi.create({
                        category: SUPPORT_CATEGORY,
                        subject: 'Liên hệ hỗ trợ',
                        description: 'Khoi tao hoi thoai ho tro.',
                        customerName: user?.name || user?.username || 'Khach hang',
                    });
                    active = created?.data || null;
                }
                if (cancelled) return;
                setTicketId(active?.id || null);
                setMessages(active?.updates || []);
            } catch {
                if (!cancelled) {
                    setTicketId(null);
                    setMessages([]);
                }
            } finally {
                if (!cancelled) setLoadingTicket(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [isOpen, isAuthenticated, isViewOnly, user?.name, user?.username]);

    useEffect(() => {
        if (!isOpen || !ticketId || !isAuthenticated) return undefined;
        const token = localStorage.getItem('token');
        if (!token) return undefined;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl('/techstoreChatHub', {
                accessTokenFactory: () => localStorage.getItem('token') || '',
            })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.on('ReceiveMessage', (newMessage) => {
            setMessages((prev) => appendMessageOnce(prev, newMessage));
        });

        connection.onreconnected(() => {
            connection.invoke('JoinTicketRoom', String(ticketId)).catch(() => { });
        });

        connection
            .start()
            .then(() => connection.invoke('JoinTicketRoom', String(ticketId)))
            .catch(() => { });

        return () => {
            connection.off('ReceiveMessage');
            connection.stop();
            connectionRef.current = null;
        };
    }, [isOpen, ticketId, isAuthenticated]);

    useEffect(() => {
        if (!isOpen) return;
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [isOpen, messages.length]);

    useEffect(() => {
        if (isAuthenticated) return;
        setIsOpen(false);
        setLoadingTicket(false);
        setTicketId(null);
        setMessages([]);
        setInputText('');
        if (connectionRef.current) {
            try {
                connectionRef.current.stop();
            } catch { }
            connectionRef.current = null;
        }
    }, [isAuthenticated]);

    const handleSendMessage = async () => {
        const text = inputText.trim();
        if (!text || !ticketId || sending) return;
        if (isViewOnly) {
            setInputText(STORE_VIEW_ONLY_MESSAGE);
            return;
        }
        setInputText('');
        setSending(true);
        try {
            const response = await ticketApi.addUpdate(ticketId, {
                message: text,
                senderName: user?.name || user?.username || 'Khach hang',
            });
            // Do not depend on the SignalR echo: the connection can still be
            // joining/reconnecting when the REST request finishes.
            setMessages((prev) => appendMessageOnce(prev, response?.data));
        } catch {
            setInputText(text);
        } finally {
            setSending(false);
        }
    };

    if (!canShow) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[70] font-sans">
            <div className="relative">
                {!isOpen && (
                    <div className="pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-full bg-[var(--color-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--color-fg)] shadow-lg ring-1 ring-[var(--color-border)] animate-pulse">
                        Liên hệ hỗ trợ
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsOpen((v) => !v)}
                    className={cn(
                        "relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-2xl transition hover:bg-[var(--color-primary)]/90",
                        !isOpen && "ring-4 ring-[var(--color-primary)]/25"
                    )}
                    aria-label="Liên hệ hỗ trợ"
                >
                    {!isOpen && (
                        <>
                            <span className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-30 animate-ping" />
                            <span className="absolute -inset-1 rounded-full bg-[var(--color-primary)] opacity-25 blur-md animate-pulse" />
                        </>
                    )}
                    <i className={cn('fas relative z-10 text-lg', isOpen ? 'fa-times' : 'fa-headset')} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute bottom-14 right-0 mt-3 flex h-[26rem] w-[20rem] flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
                    <div className="flex items-center justify-between bg-[var(--color-primary)] px-4 py-3 text-white">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold">Liên hệ riêng tư</div>
                            <div className="text-[11px] opacity-90">Kênh hỗ trợ kỹ thuật</div>
                        </div>
                    </div>

                    {!isAuthenticated ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--color-background)] px-6 text-center">
                            <div className="text-sm font-semibold text-[var(--color-fg)]">Vui lòng đăng nhập</div>
                            <div className="text-xs text-[var(--color-fg-dim)]">Đăng nhập để liên hệ riêng tư với kỹ thuật viên.</div>
                            <button
                                type="button"
                                onClick={() => navigate('/login', { state: { from: location } })}
                                className="ts-btn ts-btn-primary w-full justify-center"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    ) : (
                        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-background)] px-4 py-3">
                        {loadingTicket && (
                            <div className="text-xs text-[var(--color-fg-dim)]">Đang tải hội thoại...</div>
                        )}
                        {!loadingTicket && !ticketId && (
                            <div className="text-xs text-[var(--color-fg-dim)]">Bạn chưa có ticket đang hoạt động.</div>
                        )}
                        {messages.map((msg) => (
                            <div key={`${msg.id}-${msg.createdAt}`} className={cn('flex flex-col gap-1', msg.isAdminReply ? 'items-start' : 'items-end')}>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-[var(--color-fg-dim)]">{msg.senderName || (msg.isAdminReply ? 'Admin' : 'Khach hang')}</span>
                                    {msg.isAdminReply && (
                                        <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-400">Admin</span>
                                    )}
                                    <span className="text-[10px] text-[var(--color-fg-dim)]">{formatTime(msg.createdAt)}</span>
                                </div>
                                <div
                                    className={cn(
                                        'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                                        msg.isAdminReply
                                            ? 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]'
                                            : 'bg-[var(--color-accent)] text-white'
                                    )}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        </div>
                    )}

                    {isAuthenticated && (
                        <div className="flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-primary)]"
                                disabled={!ticketId || sending}
                            />
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                className={cn(
                                    'rounded-md px-3 py-2 text-sm font-semibold text-white',
                                    ticketId && !sending ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90' : 'bg-[var(--color-border)]'
                                )}
                                disabled={!ticketId || sending}
                            >
                                Gửi
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
