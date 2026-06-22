import React, { useEffect, useState, useCallback } from 'react';
import { categoryApi, specApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast, confirmDialog } from '../../utils/notify';

const inputClass = 'rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100 bg-[var(--color-surface)] text-[var(--color-fg)]';
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
    const [showSpecModal, setShowSpecModal] = useState(false);
    const [showSpecEditor, setShowSpecEditor] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [specDefinitions, setSpecDefinitions] = useState([]);
    const [specLoading, setSpecLoading] = useState(false);
    const [specForm, setSpecForm] = useState({ id: null, name: '', code: '', options: [] });
    const [optionDefinition, setOptionDefinition] = useState(null);
    const { isAdmin } = useAuth();

    // Đồng bộ load danh mục dựa trên sự thay đổi của page/pageSize
    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await categoryApi.getAll();
            const allCategories = (response.data || []).filter(isVisibleAdminCategory);
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
    }, [page, pageSize]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setError('');
    };

    const closeSpecModal = () => {
        setShowSpecModal(false);
        setShowSpecEditor(false);
        setSelectedCategory(null);
        setSpecDefinitions([]);
        setOptionDefinition(null);
        resetSpecForm();
    };

    const closeSpecEditor = () => {
        setShowSpecEditor(false);
        resetSpecForm();
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
            if (page === 1) {
                loadCategories();
            } else {
                setPage(1);
            }
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!(await confirmDialog('Bạn có chắc muốn xóa danh mục này?'))) return;

        try {
            await categoryApi.delete(id);
            if (page === 1) {
                loadCategories();
            } else {
                setPage(1);
            }
        } catch (err) {
            toast.error('Không thể xóa danh mục. Danh mục có thể đang chứa sản phẩm.');
        }
    };

    const resetSpecForm = () => setSpecForm({ id: null, name: '', code: '', options: [] });

    const loadCategorySpecs = async (category, activeDefinitionId = null) => {
        setSpecLoading(true);
        try {
            const response = await specApi.getDefinitions(category.id);
            const definitions = Array.isArray(response.data) ? response.data : [];
            setSpecDefinitions(definitions);
            if (activeDefinitionId) {
                setOptionDefinition(definitions.find((d) => d.id === activeDefinitionId) || null);
            }
        } catch (err) {
            console.error('Không thể tải thông số danh mục:', err);
            setSpecDefinitions([]);
        } finally {
            setSpecLoading(false);
        }
    };

    const openSpecModal = async (category) => {
        setSelectedCategory(category);
        resetSpecForm();
        setShowSpecModal(true);
        setShowSpecEditor(false);
        await loadCategorySpecs(category);
    };

    const openCreateSpecEditor = () => {
        resetSpecForm();
        setShowSpecEditor(true);
    };

    const openOptionModal = (definition) => setOptionDefinition(definition);
    const closeOptionModal = () => setOptionDefinition(null);

    const submitSpec = async (event) => {
        event.preventDefault();
        if (!selectedCategory) return;
        
        try {
            const options = (specForm.options || [])
                .map((option, index) => ({
                    ...option,
                    value: String(option.value || '').trim(),
                    displayOrder: Number(option.displayOrder || index + 1),
                    isActive: option.isActive !== false,
                }))
                .filter((option) => option.value);

            const payload = { 
                id: specForm.id || 0, 
                name: specForm.name, 
                code: specForm.code, 
                categoryId: selectedCategory.id, 
                dataType: 'select', 
                options 
            };

            if (specForm.id) {
                await specApi.updateDefinition(specForm.id, payload);
            } else {
                await specApi.createDefinition(payload);
            }
            
            await loadCategorySpecs(selectedCategory);
            setShowSpecEditor(false);
        } catch (err) {
            console.error('Lỗi khi lưu thông số:', err);
            toast.error('Không thể lưu thông số cấu hình. Vui lòng kiểm tra lại dữ liệu.');
        }
    };

    const editSpec = (definition) => {
        setSpecForm({
            id: definition.id,
            name: definition.name || '',
            code: definition.code || '',
            options: (definition.options || []).map((option, index) => ({
                id: option.id,
                specDefinitionId: definition.id,
                value: option.value || '',
                displayOrder: option.displayOrder || index + 1,
                isActive: option.isActive !== false,
            })),
        });
        setShowSpecEditor(true);
    };

    const addSpecFormOption = () => {
        setSpecForm((current) => ({
            ...current,
            options: [
                ...(current.options || []),
                { id: 0, specDefinitionId: current.id || 0, value: '', displayOrder: (current.options || []).length + 1, isActive: true },
            ],
        }));
    };

    const updateSpecFormOption = (index, changes) => {
        setSpecForm((current) => ({
            ...current,
            options: (current.options || []).map((option, optionIndex) => optionIndex === index ? { ...option, ...changes } : option),
        }));
    };

    const removeSpecFormOption = (index) => {
        setSpecForm((current) => ({
            ...current,
            options: (current.options || [])
                .filter((_, optionIndex) => optionIndex !== index)
                .map((option, optionIndex) => ({ ...option, displayOrder: optionIndex + 1 })),
        }));
    };

    const deleteSpec = async (definition) => {
        if (!(await confirmDialog('Bạn có chắc muốn xóa hoặc tắt thông số này?'))) return;
        try {
            await specApi.deleteDefinition(definition.id);
            await loadCategorySpecs(selectedCategory);
        } catch (err) {
            console.error('Lỗi khi xóa thông số:', err);
            toast.error('Không thể xóa thông số này.');
        }
    };

    return (
        <div className="px-4 py-6 lg:px-8 text-[var(--color-fg)]">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Danh mục bán hàng</p>
                    <h2 className="mb-0 text-2xl font-bold">Quản lý danh mục</h2>
                </div>
                {isAdmin() && (
                    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i>
                        Thêm danh mục
                    </button>
                )}
            </div>

            {/* Thống kê nhanh */}
            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg-muted)]">Tổng danh mục</p>
                    <div className="text-2xl font-bold">{totalCount}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg-muted)]">Trang hiện tại</p>
                    <div className="text-2xl font-bold text-[var(--color-accent)]">{page}/{totalPages || 1}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg-muted)]">Dòng đang hiển thị</p>
                    <div className="text-2xl font-bold text-emerald-400">{categories.length}</div>
                </div>
            </div>

            {/* Bảng Danh Mục */}
            <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                <div className="border-b border-[var(--color-border)] px-4 py-4">
                    <h3 className="mb-0 text-base font-bold">Tất cả danh mục</h3>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm font-medium text-[var(--color-fg-muted)]">Đang tải danh mục...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] text-[var(--color-fg-muted)] font-semibold">
                                        <th className="py-3 px-4 w-16">ID</th>
                                        <th className="py-3 px-4">Tên danh mục</th>
                                        <th className="py-3 px-4 hidden md:table-cell">Mô tả</th>
                                        {isAdmin() && <th className="py-3 px-4 text-right w-64">Thao tác</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdmin() ? 4 : 3} className="px-4 py-10 text-center text-[var(--color-fg-muted)]">Không tìm thấy danh mục</td>
                                        </tr>
                                    ) : categories.map((category) => (
                                        <tr key={category.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                                            <td className="py-3 px-4 font-bold">#{category.id}</td>
                                            <td className="py-3 px-4 font-semibold">{category.name}</td>
                                            <td className="py-3 px-4 hidden md:table-cell text-[var(--color-fg-muted)] truncate max-w-xs">{category.description || '-'}</td>
                                            {isAdmin() && (
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold hover:bg-[var(--color-surface-3)]" onClick={() => openSpecModal(category)}>
                                                            <i className="fas fa-sliders-h"></i> Thông số
                                                        </button>
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white hover:opacity-90" onClick={() => openModal(category)}>
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

                {/* Phân Trang */}
                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
                    <span>Hiển thị {categories.length ? ((page - 1) * pageSize) + 1 : 0} - {Math.min(page * pageSize, totalCount)} trong {totalCount} danh mục</span>
                    <div className="flex items-center gap-2">
                        <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button>
                        <span>Trang {page}/{totalPages || 1}</span>
                        <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
                    </div>
                </div>
            </section>

            {/* Modal: Thêm / Sửa Danh Mục */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 animate-fadeIn">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-md bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <h3 className="mb-0 text-lg font-bold">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-fg-dim)] hover:bg-[var(--color-surface-3)]" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-5">
                                {error && <div className="mb-4 rounded-md border border-rose-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
                                <div className="grid gap-4">
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold">Tên danh mục</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold">Mô tả</span>
                                        <textarea className={`${inputClass} w-full`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" />
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4 bg-[var(--color-surface-2)]">
                                <button type="button" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-surface-3)]" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">{editingCategory ? 'Cập nhật' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
          {/* Modal: Quản Lý Thông Số Kỹ Thuật Của Danh Mục */}
{showSpecModal && selectedCategory && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
        {/* Lớp click-outside để đóng nhanh nếu cần */}
        <div className="absolute inset-0" onClick={closeSpecModal}></div>

        {/* Khung nội dung chính của Modal - Thêm relative, cô lập layout tách biệt hoàn toàn sidebar */}
        <div className="relative z-10 w-full max-w-4xl max-h-[85vh] flex flex-col rounded-xl bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)] overflow-hidden">
            
            {/* Header Modal - Cố định phía trên */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 bg-[var(--color-surface)]">
                <div>
                    <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">Thông số theo danh mục</p>
                    <h3 className="mb-0 text-xl font-extrabold text-[var(--color-fg)]">{selectedCategory.name}</h3>
                </div>
                <button 
                    type="button" 
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-3)] transition-colors" 
                    onClick={closeSpecModal}
                >
                    <i className="fas fa-times text-lg"></i>
                </button>
            </div>

            {/* Body Modal - Cho phép cuộn độc lập bên trong nếu danh sách dài */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-medium text-[var(--color-fg-muted)]">
                        Hiện có <span className="text-[var(--color-fg)] font-bold">{specDefinitions.length}</span> thông số cấu hình
                    </div>
                    <button 
                        type="button" 
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity" 
                        onClick={openCreateSpecEditor}
                    >
                        <i className="fas fa-plus text-xs"></i> Thêm thông số mới
                    </button>
                </div>

                {/* Khu vực hiển thị bảng/trạng thái trống */}
                {specLoading ? (
                    <div className="py-12 text-center text-sm font-medium text-[var(--color-fg-muted)]">
                        <i className="fas fa-spinner fa-spin mr-2"></i> Đang tải danh sách thông số...
                    </div>
                ) : specDefinitions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--color-border-strong,var(--color-border))] p-10 text-center bg-[var(--color-surface-2)]/50">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]">
                            <i className="fas fa-sliders-h text-xl"></i>
                        </div>
                        <h4 className="mb-1 text-base font-bold text-[var(--color-fg)]">Danh mục này chưa có thông số</h4>
                        <p className="mx-auto mb-0 max-w-md text-sm text-[var(--color-fg-muted)]">
                            Bấm nút <span className="font-semibold text-[var(--color-accent)]">"Thêm thông số mới"</span> phía trên để thiết lập bộ thuộc tính lọc (RAM, CPU, Ổ cứng...) cho các sản phẩm thuộc nhóm này.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                        <table className="w-full text-sm min-w-[600px] border-collapse text-left">
                            <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                                <tr>
                                    <th className="px-5 py-3">Thuộc tính / Mã định danh</th>
                                    <th className="px-5 py-3">Giá trị tùy chọn (Options)</th>
                                    <th className="w-36 px-5 py-3 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {specDefinitions.map((definition) => (
                                    <tr key={definition.id} className="hover:bg-[var(--color-surface-2)]/60 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="font-semibold text-[var(--color-fg)]">{definition.name}</div>
                                            <div className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                                                Mã lọc: <code className="bg-[var(--color-surface-3)] px-1.5 py-0.5 rounded text-rose-400 font-mono text-[11px]">{definition.code}</code>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-semibold text-[var(--color-fg-muted)] bg-[var(--color-surface-3)] px-2 py-1 rounded">
                                                    {(definition.options || []).length} lựa chọn
                                                </span>
                                                <button 
                                                    type="button" 
                                                    className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-semibold hover:bg-[var(--color-surface-3)] text-[var(--color-accent)] transition-colors" 
                                                    onClick={() => openOptionModal(definition)}
                                                >
                                                    <i className="far fa-eye"></i> Chi tiết
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-white transition-colors" title="Sửa" onClick={() => editSpec(definition)}>
                                                    <i className="fas fa-edit text-xs"></i>
                                                </button>
                                                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors" title="Xóa" onClick={() => deleteSpec(definition)}>
                                                    <i className="fas fa-trash text-xs"></i>
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
        </div>
    </div>
)}

            {/* Modal: Xem nhanh danh sách Options độc lập */}
{optionDefinition && (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px] animate-fadeIn">
        {/* Lớp phủ click để đóng modal con */}
        <div className="absolute inset-0" onClick={closeOptionModal}></div>

        <div className="relative z-10 max-h-[70vh] w-full max-w-md overflow-hidden rounded-xl bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)] flex flex-col">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] px-5 py-4 bg-[var(--color-surface)]">
                <div>
                    <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Lựa chọn: {optionDefinition.name}</h3>
                    <p className="mb-0 mt-0.5 text-xs text-[var(--color-fg-muted)]">Mã nhóm: {optionDefinition.code}</p>
                </div>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-fg-dim)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-fg)]" onClick={closeOptionModal}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1 custom-scrollbar">
                {(optionDefinition.options || []).length === 0 ? (
                    <div className="text-center text-sm py-4 text-[var(--color-fg-muted)]">Chưa định nghĩa giá trị nào.</div>
                ) : (
                    <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-lg overflow-hidden m-0 p-0">
                        {(optionDefinition.options || []).map((opt) => (
                            <li key={opt.id} className="px-4 py-2.5 text-sm flex items-center justify-between bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]">
                                <span className="font-medium text-[var(--color-fg)]">{opt.value}</span>
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Thứ tự: {opt.displayOrder}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
)}

            {/* Modal phụ: Editor thêm mới/sửa thông số */}
{showSpecEditor && selectedCategory && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px] animate-fadeIn">
        {/* Lớp phủ click để đóng nếu muốn hoặc giữ nguyên để tránh mất dữ liệu đang nhập */}
        <div className="absolute inset-0" onClick={closeSpecEditor}></div>

        <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-hidden rounded-xl bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4 bg-[var(--color-surface)]">
                <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">{specForm.id ? 'Cập nhật thông số' : 'Tạo mới thông số'}</h3>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-fg-dim)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-fg)]" onClick={closeSpecEditor}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <form onSubmit={submitSpec} className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto p-5 space-y-4 flex-1 custom-scrollbar">
                    <div className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2 text-xs font-medium text-[var(--color-fg-muted)]">
                        Áp dụng vào nhóm: <span className="font-bold text-[var(--color-accent)]">{selectedCategory.name}</span>
                    </div>
                    <label className="block">
                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Tên thông số (Ví dụ: Dung lượng RAM)</span>
                        <input className={`${inputClass} w-full`} value={specForm.name} onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })} placeholder="Nhập tên hiển thị..." required />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mã hệ thống (Code định danh - Ví dụ: ram_capacity)</span>
                        <input className={`${inputClass} w-full`} value={specForm.code} onChange={(e) => setSpecForm({ ...specForm, code: e.target.value })} placeholder="Chỉ dùng chữ không dấu, gạch dưới..." required disabled={!!specForm.id} />
                    </label>

                    {/* Form Dynamic Options Section */}
                    <div className="border-t border-[var(--color-border)] pt-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-[var(--color-fg)]">Danh sách các tùy chọn giá trị</span>
                            <button type="button" className="text-xs font-bold bg-blue-600/10 text-blue-400 px-2.5 py-1.5 rounded-md hover:bg-blue-600/20 transition-colors" onClick={addSpecFormOption}>
                                <i className="fas fa-plus mr-1"></i> Dòng giá trị
                            </button>
                        </div>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {(specForm.options || []).map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center animate-fadeIn">
                                    <input type="text" className={`${inputClass} flex-1 px-3 py-1.5`} placeholder="Ví dụ: 8GB, 16GB..." value={opt.value} onChange={(e) => updateSpecFormOption(idx, { value: e.target.value })} required />
                                    <input type="number" className={`${inputClass} w-16 px-1 py-1.5 text-center`} title="Thứ tự hiển thị" value={opt.displayOrder} onChange={(e) => updateSpecFormOption(idx, { displayOrder: parseInt(e.target.value) || idx + 1 })} />
                                    <button type="button" className="text-rose-500 hover:text-rose-400 p-2 transition-colors" title="Xóa dòng" onClick={() => removeSpecFormOption(idx)}>
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            ))}
                            {(specForm.options || []).length === 0 && (
                                <p className="text-xs text-center text-[var(--color-fg-muted)] py-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-2)]/30 m-0">
                                    Chưa cấu hình tùy chọn. Nhấp "Dòng giá trị" để thêm bộ thuộc tính lọc.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4 bg-[var(--color-surface-2)]">
                    <button type="button" className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-surface-3)] text-[var(--color-fg)]" onClick={closeSpecEditor}>Quay lại</button>
                    <button type="submit" className="rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 shadow-sm">Lưu thông số</button>
                </div>
            </form>
        </div>
    </div>
)}
        </div>
    );
};

export default Categories;