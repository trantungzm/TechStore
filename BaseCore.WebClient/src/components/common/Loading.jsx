import React from 'react';

// Spinner toàn màn — dùng khi đang xác thực / tải trang.
export const FullScreenLoading = () => (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-white via-[var(--color-background)] to-[var(--color-surface-2)]">
        <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]"
            role="status"
            aria-label="Loading"
        />
    </div>
);

// Spinner nội tuyến — kích thước tuỳ chọn qua className.
export const Spinner = ({ className = 'h-6 w-6' }) => (
    <div
        className={`${className} animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]`}
        role="status"
        aria-label="Loading"
    />
);

export default FullScreenLoading;
