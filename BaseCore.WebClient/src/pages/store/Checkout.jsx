import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import coupons from '../../data/coupons';
import PageHero from '../../components/store/PageHero';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';
import {
    calculateProductCouponDiscount,
    calculateShippingCouponDiscount,
    getCartSubtotal,
    getSelectedUsableCouponsForCart,
    validateSelectedCouponForCart,
} from '../../utils/couponUtils';

const CHECKOUT_SELECTION_KEY = 'store_checkout_selected_items';
const SHIPPING_FEE = 30000;

const pickupStores = [
    'CNTHHT Store - 123 Nguyễn Trãi, Hà Nội',
    'CNTHHT Store - 45 Cầu Giấy, Hà Nội',
    'CNTHHT Store - 88 Lê Văn Lương, Hà Nội',
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildOrderCode = () => {
    const now = new Date();
    const date = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('');
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `CNTHHT-${date}-${suffix}`;
};

const getCouponDescription = (coupon) => {
    if (coupon.discountType === 'freeship') return `Miễn phí vận chuyển cho đơn từ ${formatCurrency(coupon.minOrder || 0)}`;
    if (coupon.discountType === 'fixed') return `Giảm ${formatCurrency(coupon.value || 0)} cho đơn từ ${formatCurrency(coupon.minOrder || 0)}`;
    if (coupon.discountType === 'percent') {
        const cap = coupon.maxDiscount ? `, tối đa ${formatCurrency(coupon.maxDiscount)}` : '';
        return `Giảm ${coupon.value}% cho đơn từ ${formatCurrency(coupon.minOrder || 0)}${cap}`;
    }
    return `Điều kiện đơn từ ${formatCurrency(coupon.minOrder || 0)}`;
};

const getPaymentLabel = (method) => ({
    store: 'Thanh toán tại cửa hàng',
    bank: 'Chuyển khoản ngân hàng qua mã QR',
    momo: 'MoMo',
    shopeepay: 'ShopeePay',
    applepay: 'Apple Pay',
}[method] || 'Chưa chọn');

const Checkout = () => {
    const { items, removeItem } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState({});
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phone: '',
        email: '',
        notes: '',
    });
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [storePickupInfo, setStorePickupInfo] = useState({
        store: pickupStores[0],
        expectedTime: 'Trong 2 giờ sau khi xác nhận đơn hàng',
    });
    const [shippingAddress, setShippingAddress] = useState({
        province: '',
        district: '',
        ward: '',
        address: '',
    });
    const [invoiceRequired, setInvoiceRequired] = useState(false);
    const [invoiceInfo, setInvoiceInfo] = useState({
        name: '',
        taxCode: '',
        address: '',
        email: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('store');
    const [appliedProductCoupon, setAppliedProductCoupon] = useState(null);
    const [appliedShippingCoupon, setAppliedShippingCoupon] = useState(null);
    const [couponMessage, setCouponMessage] = useState('');

    useEffect(() => {
        setPageMeta({
            title: `${t('Checkout')} | Electro`,
            description: t('Checkout meta description'),
        });
    }, []);

    useEffect(() => {
        if (!user) return;
        setCustomerInfo((current) => ({
            ...current,
            fullName: current.fullName || user.name || '',
            phone: current.phone || user.phone || '',
            email: current.email || user.email || '',
        }));
    }, [user]);

    useEffect(() => {
        setPaymentMethod((current) => {
            if (deliveryMethod === 'pickup' && (!current || current === 'bank')) return 'store';
            if (deliveryMethod === 'shipping' && current === 'store') return 'bank';
            return current || (deliveryMethod === 'pickup' ? 'store' : 'bank');
        });
    }, [deliveryMethod]);

    const checkoutSelectionIds = useMemo(() => {
        try {
            const storedItems = JSON.parse(sessionStorage.getItem(CHECKOUT_SELECTION_KEY) || '[]');
            return Array.isArray(storedItems) ? storedItems.map((item) => String(item.productId)) : [];
        } catch {
            return [];
        }
    }, []);

    const selectedCartItems = useMemo(() => {
        if (checkoutSelectionIds.length === 0) return items;
        const selectedSet = new Set(checkoutSelectionIds);
        return items.filter((item) => selectedSet.has(String(item.productId)));
    }, [items, checkoutSelectionIds]);

    const productSubtotal = useMemo(() => getCartSubtotal(selectedCartItems), [selectedCartItems]);
    const shippingFee = deliveryMethod === 'shipping' ? SHIPPING_FEE : 0;
    const couponOptions = useMemo(
        () => getSelectedUsableCouponsForCart(selectedCartItems, coupons, productSubtotal, shippingFee),
        [selectedCartItems, productSubtotal, shippingFee]
    );
    const productCouponOptions = couponOptions.filter(({ coupon }) => coupon.couponType === 'product');
    const shippingCouponOptions = couponOptions.filter(({ coupon }) => coupon.couponType === 'shipping');

    const productValidation = appliedProductCoupon
        ? validateSelectedCouponForCart(appliedProductCoupon.code, selectedCartItems, productSubtotal, shippingFee, coupons)
        : null;
    const shippingValidation = appliedShippingCoupon
        ? validateSelectedCouponForCart(appliedShippingCoupon.code, selectedCartItems, productSubtotal, shippingFee, coupons)
        : null;

    const productDiscount = productValidation?.valid
        ? calculateProductCouponDiscount(appliedProductCoupon, selectedCartItems, productSubtotal)
        : 0;
    const shippingDiscount = shippingValidation?.valid
        ? calculateShippingCouponDiscount(appliedShippingCoupon, shippingFee)
        : 0;
    const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);
    const totalPayment = Math.max(0, productSubtotal - productDiscount + finalShippingFee);

    useEffect(() => {
        if (appliedProductCoupon && !productValidation?.valid) {
            setAppliedProductCoupon(null);
            setCouponMessage('Phiếu sản phẩm đang áp dụng không còn phù hợp.');
        }
        if (appliedShippingCoupon && !shippingValidation?.valid) {
            setAppliedShippingCoupon(null);
            setCouponMessage('Phiếu vận chuyển đang áp dụng không còn phù hợp.');
        }
    }, [appliedProductCoupon, appliedShippingCoupon, productValidation, shippingValidation]);

    const updateCustomerInfo = (field) => (event) => {
        setCustomerInfo((current) => ({ ...current, [field]: event.target.value }));
        setFormErrors((current) => ({ ...current, [field]: '' }));
    };

    const updateShippingAddress = (field) => (event) => {
        setShippingAddress((current) => ({ ...current, [field]: event.target.value }));
        setFormErrors((current) => ({ ...current, [`shipping.${field}`]: '' }));
    };

    const updateInvoiceInfo = (field) => (event) => {
        setInvoiceInfo((current) => ({ ...current, [field]: event.target.value }));
        setFormErrors((current) => ({ ...current, [`invoice.${field}`]: '' }));
    };

    const validateStepOne = () => {
        const nextErrors = {};
        if (!customerInfo.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên.';
        if (!customerInfo.phone.trim()) nextErrors.phone = 'Vui lòng nhập số điện thoại.';
        if (customerInfo.email.trim() && !emailPattern.test(customerInfo.email.trim())) nextErrors.email = 'Email chưa đúng định dạng.';

        if (deliveryMethod === 'pickup') {
            if (!storePickupInfo.store) nextErrors.pickupStore = 'Vui lòng chọn cửa hàng nhận hàng.';
        } else {
            if (!shippingAddress.province.trim()) nextErrors['shipping.province'] = 'Vui lòng nhập tỉnh / thành phố.';
            if (!shippingAddress.district.trim()) nextErrors['shipping.district'] = 'Vui lòng nhập quận / huyện.';
            if (!shippingAddress.ward.trim()) nextErrors['shipping.ward'] = 'Vui lòng nhập phường / xã.';
            if (!shippingAddress.address.trim()) nextErrors['shipping.address'] = 'Vui lòng nhập địa chỉ cụ thể.';
        }

        if (invoiceRequired) {
            if (!invoiceInfo.name.trim()) nextErrors['invoice.name'] = 'Vui lòng nhập tên công ty / cá nhân.';
            if (!invoiceInfo.taxCode.trim()) nextErrors['invoice.taxCode'] = 'Vui lòng nhập mã số thuế.';
            if (invoiceInfo.email.trim() && !emailPattern.test(invoiceInfo.email.trim())) nextErrors['invoice.email'] = 'Email nhận hóa đơn chưa đúng định dạng.';
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const goToPaymentStep = () => {
        if (!validateStepOne()) return;
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const applyCoupon = (coupon) => {
        const validation = validateSelectedCouponForCart(coupon.code, selectedCartItems, productSubtotal, shippingFee, coupons);
        if (!validation.valid) {
            const missing = validation.missingAmount > 0 ? ` Còn thiếu ${formatCurrency(validation.missingAmount)}.` : '';
            setCouponMessage(`${validation.message}.${missing}`);
            return;
        }
        if (coupon.couponType === 'product') {
            setAppliedProductCoupon(coupon);
            setCouponMessage(`Đã áp dụng phiếu sản phẩm ${coupon.code}.`);
            return;
        }
        setAppliedShippingCoupon(coupon);
        setCouponMessage(`Đã áp dụng phiếu vận chuyển ${coupon.code}.`);
    };

    const removeCoupon = (type) => {
        if (type === 'product') {
            setAppliedProductCoupon(null);
            setCouponMessage('Đã bỏ áp dụng phiếu sản phẩm.');
            return;
        }
        setAppliedShippingCoupon(null);
        setCouponMessage('Đã bỏ áp dụng phiếu vận chuyển.');
    };

    const placeOrder = () => {
        if (!validateStepOne()) {
            setCurrentStep(1);
            return;
        }
        if (selectedCartItems.length === 0) {
            setFormErrors({ order: 'Không có sản phẩm nào để thanh toán.' });
            return;
        }
        if (!paymentMethod) {
            setFormErrors({ paymentMethod: 'Vui lòng chọn phương thức thanh toán.' });
            return;
        }

        const order = {
            code: buildOrderCode(),
            items: selectedCartItems,
            deliveryMethod,
            paymentMethod,
            totalPayment,
        };

        selectedCartItems.forEach((item) => removeItem(item.productId));
        sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
        setOrderSuccess(order);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fullShippingAddress = [
        shippingAddress.address,
        shippingAddress.ward,
        shippingAddress.district,
        shippingAddress.province,
    ].filter(Boolean).join(', ');

    const renderFieldError = (key) => formErrors[key] ? <div className="text-danger small mt-1">{formErrors[key]}</div> : null;

    const renderCouponCard = ({ coupon, valid, message, missingAmount, productDiscount: previewProductDiscount, shippingDiscount: previewShippingDiscount }) => {
        const isApplied = coupon.couponType === 'product'
            ? appliedProductCoupon?.id === coupon.id
            : appliedShippingCoupon?.id === coupon.id;
        const discountPreview = coupon.couponType === 'product' ? previewProductDiscount : previewShippingDiscount;
        const unavailableText = missingAmount > 0 ? `Còn thiếu ${formatCurrency(missingAmount)}` : message;

        return (
            <div className={`cart-coupon-card ${isApplied ? 'is-applied' : ''} ${!valid ? 'is-disabled' : ''}`} key={coupon.id}>
                <div className="d-flex justify-content-between gap-3">
                    <div>
                        <div className="cart-coupon-code">{coupon.code}</div>
                        <div className="fw-semibold text-dark">{getCouponDescription(coupon)}</div>
                        <div className="text-muted small">Điều kiện: đơn từ {formatCurrency(coupon.minOrder || 0)}</div>
                        {discountPreview > 0 && valid && (
                            <div className="text-success small mt-1">Dự kiến giảm {formatCurrency(discountPreview)}</div>
                        )}
                    </div>
                    <span className={`cart-coupon-status ${valid ? 'is-usable' : 'is-unavailable'}`}>
                        {isApplied ? 'Đang áp dụng' : message}
                    </span>
                </div>
                {!valid && <div className="text-danger small mt-2">{unavailableText}</div>}
                <div className="mt-3">
                    {isApplied ? (
                        <button type="button" className="btn btn-outline-primary rounded-pill btn-sm" onClick={() => removeCoupon(coupon.couponType)}>
                            Bỏ áp dụng
                        </button>
                    ) : (
                        <button type="button" className="btn btn-primary rounded-pill btn-sm" disabled={!valid} onClick={() => applyCoupon(coupon)}>
                            Áp dụng
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderOrderSummary = () => (
        <div className="checkout-summary bg-white border rounded p-4">
            <h4 className="mb-4">Tóm tắt thanh toán</h4>
            <div className="d-flex justify-content-between mb-3">
                <span>Sản phẩm đã chọn</span>
                <strong>{selectedCartItems.length}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
                <span>Tạm tính sản phẩm</span>
                <strong>{formatCurrency(productSubtotal)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
                <span>Giảm giá sản phẩm</span>
                <strong className="text-danger">-{formatCurrency(productDiscount)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
                <span>Phí vận chuyển</span>
                <strong>{formatCurrency(shippingFee)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3">
                <span>Giảm phí vận chuyển</span>
                <strong className="text-danger">-{formatCurrency(shippingDiscount)}</strong>
            </div>
            <div className="border-top pt-3 d-flex justify-content-between fs-5">
                <span className="fw-semibold">Tổng thanh toán</span>
                <strong className="text-primary">{formatCurrency(totalPayment)}</strong>
            </div>
        </div>
    );

    if (orderSuccess) {
        return (
            <>
                <PageHero title="Đặt hàng thành công" current="Đặt hàng thành công" />
                <div className="container py-5">
                    <div className="bg-white border rounded p-4 p-lg-5 text-center">
                        <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 84, height: 84 }}>
                            <i className="fas fa-check fa-2x text-white"></i>
                        </div>
                        <h2 className="mb-2">Đặt hàng thành công</h2>
                        <p className="text-muted mb-4">Cảm ơn bạn đã mua hàng tại CNTHHT Store</p>
                        <div className="row g-3 text-start justify-content-center mb-4">
                            <div className="col-md-8 col-lg-6">
                                <div className="border rounded p-3">
                                    <div className="d-flex justify-content-between mb-2"><span>Mã đơn hàng</span><strong>{orderSuccess.code}</strong></div>
                                    <div className="d-flex justify-content-between mb-2"><span>Phương thức nhận hàng</span><strong>{deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao hàng tận nơi'}</strong></div>
                                    <div className="d-flex justify-content-between mb-2"><span>Phương thức thanh toán</span><strong>{getPaymentLabel(paymentMethod)}</strong></div>
                                    <div className="d-flex justify-content-between"><span>Tổng thanh toán</span><strong className="text-primary">{formatCurrency(totalPayment)}</strong></div>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive mb-4">
                            <table className="table align-middle">
                                <tbody>
                                    {orderSuccess.items.map((item) => (
                                        <tr key={item.productId}>
                                            <td className="text-start">{item.product.name}</td>
                                            <td>x{item.quantity}</td>
                                            <td className="text-end">{formatCurrency(item.product.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                            <Link to="/shop" className="btn btn-primary rounded-pill px-4">Tiếp tục mua sắm</Link>
                            <Link to="/orders" className="btn btn-outline-primary rounded-pill px-4">Xem đơn hàng của tôi</Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (selectedCartItems.length === 0) {
        return (
            <>
                <PageHero title={t('Checkout')} current={t('Checkout')} />
                <div className="container py-5 text-center">
                    <i className="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
                    <h4 className="text-muted mb-3">Không có sản phẩm nào để thanh toán</h4>
                    <Link to="/cart" className="btn btn-primary rounded-pill px-5 py-3">Quay lại giỏ hàng</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHero title={t('Checkout')} current={t('Checkout')} />
            <div className="container-fluid bg-light py-5">
                <div className="container py-4">
                    <div className="checkout-stepper mb-4">
                        <div className={`checkout-step ${currentStep >= 1 ? 'is-active' : ''}`}>
                            <span>1</span>
                            <strong>Nhập thông tin</strong>
                        </div>
                        <div className={`checkout-step ${currentStep >= 2 ? 'is-active' : ''}`}>
                            <span>2</span>
                            <strong>Thanh toán</strong>
                        </div>
                    </div>

                    <div className="row g-4 align-items-start">
                        <div className="col-lg-8">
                            {currentStep === 1 ? (
                                <div className="checkout-panel bg-white border rounded p-4">
                                    <h3 className="mb-4">Nhập thông tin</h3>

                                    <section className="mb-4">
                                        <h5 className="mb-3">Thông tin khách hàng</h5>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Họ và tên <sup className="text-danger">*</sup></label>
                                                <input className="form-control" value={customerInfo.fullName} onChange={updateCustomerInfo('fullName')} />
                                                {renderFieldError('fullName')}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Số điện thoại <sup className="text-danger">*</sup></label>
                                                <input className="form-control" value={customerInfo.phone} onChange={updateCustomerInfo('phone')} />
                                                {renderFieldError('phone')}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Email</label>
                                                <input className="form-control" value={customerInfo.email} onChange={updateCustomerInfo('email')} />
                                                {renderFieldError('email')}
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Ghi chú đơn hàng</label>
                                                <textarea className="form-control" rows="3" value={customerInfo.notes} onChange={updateCustomerInfo('notes')}></textarea>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <h5 className="mb-3">Thông tin nhận hàng</h5>
                                        <div className="checkout-radio-grid mb-3">
                                            <label className={`checkout-option ${deliveryMethod === 'pickup' ? 'is-selected' : ''}`}>
                                                <input type="radio" name="delivery" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                                                <span>Nhận tại cửa hàng</span>
                                            </label>
                                            <label className={`checkout-option ${deliveryMethod === 'shipping' ? 'is-selected' : ''}`}>
                                                <input type="radio" name="delivery" checked={deliveryMethod === 'shipping'} onChange={() => setDeliveryMethod('shipping')} />
                                                <span>Giao hàng tận nơi</span>
                                            </label>
                                        </div>

                                        {deliveryMethod === 'pickup' ? (
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label">Chọn cửa hàng nhận hàng <sup className="text-danger">*</sup></label>
                                                    <select className="form-select" value={storePickupInfo.store} onChange={(event) => setStorePickupInfo((current) => ({ ...current, store: event.target.value }))}>
                                                        {pickupStores.map((store) => <option value={store} key={store}>{store}</option>)}
                                                    </select>
                                                    {renderFieldError('pickupStore')}
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Thời gian dự kiến nhận hàng</label>
                                                    <input className="form-control" value={storePickupInfo.expectedTime} onChange={(event) => setStorePickupInfo((current) => ({ ...current, expectedTime: event.target.value }))} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Tỉnh / Thành phố <sup className="text-danger">*</sup></label>
                                                    <input className="form-control" value={shippingAddress.province} onChange={updateShippingAddress('province')} />
                                                    {renderFieldError('shipping.province')}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Quận / Huyện <sup className="text-danger">*</sup></label>
                                                    <input className="form-control" value={shippingAddress.district} onChange={updateShippingAddress('district')} />
                                                    {renderFieldError('shipping.district')}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Phường / Xã <sup className="text-danger">*</sup></label>
                                                    <input className="form-control" value={shippingAddress.ward} onChange={updateShippingAddress('ward')} />
                                                    {renderFieldError('shipping.ward')}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Địa chỉ cụ thể <sup className="text-danger">*</sup></label>
                                                    <input className="form-control" value={shippingAddress.address} onChange={updateShippingAddress('address')} />
                                                    {renderFieldError('shipping.address')}
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <section className="mb-4">
                                        <h5 className="mb-3">Khách hàng muốn xuất hóa đơn không?</h5>
                                        <div className="checkout-radio-grid mb-3">
                                            <label className={`checkout-option ${!invoiceRequired ? 'is-selected' : ''}`}>
                                                <input type="radio" name="invoice" checked={!invoiceRequired} onChange={() => setInvoiceRequired(false)} />
                                                <span>Không</span>
                                            </label>
                                            <label className={`checkout-option ${invoiceRequired ? 'is-selected' : ''}`}>
                                                <input type="radio" name="invoice" checked={invoiceRequired} onChange={() => setInvoiceRequired(true)} />
                                                <span>Có</span>
                                            </label>
                                        </div>

                                        {invoiceRequired && (
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Tên công ty / cá nhân <sup className="text-danger">*</sup></label>
                                                    <input className="form-control" value={invoiceInfo.name} onChange={updateInvoiceInfo('name')} />
                                                    {renderFieldError('invoice.name')}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Mã số thuế <sup className="text-danger">*</sup></label>
                                                    <input className="form-control" value={invoiceInfo.taxCode} onChange={updateInvoiceInfo('taxCode')} />
                                                    {renderFieldError('invoice.taxCode')}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Địa chỉ xuất hóa đơn</label>
                                                    <input className="form-control" value={invoiceInfo.address} onChange={updateInvoiceInfo('address')} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Email nhận hóa đơn</label>
                                                    <input className="form-control" value={invoiceInfo.email} onChange={updateInvoiceInfo('email')} />
                                                    {renderFieldError('invoice.email')}
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <div className="d-flex justify-content-between gap-3 flex-wrap">
                                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
                                        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={goToPaymentStep}>Tiếp tục thanh toán</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="checkout-panel bg-white border rounded p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                                        <div>
                                            <h3 className="mb-1">Thanh toán</h3>
                                            <p className="text-muted mb-0">Kiểm tra thông tin và chọn phương thức thanh toán.</p>
                                        </div>
                                        <button type="button" className="btn btn-outline-primary rounded-pill" onClick={() => setCurrentStep(1)}>Chỉnh sửa thông tin</button>
                                    </div>

                                    <section className="mb-4">
                                        <h5 className="mb-3">Thông tin nhận hàng</h5>
                                        <div className="checkout-review-grid">
                                            <div><span>Họ tên</span><strong>{customerInfo.fullName}</strong></div>
                                            <div><span>Số điện thoại</span><strong>{customerInfo.phone}</strong></div>
                                            <div><span>Email</span><strong>{customerInfo.email || 'Không cung cấp'}</strong></div>
                                            <div><span>Hình thức nhận hàng</span><strong>{deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao hàng tận nơi'}</strong></div>
                                            {deliveryMethod === 'pickup' ? (
                                                <>
                                                    <div><span>Cửa hàng nhận hàng</span><strong>{storePickupInfo.store}</strong></div>
                                                    <div><span>Thời gian dự kiến nhận hàng</span><strong>{storePickupInfo.expectedTime}</strong></div>
                                                </>
                                            ) : (
                                                <div><span>Địa chỉ nhận hàng</span><strong>{fullShippingAddress}</strong></div>
                                            )}
                                            <div><span>Ghi chú đơn hàng</span><strong>{customerInfo.notes || 'Không có'}</strong></div>
                                            <div><span>Xuất hóa đơn</span><strong>{invoiceRequired ? 'Có' : 'Không'}</strong></div>
                                            {invoiceRequired && (
                                                <>
                                                    <div><span>Tên công ty / cá nhân</span><strong>{invoiceInfo.name}</strong></div>
                                                    <div><span>Mã số thuế</span><strong>{invoiceInfo.taxCode}</strong></div>
                                                    <div><span>Địa chỉ xuất hóa đơn</span><strong>{invoiceInfo.address || 'Không cung cấp'}</strong></div>
                                                    <div><span>Email nhận hóa đơn</span><strong>{invoiceInfo.email || 'Không cung cấp'}</strong></div>
                                                </>
                                            )}
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <h5 className="mb-3">Sản phẩm thanh toán</h5>
                                        <div className="table-responsive">
                                            <table className="table align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Sản phẩm</th>
                                                        <th className="text-center">Số lượng</th>
                                                        <th className="text-end">Đơn giá</th>
                                                        <th className="text-end">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedCartItems.map((item) => (
                                                        <tr key={item.productId}>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <img src={resolveProductImage(item.product)} alt={item.product.name} className="electro-cart-thumb rounded" />
                                                                    <strong>{item.product.name}</strong>
                                                                </div>
                                                            </td>
                                                            <td className="text-center">x{item.quantity}</td>
                                                            <td className="text-end">{formatCurrency(item.product.price)}</td>
                                                            <td className="text-end">{formatCurrency(item.product.price * item.quantity)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <h5 className="mb-3">Phiếu giảm giá của bạn</h5>
                                        {couponMessage && <div className="alert alert-info py-2">{couponMessage}</div>}
                                        <h6 className="text-uppercase text-muted mb-3">Phiếu sản phẩm</h6>
                                        <div className="cart-coupon-list mb-4">
                                            {productCouponOptions.length
                                                ? productCouponOptions.map(renderCouponCard)
                                                : <div className="alert alert-light border mb-0">Bạn chưa có phiếu sản phẩm.</div>}
                                        </div>
                                        <h6 className="text-uppercase text-muted mb-3">Phiếu vận chuyển</h6>
                                        <div className="cart-coupon-list">
                                            {shippingCouponOptions.length
                                                ? shippingCouponOptions.map(renderCouponCard)
                                                : <div className="alert alert-light border mb-0">Bạn chưa có phiếu vận chuyển.</div>}
                                        </div>
                                    </section>

                                    <section className="mb-4">
                                        <h5 className="mb-3">Phương thức thanh toán</h5>
                                        {formErrors.paymentMethod && <div className="alert alert-danger py-2">{formErrors.paymentMethod}</div>}
                                        <div className="checkout-payment-grid">
                                            {[
                                                { value: 'store', label: 'Thanh toán tại cửa hàng', desc: 'Bạn sẽ thanh toán khi đến cửa hàng nhận sản phẩm.', disabled: deliveryMethod !== 'pickup' },
                                                { value: 'bank', label: 'Chuyển khoản ngân hàng qua mã QR', desc: 'Chuyển khoản trước khi đơn hàng được xử lý.' },
                                                { value: 'momo', label: 'MoMo', desc: 'Thanh toán qua ví MoMo.' },
                                                { value: 'shopeepay', label: 'ShopeePay', desc: 'Thanh toán qua ShopeePay.' },
                                                { value: 'applepay', label: 'Apple Pay', desc: 'Thanh toán qua Apple Pay.' },
                                            ].map((option) => (
                                                <label className={`checkout-payment-card ${paymentMethod === option.value ? 'is-selected' : ''} ${option.disabled ? 'is-disabled' : ''}`} key={option.value}>
                                                    <input type="radio" name="paymentMethod" checked={paymentMethod === option.value} disabled={option.disabled} onChange={() => setPaymentMethod(option.value)} />
                                                    <span>
                                                        <strong>{option.label}</strong>
                                                        <small>{option.desc}</small>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>

                                        {paymentMethod === 'bank' && (
                                            <div className="checkout-bank-box mt-3">
                                                <div>
                                                    <h6>Thông tin chuyển khoản</h6>
                                                    <p className="mb-1">Ngân hàng: <strong>Vietcombank</strong></p>
                                                    <p className="mb-1">Số tài khoản: <strong>0123456789</strong></p>
                                                    <p className="mb-1">Chủ tài khoản: <strong>CNTHHT STORE</strong></p>
                                                    <p className="mb-1">Nội dung chuyển khoản: <strong>CNTHHT {customerInfo.phone || 'SODIENTHOAI'}</strong></p>
                                                    <p className="mb-0">Số tiền cần thanh toán: <strong className="text-primary">{formatCurrency(totalPayment)}</strong></p>
                                                </div>
                                                <div className="checkout-qr-placeholder">QR thanh toán</div>
                                            </div>
                                        )}
                                        {paymentMethod === 'momo' && <div className="alert alert-light border mt-3">Thanh toán qua ví MoMo <button type="button" className="btn btn-sm btn-primary ms-2">Xác nhận thanh toán MoMo</button></div>}
                                        {paymentMethod === 'shopeepay' && <div className="alert alert-light border mt-3">Thanh toán qua ShopeePay <button type="button" className="btn btn-sm btn-primary ms-2">Xác nhận thanh toán ShopeePay</button></div>}
                                        {paymentMethod === 'applepay' && <div className="alert alert-light border mt-3">Thanh toán qua Apple Pay <button type="button" className="btn btn-sm btn-primary ms-2">Xác nhận Apple Pay</button></div>}
                                    </section>

                                    {formErrors.order && <div className="alert alert-danger">{formErrors.order}</div>}
                                    <div className="d-flex justify-content-between gap-3 flex-wrap">
                                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setCurrentStep(1)}>Quay lại</button>
                                        <button type="button" className="btn btn-primary rounded-pill px-5" onClick={placeOrder}>Đặt hàng</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-lg-4">
                            {renderOrderSummary()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
