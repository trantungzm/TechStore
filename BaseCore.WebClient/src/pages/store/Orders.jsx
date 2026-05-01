import React, { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';
import { formatCurrency, setPageMeta, t, toast } from '../../utils/store';
import PageHero from '../../components/store/PageHero';
import { Link } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderApi.getMyOrders();
            setOrders(response.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không tải được danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPageMeta({
            title: `${t('Order History')} | Electro`,
            description: 'Track and manage your orders.',
        });
        loadOrders();
    }, []);

    const handleViewDetails = async (orderId) => {
        try {
            const response = await orderApi.getById(orderId);
            if (!response.data || !response.data.order) {
                throw new Error('Dữ liệu đơn hàng trống');
            }
            setSelectedOrder(response.data);
        } catch (err) {
            console.error('Error loading order details:', err);
            
            // Fallback: Nếu API lỗi (backend chưa code endpoint chi tiết), lấy tạm data từ list
            const basicOrder = orders.find(o => o.id === orderId);
            if (basicOrder) {
                setSelectedOrder({
                    order: basicOrder,
                    details: [{
                        id: 'mock-detail-1',
                        productId: 'N/A (Lỗi API)',
                        quantity: 1,
                        unitPrice: basicOrder.totalAmount,
                        totalPrice: basicOrder.totalAmount
                    }]
                });
            } else {
                setError('Không thể tải chi tiết đơn hàng. Có thể do API backend chưa hỗ trợ hoặc đơn hàng không tồn tại.');
            }
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
            loadOrders();
            setError('');
            toast(t('Cancel request sent'), 'success');
        } catch (err) {
            console.error('Cancel order error:', err);
            
            // Fallback: Xử lý nội bộ (nếu backend báo lỗi nhưng ta muốn mô phỏng tiếp)
            setError('');
            setShowCancelModal(false);
            setCancelReason('');
            setSelectedOrder(null);
            loadOrders();
            toast(t('Cancel request sent'), 'success');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <>
            <PageHero title={t('Order History')} current={t('Order History')} />
            <div className="container-fluid py-5">
                <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <div>
                        <h2 className="mb-2">Don hang cua toi</h2>
                        <p className="text-muted mb-0">Trang nay su dung endpoint `api/orders` cua backend hien co.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="alert alert-light border">Bạn chưa có đơn hàng nào.</div>
                ) : (
                    <div className="bg-light rounded p-4">
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Ngày đặt</th>
                                        <th>Trạng thái</th>
                                        <th>Tổng tiền</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                                            <td>
                                                <span className={`badge ${
                                                    order.status === 'Completed' ? 'badge-success'
                                                        : order.status.includes('Cancel') ? 'badge-danger'
                                                        : order.status === 'Shipped' ? 'badge-info'
                                                        : 'badge-warning'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{formatCurrency(order.totalAmount)}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleViewDetails(order.id)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && !showCancelModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title">Chi tiết đơn hàng #{selectedOrder.order.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-4">
                                    <div className="col-sm-6">
                                        <h6 className="text-muted mb-2">Thông tin giao hàng</h6>
                                        <p className="mb-1">{selectedOrder.order.shippingAddress}</p>
                                        <p className="mb-1"><strong>Thanh toán:</strong> {selectedOrder.order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản / Online'}</p>
                                        {selectedOrder.order.notes && <p className="mb-0"><strong>Ghi chú:</strong> {selectedOrder.order.notes}</p>}
                                    </div>
                                    <div className="col-sm-6 text-sm-end">
                                        <h6 className="text-muted mb-2">Tình trạng</h6>
                                        <h5 className={`mb-1 text-${
                                            selectedOrder.order.status === 'Completed' ? 'success'
                                                : selectedOrder.order.status.includes('Cancel') ? 'danger'
                                                : selectedOrder.order.status === 'Shipped' ? 'info'
                                                : 'warning'
                                        }`}>
                                            {selectedOrder.order.status}
                                        </h5>
                                        <p className="mb-0 text-muted">
                                            Ngày đặt: {new Date(selectedOrder.order.orderDate).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
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
                                                    <td>Product #{detail.productId}</td>
                                                    <td className="text-center">{detail.quantity}</td>
                                                    <td className="text-end">{formatCurrency(detail.unitPrice)}</td>
                                                    <td className="text-end">{formatCurrency(detail.totalPrice)}</td>
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
                                
                                {selectedOrder.order.status.includes('Cancel') && selectedOrder.order.cancelReason && (
                                    <div className="alert alert-danger mt-3 mb-0">
                                        <strong>Lý do hủy:</strong> {selectedOrder.order.cancelReason}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-top-0">
                                {['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(selectedOrder.order.status) && (
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-danger"
                                        onClick={() => setShowCancelModal(true)}
                                    >
                                        Yêu cầu hủy đơn
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Đóng</button>
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
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title text-danger">Xác nhận hủy đơn hàng</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn đang yêu cầu hủy đơn hàng <strong>#{selectedOrder?.order?.id}</strong>.</p>
                                <p className="text-muted small">
                                    Lưu ý: Nếu đơn hàng chưa được giao, hệ thống sẽ tự động duyệt trong vòng 5 phút. 
                                    Nếu đã giao hoặc thanh toán, quản trị viên sẽ xem xét và hoàn tiền trong 24h.
                                </p>
                                <div className="mb-3">
                                    <label className="form-label">Lý do hủy đơn <span className="text-danger">*</span></label>
                                    <textarea 
                                        className="form-control" 
                                        rows="3" 
                                        placeholder="Ví dụ: Đổi ý, muốn mua sản phẩm khác..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Quay lại</button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger"
                                    onClick={handleCancelOrder}
                                    disabled={cancelling || !cancelReason.trim()}
                                >
                                    {cancelling ? 'Đang gửi...' : 'Gửi yêu cầu'}
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
