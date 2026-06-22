import { useEffect, useState } from 'react';
import { bannerApi } from '../services/api';

// Tải danh sách banner (admin). CRUD vẫn ở trang, gọi reload() sau khi lưu.
export function useBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = async () => {
        try {
            setLoading(true);
            const response = await bannerApi.getAll();
            setBanners(response.data || []);
        } catch (err) {
            setError('Không tải được danh sách banner');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    return { banners, loading, error, setError, reload };
}
