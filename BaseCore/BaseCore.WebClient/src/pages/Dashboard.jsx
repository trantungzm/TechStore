import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, userApi, categoryApi, orderApi, ticketApi, repairApi, inventoryApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        users: 0,
        orders: 0,
        stockItems: 0,
        tickets: 0,
        repairs: 0,
    });
    const [loading, setLoading] = useState(true);
    const { isAdmin, hasRole } = useAuth();

    const canProducts = hasRole(['Admin', 'Warehouse', 'Technical', 'StockManager']);
    const canCategories = hasRole(['Admin']);
    const canUsers = isAdmin();
    const canOrders = hasRole(['Admin', 'Warehouse', 'StockManager']);
    const canInventory = hasRole(['Admin', 'Warehouse', 'StockManager']);
    const canTickets = hasRole(['Admin', 'Technical', 'Warranty']);
    const canRepairs = hasRole(['Admin', 'Warranty']);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const safe = async (fn) => {
            try {
                return await fn();
            } catch {
                return null;
            }
        };

        const getCount = (data) => {
            if (!data) return 0;
            if (typeof data.totalCount === 'number') return data.totalCount;
            const items = data.items || data.Items;
            if (Array.isArray(items)) return items.length;
            if (Array.isArray(data)) return data.length;
            return 0;
        };

        try {
            const [
                productsRes,
                categoriesRes,
                ordersRes,
                usersRes,
                stockRes,
                ticketsRes,
                repairsRes,
            ] = await Promise.all([
                canProducts ? safe(() => productApi.getAll()) : null,
                canCategories ? safe(() => categoryApi.getAll()) : null,
                canOrders ? safe(() => orderApi.getAll()) : null,
                canUsers ? safe(() => userApi.getAll({ page: 1, pageSize: 1 })) : null,
                canInventory ? safe(() => inventoryApi.getStockItems()) : null,
                canTickets ? safe(() => ticketApi.getAll()) : null,
                canRepairs ? safe(() => repairApi.getAll()) : null,
            ]);

            setStats({
                products: getCount(productsRes?.data),
                categories: getCount(categoriesRes?.data),
                users: usersRes?.data?.totalCount || 0,
                orders: getCount(ordersRes?.data),
                stockItems: getCount(stockRes?.data),
                tickets: getCount(ticketsRes?.data),
                repairs: getCount(repairsRes?.data),
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const tiles = [
        {
            key: 'products',
            count: stats.products,
            label: 'Products',
            bg: 'bg-info',
            icon: 'fas fa-box',
            to: '/admin/products',
            visible: canProducts,
        },
        {
            key: 'categories',
            count: stats.categories,
            label: 'Categories',
            bg: 'bg-success',
            icon: 'fas fa-tags',
            to: '/admin/categories',
            visible: canCategories,
        },
        {
            key: 'orders',
            count: stats.orders,
            label: 'Orders',
            bg: 'bg-warning',
            icon: 'fas fa-shopping-cart',
            to: '/admin/orders',
            visible: canOrders,
        },
        {
            key: 'inventory',
            count: stats.stockItems,
            label: 'Inventory',
            bg: 'bg-secondary',
            icon: 'fas fa-warehouse',
            to: '/admin/inventory',
            visible: canInventory,
        },
        {
            key: 'tickets',
            count: stats.tickets,
            label: 'Tickets',
            bg: 'bg-primary',
            icon: 'fas fa-life-ring',
            to: '/admin/tickets',
            visible: canTickets,
        },
        {
            key: 'repairs',
            count: stats.repairs,
            label: 'Repairs',
            bg: 'bg-teal',
            icon: 'fas fa-tools',
            to: '/admin/repairs',
            visible: canRepairs,
        },
        {
            key: 'users',
            count: stats.users,
            label: 'Users',
            bg: 'bg-danger',
            icon: 'fas fa-users',
            to: '/admin/users',
            visible: canUsers,
        },
    ];

    return (
        <>
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {tiles
                        .filter((t) => t.visible)
                        .map((t) => (
                            <div key={t.key} className="col-lg-3 col-6">
                                <div className={`small-box ${t.bg}`}>
                                    <div className="inner">
                                        <h3>{t.count}</h3>
                                        <p>{t.label}</p>
                                    </div>
                                    <div className="icon">
                                        <i className={t.icon}></i>
                                    </div>
                                    <Link to={t.to} className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </Link>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Welcome to BaseCore Sales System</h3>
                        </div>
                        <div className="card-body">
                            <p>This is a teaching framework for web development using:</p>
                            <ul>
                                <li><strong>Backend:</strong> .NET Core 8.0 with Entity Framework Core</li>
                                <li><strong>Frontend:</strong> React 18 with React Router</li>
                                <li><strong>UI:</strong> AdminLTE 3 with Bootstrap 4</li>
                                <li><strong>Authentication:</strong> JWT Bearer Token</li>
                            </ul>
                            <p>Features include:</p>
                            <ul>
                                <li>User Authentication (Login/Logout)</li>
                                <li>Product Management (CRUD with Search & Pagination)</li>
                                <li>Category Management</li>
                                <li>User Management (Admin only)</li>
                                <li>Order Management</li>
                                <li>Inventory Management</li>
                                <li>Support Tickets</li>
                                <li>Warranty Repairs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
