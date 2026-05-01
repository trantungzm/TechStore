import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { formatCurrency, resolveProductImage, t } from '../../utils/store';

const ProductCard = ({ product }) => {
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();

    return (
        <div className="products-mini-item border h-100">
            <div className="row g-0">
                <div className="col-5">
                    <div className="products-mini-img border-end h-100">
                        <img src={resolveProductImage(product)} className="img-fluid w-100 h-100 electro-product-fit" alt={product.name} />
                        <div className="products-mini-icon rounded-circle bg-primary">
                            <Link to={`/product/${product.id}`}><i className="fa fa-eye fa-1x text-white"></i></Link>
                        </div>
                    </div>
                </div>
                <div className="col-7">
                    <div className="products-mini-content p-3">
                        <Link to={`/shop?categoryId=${product.categoryId}`} className="d-block mb-2 text-muted">
                            {t(product.category?.name || 'Electronics')}
                        </Link>
                        <Link to={`/product/${product.id}`} className="d-block h4 text-dark mb-1">
                            {product.name}
                        </Link>
                        <span className="text-primary fs-5">{formatCurrency(product.price)}</span>
                    </div>
                </div>
            </div>
            <div className="products-mini-add border p-3 d-flex justify-content-between align-items-center">
                <button
                    type="button"
                    className="btn btn-primary border-secondary rounded-pill py-2 px-3"
                    disabled={product.stock <= 0}
                    onClick={() => addItem(product, 1)}
                >
                    <i className="fas fa-shopping-cart me-2"></i> {t('Add To Cart')}
                </button>
                <div className="d-flex">
                    <button 
                        className={`btn btn-link p-0 text-primary d-flex align-items-center justify-content-center me-2`}
                        onClick={() => toggleCompare(product)}
                        title={t('Compare')}
                    >
                        <span className={`rounded-circle btn-sm-square border ${isInCompare(product.id) ? 'bg-primary text-white' : ''}`}>
                            <i className="fas fa-exchange-alt"></i>
                        </span>
                    </button>
                    <button 
                        className={`btn btn-link p-0 text-primary d-flex align-items-center justify-content-center m-0`}
                        onClick={() => toggleWishlist(product)}
                        title={t('Wishlist')}
                    >
                        <span className={`rounded-circle btn-sm-square border ${isInWishlist(product.id) ? 'bg-primary text-white' : ''}`}>
                            <i className="fas fa-heart"></i>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
