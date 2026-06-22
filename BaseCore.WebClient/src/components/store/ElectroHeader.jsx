import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useCompare } from '../../contexts/CompareContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useStoreSettings } from '../../contexts/StoreSettingsContext';
import { orderApi, productApi } from '../../services/api';
import { countUnseenOrderUpdates } from '../../utils/orderUpdates';
import { usePublicCoupons } from '../../hooks/usePublicCoupons';
import { getAvailableCouponsForProduct } from '../../utils/couponUtils';
import { formatCurrency, normalizeSearchText, resolveProductImage, t } from '../../utils/store';
import { cn } from '../../utils/cn';

const SEARCH_HISTORY_KEY = 'searchHistory';

const categoryNameMap = {
    Smartphone: 'Điện thoại',
    Laptop: 'Laptop',
    Audio: 'Tai nghe',
    Smartwatch: 'Đồng hồ thông minh',
    Camera: 'Máy ảnh',
};

const readSearchHistory = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 8) : [];
    } catch {
        return [];
    }
};

const writeSearchHistory = (keyword) => {
    const nextKeyword = String(keyword || '').trim();
    if (!nextKeyword) return readSearchHistory();
    const nextHistory = [
        nextKeyword,
        ...readSearchHistory().filter((item) => normalizeSearchText(item) !== normalizeSearchText(nextKeyword)),
    ].slice(0, 8);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));
    return nextHistory;
};

const getCategoryLabel = (product) => (
    categoryNameMap[product?.category?.name] || product?.category?.name || product?.categoryName || 'Sản phẩm'
);

const getProductSearchText = (product) => normalizeSearchText([
    product?.name,
    product?.title,
    product?.brand,
    product?.category?.name,
    product?.categoryName,
    product?.description,
    product?.sku,
    product?.tags,
    product?.specs,
].filter(Boolean).join(' '));

const getProductTrendScore = (product, index) => {
    const soldCount = Number(product?.soldCount || product?.sold || product?.totalSold || 0);
    const viewCount = Number(product?.viewCount || product?.views || 0);

    return (
        (product?.isTrending ? 100000 : 0) +
        (product?.isFeatured ? 50000 : 0) +
        (product?.isBestSeller ? 30000 : 0) +
        soldCount * 10 +
        viewCount -
        index / 1000
    );
};

const getProductPath = (product) => `/product/${product?.id}`;

const navItems = [
    { to: '/', label: 'Trang chủ', end: true },
    { to: '/shop', label: 'Cửa hàng' },
    { to: '/bestseller', label: 'Bán chạy' },
    { to: '/promotion', label: 'Khuyến mãi' },
    { to: '/warranty', label: 'Bảo hành' },
];

const ElectroHeader = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [hasOrderUpdates, setHasOrderUpdates] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState(() => readSearchHistory());
    const [searchProducts, setSearchProducts] = useState(() => {
        try {
            return productApi.getLocalCatalog?.() || [];
        } catch {
            return [];
        }
    });
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const headerRef = useRef(null);
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);
    const { user, isAuthenticated, canAccessAdminPanel, logout } = useAuth();
    const { itemCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { compareCount } = useCompare();
    const { coupons } = usePublicCoupons();
    const settings = useStoreSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const fullName = user?.name || user?.username || '';
    // Chỉ lấy chữ cuối của họ tên, vd "Trần Thanh Tùng" -> "Tùng".
    const shortName = fullName.trim().split(/\s+/).filter(Boolean).pop() || '';
    // Tài khoản admin chỉ hiển thị "Admin" trên ô user; còn lại hiển thị tên ngắn.
    const displayName = user?.role === 'Admin' ? 'Admin' : shortName;
    const dashboardLabel = fullName || t('My Dashboard');
    const trimmedKeyword = keyword.trim();

    // Hiện chấm đỏ ở ô user khi có đơn hàng vừa đổi trạng thái (so với lần xem gần nhất).
    useEffect(() => {
        if (!isAuthenticated) { setHasOrderUpdates(false); return undefined; }
        let active = true;
        const check = async () => {
            try {
                const res = await orderApi.getMyOrders();
                if (active) setHasOrderUpdates(countUnseenOrderUpdates(res.data || []) > 0);
            } catch { /* bỏ qua */ }
        };
        check();
        const onSeen = () => { if (active) setHasOrderUpdates(false); };
        window.addEventListener('orders:seen', onSeen);
        return () => { active = false; window.removeEventListener('orders:seen', onSeen); };
    }, [isAuthenticated]);

    const suggestedProducts = useMemo(() => {
        const normalizedKeyword = normalizeSearchText(trimmedKeyword);
        if (!normalizedKeyword) return [];
        return searchProducts
            .filter((product) => getProductSearchText(product).includes(normalizedKeyword))
            .slice(0, 6);
    }, [searchProducts, trimmedKeyword]);

    const trendingProducts = useMemo(() => searchProducts
        .map((product, index) => ({ product, score: getProductTrendScore(product, index) }))
        .sort((a, b) => b.score - a.score)
        .map(({ product }) => product)
        .slice(0, 8), [searchProducts]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setKeyword(params.get('search') || params.get('keyword') || '');
        setSearchOpen(false);
        setMobileNavOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const updateHeaderHeight = () => {
            const height = headerRef.current?.offsetHeight || 0;
            if (height > 0) {
                document.documentElement.style.setProperty('--electro-header-height', `${height}px`);
            }
        };

        updateHeaderHeight();
        window.addEventListener('resize', updateHeaderHeight);

        const observer = typeof ResizeObserver !== 'undefined' && headerRef.current
            ? new ResizeObserver(updateHeaderHeight)
            : null;
        observer?.observe(headerRef.current);

        return () => {
            window.removeEventListener('resize', updateHeaderHeight);
            observer?.disconnect();
        };
    }, []);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSearchOpen(false);
                setOpenDropdown(null);
                setMobileNavOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        let active = true;
        const loadProducts = async () => {
            try {
                const response = await productApi.getAll({ page: 1, pageSize: 1000 });
                const products = response.data?.items || [];
                if (active && products.length) {
                    setSearchProducts(products);
                }
            } catch (error) {
                console.error('Failed to load search suggestions', error);
            }
        };

        loadProducts();
        return () => {
            active = false;
        };
    }, []);

    const saveSearchKeyword = (value) => {
        const nextHistory = writeSearchHistory(value);
        setSearchHistory(nextHistory);
    };

    const scrollToPageTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const goToShopSearch = (value) => {
        const nextKeyword = String(value || '').trim();
        if (!nextKeyword) return;
        saveSearchKeyword(nextKeyword);
        setSearchOpen(false);
        navigate(`/shop?search=${encodeURIComponent(nextKeyword)}`);
        scrollToPageTop();
    };

    const findExactProductByName = (value) => {
        const normalizedKeyword = normalizeSearchText(String(value || '').trim());
        if (!normalizedKeyword) return null;
        return searchProducts.find((product) => normalizeSearchText(product.name || product.title) === normalizedKeyword) || null;
    };

    const goToProduct = (product) => {
        if (!product?.id) return;
        saveSearchKeyword(product.name || product.title);
        setSearchOpen(false);
        navigate(getProductPath(product));
        scrollToPageTop();
    };

    const handleSearch = (event) => {
        event.preventDefault();
        goToShopSearch(keyword);
    };

    const handleSuggestionClick = (product) => goToProduct(product);

    const handleHistoryClick = (item) => {
        const exactProduct = findExactProductByName(item);
        if (exactProduct) {
            goToProduct(exactProduct);
            return;
        }
        goToShopSearch(item);
    };

    const clearSearchHistory = () => {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
        setSearchHistory([]);
    };

    const handleLogout = () => {
        logout();
        setOpenDropdown(null);
        navigate('/');
        scrollToPageTop();
    };

    const closeMainMenus = () => {
        setMobileNavOpen(false);
        setOpenDropdown(null);
        setSearchOpen(false);
        scrollToPageTop();
    };

    const iconButtonClass = "relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white/70 text-[var(--color-fg-muted)] shadow-[var(--shadow-soft)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-fg)]";
    const badgeClass = "absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] px-1 text-[10px] font-semibold leading-none text-white shadow-md";

    // Icon hiển thị viền đen rỗng khi chưa có sản phẩm, đổ đen đặc khi đã có.
    const iconGlyphStyle = (filled) => filled
        ? { color: '#000' }
        : { color: 'transparent', WebkitTextStroke: '1px #000' };

    return (
        <header
            ref={headerRef}
            className={cn(
                "sticky top-0 z-50 w-full pt-3 backdrop-blur-xl transition-all duration-300",
                isScrolled
                    ? "drop-shadow-[0_20px_40px_rgba(37,99,235,0.08)]"
                    : ""
            )}
        >
            <div className="ts-container">
            <div className="flex h-[72px] w-full items-center gap-4 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface-glass)] px-4 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:px-6">
                {/* Logo */}
                <Link
                    to="/"
                    onClick={closeMainMenus}
                    className="group flex flex-1 items-center gap-2"
                >
                    <span className="ts-display text-2xl tracking-tight text-[var(--color-fg)] transition-transform duration-300 group-hover:scale-[1.03]">
                        Tech<span className="ts-gradient-text">Store</span>
                    </span>
                </Link>

                {/* Desktop nav - centered */}
                <nav className="hidden shrink-0 items-center gap-1 lg:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={closeMainMenus}
                            className={({ isActive }) => cn(
                                "relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-all",
                                isActive
                                    ? "bg-[var(--color-primary)]/10 text-[var(--color-fg)]"
                                    : "text-[var(--color-fg-dim)] hover:bg-white/65 hover:text-[var(--color-fg)]"
                            )}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right cluster: search + actions */}
                <div className="flex flex-1 items-center justify-end gap-2">
                {/* Search */}
                <div ref={searchRef} className="relative hidden w-40 md:block lg:w-52">
                    <form
                        onSubmit={handleSearch}
                        className={cn(
                            "flex h-11 items-center gap-2 rounded-xl border bg-white/78 px-4 shadow-[var(--shadow-soft)] backdrop-blur-md transition-colors",
                            searchOpen
                                ? "border-[var(--color-primary)] shadow-[0_0_0_3px_var(--color-primary-soft)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                        )}
                    >
                        <i className="fas fa-search text-xs text-[var(--color-fg-dim)]"></i>
                        <input
                            type="text"
                            placeholder="Bạn muốn mua gì"
                            value={keyword}
                            onFocus={() => setSearchOpen(true)}
                            onChange={(event) => {
                                setKeyword(event.target.value);
                                setSearchOpen(true);
                            }}
                            className="flex-1 bg-transparent text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-faint)] focus:outline-none"
                        />
                        {keyword && (
                            <button
                                type="button"
                                onClick={() => { setKeyword(''); }}
                                className="text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
                                aria-label="Xóa"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        )}
                    </form>

                    {searchOpen && (
                        <div className="absolute right-0 top-full mt-3 w-[min(420px,calc(100vw-2rem))] max-h-[78vh] overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-white/92 shadow-[var(--shadow-card)] backdrop-blur-xl ts-anim-fade-up">
                            {trimmedKeyword ? (
                                <div className="p-4">
                                    <p className="ts-eyebrow mb-3 text-[var(--color-primary)]">Kết quả gợi ý</p>
                                    {suggestedProducts.length > 0 ? (
                                        <ul className="space-y-1">
                                            {suggestedProducts.map((product) => {
                                                const hasSale = Number(product.oldPrice || 0) > Number(product.price || 0) || product.badge === 'Sale';
                                                const hasCoupon = getAvailableCouponsForProduct(product, coupons).length > 0;
                                                const inStock = Number(product.stock || 0) > 0;
                                                return (
                                                    <li key={product.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSuggestionClick(product)}
                                                            className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[var(--color-surface-2)]"
                                                        >
                                                            <img
                                                                src={resolveProductImage(product)}
                                                                alt={product.name || 'Sản phẩm'}
                                                                className="h-12 w-12 shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] object-cover"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-[var(--color-fg)]">{product.name || product.title}</p>
                                                                <p className="ts-mono mt-0.5 text-xs text-[var(--color-primary)]">{formatCurrency(product.price)}</p>
                                                                <div className="mt-1 flex flex-wrap gap-1">
                                                                    <span className={cn(
                                                                        "rounded-full px-1.5 py-0.5 text-[10px]",
                                                                        inStock ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                                                    )}>
                                                                        {inStock ? 'Còn hàng' : 'Hết hàng'}
                                                                    </span>
                                                                    {hasSale && <span className="rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] text-[var(--color-primary)]">Sale</span>}
                                                                    {hasCoupon && <span className="rounded-full bg-[var(--color-gold)]/15 px-1.5 py-0.5 text-[10px] text-[var(--color-gold)]">Voucher</span>}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="py-6 text-center text-sm text-[var(--color-fg-dim)]">
                                            Không tìm thấy sản phẩm phù hợp.
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => goToShopSearch(trimmedKeyword)}
                                        className="mt-3 block w-full border-t border-[var(--color-border)] py-3 text-center text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                                    >
                                        Xem tất cả kết quả cho "{trimmedKeyword}"
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--color-border)] p-4">
                                    {searchHistory.length > 0 && (
                                        <div className="pb-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="ts-eyebrow">Lịch sử tìm kiếm</p>
                                                <button
                                                    type="button"
                                                    onClick={clearSearchHistory}
                                                    className="text-[11px] text-[var(--color-fg-dim)] hover:text-[var(--color-primary)]"
                                                >
                                                    Xóa tất cả
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {searchHistory.slice(0, 6).map((item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => handleHistoryClick(item)}
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-fg)]"
                                                    >
                                                        <i className="fas fa-history text-[10px]"></i>
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {trendingProducts.length > 0 && (
                                        <div className={cn(searchHistory.length > 0 ? "pt-4" : "")}>
                                            <p className="ts-eyebrow mb-3 text-[var(--color-primary)]">
                                                <i className="fas fa-fire mr-1.5"></i>Xu hướng
                                            </p>
                                            <div className="grid grid-cols-2 gap-1">
                                                {trendingProducts.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        onClick={() => goToProduct(product)}
                                                        className="flex items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-[var(--color-surface-2)]"
                                                    >
                                                        <img
                                                            src={resolveProductImage(product)}
                                                            alt={product.name}
                                                            className="h-10 w-10 shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-background)] object-cover"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-medium text-[var(--color-fg)]">{product.name || product.title}</p>
                                                            {product.price != null && (
                                                                <p className="ts-mono text-[11px] text-[var(--color-primary)]">{formatCurrency(product.price)}</p>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Icons */}
                <div className="flex items-center gap-2">
                    <NavLink to="/compare" onClick={scrollToPageTop} className={iconButtonClass} aria-label="So sánh">
                        <i className="fas fa-random text-sm" style={iconGlyphStyle(compareCount > 0)}></i>
                        {compareCount > 0 && <span className={badgeClass}>{compareCount}</span>}
                    </NavLink>
                    <NavLink to="/wishlist" onClick={scrollToPageTop} className={iconButtonClass} aria-label="Yêu thích">
                        <i className="fas fa-heart text-sm" style={iconGlyphStyle(wishlistCount > 0)}></i>
                        {wishlistCount > 0 && <span className={badgeClass}>{wishlistCount}</span>}
                    </NavLink>
                    <NavLink to="/cart" onClick={scrollToPageTop} className={iconButtonClass} aria-label="Giỏ hàng">
                        <i className="fas fa-shopping-cart text-sm" style={iconGlyphStyle(itemCount > 0)}></i>
                        {itemCount > 0 && <span className={badgeClass}>{itemCount}</span>}
                    </NavLink>

                    <div ref={dropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenDropdown(openDropdown === 'dashboard' ? null : 'dashboard')}
                            className={cn(iconButtonClass, isAuthenticated && "w-auto gap-2 px-3 border-[var(--color-primary)]/60 text-[var(--color-fg)]")}
                            aria-label={dashboardLabel}
                        >
                            <i className="fas fa-user text-sm"></i>
                            {isAuthenticated && displayName && (
                                <span className="max-w-[120px] truncate text-sm font-medium">
                                    {displayName}
                                </span>
                            )}
                            {isAuthenticated && hasOrderUpdates && (
                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white ts-anim-pulse" title="Có cập nhật đơn hàng" />
                            )}
                        </button>
                        {openDropdown === 'dashboard' && (
                            <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-white/92 shadow-[var(--shadow-card)] backdrop-blur-xl ts-anim-fade-up">
                                <div className="border-b border-[var(--color-border)] px-4 py-3">
                                    <p className="ts-eyebrow">Tài khoản</p>
                                    <p className="mt-1 truncate text-sm font-medium text-[var(--color-fg)]">{dashboardLabel}</p>
                                </div>
                                {isAuthenticated ? (
                                    <div className="p-1">
                                        <Link to="/orders" onClick={closeMainMenus} className="block rounded-sm px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]">Đơn hàng của tôi</Link>
                                        <Link to="/tickets" onClick={closeMainMenus} className="block rounded-sm px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]">Hỗ trợ của tôi</Link>
                                        <Link to="/promotion" onClick={closeMainMenus} className="block rounded-sm px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]">Phiếu giảm giá</Link>
                                        <Link to="/wishlist" onClick={closeMainMenus} className="block rounded-sm px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]">Sản phẩm yêu thích</Link>
                                        <Link to="/compare" onClick={closeMainMenus} className="block rounded-sm px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]">So sánh sản phẩm</Link>
                                        {canAccessAdminPanel() && <Link to="/admin" onClick={closeMainMenus} className="block rounded-sm px-3 py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--color-surface-2)]">Trang quản trị</Link>}
                                        <div className="my-1 h-px bg-[var(--color-border)]" />
                                        <button type="button" onClick={handleLogout} className="block w-full rounded-sm px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-2)]">
                                            Đăng xuất
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-3">
                                        <Link
                                            to="/login"
                                            onClick={closeMainMenus}
                                            className="ts-btn ts-btn-primary w-full"
                                        >
                                            <i className="fas fa-sign-in-alt"></i>
                                            Đăng nhập
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileNavOpen((v) => !v)}
                        className={cn(iconButtonClass, "lg:hidden")}
                        aria-label="Menu"
                    >
                        <i className={cn("fas", mobileNavOpen ? "fa-times" : "fa-bars", "text-sm")}></i>
                    </button>
                </div>
                </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileNavOpen && (
                <div className="ts-container">
                <div className="mt-3 border border-[var(--color-border)] bg-[var(--color-surface-glass)] shadow-[var(--shadow-soft)] backdrop-blur-xl lg:hidden rounded-[22px]">
                    <div className="px-4 py-4">
                        <form onSubmit={handleSearch} className="mb-4 flex h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white/80 px-3 md:hidden">
                            <i className="fas fa-search text-xs text-[var(--color-fg-dim)]"></i>
                            <input
                                type="text"
                                placeholder="Tìm sản phẩm..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-faint)] focus:outline-none"
                            />
                        </form>
                        <nav className="flex flex-col">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={closeMainMenus}
                                    className={({ isActive }) => cn(
                                        "border-b border-[var(--color-border)] px-2 py-3 text-sm font-medium tracking-wide transition-colors last:border-b-0",
                                        isActive
                                            ? "text-[var(--color-primary)]"
                                            : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                                    )}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                        {settings.hotline && (
                            <a
                                href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
                                className="ts-btn ts-btn-outline mt-4 w-full"
                            >
                                <i className="fas fa-mobile-alt"></i>
                                {settings.hotline}
                            </a>
                        )}
                    </div>
                </div>
                </div>
            )}
        </header>
    );
};

export default ElectroHeader;
