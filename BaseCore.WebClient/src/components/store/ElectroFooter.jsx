import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../contexts/StoreSettingsContext';

const footerGroups = [
    {
        title: 'Hỗ trợ khách hàng',
        links: [
            { label: 'Trung tâm hỗ trợ', to: '/tickets' },
            { label: 'Lịch sử đơn hàng', to: '/orders' },
            { label: 'Sản phẩm yêu thích', to: '/wishlist' },
            { label: 'So sánh sản phẩm', to: '/compare' },
        ],
    },
    {
        title: 'Chính sách',
        links: [
            { label: 'Bảo hành', to: '/warranty' },
            { label: 'Thông tin vận chuyển', to: '/shop' },
            { label: 'Đổi trả', to: '/tickets' },
            { label: 'Điều khoản & điều kiện', to: '/' },
        ],
    },
    {
        title: 'Về TechStore',
        links: [
            { label: 'Giới thiệu', to: '/' },
            { label: 'Khuyến mãi', to: '/promotion' },
            { label: 'Sản phẩm', to: '/shop' },
            { label: 'Liên hệ', to: '/tickets' },
        ],
    },
];

const ElectroFooter = () => {
    const settings = useStoreSettings();
    const storeName = settings.storeName || 'TechStore';
    const contactItems = [
        settings.address && { icon: 'fas fa-map-marker-alt', title: 'Địa chỉ', text: settings.address },
        settings.supportEmail && { icon: 'fas fa-envelope', title: 'Email', text: settings.supportEmail },
        settings.hotline && { icon: 'fas fa-phone-alt', title: 'Hotline', text: settings.hotline },
        settings.supportTime && { icon: 'fas fa-clock', title: 'Giờ làm việc', text: settings.supportTime },
    ].filter(Boolean);
    const socials = [
        settings.facebookUrl && { icon: 'fab fa-facebook-f', href: settings.facebookUrl, label: 'Facebook' },
        settings.zaloUrl && { icon: 'fas fa-comment-dots', href: settings.zaloUrl, label: 'Zalo' },
    ].filter(Boolean);

    return (
        <footer className="mt-24 pb-6">
            <div className="ts-container">
                <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-glass)] shadow-[var(--shadow-soft)] backdrop-blur-xl">
                    {/* dải gradient mảnh ở mép trên */}
                    <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)]" />

                    {/* Hàng thông tin liên hệ */}
                    {contactItems.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 border-b border-[var(--color-border)] px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
                            {contactItems.map((item) => (
                                <div key={item.title} className="flex items-start gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-[0_10px_24px_-8px_var(--color-primary)]">
                                        <i className={item.icon}></i>
                                    </span>
                                    <div className="min-w-0">
                                        <p className="ts-eyebrow mb-1 text-[10px]">{item.title}</p>
                                        <p className="text-sm leading-snug text-[var(--color-fg-muted)] break-words">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Thân footer */}
                    <div className="grid grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
                        {/* Cột thương hiệu */}
                        <div>
                            <Link to="/" className="ts-display text-2xl text-[var(--color-fg)]">
                                Tech<span className="ts-gradient-text">Store</span>
                            </Link>
                            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-fg-muted)]">
                                Sản phẩm công nghệ được tuyển chọn — chính hãng, bảo hành minh bạch, dịch vụ tận tâm.
                            </p>

                            <p className="ts-eyebrow mb-3 mt-7">Đăng ký nhận bản tin</p>
                            <form
                                onSubmit={(event) => event.preventDefault()}
                                className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white/80 p-1 shadow-[var(--shadow-soft)] transition-colors focus-within:border-[var(--color-primary)]"
                            >
                                <input
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-faint)] focus:outline-none"
                                />
                                <button type="submit" className="ts-btn ts-btn-primary shrink-0 px-4 py-2 text-xs">
                                    Đăng ký
                                </button>
                            </form>

                            {socials.length > 0 && (
                                <div className="mt-6 flex items-center gap-2.5">
                                    {socials.map((s) => (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={s.label}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white/70 text-[var(--color-fg-muted)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                        >
                                            <i className={s.icon}></i>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Các cột liên kết */}
                        {footerGroups.map((group) => (
                            <div key={group.title}>
                                <p className="ts-eyebrow mb-5 text-[var(--color-primary)]">{group.title}</p>
                                <ul className="space-y-3">
                                    {group.links.map((link) => (
                                        <li key={`${group.title}-${link.label}`}>
                                            <Link
                                                to={link.to}
                                                className="group inline-flex items-center text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
                                            >
                                                <span className="mr-2 inline-block h-px w-3 bg-[var(--color-border-strong)] transition-all group-hover:w-5 group-hover:bg-[var(--color-primary)]" />
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Hàng tiện ích: thanh toán & vận chuyển */}
                    <div className="grid grid-cols-1 gap-6 border-t border-[var(--color-border)] px-6 py-6 sm:grid-cols-2 lg:px-10">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="ts-eyebrow mr-1">Thanh toán</p>
                            {['COD', 'Chuyển khoản', 'Ví điện tử'].map((label) => (
                                <span key={label} className="ts-pill">{label}</span>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <p className="ts-eyebrow mr-1">Vận chuyển</p>
                            {['Giao hàng nhanh', 'Giao tiết kiệm', 'VNPost'].map((label) => (
                                <span key={label} className="ts-pill">{label}</span>
                            ))}
                        </div>
                    </div>

                    {/* Dòng bản quyền */}
                    <div className="flex flex-col items-center justify-between gap-2 border-t border-[var(--color-border)] bg-white/40 px-6 py-5 text-center md:flex-row md:text-left lg:px-10">
                        <p className="text-xs text-[var(--color-fg-dim)]">
                            © {new Date().getFullYear()}{' '}
                            <Link to="/" className="text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-primary)]">{storeName}</Link>
                            {' '}· Bản quyền được bảo lưu.
                        </p>
                        <p className="text-xs text-[var(--color-fg-dim)]">
                            Chính hãng · Đổi trả · Bảo hành · Giao nhanh · Thanh toán an toàn
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ElectroFooter;
