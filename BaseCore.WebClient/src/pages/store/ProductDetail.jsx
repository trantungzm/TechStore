import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
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

const ProductDetail = () => {
    const { id } = useParams();
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const numericId = useMemo(() => Number(id), [id]);

    useEffect(() => {
        setPageMeta({
            title: `${t('Product Details')} | Electro`,
            description: t('Product meta description'),
        });
    }, []);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await productApi.getById(numericId);
                const data = response.data;
                setProduct(data);

                const normalized = data
                    ? { id: data.id, name: data.name, price: data.price, imageUrl: data.imageUrl, categoryId: data.categoryId }
                    : null;
                if (normalized?.id) {
                    const current = safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []);
                    const withoutDup = Array.isArray(current) ? current.filter((p) => p?.id !== normalized.id) : [];
                    const next = [normalized, ...withoutDup].slice(0, 6);
                    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
                }
            } catch (e) {
                setError(e.response?.data?.message || t('Unable to load product.'));
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        if (!Number.isFinite(numericId) || numericId <= 0) {
            setError(t('Product not found'));
            setProduct(null);
            setLoading(false);
            return;
        }

        loadProduct();
    }, [numericId]);

    if (loading) {
        return (
            <>
                <PageHero title={t('Product Details')} current={t('Product Details')} />
                <div className="container py-5">
                    <div className="row g-4 align-items-start">
                        <div className="col-lg-5">
                            <div className="border rounded p-3 bg-white placeholder-glow">
                                <div className="placeholder w-100" style={{ height: 420 }}></div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="placeholder-glow">
                                <div className="placeholder col-8 mb-3"></div>
                                <div className="placeholder col-5 mb-2"></div>
                                <div className="placeholder col-4 mb-4"></div>
                                <div className="placeholder col-6 mb-2"></div>
                                <div className="placeholder col-7 mb-4"></div>
                                <div className="placeholder col-12" style={{ height: 120 }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <PageHero title={t('Product Details')} current={t('Product Details')} />
                <div className="container py-5">
                    <div className="alert alert-danger">{error}</div>
                    <Link to="/shop" className="btn btn-outline-primary">
                        {t('Back to Shop')}
                    </Link>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <PageHero title={t('Product Details')} current={t('Product Details')} />
                <div className="container py-5">
                    <div className="alert alert-light border">{t('Product not found')}</div>
                    <Link to="/shop" className="btn btn-outline-primary">
                        {t('Back to Shop')}
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHero title={t('Product Details')} current={product.name} />
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-4 align-items-start">
                        <div className="col-lg-5">
                            <div className="border rounded p-3 bg-white">
                                <img
                                    src={resolveProductImage(product)}
                                    className="img-fluid w-100"
                                    alt={product.name}
                                    style={{ maxHeight: 420, objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <h2 className="mb-2">{product.name}</h2>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                <span className="badge bg-light text-dark border">
                                    {t('Category')}: {t(product.category?.name || 'Electronics')}
                                </span>
                                <span className={`badge ${Number(product.stock || 0) > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                    {Number(product.stock || 0) > 0 ? t('In Stock') : t('Out of Stock')}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="h3 text-primary mb-0">{formatCurrency(product.price)}</div>
                                {Number(product.stock || 0) > 0 && (
                                    <small className="text-muted">{t('Available')}: {product.stock}</small>
                                )}
                            </div>

                            <div className="d-flex flex-wrap align-items-center mb-4" style={{ gap: 10 }}>
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill px-4 py-2"
                                    disabled={Number(product.stock || 0) <= 0}
                                    onClick={() => addItem(product, 1)}
                                >
                                    <i className="fas fa-shopping-cart me-2"></i>
                                    {t('Add To Cart')}
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-outline-primary rounded-pill px-4 py-2 ${isInCompare(product.id) ? 'active' : ''}`}
                                    onClick={() => toggleCompare(product)}
                                >
                                    <i className="fas fa-exchange-alt me-2"></i>
                                    {t('Compare')}
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-outline-danger rounded-pill px-4 py-2 ${isInWishlist(product.id) ? 'active' : ''}`}
                                    onClick={() => toggleWishlist(product)}
                                >
                                    <i className="fas fa-heart me-2"></i>
                                    {t('Wishlist')}
                                </button>
                            </div>

                            <div className="border rounded p-4 bg-light">
                                <h5 className="mb-3">{t('Description')}</h5>
                                <p className="mb-0">{product.description || t('No description')}</p>
                            </div>

                            <div className="mt-4">
                                <Link to="/shop" className="text-muted">
                                    <i className="fas fa-angle-left me-2"></i>
                                    {t('Back to Shop')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
