import { useEffect, useState } from 'react';
import { ticketApi } from '../services/api';
import { readApiError } from '../utils/store';

// Tải danh sách ticket hỗ trợ (admin). Thao tác giữ ở trang, gọi reload() sau khi cập nhật.
export function useTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await ticketApi.getAll();
            setTickets(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(readApiError(err, 'Không tải được ticket.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    return { tickets, loading, error, setError, reload };
}
