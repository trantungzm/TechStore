import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCompare } from '../../contexts/CompareContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency, getProductCategoryName, resolveProductImage, t } from '../../utils/store';
import { cardHoverVariant, imageHoverVariant } from '../../utils/motionVariants';

const ProductMiniCard = ({ product, onAddToCart }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();
    const rawImage = product.image?.trim();
    const productImage = rawImage
        ? (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/') ? rawImage : `/${rawImage.replace(/^\/+/, '')}`)
        : resolveProductImage(product);
    const categoryName = getProductCategoryName(product);
    const oldPrice = product.oldPrice || Math.round(Number(product.price || 0) * 1.19);
    const handleAdd = () => (onAddToCart ? onAddToCart(product) : addItem(product, 1));

    return (
        <motion.div
            className="electro-mini-product-card"
            whileHover={cardHoverVariant}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Link to={`/product/${product.id}`} className="electro-mini-product-image electro-product-image">
                <motion.img
                    src={productImage}
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
            <div className="electro-mini-product-content">
                <Link to={`/shop?categoryId=${product.categoryId || ''}`} className="electro-home-category">{categoryName}</Link>
                <Link to={`/product/${product.id}`} className="electro-home-product-title text-start">{product.name}</Link>
                <div className="electro-home-price justify-content-start">
                    <del>{formatCurrency(oldPrice)}</del>
                    <span>{formatCurrency(product.price)}</span>
                </div>
            </div>
            <div className="products-mini-add electro-mini-product-actions electro-mini-product-actions-desktop">
                <button type="button" className="electro-add-cart-btn" disabled={product.stock <= 0} onClick={handleAdd}>
                    <i className="fas fa-shopping-cart me-2"></i>{t('Add To Cart')}
                </button>
                <div className="electro-product-actions-row">
                    <div className="electro-product-action-icons">
                        <button type="button" aria-label={t('Compare')} onClick={() => toggleCompare(product)}>
                            <i className={`fas fa-random ${isInCompare(product.id) ? 'text-secondary' : ''}`}></i>
                        </button>
                        <button type="button" aria-label={t('Wishlist')} onClick={() => toggleWishlist(product)}>
                            <i className={`fas fa-heart ${isInWishlist(product.id) ? 'text-secondary' : ''}`}></i>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductMiniCard;
