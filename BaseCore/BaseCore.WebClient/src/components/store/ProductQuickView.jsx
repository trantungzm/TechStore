import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, resolveProductImage, t } from '../../utils/store';
import { useCart } from '../../contexts/CartContext';

const ProductQuickView = ({ product, onClose }) => {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        if (product) {
            setMainImage(resolveProductImage(product));
            setQuantity(1);
        }
    }, [product]);

    if (!product) return null;

    const handleAddToCart = () => {
        addItem(product, quantity);
        if (onClose) onClose();
    };

    // Dummy thumbnails for demonstration as per screenshot
    const thumbnails = [
        resolveProductImage(product),
        '/electro/img/product-1.png',
        '/electro/img/product-2.png',
        '/electro/img/product-3.png',
        '/electro/img/product-4.png',
    ];

    return (
        <motion.div 
            className="electro-quickview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div 
                className="electro-quickview-content"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="electro-quickview-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="row g-0">
                    {/* Left: Images */}
                    <div className="col-lg-6 border-end">
                        <div className="p-4 d-flex flex-column h-100">
                            <div className="electro-quickview-main-img mb-4">
                                <img src={mainImage} alt={product.name} className="img-fluid" />
                                <button className="nav-btn prev"><i className="fas fa-chevron-left"></i></button>
                                <button className="nav-btn next"><i className="fas fa-chevron-right"></i></button>
                            </div>
                            <div className="electro-quickview-thumbnails d-flex gap-2 justify-content-center mt-auto">
                                {thumbnails.map((thumb, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`thumb-item ${mainImage === thumb ? 'active' : ''}`}
                                        onClick={() => setMainImage(thumb)}
                                    >
                                        <img src={thumb} alt="thumb" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="col-lg-6">
                        <div className="p-4">
                            <h2 className="electro-quickview-title">{product.name}</h2>
                            <p className="text-muted mb-2">Category: <span className="text-primary">{product.category?.name || 'Electronics'}</span></p>
                            
                            <div className="h3 text-primary fw-bold mb-3">{formatCurrency(product.price)}</div>
                            
                            <div className="electro-rating mb-4">
                                <i className="fas fa-star text-primary"></i>
                                <i className="fas fa-star text-primary"></i>
                                <i className="fas fa-star text-primary"></i>
                                <i className="fas fa-star text-primary"></i>
                                <i className="fas fa-star text-muted"></i>
                            </div>

                            <div className="d-flex gap-2 mb-4">
                                <button className="btn btn-facebook flex-fill text-white" style={{ backgroundColor: '#3b5998' }}>
                                    <i className="fab fa-facebook-f me-2"></i>Share
                                </button>
                                <button className="btn btn-twitter flex-fill text-white" style={{ backgroundColor: '#1da1f2' }}>
                                    <i className="fab fa-twitter me-2"></i>Share
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="mb-1 text-muted">Product SKU: <span className="text-dark">N/A</span></p>
                                <p className="mb-0 text-muted">Available: <span className="text-secondary fw-bold">{product.stock} items in stock</span></p>
                            </div>

                            <p className="electro-quickview-desc text-muted mb-4">
                                {product.description || "The generated Lorem Ipsum is therefore always free from repetition injected humour, or non-characteristic words etc."}
                            </p>

                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="input-group" style={{ width: '120px' }}>
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <input type="text" className="form-control form-control-sm text-center border-secondary" value={quantity} readOnly />
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setQuantity(quantity + 1)}>
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <button className="btn btn-primary rounded-pill py-2 px-5 fw-bold w-100 mb-4" onClick={handleAddToCart}>
                                <i className="fas fa-shopping-cart me-2"></i>Add to cart
                            </button>

                            <div className="electro-quickview-tabs">
                                <div className="tabs-header d-flex border-bottom mb-3">
                                    <button 
                                        className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('description')}
                                    >
                                        Description
                                    </button>
                                    <button 
                                        className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('reviews')}
                                    >
                                        Reviews
                                    </button>
                                </div>
                                <div className="tabs-content text-muted small">
                                    {activeTab === 'description' ? (
                                        <p>Our new products are designed to power up your digital life. High quality materials and state of the art technology.</p>
                                    ) : (
                                        <p>No reviews yet. Be the first to review this product!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductQuickView;
