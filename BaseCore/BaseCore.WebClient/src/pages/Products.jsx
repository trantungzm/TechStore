import React, { useEffect, useMemo, useState } from 'react';
import { productApi, categoryApi, supplierApi, specApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, resolveProductImage } from '../utils/store';

const inputClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-admin-brand focus:ring-2 focus:ring-blue-100';

const emptyImage = () => ({ imageUrl: '', altText: '', sortOrder: 0, isPrimary: false });
const emptyVariant = () => ({
    variantName: '',
    colorName: '',
    colorCode: '',
    storage: '',
    ram: '',
    price: '',
    originalPrice: '',
    stock: 0,
    sku: '',
    imageUrl: '',
    isActive: true,
});

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [specDefinitions, setSpecDefinitions] = useState([]);
    const [specValues, setSpecValues] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        stock: 0,
        description: '',
        imageUrl: '',
        images: [],
        variants: [],
        categoryId: '',
        supplierId: '',
        backupSupplierId: '',
        supplyType: '',
        warrantyProvider: '',
    });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadCategories();
        loadSuppliers();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [page, keyword, categoryId]);

    const loadSpecDefinitions = async (nextCategoryId, productSpecs = []) => {
        if (!nextCategoryId) {
            setSpecDefinitions([]);
            setSpecValues({});
            return;
        }

        try {
            const response = await specApi.getDefinitions(nextCategoryId);
            const definitions = Array.isArray(response.data) ? response.data : [];
            const values = {};
            productSpecs.forEach((spec) => {
                const definitionId = spec.specDefinitionId ?? spec.SpecDefinitionId;
                if (!definitionId) return;
                values[definitionId] = spec.value ?? spec.valueText ?? spec.valueNumber ?? spec.valueBool ?? '';
            });
            setSpecDefinitions(definitions);
            setSpecValues(values);
        } catch (err) {
            console.error('Khong the tai thong so:', err);
            setSpecDefinitions([]);
            setSpecValues({});
        }
    };

    const loadCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            setCategories(response.data || []);
        } catch (err) {
            console.error('Không thể tải danh mục:', err);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await supplierApi.getAll({ isActive: true, page: 1, pageSize: 200 });
            const list = Array.isArray(response.data) ? response.data : response.data?.items || [];
            setSuppliers(list.filter((item) => (item.isActive ?? item.IsActive) !== false));
        } catch (err) {
            console.error('Khong the tai nha cung cap:', err);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.search({
                keyword,
                categoryId: categoryId || undefined,
                page,
                pageSize,
            });
            setProducts(response.data.items || response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (err) {
            console.error('Không thể tải sản phẩm:', err);
        } finally {
            setLoading(false);
        }
    };

    const visibleProducts = useMemo(() => {
        if (!stockFilter) return products;
        if (stockFilter === 'low') return products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 10);
        if (stockFilter === 'out') return products.filter((product) => Number(product.stock || 0) <= 0);
        if (stockFilter === 'available') return products.filter((product) => Number(product.stock || 0) > 10);
        return products;
    }, [products, stockFilter]);

    const inventoryStats = useMemo(() => {
        return products.reduce((acc, product) => {
            const stock = Number(product.stock || 0);
            acc.totalStock += stock;
            if (stock <= 0) acc.out += 1;
            else if (stock <= 10) acc.low += 1;
            else acc.available += 1;
            return acc;
        }, { totalStock: 0, low: 0, out: 0, available: 0 });
    }, [products]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadProducts();
    };

    const openModal = async (product = null) => {
        if (product) {
            let detail = product;
            try {
                const response = await productApi.getById(product.id);
                detail = response.data || product;
            } catch (err) {
                console.error('Khong the tai chi tiet san pham:', err);
            }

            setEditingProduct(detail);
            setFormData({
                name: detail.name,
                price: detail.price,
                stock: detail.stock,
                description: detail.description || '',
                imageUrl: detail.imageUrl || '',
                images: Array.isArray(detail.images) ? detail.images : [],
                variants: Array.isArray(detail.variants) ? detail.variants : [],
                categoryId: detail.categoryId,
                supplierId: detail.supplierId || '',
                backupSupplierId: detail.backupSupplierId || '',
                supplyType: detail.supplyType || '',
                warrantyProvider: detail.warrantyProvider || '',
            });
            await loadSpecDefinitions(detail.categoryId, detail.specs || []);
        } else {
            setEditingProduct(null);
            const nextCategoryId = categories[0]?.id || '';
            setFormData({
                name: '',
                price: 0,
                stock: 0,
                description: '',
                imageUrl: '',
                images: [],
                variants: [],
                categoryId: nextCategoryId,
                supplierId: '',
                backupSupplierId: '',
                supplyType: '',
                warrantyProvider: '',
            });
            await loadSpecDefinitions(nextCategoryId, []);
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setError('');
    };

    const updateImage = (index, patch) => {
        setFormData((current) => ({
            ...current,
            images: current.images.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
        }));
    };

    const updateVariant = (index, patch) => {
        setFormData((current) => ({
            ...current,
            variants: current.variants.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
        }));
    };

    const handleCategoryChange = async (nextCategoryId) => {
        setFormData({ ...formData, categoryId: nextCategoryId });
        await loadSpecDefinitions(nextCategoryId, []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const images = (formData.images || [])
                .filter((image) => String(image.imageUrl || '').trim())
                .map((image, index) => ({
                    ...image,
                    imageUrl: String(image.imageUrl || '').trim(),
                    altText: image.altText || null,
                    sortOrder: Number(image.sortOrder || index),
                    isPrimary: Boolean(image.isPrimary),
                }));

            const variants = (formData.variants || [])
                .filter((variant) => String(variant.variantName || variant.colorName || variant.sku || '').trim())
                .map((variant) => ({
                    ...variant,
                    variantName: variant.variantName || null,
                    colorName: variant.colorName || null,
                    colorCode: variant.colorCode || null,
                    storage: variant.storage || null,
                    ram: variant.ram || null,
                    price: variant.price === '' || variant.price == null ? null : Number(variant.price),
                    originalPrice: variant.originalPrice === '' || variant.originalPrice == null ? null : Number(variant.originalPrice),
                    stock: Number(variant.stock || 0),
                    sku: variant.sku || null,
                    imageUrl: variant.imageUrl || null,
                    isActive: variant.isActive !== false,
                }));

            const data = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
                backupSupplierId: formData.backupSupplierId ? parseInt(formData.backupSupplierId) : null,
                supplyType: formData.supplyType || null,
                warrantyProvider: formData.warrantyProvider || null,
                images,
                variants,
            };

            let savedProduct;
            if (editingProduct) {
                const response = await productApi.update(editingProduct.id, { id: editingProduct.id, ...data });
                savedProduct = response.data || { id: editingProduct.id };
            } else {
                const response = await productApi.create(data);
                savedProduct = response.data;
            }

            const savedProductId = savedProduct?.id || editingProduct?.id;
            if (savedProductId) {
                const specPayload = specDefinitions.map((definition) => {
                    const rawValue = specValues[definition.id];
                    const dataType = String(definition.dataType || 'text').toLowerCase();
                    return {
                        specDefinitionId: definition.id,
                        valueText: dataType === 'number' || dataType === 'bool' ? null : (rawValue ? String(rawValue) : null),
                        valueNumber: dataType === 'number' && rawValue !== '' && rawValue != null ? Number(rawValue) : null,
                        valueBool: dataType === 'bool' && rawValue !== '' && rawValue != null ? rawValue === true || rawValue === 'true' : null,
                    };
                });
                await specApi.updateProductSpecs(savedProductId, specPayload);
            }

            closeModal();
            loadProducts();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Thao tác thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            await productApi.delete(id);
            loadProducts();
        } catch (err) {
            alert('Không thể xóa sản phẩm');
        }
    };

    const stockBadge = (stock) => {
        const value = Number(stock || 0);
        if (value <= 0) return 'bg-rose-50 text-rose-700 ring-rose-100';
        if (value <= 10) return 'bg-amber-50 text-amber-700 ring-amber-100';
        return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-admin-muted">Danh mục bán hàng</p>
                    <h2 className="mb-0 text-2xl font-bold text-admin-ink">Quản lý sản phẩm</h2>
                </div>
                {isAdmin() && (
                    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i>
                        Thêm sản phẩm
                    </button>
                )}
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Tổng sản phẩm</p>
                    <div className="text-2xl font-bold text-admin-ink">{totalCount}</div>
                </div>
                <button type="button" className={`rounded-md border p-4 text-left shadow-sm ${stockFilter === 'available' ? 'border-admin-brand bg-orange-50' : 'border-slate-200 bg-white'}`} onClick={() => setStockFilter(stockFilter === 'available' ? '' : 'available')}>
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Còn hàng</p>
                    <div className="text-2xl font-bold text-emerald-700">{inventoryStats.available}</div>
                </button>
                <button type="button" className={`rounded-md border p-4 text-left shadow-sm ${stockFilter === 'low' ? 'border-admin-brand bg-orange-50' : 'border-slate-200 bg-white'}`} onClick={() => setStockFilter(stockFilter === 'low' ? '' : 'low')}>
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Sắp hết hàng</p>
                    <div className="text-2xl font-bold text-amber-700">{inventoryStats.low}</div>
                </button>
                <button type="button" className={`rounded-md border p-4 text-left shadow-sm ${stockFilter === 'out' ? 'border-admin-brand bg-orange-50' : 'border-slate-200 bg-white'}`} onClick={() => setStockFilter(stockFilter === 'out' ? '' : 'out')}>
                    <p className="mb-1 text-sm font-semibold text-admin-muted">Hết hàng</p>
                    <div className="text-2xl font-bold text-rose-700">{inventoryStats.out}</div>
                </button>
            </div>

            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                    <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto]">
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Tìm sản phẩm..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <select
                            className={inputClass}
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <i className="fas fa-search"></i>
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm font-medium text-admin-muted">Đang tải sản phẩm...</div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-slate-200">
                            <table className="min-w-[900px] table-fixed divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                    <tr>
                                        <th className="w-[380px] px-4 py-3">Sản phẩm</th>
                                        <th className="w-[180px] px-4 py-3">Danh mục</th>
                                        <th className="w-[170px] px-4 py-3">Giá</th>
                                        <th className="w-[110px] px-4 py-3">Tồn kho</th>
                                        {isAdmin() && <th className="w-[130px] px-4 py-3 text-right">Thao tác</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {visibleProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdmin() ? 5 : 4} className="px-4 py-10 text-center text-admin-muted">Không tìm thấy sản phẩm</td>
                                        </tr>
                                    ) : visibleProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={resolveProductImage(product)} className="h-12 w-12 rounded-md border border-slate-200 object-contain bg-white" alt={product.name} />
                                                    <div className="min-w-0">
                                                        <p className="mb-0 truncate font-semibold text-admin-ink">{product.name}</p>
                                                        <p className="mb-0 text-xs text-admin-muted">ID #{product.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="truncate px-4 py-3 text-admin-muted">{product.category?.name || categories.find((cat) => cat.id === product.categoryId)?.name || 'Chưa phân loại'}</td>
                                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-admin-ink">{formatCurrency(product.price)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${stockBadge(product.stock)}`}>{product.stock}</span>
                                            </td>
                                            {isAdmin() && (
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-brand text-white hover:bg-orange-600" onClick={() => openModal(product)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-600 text-white hover:bg-rose-700" onClick={() => handleDelete(product.id)}>
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
                    <span>Tổng: {totalCount} sản phẩm</span>
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
                            <h3 className="mb-0 text-lg font-bold text-admin-ink">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-5">
                                {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2 rounded-md border border-slate-200 p-3">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-admin-ink">Images</span>
                                            <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold" onClick={() => setFormData({ ...formData, images: [...(formData.images || []), emptyImage()] })}>Them anh</button>
                                        </div>
                                        {(formData.images || []).length === 0 ? (
                                            <p className="mb-0 text-sm text-admin-muted">Chua co du lieu</p>
                                        ) : (formData.images || []).map((image, index) => (
                                            <div key={`image-${index}`} className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_140px_110px_44px]">
                                                <input type="text" className={`${inputClass} w-full`} placeholder="Image URL" value={image.imageUrl || ''} onChange={(e) => updateImage(index, { imageUrl: e.target.value })} />
                                                <input type="text" className={`${inputClass} w-full`} placeholder="Alt text" value={image.altText || ''} onChange={(e) => updateImage(index, { altText: e.target.value })} />
                                                <label className="flex items-center gap-2 text-sm text-admin-muted">
                                                    <input type="checkbox" checked={Boolean(image.isPrimary)} onChange={(e) => updateImage(index, { isPrimary: e.target.checked })} />
                                                    Primary
                                                </label>
                                                <button type="button" className="rounded-md bg-rose-600 text-white" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, itemIndex) => itemIndex !== index) })}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="md:col-span-2 rounded-md border border-slate-200 p-3">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-admin-ink">Variants</span>
                                            <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold" onClick={() => setFormData({ ...formData, variants: [...(formData.variants || []), emptyVariant()] })}>Them bien the</button>
                                        </div>
                                        {(formData.variants || []).length === 0 ? (
                                            <p className="mb-0 text-sm text-admin-muted">Chua co du lieu</p>
                                        ) : (formData.variants || []).map((variant, index) => (
                                            <div key={`variant-${index}`} className="mb-4 rounded-md bg-slate-50 p-3">
                                                <div className="grid gap-2 md:grid-cols-3">
                                                    <input type="text" className={`${inputClass} w-full`} placeholder="Phien ban" value={variant.variantName || ''} onChange={(e) => updateVariant(index, { variantName: e.target.value })} />
                                                    <input type="text" className={`${inputClass} w-full`} placeholder="Mau sac" value={variant.colorName || ''} onChange={(e) => updateVariant(index, { colorName: e.target.value })} />
                                                    <input type="text" className={`${inputClass} w-full`} placeholder="Ma mau" value={variant.colorCode || ''} onChange={(e) => updateVariant(index, { colorCode: e.target.value })} />
                                                    <input type="text" className={`${inputClass} w-full`} placeholder="Storage" value={variant.storage || ''} onChange={(e) => updateVariant(index, { storage: e.target.value })} />
                                                    <input type="text" className={`${inputClass} w-full`} placeholder="RAM" value={variant.ram || ''} onChange={(e) => updateVariant(index, { ram: e.target.value })} />
                                                    <input type="text" className={`${inputClass} w-full`} placeholder="SKU" value={variant.sku || ''} onChange={(e) => updateVariant(index, { sku: e.target.value })} />
                                                    <input type="number" className={`${inputClass} w-full`} placeholder="Gia" value={variant.price ?? ''} onChange={(e) => updateVariant(index, { price: e.target.value })} />
                                                    <input type="number" className={`${inputClass} w-full`} placeholder="Gia goc" value={variant.originalPrice ?? ''} onChange={(e) => updateVariant(index, { originalPrice: e.target.value })} />
                                                    <input type="number" className={`${inputClass} w-full`} placeholder="Ton kho" value={variant.stock ?? 0} onChange={(e) => updateVariant(index, { stock: e.target.value })} />
                                                    <input type="text" className={`${inputClass} w-full md:col-span-2`} placeholder="Anh bien the" value={variant.imageUrl || ''} onChange={(e) => updateVariant(index, { imageUrl: e.target.value })} />
                                                    <button type="button" className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_, itemIndex) => itemIndex !== index) })}>Xoa</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="md:col-span-2 rounded-md border border-slate-200 p-3">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-admin-ink">Specs</span>
                                            <span className="text-xs text-admin-muted">{specDefinitions.length} definitions</span>
                                        </div>
                                        {specDefinitions.length === 0 ? (
                                            <p className="mb-0 text-sm text-admin-muted">Chua co du lieu</p>
                                        ) : (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {specDefinitions.map((definition) => {
                                                    const dataType = String(definition.dataType || 'text').toLowerCase();
                                                    return (
                                                        <label key={definition.id}>
                                                            <span className="mb-1 block text-sm font-semibold text-admin-ink">{definition.name}{definition.unit ? ` (${definition.unit})` : ''}</span>
                                                            {dataType === 'bool' ? (
                                                                <select className={`${inputClass} w-full`} value={specValues[definition.id] ?? ''} onChange={(e) => setSpecValues({ ...specValues, [definition.id]: e.target.value })}>
                                                                    <option value="">Chua co du lieu</option>
                                                                    <option value="true">Co</option>
                                                                    <option value="false">Khong</option>
                                                                </select>
                                                            ) : (
                                                                <input type={dataType === 'number' ? 'number' : 'text'} className={`${inputClass} w-full`} value={specValues[definition.id] ?? ''} onChange={(e) => setSpecValues({ ...specValues, [definition.id]: e.target.value })} />
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <label className="md:col-span-2">
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Tên sản phẩm</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Danh mục</span>
                                        <select className={`${inputClass} w-full`} value={formData.categoryId} onChange={(e) => handleCategoryChange(e.target.value)} required>
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Giá</span>
                                        <input type="number" className={`${inputClass} w-full`} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required min="0" />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Tồn kho</span>
                                        <input type="number" className={`${inputClass} w-full`} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required min="0" />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">URL hình ảnh</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
                                    </label>
                                    <label className="md:col-span-2">
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Mô tả</span>
                                        <textarea className={`${inputClass} w-full`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Nha cung cap chinh</span>
                                        <select className={`${inputClass} w-full`} value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}>
                                            <option value="">Chua chon</option>
                                            {suppliers.map((supplier) => <option key={supplier.id ?? supplier.Id} value={supplier.id ?? supplier.Id}>{supplier.name ?? supplier.Name}</option>)}
                                        </select>
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Nha cung cap du phong</span>
                                        <select className={`${inputClass} w-full`} value={formData.backupSupplierId} onChange={(e) => setFormData({ ...formData, backupSupplierId: e.target.value })}>
                                            <option value="">Chua chon</option>
                                            {suppliers
                                                .filter((supplier) => String(supplier.id ?? supplier.Id) !== String(formData.supplierId || ''))
                                                .map((supplier) => <option key={supplier.id ?? supplier.Id} value={supplier.id ?? supplier.Id}>{supplier.name ?? supplier.Name}</option>)}
                                        </select>
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Loai nguon hang</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.supplyType} onChange={(e) => setFormData({ ...formData, supplyType: e.target.value })} />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-admin-ink">Don vi bao hanh</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.warrantyProvider} onChange={(e) => setFormData({ ...formData, warrantyProvider: e.target.value })} />
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
                                <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="rounded-md bg-admin-brand px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">{editingProduct ? 'Cập nhật' : 'Tạo mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
