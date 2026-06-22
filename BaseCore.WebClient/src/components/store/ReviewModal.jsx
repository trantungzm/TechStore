import React from 'react';

// Modal form gửi đánh giá sản phẩm. Mọi state/logic vẫn ở trang cha, truyền qua props
// (kể cả component StarPicker) để giữ nguyên hành vi, chỉ tách phần giao diện ra cho gọn.
export default function ReviewModal({
    open,
    onClose,
    onSubmit,
    productName,
    image,
    StarPicker,
    rating,
    onRatingChange,
    experienceItems = [],
    experienceRatings = {},
    onExperienceChange,
    content,
    onContentChange,
    onImageChange,
    images = [],
    onRemoveImage,
    error,
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <h4 className="ts-display text-lg">Đánh giá & nhận xét</h4>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>
                <form onSubmit={onSubmit} className="max-h-[70vh] overflow-y-auto p-5">
                    <div className="mb-4 flex items-center gap-3 rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] p-2">
                        {image ? (
                            <img src={image} alt={productName} className="h-12 w-12 rounded-sm object-contain" />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--color-surface-2)] text-[var(--color-fg-dim)]">
                                <i className="far fa-image"></i>
                            </div>
                        )}
                        <strong className="text-sm text-[var(--color-fg)]">{productName}</strong>
                    </div>

                    <div className="mb-5">
                        <p className="ts-eyebrow mb-2 text-[10px]">Đánh giá chung</p>
                        <StarPicker value={rating} onChange={onRatingChange} />
                    </div>

                    <div className="mb-5">
                        <p className="ts-eyebrow mb-2 text-[10px]">Theo trải nghiệm</p>
                        <div className="space-y-2">
                            {experienceItems.map((criterion) => (
                                <div key={criterion} className="flex items-center justify-between gap-3 rounded-sm border border-[var(--color-border)] px-3 py-2">
                                    <span className="text-xs text-[var(--color-fg-muted)]">{criterion}</span>
                                    <StarPicker
                                        value={experienceRatings[criterion] || 0}
                                        onChange={(r) => onExperienceChange(criterion, r)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
                        <textarea
                            rows="4"
                            value={content}
                            onChange={onContentChange}
                            placeholder="Chia sẻ cảm nhận về sản phẩm (tối thiểu 15 ký tự)"
                            className="ts-input resize-none"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="ts-btn ts-btn-outline inline-flex cursor-pointer text-xs">
                            <input type="file" accept="image/*" multiple onChange={onImageChange} disabled={images.length >= 3} className="hidden" />
                            <i className="fas fa-camera"></i>Thêm hình ảnh
                        </label>
                        {images.length > 0 && (
                            <div className="mt-3 flex gap-2">
                                {images.map((img) => (
                                    <div key={img.id} className="relative">
                                        <img src={img.preview} alt={img.name} className="h-16 w-16 rounded-sm object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => onRemoveImage(img.id)}
                                            aria-label="Xóa ảnh"
                                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] text-white"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="mb-4 rounded-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

                    <button type="submit" className="ts-btn ts-btn-primary w-full">Gửi đánh giá</button>
                </form>
            </div>
        </div>
    );
}
