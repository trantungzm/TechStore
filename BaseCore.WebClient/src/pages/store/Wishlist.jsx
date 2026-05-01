import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductCard from '../../components/store/ProductCard';
import PageHero from '../../components/store/PageHero';
import { setPageMeta, t } from '../../utils/store';

const Wishlist = () => {
    const { wishlistItems } = useWishlist();

    useEffect(() => {
        setPageMeta({
            title: `${t('Wishlist')} | Electro`,
            description: t('Wishlist meta description'),
        });
    }, []);

    return (
        <>
            <PageHero title={t('Wishlist')} current={t('Wishlist')} />
            <div className="container-fluid py-5">
                <div className="container py-5">
                    {wishlistItems.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-heart fa-4x text-muted mb-4"></i>
                            <h4 className="mb-4 text-muted">{t('Your wishlist is empty')}</h4>
                            <Link to="/shop" className="btn btn-primary rounded-pill py-3 px-5">
                                {t('Continue Shopping')}
                            </Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {wishlistItems.map((product) => (
                                <div key={product.id} className="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.1s">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wishlist;
