import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';
import PageHero from '../../components/store/PageHero';

const Cart = () => {
    const { items, updateQuantity, removeItem, totalAmount } = useCart();

    useEffect(() => {
        setPageMeta({
            title: `${t('Shop Cart')} | Electro`,
            description: t('Cart meta description'),
        });
    }, []);

    return (
        <>
            <PageHero title={t('Shop Cart')} current={t('Shop Cart')} />
            <div className="container-fluid py-5">
                <div className="container py-5">
                    {items.length === 0 ? (
                        <div className="alert alert-light border">
                            {t('Cart is empty.')} <Link to="/shop">{t('Go to shop')}</Link>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">{t('Name')}</th>
                                            <th scope="col">{t('Model')}</th>
                                            <th scope="col">{t('Price')}</th>
                                            <th scope="col">{t('Quantity')}</th>
                                            <th scope="col">{t('Total')}</th>
                                            <th scope="col">{t('Action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.productId}>
                                                <th scope="row">
                                                    <div className="d-flex align-items-center">
                                                        <img src={resolveProductImage(item.product)} alt={item.product.name} className="img-fluid me-3 rounded electro-cart-thumb" />
                                                        <p className="mb-0 py-4">{item.product.name}</p>
                                                    </div>
                                                </th>
                                                <td><p className="mb-0 py-4">{item.product.category?.name || `G${item.product.id}`}</p></td>
                                                <td><p className="mb-0 py-4">{formatCurrency(item.product.price)}</p></td>
                                                <td>
                                                    <div className="input-group quantity py-4" style={{ width: 120 }}>
                                                        <div className="input-group-btn">
                                                            <button type="button" className="btn btn-sm btn-minus rounded-circle bg-light border" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>
                                                                <i className="fa fa-minus"></i>
                                                            </button>
                                                        </div>
                                                        <input type="text" className="form-control form-control-sm text-center border-0" value={item.quantity} readOnly />
                                                        <div className="input-group-btn">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-sm btn-plus rounded-circle bg-light border" 
                                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                                disabled={item.quantity >= (item.product?.stock || 0)}
                                                            >
                                                                <i className="fa fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {item.quantity >= (item.product?.stock || 0) && (
                                                        <small className="text-danger d-block mt-1">{t('Max stock reached')}</small>
                                                    )}
                                                </td>
                                                <td><p className="mb-0 py-4">{formatCurrency(item.product.price * item.quantity)}</p></td>
                                                <td className="py-4">
                                                    <button type="button" className="btn btn-md rounded-circle bg-light border" onClick={() => removeItem(item.productId)}>
                                                        <i className="fa fa-times text-danger"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-5">
                                <input type="text" className="border-0 border-bottom rounded me-5 py-3 mb-4" placeholder="Coupon Code" />
                                <button className="btn btn-primary rounded-pill px-4 py-3" type="button">Apply Coupon</button>
                            </div>
                            <div className="row g-4 justify-content-end">
                                <div className="col-8"></div>
                                <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
                                    <div className="bg-light rounded">
                                        <div className="p-4">
                                            <h1 className="display-6 mb-4">Cart <span className="fw-normal">Total</span></h1>
                                            <div className="d-flex justify-content-between mb-4">
                                                <h5 className="mb-0 me-4">Subtotal:</h5>
                                                <p className="mb-0">{formatCurrency(totalAmount)}</p>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <h5 className="mb-0 me-4">Shipping</h5>
                                                <div><p className="mb-0">Flat rate: 0</p></div>
                                            </div>
                                            <p className="mb-0 text-end">Shipping to your address.</p>
                                        </div>
                                        <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                                            <h5 className="mb-0 ps-4 me-4">Total</h5>
                                            <p className="mb-0 pe-4">{formatCurrency(totalAmount)}</p>
                                        </div>
                                        <Link to="/checkout" className="btn btn-primary rounded-pill px-4 py-3 text-uppercase mb-4 ms-4">Proceed Checkout</Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;
