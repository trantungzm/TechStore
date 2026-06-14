import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

const VARIANT = {
    success: { ring: 'border-emerald-500/40 bg-emerald-50 text-emerald-800', icon: 'fa-circle-check', dot: 'text-emerald-600' },
    danger: { ring: 'border-red-500/40 bg-red-50 text-red-800', icon: 'fa-circle-exclamation', dot: 'text-red-600' },
    warning: { ring: 'border-amber-500/40 bg-amber-50 text-amber-800', icon: 'fa-triangle-exclamation', dot: 'text-amber-600' },
    info: { ring: 'border-sky-500/40 bg-sky-50 text-sky-800', icon: 'fa-circle-info', dot: 'text-sky-600' },
};

/**
 * Mount 1 lần ở App: lắng nghe sự kiện 'app:toast' và 'app:confirm' để hiển thị
 * thông báo nổi + hộp xác nhận đẹp thay cho alert()/confirm() mặc định của trình duyệt.
 */
const AppNotifications = () => {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);
    const [promptState, setPromptState] = useState(null);
    const [promptValue, setPromptValue] = useState('');
    const timers = useRef({});

    // ----- Toasts -----
    useEffect(() => {
        const onToast = (e) => {
            const { message, variant = 'info' } = e.detail || {};
            if (!message) return;
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToasts((list) => [...list, { id, message, variant }]);
            timers.current[id] = window.setTimeout(() => {
                setToasts((list) => list.filter((t) => t.id !== id));
                delete timers.current[id];
            }, 3800);
        };
        window.addEventListener('app:toast', onToast);
        return () => window.removeEventListener('app:toast', onToast);
    }, []);

    const dismissToast = (id) => {
        window.clearTimeout(timers.current[id]);
        delete timers.current[id];
        setToasts((list) => list.filter((t) => t.id !== id));
    };

    // ----- Confirm dialog -----
    useEffect(() => {
        const onConfirm = (e) => setConfirmState(e.detail || null);
        window.addEventListener('app:confirm', onConfirm);
        return () => window.removeEventListener('app:confirm', onConfirm);
    }, []);

    useEffect(() => {
        if (!confirmState) return undefined;
        const onKey = (ev) => {
            if (ev.key === 'Escape') resolveConfirm(false);
            if (ev.key === 'Enter') resolveConfirm(true);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [confirmState]);

    const resolveConfirm = (result) => {
        confirmState?.resolve?.(result);
        setConfirmState(null);
    };

    // ----- Prompt dialog -----
    useEffect(() => {
        const onPrompt = (e) => {
            const { message, defaultValue = '' } = e.detail || {};
            setPromptValue(defaultValue);
            setPromptState(e.detail || null);
        };
        window.addEventListener('app:prompt', onPrompt);
        return () => window.removeEventListener('app:prompt', onPrompt);
    }, []);

    useEffect(() => {
        if (!promptState) return undefined;
        const onKey = (ev) => {
            if (ev.key === 'Escape') resolvePrompt(null);
            if (ev.key === 'Enter') resolvePrompt(promptValue);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [promptState, promptValue]);

    const resolvePrompt = (result) => {
        promptState?.resolve?.(result);
        setPromptState(null);
        setPromptValue('');
    };

    const danger = confirmState?.tone === 'danger';

    return (
        <>
            {/* Toasts: góc trên-phải, xếp chồng */}
            <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-2">
                {toasts.map((t) => {
                    const v = VARIANT[t.variant] || VARIANT.info;
                    return (
                        <div
                            key={t.id}
                            role="status"
                            className={cn(
                                'ts-anim-fade-down pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur',
                                v.ring
                            )}
                        >
                            <i className={cn('fas mt-0.5 text-base', v.icon, v.dot)} />
                            <span className="flex-1 text-sm font-medium leading-snug">{t.message}</span>
                            <button
                                type="button"
                                onClick={() => dismissToast(t.id)}
                                aria-label="Đóng"
                                className="shrink-0 text-current/60 transition hover:text-current"
                            >
                                <i className="fas fa-xmark text-xs" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Hộp xác nhận */}
            {confirmState && (
                <div
                    className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => resolveConfirm(false)}
                >
                    <div
                        className="ts-anim-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center px-6 pt-6 text-center">
                            <div className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-full',
                                danger ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'
                            )}>
                                <i className={cn('fas text-xl', danger ? 'fa-triangle-exclamation' : 'fa-circle-question')} />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[var(--color-fg)]">
                                {confirmState.title || 'Xác nhận'}
                            </h3>
                            {confirmState.message && (
                                <p className="mt-1.5 text-sm text-[var(--color-fg-muted)]">{confirmState.message}</p>
                            )}
                        </div>
                        <div className="mt-6 flex gap-2 border-t border-[var(--color-border)] p-4">
                            <button
                                type="button"
                                onClick={() => resolveConfirm(false)}
                                className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]"
                            >
                                {confirmState.cancelText || 'Hủy'}
                            </button>
                            <button
                                type="button"
                                onClick={() => resolveConfirm(true)}
                                className={cn(
                                    'flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm',
                                    danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[var(--color-primary)] hover:opacity-90'
                                )}
                            >
                                {confirmState.confirmText || 'Đồng ý'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hộp nhập liệu (Prompt) */}
            {promptState && (
                <div
                    className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => resolvePrompt(null)}
                >
                    <div
                        className="ts-anim-scale-in w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col px-6 pt-6">
                            {promptState.message && (
                                <p className="text-sm text-[var(--color-fg-muted)]">{promptState.message}</p>
                            )}
                            <input
                                autoFocus
                                type="text"
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                placeholder={promptState.placeholder || ''}
                                className="mt-4 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100 bg-[var(--color-background)]"
                            />
                        </div>
                        <div className="mt-6 flex gap-2 border-t border-[var(--color-border)] p-4">
                            <button
                                type="button"
                                onClick={() => resolvePrompt(null)}
                                className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => resolvePrompt(promptValue)}
                                className="flex-1 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AppNotifications;
