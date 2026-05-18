import React, { useEffect, useState } from 'react';
import { productApi, categoryApi, recommendationApi, specApi, uploadApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, resolveProductImage } from '../utils/store';
import AdminFilterDropdown from '../components/AdminFilterDropdown';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('name_asc');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        stock: 0,
        description: '',
        imageUrl: '',
        categoryId: '',
    });
    const [error, setError] = useState('');
    const [crossSellItems, setCrossSellItems] = useState([]);
    const [crossSellAuto, setCrossSellAuto] = useState([]);
    const [crossSellSearch, setCrossSellSearch] = useState('');
    const [crossSellSaving, setCrossSellSaving] = useState(false);
    const [specDefinitions, setSpecDefinitions] = useState([]);
    const [specInputByDefId, setSpecInputByDefId] = useState({});
    const [specsLoading, setSpecsLoading] = useState(false);
    const [specsSaving, setSpecsSaving] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const { hasRole } = useAuth();
    const canManageProducts = hasRole(['Admin', 'Warehouse', 'StockManager']);
    const isAdmin = hasRole(['Admin']);
    const currency = localStorage.getItem('currency') || 'USD';
    const usdRateRaw = Number(localStorage.getItem('usdRateVnd') || 25000);
    const usdRateVnd = Number.isFinite(usdRateRaw) && usdRateRaw > 0 ? usdRateRaw : 25000;

    const toVndAmount = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return 0;
        return currency === 'USD' ? num * usdRateVnd : num;
    };

    const fromVndAmount = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return 0;
        return currency === 'USD' ? num / usdRateVnd : num;
    };

    const formatPriceForInput = (vndValue) => {
        const raw = fromVndAmount(vndValue);
        if (currency === 'USD') return raw.toFixed(2);
        return String(Math.round(raw));
    };

    const extractApiErrorMessage = (err) => {
        const data = err?.response?.data;
        const direct = data?.message || data?.detail || data?.title;
        if (direct) return String(direct);

        const errors = data?.errors;
        if (errors && typeof errors === 'object') {
            const messages = Object.values(errors)
                .flatMap((v) => (Array.isArray(v) ? v : [v]))
                .map((x) => String(x || '').trim())
                .filter(Boolean);
            if (messages.length > 0) return messages.join('\n');
        }

        return 'Operation failed';
    };

    const normalizeDef = (d) => ({
        id: d.id ?? d.Id,
        name: d.name ?? d.Name,
        dataType: (d.dataType ?? d.DataType ?? 'text').toLowerCase(),
        unit: d.unit ?? d.Unit ?? '',
        sortOrder: d.sortOrder ?? d.SortOrder ?? 0,
        isComparable: Boolean(d.isComparable ?? d.IsComparable),
        isRequired: Boolean(d.isRequired ?? d.IsRequired),
        options: Array.isArray(d.options ?? d.Options) ? (d.options ?? d.Options) : [],
    });

    const normalizeValue = (v) => ({
        id: v.id ?? v.Id,
        specDefinitionId: v.specDefinitionId ?? v.SpecDefinitionId,
        valueText: v.valueText ?? v.ValueText ?? null,
        valueNumber: v.valueNumber ?? v.ValueNumber ?? null,
        valueBool: v.valueBool ?? v.ValueBool ?? null,
        specOptionId: v.specOptionId ?? v.SpecOptionId ?? null,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [page, keyword, categoryId, minPrice, maxPrice, inStockOnly, sortBy]);

    useEffect(() => {
        setPage(1);
    }, [keyword, categoryId, minPrice, maxPrice, inStockOnly, sortBy]);

    const loadCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.search({
                keyword,
                categoryId: categoryId || undefined,
                minPrice: minPrice ? toVndAmount(minPrice) : undefined,
                maxPrice: maxPrice ? toVndAmount(maxPrice) : undefined,
                inStock: inStockOnly || undefined,
                sortBy: sortBy || undefined,
                page,
                pageSize,
            });
            setProducts(response.data.items || response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadProducts();
    };

    const openModal = (product = null) => {
        if (!canManageProducts) return;
        if (product) {
            const priceVnd = Number(product.price ?? product.Price ?? 0);
            const stockValue = Number(product.stock ?? product.Stock ?? 0);
            const categoryIdValue = product.categoryId ?? product.CategoryId ?? '';
            setEditingProduct(product);
            setFormData({
                name: product.name ?? product.Name ?? '',
                price: formatPriceForInput(priceVnd),
                stock: stockValue,
                description: product.description ?? product.Description ?? '',
                imageUrl: product.imageUrl ?? product.ImageUrl ?? '',
                categoryId: categoryIdValue,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: formatPriceForInput(0),
                stock: 0,
                description: '',
                imageUrl: '',
                categoryId: categories[0]?.id || '',
            });
        }
        setError('');
        setCrossSellItems([]);
        setCrossSellAuto([]);
        setCrossSellSearch('');
        setSpecDefinitions([]);
        setSpecInputByDefId({});
        setSpecsLoading(false);
        setSpecsSaving(false);
        setImageUrls([]);
        setUploadingImages(false);
        setShowModal(true);

        if (product?.id) {
            productApi.getById(product.id).then((res) => {
                const p = res.data || {};
                const raw = p.images ?? p.Images ?? p.productImages ?? p.ProductImages ?? [];
                const urls = Array.isArray(raw)
                    ? raw.map((x) => (typeof x === 'string' ? x : (x?.url ?? x?.Url ?? x?.imageUrl ?? x?.ImageUrl ?? ''))).map((x) => String(x || '').trim()).filter(Boolean)
                    : [];
                const finalUrls = urls.length > 0 ? urls : (p.imageUrl || p.ImageUrl ? [p.imageUrl || p.ImageUrl] : []);
                setImageUrls(finalUrls);
                setFormData((prev) => ({ ...prev, imageUrl: finalUrls[0] || prev.imageUrl || '' }));
            }).catch(() => {
                setImageUrls(product.imageUrl ? [product.imageUrl] : []);
            });

            Promise.all([
                recommendationApi.getCrossSell(product.id, 12).catch(() => ({ data: [] })),
                recommendationApi.getAutoCrossSell(product.id, 6).catch(() => ({ data: [] })),
            ]).then(([manualRes, autoRes]) => {
                const manual = Array.isArray(manualRes.data) ? manualRes.data : [];
                const auto = Array.isArray(autoRes.data) ? autoRes.data : [];
                setCrossSellItems(manual);
                setCrossSellAuto(auto);
            });
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setError('');
        setCrossSellItems([]);
        setCrossSellAuto([]);
        setCrossSellSearch('');
        setSpecDefinitions([]);
        setSpecInputByDefId({});
        setSpecsLoading(false);
        setSpecsSaving(false);
        setImageUrls([]);
        setUploadingImages(false);
    };

    const uploadSelectedImages = async (files) => {
        if (!files || files.length === 0) return;
        setUploadingImages(true);
        setError('');
        try {
            const res = await uploadApi.uploadProductImages(files);
            const urls = res.data?.urls || res.data?.Urls || [];
            const list = Array.isArray(urls) ? urls : [];
            setImageUrls((prev) => {
                const merged = [...prev, ...list.map((x) => String(x || '').trim()).filter(Boolean)];
                return Array.from(new Set(merged));
            });
        } catch (err) {
            setError(extractApiErrorMessage(err) || 'Unable to upload images');
        } finally {
            setUploadingImages(false);
        }
    };

    const moveImage = (index, delta) => {
        setImageUrls((prev) => {
            const next = prev.slice();
            const target = index + delta;
            if (target < 0 || target >= next.length) return prev;
            const tmp = next[index];
            next[index] = next[target];
            next[target] = tmp;
            return next;
        });
    };

    const removeImageAt = (index) => {
        setImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const setPrimaryImage = (index) => {
        setImageUrls((prev) => {
            const next = prev.slice();
            if (index <= 0 || index >= next.length) return prev;
            const [picked] = next.splice(index, 1);
            next.unshift(picked);
            return next;
        });
    };

    const loadSpecsForProduct = async (productId, categoryIdValue) => {
        const categoryIdNum = Number(categoryIdValue || 0);
        if (!productId || !categoryIdNum) {
            setSpecDefinitions([]);
            setSpecInputByDefId({});
            return;
        }

        setSpecsLoading(true);
        try {
            const [defsRes, valuesRes] = await Promise.all([
                specApi.getDefinitions(categoryIdNum).catch(() => ({ data: [] })),
                specApi.getProductSpecs(productId).catch(() => ({ data: [] })),
            ]);
            const defs = (Array.isArray(defsRes.data) ? defsRes.data : []).map(normalizeDef);
            const values = (Array.isArray(valuesRes.data) ? valuesRes.data : []).map(normalizeValue);
            const valueMap = new Map(values.map((x) => [Number(x.specDefinitionId), x]));

            const nextInput = {};
            defs.forEach((def) => {
                const existing = valueMap.get(Number(def.id));
                if (!existing) {
                    nextInput[def.id] = '';
                    return;
                }
                if (def.dataType === 'number') {
                    nextInput[def.id] = existing.valueNumber ?? '';
                    return;
                }
                if (def.dataType === 'bool' || def.dataType === 'boolean') {
                    nextInput[def.id] = existing.valueBool === true ? 'true' : existing.valueBool === false ? 'false' : '';
                    return;
                }
                if (def.dataType === 'select') {
                    nextInput[def.id] = existing.specOptionId ?? '';
                    return;
                }
                nextInput[def.id] = existing.valueText ?? '';
            });

            setSpecDefinitions(defs);
            setSpecInputByDefId(nextInput);
        } finally {
            setSpecsLoading(false);
        }
    };

    useEffect(() => {
        if (!showModal) return;
        if (!isAdmin || !editingProduct?.id) return;
        loadSpecsForProduct(editingProduct.id, formData.categoryId);
    }, [showModal, isAdmin, editingProduct?.id, formData.categoryId]);

    const saveProductSpecs = async () => {
        if (!editingProduct?.id) return;
        const defs = specDefinitions.slice();
        if (defs.length === 0) return;

        const payload = [];
        for (const def of defs) {
            const raw = specInputByDefId[def.id];
            const dtype = String(def.dataType || 'text').toLowerCase();

            const missing = raw === null || raw === undefined || String(raw).trim() === '';
            if (def.isRequired && missing) {
                setError(`Spec "${def.name}" is required`);
                return;
            }

            if (missing) continue;

            if (dtype === 'number') {
                const num = Number(raw);
                if (!Number.isFinite(num)) {
                    setError(`Spec "${def.name}" must be a number`);
                    return;
                }
                payload.push({ specDefinitionId: def.id, valueNumber: num });
                continue;
            }

            if (dtype === 'bool' || dtype === 'boolean') {
                if (raw !== 'true' && raw !== 'false') {
                    setError(`Spec "${def.name}" must be yes/no`);
                    return;
                }
                payload.push({ specDefinitionId: def.id, valueBool: raw === 'true' });
                continue;
            }

            if (dtype === 'select') {
                const optId = Number(raw);
                if (!Number.isFinite(optId) || optId <= 0) {
                    setError(`Spec "${def.name}" is required`);
                    return;
                }
                payload.push({ specDefinitionId: def.id, specOptionId: optId });
                continue;
            }

            payload.push({ specDefinitionId: def.id, valueText: String(raw) });
        }

        setSpecsSaving(true);
        setError('');
        try {
            await specApi.upsertProductSpecs(editingProduct.id, payload);
        } catch (err) {
            setError(extractApiErrorMessage(err) || 'Unable to save specs');
        } finally {
            setSpecsSaving(false);
        }
    };

    const moveCrossSell = (index, delta) => {
        setCrossSellItems((prev) => {
            const next = prev.slice();
            const target = index + delta;
            if (target < 0 || target >= next.length) return prev;
            const [item] = next.splice(index, 1);
            next.splice(target, 0, item);
            return next;
        });
    };

    const removeCrossSell = (index) => {
        setCrossSellItems((prev) => prev.filter((_, i) => i !== index));
    };

    const addCrossSell = (product) => {
        const id = Number(product?.id ?? product?.Id);
        if (!id) return;
        setCrossSellItems((prev) => {
            if (prev.some((x) => Number(x.id ?? x.Id) === id)) return prev;
            return [...prev, product];
        });
        setCrossSellSearch('');
    };

    const saveCrossSell = async () => {
        if (!editingProduct?.id) return;
        setCrossSellSaving(true);
        setError('');
        try {
            const ids = crossSellItems.map((p) => Number(p.id ?? p.Id)).filter((x) => x > 0);
            await recommendationApi.setCrossSell(editingProduct.id, ids);
            const refreshed = await recommendationApi.getCrossSell(editingProduct.id, 12);
            setCrossSellItems(Array.isArray(refreshed.data) ? refreshed.data : []);
        } catch (err) {
            setError(extractApiErrorMessage(err) || 'Unable to save cross-sell');
        } finally {
            setCrossSellSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canManageProducts) return;
        setError('');

        try {
            const finalImageUrls = Array.isArray(imageUrls) ? imageUrls.map((x) => String(x || '').trim()).filter(Boolean) : [];
            const data = {
                ...formData,
                price: toVndAmount(formData.price),
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                imageUrl: finalImageUrls[0] || '',
                imageUrls: finalImageUrls,
            };

            if (editingProduct) {
                await productApi.update(editingProduct.id, { id: editingProduct.id, ...data });
            } else {
                await productApi.create(data);
            }

            closeModal();
            loadProducts();
        } catch (error) {
            setError(extractApiErrorMessage(error));
        }
    };

    const handleDelete = async (id) => {
        if (!canManageProducts) return;
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await productApi.delete(id);
            loadProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                </li>
            );
        }
        return pages;
    };

    const activeFilterCount =
        (keyword.trim() ? 1 : 0) +
        (categoryId ? 1 : 0) +
        (minPrice ? 1 : 0) +
        (maxPrice ? 1 : 0) +
        (inStockOnly ? 1 : 0) +
        (sortBy !== 'name_asc' ? 1 : 0);

    return (
        <>
            <div className="card mb-3">
                <div className="card-header">
                    <div className="row">
                        <div className="col-md-8 d-flex align-items-center">
                            <h3 className="card-title mb-0 mr-2">Products</h3>
                            <AdminFilterDropdown
                                open={isFilterMenuOpen}
                                onOpenChange={setIsFilterMenuOpen}
                                label="Filters"
                                activeCount={activeFilterCount}
                            >
                                <form
                                    onSubmit={(e) => {
                                        handleSearch(e);
                                        setIsFilterMenuOpen(false);
                                    }}
                                >
                                    <div className="form-group">
                                        <label>Search</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Name, description..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                            <option value="">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-6">
                                            <label>Min price ({currency})</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                step={currency === 'USD' ? '0.01' : '1'}
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group col-6">
                                            <label>Max price ({currency})</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                step={currency === 'USD' ? '0.01' : '1'}
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Sort</label>
                                        <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                            <option value="name_asc">Name A-Z</option>
                                            <option value="name_desc">Name Z-A</option>
                                            <option value="price_asc">Price Low-High</option>
                                            <option value="price_desc">Price High-Low</option>
                                        </select>
                                    </div>
                                    <div className="form-group mb-2">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="productInStockOnly"
                                                checked={inStockOnly}
                                                onChange={(e) => setInStockOnly(e.target.checked)}
                                            />
                                            <label className="custom-control-label" htmlFor="productInStockOnly">
                                                In stock only
                                            </label>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setKeyword('');
                                                setCategoryId('');
                                                setMinPrice('');
                                                setMaxPrice('');
                                                setInStockOnly(false);
                                                setSortBy('name_asc');
                                            }}
                                        >
                                            Reset
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Apply
                                        </button>
                                    </div>
                                </form>
                            </AdminFilterDropdown>
                            <span className="text-muted ml-3">Total: <strong>{totalCount}</strong></span>
                        </div>
                        <div className="col-md-4 text-right">
                            {canManageProducts && (
                                <button className="btn btn-success" onClick={() => openModal()}>
                                    <i className="fas fa-plus"></i> Add Product
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '90px' }}>ID</th>
                                            <th style={{ width: '70px' }}>Image</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th style={{ width: '160px' }}>Price</th>
                                            <th style={{ width: '110px' }}>Stock</th>
                                            {canManageProducts && <th style={{ width: '140px' }}>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={canManageProducts ? 7 : 6} className="text-center">
                                                    No products found
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map(product => (
                                                <tr key={product.id}>
                                                    <td>{product.id}</td>
                                                    <td>
                                                        <img
                                                            src={resolveProductImage(product)}
                                                            alt=""
                                                            style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                                                            className="rounded border"
                                                        />
                                                    </td>
                                                    <td>{product.name}</td>
                                                    <td>{product.category?.name}</td>
                                                    <td>{formatCurrency(product.price ?? product.Price ?? 0)}</td>
                                                    <td>{product.stock}</td>
                                                    {canManageProducts && (
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-info mr-1"
                                                                onClick={() => openModal(product)}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDelete(product.id)}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Total: <strong>{totalCount}</strong> products</span>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page - 1)}>
                                                Previous
                                            </button>
                                        </li>
                                        {renderPagination()}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page + 1)}>
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Edit Product' : 'Add Product'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="form-group">
                                        <label>Preview</label>
                                        <div>
                                            <img
                                                src={resolveProductImage({ id: editingProduct?.id || 1, imageUrl: imageUrls[0] || formData.imageUrl || '', images: imageUrls })}
                                                alt=""
                                                style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                                                className="rounded border"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            className="form-control"
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Price ({currency})</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            step={currency === 'USD' ? '0.01' : '1'}
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Images</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => uploadSelectedImages(e.target.files)}
                                            disabled={uploadingImages}
                                        />
                                        <small className="text-muted">
                                            {uploadingImages ? 'Uploading...' : 'Select one or more images. The first image is the primary image.'}
                                        </small>

                                        {imageUrls.length > 0 && (
                                            <div className="mt-2 d-flex flex-wrap" style={{ gap: 10 }}>
                                                {imageUrls.map((url, idx) => (
                                                    <div key={`${url}-${idx}`} className="border rounded p-2 bg-light" style={{ width: 130 }}>
                                                        <img
                                                            src={resolveProductImage({ imageUrl: url })}
                                                            alt=""
                                                            style={{ width: '100%', height: 80, objectFit: 'cover' }}
                                                            className="rounded border"
                                                        />
                                                        <div className="d-flex justify-content-between align-items-center mt-2" style={{ gap: 6 }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => moveImage(idx, -1)}
                                                                disabled={idx === 0}
                                                                title="Move left"
                                                            >
                                                                <i className="fas fa-arrow-left"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm ${idx === 0 ? 'btn-primary' : 'btn-outline-primary'}`}
                                                                onClick={() => setPrimaryImage(idx)}
                                                                title="Set as main"
                                                            >
                                                                <i className="fas fa-star"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => moveImage(idx, 1)}
                                                                disabled={idx === imageUrls.length - 1}
                                                                title="Move right"
                                                            >
                                                                <i className="fas fa-arrow-right"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => removeImageAt(idx)}
                                                                title="Remove"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>

                                    {isAdmin && (
                                        <div className="border rounded p-3 bg-white mb-3">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
                                                <div className="font-weight-bold">Technical Specs</div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={saveProductSpecs}
                                                    disabled={!editingProduct?.id || specsSaving || specsLoading || specDefinitions.length === 0}
                                                >
                                                    {specsSaving ? 'Saving...' : 'Save Specs'}
                                                </button>
                                            </div>

                                            {!editingProduct?.id ? (
                                                <div className="text-muted small mt-2">Create the product first, then enter specs.</div>
                                            ) : specsLoading ? (
                                                <div className="text-center py-3">
                                                    <div className="spinner-border text-primary"></div>
                                                </div>
                                            ) : specDefinitions.length === 0 ? (
                                                <div className="text-muted small mt-2">
                                                    No spec definitions for this category yet. Go to Categories → Specs to create them.
                                                </div>
                                            ) : (
                                                <div className="mt-3">
                                                    {specDefinitions
                                                        .slice()
                                                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name || '').localeCompare(String(b.name || '')))
                                                        .map((def) => {
                                                            const dtype = String(def.dataType || 'text').toLowerCase();
                                                            const value = specInputByDefId[def.id] ?? '';
                                                            return (
                                                                <div key={def.id} className="form-group mb-2">
                                                                    <label className="mb-1">
                                                                        {def.name}
                                                                        {def.isRequired ? <span className="text-danger ml-1">*</span> : null}
                                                                        {dtype === 'number' && def.unit ? <span className="text-muted ml-2">({def.unit})</span> : null}
                                                                    </label>
                                                                    {dtype === 'number' ? (
                                                                        <input
                                                                            className="form-control"
                                                                            type="number"
                                                                            value={value}
                                                                            onChange={(e) =>
                                                                                setSpecInputByDefId((p) => ({ ...p, [def.id]: e.target.value }))
                                                                            }
                                                                        />
                                                                    ) : dtype === 'bool' || dtype === 'boolean' ? (
                                                                        <select
                                                                            className="form-control"
                                                                            value={value}
                                                                            onChange={(e) =>
                                                                                setSpecInputByDefId((p) => ({ ...p, [def.id]: e.target.value }))
                                                                            }
                                                                        >
                                                                            <option value="">--</option>
                                                                            <option value="true">Yes</option>
                                                                            <option value="false">No</option>
                                                                        </select>
                                                                    ) : dtype === 'select' ? (
                                                                        <select
                                                                            className="form-control"
                                                                            value={value}
                                                                            onChange={(e) =>
                                                                                setSpecInputByDefId((p) => ({ ...p, [def.id]: e.target.value }))
                                                                            }
                                                                        >
                                                                            <option value="">--</option>
                                                                            {(def.options || []).map((o) => {
                                                                                const id = o.id ?? o.Id;
                                                                                const displayText = o.displayText ?? o.DisplayText ?? o.value ?? o.Value;
                                                                                return (
                                                                                    <option key={id} value={id}>
                                                                                        {displayText}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                    ) : (
                                                                        <input
                                                                            className="form-control"
                                                                            value={value}
                                                                            onChange={(e) =>
                                                                                setSpecInputByDefId((p) => ({ ...p, [def.id]: e.target.value }))
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isAdmin && (
                                        <div className="border rounded p-3 bg-light">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
                                                <div className="font-weight-bold">Cross-sell (Add-ons)</div>
                                                <button type="button" className="btn btn-sm btn-primary" onClick={saveCrossSell} disabled={!editingProduct?.id || crossSellSaving}>
                                                    {crossSellSaving ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>

                                            {!editingProduct?.id ? (
                                                <div className="text-muted small mt-2">Create the product first, then configure cross-sell.</div>
                                            ) : (
                                                <>
                                                    <div className="form-group mt-3 mb-2">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter IDs to add (e.g. 9,25) or pick suggestions below"
                                                            value={crossSellSearch}
                                                            onChange={(e) => setCrossSellSearch(e.target.value)}
                                                        />
                                                        <div className="d-flex flex-wrap mt-2" style={{ gap: 8 }}>
                                                            {crossSellAuto
                                                                .filter((p) => !crossSellItems.some((x) => Number(x.id ?? x.Id) === Number(p.id ?? p.Id)))
                                                                .slice(0, 6)
                                                                .map((p) => (
                                                                    <button
                                                                        key={p.id ?? p.Id}
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() => addCrossSell(p)}
                                                                    >
                                                                        + {(p.name ?? p.Name) || `#${p.id ?? p.Id}`}
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </div>

                                                    {crossSellSearch.trim() && (
                                                        <div className="mb-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => {
                                                                    const ids = crossSellSearch
                                                                        .split(/[, ]+/)
                                                                        .map((x) => Number(String(x).trim()))
                                                                        .filter((x) => x > 0 && x !== Number(editingProduct.id));
                                                                    if (ids.length === 0) return;
                                                                    productApi.getAll({ page: 1, pageSize: 2000 }).then((res) => {
                                                                        const data = res.data;
                                                                        const items = Array.isArray(data) ? data : (data.items || data.Items || data.data || data.Data || []);
                                                                        const map = new Map(items.map((p) => [Number(p.id ?? p.Id), p]));
                                                                        ids.forEach((id) => {
                                                                            const p = map.get(id);
                                                                            if (p) addCrossSell(p);
                                                                        });
                                                                    });
                                                                }}
                                                            >
                                                                Add by ID
                                                            </button>
                                                        </div>
                                                    )}

                                                    {crossSellItems.length === 0 ? (
                                                        <div className="text-muted small">No cross-sell items yet.</div>
                                                    ) : (
                                                        <div className="table-responsive">
                                                            <table className="table table-sm table-bordered bg-white mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th style={{ width: 60 }}>#</th>
                                                                        <th>Product</th>
                                                                        <th style={{ width: 200 }}>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {crossSellItems.map((p, index) => (
                                                                        <tr key={`${p.id ?? p.Id}-${index}`}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{(p.name ?? p.Name) || `#${p.id ?? p.Id}`}</td>
                                                                            <td>
                                                                                <div className="btn-group">
                                                                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => moveCrossSell(index, -1)} disabled={index === 0}>
                                                                                        Up
                                                                                    </button>
                                                                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => moveCrossSell(index, 1)} disabled={index === crossSellItems.length - 1}>
                                                                                        Down
                                                                                    </button>
                                                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeCrossSell(index)}>
                                                                                        Remove
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingProduct ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default Products;
