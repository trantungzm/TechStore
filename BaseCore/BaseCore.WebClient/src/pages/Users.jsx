import React, { useEffect, useMemo, useState } from 'react';
import { userApi } from '../services/api';

const inputClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-admin-brand focus:ring-2 focus:ring-blue-100';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        phone: '',
        position: '',
        userType: 0,
        isActive: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, [page, keyword]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getAll({ keyword, page, pageSize });
            setUsers(response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (err) {
            console.error('Không thể tải người dùng:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        return users.reduce((acc, user) => {
            if (user.userType === 1) acc.admins += 1;
            else acc.customers += 1;
            if (user.isActive) acc.active += 1;
            else acc.inactive += 1;
            return acc;
        }, { admins: 0, customers: 0, active: 0, inactive: 0 });
    }, [users]);
    const hasAdmin = useMemo(() => users.some((user) => user.userType === 1 && user.isActive), [users]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadUsers();
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                phone: user.phone || user.phoneNumber || '',
                position: user.position || '',
                userType: user.userType || 0,
                isActive: user.isActive,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                phone: '',
                position: '',
                userType: 0,
                isActive: true,
            });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                const updateData = {
                    phone: formData.phone,
                    position: formData.position,
                    userType: parseInt(formData.userType),
                    isActive: formData.isActive,
                };
                if (formData.password) updateData.password = formData.password;
                await userApi.update(editingUser.id, updateData);
            } else {
                if (!formData.password) {
                    setError('Mật khẩu là bắt buộc khi tạo người dùng mới');
                    return;
                }
                await userApi.create({
                    username: formData.username,
                    password: formData.password,
                    phone: formData.phone,
                    position: formData.position,
                    userType: parseInt(formData.userType),
                });
            }

            closeModal();
            loadUsers();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        const user = users.find((item) => item.id === id);
        if (user?.userType === 1) {
            alert('Khong the xoa admin duy nhat.');
            return;
        }

        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

        try {
            await userApi.delete(id);
            loadUsers();
        } catch (err) {
            const data = err.response?.data;
            alert(data?.message || data?.detail || data?.title || 'Khong the xoa nguoi dung');
        }
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-admin-muted">Tài khoản</p>
                    <h2 className="mb-0 text-2xl font-bold text-admin-ink">Quản lý người dùng</h2>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600" onClick={() => openModal()}>
                    <i className="fas fa-plus"></i>
                    Thêm người dùng
                </button>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Tổng người dùng</p>
                    <div className="text-2xl font-bold text-admin-ink">{totalCount}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Đang hoạt động</p>
                    <div className="text-2xl font-bold text-emerald-700">{stats.active}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Quản trị viên</p>
                    <div className="text-2xl font-bold text-rose-700">{stats.admins}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Khách hàng</p>
                    <div className="text-2xl font-bold text-admin-brand">{stats.customers}</div>
                </div>
            </div>

            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                    <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Tìm theo tên đăng nhập hoặc số điện thoại..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <i className="fas fa-search"></i>
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm font-medium text-admin-muted">Đang tải người dùng...</div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-slate-200">
                            <table className="min-w-[720px] table-fixed divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                    <tr>
                                        <th className="w-[170px] px-4 py-3">Tên đăng nhập</th>
                                        <th className="w-[150px] px-4 py-3">Điện thoại</th>
                                        <th className="w-[110px] px-4 py-3">Vai trò</th>
                                        <th className="w-[120px] px-4 py-3">Trạng thái</th>
                                        <th className="w-[120px] px-4 py-3 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10 text-center text-admin-muted">Không tìm thấy người dùng</td>
                                        </tr>
                                    ) : users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="truncate px-4 py-3 font-semibold text-admin-ink">{user.username}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-admin-muted">{user.phone || user.phoneNumber || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${user.userType === 1 ? 'bg-rose-50 text-rose-700 ring-rose-100' : 'bg-orange-50 text-admin-brand ring-orange-100'}`}>
                                                    {user.userType === 1 ? 'Quản trị' : 'Người dùng'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${user.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                                                    {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-brand text-white hover:bg-orange-600" onClick={() => openModal(user)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-600 text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => handleDelete(user.id)} disabled={user.userType === 1} title={user.userType === 1 ? 'Khong the xoa admin duy nhat' : undefined}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-admin-muted sm:flex-row sm:items-center sm:justify-between">
                    <span>Tổng: {totalCount} người dùng</span>
                    <div className="flex items-center gap-2">
                        <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button>
                        <span>Trang {page}/{totalPages || 1}</span>
                        <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h3 className="mb-0 text-lg font-bold text-admin-ink">{editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}</h3>
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-5">
                                {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Tên đăng nhập</span>
                                        <input type="text" className={`${inputClass} w-full disabled:bg-slate-100`} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required disabled={!!editingUser} />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Mật khẩu {editingUser && <span className="font-normal text-admin-muted">(để trống nếu không đổi)</span>}</span>
                                        <input type="password" className={`${inputClass} w-full`} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Điện thoại</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Chức vụ</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Vai trò</span>
                                        <select className={`${inputClass} w-full`} value={formData.userType} onChange={(e) => setFormData({ ...formData, userType: e.target.value })}>
                                            <option value="0">Người dùng</option>
                                            <option value="1" disabled={hasAdmin && editingUser?.userType !== 1}>Quản trị</option>
                                        </select>
                                    </label>
                                    {editingUser && (
                                        <label className="flex items-end gap-3 pb-2">
                                            <input type="checkbox" className="h-5 w-5 rounded border-slate-300" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                                            <span className="text-sm font-semibold text-admin-ink">Hoạt động</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
                                <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">{editingUser ? 'Cập nhật' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
