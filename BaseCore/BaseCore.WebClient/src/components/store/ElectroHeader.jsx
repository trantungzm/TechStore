import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useCompare } from '../../contexts/CompareContext';
import { useWishlist } from '../../contexts/WishlistContext';
import coupons from '../../data/coupons';
import { productApi } from '../../services/api';
import { getAvailableCouponsForProduct } from '../../utils/couponUtils';
import { formatCurrency, resolveProductImage, t } from '../../utils/store';

const SEARCH_HISTORY_KEY = 'searchHistory';
const fallbackHeaderCategories = [
    { label: 'Điện thoại', slug: 'dien-thoai' },
    { label: 'Laptop', slug: 'laptop' },
    { label: 'Phụ kiện', slug: 'phu-kien' },
    { label: 'Tai nghe', slug: 'tai-nghe' },
    { label: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh' },
    { label: 'Máy ảnh', slug: 'may-anh' },
];

const categoryNameMap = {
    Smartphone: 'Điện thoại',
    Laptop: 'Laptop',
    Accessories: 'Phụ kiện',
    Audio: 'Tai nghe',
    Smartwatch: 'Đồng hồ thông minh',
    Camera: 'Máy ảnh',
};

const categorySlugMap = {
    Smartphone: 'dien-thoai',
    Laptop: 'laptop',
    Accessories: 'phu-kien',
    Audio: 'tai-nghe',
    Smartwatch: 'dong-ho-thong-minh',
    Camera: 'may-anh',
};

const slugifyCategory = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeSearchText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

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

const ElectroHeader = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
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
    const headerRef = useRef(null);
    const searchRef = useRef(null);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { itemCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { compareCount } = useCompare();
    const navigate = useNavigate();
    const location = useLocation();
    const dashboardLabel = user?.name || user?.username || t('My Dashboard');
    const trimmedKeyword = keyword.trim();
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
        .slice(0, 10), [searchProducts]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setKeyword(params.get('search') || params.get('keyword') || '');
        setSearchOpen(false);
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
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
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

    const handleSuggestionClick = (product) => {
        goToProduct(product);
    };

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

    const scrollToPageTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const closeMainMenus = () => {
        setMobileNavOpen(false);
        setOpenDropdown(null);
        setSearchOpen(false);
        scrollToPageTop();
    };

    return (
        <header className="electro-sticky-header" ref={headerRef}>
            <div className="container-fluid px-3 px-lg-5 py-2 bg-white">
                <div className="row gx-0 align-items-center text-center">
                    <div className="col-md-4 col-lg-3 text-center text-lg-start d-flex align-items-center justify-content-center justify-content-lg-start">
                        <Link to="/" className="navbar-brand p-0 d-inline-flex align-items-center" onClick={closeMainMenus}>
                            <h1 className="h2 text-primary m-0 electro-header-logo"><i className="fas fa-shopping-bag text-secondary me-2"></i>Electro</h1>
                        </Link>
                    </div>
                    <div className="col-md-4 col-lg-6 text-center">
                        <div className="electro-search-wrap" ref={searchRef}>
                            <form onSubmit={handleSearch} className="d-flex border rounded-pill electro-search-form">
                                <input
                                    className="form-control border-0 rounded-pill w-100 py-2 ps-4"
                                    type="text"
                                    placeholder="Bạn đang tìm gì?"
                                    value={keyword}
                                    onFocus={() => setSearchOpen(true)}
                                    onChange={(event) => {
                                        setKeyword(event.target.value);
                                        setSearchOpen(true);
                                    }}
                                />
                                <button type="submit" className="btn btn-primary rounded-pill py-2 px-4" style={{ border: 0 }} aria-label="Tìm kiếm">
                                    <i className="fas fa-search"></i>
                                </button>
                            </form>

                            {searchOpen && (
                                <div className="electro-search-dropdown">
                                    {trimmedKeyword ? (
                                        <>
                                            <div className="electro-search-section-title">Kết quả gợi ý</div>
                                            {suggestedProducts.length > 0 ? (
                                                <div className="electro-search-product-list">
                                                    {suggestedProducts.map((product) => {
                                                        const hasSale = Number(product.oldPrice || 0) > Number(product.price || 0) || product.badge === 'Sale';
                                                        const hasCoupon = getAvailableCouponsForProduct(product, coupons).length > 0;
                                                        const inStock = Number(product.stock || 0) > 0;
                                                        return (
                                                            <button
                                                                type="button"
                                                                className="electro-search-product"
                                                                key={product.id}
                                                                onClick={() => handleSuggestionClick(product)}
                                                            >
                                                                <img src={resolveProductImage(product)} alt={product.name || 'Sản phẩm'} />
                                                                <span className="electro-search-product-info">
                                                                    <strong>{product.name || product.title}</strong>
                                                                    <small>{formatCurrency(product.price)} · {getCategoryLabel(product)}</small>
                                                                    <span className="electro-search-badges">
                                                                        <span className={inStock ? 'is-stock' : 'is-out'}>{inStock ? 'Còn hàng' : 'Hết hàng'}</span>
                                                                        {hasSale && <span className="is-sale">Đang giảm giá</span>}
                                                                        {hasCoupon && <span className="is-coupon">Có phiếu</span>}
                                                                    </span>
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="electro-search-empty">
                                                    <p>Không tìm thấy sản phẩm phù hợp</p>
                                                    <button type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => goToShopSearch(trimmedKeyword)}>
                                                        Xem tất cả sản phẩm
                                                    </button>
                                                </div>
                                            )}
                                            <button type="button" className="electro-search-view-all" onClick={() => goToShopSearch(trimmedKeyword)}>
                                                Xem tất cả kết quả cho “{trimmedKeyword}”
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="electro-search-section">
                                                <div className="electro-search-section-title-row">
                                                    <span className="electro-search-section-title">Lịch sử tìm kiếm</span>
                                                    {searchHistory.length > 0 && <button type="button" onClick={clearSearchHistory}>Xóa tất cả</button>}
                                                </div>
                                                {searchHistory.length > 0 && (
                                                    <div className="electro-search-history-list">
                                                        {searchHistory.slice(0, 5).map((item) => (
                                                            <button type="button" className="electro-search-history-item" key={item} onClick={() => handleHistoryClick(item)}>
                                                                <i className="fas fa-history"></i>
                                                                <span>{item}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="electro-search-section">
                                                <div className="electro-search-section-title">
                                                    <i className="fas fa-fire me-2"></i>Xu hướng tìm kiếm
                                                </div>
                                                <div className="electro-search-product-list is-trending-grid">
                                                    {trendingProducts.map((product) => (
                                                        <button
                                                            type="button"
                                                            className="electro-search-product"
                                                            key={product.id}
                                                            onClick={() => goToProduct(product)}
                                                        >
                                                            <img src={resolveProductImage(product)} alt={product.name || 'Sản phẩm'} />
                                                            <span className="electro-search-product-info">
                                                                <strong>{product.name || product.title}</strong>
                                                                {product.price != null && <small>{formatCurrency(product.price)}</small>}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-3 text-center text-lg-end">
                        <div className="d-inline-flex align-items-center">
                            <NavLink to="/compare" className="text-muted d-flex align-items-center justify-content-center me-3 position-relative" onClick={scrollToPageTop}>
                                <span className="rounded-circle btn-md-square border electro-header-icon"><i className="fas fa-random"></i></span>
                                {compareCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{compareCount}</span>}
                            </NavLink>
                            <NavLink to="/wishlist" className="text-muted d-flex align-items-center justify-content-center me-3 position-relative" onClick={scrollToPageTop}>
                                <span className="rounded-circle btn-md-square border electro-header-icon"><i className="fas fa-heart"></i></span>
                                {wishlistCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{wishlistCount}</span>}
                            </NavLink>
                            <NavLink to="/cart" className="text-muted d-flex align-items-center justify-content-center position-relative" onClick={scrollToPageTop}>
                                <span className="rounded-circle btn-md-square border electro-header-icon"><i className="fas fa-shopping-cart"></i></span>
                                {itemCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{itemCount}</span>}
                            </NavLink>
                            <div className="dropdown position-relative ms-3">
                                <button
                                    type="button"
                                    className="text-muted d-flex align-items-center justify-content-center btn btn-link p-0 border-0"
                                    onClick={() => setOpenDropdown(openDropdown === 'dashboard' ? null : 'dashboard')}
                                    aria-label={dashboardLabel}
                                >
                                    <span className={`rounded-circle btn-md-square border electro-header-icon ${isAuthenticated ? 'text-primary' : ''}`}>
                                        <i className="fas fa-user"></i>
                                    </span>
                                </button>
                                <div className={`dropdown-menu dropdown-menu-end rounded shadow ${openDropdown === 'dashboard' ? 'show' : ''}`} style={{ position: 'absolute', right: 0, left: 'auto', marginTop: 10 }}>
                                    <h6 className="dropdown-header">{dashboardLabel}</h6>
                                    {isAuthenticated ? (
                                        <>
                                            <Link to="/orders" className="dropdown-item" onClick={closeMainMenus}>Đơn hàng của tôi</Link>
                                            <Link to="/promotion" className="dropdown-item" onClick={closeMainMenus}>Phiếu giảm giá của tôi</Link>
                                            <Link to="/wishlist" className="dropdown-item" onClick={closeMainMenus}>Sản phẩm yêu thích</Link>
                                            <Link to="/compare" className="dropdown-item" onClick={closeMainMenus}>So sánh sản phẩm</Link>
                                            {isAdmin() && <Link to="/admin" className="dropdown-item" onClick={closeMainMenus}>Trang quản trị</Link>}
                                            <div className="dropdown-divider"></div>
                                            <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</button>
                                        </>
                                    ) : (
                                        <div className="electro-account-guest is-compact">
                                            <Link to="/login" className="electro-account-link" onClick={closeMainMenus}>
                                                <i className="fas fa-sign-in-alt"></i>
                                                <span>Đăng nhập</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid nav-bar p-0">
                <div className="row gx-0 electro-main-nav px-3 px-lg-5 align-items-center">
                    <div className="col-12">
                        <nav className="navbar navbar-expand-lg navbar-light bg-primary">
                            <Link to="/" className="navbar-brand d-block d-lg-none" onClick={closeMainMenus}>
                                <h1 className="h2 text-secondary m-0 electro-header-logo"><i className="fas fa-shopping-bag text-white me-2"></i>Electro</h1>
                            </Link>
                            <button className="navbar-toggler ms-auto" type="button" onClick={() => setMobileNavOpen((value) => !value)}>
                                <span className="fa fa-bars fa-1x"></span>
                            </button>
                            <div className={`collapse navbar-collapse justify-content-center ${mobileNavOpen ? 'show' : ''}`}>
                                <div className="navbar-nav mx-auto py-0">
                                    <NavLink to="/" end className="nav-item nav-link" onClick={closeMainMenus}>Trang chủ</NavLink>
                                    <NavLink to="/shop" className="nav-item nav-link" onClick={closeMainMenus}>Cửa hàng</NavLink>
                                    <NavLink to="/promotion" className="nav-item nav-link" onClick={closeMainMenus}>Phiếu giảm giá</NavLink>
                                    <NavLink to="/warranty" className="nav-item nav-link" onClick={closeMainMenus}>Bảo hành</NavLink>
                                    <NavLink to="/contact" className="nav-item nav-link me-2" onClick={closeMainMenus}>Liên hệ</NavLink>
                                </div>
                                <a href="tel:+01234567890" className="btn btn-secondary rounded-pill py-2 px-3 mb-3 mb-md-3 mb-lg-0 electro-header-phone">
                                    <i className="fa fa-mobile-alt me-2"></i> +0123 456 7890
                                </a>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ElectroHeader;
