import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CompareProvider } from './contexts/CompareContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Categories from './pages/Categories';
import AdminOrders from './pages/AdminOrders';
import StoreLayout from './components/store/StoreLayout';
import Home from './pages/store/Home';
import Shop from './pages/store/Shop';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import Contact from './pages/store/Contact';
import Orders from './pages/store/Orders';
import Wishlist from './pages/store/Wishlist';
import Compare from './pages/store/Compare';
import ProductDetail from './pages/store/ProductDetail';
import { getPostLoginPath } from './utils/store';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
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
            <Route
                path="/"
                element={
                    <StoreLayout>
                        <Home />
                    </StoreLayout>
                }
            />
            <Route
                path="/shop"
                element={
                    <StoreLayout>
                        <Shop />
                    </StoreLayout>
                }
            />
            <Route
                path="/product/:id"
                element={
                    <StoreLayout>
                        <ProductDetail />
                    </StoreLayout>
                }
            />
            <Route
                path="/cart"
                element={
                    <StoreLayout>
                        <Cart />
                    </StoreLayout>
                }
            />
            <Route
                path="/wishlist"
                element={
                    <StoreLayout>
                        <Wishlist />
                    </StoreLayout>
                }
            />
            <Route
                path="/compare"
                element={
                    <StoreLayout>
                        <Compare />
                    </StoreLayout>
                }
            />
            <Route
                path="/contact"
                element={
                    <StoreLayout>
                        <Contact />
                    </StoreLayout>
                }
            />
            <Route
                path="/checkout"
                element={
                    <ProtectedRoute>
                        <StoreLayout>
                            <Checkout />
                        </StoreLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <ProtectedRoute>
                        <StoreLayout>
                            <Orders />
                        </StoreLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/products"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Products />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/categories"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Categories />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Users />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/orders"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <AdminOrders />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="/products" element={<LegacyAdminRedirect to="/admin/products" />} />
            <Route path="/categories" element={<LegacyAdminRedirect to="/admin/categories" />} />
            <Route path="/users" element={<LegacyAdminRedirect to="/admin/users" />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <WishlistProvider>
                    <CompareProvider>
                        <CartProvider>
                            <AppRoutes />
                        </CartProvider>
                    </CompareProvider>
                </WishlistProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
