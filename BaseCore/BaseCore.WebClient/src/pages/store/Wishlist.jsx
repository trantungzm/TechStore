import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import ProductCard from '../../components/store/ProductCard';
import PageHero from '../../components/store/PageHero';
import { setPageMeta, t, toast } from '../../utils/store';

const Wishlist = () => {
    const { wishlistItems, clearWishlist } = useWishlist();
    const { addItem } = useCart();

    useEffect(() => {
        setPageMeta({
            title: `${t('Wishlist')} | Electro`,
            description: t('Wishlist meta description'),
        });
    }, []);

    const handleAddAll = () => {
        const inStock = wishlistItems.filter(p => p.stock > 0);
        if (inStock.length === 0) {
            toast('Tất cả sản phẩm trong wishlist đã hết hàng.', 'danger');
            return;
        }
        inStock.forEach(p => addItem(p, 1));
        toast(`Đã thêm ${inStock.length} sản phẩm vào giỏ hàng!`, 'success');
    };

    return (
        <>
            <PageHero title={t('Wishlist')} current={t('Wishlist')} />
            <div className="container-fluid py-5">
                <div className="container py-5">
                    {wishlistItems.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-heart fa-4x text-muted mb-4"></i>
                            <h4 className="mb-3 text-muted">{t('Your wishlist is empty')}</h4>
                            <Link to="/shop" className="btn btn-primary rounded-pill py-3 px-5">
                                {t('Continue Shopping')}
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                                <p className="text-muted mb-0">
                                    <i className="fas fa-heart text-danger me-2"></i>
                                    {wishlistItems.length} sản phẩm trong danh sách yêu thích
                                </p>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary rounded-pill px-4"
                                        onClick={handleAddAll}
                                    >
                                        <i className="fas fa-shopping-cart me-2"></i>Thêm tất cả vào giỏ
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger rounded-pill px-4"
                                        onClick={() => {
                                            if (window.confirm('Xóa toàn bộ danh sách yêu thích?')) clearWishlist();
                                        }}
                                    >
                                        <i className="fas fa-trash me-2"></i>Xóa tất cả
                                    </button>
                                </div>
                            </div>

                            <div className="row g-4">
                                {wishlistItems.map((product) => (
                                    <div key={product.id} className="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.1s">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wishlist;
