import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { productApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import AllProductItemsCarousel from '../../components/store/AllProductItemsCarousel';
import OurProductsSection from '../../components/store/OurProductsSection';
import ProductMiniCard from '../../components/store/ProductMiniCard';
import { setPageMeta, t } from '../../utils/store';
import { fadeInLeft, fadeInRight, fadeInUp, motionTransition, motionViewport } from '../../utils/motionVariants';

const demoProducts = [
    { id: 201, name: 'iPhone 15 Pro', price: 28990000, oldPrice: 32990000, stock: 15, badge: 'New', tab: 'New Arrivals', category: { name: 'Điện thoại' }, categoryId: 1, imageUrl: '/electro/img/product-1.png' },
    { id: 202, name: 'MacBook Air M3', price: 31990000, oldPrice: 35990000, stock: 12, badge: 'Sale', tab: 'Top Selling', category: { name: 'Laptop' }, categoryId: 2, imageUrl: '/electro/img/product-3.png' },
    { id: 203, name: 'AirPods Pro', price: 5990000, oldPrice: 6990000, stock: 25, tab: 'Featured', category: { name: 'Tai nghe' }, categoryId: 7, imageUrl: '/electro/img/product-5.png' },
    { id: 204, name: 'iPad Pro 12.9', price: 25990000, oldPrice: 28990000, stock: 14, badge: 'New', tab: 'New Arrivals', category: { name: 'Tablet' }, categoryId: 4, imageUrl: '/electro/img/product-7.png' },
    { id: 205, name: 'Apple Watch Series 9', price: 9990000, oldPrice: 11990000, stock: 16, badge: 'Sale', tab: 'Top Selling', category: { name: 'Đồng hồ thông minh' }, categoryId: 5, imageUrl: '/electro/img/product-8.png' },
    { id: 206, name: 'Canon EOS R5', price: 64990000, oldPrice: 69990000, stock: 5, tab: 'Featured', category: { name: 'Máy ảnh' }, categoryId: 6, imageUrl: '/electro/img/product-9.png' },
    { id: 207, name: 'Dell XPS 15', price: 35990000, oldPrice: 39990000, stock: 8, badge: 'New', tab: 'New Arrivals', category: { name: 'Laptop' }, categoryId: 2, imageUrl: '/electro/img/product-4.png' },
    { id: 208, name: 'Bose QuietComfort 45', price: 8990000, oldPrice: 9990000, stock: 11, badge: 'Sale', tab: 'Top Selling', category: { name: 'Tai nghe' }, categoryId: 7, imageUrl: '/electro/img/product-10.png' },
];

const normalizeHomeProduct = (product, index) => ({
    ...product,
    oldPrice: product.oldPrice || Math.round(Number(product.price || 26250000) * 1.19),
    badge: product.badge || (index % 3 === 0 ? 'New' : index % 3 === 1 ? 'Sale' : ''),
    tab: product.tab || productTags[index % productTags.length],
    category: product.category || (product.categoryName ? { name: product.categoryName } : undefined),
    imageUrl: product.imageUrl || `/electro/img/product-${(index % 8) + 1}.png`,
});

const productTags = ['New Arrivals', 'Top Selling', 'Featured'];

const getImmediateProducts = () => {
    try {
        return productApi.getLocalCatalog?.() || [];
    } catch {
        return [];
    }
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
    while (spread.length < limit && Array.from(buckets.values()).some((bucket) => bucket.length)) {
        buckets.forEach((bucket) => {
            if (bucket.length && spread.length < limit) {
                spread.push(bucket.shift());
            }
        });
    }
    return spread;
};

const getFeaturedProducts = (products) => {
    const preferred = products.filter((product) => product.isFeatured || product.IsFeatured);
    return spreadByCategory(preferred.length ? preferred : products, 6);
};

const getBestsellerProducts = (products) => {
    const preferred = products.filter((product) => product.isBestSeller || product.IsBestSeller);
    const featuredIds = new Set(getFeaturedProducts(products).map((product) => product.id));
    const source = preferred.length ? preferred : products.filter((product) => !featuredIds.has(product.id));
    return spreadByCategory(source.length ? source : products, 6);
};

const fetchHomeCatalog = async () => {
    const firstResponse = await productApi.getAll({ page: 1, pageSize: 100 });
    const firstData = firstResponse.data || {};
    const firstItems = Array.isArray(firstData.items) ? firstData.items : [];
    const totalPages = Number(firstData.totalPages || 1);
    const pageSize = Number(firstData.pageSize || firstItems.length || 100);

    if (totalPages <= 1) return firstItems;

    const restResponses = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
            productApi.getAll({ page: index + 2, pageSize })
        )
    );

    return [
        ...firstItems,
        ...restResponses.flatMap((response) => Array.isArray(response.data?.items) ? response.data.items : []),
    ];
};

const serviceItems = [
    { icon: 'fa fa-sync-alt', title: t('Free Return'), text: t('30 days money back guarantee!') },
    { icon: 'fab fa-telegram-plane', title: t('Free Shipping'), text: t('Free shipping on all order') },
    { icon: 'fas fa-life-ring', title: t('Support 24/7'), text: t('We support online 24 hrs a day') },
    { icon: 'fas fa-credit-card', title: t('Receive Gift Card'), text: t('Recieve gift all over oder $50') },
    { icon: 'fas fa-lock', title: t('Secure Payment'), text: t('We Value Your Security') },
    { icon: 'fas fa-blog', title: t('Online Service'), text: t('Free return products in 30 days') },
];

const offerCards = [
    {
        title: t('Smart Camera'),
        subtitle: 'Tìm camera tốt nhất dành cho bạn!',
        discount: '40%',
        imageUrl: '/electro/img/product-5.png',
        borderDark: true,
    },
    {
        title: t('Smart Watch'),
        subtitle: 'Tìm đồng hồ tốt nhất dành cho bạn!',
        discount: '20%',
        imageUrl: '/electro/img/product-6.png',
        borderDark: false,
    },
];

const Home = () => {
    const [allProducts, setAllProducts] = useState(getImmediateProducts);
    const [featuredProducts, setFeaturedProducts] = useState(() => getFeaturedProducts(getImmediateProducts()));
    const [bestsellerProducts, setBestsellerProducts] = useState(() => getBestsellerProducts(getImmediateProducts()));
    const [loading, setLoading] = useState(false);
    const { addItem } = useCart();

    const miniProducts = useMemo(() => {
        const productMap = new Map();
        [...bestsellerProducts, ...featuredProducts, ...demoProducts].forEach((product) => {
            if (!productMap.has(product.id)) {
                productMap.set(product.id, product);
            }
        });

        return Array.from(productMap.values()).slice(0, 8).map(normalizeHomeProduct);
    }, [bestsellerProducts, featuredProducts]);

    const allProductItems = useMemo(() => {
        const catalog = allProducts.length ? allProducts : demoProducts;
        return spreadByCategory(catalog, 12).map(normalizeHomeProduct);
    }, [allProducts]);

    const handleAddToCart = (product) => {
        addItem(product, 1);
    };

    useEffect(() => {
        setPageMeta({
            title: `${t('Home')} | Electro`,
            description: t('Home meta description'),
        });
        const loadData = async () => {
            try {
                const prods = await fetchHomeCatalog();
                const catalog = prods.length ? prods : demoProducts;
                setAllProducts(catalog);
                setFeaturedProducts(getFeaturedProducts(catalog));
                setBestsellerProducts(getBestsellerProducts(catalog));
            } catch (error) {
                console.error('Failed to load store home data', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div>
            <div className="container-fluid carousel bg-light px-0">
                <div className="row g-0 justify-content-end">
                    <div className="col-12 col-lg-7 col-xl-9">
                        <div id="headerCarousel" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-inner bg-light py-5">
                                <div className="carousel-item active">
                                    <div className="row g-0 align-items-center">
                                        <div className="col-xl-6 carousel-img wow fadeInLeft" data-wow-delay="0.1s">
                                            <img src="/electro/img/carousel-1.png" className="img-fluid w-100" alt="Electro" />
                                        </div>
                                        <div className="col-xl-6 carousel-content p-4">
                                            <h4 className="text-uppercase fw-bold mb-4 wow fadeInRight" data-wow-delay="0.1s" style={{ letterSpacing: 3 }}>{t('Save Up To A $400')}</h4>
                                            <h1 className="display-3 text-capitalize mb-4 wow fadeInRight" data-wow-delay="0.3s">{t('On Selected Laptops & Desktop Or Smartphone')}</h1>
                                            <p className="text-dark wow fadeInRight" data-wow-delay="0.5s">{t('Terms and Condition Apply')}</p>
                                            <Link className="btn btn-primary rounded-pill py-3 px-5 wow fadeInRight" data-wow-delay="0.7s" to="/shop?categoryId=2">{t('Shop Laptops')}</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="carousel-item">
                                    <div className="row g-0 align-items-center">
                                        <div className="col-xl-6 carousel-img wow fadeInLeft" data-wow-delay="0.1s">
                                            <img src="/electro/img/carousel-2.png" className="img-fluid w-100" alt="Electro" />
                                        </div>
                                        <div className="col-xl-6 carousel-content p-4">
                                            <h4 className="text-uppercase fw-bold mb-4 wow fadeInRight" data-wow-delay="0.1s" style={{ letterSpacing: 3 }}>{t('Save Up To A $200')}</h4>
                                            <h1 className="display-3 text-capitalize mb-4 wow fadeInRight" data-wow-delay="0.3s">{t('On Selected Laptops & Desktop Or Smartphone')}</h1>
                                            <p className="text-dark wow fadeInRight" data-wow-delay="0.5s">{t('Terms and Condition Apply')}</p>
                                            <Link className="btn btn-primary rounded-pill py-3 px-5 wow fadeInRight" data-wow-delay="0.7s" to="/shop?categoryId=1">{t('Shop Smartphones')}</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#headerCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true" style={{ filter: 'invert(1)' }}></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#headerCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true" style={{ filter: 'invert(1)' }}></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                    <div className="col-12 col-lg-5 col-xl-3 wow fadeInRight" data-wow-delay="0.1s">
                        <div className="carousel-header-banner h-100">
                            <img src="/electro/img/header-img.jpg" className="img-fluid w-100 h-100" style={{ objectFit: 'cover' }} alt="Banner" />
                            <div className="carousel-banner-offer">
                                <p className="bg-primary text-white rounded fs-5 py-2 px-4 mb-0 me-3">Giảm $48.00</p>
                                <p className="text-primary fs-5 fw-bold mb-0">{t('Special Offer')}</p>
                            </div>
                            <div className="carousel-banner">
                                <div className="carousel-banner-content text-center p-4">
                                    <Link to="/shop?categoryId=5" className="d-block mb-2 text-white">Điện thoại / Máy tính bảng</Link>
                                    <span className="d-block text-white fs-3">Apple iPad Mini <br /> G2356</span>
                                    <del className="me-2 text-white fs-5">$1,250.00</del>
                                    <span className="text-primary fs-5">$1,050.00</span>
                                </div>
                                <Link to="/shop?categoryId=5" className="btn btn-primary rounded-pill py-2 px-4"><i className="fas fa-shopping-cart me-2"></i> {t('Shop Now')}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <motion.div className="container-fluid px-0" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={motionViewport} transition={motionTransition}>
                <div className="row g-0 electro-service-strip">
                    {serviceItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            className="col-6 col-md-4 col-lg-2 border-start border-end"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={motionViewport}
                            transition={{ ...motionTransition, delay: index * 0.04 }}
                        >
                            <div className="electro-service-item">
                                <i className={`${item.icon} fa-2x text-primary`}></i>
                                <div>
                                    <h6 className="text-uppercase mb-2">{item.title}</h6>
                                    <p className="mb-0">{item.text}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="container-fluid electro-offer-band py-5" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={motionViewport} transition={motionTransition}>
                <div className="container">
                    <div className="row g-4 justify-content-center">
                        {offerCards.map((offer, index) => (
                            <motion.div
                                key={offer.title}
                                className="col-lg-6"
                                variants={index === 0 ? fadeInLeft : fadeInRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={motionViewport}
                                transition={{ ...motionTransition, delay: index * 0.08 }}
                            >
                                <Link to="/shop" className={`electro-offer-tile ${offer.borderDark ? 'is-highlighted' : ''}`}>
                                    <div>
                                        <p>{offer.subtitle}</p>
                                        <h3>{offer.title}</h3>
                                        <h2><span>{offer.discount}</span> Giảm</h2>
                                    </div>
                                    <img src={offer.imageUrl} alt={offer.title} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <OurProductsSection products={miniProducts} loading={loading} onAddToCart={handleAddToCart} />

            <div className="container-fluid py-5">
                <div className="container">
                    <div className="row g-4 electro-mini-products-grid">
                        <motion.div className="col-lg-6" variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={motionViewport} transition={motionTransition}>
                            <Link to="/shop">
                                <div className="electro-template-banner">
                                    <img src="/electro/img/product-banner.jpg" className="img-fluid w-100 rounded" alt="EOS Rebel T7i Kit" />
                                    <div className="electro-template-banner-overlay light">
                                        <h3>EOS Rebel <br /><span>T7i Kit</span></h3>
                                        <p>$899.99</p>
                                        <span className="btn btn-primary rounded-pill py-2 px-4">{t('Shop Now')}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                        <motion.div className="col-lg-6" variants={fadeInRight} initial="hidden" whileInView="visible" viewport={motionViewport} transition={{ ...motionTransition, delay: 0.08 }}>
                            <Link to="/shop">
                                <div className="electro-template-banner text-center">
                                    <img src="/electro/img/product-banner-2.jpg" className="img-fluid w-100 rounded" alt="Sale headphones" />
                                    <div className="electro-template-banner-overlay sale">
                                        <h2>GIẢM GIÁ</h2>
                                        <h4>Giảm đến 50%</h4>
                                        <span className="btn btn-secondary rounded-pill py-2 px-4">{t('Shop Now')}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            <motion.div className="container-fluid pt-5 electro-all-products-section" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={motionViewport} transition={motionTransition}>
                <AllProductItemsCarousel products={allProductItems} onAddToCart={handleAddToCart} />
            </motion.div>

            <motion.div className="container-fluid pt-0 pb-5 electro-bestseller-section" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={motionViewport} transition={motionTransition}>
                <div className="container pb-4">
                    <div className="d-flex align-items-end justify-content-between gap-3 mb-4">
                        <div>
                            <h4 className="electro-kicker mb-2">{t('Bestseller Products')}</h4>
                            <h1 className="display-5 fw-bold mb-0">{t('Bestseller Products')}</h1>
                        </div>
                    </div>
                    <div className="row g-4 electro-bestseller-grid">
                        {miniProducts.slice(0, 6).map((product, index) => (
                            <motion.div
                                key={product.id}
                                className="col-md-6 col-xl-4"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={motionViewport}
                                transition={{ ...motionTransition, delay: (index % 3) * 0.06 }}
                            >
                                <ProductMiniCard product={product} onAddToCart={handleAddToCart} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;

