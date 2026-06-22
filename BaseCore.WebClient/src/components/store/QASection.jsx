import React from 'react';

// Nội dung tab "Hỏi & đáp": form đặt câu hỏi + danh sách hỏi-đáp.
// State/logic ở trang cha, truyền qua props (renderReplies, formatRelativeTime).
export default function QASection({
    onSubmit,
    questionInput,
    onQuestionChange,
    questionError,
    questionMsg,
    questions = [],
    expandedIds = [],
    onToggle,
    renderReplies,
    formatRelativeTime,
}) {
    return (
        <div className="space-y-6">
            <form onSubmit={onSubmit} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="ts-eyebrow text-[var(--color-accent)]">Hỏi chúng tôi</p>
                <h4 className="ts-display mt-2 text-lg">Đặt câu hỏi về sản phẩm</h4>
                <textarea
                    rows="3"
                    value={questionInput}
                    onChange={onQuestionChange}
                    placeholder="Viết câu hỏi của bạn..."
                    className="ts-input mt-3 resize-none"
                />
                {questionError && <p className="mt-2 text-xs text-red-400">{questionError}</p>}
                {questionMsg && <p className="mt-2 text-xs text-emerald-400">{questionMsg}</p>}
                <button type="submit" className="ts-btn ts-btn-primary mt-3 text-xs">Gửi câu hỏi</button>
            </form>

            {questions.length > 0 ? (
                <div className="space-y-3">
                    {questions.map((item) => {
                        const expanded = expandedIds.includes(item.id);
                        const hasAnswer = Array.isArray(item.repliesTree) && item.repliesTree.length > 0;
                        return (
                            <article key={item.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-fg-muted)]">
                                        {String(item.customerName || 'K')[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <strong className="text-sm text-[var(--color-fg)]">{item.customerName}</strong>
                                            <span className="text-[11px] text-[var(--color-fg-dim)]">{formatRelativeTime(item.createdAt)}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{item.question}</p>
                                        <div className="mt-2 flex items-center gap-3 text-[11px]">
                                            {hasAnswer ? (
                                                <button type="button" onClick={() => onToggle(item.id)} className="text-[var(--color-accent)] hover:underline">
                                                    {expanded ? 'Thu gọn phản hồi' : 'Xem phản hồi'}
                                                </button>
                                            ) : (
                                                <span className="text-[var(--color-fg-dim)]">Đang chờ phản hồi</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {hasAnswer && expanded && renderReplies(item.repliesTree)}
                            </article>
                        );
                    })}
                </div>
            ) : (
                <p className="rounded-md border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-fg-dim)]">Chưa có câu hỏi nào cho sản phẩm này.</p>
            )}
        </div>
    );
}
