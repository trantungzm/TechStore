import axios from 'axios';

const API_BASE_URL = '/api';
const DEMO_DB_KEY = 'basecore_demo_db';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const createResponse = (data) => Promise.resolve({ data });

const isBackendUnavailable = (error) =>
    !error?.response ||
    error?.code === 'ERR_NETWORK' ||
    error?.response?.status === 404 ||
    error?.response?.status === 502 ||
    error?.response?.status === 504 ||
    error?.response?.data?.message?.includes?.('Backend not available');

const createDemoDb = () => {
    const users = [
        {
            id: '11111111-1111-1111-1111-111111111111',
            username: 'admin',
            password: 'admin123',
            name: 'Administrator',
            email: 'admin@basecore.local',
            phone: '0123456789',
            position: 'Admin',
            isActive: true,
            userType: 1,
            created: new Date().toISOString(),
        },
        {
            id: '22222222-2222-2222-2222-222222222222',
            username: 'user',
            password: 'user123',
            name: 'Demo User',
            email: 'user@basecore.local',
            phone: '0987654321',
            position: 'Customer',
            isActive: true,
            userType: 0,
            created: new Date().toISOString(),
        },
    ];

    // Add 20+ demo users
    for (let i = 1; i <= 25; i++) {
        users.push({
            id: `user-${i}-${i}${i}${i}${i}-${i}${i}${i}${i}-${i}${i}${i}${i}${i}${i}`,
            username: `user${i}`,
            password: 'pass123',
            name: `Customer ${i}`,
            email: `customer${i}@example.com`,
            phone: `090000000${String(i).padStart(2, '0')}`,
            position: 'Customer',
            isActive: true,
            userType: 0,
            created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    const categories = [
        { id: 1, name: 'Smartphone', description: 'Điện thoại và thiết bị di động' },
        { id: 2, name: 'Laptop', description: 'Laptop và máy tính xách tay' },
        { id: 3, name: 'Accessories', description: 'Phụ kiện điện tử' },
        { id: 4, name: 'Gaming', description: 'Thiết bị cho game thủ' },
        { id: 5, name: 'Tablet', description: 'Máy tính bảng' },
        { id: 6, name: 'Smartwatch', description: 'Đồng hồ thông minh' },
        { id: 7, name: 'Camera', description: 'Máy ảnh và quay video' },
        { id: 8, name: 'Audio', description: 'Loa và tai nghe' },
    ];

    const products = [
        { id: 1, name: 'iPhone 15 Pro', price: 28990000, stock: 12, categoryId: 1, description: 'Flagship Apple smartphone', imageUrl: '' },
        { id: 2, name: 'Samsung Galaxy S24', price: 21990000, stock: 15, categoryId: 1, description: 'Android flagship phone', imageUrl: '' },
        { id: 3, name: 'iPhone 15', price: 22990000, stock: 20, categoryId: 1, description: 'iPhone standard model', imageUrl: '' },
        { id: 4, name: 'Xiaomi 14 Ultra', price: 18990000, stock: 18, categoryId: 1, description: 'Budget flagship phone', imageUrl: '' },
        { id: 5, name: 'Dell XPS 15', price: 35990000, stock: 8, categoryId: 2, description: 'High-end productivity laptop', imageUrl: '' },
        { id: 6, name: 'MacBook Air M3', price: 31990000, stock: 10, categoryId: 2, description: 'Lightweight Apple laptop', imageUrl: '' },
        { id: 7, name: 'ASUS ROG Gaming', price: 29990000, stock: 7, categoryId: 2, description: 'Gaming laptop with RTX 4070', imageUrl: '' },
        { id: 8, name: 'HP Pavilion 15', price: 15990000, stock: 25, categoryId: 2, description: 'Budget laptop for everyday use', imageUrl: '' },
        { id: 9, name: 'AirPods Pro', price: 5990000, stock: 25, categoryId: 3, description: 'Wireless earbuds', imageUrl: '' },
        { id: 10, name: 'Mechanical Keyboard', price: 2490000, stock: 18, categoryId: 4, description: 'RGB mechanical keyboard', imageUrl: '' },
        { id: 11, name: 'Gaming Mouse', price: 990000, stock: 30, categoryId: 4, description: '16000 DPI gaming mouse', imageUrl: '' },
        { id: 12, name: 'iPad Pro 12.9', price: 25990000, stock: 14, categoryId: 5, description: 'Large tablet for professionals', imageUrl: '' },
        { id: 13, name: 'Samsung Galaxy Tab S9', price: 19990000, stock: 12, categoryId: 5, description: 'High-end Android tablet', imageUrl: '' },
        { id: 14, name: 'Apple Watch Series 9', price: 9990000, stock: 16, categoryId: 6, description: 'Premium smartwatch', imageUrl: '' },
        { id: 15, name: 'Samsung Galaxy Watch 6', price: 7990000, stock: 20, categoryId: 6, description: 'Android smartwatch', imageUrl: '' },
        { id: 16, name: 'Canon EOS R5', price: 64990000, stock: 5, categoryId: 7, description: 'Professional mirrorless camera', imageUrl: '' },
        { id: 17, name: 'Sony A7IV', price: 44990000, stock: 8, categoryId: 7, description: 'Full-frame mirrorless camera', imageUrl: '' },
        { id: 18, name: 'JBL PartyBox 310', price: 11990000, stock: 6, categoryId: 8, description: 'Portable party speaker', imageUrl: '' },
        { id: 19, name: 'Bose QuietComfort 45', price: 8990000, stock: 14, categoryId: 8, description: 'Noise-cancelling headphones', imageUrl: '' },
        { id: 20, name: 'OnePlus 12', price: 16990000, stock: 22, categoryId: 1, description: 'Fast 5G smartphone', imageUrl: '' },
        { id: 21, name: 'Nothing Phone 2', price: 12990000, stock: 19, categoryId: 1, description: 'Budget smartphone with unique design', imageUrl: '' },
        { id: 22, name: 'Lenovo ThinkPad X1', price: 34990000, stock: 9, categoryId: 2, description: 'Business laptop', imageUrl: '' },
        { id: 23, name: 'ASUS VivoBook 15', price: 13990000, stock: 28, categoryId: 2, description: 'Slim and lightweight laptop', imageUrl: '' },
        { id: 24, name: 'USB-C Hub 7-in-1', price: 790000, stock: 35, categoryId: 3, description: 'Multi-port USB hub', imageUrl: '' },
        { id: 25, name: 'Phone Stand', price: 190000, stock: 50, categoryId: 3, description: 'Universal phone holder', imageUrl: '' },
    ];

    const orders = [];
    const orderDetails = [];

    // Generate 100+ demo orders
    for (let i = 1; i <= 120; i++) {
        const userId = users[Math.floor(Math.random() * (users.length - 2)) + 2]?.id;
        const statuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
        const orderId = 1000 + i;
        
        orders.push({
            id: orderId,
            userId: userId,
            orderDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: Math.floor(Math.random() * 100000000) + 5000000,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            deliveryAddress: `123 Street ${i}, District ${(i % 10) + 1}, City`,
            notes: `Order note ${i}`,
        });

        // Add 1-3 order details per order
        const itemCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < itemCount; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;
            
            orderDetails.push({
                id: `${orderId}-${j + 1}`,
                orderId: orderId,
                productId: product.id,
                quantity: quantity,
                unitPrice: product.price,
                totalPrice: product.price * quantity,
            });
        }
    }

    return {
        users,
        categories,
        products,
        orders,
        orderDetails,
    };
};

const getDemoDb = () => {
    // Always create fresh demo data (don't use localStorage cache)
    // This ensures the latest data is always displayed
    const freshDb = createDemoDb();
    
    // But preserve any user-created data (orders, modified users, etc)
    const stored = localStorage.getItem(DEMO_DB_KEY);
    let isModified = false;
    
    if (stored) {
        try {
            const storedDb = JSON.parse(stored);
            // Only preserve orders that were created, not the base data
            if (storedDb.orders && storedDb.orders.length > 0) {
                // Check auto-cancel/refund rules
                const now = new Date();
                storedDb.orders.forEach(order => {
                    if (order.status === 'Cancel Requested' && order.cancelRequestedAt) {
                        const requestTime = new Date(order.cancelRequestedAt);
                        const diffMs = now - requestTime;
                        const diffMins = diffMs / 60000;
                        const diffHours = diffMs / 3600000;
                        
                        // Rule: Cancel Requested, if previously Pending/Confirmed, auto accept after 5 mins
                        // But since we can't track previous status easily here without another field, let's assume
                        // we can auto accept any Cancel Request older than 24 hours, or 5 mins for simulation
                        
                        // We will simulate 5 minutes auto-accept if no admin action
                        // (Realistically, pending/confirmed is 5m, shipped is 24h. We'll simplify for the demo: 
                        // if > 5 minutes, auto Cancelled to show the user the flow).
                        if (diffMins >= 5) {
                            order.status = 'Cancelled & Refunded';
                            isModified = true;
                        }
                    }
                });
                
                freshDb.orders = storedDb.orders;
                freshDb.orderDetails = storedDb.orderDetails || [];
            }
        } catch (e) {
            console.error('Failed to parse stored demo db');
        }
    }
    
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(freshDb));
    return freshDb;
};

const saveDemoDb = (db) => {
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
    return db;
};

const nextNumericId = (items) => (items.length ? Math.max(...items.map((x) => Number(x.id))) + 1 : 1);
const nextGuid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const currentUser = () => JSON.parse(localStorage.getItem('user') || 'null');
const demoToken = (user) => `demo-token-${user.id}-${user.role}`;

const mapUserResponse = (user) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    position: user.position,
    isActive: user.isActive,
    userType: user.userType,
    created: user.created,
});

const enrichProducts = (db, products) =>
    products.map((product) => ({
        ...product,
        category: db.categories.find((category) => category.id === product.categoryId) || null,
    }));

const fallback = async (request, demoRequest) => {
    try {
        return await request();
    } catch (error) {
        if (isBackendUnavailable(error)) {
            return demoRequest();
        }
        throw error;
    }
};

export const authApi = {
    login: (username, password) => fallback(
        () => api.post('/auth/login', { username, password })
            .then(response => {
                // Map PascalCase response from backend to camelCase
                const data = response.data;
                return {
                    data: {
                        token: data.Token || data.token,
                        userId: data.UserId || data.userId,
                        username: data.Username || data.username,
                        name: data.Name || data.name,
                        email: data.Email || data.email,
                        role: data.Role || data.role,
                        expiresIn: data.ExpiresIn || data.expiresIn,
                    }
                };
            }),
        () => {
            const db = getDemoDb();
            const user = db.users.find((x) => x.username === username && x.password === password && x.isActive);
            if (!user) {
                return Promise.reject({ response: { data: { message: 'Invalid username or password' } } });
            }

            return createResponse({
                token: demoToken({ id: user.id, role: user.userType === 1 ? 'Admin' : 'User' }),
                userId: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.userType === 1 ? 'Admin' : 'User',
                expiresIn: 28800,
            });
        }
    ),
    register: (data) => fallback(
        () => api.post('/auth/register', data)
            .then(response => {
                // Map response from backend
                const respData = response.data;
                return {
                    data: {
                        message: respData.message || respData.Message,
                        userId: respData.userId || respData.UserId,
                    }
                };
            }),
        () => {
            const db = getDemoDb();
            if (db.users.some((x) => x.username === data.username)) {
                return Promise.reject({ response: { data: { message: 'Username already exists' } } });
            }

            const user = {
                id: nextGuid(),
                username: data.username,
                password: data.password,
                name: data.name || data.username,
                email: data.email || '',
                phone: data.phone || '',
                position: 'Customer',
                isActive: true,
                userType: 0,
                created: new Date().toISOString(),
            };

            db.users.push(user);
            saveDemoDb(db);
            return createResponse({ message: 'Registration successful', userId: user.id });
        }
    ),
};

export const userApi = {
    getAll: (params = {}) => fallback(
        () => api.get('/users', { params }),
        () => {
            const db = getDemoDb();
            const keyword = (params.keyword || '').toLowerCase();
            const page = Number(params.page || 1);
            const pageSize = Number(params.pageSize || 10);
            const filtered = db.users.filter((user) =>
                !keyword ||
                [user.username, user.name, user.email, user.phone].some((value) => (value || '').toLowerCase().includes(keyword))
            );
            const data = filtered.slice((page - 1) * pageSize, page * pageSize).map(mapUserResponse);
            return createResponse({
                data,
                totalCount: filtered.length,
                page,
                pageSize,
                totalPages: Math.ceil(filtered.length / pageSize) || 1,
            });
        }
    ),
    getById: (id) => fallback(
        () => api.get(`/users/${id}`),
        () => {
            const db = getDemoDb();
            const user = db.users.find((x) => x.id === id);
            return createResponse(mapUserResponse(user));
        }
    ),
    create: (data) => fallback(
        () => api.post('/users', data),
        () => {
            const db = getDemoDb();
            const user = {
                id: nextGuid(),
                username: data.username,
                password: data.password,
                name: data.name || data.username,
                email: data.email || '',
                phone: data.phone || '',
                position: data.position || '',
                isActive: true,
                userType: Number(data.userType || 0),
                created: new Date().toISOString(),
            };
            db.users.push(user);
            saveDemoDb(db);
            return createResponse(mapUserResponse(user));
        }
    ),
    update: (id, data) => fallback(
        () => api.put(`/users/${id}`, data),
        () => {
            const db = getDemoDb();
            const user = db.users.find((x) => x.id === id);
            Object.assign(user, data);
            saveDemoDb(db);
            return createResponse(mapUserResponse(user));
        }
    ),
    delete: (id) => fallback(
        () => api.delete(`/users/${id}`),
        () => {
            const db = getDemoDb();
            db.users = db.users.filter((x) => x.id !== id);
            saveDemoDb(db);
            return createResponse({ message: 'Deleted' });
        }
    ),
};

export const productApi = {
    getAll: (params = {}) => fallback(
        () => api.get('/products', { params }),
        () => {
            const db = getDemoDb();
            const keyword = (params.keyword || '').toLowerCase();
            const categoryId = params.categoryId ? Number(params.categoryId) : null;
            const minPrice = params.minPrice ? Number(params.minPrice) : null;
            const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;
            const inStock = params.inStock === true || params.inStock === 'true';
            const sortBy = params.sortBy || '';
            const page = Number(params.page || 1);
            const pageSize = Number(params.pageSize || 10);
            let items = enrichProducts(db, db.products);
            if (keyword) {
                items = items.filter((p) => p.name.toLowerCase().includes(keyword) || (p.description || '').toLowerCase().includes(keyword));
            }
            if (categoryId) {
                items = items.filter((p) => p.categoryId === categoryId);
            }
            if (inStock) {
                items = items.filter((p) => Number(p.stock || 0) > 0);
            }
            if (minPrice !== null) {
                items = items.filter((p) => p.price >= minPrice);
            }
            if (maxPrice !== null) {
                items = items.filter((p) => p.price <= maxPrice);
            }
            if (sortBy === 'price_asc') {
                items = items.slice().sort((a, b) => (a.price || 0) - (b.price || 0));
            } else if (sortBy === 'price_desc') {
                items = items.slice().sort((a, b) => (b.price || 0) - (a.price || 0));
            } else if (sortBy === 'name_asc') {
                items = items.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            } else if (sortBy === 'name_desc') {
                items = items.slice().sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
            }
            const totalCount = items.length;
            items = items.slice((page - 1) * pageSize, page * pageSize);
            return createResponse({
                items,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize) || 1,
            });
        }
    ),
    search: (params) => productApi.getAll(params),
    getById: (id) => fallback(
        () => api.get(`/products/${id}`),
        () => {
            const db = getDemoDb();
            const product = enrichProducts(db, db.products).find((x) => x.id === Number(id));
            return createResponse(product);
        }
    ),
    create: (data) => fallback(
        () => api.post('/products', data),
        () => {
            const db = getDemoDb();
            const product = { id: nextNumericId(db.products), ...data };
            db.products.push(product);
            saveDemoDb(db);
            return createResponse(product);
        }
    ),
    update: (id, data) => fallback(
        () => api.put(`/products/${id}`, data),
        () => {
            const db = getDemoDb();
            const product = db.products.find((x) => x.id === Number(id));
            Object.assign(product, data);
            saveDemoDb(db);
            return createResponse(product);
        }
    ),
    delete: (id) => fallback(
        () => api.delete(`/products/${id}`),
        () => {
            const db = getDemoDb();
            db.products = db.products.filter((x) => x.id !== Number(id));
            saveDemoDb(db);
            return createResponse({ message: 'Deleted' });
        }
    ),
};

export const categoryApi = {
    getAll: () => fallback(
        () => api.get('/categories'),
        () => createResponse(getDemoDb().categories)
    ),
    getById: (id) => fallback(
        () => api.get(`/categories/${id}`),
        () => createResponse(getDemoDb().categories.find((x) => x.id === Number(id)))
    ),
    create: (data) => fallback(
        () => api.post('/categories', data),
        () => {
            const db = getDemoDb();
            const category = { id: nextNumericId(db.categories), ...data };
            db.categories.push(category);
            saveDemoDb(db);
            return createResponse(category);
        }
    ),
    update: (id, data) => fallback(
        () => api.put(`/categories/${id}`, data),
        () => {
            const db = getDemoDb();
            const category = db.categories.find((x) => x.id === Number(id));
            Object.assign(category, data);
            saveDemoDb(db);
            return createResponse(category);
        }
    ),
    delete: (id) => fallback(
        () => api.delete(`/categories/${id}`),
        () => {
            const db = getDemoDb();
            db.categories = db.categories.filter((x) => x.id !== Number(id));
            saveDemoDb(db);
            return createResponse({ message: 'Deleted' });
        }
    ),
};

export const orderApi = {
    create: (data) => fallback(
        () => api.post('/orders', data),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            if (!user) {
                return Promise.reject({ response: { status: 401, data: { message: 'Unauthorized' } } });
            }
            const orderId = nextNumericId(db.orders);
            const details = data.items.map((item, index) => {
                const product = db.products.find((x) => x.id === item.productId);
                product.stock -= item.quantity;
                return {
                    id: (db.orderDetails.length ? Math.max(...db.orderDetails.map((x) => x.id)) : 0) + index + 1,
                    orderId,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: product.price,
                    product,
                };
            });
            const totalAmount = details.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            const order = {
                id: orderId,
                userId: user.userId,
                customerName: data.customerName || user.name || '',
                customerPhone: data.customerPhone || '',
                customerEmail: data.customerEmail || user.email || '',
                orderDate: new Date().toISOString(),
                totalAmount,
                status: data.paymentMethod === 'cod' ? 'Pending' : 'Confirmed',
                paymentMethod: data.paymentMethod || 'bank',
                paymentStatus: data.paymentMethod === 'cod' ? 'Unpaid' : 'Paid',
                transactionId: data.paymentMethod === 'cod' ? null : `TXN-${Date.now()}`,
                shippingAddress: data.shippingAddress || '',
                notes: data.notes || '',
                updatedBy: user.username,
                updatedAt: new Date().toISOString(),
                timeline: [
                    {
                        status: 'Created',
                        timestamp: new Date().toISOString(),
                        by: user.username || 'System',
                        note: 'Order placed by customer'
                    },
                    ...(data.paymentMethod !== 'cod' ? [{
                        status: 'Confirmed',
                        timestamp: new Date().toISOString(),
                        by: 'System (Payment Gateway)',
                        note: `Payment verified. TXN: TXN-${Date.now()}`
                    }] : [])
                ]
            };
            db.orders.push(order);
            db.orderDetails.push(...details);
            saveDemoDb(db);
            return createResponse({ order, details });
        }
    ),
    getMyOrders: () => fallback(
        () => api.get('/orders'),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            return createResponse(db.orders.filter((x) => x.userId === user?.userId));
        }
    ),
    getAll: () => fallback(
        () => api.get('/orders/all'),
        () => createResponse(getDemoDb().orders)
    ),
    getById: (id) => fallback(
        () => api.get(`/orders/${id}`),
        () => {
            const db = getDemoDb();
            const order = db.orders.find((x) => x.id.toString() === id.toString());
            if (!order) {
                return Promise.reject({ response: { data: { message: 'Order not found' } } });
            }
            const details = db.orderDetails.filter((x) => x.orderId.toString() === id.toString()).map(d => ({
                ...d,
                product: db.products.find(p => p.id === d.productId) || { name: 'Unknown Product', imageUrl: '' }
            }));
            return createResponse({ order, details });
        }
    ),
    updateStatus: (id, data) => fallback(
        () => api.put(`/orders/${id}/status`, data),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            const order = db.orders.find((x) => x.id.toString() === id.toString());
            
            if (order) {
                const currentStatus = order.status;
                const newStatus = data.status;
                
                // State Machine Validation (Basic Backend Protection)
                const invalidTransitions = {
                    'Completed': ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Cancelled'],
                    'Cancelled': ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed'],
                    'Cancelled & Refunded': ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed']
                };
                
                if (invalidTransitions[currentStatus]?.includes(newStatus)) {
                    return Promise.reject({ 
                        response: { 
                            status: 400, 
                            data: { message: `Cannot update ${currentStatus} order to ${newStatus}` } 
                        } 
                    });
                }
                
                order.status = newStatus;
                order.updatedBy = user?.username || 'System';
                order.updatedAt = new Date().toISOString();
                
                order.timeline = order.timeline || [];
                order.timeline.push({
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    by: user?.username || 'System',
                    note: `Status updated to ${newStatus}`
                });

                if (newStatus === 'Completed' && order.paymentStatus === 'Unpaid') {
                    order.paymentStatus = 'Paid';
                }
                if (newStatus === 'Cancelled & Refunded') {
                    order.paymentStatus = 'Refunded';
                }

                saveDemoDb(db);
            }
            return createResponse(order);
        }
    ),
    cancel: (id, data) => fallback(
        () => api.put(`/orders/${id}/cancel`, data),
        () => {
            const db = getDemoDb();
            const order = db.orders.find((x) => x.id.toString() === id.toString());
            
            if (order) {
                order.cancelReason = data?.reason || '';
                order.cancelRequestedAt = new Date().toISOString();
                
                if (['Pending', 'Confirmed'].includes(order.status)) {
                    order.status = 'Cancel Requested';
                } else {
                    order.status = 'Cancel Requested';
                }
                
                saveDemoDb(db);
            }
            return createResponse({ message: 'Cancel requested', order });
        }
    ),
};

export default api;
