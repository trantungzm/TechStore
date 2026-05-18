import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';
import coupons from '../../data/coupons';
import {
    calculateProductCouponDiscount,
    calculateShippingCouponDiscount,
    getClaimedCoupons,
    getCartSubtotal,
    getSelectedCouponUnavailableReason,
    getSelectedUsableCouponsForCart,
    validateSelectedCouponForCart,
} from '../../utils/couponUtils';
import PageHero from '../../components/store/PageHero';

const SHIPPING_FEE = 30000;
const CHECKOUT_SELECTION_KEY = 'store_checkout_selected_items';

const isItemOutOfStock = (item) => item?.product?.inStock === false || Number(item?.product?.stock ?? 0) <= 0;

const Cart = () => {
    const { items, updateQuantity, removeItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const selectionInitializedRef = useRef(false);
    const knownItemIdsRef = useRef(new Set());
    const [selectedIds, setSelectedIds] = useState([]);
    const [appliedProductCoupon, setAppliedProductCoupon] = useState(null);
    const [appliedShippingCoupon, setAppliedShippingCoupon] = useState(null);
    const [couponMessage, setCouponMessage] = useState('');
    const [couponMessageType, setCouponMessageType] = useState('primary');
    const [claimedIds, setClaimedIds] = useState([]);

    const availableItems = useMemo(() => items.filter((item) => !isItemOutOfStock(item)), [items]);
    const selectedCartItems = useMemo(
        () => items.filter((item) => selectedIds.includes(String(item.productId)) && !isItemOutOfStock(item)),
        [items, selectedIds]
    );
    const selectedSubtotal = useMemo(() => getCartSubtotal(selectedCartItems), [selectedCartItems]);
    const selectedCount = selectedCartItems.length;
    const allAvailableSelected = availableItems.length > 0 && availableItems.every((item) => selectedIds.includes(String(item.productId)));

    const claimedCoupons = useMemo(
        () => coupons.filter((coupon) => coupon?.code && claimedIds.includes(coupon.id)),
        [claimedIds]
    );
    const cartCoupons = useMemo(
        () => getSelectedUsableCouponsForCart(selectedCartItems, coupons, selectedSubtotal, SHIPPING_FEE),
        [selectedCartItems, selectedSubtotal]
    );
    const productCouponOptions = cartCoupons.filter(({ coupon }) => coupon.couponType === 'product');
    const shippingCouponOptions = cartCoupons.filter(({ coupon }) => coupon.couponType === 'shipping');

    const appliedProductValidation = appliedProductCoupon
        ? validateSelectedCouponForCart(appliedProductCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons)
        : null;
    const appliedShippingValidation = appliedShippingCoupon
        ? validateSelectedCouponForCart(appliedShippingCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons)
        : null;

    const productDiscount = appliedProductValidation?.valid
        ? calculateProductCouponDiscount(appliedProductCoupon, selectedCartItems, selectedSubtotal)
        : 0;
    const shippingDiscount = appliedShippingValidation?.valid
        ? calculateShippingCouponDiscount(appliedShippingCoupon, SHIPPING_FEE)
        : 0;
    const finalShippingFee = selectedCount > 0 ? Math.max(0, SHIPPING_FEE - shippingDiscount) : 0;
    const finalTotal = selectedCount > 0 ? Math.max(0, selectedSubtotal - productDiscount + finalShippingFee) : 0;
    const canCheckout = selectedCount > 0 && finalTotal > 0;

    useEffect(() => {
        setPageMeta({
            title: `${t('Shop Cart')} | Electro`,
            description: t('Cart meta description'),
        });
        setClaimedIds(getClaimedCoupons());
    }, []);

    useEffect(() => {
        const existingIds = new Set(items.map((item) => String(item.productId)));
        const availableIds = availableItems.map((item) => String(item.productId));

        setSelectedIds((current) => {
            if (!selectionInitializedRef.current) {
                selectionInitializedRef.current = true;
                knownItemIdsRef.current = existingIds;
                return availableIds;
            }

            const next = current.filter((id) => existingIds.has(id));
            const nextSet = new Set(next);
            availableIds.forEach((id) => {
                if (!knownItemIdsRef.current.has(id)) {
                    nextSet.add(id);
                }
            });
            return Array.from(nextSet);
        });

        knownItemIdsRef.current = existingIds;
    }, [items, availableItems]);

    useEffect(() => {
        if (appliedProductCoupon) {
            const result = validateSelectedCouponForCart(appliedProductCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons);
            if (!result.valid || result.coupon?.couponType !== 'product') {
                setAppliedProductCoupon(null);
                setCouponMessage('Phiếu sản phẩm đang áp dụng không còn phù hợp với sản phẩm đã chọn.');
                setCouponMessageType('warning');
            }
        }

        if (appliedShippingCoupon) {
            const result = validateSelectedCouponForCart(appliedShippingCoupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons);
            if (!result.valid || result.coupon?.couponType !== 'shipping') {
                setAppliedShippingCoupon(null);
                setCouponMessage('Phiếu vận chuyển đang áp dụng không còn phù hợp với sản phẩm đã chọn.');
                setCouponMessageType('warning');
            }
        }
    }, [selectedCartItems, selectedSubtotal, appliedProductCoupon, appliedShippingCoupon]);

    const showCouponMessage = (message, type = 'primary') => {
        setCouponMessage(message);
        setCouponMessageType(type);
    };

    const toggleItemSelection = (item) => {
        if (isItemOutOfStock(item)) return;
        const id = String(item.productId);
        setSelectedIds((current) => current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]);
    };

    const toggleSelectAll = () => {
        if (allAvailableSelected) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(availableItems.map((item) => String(item.productId)));
    };

    const handleRemoveSelected = () => {
        selectedCartItems.forEach((item) => removeItem(item.productId));
        setSelectedIds([]);
    };

    const handleMoveToWishlist = (item) => {
        if (!isInWishlist(item.product.id)) {
            toggleWishlist(item.product);
        }
        removeItem(item.productId);
    };

    const handleApplyCoupon = (coupon) => {
        const result = validateSelectedCouponForCart(coupon.code, selectedCartItems, selectedSubtotal, SHIPPING_FEE, coupons);
        if (!result.valid) {
            const unavailable = getSelectedCouponUnavailableReason(coupon, selectedCartItems, selectedSubtotal, SHIPPING_FEE);
            const message = unavailable?.missingAmount > 0
                ? `Chưa đủ điều kiện. Còn thiếu ${formatCurrency(unavailable.missingAmount)}`
                : unavailable?.message || result.message || 'Không áp dụng cho giỏ hàng này';
            showCouponMessage(message, 'danger');
            return;
        }

        if (coupon.couponType === 'product') {
            setAppliedProductCoupon(coupon);
            showCouponMessage(`Đã áp dụng phiếu sản phẩm ${coupon.code}.`, 'success');
            return;
        }

        if (coupon.couponType === 'shipping') {
            setAppliedShippingCoupon(coupon);
            showCouponMessage(`Đã áp dụng phiếu vận chuyển ${coupon.code}.`, 'success');
        }
    };

    const handleRemoveCoupon = (kind) => {
        if (kind === 'product') {
            setAppliedProductCoupon(null);
            showCouponMessage('Đã bỏ áp dụng phiếu sản phẩm.', 'secondary');
            return;
        }

        setAppliedShippingCoupon(null);
        showCouponMessage('Đã bỏ áp dụng phiếu vận chuyển.', 'secondary');
    };

    const handleCheckout = () => {
        if (!canCheckout) {
            showCouponMessage('Vui lòng chọn sản phẩm để thanh toán.', 'warning');
            return;
        }
        sessionStorage.setItem(CHECKOUT_SELECTION_KEY, JSON.stringify(selectedCartItems));
        navigate('/checkout');
    };

    const renderCouponCard = ({ coupon, valid, message, missingAmount, productDiscount: previewProductDiscount, shippingDiscount: previewShippingDiscount }) => {
        const isApplied = coupon.couponType === 'product'
            ? appliedProductCoupon?.id === coupon.id
            : appliedShippingCoupon?.id === coupon.id;
        const discountPreview = coupon.couponType === 'product' ? previewProductDiscount : previewShippingDiscount;
        const statusText = isApplied ? 'Đang áp dụng' : message;
        const unavailableText = missingAmount > 0 ? `Còn thiếu ${formatCurrency(missingAmount)}` : message;

        return (
            <div className={`cart-coupon-card ${isApplied ? 'is-applied' : ''} ${!valid ? 'is-disabled' : ''}`} key={coupon.id}>
                <div className="d-flex justify-content-between gap-3">
                    <div>
                        <div className="cart-coupon-code">{coupon.code}</div>
                        <div className="fw-semibold text-dark">{coupon.title}</div>
                        <div className="text-muted small">{coupon.description}</div>
                        {discountPreview > 0 && valid && (
                            <div className="text-success small mt-1">Dự kiến giảm {formatCurrency(discountPreview)}</div>
                        )}
                    </div>
                    <span className={`cart-coupon-status ${valid ? 'is-usable' : 'is-unavailable'}`}>{statusText}</span>
                </div>
                {!valid && <div className="text-danger small mt-2">{unavailableText}</div>}
                <div className="mt-3">
                    {isApplied ? (
                        <button type="button" className="btn btn-outline-primary rounded-pill btn-sm" onClick={() => handleRemoveCoupon(coupon.couponType)}>
                            Bỏ áp dụng
                        </button>
                    ) : (
                        <button type="button" className="btn btn-primary rounded-pill btn-sm" disabled={!valid} onClick={() => handleApplyCoupon(coupon)}>
                            Áp dụng
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <PageHero title={t('Shop Cart')} current={t('Shop Cart')} />
            <div className="container-fluid py-5">
                <div className="container py-5">
                    {items.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
                            <h4 className="text-muted mb-2">Giỏ hàng của bạn đang trống</h4>
                            <p className="text-muted mb-4">Nhanh tay chọn sản phẩm yêu thích để mua sắm ngay</p>
                            <Link to="/shop" className="btn btn-primary rounded-pill px-5 py-3">Tiếp tục mua sắm</Link>
                        </div>
                    ) : (
                        <>
                            <div className="cart-selection-bar border rounded bg-white p-3 mb-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                <label className="d-inline-flex align-items-center gap-2 fw-semibold mb-0">
                                    <input
                                        type="checkbox"
                                        className="form-check-input mt-0"
                                        checked={allAvailableSelected}
                                        onChange={toggleSelectAll}
                                        disabled={availableItems.length === 0}
                                    />
                                    Chọn tất cả
                                </label>
                                <div className="text-muted">Đã chọn {selectedCount} sản phẩm</div>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger rounded-pill"
                                    disabled={selectedCount === 0}
                                    onClick={handleRemoveSelected}
                                >
                                    Xóa sản phẩm đã chọn
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table align-middle cart-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Sản phẩm</th>
                                            <th scope="col">Đơn giá</th>
                                            <th scope="col">Số lượng</th>
                                            <th scope="col">Thành tiền</th>
                                            <th scope="col">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => {
                                            const outOfStock = isItemOutOfStock(item);
                                            const selected = selectedIds.includes(String(item.productId)) && !outOfStock;
                                            const stock = Number(item.product?.stock ?? 0);
                                            return (
                                                <tr key={item.productId} className={outOfStock ? 'cart-item-disabled' : ''}>
                                                    <th scope="row">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input mt-0"
                                                                checked={selected}
                                                                disabled={outOfStock}
                                                                onChange={() => toggleItemSelection(item)}
                                                                aria-label={`Chọn ${item.product.name}`}
                                                            />
                                                            <img src={resolveProductImage(item.product)} alt={item.product.name} className="img-fluid rounded electro-cart-thumb" />
                                                            <div>
                                                                <p className="mb-1 fw-semibold text-dark">{item.product.name}</p>
                                                                <div className="text-muted small">{item.product.category?.name || `G${item.product.id}`}</div>
                                                                {outOfStock ? (
                                                                    <span className="badge bg-danger mt-2">Hết hàng</span>
                                                                ) : stock > 0 && stock <= 5 ? (
                                                                    <span className="badge bg-warning text-dark mt-2">Chỉ còn {stock} sản phẩm</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <td>{formatCurrency(item.product.price)}</td>
                                                    <td>
                                                        <div className="input-group quantity" style={{ width: 120 }}>
                                                            <button type="button" className="btn btn-sm btn-minus rounded-circle bg-light border" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>
                                                                <i className="fa fa-minus"></i>
                                                            </button>
                                                            <input type="text" className="form-control form-control-sm text-center border-0" value={item.quantity} readOnly />
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-plus rounded-circle bg-light border"
                                                                onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, stock || item.quantity + 1))}
                                                                disabled={outOfStock || (stock > 0 && item.quantity >= stock)}
                                                            >
                                                                <i className="fa fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>{formatCurrency(item.product.price * item.quantity)}</td>
                                                    <td>
                                                        <div className="d-flex flex-column gap-2 align-items-start">
                                                            <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => removeItem(item.productId)}>
                                                                Xóa
                                                            </button>
                                                            <button type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => handleMoveToWishlist(item)}>
                                                                Chuyển sang yêu thích
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 d-flex flex-wrap gap-3">
                                <Link to="/shop" className="btn btn-outline-secondary rounded-pill px-4 py-3">
                                    <i className="fas fa-arrow-left me-2"></i>Tiếp tục mua sắm
                                </Link>
                            </div>

                            <div className="row g-4 justify-content-between mt-2">
                                <div className="col-lg-7">
                                    <div className="border rounded p-4 bg-white">
                                        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                            <div>
                                                <h4 className="mb-1">Phiếu giảm giá của bạn</h4>
                                                <div className="text-muted small">Phiếu được kiểm tra theo sản phẩm bạn đã chọn.</div>
                                            </div>
                                            <Link to="/promotion" className="btn btn-outline-primary rounded-pill">Săn thêm phiếu</Link>
                                        </div>

                                        {selectedCount === 0 && (
                                            <div className="alert alert-warning border">Vui lòng chọn sản phẩm để xem phiếu có thể áp dụng.</div>
                                        )}

                                        {claimedCoupons.length === 0 ? (
                                            <div className="alert alert-light border">Bạn chưa có phiếu giảm giá nào. Hãy nhận phiếu ở trang Phiếu giảm giá trước.</div>
                                        ) : (
                                            <>
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
                                            </>
                                        )}

                                        {couponMessage && (
                                            <div className={`alert alert-${couponMessageType} py-2 mt-3 mb-0`}>{couponMessage}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-sm-8 col-md-7 col-lg-5 col-xl-4">
                                    <div className="bg-light rounded">
                                        <div className="p-4">
                                            <h1 className="display-6 mb-4">Tóm tắt <span className="fw-normal">đơn hàng</span></h1>
                                            <div className="d-flex justify-content-between mb-3">
                                                <h5 className="mb-0 me-4">Sản phẩm đã chọn</h5>
                                                <p className="mb-0">{selectedCount}</p>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <h5 className="mb-0 me-4">Tạm tính sản phẩm</h5>
                                                <p className="mb-0">{formatCurrency(selectedSubtotal)}</p>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <h5 className="mb-0 me-4">Giảm giá sản phẩm</h5>
                                                <p className="mb-0 text-danger">-{formatCurrency(productDiscount)}</p>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <h5 className="mb-0 me-4">Phí vận chuyển</h5>
                                                <p className="mb-0">{formatCurrency(selectedCount > 0 ? SHIPPING_FEE : 0)}</p>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <h5 className="mb-0 me-4">Giảm phí vận chuyển</h5>
                                                <p className="mb-0 text-danger">-{formatCurrency(shippingDiscount)}</p>
                                            </div>
                                            {(appliedProductCoupon || appliedShippingCoupon) && (
                                                <div className="alert alert-success py-2 mt-3 mb-0">
                                                    {appliedProductCoupon && <div>Phiếu sản phẩm: <strong>{appliedProductCoupon.code}</strong></div>}
                                                    {appliedShippingCoupon && <div>Phiếu vận chuyển: <strong>{appliedShippingCoupon.code}</strong></div>}
                                                </div>
                                            )}
                                            {selectedCount === 0 && (
                                                <div className="alert alert-warning py-2 mt-3 mb-0">Vui lòng chọn sản phẩm để thanh toán</div>
                                            )}
                                        </div>
                                        <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                                            <h5 className="mb-0 ps-4 me-4">Tổng thanh toán</h5>
                                            <p className="mb-0 pe-4">{formatCurrency(finalTotal)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary rounded-pill px-4 py-3 text-uppercase mb-4 ms-4"
                                            disabled={!canCheckout}
                                            onClick={handleCheckout}
                                        >
                                            Tiến hành thanh toán
                                        </button>
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
