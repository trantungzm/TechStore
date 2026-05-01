import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency, setPageMeta, t } from '../../utils/store';
import PageHero from '../../components/store/PageHero';

const Checkout = () => {
    const { items, totalAmount, clearCart } = useCart();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        company: '',
        address: '',
        city: '',
        country: '',
        postcode: '',
        mobile: '',
        email: '',
        notes: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setPageMeta({
            title: `${t('Checkout')} | Electro`,
            description: t('Checkout meta description'),
        });
    }, []);

    const payload = useMemo(() => ({
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerPhone: formData.mobile,
        customerEmail: formData.email,
        shippingAddress: [
            formData.company,
            formData.address,
            `${formData.city}${formData.postcode ? `, ${formData.postcode}` : ''}`,
            formData.country,
        ].filter(Boolean).join(', '),
        notes: formData.notes,
        paymentMethod: paymentMethod,
        items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
        })),
    }), [formData, items, paymentMethod]);

    const handleChange = (field) => (event) => {
        setFormData((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (items.length === 0) {
            setError('Cart is empty.');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const orderResult = await orderApi.create(payload);
            clearCart();
            
            // Mô phỏng payment gateway & gửi email
            if (paymentMethod !== 'cod') {
                setSuccess('Redirecting to payment gateway...');
                setTimeout(() => {
                    setSuccess(`Payment successful! Order ${orderResult.data.order.id} confirmed. Email sent.`);
                    setTimeout(() => navigate('/orders'), 2500);
                }, 1500);
            } else {
                setSuccess(`Order placed successfully! Pending confirmation. Email sent.`);
                setTimeout(() => navigate('/orders'), 2500);
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHero title={t('Checkout')} current={t('Checkout')} />
            <div className="container-fluid bg-light overflow-hidden py-5">
                <div className="container py-5">
                    <h1 className="mb-4 wow fadeInUp" data-wow-delay="0.1s">Billing details</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-5">
                            <div className="col-md-12 col-lg-6 col-xl-6 wow fadeInUp" data-wow-delay="0.1s">
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                <div className="row">
                                    <div className="col-md-12 col-lg-6">
                                        <div className="form-item w-100">
                                            <label className="form-label my-3">First Name<sup>*</sup></label>
                                            <input type="text" className="form-control" value={formData.firstName} onChange={handleChange('firstName')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-6">
                                        <div className="form-item w-100">
                                            <label className="form-label my-3">Last Name<sup>*</sup></label>
                                            <input type="text" className="form-control" value={formData.lastName} onChange={handleChange('lastName')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-item">
                                            <label className="form-label my-3">Company Name</label>
                                            <input type="text" className="form-control" value={formData.company} onChange={handleChange('company')} />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-item">
                                            <label className="form-label my-3">Address <sup>*</sup></label>
                                            <input type="text" className="form-control" placeholder="House Number Street Name" value={formData.address} onChange={handleChange('address')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-6">
                                        <div className="form-item">
                                            <label className="form-label my-3">Town/City<sup>*</sup></label>
                                            <input type="text" className="form-control" value={formData.city} onChange={handleChange('city')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-6">
                                        <div className="form-item">
                                            <label className="form-label my-3">Country<sup>*</sup></label>
                                            <input type="text" className="form-control" value={formData.country} onChange={handleChange('country')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-6">
                                        <div className="form-item">
                                            <label className="form-label my-3">Postcode/Zip<sup>*</sup></label>
                                            <input type="text" className="form-control" value={formData.postcode} onChange={handleChange('postcode')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-6">
                                        <div className="form-item">
                                            <label className="form-label my-3">Mobile<sup>*</sup></label>
                                            <input type="tel" className="form-control" value={formData.mobile} onChange={handleChange('mobile')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-item">
                                            <label className="form-label my-3">Email Address<sup>*</sup></label>
                                            <input type="email" className="form-control" value={formData.email} onChange={handleChange('email')} required />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-item">
                                            <label className="form-label my-3">Order Notes</label>
                                            <textarea className="form-control" rows="7" placeholder="Order Notes (Optional)" value={formData.notes} onChange={handleChange('notes')}></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12 col-lg-6 col-xl-6 wow fadeInUp" data-wow-delay="0.3s">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr className="text-center">
                                                <th scope="col" className="text-start">Name</th>
                                                <th scope="col">Model</th>
                                                <th scope="col">Price</th>
                                                <th scope="col">Quantity</th>
                                                <th scope="col">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr className="text-center" key={item.productId}>
                                                    <th scope="row" className="text-start py-4">{item.product.name}</th>
                                                    <td className="py-4">{item.product.category?.name || `G${item.product.id}`}</td>
                                                    <td className="py-4">{formatCurrency(item.product.price)}</td>
                                                    <td className="py-4">{item.quantity}</td>
                                                    <td className="py-4">{formatCurrency(item.product.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <th scope="row"></th>
                                                <td className="py-4"></td>
                                                <td className="py-4"></td>
                                                <td className="py-4"><p className="mb-0 text-dark py-2">TOTAL</p></td>
                                                <td className="py-4">
                                                    <div className="py-2 text-center border-bottom border-top">
                                                        <p className="mb-0 text-dark">{formatCurrency(totalAmount)}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row g-0 text-center align-items-center justify-content-center border-bottom py-2">
                                    <div className="col-12">
                                        <div className="form-check text-start my-2">
                                            <input type="radio" className="form-check-input bg-primary border-0" id="bank" name="payment" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                                            <label className="form-check-label" htmlFor="bank">Direct Bank Transfer</label>
                                        </div>
                                        <p className="text-start text-dark">Make your payment directly into our bank account. Please use your Order ID as the payment reference.</p>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-2">
                                    <div className="col-12">
                                        <div className="form-check text-start my-2">
                                            <input type="radio" className="form-check-input bg-primary border-0" id="check" name="payment" checked={paymentMethod === 'check'} onChange={() => setPaymentMethod('check')} />
                                            <label className="form-check-label" htmlFor="check">Check Payments</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-2">
                                    <div className="col-12">
                                        <div className="form-check text-start my-2">
                                            <input type="radio" className="form-check-input bg-primary border-0" id="cod" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                            <label className="form-check-label" htmlFor="cod">Cash On Delivery</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-2">
                                    <div className="col-12">
                                        <div className="form-check text-start my-2">
                                            <input type="radio" className="form-check-input bg-primary border-0" id="paypal" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                                            <label className="form-check-label" htmlFor="paypal">Paypal</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                                    <button type="submit" className="btn btn-primary border-secondary py-3 px-4 text-uppercase w-100 text-primary" disabled={loading || items.length === 0}>
                                        {loading ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Checkout;
