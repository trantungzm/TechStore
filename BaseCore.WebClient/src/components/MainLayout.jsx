import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const previousBodyClass = document.body.className;

        const stylesheetUrls = [
            'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css',
        ];

        const scriptUrls = [
            'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js',
        ];

        const appendedLinks = stylesheetUrls.map((href) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.adminAsset = 'true';
            document.head.appendChild(link);
            return link;
        });

        const appendedScripts = [];
        let cancelled = false;

        const loadScripts = async () => {
            for (const src of scriptUrls) {
                if (cancelled) return;
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.dataset.adminAsset = 'true';
                    script.onload = resolve;
                    script.onerror = resolve;
                    document.body.appendChild(script);
                    appendedScripts.push(script);
                });
            }
        };

        loadScripts();

        return () => {
            cancelled = true;
            appendedLinks.forEach((link) => link.remove());
            appendedScripts.forEach((script) => script.remove());
            document.body.className = previousBodyClass || 'hold-transition sidebar-mini';
        };
    }, []);

    // Apply the body class when the sidebar state changes
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.remove('sidebar-collapse');
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
            document.body.classList.add('sidebar-collapse');
        }
    }, [isSidebarOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = (e) => {
        e.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="wrapper">
            {/* Navbar */}
            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={toggleSidebar} role="button">
                            <i className="fas fa-bars"></i>
                        </a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <Link to="/admin" className="nav-link">Admin Home</Link>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <span className="nav-link">
                            <i className="far fa-user mr-2"></i> {user?.name || user?.username}
                        </span>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link btn btn-link" onClick={handleLogout} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <i className="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Sidebar */}
            <aside className="main-sidebar sidebar-dark-primary elevation-4">
                <Link to="/admin" className="brand-link">
                    <span className="brand-text font-weight-light ml-3">
                        <b>Store</b> Sales
                    </span>
                </Link>

                <div className="sidebar">
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <i className="fas fa-user-circle fa-2x text-light"></i>
                        </div>
                        <div className="info">
                            <Link to="#" className="d-block">{user?.name || user?.username}</Link>
                        </div>
                    </div>

                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                            <li className="nav-item">
                                <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                                    <i className="nav-icon fas fa-tachometer-alt"></i>
                                    <p>Dashboard</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/products" className={`nav-link ${isActive('/admin/products')}`}>
                                    <i className="nav-icon fas fa-box"></i>
                                    <p>Products</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/categories" className={`nav-link ${isActive('/admin/categories')}`}>
                                    <i className="nav-icon fas fa-tags"></i>
                                    <p>Categories</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/orders" className={`nav-link ${isActive('/admin/orders')}`}>
                                    <i className="nav-icon fas fa-shopping-cart"></i>
                                    <p>Orders</p>
                                </Link>
                            </li>
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
                                        <i className="nav-icon fas fa-users"></i>
                                        <p>Users</p>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Content */}
            {children}

            {/* Footer */}
            <footer className="main-footer">
                <strong>Copyright &copy; 2024 <a href="#">BaseCore Sales</a>.</strong>
                <div className="float-right d-none d-sm-inline-block">
                    <b>Version</b> 1.0.0
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
