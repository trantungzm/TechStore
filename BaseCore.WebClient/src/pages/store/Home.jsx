import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi, productApi } from '../../services/api';
import ProductCard from '../../components/store/ProductCard';
import { setPageMeta, t } from '../../utils/store';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestsellerProducts, setBestsellerProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageMeta({
            title: `${t('Home')} | Electro`,
            description: t('Home meta description'),
        });
        const loadData = async () => {
            try {
                const [categoriesResponse, productsResponse] = await Promise.all([
                    categoryApi.getAll(),
                    productApi.getAll({ page: 1, pageSize: 12 }),
                ]);

                const cats = categoriesResponse.data || [];
                const prods = productsResponse.data?.items || [];
                
                const catsWithCount = cats.map(c => ({
                    ...c,
                    productCount: prods.filter(p => p.categoryId === c.id).length
                }));
                
                setCategories(catsWithCount);
                setFeaturedProducts(prods.slice(0, 6));
                setBestsellerProducts(prods.slice(6, 12).length ? prods.slice(6, 12) : prods.slice(0, 6));
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
                        <div id="headerCarousel" className="carousel slide" data-ride="carousel">
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
                            <button className="carousel-control-prev" type="button" data-target="#headerCarousel" data-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true" style={{ filter: 'invert(1)' }}></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-target="#headerCarousel" data-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true" style={{ filter: 'invert(1)' }}></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                    <div className="col-12 col-lg-5 col-xl-3 wow fadeInRight" data-wow-delay="0.1s">
                        <div className="carousel-header-banner h-100">
                            <img src="/electro/img/header-img.jpg" className="img-fluid w-100 h-100" style={{ objectFit: 'cover' }} alt="Banner" />
                            <div className="carousel-banner-offer">
                                <p className="bg-primary text-white rounded fs-5 py-2 px-4 mb-0 me-3">Save $48.00</p>
                                <p className="text-primary fs-5 fw-bold mb-0">{t('Special Offer')}</p>
                            </div>
                            <div className="carousel-banner">
                                <div className="carousel-banner-content text-center p-4">
                                    <Link to="/shop?categoryId=5" className="d-block mb-2 text-white">SmartPhone / Tablet</Link>
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

            <div className="container-fluid px-0">
                <div className="row g-0">
                    <div className="col-6 col-md-4 col-lg-2 border-start border-end wow fadeInUp" data-wow-delay="0.1s">
                        <div className="p-4">
                            <div className="d-inline-flex align-items-center">
                                <i className="fa fa-sync-alt fa-2x text-primary"></i>
                                <div className="ms-4">
                                            <h6 className="text-uppercase mb-2">{t('Free Return')}</h6>
                                            <p className="mb-0">{t('30 days money back guarantee!')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.2s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fab fa-telegram-plane fa-2x text-primary"></i>
                                <div className="ms-4">
                                            <h6 className="text-uppercase mb-2">{t('Free Shipping')}</h6>
                                            <p className="mb-0">{t('Free shipping on all order')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.3s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-life-ring fa-2x text-primary"></i>
                                <div className="ms-4">
                                            <h6 className="text-uppercase mb-2">{t('Support 24/7')}</h6>
                                            <p className="mb-0">{t('We support online 24 hrs a day')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.4s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-credit-card fa-2x text-primary"></i>
                                <div className="ms-4">
                                            <h6 className="text-uppercase mb-2">{t('Receive Gift Card')}</h6>
                                            <p className="mb-0">{t('Recieve gift all over oder $50')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.5s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-lock fa-2x text-primary"></i>
                                <div className="ms-4">
                                            <h6 className="text-uppercase mb-2">{t('Secure Payment')}</h6>
                                            <p className="mb-0">{t('We Value Your Security')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.6s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-blog fa-2x text-primary"></i>
                                <div className="ms-4">
                                            <h6 className="text-uppercase mb-2">{t('Online Service')}</h6>
                                            <p className="mb-0">{t('Free return products in 30 days')}</p>
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

            <div className="container-fluid py-5" id="featured-products">
                <div className="container pb-5">
                    <div className="row g-4">
                        <div className="col-12 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                                <h4 className="text-primary">Featured Products</h4>
                                <h1 className="display-5 mb-4">Our Products</h1>
                            </div>
                        </div>
                        {loading ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : featuredProducts.map((product, index) => (
                            <div key={product.id} className="col-md-6 col-lg-6 col-xl-4 wow fadeInUp" data-wow-delay={`${0.1 + (index % 3) * 0.2}s`}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container-fluid py-5">
                <div className="container pb-5">
                    <div className="row g-4">
                        <div className="col-12 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                                <h4 className="text-primary">Shop By Category</h4>
                                <h1 className="display-5 mb-4">Top Categories</h1>
                            </div>
                        </div>
                        {categories.slice(0, 8).map((category, index) => (
                            <div key={category.id} className="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay={`${0.1 + (index % 4) * 0.2}s`}>
                                <Link to={`/shop?categoryId=${category.id}`} className="d-flex align-items-center justify-content-between border rounded p-4 h-100 position-relative">
                                    <div>
                                        <h5 className="text-primary mb-2">{category.name}</h5>
                                        <span className="text-muted">{category.description || 'Electro'}</span>
                                    </div>
                                    <img src={`/electro/img/product-${(index % 8) + 3}.png`} className="img-fluid electro-category-thumb" alt={category.name} />
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                                        {category.productCount || 0}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container-fluid py-5">
                <div className="container pb-5">
                    <div className="row g-4">
                        <div className="col-12 wow fadeInUp" data-wow-delay="0.1s">
                            <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                                <h4 className="text-primary">Bestseller Products</h4>
                                <h1 className="display-5 mb-4">Most Popular</h1>
                            </div>
                        </div>
                        {bestsellerProducts.map((product, index) => (
                            <div key={product.id} className="col-md-6 col-lg-6 col-xl-4 wow fadeInUp" data-wow-delay={`${0.1 + (index % 3) * 0.2}s`}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
