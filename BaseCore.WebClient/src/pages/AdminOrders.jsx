import React, { useState, useEffect } from 'react';
import { orderApi, userApi } from '../services/api';
import { formatCurrency } from '../utils/store';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [searchUsername, setSearchUsername] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [users, setUsers] = useState({});
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const [processingActionId, setProcessingActionId] = useState(null);

    const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled', 'Cancel Requested', 'Cancelled & Refunded'];

    useEffect(() => {
        loadOrders();
        loadUsers();
    }, [page, keyword, searchUsername, filterStatus, sortOrder]);

    const loadUsers = async () => {
        try {
            const response = await userApi.getAll({ page: 1, pageSize: 100 });
            const usersMap = {};
            (response.data.data || []).forEach(user => {
                usersMap[user.id] = user;
            });
            setUsers(usersMap);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderApi.getAll();
            let filteredOrders = response.data || [];

            // Filter by keyword (search in order id)
            if (keyword) {
                filteredOrders = filteredOrders.filter(order => {
                    const orderId = order.id?.toString().includes(keyword);
                    return orderId;
                });
            }

            // Filter by username
            if (searchUsername) {
                filteredOrders = filteredOrders.filter(order => {
                    const user = users[order.userId];
                    const username = user?.username || '';
                    const userName = user?.name || '';
                    return username.toLowerCase().includes(searchUsername.toLowerCase()) || 
                           userName.toLowerCase().includes(searchUsername.toLowerCase());
                });
            }

            // Filter by status
            if (filterStatus) {
                filteredOrders = filteredOrders.filter(order => order.status === filterStatus);
            }

            // Sorting
            filteredOrders.sort((a, b) => {
                if (sortOrder === 'date_desc') return new Date(b.orderDate) - new Date(a.orderDate);
                if (sortOrder === 'date_asc') return new Date(a.orderDate) - new Date(b.orderDate);
                if (sortOrder === 'amount_desc') return b.totalAmount - a.totalAmount;
                if (sortOrder === 'amount_asc') return a.totalAmount - b.totalAmount;
                return 0;
            });

            // Pagination
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

            setTotalCount(filteredOrders.length);
            setTotalPages(Math.ceil(filteredOrders.length / pageSize));
            setOrders(paginatedOrders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const handleViewDetails = async (orderId) => {
        try {
            const response = await orderApi.getById(orderId);
            if (!response.data || !response.data.order) {
                throw new Error('Dữ liệu đơn hàng trống');
            }
            setOrderDetails(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error loading details:', error);
            
            const basicOrder = orders.find(o => o.id === orderId);
            if (basicOrder) {
                setOrderDetails({
                    order: basicOrder,
                    details: [{
                        id: 'mock-detail-1',
                        productId: 'N/A (API Error)',
                        quantity: 1,
                        unitPrice: basicOrder.totalAmount,
                        totalPrice: basicOrder.totalAmount
                    }]
                });
                setShowDetailModal(true);
            } else {
                alert('Failed to load order details');
            }
        }
    };

    const handleStatusChange = (orderId, currentStatus) => {
        setEditingOrderId(orderId);
        setNewStatus(currentStatus);
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await orderApi.updateStatus(editingOrderId, { status: newStatus });
            setShowStatusModal(false);
            loadOrders();
            
            // Mô phỏng việc gửi email thông báo trạng thái
            alert(`[System Mock] Email notification has been sent to the user regarding order #${editingOrderId} new status: ${newStatus}`);
            
            if (orderDetails && orderDetails.order.id === editingOrderId) {
                setOrderDetails({
                    ...orderDetails,
                    order: { ...orderDetails.order, status: newStatus }
                });
            }
        } catch (error) {
            alert('Failed to update order status');
        }
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setOrderDetails(null);
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                </li>
            );
        }
        return pages;
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return 'badge-secondary';
        if (status.includes('Cancel')) return 'badge-danger';
        switch (status) {
            case 'Completed':
                return 'badge-success'; // Green
            case 'Shipped':
            case 'Shipping':
                return 'badge-primary'; // Blue
            case 'Confirmed':
            case 'Processing':
                return 'badge-warning'; // Yellow
            case 'Pending':
            default:
                return 'badge-secondary'; // Gray
        }
    };

    const handleQuickAction = async (orderId, newStatus) => {
        if (window.confirm(`Xác nhận chuyển trạng thái đơn hàng #${orderId} sang ${newStatus}?`)) {
            setProcessingActionId(orderId);
            try {
                const response = await orderApi.updateStatus(orderId, { status: newStatus });
                loadOrders();
                
                if (orderDetails && orderDetails.order.id === orderId) {
                    setOrderDetails({
                        ...orderDetails,
                        order: response.data
                    });
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Không thể cập nhật trạng thái do lỗi logic backend.');
            } finally {
                setProcessingActionId(null);
            }
        }
    };

    const getUserName = (userId) => {
        return users[userId]?.name || users[userId]?.username || `User ${userId}`;
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Orders Management</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-3">
                                    <form onSubmit={handleSearch} className="form-inline w-100">
                                        <input
                                            type="text"
                                            className="form-control w-100"
                                            placeholder="Search order ID..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                    </form>
                                </div>
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by username..."
                                        value={searchUsername}
                                        onChange={(e) => {
                                            setSearchUsername(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-control"
                                        value={filterStatus}
                                        onChange={(e) => {
                                            setFilterStatus(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="">All Status</option>
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-control"
                                        value={sortOrder}
                                        onChange={(e) => {
                                            setSortOrder(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="date_desc">Newest First</option>
                                        <option value="date_asc">Oldest First</option>
                                        <option value="amount_desc">Highest Amount</option>
                                        <option value="amount_asc">Lowest Amount</option>
                                    </select>
                                </div>
                                <div className="col-md-2 text-right">
                                    <span className="text-muted">
                                        Total: <strong>{totalCount}</strong> | Page {page}/{totalPages}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="alert alert-light border">No orders found.</div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>#Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Order Date</th>
                                                    <th>Total Amount</th>
                                                    <th>Status</th>
                                                    <th>Address</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order.id}>
                                                        <td>
                                                            <strong>#{order.id}</strong>
                                                        </td>
                                                        <td>
                                                            {getUserName(order.userId)}
                                                        </td>
                                                        <td>
                                                            {new Date(order.orderDate).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td>
                                                            <strong>{formatCurrency(order.totalAmount)}</strong>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {order.shippingAddress ? order.shippingAddress.split(',')[0] : 'No address'}
                                                        </td>
                                                        <td>
                                                            <div className="btn-group">
                                                                <button
                                                                    className="btn btn-sm btn-info"
                                                                    onClick={() => handleViewDetails(order.id)}
                                                                    title="View details"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </button>
                                                                
                                                                {/* Quick Action Buttons Workflow */}
                                                                {order.status === 'Pending' && (
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleQuickAction(order.id, 'Confirmed')} disabled={processingActionId === order.id} title="Confirm Order">
                                                                        {processingActionId === order.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                                                                    </button>
                                                                )}
                                                                {order.status === 'Confirmed' && (
                                                                    <button className="btn btn-sm btn-primary" onClick={() => handleQuickAction(order.id, 'Shipped')} disabled={processingActionId === order.id} title="Ship Order">
                                                                        {processingActionId === order.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-truck"></i>}
                                                                    </button>
                                                                )}
                                                                {order.status === 'Shipped' && (
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleQuickAction(order.id, 'Completed')} disabled={processingActionId === order.id} title="Complete Order">
                                                                        {processingActionId === order.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-flag-checkered"></i>}
                                                                    </button>
                                                                )}
                                                                {!order.status.includes('Cancel') && order.status !== 'Completed' && (
                                                                    <button className="btn btn-sm btn-danger" onClick={() => handleQuickAction(order.id, 'Cancelled')} disabled={processingActionId === order.id} title="Cancel Order">
                                                                        {processingActionId === order.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="card-footer">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="text-muted">
                                                    Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount} orders
                                                </div>
                                                <nav>
                                                    <ul className="pagination m-0">
                                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                            <button 
                                                                className="page-link" 
                                                                onClick={() => setPage(page - 1)}
                                                                disabled={page === 1}
                                                            >
                                                                Previous
                                                            </button>
                                                        </li>
                                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                            if (totalPages <= 5) return i + 1;
                                                            if (i < 2) return i + 1;
                                                            if (i >= 3 && page <= i + 1) return page + (i - 2);
                                                            if (page > totalPages - 3) return totalPages - 4 + i;
                                                            return null;
                                                        }).filter(Boolean).map(pageNum => (
                                                            <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                                                                <button 
                                                                    className="page-link" 
                                                                    onClick={() => setPage(pageNum)}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                            <button 
                                                                className="page-link" 
                                                                onClick={() => setPage(page + 1)}
                                                                disabled={page === totalPages}
                                                            >
                                                                Next
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Order Details Modal */}
            {showDetailModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Order Details - #{orderDetails?.order?.id}</h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={closeDetailModal}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {orderDetails && (
                                    <>
                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <h6 className="text-primary border-bottom pb-2"><strong><i className="fas fa-info-circle mr-2"></i>Order Info</strong></h6>
                                                <p className="mb-1"><strong>Order ID:</strong> #{orderDetails.order.id}</p>
                                                <p className="mb-1"><strong>Date:</strong> {new Date(orderDetails.order.orderDate).toLocaleString('vi-VN')}</p>
                                                <p className="mb-1"><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(orderDetails.order.status)}`}>{orderDetails.order.status}</span></p>
                                                
                                                {orderDetails.order.updatedBy && (
                                                    <div className="mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                                        <i className="fas fa-history mr-1"></i>
                                                        Last updated by: <strong>{orderDetails.order.updatedBy}</strong>
                                                        <br/>
                                                        at {new Date(orderDetails.order.updatedAt).toLocaleString('vi-VN')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <h6 className="text-primary border-bottom pb-2"><strong><i className="fas fa-user mr-2"></i>Customer Info</strong></h6>
                                                <p className="mb-1"><strong>Name:</strong> {orderDetails.order.customerName || getUserName(orderDetails.order.userId)}</p>
                                                <p className="mb-1"><strong>Phone:</strong> {orderDetails.order.customerPhone || 'N/A'}</p>
                                                <p className="mb-1"><strong>Email:</strong> {orderDetails.order.customerEmail || 'N/A'}</p>
                                                <p className="mb-1 mt-2 text-muted small border-top pt-1">
                                                    <i className="fas fa-map-marker-alt mr-1"></i> {orderDetails.order.shippingAddress}
                                                </p>
                                            </div>
                                            <div className="col-md-4">
                                                <h6 className="text-primary border-bottom pb-2"><strong><i className="fas fa-credit-card mr-2"></i>Payment Info</strong></h6>
                                                <p className="mb-1">
                                                    <strong>Method:</strong> {orderDetails.order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / Bank Transfer'}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Payment Status:</strong> 
                                                    <span className={`badge ml-1 ${
                                                        orderDetails.order.paymentStatus === 'Paid' ? 'badge-success' :
                                                        orderDetails.order.paymentStatus === 'Refunded' ? 'badge-warning' :
                                                        orderDetails.order.paymentStatus === 'Cancelled' ? 'badge-danger' :
                                                        'badge-secondary'
                                                    }`}>
                                                        {orderDetails.order.paymentStatus || 'Unpaid'}
                                                    </span>
                                                </p>
                                                {orderDetails.order.transactionId && (
                                                    <p className="mb-1 text-muted small"><strong>TXN:</strong> {orderDetails.order.transactionId}</p>
                                                )}
                                                
                                                {orderDetails.order.status.includes('Cancel') && orderDetails.order.cancelReason && (
                                                    <div className="alert alert-danger p-2 mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                                                        <strong>Cancel Reason:</strong> {orderDetails.order.cancelReason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {orderDetails.order.timeline && orderDetails.order.timeline.length > 0 && (
                                            <>
                                                <h6 className="text-primary border-bottom pb-2 mt-4"><strong><i className="fas fa-stream mr-2"></i>Order Timeline</strong></h6>
                                                <div className="timeline-horizontal d-flex flex-wrap mb-4">
                                                    {orderDetails.order.timeline.map((step, idx) => (
                                                        <div key={idx} className="mr-3 mb-2 p-2 border rounded bg-light" style={{ minWidth: '150px' }}>
                                                            <div className={`badge ${getStatusBadgeClass(step.status)} mb-1`}>{step.status}</div>
                                                            <div className="small text-muted">{new Date(step.timestamp).toLocaleString('vi-VN')}</div>
                                                            {step.note && <div className="small" style={{ fontSize: '0.75rem' }}>{step.note}</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        <h6 className="text-primary border-bottom pb-2 mt-4"><strong><i className="fas fa-box-open mr-2"></i>Order Items</strong></h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-striped align-middle">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Product</th>
                                                        <th className="text-center">Quantity</th>
                                                        <th className="text-right">Unit Price</th>
                                                        <th className="text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(orderDetails.details || []).map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    {item.product?.imageUrl ? (
                                                                        <img src={item.product.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover' }} className="rounded mr-2 border" />
                                                                    ) : (
                                                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#e9ecef' }} className="rounded mr-2 border d-flex align-items-center justify-content-center">
                                                                            <i className="fas fa-image text-muted"></i>
                                                                        </div>
                                                                    )}
                                                                    {item.product?.name || `Product #${item.productId}`}
                                                                </div>
                                                            </td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                                                            <td className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th colSpan="3" className="text-right">Subtotal:</th>
                                                        <th className="text-right">{formatCurrency(orderDetails.order.totalAmount)}</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className="text-right">Shipping Fee:</th>
                                                        <th className="text-right text-success">Free Shipping</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className="text-right h5">Grand Total:</th>
                                                        <th className="text-right h5 text-primary">{formatCurrency(orderDetails.order.totalAmount)}</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-outline-secondary mr-auto" onClick={() => window.print()}>
                                    <i className="fas fa-print mr-1"></i> Print Invoice
                                </button>
                                
                                {orderDetails?.order?.status === 'Cancel Requested' && (
                                    <button
                                        type="button"
                                        className="btn btn-danger mr-auto"
                                        onClick={async () => {
                                            try {
                                                await orderApi.updateStatus(orderDetails.order.id, { status: 'Cancelled & Refunded' });
                                                alert('Order Cancelled and Refund Processed.');
                                                setOrderDetails({
                                                    ...orderDetails,
                                                    order: { ...orderDetails.order, status: 'Cancelled & Refunded' }
                                                });
                                                loadOrders();
                                            } catch(err) {
                                                alert('Failed to process refund');
                                            }
                                        }}
                                    >
                                        Approve Cancel & Refund
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeDetailModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Modal */}
            {showStatusModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Order Status</h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowStatusModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="statusSelect"><strong>Select New Status</strong></label>
                                    <select
                                        id="statusSelect"
                                        className="form-control"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowStatusModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUpdateStatus}
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
