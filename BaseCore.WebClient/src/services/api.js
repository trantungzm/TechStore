import axios from 'axios';
import { BYPASS_AUTH } from '../config/authBypass';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !BYPASS_AUTH) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath.startsWith('/admin')) {
                window.location.assign('/login');
            }
        }

        return Promise.reject(error);
    }
);

const unwrapPagedItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    return payload?.items || payload?.Items || payload?.data || payload?.Data || [];
};

const normalizeLoginResponse = (response) => {
    const data = response.data || {};
    return {
        data: {
            token: data.Token || data.token,
            userId: data.UserId || data.userId,
            username: data.Username || data.username,
            name: data.Name || data.name,
            email: data.Email || data.email,
            dateOfBirth: data.DateOfBirth || data.dateOfBirth || data.User?.DateOfBirth || data.user?.dateOfBirth,
            role: data.Role || data.role,
            expiresIn: data.ExpiresIn || data.expiresIn,
        },
    };
};

const multipart = (files, fieldName) => {
    const form = new FormData();
    Array.from(files || []).forEach((file) => form.append(fieldName, file));
    return form;
};

const withItems = (request) => request.then((res) => ({ ...res, data: unwrapPagedItems(res.data) }));

const pickFirstNumber = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined || value === '') continue;
        const numeric = Number(value);
        if (Number.isFinite(numeric)) return numeric;
    }
    return 0;
};

const pickFirstPositiveNumber = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined || value === '') continue;
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }
    return 0;
};

const countActiveVariants = (variants = []) => (
    Array.isArray(variants)
        ? variants.filter((variant) => variant?.isActive !== false && variant?.IsActive !== false).length
        : 0
);

const normalizeVariantShape = (variant, fallbackPrice = 0) => {
    if (!variant || typeof variant !== 'object' || Array.isArray(variant)) return variant;
    const price = pickFirstPositiveNumber(variant.price, variant.basePrice, fallbackPrice);
    const oldPrice = pickFirstPositiveNumber(variant.oldPrice, variant.originalPrice);
    return {
        ...variant,
        price,
        oldPrice: oldPrice > price ? oldPrice : 0,
        originalPrice: oldPrice > price ? oldPrice : null,
    };
};

const normalizeProductShape = (product) => {
    if (!product || typeof product !== 'object' || Array.isArray(product)) return product;

    const price = pickFirstPositiveNumber(product.price, product.minPrice, product.basePrice, product.maxPrice);
    const stock = pickFirstNumber(product.stock, product.totalStock);
    const variantCount = countActiveVariants(product.variants);
    const variantOriginalPrice = Array.isArray(product.variants)
        ? Math.max(
            0,
            ...product.variants.map((variant) => pickFirstPositiveNumber(variant?.oldPrice, variant?.originalPrice))
        )
        : 0;
    const legacyOriginalPrice = variantCount === 0 && Number(product.maxPrice || 0) > price
        ? Number(product.maxPrice || 0)
        : 0;
    const oldPrice = pickFirstPositiveNumber(product.oldPrice, product.originalPrice, variantOriginalPrice, legacyOriginalPrice);

    return {
        ...product,
        price,
        oldPrice: oldPrice > price ? oldPrice : 0,
        originalPrice: oldPrice > price ? oldPrice : null,
        stock,
        variantCount,
        variants: Array.isArray(product.variants)
            ? product.variants.map((variant) => normalizeVariantShape(variant, price))
            : product.variants,
    };
};

const normalizeProductResponse = (response) => {
    const data = response?.data;
    if (Array.isArray(data?.items)) {
        return {
            ...response,
            data: {
                ...data,
                items: data.items.map(normalizeProductShape),
            },
        };
    }

    if (data && typeof data === 'object' && !Array.isArray(data) && ('id' in data || 'Id' in data)) {
        return {
            ...response,
            data: normalizeProductShape(data),
        };
    }

    return response;
};

export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }).then(normalizeLoginResponse),
    register: (data) => api.post('/auth/register', data).then((response) => {
        const payload = response.data || {};
        return {
            data: {
                message: payload.message || payload.Message,
                userId: payload.userId || payload.UserId,
            },
        };
    }),
};

export const userApi = {
    getAll: (params = {}) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    updateRole: (id, data) => api.put(`/users/${id}/role`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

export const roleApi = {
    getAll: () => api.get('/roles'),
    getById: (id) => api.get(`/roles/${id}`),
    create: (data) => api.post('/roles', data),
    update: (id, data) => api.put(`/roles/${id}`, data),
    delete: (id) => api.delete(`/roles/${id}`),
};

export const settingsApi = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
    getPickupBranches: () => api.get('/settings/pickup-branches'),
};

export const couponApi = {
    getAll: (params = {}) => api.get('/coupons', { params }),
    getById: (id) => api.get(`/coupons/${id}`),
    create: (data) => api.post('/coupons', data),
    update: (id, data) => api.put(`/coupons/${id}`, data),
    delete: (id) => api.delete(`/coupons/${id}`),
    toggle: (id) => api.put(`/coupons/${id}/toggle`),
    getUsers: (id) => api.get(`/coupons/${id}/users`),
    getStats: () => api.get('/coupons/stats'),
    getAnalytics: (params = {}) => api.get('/coupons/analytics', { params }),
    getPublic: (params = {}) => api.get('/coupons/public', { params }),
    getMy: (params = {}) => api.get('/coupons/my', { params }),
    claim: (id) => api.post(`/coupons/${id}/claim`),
    validate: (data) => api.post('/coupons/validate', data),
    applyPreview: (data) => api.post('/coupons/apply-preview', data),
    spin: () => api.post('/coupons/spin'),
};

export const uploadApi = {
    uploadProductImages: (files) => api.post('/uploads/product-images', multipart(files, 'files')),
    uploadTicketAttachments: (files) => api.post('/uploads/ticket-attachments', multipart(files, 'files')),
};

export const productApi = {
    getAllRemote: (params = {}) => api.get('/products', { params }).then(normalizeProductResponse),
    getAll: (params = {}) => api.get('/products', { params }).then(normalizeProductResponse),
    search: (params = {}) => api.get('/products', { params }).then(normalizeProductResponse),
    getStats: (params = {}) => api.get('/products/stats', { params }),
    getById: (id, params = {}) => api.get(`/products/${id}`, { params }).then(normalizeProductResponse),
    getBrands: () => api.get('/products/brands'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    getLocalCatalog: () => [],
};

export const categoryApi = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const brandApi = {
    getByCategory: (categoryId) => api.get('/brands', { params: categoryId ? { categoryId } : {} }),
};

export const orderApi = {
    create: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my'),
    getAll: (params = {}) => withItems(api.get('/orders/all', { params })),
    getById: (id) => api.get(`/orders/${id}`),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
    reviewCancellation: (id, data) => api.put(`/orders/${id}/cancellation-review`, data),
};

export const specApi = {
    getDefinitions: (categoryId) => api.get('/specs/definitions', { params: { categoryId } }),
    createDefinition: (data) => api.post('/specs/definitions', data),
    updateDefinition: (id, data) => api.put(`/specs/definitions/${id}`, data),
    deleteDefinition: (id) => api.delete(`/specs/definitions/${id}`),
    createOption: (data) => api.post('/specs/options', data),
    updateOption: (id, data) => api.put(`/specs/options/${id}`, data),
    deleteOption: (id) => api.delete(`/specs/options/${id}`),
    getProductSpecs: (productId) => api.get(`/specs/products/${productId}`),
    updateProductSpecs: (productId, values = []) => api.put(`/specs/products/${productId}`, values),
};

export const warrantyApi = {
    lookup: (paramsOrSerial) => {
        if (typeof paramsOrSerial === 'string') {
            return api.get('/warranty/lookup', { params: { serialOrImei: paramsOrSerial } });
        }
        return api.get('/warranty/lookup', { params: paramsOrSerial || {} });
    },
    getMy: () => api.get('/warranty/my'),
    activate: (warrantyId) => api.post('/warranty/activate', { warrantyId }),
    activateAdmin: (warrantyId) => api.post('/warranty/activate-admin', { warrantyId }),
    activatePublic: (data) => api.post('/warranty/activate-public', data),
    getAll: (params = {}) => withItems(api.get('/warranty/all', { params })),
    getMyClaims: (params = {}) => api.get('/warranty/claims/my', { params }),
    createClaim: (data) => api.post('/warranty/claims', data),
    getClaimsAll: (params = {}) => withItems(api.get('/warranty/claims/all', { params })),
    updateClaimStatus: (id, data) => api.put(`/warranty/claims/${id}/status`, data),
    getClaimUpdates: (id) => api.get(`/warranty/claims/${id}/updates`),
};

export const notificationApi = {
    getMy: (params = {}) => api.get('/notifications/my', { params }),
    getUnreadCount: () => api.get('/notifications/my/unread-count'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/my/read-all'),
};

export const ticketApi = {
    getMy: () => api.get('/tickets/my'),
    getAll: (params = {}) => withItems(api.get('/tickets/all', { params })),
    getPublicByProduct: (productId, params = {}) => api.get(`/tickets/public/by-product/${productId}`, { params }),
    create: (data) => api.post('/tickets', data),
    addUpdate: (id, data) => api.post(`/tickets/${id}/updates`, data),
};

export const repairApi = {
    getAll: (params = {}) => withItems(api.get('/repairs', { params })),
    getMy: (params = {}) => withItems(api.get('/repairs/my', { params })),
    getMyById: (id) => api.get(`/repairs/my/${id}`),
    getMyUpdates: (id) => api.get(`/repairs/my/${id}/updates`),
    intake: (data) => api.post('/repairs/intake', data),
    update: (id, data) => {
        if (data?.statusAfter) {
            return api.put(`/repairs/${id}/status`, {
                status: data.statusAfter,
                note: data.message || data.note || null,
            });
        }
        return api.put(`/repairs/${id}`, data);
    },
};

export const financeApi = {
    getPartners: () => api.get('/finance/partners'),
};

export const paymentApi = {
    createSession: (orderId, amount) => api.post('/payments/sessions', { orderId, amount }),
    createPendingSession: (orderPayload, amount) => api.post('/payments/sessions', { orderPayload, amount }),
    getStatus: (sessionId) => api.get(`/payments/${sessionId}/status`),
    getDetail: (sessionId) => api.get(`/payments/${sessionId}/detail`),
};

export const inventoryApi = {
    createReceipt: (data) => api.post('/inventory/receipts', data),
    getSuppliers: (params = {}) => withItems(api.get('/suppliers', { params })),
    createSupplier: (data) => api.post('/suppliers', data),
    updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
    deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
    getStockItems: (params = {}) => api.get('/inventory/stock-items', { params }),
    getAgedStock: (daysThreshold = 90) => api.get('/inventory/aged-stock', { params: { minDays: daysThreshold } }),
    lookupStockItem: (serial) => api.get('/inventory/stock-items/lookup', { params: { serialOrImei: serial } }),
    assignStockItems: (data) => api.post('/inventory/assign-stock-items', data),
    returnItem: (data) => api.post('/inventory/returns', data),
    reviewReturn: (id, data) => api.put(`/inventory/returns/${id}/review`, {
        approved: true,
        reviewNote: data?.reviewNote || 'Admin duyet tra hang',
    }),
    restockReturn: (id, data) => api.put(`/inventory/returns/${id}/restock`, {
        restockStatus: data?.statusAfter || 'InStock',
        note: data?.note || null,
    }),
};

export const supplierApi = {
    getAll: (params = {}) => withItems(api.get('/suppliers', { params })),
    create: (data) => api.post('/suppliers', data),
    update: (id, data) => api.put(`/suppliers/${id}`, data),
    delete: (id) => api.delete(`/suppliers/${id}`),
    toggleActive: (id) => api.put(`/suppliers/${id}/toggle-active`),
};

export const categorySupplierApi = {
    getAll: () => api.get('/category-suppliers'),
    getByCategory: (categoryId) => api.get(`/category-suppliers/category/${categoryId}`),
};

export const recommendationApi = {
    getCrossSell: (productId, maxItems = 6) => api.get('/recommendations/cross-sell', { params: { productId, maxItems } }),
    getAutoCrossSell: (productId, maxItems = 6) => api.get('/recommendations/auto-cross-sell', { params: { productId, maxItems } }),
    setCrossSell: (productId, productIds = []) => api.put('/recommendations/cross-sell', { productIds }, { params: { productId } }),
};

export const bannerApi = {
    getActive: (position = 1) => api.get('/banners/active', { params: { position } }),
    getAll: (params = {}) => api.get('/banners', { params }),
    getById: (id) => api.get(`/banners/${id}`),
    create: (data) => api.post('/banners', data),
    update: (id, data) => api.put(`/banners/${id}`, data),
    delete: (id) => api.delete(`/banners/${id}`),
    toggle: (id) => api.put(`/banners/${id}/toggle`),
    trackClick: (id) => api.post(`/banners/${id}/click`),
    trackView: (id) => api.post(`/banners/${id}/view`),
};

export default api;
