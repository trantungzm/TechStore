import React from 'react';

// Nội dung tab "Đánh giá": tóm tắt sao + phân bố + danh sách review.
// State/logic ở trang cha, truyền qua props (kể cả component Stars).
export default function ReviewsSection({
    reviewMsg,
    reviews = [],
    summary,
    visibleReviews = [],
    showAll,
    onToggleShowAll,
    onWriteReview,
    Stars,
}) {
    return (
        <div>
            {reviewMsg && (
                <div className="mb-4 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">{reviewMsg}</div>
            )}
            {reviews.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    <aside className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                        <p className="ts-display text-4xl">{summary.average.toFixed(1)}<span className="text-base text-[var(--color-fg-dim)]">/5</span></p>
                        <Stars value={summary.average} />
                        <p className="mt-2 text-xs text-[var(--color-fg-muted)]">{summary.total} đánh giá</p>
                        <div className="mt-4 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="ts-mono w-6 text-[var(--color-fg-dim)]">{star}★</span>
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-3)]">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)]"
                                            style={{ width: `${summary.total ? (summary.distribution[star] / summary.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="ts-mono w-6 text-right text-[var(--color-fg-muted)]">{summary.distribution[star]}</span>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={onWriteReview} className="ts-btn ts-btn-primary mt-5 w-full text-xs">Viết đánh giá</button>
                    </aside>

                    <div className="space-y-4">
                        {visibleReviews.map((review) => (
                            <article key={review.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h5 className="text-sm font-semibold text-[var(--color-fg)]">{review.customerName}</h5>
                                        <span className="text-[11px] text-[var(--color-fg-dim)]">{review.date}</span>
                                    </div>
                                    <Stars value={review.rating} />
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">{review.content}</p>
                                {Object.keys(review.experienceRatings || {}).length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {Object.entries(review.experienceRatings).map(([k, v]) => (
                                            <span key={k} className="ts-pill">{k}: {v}/5</span>
                                        ))}
                                    </div>
                                )}
                                {review.images?.length > 0 && (
                                    <div className="mt-3 flex gap-2">
                                        {review.images.map((image, i) => (
                                            <img key={i} src={image} alt="" className="h-20 w-20 rounded-sm object-cover" />
                                        ))}
                                    </div>
                                )}
                                {review.adminResponses?.length > 0 && (
                                    <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
                                        {review.adminResponses.map((response, i) => (
                                            <div key={i} className="rounded-md bg-[var(--color-surface-2)] p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <i className="fas fa-headset text-[var(--color-accent)] text-xs"></i>
                                                    <span className="text-xs font-semibold text-[var(--color-accent)]">{response.adminName}</span>
                                                    <span className="text-[10px] text-[var(--color-fg-dim)]">{response.createdAt ? new Date(response.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                                                </div>
                                                <p className="text-sm text-[var(--color-fg-muted)]">{response.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}
                        {reviews.length > 3 && (
                            <button type="button" onClick={onToggleShowAll} className="ts-btn ts-btn-ghost w-full text-xs">
                                {showAll ? 'Thu gọn' : `Xem thêm ${reviews.length - 3} đánh giá`}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center rounded-md border border-dashed border-[var(--color-border)] py-16 text-center">
                    <i className="far fa-comment text-3xl text-[var(--color-fg-dim)]"></i>
                    <p className="mt-4 text-sm text-[var(--color-fg-muted)]">Chưa có đánh giá nào cho sản phẩm này.</p>
                    <button type="button" onClick={onWriteReview} className="ts-btn ts-btn-primary mt-4 text-xs">Viết đánh giá đầu tiên</button>
                </div>
            )}
        </div>
    );
}
