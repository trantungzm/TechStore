import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { productApi, bannerApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import AllProductItemsCarousel from '../../components/store/AllProductItemsCarousel';
import OurProductsSection from '../../components/store/OurProductsSection';
import ProductMiniCard from '../../components/store/ProductMiniCard';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';

const productTags = ['New Arrivals', 'Top Selling', 'Featured'];

const normalizeHomeProduct = (product, index) => ({
    ...product,
    oldPrice: product.oldPrice || Math.round(Number(product.price || 26250000) * 1.19),
    badge: product.badge || (index % 3 === 0 ? 'New' : index % 3 === 1 ? 'Sale' : ''),
    tab: product.tab || productTags[index % productTags.length],
    category: product.category || (product.categoryName ? { name: product.categoryName } : undefined),
    imageUrl: product.imageUrl || '',
});

const getImmediateProducts = () => {
    try { return productApi.getLocalCatalog?.() || []; } catch { return []; }
};

const getCategoryKey = (product) => String(product?.categoryId || product?.category?.name || product?.categoryName || 'other');

const spreadByCategory = (products = [], limit = 12) => {
    const buckets = new Map();
    products.forEach((product) => {
        const key = getCategoryKey(product);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(product);
    });

    const spread = [];
    const bucketValues = Array.from(buckets.values());
    
    while (spread.length < limit && bucketValues.some((bucket) => bucket.length)) {
        for (const bucket of bucketValues) {
            if (bucket.length && spread.length < limit) {
                spread.push(bucket.shift());
            }
        }
    }
    return spread;
};

// Optimizations: Calculate featured and best sellers cleanly inside one pass or clearly segmented
const getFeaturedProducts = (products) => {
    const preferred = products.filter((p) => p.isFeatured || p.IsFeatured);
    return spreadByCategory(preferred.length ? preferred : products, 6);
};

const getBestsellerProducts = (products, featuredProducts = []) => {
    const preferred = products.filter((p) => p.isBestSeller || p.IsBestSeller);
    if (preferred.length) return spreadByCategory(preferred, 6);
    
    const featuredIds = new Set(featuredProducts.map((p) => p.id));
    const source = products.filter((p) => !featuredIds.has(p.id));
    return spreadByCategory(source.length ? source : products, 6);
};

const fetchHomeCatalog = async () => {
    const first = await productApi.getAll({ page: 1, pageSize: 100 });
    const data = first.data || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const totalPages = Number(data.totalPages || 1);
    const pageSize = Number(data.pageSize || items.length || 100);
    if (totalPages <= 1) return items;

    const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => productApi.getAll({ page: i + 2, pageSize }))
    );
    return [...items, ...rest.flatMap((r) => Array.isArray(r.data?.items) ? r.data.items : [])];
};

// Hero hiển thị từ banner backend (/banners/active). Khi chưa có banner nào,
// dùng default trung tính (không gắn sản phẩm/danh mục cứng) thay vì slide quảng cáo giả.
const DEFAULT_HERO = {
    kicker: '',
    title: <>Khám phá công nghệ <span className="ts-gradient-text">chính hãng</span></>,
    sub: 'Sản phẩm tuyển chọn, bảo hành minh bạch, dịch vụ tận tâm.',
    cta: { label: 'Mua sắm ngay', to: '/shop' },
    image: '',
};

const serviceItems = [
    { icon: 'fas fa-sync-alt', title: 'Free Return', text: '30 days money back guarantee!', to: '/warranty' },
    { icon: 'fab fa-telegram-plane', title: 'Free Shipping', text: 'Free shipping on all order', to: '/shop' },
    { icon: 'fas fa-life-ring', title: 'Support 24/7', text: 'We support online 24 hrs a day', to: '/tickets' },
    { icon: 'fas fa-credit-card', title: 'Receive Gift Card', text: 'Recieve gift all over oder $50', to: '/promotion' },
    { icon: 'fas fa-lock', title: 'Secure Payment', text: 'We Value Your Security', to: '/cart' },
    { icon: 'fas fa-headset', title: 'Online Service', text: 'Free return products in 30 days', to: '/tickets' },
];

const offerCards = [];

const formatBannerDiscount = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';

    const normalized = raw.replace(/[^0-9.,-]/g, '').replaceAll(',', '');
    const num = Number(normalized);
    if (Number.isFinite(num) && normalized) {
        return formatCurrency(Math.abs(num));
    }
    return raw;
};

const Home = () => {
    const [allProducts, setAllProducts] = useState(getImmediateProducts);
    const [featuredProducts, setFeaturedProducts] = useState(() => getFeaturedProducts(getImmediateProducts()));
    const [bestsellerProducts, setBestsellerProducts] = useState(() => getBestsellerProducts(getImmediateProducts(), getFeaturedProducts(getImmediateProducts())));
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroSlides, setHeroSlides] = useState([]);
    const timerRef = useRef(null);
    const { addItem } = useCart();

    const miniProducts = useMemo(() => {
        const map = new Map();
        [...bestsellerProducts, ...featuredProducts].forEach((p) => {
            if (!map.has(p.id)) map.set(p.id, p);
        });
        return Array.from(map.values()).slice(0, 8).map(normalizeHomeProduct);
    }, [bestsellerProducts, featuredProducts]);

    const allProductItems = useMemo(() => spreadByCategory(allProducts, 12).map(normalizeHomeProduct), [allProducts]);

    const handleAddToCart = useCallback((product) => addItem(product, 1), [addItem]);

    // Carousel interval management to clear out unexpected jump cuts on click
    const startCarouselTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setHeroIndex((i) => (i + 1) % (heroSlides.length || 1));
        }, 6500);
    }, [heroSlides.length]);

    const handleHeroDotClick = (index) => {
        setHeroIndex(index);
        startCarouselTimer(); // Reset the timer interval window
    };

    useEffect(() => {
        setPageMeta({ title: `${t('Home')} | TechStore`, description: t('Home meta description') });
        
        let isMounted = true;
        const loadData = async () => {
            try {
                const [prods, bannersResponse] = await Promise.all([
                    fetchHomeCatalog(),
                    bannerApi.getActive().catch(() => ({ data: null }))
                ]);
                if (!isMounted) return;

                const featured = getFeaturedProducts(prods);
                const bestSellers = getBestsellerProducts(prods, featured);

                setAllProducts(prods);
                setFeaturedProducts(featured);
                setBestsellerProducts(bestSellers);

                const bannersData = bannersResponse?.data;

                if (Array.isArray(bannersData) && bannersData.length > 0) {
                    const formattedBanners = bannersData.map((b) => ({
                        kicker: b.kicker,
                        title: <>{b.title}</>,
                        sub: b.subTitle,
                        cta: { label: b.ctaLabel, to: b.ctaTo },
                        image: b.imageUrl,
                        offerTitle: b.offerTitle,
                        offerDiscount: b.offerDiscount,
                        offerProduct: b.offerProduct,
                    }));
                    setHeroSlides(formattedBanners);
                } else {
                    setHeroSlides([]);
                }
            } catch (error) {
                console.error('Failed to load store home data', error);
                setHeroSlides([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        startCarouselTimer();

        return () => {
            isMounted = false;
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startCarouselTimer]);

    const slide = heroSlides[heroIndex] || DEFAULT_HERO;
    const slideImage = slide.image ? resolveProductImage({ imageUrl: slide.image }) : '';
    const offerTitleLabel = slide.offerTitle || t('Special Offer');
    const offerDiscountLabel = formatBannerDiscount(slide.offerDiscount);

    return (
        <div>
            {/* HERO */}
            <section className="relative isolate overflow-hidden border-b border-[var(--color-border)]">
                <span aria-hidden className="ts-anim-blob pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] bg-gradient-to-br from-[var(--color-accent)]/25 to-[var(--color-primary)]/15 blur-3xl" />
                <span aria-hidden className="ts-anim-blob pointer-events-none absolute -right-32 bottom-0 h-[460px] w-[460px] bg-gradient-to-tr from-[var(--color-primary)]/15 to-[var(--color-accent)]/20 blur-3xl" style={{ animationDelay: '-7s' }} />

                <div className="ts-container relative grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28">
                    <motion.div
                        key={`text-${heroIndex}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                        <motion.p
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="ts-eyebrow text-[var(--color-accent)]"
                        >
                            {slide.kicker}
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                            className="ts-display mt-4 text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
                        >
                            {slide.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.32, duration: 0.6 }}
                            className="mt-6 max-w-lg text-base text-[var(--color-fg-muted)]"
                        >
                            {slide.sub}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.5 }}
                            className="mt-8 flex flex-wrap items-center gap-3"
                        >
                            <Link to={slide.cta.to} className="ts-btn ts-btn-primary px-6 py-3 group">
                                {slide.cta.label}
                                <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
                            </Link>
                            <Link to="/shop" className="ts-btn ts-btn-ghost px-6 py-3">
                                Khám phá cửa hàng
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="mt-10 flex items-center gap-3"
                        >
                            {heroSlides.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleHeroDotClick(i)}
                                    aria-label={`Slide ${i + 1}`}
                                    className={`h-1 transition-all duration-500 ${i === heroIndex ? 'w-12 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)]' : 'w-6 bg-[var(--color-border-strong)] hover:bg-[var(--color-fg-dim)]'}`}
                                />
                            ))}
                            <span className="ts-mono ml-3 text-xs text-[var(--color-fg-dim)]">
                                {String(heroIndex + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
                            </span>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        key={`img-${heroIndex}`}
                        initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                        className="relative"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-md border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-12 shadow-[var(--shadow-lift)] lg:aspect-[4/3]">
                            {slideImage && (
                                <motion.img
                                    src={slideImage}
                                    alt="Banner"
                                    className="h-full w-full object-contain"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            )}
                            <span aria-hidden className="absolute right-6 top-6 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                            <span aria-hidden className="absolute right-12 top-6 h-2 w-2 rounded-full bg-[var(--color-primary)]/40" />
                        </div>
                        {slide.offerProduct && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                                className="absolute -bottom-6 -left-6 hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-lift)] backdrop-blur-md sm:block ts-anim-float-slow"
                            >
                                <p className="ts-eyebrow text-[var(--color-accent)]">{offerTitleLabel}</p>
                                <p className="ts-display mt-2 text-2xl">
                                    Giảm <span className="ts-gradient-text">{offerDiscountLabel || formatCurrency(48000)}</span>
                                </p>
                                <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{slide.offerProduct}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* SERVICES STRIP */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                className="ts-container py-12"
            >
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {serviceItems.map((item, idx) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: idx * 0.06, duration: 0.5 }}
                        >
                            <Link
                                to={item.to}
                                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-card)]"
                            >
                                {/* khối sáng mờ ở góc, đậm dần khi hover */}
                                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                {/* icon orb gradient + glow */}
                                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-[0_10px_24px_-8px_var(--color-primary)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                                    <i className={`${item.icon} text-lg`}></i>
                                </span>
                                <div className="relative min-w-0 flex-1">
                                    <p className="ts-eyebrow text-[10px]">{t(item.title)}</p>
                                    <p className="mt-1.5 text-xs leading-snug text-[var(--color-fg-muted)]">{t(item.text)}</p>
                                </div>
                                {/* CTA hiện khi hover */}
                                <span className="relative inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)] opacity-0 -translate-y-1 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    Xem thêm
                                    <i className="fas fa-arrow-right text-[9px] transition-transform duration-300 group-hover:translate-x-0.5"></i>
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* OFFERS */}
            <section className="ts-container py-12">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {offerCards.map((offer, idx) => (
                        <motion.div
                            key={offer.title}
                            initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                        >
                            <Link
                                to="/shop"
                                className="group relative flex items-center justify-between overflow-hidden rounded-md border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-8 shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lift)]"
                            >
                                <div className="relative z-10 max-w-[55%]">
                                    <p className="text-sm text-[var(--color-fg-muted)]">{offer.subtitle}</p>
                                    <h3 className="ts-display mt-3 text-2xl text-[var(--color-fg)]">{t(offer.title)}</h3>
                                    <p className="ts-display mt-2 text-5xl font-bold">
                                        <span className="ts-gradient-text">{offer.discount}</span>
                                        <span className="ml-2 text-sm font-normal text-[var(--color-fg-muted)]">Giảm</span>
                                    </p>
                                </div>
                                <img
                                    src={offer.imageUrl}
                                    alt={offer.title}
                                    className="relative z-10 h-44 w-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                />
                                <span className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-[var(--color-accent)]/20" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            <OurProductsSection products={miniProducts} loading={loading} onAddToCart={handleAddToCart} />

            {/* ALL ITEMS CAROUSEL */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7 }}
                className="py-12"
            >
                <AllProductItemsCarousel products={allProductItems} onAddToCart={handleAddToCart} />
            </motion.section>

            {/* BESTSELLER MINI GRID */}
            <section className="ts-container py-16">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 flex items-end justify-between gap-4"
                >
                    <div>
                        <p className="ts-eyebrow text-[var(--color-accent)]">{t('Bestseller Products')}</p>
                        <h2 className="ts-display mt-3 text-3xl md:text-4xl">{t('Most Popular Items')}</h2>
                        <div className="mt-3 h-px w-16 bg-gradient-to-r from-[var(--color-accent)] to-transparent" />
                    </div>
                    <Link to="/bestseller" className="ts-btn ts-btn-ghost hidden text-xs md:inline-flex group">
                        Xem tất cả <i className="fas fa-arrow-right ml-1 text-[10px] transition-transform group-hover:translate-x-1"></i>
                    </Link>
                </motion.div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {miniProducts.slice(0, 6).map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: (idx % 3) * 0.1, duration: 0.5 }}
                        >
                            <ProductMiniCard product={product} onAddToCart={handleAddToCart} />
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
