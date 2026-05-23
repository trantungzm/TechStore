import React, { useEffect, useState } from 'react';
import { categoryApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const inputClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-admin-brand focus:ring-2 focus:ring-blue-100';
const hiddenAdminCategoryNames = new Set(['accessories', 'phu kien', 'phụ kiện', 'audio']);

const normalizeCategoryName = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

const isVisibleAdminCategory = (category) =>
    !hiddenAdminCategoryNames.has(normalizeCategoryName(category?.name));

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadCategories();
    }, [page]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryApi.getAll();
            const allCategories = response.data || [];
            const total = allCategories.length;
            const totalPagesCount = Math.ceil(total / pageSize) || 1;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;

            setCategories(allCategories.slice(startIndex, endIndex));
            setTotalCount(total);
            setTotalPages(totalPagesCount);
        } catch (err) {
            console.error('Không thể tải danh mục:', err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
            });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingCategory) {
                await categoryApi.update(editingCategory.id, {
                    id: editingCategory.id,
                    ...formData,
                });
            } else {
                await categoryApi.create(formData);
            }

            closeModal();
            setPage(1);
            loadCategories();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

        try {
            await categoryApi.delete(id);
            setPage(1);
            loadCategories();
        } catch (err) {
            alert('Không thể xóa danh mục. Danh mục có thể đang chứa sản phẩm.');
        }
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-admin-muted">Danh mục bán hàng</p>
                    <h2 className="mb-0 text-2xl font-bold text-admin-ink">Quản lý danh mục</h2>
                </div>
                {isAdmin() && (
                    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i>
                        Thêm danh mục
                    </button>
                )}
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Tổng danh mục</p>
                    <div className="text-2xl font-bold text-admin-ink">{totalCount}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Trang hiện tại</p>
                    <div className="text-2xl font-bold text-admin-brand">{page}/{totalPages || 1}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Dòng đang hiển thị</p>
                    <div className="text-2xl font-bold text-emerald-700">{categories.length}</div>
                </div>
            </div>

            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-4">
                    <h3 className="mb-0 text-base font-bold text-admin-ink">Tất cả danh mục</h3>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm font-medium text-admin-muted">Đang tải danh mục...</div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-slate-200">
                            <table className="min-w-[760px] table-fixed divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                    <tr>
                                        <th className="w-[90px] px-4 py-3">ID</th>
                                        <th className="w-[220px] px-4 py-3">Tên danh mục</th>
                                        <th className="px-4 py-3">Mô tả</th>
                                        {isAdmin() && <th className="w-[130px] px-4 py-3 text-right">Thao tác</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdmin() ? 4 : 3} className="px-4 py-10 text-center text-admin-muted">Không tìm thấy danh mục</td>
                                        </tr>
                                    ) : categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-bold text-admin-ink">#{category.id}</td>
                                            <td className="truncate px-4 py-3 font-semibold text-admin-ink">{category.name}</td>
                                            <td className="truncate px-4 py-3 text-admin-muted">{category.description || '-'}</td>
                                            {isAdmin() && (
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-brand text-white hover:bg-orange-600" onClick={() => openModal(category)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-600 text-white hover:bg-rose-700" onClick={() => handleDelete(category.id)}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-admin-muted sm:flex-row sm:items-center sm:justify-between">
                    <span>Hiển thị {categories.length ? ((page - 1) * pageSize) + 1 : 0} - {Math.min(page * pageSize, totalCount)} trong {totalCount} danh mục</span>
                    <div className="flex items-center gap-2">
                        <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button>
                        <span>Trang {page}/{totalPages || 1}</span>
                        <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-md bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h3 className="mb-0 text-lg font-bold text-admin-ink">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-5">
                                {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                                <div className="grid gap-4">
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Tên danh mục</span>
                                        <input
                                            type="text"
                                            className={`${inputClass} w-full`}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Mô tả</span>
                                        <textarea
                                            className={`${inputClass} w-full`}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="4"
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
                                <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">{editingCategory ? 'Cập nhật' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
