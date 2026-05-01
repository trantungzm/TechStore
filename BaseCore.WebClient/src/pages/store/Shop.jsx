import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categoryApi, productApi } from '../../services/api';
import ProductCard from '../../components/store/ProductCard';
import PageHero from '../../components/store/PageHero';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';

const RECENTLY_VIEWED_KEY = 'electro_recently_viewed_products';

const safeParseJson = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const normalizeRecentProduct = (product) => {
    if (!product) return null;
    return {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
    };
};

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryStats, setCategoryStats] = useState({ totalProducts: 0, byId: {} });
    const [categoryQuery, setCategoryQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [popularProducts, setPopularProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const categoryId = params.get('categoryId') || '';
    const urlMinPrice = params.get('minPrice') || '';
    const urlMaxPrice = params.get('maxPrice') || '';
    const urlInStock = params.get('inStock') === 'true';
    const urlSortBy = params.get('sortBy') || '';

    const recordRecentlyViewed = (product) => {
        const normalized = normalizeRecentProduct(product);
        if (!normalized?.id) return;

        const current = safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []);
        const withoutDup = Array.isArray(current) ? current.filter((p) => p?.id !== normalized.id) : [];
        const next = [normalized, ...withoutDup].slice(0, 6);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
        setRecentlyViewed(next);
    };

    useEffect(() => {
        setPageMeta({
            title: `${t('Shop')} | Electro`,
            description: t('Shop meta description'),
        });
        const loadCategories = async () => {
            try {
                const response = await categoryApi.getAll();
                const cats = response.data || [];
                setCategories(cats);

                const missingCount = cats.some((c) => typeof c.productCount !== 'number');
                if (!missingCount) {
                    setCategoryStats({
                        totalProducts: cats.reduce((sum, c) => sum + (c.productCount || 0), 0),
                        byId: Object.fromEntries(cats.map((c) => [String(c.id), c.productCount || 0])),
                    });
                    return;
                }

                const pageSize = 200;
                const firstPage = await productApi.getAll({ page: 1, pageSize });
                const total = firstPage.data?.totalCount || 0;
                const pages = firstPage.data?.totalPages || 1;
                let allItems = firstPage.data?.items || [];
                for (let p = 2; p <= pages; p += 1) {
                    const nextPage = await productApi.getAll({ page: p, pageSize });
                    allItems = allItems.concat(nextPage.data?.items || []);
                }
                const byId = {};
                for (const item of allItems) {
                    const id = item?.categoryId != null ? String(item.categoryId) : '';
                    if (!id) continue;
                    byId[id] = (byId[id] || 0) + 1;
                }
                setCategoryStats({ totalProducts: total, byId });
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        setMinPrice(urlMinPrice);
        setMaxPrice(urlMaxPrice);
        setInStockOnly(urlInStock);
        setSortBy(urlSortBy);
    }, [urlMinPrice, urlMaxPrice]);

    useEffect(() => {
        const recent = safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []);
        setRecentlyViewed(Array.isArray(recent) ? recent : []);

        const loadPopularProducts = async () => {
            try {
                const response = await productApi.getAll({ page: 1, pageSize: 4, sortBy: 'price_desc', inStock: 'true' });
                setPopularProducts(response.data?.items || []);
            } catch (error) {
                console.error('Failed to load popular products', error);
            }
        };

        loadPopularProducts();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await productApi.getAll({
                    keyword: keyword || undefined,
                    categoryId: categoryId || undefined,
                    minPrice: urlMinPrice ? Number(urlMinPrice) : undefined,
                    maxPrice: urlMaxPrice ? Number(urlMaxPrice) : undefined,
                    inStock: urlInStock ? 'true' : undefined,
                    sortBy: urlSortBy || undefined,
                    page,
                    pageSize: 12,
                });

                setProducts(response.data.items || []);
                setTotalPages(response.data.totalPages || 1);
            } catch (error) {
                console.error('Failed to load products', error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [keyword, categoryId, urlMinPrice, urlMaxPrice, urlInStock, urlSortBy, page]);

    useEffect(() => {
        setPage(1);
    }, [keyword, categoryId, urlMinPrice, urlMaxPrice, urlInStock, urlSortBy]);

    const handleCategoryChange = (value) => {
        const nextParams = new URLSearchParams(location.search);
        if (value) {
            nextParams.set('categoryId', value);
        } else {
            nextParams.delete('categoryId');
        }
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const handlePriceFilter = () => {
        const nextParams = new URLSearchParams(location.search);
        if (minPrice) {
            nextParams.set('minPrice', minPrice);
        } else {
            nextParams.delete('minPrice');
        }
        if (maxPrice) {
            nextParams.set('maxPrice', maxPrice);
        } else {
            nextParams.delete('maxPrice');
        }
        if (inStockOnly) {
            nextParams.set('inStock', 'true');
        } else {
            nextParams.delete('inStock');
        }
        if (sortBy) {
            nextParams.set('sortBy', sortBy);
        } else {
            nextParams.delete('sortBy');
        }
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const handleClearFilters = () => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.delete('categoryId');
        nextParams.delete('minPrice');
        nextParams.delete('maxPrice');
        nextParams.delete('inStock');
        nextParams.delete('sortBy');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    return (
        <>
            <PageHero title="Shop Page" current="Shop" />

            <div className="container-fluid px-0">
                <div className="row g-0">
                    <div className="col-6 col-md-4 col-lg-2 border-start border-end wow fadeInUp" data-wow-delay="0.1s">
                        <div className="p-4">
                            <div className="d-inline-flex align-items-center">
                                <i className="fa fa-sync-alt fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">Free Return</h6>
                                    <p className="mb-0">30 days money back guarantee!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.2s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fab fa-telegram-plane fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">Free Shipping</h6>
                                    <p className="mb-0">Free shipping on all order</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.3s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-life-ring fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">Support 24/7</h6>
                                    <p className="mb-0">We support online 24 hrs a day</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.4s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-credit-card fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">Receive Gift Card</h6>
                                    <p className="mb-0">Recieve gift all over oder $50</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.5s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-lock fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">Secure Payment</h6>
                                    <p className="mb-0">We Value Your Security</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.6s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-blog fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">Online Service</h6>
                                    <p className="mb-0">Free return products in 30 days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid bg-light py-5">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.2s">
                            <Link to="/shop" className="d-flex align-items-center justify-content-between border bg-white rounded p-4">
                                <div>
                                    <p className="text-muted mb-3">Find The Best Camera for You!</p>
                                    <h3 className="text-primary">Smart Camera</h3>
                                    <h1 className="display-3 text-secondary mb-0">40% <span className="text-primary fw-normal">Off</span></h1>
                                </div>
                                <img src="/electro/img/product-1.png" className="img-fluid" alt="Product" />
                            </Link>
                        </div>
                        <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s">
                            <Link to="/shop" className="d-flex align-items-center justify-content-between border bg-white rounded p-4">
                                <div>
                                    <p className="text-muted mb-3">Find The Best Camera for You!</p>
                                    <h3 className="text-primary">SmartPhone</h3>
                                    <h1 className="display-3 text-secondary mb-0">30% <span className="text-primary fw-normal">Off</span></h1>
                                </div>
                                <img src="/electro/img/product-2.png" className="img-fluid" alt="Product" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-4">
                        <div className="col-xl-3">
                            <div className="border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.1s">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="mb-0">Filters</h4>
                                    <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill" onClick={handleClearFilters}>
                                        Clear
                                    </button>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted mb-2">Category</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search category..."
                                        value={categoryQuery}
                                        onChange={(e) => setCategoryQuery(e.target.value)}
                                    />
                                </div>
                                <ul className="list-unstyled categories-bars mb-0">
                                    <li>
                                        <div className="categories-bars-item">
                                            <button type="button" className="btn btn-link p-0 text-start text-decoration-none" onClick={() => handleCategoryChange('')}>
                                                All Category
                                            </button>
                                            <span>({categoryStats.totalProducts || 0})</span>
                                        </div>
                                    </li>
                                    {categories
                                        .filter((c) => c.name.toLowerCase().includes(categoryQuery.toLowerCase()))
                                        .map((category) => (
                                        <li key={category.id}>
                                            <div className="categories-bars-item">
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-start text-decoration-none"
                                                    onClick={() => handleCategoryChange(String(category.id))}
                                                >
                                                    {category.name}
                                                </button>
                                                <span>({categoryStats.byId[String(category.id)] || 0})</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.2s">
                                <h4 className="mb-4">Price Range</h4>
                                <div className="mb-3">
                                    <label className="form-label text-muted mb-2">Min Price</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder="Min price" 
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted mb-2">Max Price</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder="Max price" 
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="btn btn-primary rounded-pill w-100" 
                                    onClick={handlePriceFilter}
                                >
                                    <i className="fas fa-search mr-2"></i>Filter
                                </button>
                            </div>
                            <div className="border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.25s">
                                <h4 className="mb-4">More</h4>
                                <div className="mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="inStockOnly"
                                        checked={inStockOnly}
                                        onChange={(e) => setInStockOnly(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="inStockOnly">In stock only</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted mb-2">Sort by</label>
                                    <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="">Default</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="name_asc">Name: A to Z</option>
                                        <option value="name_desc">Name: Z to A</option>
                                    </select>
                                </div>
                                <button type="button" className="btn btn-primary rounded-pill w-100" onClick={handlePriceFilter}>
                                    Apply
                                </button>
                            </div>
                            <div className="bg-primary rounded position-relative wow fadeInUp" data-wow-delay="0.3s">
                                <img src="/electro/img/product-banner.jpg" className="img-fluid w-100 rounded" alt="Banner" />
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center rounded p-4" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                                    <h3 className="display-5 text-primary">EOS Rebel <br /><span>T7i Kit</span></h3>
                                    <p className="fs-4 text-muted">$899.99</p>
                                    <Link to="/shop" className="btn btn-primary rounded-pill align-self-start py-2 px-4">Shop Now</Link>
                                </div>
                            </div>
                            <div className="border rounded p-4 mb-4 mt-4 wow fadeInUp" data-wow-delay="0.35s">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="mb-0">Popular products</h4>
                                    <Link to="/shop" className="small text-decoration-none">View all</Link>
                                </div>
                                {popularProducts.length === 0 ? (
                                    <div className="text-muted small">No data</div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {popularProducts.map((p) => (
                                            <Link
                                                key={p.id}
                                                to={`/shop?keyword=${encodeURIComponent(p.name || '')}`}
                                                className="text-decoration-none"
                                                onClick={() => recordRecentlyViewed(p)}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={resolveProductImage(p)}
                                                        alt={p.name}
                                                        className="rounded border flex-shrink-0"
                                                        style={{ width: 56, height: 56, objectFit: 'cover' }}
                                                    />
                                                    <div className="ms-3">
                                                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 170 }}>{p.name}</div>
                                                        <div className="text-primary small">{formatCurrency(p.price)}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.4s">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="mb-0">Recently viewed</h4>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary rounded-pill"
                                        disabled={recentlyViewed.length === 0}
                                        onClick={() => {
                                            localStorage.removeItem(RECENTLY_VIEWED_KEY);
                                            setRecentlyViewed([]);
                                        }}
                                    >
                                        Clear
                                    </button>
                                </div>
                                {recentlyViewed.length === 0 ? (
                                    <div className="text-muted small">You haven&apos;t viewed any products yet.</div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {recentlyViewed.map((p) => (
                                            <Link
                                                key={p.id}
                                                to={`/shop?keyword=${encodeURIComponent(p.name || '')}`}
                                                className="text-decoration-none"
                                            >
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={resolveProductImage(p)}
                                                        alt={p.name}
                                                        className="rounded border flex-shrink-0"
                                                        style={{ width: 56, height: 56, objectFit: 'cover' }}
                                                    />
                                                    <div className="ms-3">
                                                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 170 }}>{p.name}</div>
                                                        <div className="text-primary small">{formatCurrency(p.price)}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="border rounded p-4 wow fadeInUp" data-wow-delay="0.45s">
                                <h4 className="mb-3">Need help?</h4>
                                <ul className="list-unstyled mb-3">
                                    <li className="d-flex align-items-center mb-2">
                                        <i className="fa fa-phone-alt text-primary me-2"></i>
                                        <span className="text-muted me-2">Hotline:</span>
                                        <a href="tel:+84123456789" className="text-decoration-none">(+84) 123 456 789</a>
                                    </li>
                                    <li className="d-flex align-items-center mb-2">
                                        <i className="fa fa-envelope text-primary me-2"></i>
                                        <span className="text-muted me-2">Email:</span>
                                        <a href="mailto:support@electro.com" className="text-decoration-none">support@electro.com</a>
                                    </li>
                                    <li className="d-flex align-items-center">
                                        <i className="fa fa-clock text-primary me-2"></i>
                                        <span className="text-muted me-2">Giờ làm việc:</span>
                                        <span>08:00 - 20:00 (T2 - CN)</span>
                                    </li>
                                </ul>
                                <h6 className="text-uppercase text-muted mb-2">Chính sách đổi trả/ship</h6>
                                <ul className="mb-0 small">
                                    <li>Đổi trả trong 7 ngày (áp dụng theo điều kiện sản phẩm).</li>
                                    <li>Hỗ trợ đổi trả miễn phí nếu lỗi do nhà sản xuất.</li>
                                    <li>Giao hàng nhanh 1-3 ngày nội thành, 3-7 ngày ngoại thành.</li>
                                    <li>Miễn phí vận chuyển cho đơn hàng đủ điều kiện.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-9">
                            <div className="row g-4 justify-content-between mb-4 wow fadeInUp" data-wow-delay="0.1s">
                                <div className="col-md-6">
                                    <h4 className="mb-0">{t('Products')}</h4>
                                </div>
                                <div className="col-md-6">
                                    <select
                                        className="form-select text-dark border rounded-pill p-3"
                                        value={categoryId}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                    >
                                        <option value="">{t('All Category')}</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="row g-4">
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <div key={idx} className="col-md-6 col-lg-6 col-xl-4">
                                            <div className="border rounded p-3 bg-white">
                                                <div className="placeholder-glow">
                                                    <div className="placeholder w-100" style={{ height: 180 }}></div>
                                                    <div className="placeholder col-7 mt-3"></div>
                                                    <div className="placeholder col-4"></div>
                                                    <div className="placeholder col-6 mt-2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="row g-4">
                                        {products.length === 0 && (
                                            <div className="col-12">
                                                <div className="alert alert-light border">{t('No products found')}</div>
                                            </div>
                                        )}
                                        {products.map((product) => (
                                            <div key={product.id} className="col-md-6 col-lg-6 col-xl-4" onClickCapture={() => recordRecentlyViewed(product)}>
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="pagination d-flex justify-content-center mt-5">
                                            <button
                                                type="button"
                                                className="rounded"
                                                disabled={page === 1}
                                                onClick={() => setPage((currentPage) => currentPage - 1)}
                                            >
                                                &laquo;
                                            </button>
                                            <button type="button" className="active rounded" disabled>{page}</button>
                                            <button
                                                type="button"
                                                className="rounded"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage((currentPage) => currentPage + 1)}
                                            >
                                                &raquo;
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Shop;
