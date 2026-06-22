import { useEffect, useState } from 'react';
import { warrantyApi } from '../services/api';
import { readApiError } from '../utils/store';

// Tải song song danh sách phiếu bảo hành + yêu cầu bảo hành (claim) cho 2 tab.
export function useWarrantyData() {
    const [warranties, setWarranties] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = async () => {
        setLoading(true);
        setError('');
        try {
            const [wRes, cRes] = await Promise.all([
                warrantyApi.getAll({ page: 1, pageSize: 200 }),
                warrantyApi.getClaimsAll({ page: 1, pageSize: 200 }),
            ]);
            setWarranties(Array.isArray(wRes.data) ? wRes.data : []);
            setClaims(Array.isArray(cRes.data) ? cRes.data : []);
        } catch (err) {
            setError(readApiError(err, 'Không tải được dữ liệu bảo hành.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    return { warranties, claims, loading, error, setError, reload };
}
