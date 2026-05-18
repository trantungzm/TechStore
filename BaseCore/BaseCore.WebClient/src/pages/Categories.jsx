import React, { useState, useEffect, useMemo } from 'react';
import { categoryApi, specApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdminFilterDropdown from '../components/AdminFilterDropdown';

const Categories = () => {
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [descriptionFilter, setDescriptionFilter] = useState('');
    const [sortBy, setSortBy] = useState('name_asc');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(8);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [showSpecsModal, setShowSpecsModal] = useState(false);
    const [specsCategory, setSpecsCategory] = useState(null);
    const [specDefinitions, setSpecDefinitions] = useState([]);
    const [specsLoading, setSpecsLoading] = useState(false);
    const [specsError, setSpecsError] = useState('');
    const [newSpec, setNewSpec] = useState({
        name: '',
        dataType: 'text',
        unit: '',
        sortOrder: 0,
        isComparable: true,
        isRequired: false,
    });
    const [editingSpecId, setEditingSpecId] = useState(null);
    const [editingSpec, setEditingSpec] = useState({
        name: '',
        dataType: 'text',
        unit: '',
        sortOrder: 0,
        isComparable: true,
        isRequired: false,
    });
    const [optionDraftByDefId, setOptionDraftByDefId] = useState({});
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [keyword, descriptionFilter, sortBy]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryApi.getAll();
            setAllCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = useMemo(() => {
        let categoryItems = [...allCategories];

        if (keyword.trim()) {
            const normalizedKeyword = keyword.trim().toLowerCase();
            categoryItems = categoryItems.filter((category) =>
                [category.name, category.description].some((value) => (value || '').toLowerCase().includes(normalizedKeyword))
            );
        }

        if (descriptionFilter === 'with') {
            categoryItems = categoryItems.filter((category) => (category.description || '').trim());
        } else if (descriptionFilter === 'without') {
            categoryItems = categoryItems.filter((category) => !(category.description || '').trim());
        }

        categoryItems.sort((a, b) => {
            if (sortBy === 'name_desc') {
                return String(b.name || '').localeCompare(String(a.name || ''));
            }
            if (sortBy === 'description_desc') {
                return String(b.description || '').localeCompare(String(a.description || ''));
            }
            if (sortBy === 'description_asc') {
                return String(a.description || '').localeCompare(String(b.description || ''));
            }
            return String(a.name || '').localeCompare(String(b.name || ''));
        });

        return categoryItems;
    }, [allCategories, keyword, descriptionFilter, sortBy]);

    const totalCount = filteredCategories.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const categories = useMemo(() => {
        const safePage = Math.max(1, Math.min(page, totalPages || 1));
        const startIndex = (safePage - 1) * pageSize;
        return filteredCategories.slice(startIndex, startIndex + pageSize);
    }, [filteredCategories, page, pageSize, totalPages]);

    useEffect(() => {
        if (totalPages > 0 && page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

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
        } catch (error) {
            const data = error.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await categoryApi.delete(id);
            setPage(1);
            loadCategories();
        } catch (error) {
            alert('Failed to delete category. It may have associated products.');
        }
    };

    const activeFilterCount =
        (keyword.trim() ? 1 : 0) +
        (descriptionFilter ? 1 : 0) +
        (sortBy !== 'name_asc' ? 1 : 0);

    const normalizeDef = (d) => ({
        id: d.id ?? d.Id,
        categoryId: d.categoryId ?? d.CategoryId,
        name: d.name ?? d.Name,
        dataType: d.dataType ?? d.DataType,
        unit: d.unit ?? d.Unit ?? '',
        sortOrder: d.sortOrder ?? d.SortOrder ?? 0,
        isComparable: Boolean(d.isComparable ?? d.IsComparable),
        isRequired: Boolean(d.isRequired ?? d.IsRequired),
        options: Array.isArray(d.options ?? d.Options) ? (d.options ?? d.Options) : [],
    });

    const normalizeOption = (o) => ({
        id: o.id ?? o.Id,
        specDefinitionId: o.specDefinitionId ?? o.SpecDefinitionId,
        displayText: o.displayText ?? o.DisplayText,
        value: o.value ?? o.Value,
        sortOrder: o.sortOrder ?? o.SortOrder ?? 0,
    });

    const loadSpecs = async (category) => {
        setSpecsLoading(true);
        setSpecsError('');
        try {
            const res = await specApi.getDefinitions(category.id);
            const defs = Array.isArray(res.data) ? res.data : [];
            setSpecDefinitions(defs.map(normalizeDef));
        } catch (err) {
            const data = err.response?.data;
            setSpecDefinitions([]);
            setSpecsError(data?.message || data?.detail || data?.title || 'Unable to load spec definitions');
        } finally {
            setSpecsLoading(false);
        }
    };

    const openSpecsModal = (category) => {
        if (!isAdmin()) return;
        setSpecsCategory(category);
        setSpecDefinitions([]);
        setNewSpec({
            name: '',
            dataType: 'text',
            unit: '',
            sortOrder: 0,
            isComparable: true,
            isRequired: false,
        });
        setEditingSpecId(null);
        setSpecsError('');
        setShowSpecsModal(true);
        loadSpecs(category);
    };

    const closeSpecsModal = () => {
        setShowSpecsModal(false);
        setSpecsCategory(null);
        setSpecDefinitions([]);
        setSpecsLoading(false);
        setSpecsError('');
        setEditingSpecId(null);
        setOptionDraftByDefId({});
    };

    const startEditSpec = (def) => {
        setEditingSpecId(def.id);
        setEditingSpec({
            name: def.name || '',
            dataType: (def.dataType || 'text').toLowerCase(),
            unit: def.unit || '',
            sortOrder: Number(def.sortOrder || 0),
            isComparable: Boolean(def.isComparable),
            isRequired: Boolean(def.isRequired),
        });
    };

    const saveNewSpec = async (e) => {
        e.preventDefault();
        if (!specsCategory?.id) return;
        setSpecsError('');
        try {
            const payload = {
                name: String(newSpec.name || '').trim(),
                dataType: String(newSpec.dataType || 'text').trim(),
                unit: String(newSpec.unit || '').trim() || null,
                sortOrder: Number(newSpec.sortOrder || 0),
                isComparable: Boolean(newSpec.isComparable),
                isRequired: Boolean(newSpec.isRequired),
            };
            if (!payload.name) return;
            await specApi.createDefinition(specsCategory.id, payload);
            setNewSpec((p) => ({ ...p, name: '', unit: '', sortOrder: 0 }));
            await loadSpecs(specsCategory);
        } catch (err) {
            const data = err.response?.data;
            setSpecsError(data?.message || data?.detail || data?.title || 'Unable to create spec definition');
        }
    };

    const saveEditingSpec = async (id) => {
        setSpecsError('');
        try {
            const payload = {
                name: String(editingSpec.name || '').trim(),
                dataType: String(editingSpec.dataType || 'text').trim(),
                unit: String(editingSpec.unit || '').trim() || null,
                sortOrder: Number(editingSpec.sortOrder || 0),
                isComparable: Boolean(editingSpec.isComparable),
                isRequired: Boolean(editingSpec.isRequired),
            };
            if (!payload.name) return;
            await specApi.updateDefinition(id, payload);
            setEditingSpecId(null);
            await loadSpecs(specsCategory);
        } catch (err) {
            const data = err.response?.data;
            setSpecsError(data?.message || data?.detail || data?.title || 'Unable to update spec definition');
        }
    };

    const addOption = async (defId) => {
        const draft = optionDraftByDefId[defId] || { displayText: '', value: '', sortOrder: 0 };
        const displayText = String(draft.displayText || '').trim();
        const value = String(draft.value || '').trim();
        if (!displayText || !value) return;

        setSpecsError('');
        try {
            await specApi.addOption(defId, {
                displayText,
                value,
                sortOrder: Number(draft.sortOrder || 0),
            });
            setOptionDraftByDefId((p) => ({ ...p, [defId]: { displayText: '', value: '', sortOrder: 0 } }));
            await loadSpecs(specsCategory);
        } catch (err) {
            const data = err.response?.data;
            setSpecsError(data?.message || data?.detail || data?.title || 'Unable to add option');
        }
    };

    return (
        <>
            <div className="card mb-3">
                <div className="card-header">
                    <div className="row">
                        <div className="col-md-9 d-flex align-items-center">
                            <h3 className="card-title mb-0 mr-2">Categories</h3>
                            <AdminFilterDropdown
                                open={isFilterMenuOpen}
                                onOpenChange={setIsFilterMenuOpen}
                                label="Filters"
                                activeCount={activeFilterCount}
                            >
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
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
                                        <label>Description</label>
                                        <select
                                            className="form-control"
                                            value={descriptionFilter}
                                            onChange={(e) => setDescriptionFilter(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="with">Has description</option>
                                            <option value="without">No description</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Sort</label>
                                        <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                            <option value="name_asc">Name A-Z</option>
                                            <option value="name_desc">Name Z-A</option>
                                            <option value="description_asc">Description A-Z</option>
                                            <option value="description_desc">Description Z-A</option>
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setKeyword('');
                                                setDescriptionFilter('');
                                                setSortBy('name_asc');
                                            }}
                                        >
                                            Reset
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Close
                                        </button>
                                    </div>
                                </form>
                            </AdminFilterDropdown>
                            <span className="text-muted ml-3">Total: <strong>{totalCount}</strong></span>
                        </div>
                        <div className="col-md-3 text-right">
                            {isAdmin() && (
                                <button className="btn btn-success" onClick={() => openModal()}>
                                    <i className="fas fa-plus"></i> Add Category
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
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th style={{ width: '90px' }}>ID</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        {isAdmin() && <th style={{ width: '200px' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdmin() ? 4 : 3} className="text-center">
                                                No categories found
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map(category => (
                                            <tr key={category.id}>
                                                <td>{category.id}</td>
                                                <td>{category.name}</td>
                                                <td>{category.description}</td>
                                                {isAdmin() && (
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-secondary mr-1"
                                                            onClick={() => openSpecsModal(category)}
                                                            title="Technical specs"
                                                        >
                                                            <i className="fas fa-sliders-h"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-info mr-1"
                                                            onClick={() => openModal(category)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(category.id)}
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
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="card-footer">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted">
                                Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} of {allCategories.length} categories
                            </div>
                            <nav>
                                <ul className="pagination m-0">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                        <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === totalPages}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingCategory ? 'Edit Category' : 'Add Category'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
                                    {error && <div className="alert alert-danger">{error}</div>}
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
                                        <label>Description</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show"></div>}

            {showSpecsModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-scrollable modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Technical Specs — {specsCategory?.name || ''}
                                </h5>
                                <button type="button" className="close" onClick={closeSpecsModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
                                {specsError && <div className="alert alert-danger">{specsError}</div>}

                                <div className="border rounded p-3 bg-light mb-3">
                                    <div className="font-weight-bold mb-2">Thêm thông số</div>
                                    <form onSubmit={saveNewSpec}>
                                        <div className="form-row">
                                            <div className="form-group col-md-4">
                                                <label>Name</label>
                                                <input
                                                    className="form-control"
                                                    value={newSpec.name}
                                                    onChange={(e) => setNewSpec((p) => ({ ...p, name: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group col-md-3">
                                                <label>Data type</label>
                                                <select
                                                    className="form-control"
                                                    value={newSpec.dataType}
                                                    onChange={(e) => setNewSpec((p) => ({ ...p, dataType: e.target.value }))}
                                                >
                                                    <option value="text">text</option>
                                                    <option value="number">number</option>
                                                    <option value="bool">bool</option>
                                                    <option value="select">select</option>
                                                </select>
                                            </div>
                                            <div className="form-group col-md-2">
                                                <label>Unit</label>
                                                <input
                                                    className="form-control"
                                                    value={newSpec.unit}
                                                    onChange={(e) => setNewSpec((p) => ({ ...p, unit: e.target.value }))}
                                                    disabled={newSpec.dataType !== 'number'}
                                                />
                                            </div>
                                            <div className="form-group col-md-2">
                                                <label>Order</label>
                                                <input
                                                    className="form-control"
                                                    type="number"
                                                    value={newSpec.sortOrder}
                                                    onChange={(e) => setNewSpec((p) => ({ ...p, sortOrder: e.target.value }))}
                                                />
                                            </div>
                                            <div className="form-group col-md-1 d-flex align-items-end">
                                                <button type="submit" className="btn btn-primary btn-block">
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-2">
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="newSpecComparable"
                                                        checked={newSpec.isComparable}
                                                        onChange={(e) => setNewSpec((p) => ({ ...p, isComparable: e.target.checked }))}
                                                    />
                                                    <label className="custom-control-label" htmlFor="newSpecComparable">Comparable</label>
                                                </div>
                                            </div>
                                            <div className="form-group col-md-2">
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="newSpecRequired"
                                                        checked={newSpec.isRequired}
                                                        onChange={(e) => setNewSpec((p) => ({ ...p, isRequired: e.target.checked }))}
                                                    />
                                                    <label className="custom-control-label" htmlFor="newSpecRequired">Required</label>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {specsLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary"></div>
                                    </div>
                                ) : specDefinitions.length === 0 ? (
                                    <div className="alert alert-light border mb-0">No spec definitions</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover bg-white">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 70 }}>ID</th>
                                                    <th>Name</th>
                                                    <th style={{ width: 120 }}>Type</th>
                                                    <th style={{ width: 110 }}>Unit</th>
                                                    <th style={{ width: 80 }}>Order</th>
                                                    <th style={{ width: 110 }}>Flags</th>
                                                    <th style={{ width: 140 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {specDefinitions.map((def) => {
                                                    const isEditing = editingSpecId === def.id;
                                                    const dtype = String(def.dataType || 'text').toLowerCase();
                                                    return (
                                                        <React.Fragment key={def.id}>
                                                            <tr>
                                                                <td>{def.id}</td>
                                                                <td>
                                                                    {isEditing ? (
                                                                        <input
                                                                            className="form-control form-control-sm"
                                                                            value={editingSpec.name}
                                                                            onChange={(e) => setEditingSpec((p) => ({ ...p, name: e.target.value }))}
                                                                        />
                                                                    ) : (
                                                                        def.name
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {isEditing ? (
                                                                        <select
                                                                            className="form-control form-control-sm"
                                                                            value={editingSpec.dataType}
                                                                            onChange={(e) => setEditingSpec((p) => ({ ...p, dataType: e.target.value }))}
                                                                        >
                                                                            <option value="text">text</option>
                                                                            <option value="number">number</option>
                                                                            <option value="bool">bool</option>
                                                                            <option value="select">select</option>
                                                                        </select>
                                                                    ) : (
                                                                        dtype
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {isEditing ? (
                                                                        <input
                                                                            className="form-control form-control-sm"
                                                                            value={editingSpec.unit}
                                                                            onChange={(e) => setEditingSpec((p) => ({ ...p, unit: e.target.value }))}
                                                                            disabled={String(editingSpec.dataType || '').toLowerCase() !== 'number'}
                                                                        />
                                                                    ) : (
                                                                        def.unit || ''
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {isEditing ? (
                                                                        <input
                                                                            className="form-control form-control-sm"
                                                                            type="number"
                                                                            value={editingSpec.sortOrder}
                                                                            onChange={(e) => setEditingSpec((p) => ({ ...p, sortOrder: e.target.value }))}
                                                                        />
                                                                    ) : (
                                                                        def.sortOrder
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div className="small">
                                                                        {def.isComparable ? 'Comparable' : '—'}
                                                                    </div>
                                                                    <div className="small">
                                                                        {def.isRequired ? 'Required' : '—'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {isEditing ? (
                                                                        <div className="btn-group">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-primary"
                                                                                onClick={() => saveEditingSpec(def.id)}
                                                                            >
                                                                                Save
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-secondary"
                                                                                onClick={() => setEditingSpecId(null)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() => startEditSpec(def)}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {dtype === 'select' && (
                                                                <tr>
                                                                    <td colSpan={7}>
                                                                        <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
                                                                            <div className="font-weight-bold">Options</div>
                                                                        </div>
                                                                        <div className="row mt-2">
                                                                            <div className="col-md-6">
                                                                                {def.options?.length ? (
                                                                                    <table className="table table-sm table-bordered mb-0">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th style={{ width: 60 }}>ID</th>
                                                                                                <th>Display</th>
                                                                                                <th>Value</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {def.options.map((raw) => {
                                                                                                const opt = normalizeOption(raw);
                                                                                                return (
                                                                                                    <tr key={opt.id}>
                                                                                                        <td>{opt.id}</td>
                                                                                                        <td>{opt.displayText}</td>
                                                                                                        <td>{opt.value}</td>
                                                                                                    </tr>
                                                                                                );
                                                                                            })}
                                                                                        </tbody>
                                                                                    </table>
                                                                                ) : (
                                                                                    <div className="text-muted small">No options</div>
                                                                                )}
                                                                            </div>
                                                                            <div className="col-md-6">
                                                                                <div className="border rounded p-2 bg-light">
                                                                                    <div className="font-weight-bold small mb-2">Add option</div>
                                                                                    <div className="form-row">
                                                                                        <div className="form-group col-5 mb-2">
                                                                                            <input
                                                                                                className="form-control form-control-sm"
                                                                                                placeholder="Display text"
                                                                                                value={(optionDraftByDefId[def.id]?.displayText) ?? ''}
                                                                                                onChange={(e) =>
                                                                                                    setOptionDraftByDefId((p) => ({
                                                                                                        ...p,
                                                                                                        [def.id]: { ...(p[def.id] || {}), displayText: e.target.value },
                                                                                                    }))
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                        <div className="form-group col-5 mb-2">
                                                                                            <input
                                                                                                className="form-control form-control-sm"
                                                                                                placeholder="Value"
                                                                                                value={(optionDraftByDefId[def.id]?.value) ?? ''}
                                                                                                onChange={(e) =>
                                                                                                    setOptionDraftByDefId((p) => ({
                                                                                                        ...p,
                                                                                                        [def.id]: { ...(p[def.id] || {}), value: e.target.value },
                                                                                                    }))
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                        <div className="form-group col-2 mb-2">
                                                                                            <button
                                                                                                type="button"
                                                                                                className="btn btn-sm btn-primary btn-block"
                                                                                                onClick={() => addOption(def.id)}
                                                                                            >
                                                                                                Add
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeSpecsModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showSpecsModal && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default Categories;
