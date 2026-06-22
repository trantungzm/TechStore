import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CompareProvider } from './contexts/CompareContext';
import { StoreSettingsProvider } from './contexts/StoreSettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import { FullScreenLoading } from './components/common/Loading';
import { ADMIN_PANEL_ROLES, STOCK_ROLES, RETURN_ROLES } from './constants/roles';
import MainLayout from './layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import Categories from './pages/admin/Categories';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBanners from './pages/admin/AdminBanners';
import AdminInventory from './pages/admin/AdminInventory';
import AdminRepairs from './pages/admin/AdminRepairs';
import AdminTickets from './pages/admin/AdminTickets';
import AdminWarranty from './pages/admin/AdminWarranty';
import Roles from './pages/admin/Roles';
import StoreLayout from './layout/StoreLayout';
import ScrollToTop from './components/store/ScrollToTop';
import AppNotifications from './components/AppNotifications';
import Home from './pages/store/Home';
import Shop from './pages/store/Shop';
import Single from './pages/store/Single';
import Bestseller from './pages/store/Bestseller';
import Promotion from './pages/store/Promotion';
import Warranty from './pages/store/Warranty';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import NotFound from './pages/store/NotFound';
import Orders from './pages/store/Orders';
import Wishlist from './pages/store/Wishlist';
import Compare from './pages/store/Compare';
import ProductDetail from './pages/store/ProductDetail';
import Tickets from './pages/store/Tickets';
import PaymentWaiting from './pages/store/PaymentWaiting';
import { getPostLoginPath } from './utils/store';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <FullScreenLoading />;
    }

    if (isAuthenticated) {
        const requestedPath = location.state?.from?.pathname;
        return <Navigate to={getPostLoginPath(user, requestedPath)} replace />;
    }

    return children;
};

const LegacyAdminRedirect = ({ to }) => <Navigate to={to} replace />;

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route path="/contact" element={<Navigate to="/" replace />} />

            {/* Store (user-facing): StoreLayout là layout route nên tồn tại xuyên suốt
                — header/footer/spinner không dựng lại, chỉ nội dung fade mượt khi đổi trang. */}
            <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/single" element={<Single />} />
                <Route path="/bestseller" element={<Bestseller />} />
                <Route path="/new-arrivals" element={<Bestseller />} />
                <Route path="/promotion" element={<Promotion />} />
                <Route path="/warranty" element={<Warranty />} />
                <Route path="/bao-hanh" element={<Warranty />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/waiting/:sessionId" element={<PaymentWaiting />} />
                <Route path="/404" element={<NotFound />} />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tickets"
                    element={
                        <ProtectedRoute>
                            <Tickets />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tickets/:ticketId"
                    element={
                        <ProtectedRoute>
                            <Tickets />
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_PANEL_ROLES}>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/products"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_PANEL_ROLES}>
                        <MainLayout>
                            <Products />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/categories"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <MainLayout>
                            <Categories />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/suppliers"
                element={
                    <ProtectedRoute allowedRoles={STOCK_ROLES}>
                        <MainLayout>
                            <AdminSuppliers />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <MainLayout>
                            <Users />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/roles"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <MainLayout>
                            <Roles />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/orders"
                element={
                    <ProtectedRoute allowedRoles={STOCK_ROLES}>
                        <MainLayout>
                            <AdminOrders />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/coupons"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <MainLayout>
                            <AdminCoupons />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/banners"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <MainLayout>
                            <AdminBanners />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/inventory"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_PANEL_ROLES}>
                        <MainLayout>
                            <AdminInventory />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/inventory/receipts"
                element={
                    <ProtectedRoute allowedRoles={STOCK_ROLES}>
                        <MainLayout>
                            <AdminInventory />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/inventory/serials"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_PANEL_ROLES}>
                        <MainLayout>
                            <AdminInventory />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/inventory/returns"
                element={
                    <ProtectedRoute allowedRoles={RETURN_ROLES}>
                        <MainLayout>
                            <AdminInventory />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/warranty"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_PANEL_ROLES}>
                        <MainLayout>
                            <AdminWarranty />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/repairs"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_PANEL_ROLES}>
                        <MainLayout>
                            <AdminRepairs />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/tickets"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_PANEL_ROLES}>
                        <MainLayout>
                            <AdminTickets />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="/products" element={<LegacyAdminRedirect to="/admin/products" />} />
            <Route path="/categories" element={<LegacyAdminRedirect to="/admin/categories" />} />
            <Route path="/users" element={<LegacyAdminRedirect to="/admin/users" />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route element={<StoreLayout />}>
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AppNotifications />
            <AuthProvider>
                <StoreSettingsProvider>
                    <WishlistProvider>
                        <CompareProvider>
                            <CartProvider>
                                <AppRoutes />
                            </CartProvider>
                        </CompareProvider>
                    </WishlistProvider>
                </StoreSettingsProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
