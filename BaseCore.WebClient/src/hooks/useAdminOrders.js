import { useEffect, useState } from 'react';
import { orderApi, userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Tải đơn hàng + map người dùng (admin lấy thêm danh sách user để hiển thị tên).
export function useAdminOrders() {
    const { isAdmin } = useAuth();
    const [allOrders, setAllOrders] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = async () => {
        setLoading(true);
        setError('');
        try {
            const [ordersRes, usersRes] = await Promise.all([
                orderApi.getAll(),
                isAdmin() ? userApi.getAll({ page: 1, pageSize: 200 }) : Promise.resolve({ data: [] }),
            ]);

            const usersMap = {};
            const usersData = Array.isArray(usersRes.data)
                ? usersRes.data
                : (usersRes.data?.data || usersRes.data?.items || usersRes.data?.Items || []);
            usersData.forEach((user) => {
                const id = user?.id ?? user?.userId ?? user?.Id ?? user?.UserId;
                if (id) usersMap[id] = user;
            });

            setUsers(usersMap);
            setAllOrders(ordersRes.data || []);
        } catch (err) {
            console.error('Failed to load orders:', err);
            setError('Không thể tải danh sách đơn hàng từ máy chủ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    return { allOrders, users, loading, error, setError, reload };
}
