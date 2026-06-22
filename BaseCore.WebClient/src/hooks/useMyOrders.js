import { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import { readApiError } from '../utils/store';

// Tải danh sách đơn hàng của khách (đã đăng nhập), sắp xếp mới nhất trước.
export function useMyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await orderApi.getMyOrders();
            const raw = response.data || [];
            raw.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setOrders(raw);
        } catch (e) {
            setError(readApiError(e, 'Không tải được danh sách đơn hàng.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    return { orders, loading, error, setError, reload };
}
