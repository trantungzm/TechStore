import { useEffect, useState } from 'react';
import { supplierApi } from '../services/api';
import { readApiError } from '../utils/store';

const normalizeSupplier = (x) => ({
    id: x.id ?? x.Id,
    supplierCode: x.supplierCode ?? x.SupplierCode ?? x.code ?? x.Code ?? '',
    code: x.supplierCode ?? x.SupplierCode ?? x.code ?? x.Code ?? '',
    name: x.name ?? x.Name ?? '',
    phone: x.phone ?? x.Phone ?? '',
    email: x.email ?? x.Email ?? '',
    address: x.address ?? x.Address ?? '',
    taxCode: x.taxCode ?? x.TaxCode ?? '',
    contactPerson: x.contactPerson ?? x.ContactPerson ?? '',
    note: x.note ?? x.Note ?? '',
    isActive: x.isActive ?? x.IsActive ?? true,
    createdAt: x.createdAt ?? x.CreatedAt ?? null,
    updatedAt: x.updatedAt ?? x.UpdatedAt ?? null,
});

// Quản lý danh sách nhà cung cấp (tải + chuẩn hoá + trạng thái loading/error).
// CRUD vẫn nằm ở trang, gọi reload() sau khi lưu.
export function useSuppliers() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const reload = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await supplierApi.getAll({ page: 1, pageSize: 200 });
            const data = res.data;
            const list = Array.isArray(data) ? data : data.items || data.Items || [];
            setItems(list.map(normalizeSupplier));
        } catch (err) {
            setError(readApiError(err, 'Không tải được danh sách nhà cung cấp.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    return { items, loading, error, setError, reload };
}
