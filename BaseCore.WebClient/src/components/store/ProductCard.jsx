import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCompare } from '../../contexts/CompareContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency, resolveProductImage, t } from '../../utils/store';
import coupons from '../../data/coupons';
import { getAvailableCouponsForProduct } from '../../utils/couponUtils';
import { actionRevealVariant, cardHoverVariant, imageHoverVariant } from '../../utils/motionVariants';

const Rating = ({ className = '' }) => (
    <div className={`electro-rating ${className}`} aria-label="5 star rating">
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
    </div>
);

const ProductCard = ({ product, onAddToCart }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();
    const badge = product.badge || '';
    const oldPrice = product.oldPrice || Math.round(Number(product.price || 0) * 1.19);
    const hasCoupon = getAvailableCouponsForProduct(product, coupons).length > 0;
    const handleAdd = () => (onAddToCart ? onAddToCart(product) : addItem(product, 1));

    return (
        <motion.div
            className="electro-product-card electro-home-product-card h-100"
            whileHover={cardHoverVariant}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {badge && <span className={`electro-product-badge-effect ${badge === 'Sale' ? 'sale' : ''}`}>{t(badge)}</span>}
            {hasCoupon && <span className="badge bg-primary position-absolute top-0 end-0 m-2" style={{ zIndex: 3 }}>Có mã giảm</span>}
            <Link to={`/product/${product.id}`} className="electro-product-image electro-home-product-image">
                <motion.img
                    src={resolveProductImage(product)}
                    alt={product.name}
                    variants={imageHoverVariant}
                    animate={isHovered ? 'hover' : 'rest'}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            className="electro-product-eye"
                            initial={{ opacity: 0, scale: 0.82 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.82 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <i className="fa fa-eye"></i>
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
            <div className="electro-home-product-body">
                <Link to={`/shop?categoryId=${product.categoryId || ''}`} className="electro-home-category">
                    {t(product.category?.name || 'SmartPhone')}
                </Link>
                <Link to={`/product/${product.id}`} className="electro-home-product-title">{product.name}</Link>
                <div className="electro-home-price">
                    <del>{formatCurrency(oldPrice)}</del>
                    <span>{formatCurrency(product.price)}</span>
                </div>
            </div>
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="electro-product-actions electro-product-actions-desktop"
                        variants={actionRevealVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <button type="button" className="electro-add-cart-btn" disabled={product.stock <= 0} onClick={handleAdd}>
                            <i className="fas fa-shopping-cart me-2"></i>{t('Add To Cart')}
                        </button>
                        <div className="electro-product-actions-row">
                            <Rating />
                            <div className="electro-product-action-icons">
                                <button type="button" aria-label={t('Compare')} onClick={() => toggleCompare(product)}>
                                    <i className={`fas fa-random ${isInCompare(product.id) ? 'text-secondary' : ''}`}></i>
                                </button>
                                <button type="button" aria-label={t('Wishlist')} onClick={() => toggleWishlist(product)}>
                                    <i className={`fas fa-heart ${isInWishlist(product.id) ? 'text-secondary' : ''}`}></i>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="electro-product-actions electro-product-actions-mobile">
                <button type="button" className="electro-add-cart-btn" disabled={product.stock <= 0} onClick={handleAdd}>
                    <i className="fas fa-shopping-cart me-2"></i>{t('Add To Cart')}
                </button>
                <div className="electro-product-actions-row">
                    <Rating />
                    <div className="electro-product-action-icons">
                        <button type="button" aria-label={t('Compare')} onClick={() => toggleCompare(product)}><i className="fas fa-random"></i></button>
                        <button type="button" aria-label={t('Wishlist')} onClick={() => toggleWishlist(product)}><i className="fas fa-heart"></i></button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
