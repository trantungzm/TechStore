import { useEffect, useState } from 'react';
import { repairApi } from '../services/api';
import { readApiError } from '../utils/store';

// Tải toàn bộ hồ sơ sửa chữa (admin/technical). Thao tác giữ ở trang, gọi reload() sau khi cập nhật.
export function useRepairs() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await repairApi.getAll();
            setCases(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(readApiError(err, 'Không tải được hồ sơ sửa chữa.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    return { cases, loading, error, setError, reload };
}
