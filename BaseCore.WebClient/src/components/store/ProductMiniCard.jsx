import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCompare } from '../../contexts/CompareContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency, getProductCategoryName, getProductOldPrice, resolveProductImage, t } from '../../utils/store';
import { cn } from '../../utils/cn';

const ProductMiniCard = ({ product, onAddToCart }) => {
    const { addItem, items = [] } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();
    const rawImage = product.image?.trim();
    const productImage = rawImage
        ? (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/') ? rawImage : `/${rawImage.replace(/^\/+/, '')}`)
        : resolveProductImage(product);
    const categoryName = getProductCategoryName(product);
    const price = Number(product.price ?? product.Price ?? 0);
    const oldPrice = getProductOldPrice(product);
    const outOfStock = !product.stock || product.stock <= 0;
    const hasVariants = Array.isArray(product?.variants) && product.variants.some((variant) => variant?.isActive !== false);
    const productId = Number(product?.productId ?? product?.id);
    const isInCart = items.some((item) => Number(item?.productId ?? item?.product?.id ?? item?.product?.productId) === productId);
    const handleAdd = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        return onAddToCart ? onAddToCart(product) : addItem(product, 1);
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="group flex h-full gap-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:border-[var(--color-border-strong)]"
        >
            <Link
                to={`/product/${product.id}`}
                className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-[var(--color-background)]"
            >
                {productImage ? (
                    <img src={productImage} alt={product.name} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--color-fg-dim)]">
                        <i className="far fa-image text-xl"></i>
                    </div>
                )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                    <Link to={`/shop?categoryId=${product.categoryId || ''}`} className="ts-eyebrow text-[10px] text-[var(--color-fg-dim)] hover:text-[var(--color-accent)]">
                        {categoryName}
                    </Link>
                    <Link
                        to={`/product/${product.id}`}
                        className="mt-1 line-clamp-2 block text-sm font-medium text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
                    >
                        {product.name}
                    </Link>
                    <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="ts-mono text-sm font-semibold text-[var(--color-fg)]">{formatCurrency(product.price)}</span>
                        {oldPrice > price && (
                            <del className="ts-mono text-[11px] text-[var(--color-fg-dim)]">{formatCurrency(oldPrice)}</del>
                        )}
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                    {hasVariants ? (
                        <Link to={`/product/${product.id}`} className="ts-btn ts-btn-primary flex-1 px-2 py-1.5 text-[11px]">
                            Chọn
                        </Link>
                    ) : (
                        <button
                            type="button"
                            disabled={outOfStock}
                            onClick={handleAdd}
                            className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-sm text-[10px] transition-colors",
                                isInCart
                                    ? "text-black"
                                    : "text-[var(--color-fg-muted)] hover:text-black",
                                outOfStock && "cursor-not-allowed opacity-40 hover:text-[var(--color-fg-muted)]"
                            )}
                        >
                            <i className="fas fa-shopping-cart text-[10px]"></i>
                        </button>
                    )}
                    <button
                        type="button"
                        aria-label={t('Compare')}
                        onClick={(e) => { e.preventDefault(); toggleCompare(product); }}
                        className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-sm text-[10px] transition-colors",
                            isInCompare(product.id)
                                ? "text-black"
                                : "text-[var(--color-fg-muted)] hover:text-black"
                        )}
                    >
                        <i className={isInCompare(product.id) ? "fas fa-clone" : "far fa-clone"}></i>
                    </button>
                    <button
                        type="button"
                        aria-label={t('Wishlist')}
                        onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                        className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-sm text-[10px] transition-colors",
                            isInWishlist(product.id)
                                ? "text-black"
                                : "text-[var(--color-fg-muted)] hover:text-black"
                        )}
                    >
                        <i className={isInWishlist(product.id) ? "fas fa-heart" : "far fa-heart"}></i>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductMiniCard;
