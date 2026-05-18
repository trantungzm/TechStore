import React, { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';
import { formatCurrency, setPageMeta, t, toast } from '../../utils/store';
import PageHero from '../../components/store/PageHero';
import { Link } from 'react-router-dom';

// Hàm lấy màu badge theo trạng thái — Bootstrap 5
const getStatusBadgeClass = (status = '') => {
    if (status === 'Completed') return 'bg-success';
    if (status.includes('Cancel') || status === 'Cancelled & Refunded') return 'bg-danger';
    if (status === 'Shipped') return 'bg-info text-dark';
    if (status === 'Processing') return 'bg-primary';
    if (status === 'Confirmed') return 'bg-secondary';
    return 'bg-warning text-dark';
};

// Timeline stepper
const OrderTimeline = ({ timeline = [], status }) => {
    const steps = ['Created', 'Confirmed', 'Processing', 'Shipped', 'Completed'];
    const isCancelled = status?.includes('Cancel');

    if (isCancelled) {
        return (
            <div className="d-flex align-items-center gap-2 my-3">
                <span className="badge bg-danger px-3 py-2 fs-6">
                    <i className="fas fa-times-circle me-2"></i>{status}
                </span>
            </div>
        );
    }

    const currentIdx = (() => {
        for (let i = steps.length - 1; i >= 0; i--) {
            if (timeline?.some(t => t.status === steps[i]) || status === steps[i]) return i;
        }
        return 0;
    })();

    return (
        <div className="order-timeline d-flex align-items-center my-3 flex-wrap gap-1">
            {steps.map((step, idx) => {
                const done = idx <= currentIdx;
                return (
                    <React.Fragment key={step}>
                        <div className="d-flex flex-column align-items-center" style={{ minWidth: 72 }}>
                            <div
                                className={`rounded-circle d-flex align-items-center justify-content-center mb-1 ${done ? 'bg-primary text-white' : 'bg-light border text-muted'}`}
                                style={{ width: 34, height: 34, fontSize: 14 }}
                            >
                                <i className={`fas ${idx < currentIdx ? 'fa-check' : 'fa-circle'}`} style={{ fontSize: idx < currentIdx ? 12 : 8 }}></i>
                            </div>
                            <small className={`text-center ${done ? 'text-primary fw-semibold' : 'text-muted'}`} style={{ fontSize: 11, maxWidth: 68 }}>
                                {step}
                            </small>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-grow-1" style={{ height: 2, background: idx < currentIdx ? '#0d6efd' : '#dee2e6', minWidth: 16, marginBottom: 16 }}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const ORDERS_PER_PAGE = 8;

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await orderApi.getMyOrders();
            const raw = response.data || [];
            // Sắp xếp mới nhất lên đầu
            raw.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setOrders(raw);
        } catch (requestError) {
            const data = requestError.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không tải được danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPageMeta({
            title: `${t('Order History')} | Electro`,
            description: 'Xem và quản lý đơn hàng của bạn.',
        });
        loadOrders();
    }, []);

    // Reset page khi đổi filter
    useEffect(() => { setPage(1); }, [statusFilter]);

    const handleViewDetails = async (orderId) => {
        setDetailLoading(true);
        setSelectedOrder(null);
        try {
            const response = await orderApi.getById(orderId);
            if (!response.data || !response.data.order) throw new Error('empty');
            setSelectedOrder(response.data);
        } catch (err) {
            // Fallback: lấy basic data từ danh sách, không hiển thị dữ liệu sai
            const basicOrder = orders.find(o => o.id === orderId);
            if (basicOrder) {
                setSelectedOrder({ order: basicOrder, details: [] });
            } else {
                toast('Không thể tải chi tiết đơn hàng.', 'danger');
            }
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast(t('Cancel reason is required'), 'danger');
            return;
        }
        setCancelling(true);
        try {
            await orderApi.cancel(selectedOrder.order.id, { reason: cancelReason });
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedOrder(null);
            await loadOrders();
            toast('Gửi yêu cầu hủy đơn thành công!', 'success');
        } catch (err) {
            const data = err.response?.data;
            toast(data?.message || 'Không thể gửi yêu cầu hủy. Vui lòng thử lại.', 'danger');
        } finally {
            setCancelling(false);
        }
    };

    // Lọc theo trạng thái
    const filteredOrders = statusFilter
        ? orders.filter(o => {
            if (statusFilter === 'cancelled') return o.status.toLowerCase().includes('cancel');
            return o.status.toLowerCase() === statusFilter.toLowerCase();
        })
        : orders;

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1;
    const pagedOrders = filteredOrders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

    const statusOptions = [
        { value: '', label: 'Tất cả' },
        { value: 'Pending', label: 'Chờ xác nhận' },
        { value: 'Confirmed', label: 'Đã xác nhận' },
        { value: 'Processing', label: 'Đang xử lý' },
        { value: 'Shipped', label: 'Đang giao' },
        { value: 'Completed', label: 'Hoàn thành' },
        { value: 'cancelled', label: 'Đã hủy' },
    ];

    const paymentLabel = (method) => {
        if (method === 'cod') return 'Thanh toán khi nhận hàng (COD)';
        if (method === 'bank') return 'Chuyển khoản ngân hàng';
        if (method === 'paypal') return 'PayPal';
        if (method === 'check') return 'Séc';
        return method || 'Không xác định';
    };

    return (
        <>
            <PageHero title={t('Order History')} current={t('Order History')} />
            <div className="container-fluid py-5">
                <div className="container py-5">

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <div>
                            <h2 className="mb-1">Đơn hàng của tôi</h2>
                            <p className="text-muted mb-0 small">
                                {loading ? 'Đang tải...' : `${orders.length} đơn hàng`}
                            </p>
                        </div>
                        <Link to="/shop" className="btn btn-outline-primary rounded-pill px-4">
                            <i className="fas fa-shopping-bag me-2"></i>Tiếp tục mua sắm
                        </Link>
                    </div>

                    {/* Status filter tabs */}
                    <div className="d-flex gap-2 flex-wrap mb-4">
                        {statusOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 ${statusFilter === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setStatusFilter(opt.value)}
                            >
                                {opt.label}
                                {opt.value === '' && orders.length > 0 && (
                                    <span className="ms-1 badge bg-white text-primary">{orders.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }}></div>
                            <p className="text-muted mt-3">Đang tải danh sách đơn hàng...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger d-flex align-items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{error}</span>
                            <button className="btn btn-sm btn-outline-danger ms-auto" onClick={loadOrders}>Thử lại</button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-shopping-bag fa-4x text-muted mb-4"></i>
                            <h4 className="text-muted mb-3">Bạn chưa có đơn hàng nào</h4>
                            <Link to="/shop" className="btn btn-primary rounded-pill px-5 py-3">
                                Bắt đầu mua sắm
                            </Link>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="alert alert-light border text-center py-4">
                            <i className="fas fa-filter me-2 text-muted"></i>
                            Không có đơn hàng nào với trạng thái này.
                        </div>
                    ) : (
                        <>
                            <div className="bg-light rounded p-3 p-md-4">
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày đặt</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th className="text-center">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="fw-semibold">#{order.id}</td>
                                                    <td className="text-muted small">
                                                        {new Date(order.orderDate).toLocaleString('vi-VN')}
                                                    </td>
                                                    <td>
                                                        {/* Fix: Bootstrap 5 badge classes */}
                                                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-primary fw-semibold">
                                                        {formatCurrency(order.totalAmount)}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                            onClick={() => handleViewDetails(order.id)}
                                                        >
                                                            <i className="fas fa-eye me-1"></i>Chi tiết
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                                    <button
                                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            className={`btn btn-sm rounded-pill px-3 ${p === page ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Loading overlay for detail */}
            {detailLoading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1060 }}>
                    <div className="spinner-border text-white" role="status"></div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && !showCancelModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-receipt me-2 text-primary"></i>
                                    Chi tiết đơn hàng #{selectedOrder.order.id}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                            </div>
                            <div className="modal-body">

                                {/* Timeline stepper */}
                                <OrderTimeline
                                    timeline={selectedOrder.order.timeline}
                                    status={selectedOrder.order.status}
                                />

                                {/* Order info */}
                                <div className="row mb-4 g-3">
                                    <div className="col-sm-6">
                                        <div className="border rounded p-3 h-100">
                                            <h6 className="text-muted mb-2">
                                                <i className="fas fa-map-marker-alt me-1 text-primary"></i>
                                                Thông tin giao hàng
                                            </h6>
                                            <p className="mb-1 fw-semibold">{selectedOrder.order.customerName || '—'}</p>
                                            <p className="mb-1 text-muted small">{selectedOrder.order.shippingAddress || '—'}</p>
                                            {selectedOrder.order.customerPhone && (
                                                <p className="mb-1 small">
                                                    <i className="fas fa-phone me-1 text-muted"></i>
                                                    {selectedOrder.order.customerPhone}
                                                </p>
                                            )}
                                            <p className="mb-0 small">
                                                <i className="fas fa-credit-card me-1 text-muted"></i>
                                                {paymentLabel(selectedOrder.order.paymentMethod)}
                                            </p>
                                            {selectedOrder.order.notes && (
                                                <p className="mb-0 small text-muted mt-1">
                                                    <i className="fas fa-sticky-note me-1"></i>
                                                    {selectedOrder.order.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="border rounded p-3 h-100">
                                            <h6 className="text-muted mb-2">
                                                <i className="fas fa-info-circle me-1 text-primary"></i>
                                                Tình trạng đơn hàng
                                            </h6>
                                            <span className={`badge ${getStatusBadgeClass(selectedOrder.order.status)} mb-2 px-3 py-2`}>
                                                {selectedOrder.order.status}
                                            </span>
                                            <p className="mb-1 small text-muted">
                                                Ngày đặt: {new Date(selectedOrder.order.orderDate).toLocaleString('vi-VN')}
                                            </p>
                                            {selectedOrder.order.paymentStatus && (
                                                <p className="mb-0 small">
                                                    Thanh toán: <span className={`fw-semibold ${selectedOrder.order.paymentStatus === 'Paid' ? 'text-success' : selectedOrder.order.paymentStatus === 'Refunded' ? 'text-info' : 'text-warning'}`}>
                                                        {selectedOrder.order.paymentStatus}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order items */}
                                {selectedOrder.details.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm border">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th className="text-center">Số lượng</th>
                                                    <th className="text-end">Đơn giá</th>
                                                    <th className="text-end">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.details.map((detail) => (
                                                    <tr key={detail.id}>
                                                        <td>
                                                            {/* Fix: hiển thị tên sản phẩm thực, không phải ID */}
                                                            <span className="fw-semibold">
                                                                {detail.product?.name || detail.productName || `Sản phẩm #${detail.productId}`}
                                                            </span>
                                                            {detail.product?.category?.name && (
                                                                <small className="d-block text-muted">{detail.product.category.name}</small>
                                                            )}
                                                        </td>
                                                        <td className="text-center">{detail.quantity}</td>
                                                        <td className="text-end">{formatCurrency(detail.unitPrice)}</td>
                                                        <td className="text-end fw-semibold">{formatCurrency(detail.totalPrice ?? detail.unitPrice * detail.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <th colSpan="3" className="text-end">Tổng cộng:</th>
                                                    <th className="text-end text-primary fs-5">{formatCurrency(selectedOrder.order.totalAmount)}</th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="alert alert-light border text-center py-3">
                                        <i className="fas fa-box-open me-2 text-muted"></i>
                                        Không tải được chi tiết sản phẩm.
                                    </div>
                                )}

                                {/* Cancel reason */}
                                {selectedOrder.order.status.includes('Cancel') && selectedOrder.order.cancelReason && (
                                    <div className="alert alert-danger mt-3 mb-0">
                                        <strong><i className="fas fa-ban me-1"></i>Lý do hủy:</strong> {selectedOrder.order.cancelReason}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                {['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(selectedOrder.order.status) && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger rounded-pill"
                                        onClick={() => setShowCancelModal(true)}
                                    >
                                        <i className="fas fa-times me-2"></i>Yêu cầu hủy đơn
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setSelectedOrder(null)}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Xác nhận hủy đơn hàng
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn đang yêu cầu hủy đơn hàng <strong>#{selectedOrder?.order?.id}</strong>.</p>
                                <div className="alert alert-warning small py-2">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Nếu đơn chưa giao, yêu cầu sẽ được xử lý trong vòng 5 phút.
                                    Nếu đã thanh toán, quản trị viên sẽ hoàn tiền trong 24h.
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Lý do hủy đơn <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Ví dụ: Đổi ý, muốn mua sản phẩm khác..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowCancelModal(false)}>
                                    Quay lại
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger rounded-pill"
                                    onClick={handleCancelOrder}
                                    disabled={cancelling || !cancelReason.trim()}
                                >
                                    {cancelling
                                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi...</>
                                        : <><i className="fas fa-paper-plane me-2"></i>Gửi yêu cầu</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Orders;
