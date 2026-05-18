import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdminFilterDropdown from '../components/AdminFilterDropdown';

const Users = () => {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [positionFilter, setPositionFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        position: '',
        role: 'User',
        userType: 0,
        isActive: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, keyword, roleFilter, statusFilter, positionFilter, page]);

    useEffect(() => {
        setPage(1);
    }, [keyword, roleFilter, statusFilter, positionFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getAll({ page: 1, pageSize: 500 });
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...users];
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (normalizedKeyword) {
            result = result.filter((user) =>
                [user.username, user.name, user.email, user.phone, user.position]
                    .some((value) => (value || '').toLowerCase().includes(normalizedKeyword))
            );
        }
        if (roleFilter !== '') {
            result = result.filter((user) => String(user.role || '') === roleFilter);
        }
        if (statusFilter !== '') {
            result = result.filter((user) => String(user.isActive) === statusFilter);
        }
        if (positionFilter.trim()) {
            result = result.filter((user) => (user.position || '').toLowerCase().includes(positionFilter.trim().toLowerCase()));
        }

        setTotalCount(result.length);
        setTotalPages(Math.ceil(result.length / pageSize) || 1);
        setFilteredUsers(result.slice((page - 1) * pageSize, page * pageSize));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            const role = String(user.role || '').trim() || (user.userType === 1 ? 'Admin' : 'User');
            setFormData({
                username: user.username,
                password: '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                position: user.position || '',
                role,
                userType: role === 'Admin' ? 1 : 0,
                isActive: user.isActive,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                name: '',
                email: '',
                phone: '',
                position: '',
                role: 'User',
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
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    position: formData.position,
                    role: formData.role,
                    userType: formData.role === 'Admin' ? 1 : 0,
                    isActive: formData.isActive,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await userApi.update(editingUser.id, updateData);
            } else {
                if (!formData.password) {
                    setError('Password is required for new user');
                    return;
                }
                await userApi.create({
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    position: formData.position,
                    role: formData.role,
                    userType: formData.role === 'Admin' ? 1 : 0,
                });
            }

            closeModal();
            loadUsers();
        } catch (error) {
            const data = error.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userApi.delete(id);
            loadUsers();
        } catch (error) {
            alert('Failed to delete user');
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
        (roleFilter ? 1 : 0) +
        (statusFilter ? 1 : 0) +
        (positionFilter.trim() ? 1 : 0);

    return (
        <>
            <div className="card mb-3">
                <div className="card-header">
                    <div className="row">
                        <div className="col-md-8 d-flex align-items-center">
                            <h3 className="card-title mb-0 mr-2">Users</h3>
                            <AdminFilterDropdown
                                open={isFilterMenuOpen}
                                onOpenChange={setIsFilterMenuOpen}
                                label="Filters"
                                activeCount={activeFilterCount}
                            >
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setPage(1);
                                        setIsFilterMenuOpen(false);
                                    }}
                                >
                                    <div className="form-group">
                                        <label>Search</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Name, email, phone..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                            <option value="">All</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Warehouse">Warehouse</option>
                                            <option value="Technical">Technical</option>
                                            <option value="Warranty">Warranty</option>
                                            <option value="User">User</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                            <option value="">All</option>
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Position</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={positionFilter}
                                            onChange={(e) => setPositionFilter(e.target.value)}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setKeyword('');
                                                setRoleFilter('');
                                                setStatusFilter('');
                                                setPositionFilter('');
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
                            {isAdmin() && (
                                <button className="btn btn-success" onClick={() => openModal()}>
                                    <i className="fas fa-plus"></i> Add User
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
                                            <th style={{ width: '160px' }}>Username</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th style={{ width: '160px' }}>Phone</th>
                                            <th style={{ width: '120px' }}>Role</th>
                                            <th style={{ width: '120px' }}>Status</th>
                                            <th style={{ width: '140px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.username}</td>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.phone}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                user.role === 'Admin'
                                                                    ? 'badge-danger'
                                                                    : user.role === 'Warehouse'
                                                                        ? 'badge-info'
                                                                        : user.role === 'Technical'
                                                                            ? 'badge-primary'
                                                                            : user.role === 'Warranty'
                                                                                ? 'badge-warning'
                                                                                : 'badge-secondary'
                                                            }`}
                                                        >
                                                            {user.role || (user.userType === 1 ? 'Admin' : 'User')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {isAdmin() ? (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-info mr-1"
                                                                    onClick={() => openModal(user)}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(user.id)}
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Total: <strong>{totalCount}</strong> users</span>
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
                    <div className="modal-dialog modal-dialog-scrollable modal-lg" style={{ maxWidth: 720 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingUser ? 'Edit User' : 'Add User'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                            disabled={!!editingUser}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password {editingUser && '(leave blank to keep current)'}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Position</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select
                                            className="form-control"
                                            value={formData.role}
                                            onChange={(e) => {
                                                const role = e.target.value;
                                                setFormData({ ...formData, role, userType: role === 'Admin' ? 1 : 0 });
                                            }}
                                        >
                                            <option value="User">User</option>
                                            <option value="Warehouse">Warehouse</option>
                                            <option value="Technical">Technical</option>
                                            <option value="Warranty">Warranty</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    {editingUser && (
                                        <div className="form-group">
                                            <div className="custom-control custom-switch">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="isActive"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <label className="custom-control-label" htmlFor="isActive">Active</label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingUser ? 'Update' : 'Create'}
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

export default Users;
