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
    error?.response?.status === 500 ||
    error?.response?.status === 503 ||
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
            role: 'Admin',
            isActive: true,
            userType: 1,
            created: new Date().toISOString(),
        },
        {
            id: '33333333-3333-3333-3333-333333333333',
            username: 'tech',
            password: 'tech123',
            name: 'Technical Staff',
            email: 'tech@basecore.local',
            phone: '0909009009',
            position: 'Technical Staff',
            role: 'Technical',
            isActive: true,
            userType: 0,
            created: new Date().toISOString(),
        },
        {
            id: '44444444-4444-4444-4444-444444444444',
            username: 'stock',
            password: 'stock123',
            name: 'Stock Manager',
            email: 'stock@basecore.local',
            phone: '0911001100',
            position: 'Stock Manager',
            role: 'Warehouse',
            isActive: true,
            userType: 0,
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
            role: 'User',
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
            role: 'User',
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

    const productRecommendations = [
        { id: 1, productId: 1, recommendedProductId: 9, type: 'cross-sell', priority: 1 },
        { id: 2, productId: 1, recommendedProductId: 25, type: 'cross-sell', priority: 2 },
        { id: 3, productId: 2, recommendedProductId: 25, type: 'cross-sell', priority: 1 },
        { id: 4, productId: 5, recommendedProductId: 24, type: 'cross-sell', priority: 1 },
        { id: 5, productId: 6, recommendedProductId: 24, type: 'cross-sell', priority: 1 },
        { id: 6, productId: 7, recommendedProductId: 10, type: 'cross-sell', priority: 1 },
        { id: 7, productId: 7, recommendedProductId: 11, type: 'cross-sell', priority: 2 },
    ];

    const orders = [];
    const orderDetails = [];

    // Generate 100+ demo orders with realistic admin data
    for (let i = 1; i <= 120; i++) {
        const selectedUser = users[Math.floor(Math.random() * (users.length - 2)) + 2];
        const userId = selectedUser?.id;
        const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
        const orderId = 1000 + i;
        const orderDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMethod = Math.random() > 0.55 ? 'cod' : 'bank';
        const paymentStatus = status === 'Cancelled'
            ? (paymentMethod === 'cod' ? 'Cancelled' : 'Refunded')
            : paymentMethod === 'cod'
                ? (status === 'Completed' ? 'Paid' : 'Unpaid')
                : 'Paid';
        const updatedAt = new Date(orderDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString();
        
        orders.push({
            id: orderId,
            userId: userId,
            customerName: selectedUser?.name || `Customer ${i}`,
            customerPhone: selectedUser?.phone || `0900000${String(i).padStart(4, '0')}`,
            customerEmail: selectedUser?.email || `customer${i}@example.com`,
            orderDate: orderDate.toISOString(),
            totalAmount: Math.floor(Math.random() * 100000000) + 5000000,
            status,
            paymentMethod,
            paymentStatus,
            transactionId: paymentMethod === 'bank' ? `TXN-DEMO-${orderId}` : null,
            shippingAddress: `123 Street ${i}, District ${(i % 10) + 1}, Ho Chi Minh City`,
            notes: `Order note ${i}`,
            updatedBy: ['admin', 'sale.manager', 'warehouse.staff'][i % 3],
            updatedAt,
            timeline: [
                {
                    status: 'Created',
                    timestamp: orderDate.toISOString(),
                    by: selectedUser?.username || 'customer',
                    note: 'Customer placed an order'
                },
                ...(paymentMethod === 'bank' ? [{
                    status: 'Confirmed',
                    timestamp: new Date(orderDate.getTime() + 15 * 60000).toISOString(),
                    by: 'system',
                    note: 'Payment verified automatically'
                }] : []),
                ...(status !== 'Pending' && status !== 'Confirmed' ? [{
                    status: 'Processing',
                    timestamp: new Date(orderDate.getTime() + 3 * 60 * 60000).toISOString(),
                    by: 'warehouse.staff',
                    note: 'Warehouse started preparing goods'
                }] : []),
                ...(status === 'Shipped' || status === 'Completed' ? [{
                    status: 'Shipped',
                    timestamp: new Date(orderDate.getTime() + 10 * 60 * 60000).toISOString(),
                    by: 'warehouse.staff',
                    note: 'Order handed over to carrier'
                }] : []),
                ...(status === 'Completed' ? [{
                    status: 'Completed',
                    timestamp: new Date(orderDate.getTime() + 40 * 60 * 60000).toISOString(),
                    by: 'system',
                    note: 'Order delivered successfully'
                }] : []),
                ...(status === 'Cancelled' ? [{
                    status: 'Cancelled',
                    timestamp: new Date(orderDate.getTime() + 4 * 60 * 60000).toISOString(),
                    by: 'admin',
                    note: 'Cancelled during verification'
                }] : [])
            ]
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

    const demoCustomerId = '22222222-2222-2222-2222-222222222222';
    const warranties = [
        {
            id: 1,
            userId: demoCustomerId,
            serialOrImei: '356938035643809',
            productId: 1,
            productName: products.find((p) => p.id === 1)?.name || 'iPhone 15 Pro',
            activatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Valid',
        },
        {
            id: 2,
            userId: demoCustomerId,
            serialOrImei: '490154203237518',
            productId: 6,
            productName: products.find((p) => p.id === 6)?.name || 'MacBook Air M3',
            activatedAt: new Date(Date.now() - 410 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Expired',
        },
    ];

    const tickets = [
        {
            id: 1,
            userId: demoCustomerId,
            subject: 'Warranty claim: screen flicker',
            description: 'Screen flickers occasionally. Please advise how to proceed.',
            serialOrImei: warranties[0].serialOrImei,
            status: 'Open',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updates: [
                {
                    message: 'I can provide video evidence if needed.',
                    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
                    by: 'Customer',
                },
                {
                    message: 'Please bring the device to our service center for inspection.',
                    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                    by: 'Support',
                    statusAfter: 'In Progress',
                },
            ],
        },
    ];

    return {
        users,
        categories,
        products,
        productRecommendations,
        orders,
        orderDetails,
        warranties,
        tickets,
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
                    if (order.status === 'CancelRequested' && order.cancelRequestedAt) {
                        const requestTime = new Date(order.cancelRequestedAt);
                        const diffMs = now - requestTime;
                        const diffMins = diffMs / 60000;

                        // Auto-approve only for early-stage orders to simulate real operations:
                        // - If user requested cancel while order was Pending/Confirmed, auto-approve after 5 minutes (no admin action)
                        // - If order was Processing/Shipping, keep it for admin review (no auto-approve)
                        const previousStatus = order.previousStatus || '';
                        const canAutoApprove = ['Pending', 'Confirmed'].includes(previousStatus);
                        if (canAutoApprove && diffMins >= 5) {
                            order.status = 'Cancelled';
                            order.paymentStatus = order.paymentMethod === 'cod' ? 'Cancelled' : 'Refunded';
                            appendOrderTimeline(order, 'Cancelled', 'system', 'Tự động duyệt hủy đơn');
                            isModified = true;
                        }
                    }
                });
                
                freshDb.orders = storedDb.orders;
                freshDb.orderDetails = storedDb.orderDetails || [];
            }

            if (Array.isArray(storedDb.warranties) && storedDb.warranties.length > 0) {
                freshDb.warranties = storedDb.warranties;
            }

            if (Array.isArray(storedDb.tickets) && storedDb.tickets.length > 0) {
                freshDb.tickets = storedDb.tickets;
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
const appendOrderTimeline = (order, status, by, note) => {
    order.timeline = order.timeline || [];
    order.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        by: by || 'System',
        note: note || '',
    });
};
const emitAdminOrdersUpdated = () => {
    try {
        if (typeof window === 'undefined') return;
        localStorage.setItem('basecore_admin_orders_updated_at', new Date().toISOString());
        window.dispatchEvent(new Event('basecore:admin-orders-updated'));
    } catch (e) {
        // ignore
    }
};

const unwrapPagedItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.Items)) return payload.Items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.Data)) return payload.Data;
    return [];
};

const resolveUserRole = (u) => {
    if (!u) return 'User';
    if (u.userType === 1) return 'Admin';
    const explicitRole = String(u.role || '').trim();
    if (explicitRole) {
        const key = explicitRole.toLowerCase();
        if (key === 'stockmanager' || key === 'warehouse') return 'Warehouse';
        if (key === 'tech' || key === 'technical') return 'Technical';
        if (key === 'warranty' || key === 'maintenance' || key === 'repair' || key === 'repairs') return 'Warranty';
        if (key === 'user') return 'User';
        if (key === 'admin') return 'Admin';
        return explicitRole;
    }
    const position = String(u.position || '').toLowerCase();
    if (position.includes('tech') || position.includes('technical') || position.includes('kỹ thuật') || position.includes('ky thuat')) {
        return 'Technical';
    }
    if (position.includes('warranty') || position.includes('repair') || position.includes('maintenance') || position.includes('bảo hành') || position.includes('bao hanh')) {
        return 'Warranty';
    }
    if (position.includes('stock') || position.includes('warehouse') || position.includes('kho')) {
        return 'Warehouse';
    }
    return 'User';
};

const mapUserResponse = (user) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    position: user.position,
    role: resolveUserRole(user),
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
    login: (username, password) => {
        const demoLogin = () => {
            const db = getDemoDb();
            const user = db.users.find((x) => x.username === username && x.password === password && x.isActive);
            if (!user) {
                return Promise.reject({ response: { data: { message: 'Invalid username or password' } } });
            }

            const resolveRole = (u) => {
                if (u.userType === 1) return 'Admin';
                const explicitRole = String(u.role || '').trim();
                if (explicitRole) {
                    const key = explicitRole.toLowerCase();
                    if (key === 'stockmanager' || key === 'warehouse') return 'Warehouse';
                    if (key === 'tech' || key === 'technical') return 'Technical';
                    if (key === 'warranty' || key === 'maintenance' || key === 'repair' || key === 'repairs') return 'Warranty';
                    if (key === 'user') return 'User';
                    if (key === 'admin') return 'Admin';
                    return explicitRole;
                }
                const position = String(u.position || '').toLowerCase();
                if (position.includes('tech') || position.includes('technical') || position.includes('kỹ thuật') || position.includes('ky thuat')) {
                    return 'Technical';
                }
                if (position.includes('warranty') || position.includes('repair') || position.includes('maintenance') || position.includes('bảo hành') || position.includes('bao hanh')) {
                    return 'Warranty';
                }
                if (position.includes('stock') || position.includes('warehouse') || position.includes('kho')) {
                    return 'Warehouse';
                }
                return 'User';
            };

            const role = resolveRole(user);

            return createResponse({
                token: demoToken({ id: user.id, role }),
                userId: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role,
                expiresIn: 28800,
            });
        };

        const db = getDemoDb();
        const demoUser = db.users.find((x) => x.username === username && x.password === password && x.isActive);
        if (demoUser) {
            return demoLogin();
        }

        return fallback(
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
            demoLogin
        );
    },
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
                role: data.role || '',
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

export const uploadApi = {
    uploadProductImages: (files) => fallback(
        () => {
            const form = new FormData();
            Array.from(files || []).forEach((file) => form.append('files', file));
            return api.post('/uploads/product-images', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        async () => {
            const list = Array.from(files || []);
            const urls = await Promise.all(list.map((file) => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => resolve('');
                reader.readAsDataURL(file);
            })));
            return createResponse({ urls: urls.filter(Boolean) });
        }
    ),
    uploadTicketAttachments: (files) => fallback(
        () => {
            const form = new FormData();
            Array.from(files || []).forEach((file) => form.append('files', file));
            return api.post('/uploads/ticket-attachments', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        async () => {
            const list = Array.from(files || []);
            const urls = await Promise.all(list.map((file) => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => resolve('');
                reader.readAsDataURL(file);
            })));
            return createResponse({ urls: urls.filter(Boolean) });
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
        () => api.get('/orders/all').then((res) => ({ ...res, data: unwrapPagedItems(res.data) })),
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
        () => api.put(`/orders/${id}/status`, data).then((res) => {
            emitAdminOrdersUpdated();
            return res;
        }),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            const order = db.orders.find((x) => x.id.toString() === id.toString());
            
            if (order) {
                const currentStatus = order.status;
                const newStatus = data.status;
                const note = data.note || '';
                const allowedTransitions = {
                    Pending: ['Confirmed', 'Cancelled', 'CancelRequested'],
                    Confirmed: ['Processing', 'Cancelled', 'CancelRequested'],
                    Processing: ['Shipping', 'Cancelled', 'CancelRequested'],
                    Shipping: ['Completed', 'CancelRequested'],
                    CancelRequested: ['Cancelled', 'CancelRejected'],
                    Completed: [],
                    Cancelled: [],
                    CancelRejected: [],
                };
                
                if (newStatus && !allowedTransitions[currentStatus]?.includes(newStatus) && currentStatus !== newStatus) {
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
                appendOrderTimeline(order, newStatus, user?.username || 'System', note || `Status updated to ${newStatus}`);

                if (newStatus === 'Completed' && order.paymentStatus === 'Unpaid') {
                    order.paymentStatus = 'Paid';
                }
                if (newStatus === 'Cancelled') {
                    order.paymentStatus = order.paymentMethod === 'cod' ? 'Cancelled' : 'Refunded';
                }
                if (data.paymentStatus) {
                    order.paymentStatus = data.paymentStatus;
                }
                if (data.restockItems) {
                    db.orderDetails
                        .filter((item) => item.orderId.toString() === id.toString())
                        .forEach((item) => {
                            const product = db.products.find((productItem) => productItem.id === item.productId);
                            if (product) {
                                product.stock = Number(product.stock || 0) + Number(item.quantity || 0);
                            }
                        });
                }

                saveDemoDb(db);
                emitAdminOrdersUpdated();
            }
            return createResponse(order);
        }
    ),
    cancel: (id, data) => fallback(
        () => api.put(`/orders/${id}/cancel`, data).then((res) => {
            emitAdminOrdersUpdated();
            return res;
        }),
        () => {
            const db = getDemoDb();
            const order = db.orders.find((x) => x.id.toString() === id.toString());
            
            if (order) {
                order.cancelReason = data?.reason || '';
                order.cancelRequestedAt = new Date().toISOString();
                order.previousStatus = order.status;
                order.status = 'CancelRequested';
                order.updatedBy = currentUser()?.username || 'customer';
                order.updatedAt = new Date().toISOString();
                appendOrderTimeline(order, 'CancelRequested', currentUser()?.username || 'customer', data?.reason || 'Khách yêu cầu hủy đơn');
                
                saveDemoDb(db);
                emitAdminOrdersUpdated();
            }
            return createResponse({ message: 'Cancel requested', order });
        }
    ),
    reviewCancellation: (id, data) => fallback(
        () => api.put(`/orders/${id}/cancellation-review`, data).then((res) => {
            emitAdminOrdersUpdated();
            return res;
        }),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            const order = db.orders.find((x) => x.id.toString() === id.toString());
            if (!order) {
                return Promise.reject({ response: { data: { message: 'Order not found' } } });
            }
            if (order.status !== 'CancelRequested') {
                return Promise.reject({ response: { data: { message: 'Order is not waiting for cancellation review' } } });
            }

            if (data.approved ?? data.approve) {
                order.status = 'Cancelled';
                order.paymentStatus = order.paymentMethod === 'cod' ? 'Cancelled' : 'Refunded';
                appendOrderTimeline(order, 'Cancelled', user?.username || 'admin', data.adminNote || data.note || 'Yêu cầu hủy đã được duyệt');
            } else {
                order.status = 'CancelRejected';
                appendOrderTimeline(order, order.status, user?.username || 'admin', data.adminNote || data.note || 'Yêu cầu hủy bị từ chối');
            }

            order.updatedBy = user?.username || 'admin';
            order.updatedAt = new Date().toISOString();
            saveDemoDb(db);
            emitAdminOrdersUpdated();
            return createResponse(order);
        }
    ),
};

export const specApi = {
    getDefinitions: (categoryId) => fallback(
        () => api.get('/specs/definitions', { params: { categoryId } }),
        () => createResponse([])
    ),
    getProductSpecs: (productId) => fallback(
        () => api.get(`/specs/products/${productId}`),
        () => createResponse([])
    ),
};

export const warrantyApi = {
    lookup: (serialOrImei) => fallback(
        () => api.get('/warranty/lookup', { params: { serialOrImei } }),
        () => {
            const db = getDemoDb();
            const value = String(serialOrImei || '').trim().toLowerCase();
            const match = (db.warranties || []).find((w) => String(w.serialOrImei || '').trim().toLowerCase() === value);
            if (!match) {
                return Promise.reject({ response: { data: { message: 'Warranty not found' } } });
            }
            return createResponse(match);
        }
    ),
    getMy: () => fallback(
        () => api.get('/warranty/my'),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            const uid = user?.userId || user?.id;
            if (!uid) return createResponse([]);
            return createResponse((db.warranties || []).filter((w) => String(w.userId || '') === String(uid)));
        }
    ),
};

export const notificationApi = {
    getMy: (params = {}) => fallback(
        () => api.get('/notifications/my', { params }),
        () => {
            const page = Number(params.page || 1);
            const pageSize = Number(params.pageSize || 10);
            return createResponse({
                items: [],
                totalCount: 0,
                page,
                pageSize,
                totalPages: 1,
            });
        }
    ),
    getUnreadCount: () => fallback(
        () => api.get('/notifications/my/unread-count'),
        () => createResponse({ count: 0 })
    ),
    markRead: (id) => fallback(
        () => api.put(`/notifications/${id}/read`),
        () => createResponse({ ok: true })
    ),
    markAllRead: () => fallback(
        () => api.put('/notifications/my/read-all'),
        () => createResponse({ count: 0 })
    ),
};

export const ticketApi = {
    getMy: () => fallback(
        () => api.get('/tickets/my'),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            const uid = user?.userId || user?.id;
            if (!uid) return createResponse([]);
            return createResponse((db.tickets || []).filter((t) => String(t.userId || '') === String(uid)));
        }
    ),
    getAll: (params = {}) => fallback(
        () => api.get('/tickets/all', { params }).then((res) => ({ ...res, data: unwrapPagedItems(res.data) })),
        () => createResponse(getDemoDb().tickets || [])
    ),
    create: (data) => fallback(
        () => api.post('/tickets', data),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            const uid = user?.userId || user?.id;
            if (!uid) {
                return Promise.reject({ response: { data: { message: 'Unauthorized' } } });
            }
            db.tickets = db.tickets || [];
            const ticket = {
                id: nextNumericId(db.tickets),
                userId: uid,
                subject: data?.subject || '',
                description: data?.description || '',
                serialOrImei: data?.serialOrImei || null,
                status: 'Open',
                priority: data?.priority || 'Normal',
                createdAt: new Date().toISOString(),
                updates: [],
            };
            db.tickets.push(ticket);
            saveDemoDb(db);
            return createResponse(ticket);
        }
    ),
    addUpdate: (id, data) => fallback(
        () => api.post(`/tickets/${id}/updates`, data),
        () => {
            const db = getDemoDb();
            db.tickets = db.tickets || [];
            const ticketId = Number(id);
            const ticket = db.tickets.find((t) => Number(t.id) === ticketId);
            if (!ticket) {
                return Promise.reject({ response: { data: { message: 'Ticket not found' } } });
            }
            ticket.updates = ticket.updates || [];
            const user = currentUser();
            const role = user?.role || 'User';
            const by = role === 'Admin' || role === 'Technical' || role === 'Warranty' || role === 'Warehouse' || role === 'StockManager' ? 'Support' : 'Customer';
            const update = {
                message: data?.message || '',
                statusAfter: data?.statusAfter || null,
                priorityAfter: data?.priorityAfter || null,
                createdAt: new Date().toISOString(),
                by,
            };
            ticket.updates.push(update);
            if (update.statusAfter) {
                ticket.status = update.statusAfter;
            }
            if (by === 'Support' && update.priorityAfter) {
                ticket.priority = update.priorityAfter;
            }
            saveDemoDb(db);
            return createResponse(ticket);
        }
    ),
};

export const repairApi = {
    getAll: (params = {}) => fallback(
        () => api.get('/repairs', { params }).then((res) => ({ ...res, data: unwrapPagedItems(res.data) })),
        () => createResponse([])
    ),
    intake: (data) => fallback(
        () => api.post('/repairs/intake', data),
        () => createResponse({ id: nextNumericId([]), ...data, status: 'Received', receivedAt: new Date().toISOString(), updates: [] })
    ),
    update: (id, data) => fallback(
        () => data?.statusAfter
            ? api.put(`/repairs/${id}/status`, { status: data.statusAfter, note: data.message || data.note || null })
            : api.put(`/repairs/${id}`, data),
        () => createResponse({ id, ...data })
    ),
};

export const financeApi = {
    getPartners: () => fallback(
        () => api.get('/finance/partners'),
        () => createResponse([])
    ),
};

export const inventoryApi = {
    createReceipt: (data) => fallback(
        () => api.post('/inventory/receipts', data),
        () => {
            const db = getDemoDb();
            db.stockItems = db.stockItems || [];
            db.goodsReceipts = db.goodsReceipts || [];
            db.goodsReceiptLines = db.goodsReceiptLines || [];

            const user = currentUser();
            const receipt = {
                id: nextNumericId(db.goodsReceipts),
                supplierName: data?.supplierName || null,
                receivedAt: new Date().toISOString(),
                createdByUserId: user?.userId || user?.id || null,
                lines: [],
            };

            const lines = Array.isArray(data?.lines) ? data.lines : [];
            if (lines.length === 0) {
                return Promise.reject({ response: { data: { message: 'Lines are required' } } });
            }

            lines.forEach((line) => {
                const productId = Number(line?.productId || 0);
                const quantity = Number(line?.quantity || 0);
                const unitCost = Number(line?.unitCost || 0);
                if (!productId || quantity <= 0) {
                    throw new Error('Invalid product/quantity');
                }

                const product = db.products.find((p) => Number(p.id) === productId);
                if (!product) {
                    throw new Error(`Product ${productId} not found`);
                }

                const requiresSerial = Boolean(product.requiresSerialTracking ?? product.RequiresSerialTracking);
                const rawSerials = Array.isArray(line?.serials) ? line.serials : [];
                const serials = rawSerials.map((x) => String(x || '').trim()).filter(Boolean);

                if (requiresSerial) {
                    if (serials.length !== quantity) {
                        throw new Error(`Product ${product.name || product.Name || productId} requires ${quantity} serials/IMEI`);
                    }
                    const existed = serials
                        .map((s) => db.stockItems.find((x) => String(x.serialOrImei || x.SerialOrImei) === s))
                        .filter(Boolean);
                    if (existed.length > 0) {
                        throw new Error(`Duplicate serial/IMEI: ${existed.map((x) => x.serialOrImei || x.SerialOrImei).join(', ')}`);
                    }
                    serials.forEach((serial) => {
                        db.stockItems.push({
                            id: nextNumericId(db.stockItems),
                            productId,
                            serialOrImei: serial,
                            status: 'InStock',
                            unitCost,
                            receivedAt: receipt.receivedAt,
                            soldAt: null,
                        });
                    });
                } else {
                    for (let i = 0; i < quantity; i++) {
                        const code = `INT-P${productId}-${receipt.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`.slice(0, 50);
                        db.stockItems.push({
                            id: nextNumericId(db.stockItems),
                            productId,
                            serialOrImei: code,
                            status: 'InStock',
                            unitCost,
                            receivedAt: receipt.receivedAt,
                            soldAt: null,
                        });
                    }
                }

                product.stock = Number(product.stock || 0) + quantity;
                receipt.lines.push({
                    productId,
                    quantity,
                    unitCost,
                    serials,
                });
            });

            db.goodsReceipts.push(receipt);
            saveDemoDb(db);
            return createResponse(receipt);
        }
    ),
    getStockItems: (params = {}) => fallback(
        () => api.get('/inventory/stock-items', { params }).then((res) => ({ ...res, data: unwrapPagedItems(res.data) })),
        () => {
            const db = getDemoDb();
            db.stockItems = db.stockItems || [];
            const productId = params?.productId ? Number(params.productId) : null;
            const status = params?.status ? String(params.status) : null;
            let list = db.stockItems.slice();
            if (productId) {
                list = list.filter((x) => Number(x.productId || x.ProductId) === productId);
            }
            if (status) {
                list = list.filter((x) => String(x.status || x.Status || '').toLowerCase() === status.toLowerCase());
            }
            list.sort((a, b) => String(b.receivedAt || b.ReceivedAt || '').localeCompare(String(a.receivedAt || a.ReceivedAt || '')));
            return createResponse(list);
        }
    ),
    getAgedStock: (daysThreshold = 90) => fallback(
        () => api.get('/inventory/aged-stock', { params: { daysThreshold } }),
        () => {
            const db = getDemoDb();
            db.stockItems = db.stockItems || [];
            const days = Number(daysThreshold || 90);
            const threshold = Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000;
            const list = db.stockItems
                .filter((x) => String(x.status || x.Status) === 'InStock')
                .filter((x) => {
                    const ts = Date.parse(String(x.receivedAt || x.ReceivedAt || ''));
                    return Number.isFinite(ts) && ts <= threshold;
                })
                .slice()
                .sort((a, b) => String(a.receivedAt || a.ReceivedAt || '').localeCompare(String(b.receivedAt || b.ReceivedAt || '')));
            return createResponse(list);
        }
    ),
    lookupStockItem: (serial) => fallback(
        () => api.get('/inventory/stock-items/lookup', { params: { serialOrImei: serial } }),
        () => {
            const db = getDemoDb();
            db.stockItems = db.stockItems || [];
            const s = String(serial || '').trim();
            if (!s) return Promise.reject({ response: { data: { message: 'Serial/IMEI is required' } } });
            const item = db.stockItems.find((x) => String(x.serialOrImei || x.SerialOrImei) === s);
            if (!item) return Promise.reject({ response: { status: 404, data: { message: 'Not found' } } });
            const product = (db.products || []).find((p) => Number(p.id) === Number(item.productId || item.ProductId));
            return createResponse({
                id: item.id ?? item.Id,
                productId: item.productId ?? item.ProductId,
                productName: product?.name || product?.Name || '',
                serialOrImei: item.serialOrImei || item.SerialOrImei,
                status: item.status || item.Status,
                receivedAt: item.receivedAt || item.ReceivedAt || null,
                soldAt: item.soldAt || item.SoldAt || null,
                orderId: null,
                customerName: null,
                customerPhone: null,
                customerEmail: null,
            });
        }
    ),
    returnItem: (data) => fallback(
        async () => {
            const created = await api.post('/inventory/returns', {
                serialOrImei: data?.serialOrImei,
                reason: data?.reason,
                condition: data?.condition || (data?.statusAfter === 'Damaged' ? 'Damaged' : 'Used'),
                refundAmount: data?.refundAmount || 0,
                note: data?.note || null,
            });
            const id = created.data?.id;
            if (!id) return created;
            await api.put(`/inventory/returns/${id}/review`, { approved: true, reviewNote: data?.reviewNote || 'Admin duyệt trả hàng' });
            return api.put(`/inventory/returns/${id}/restock`, { restockStatus: data?.statusAfter || 'InStock', note: data?.note || null });
        },
        () => {
            const db = getDemoDb();
            db.stockItems = db.stockItems || [];
            const serial = String(data?.serialOrImei || '').trim();
            if (!serial) {
                return Promise.reject({ response: { data: { message: 'Serial/IMEI is required' } } });
            }
            const item = db.stockItems.find((x) => String(x.serialOrImei || x.SerialOrImei) === serial);
            if (!item) {
                return Promise.reject({ response: { data: { message: 'Serial/IMEI not found' } } });
            }
            if (String(item.status || item.Status) !== 'Sold') {
                return Promise.reject({ response: { data: { message: 'Only sold items can be returned' } } });
            }
            const nextStatus = String(data?.statusAfter || data?.StatusAfter || 'InStock');
            item.status = nextStatus;
            const product = db.products.find((p) => Number(p.id) === Number(item.productId || item.ProductId));
            if (product) {
                if (String(nextStatus).toLowerCase() === 'instock') {
                    product.stock = Number(product.stock || 0) + 1;
                }
            }
            saveDemoDb(db);
            return createResponse(item);
        }
    ),
};

export const recommendationApi = {
    getCrossSell: (productId, maxItems = 6) => fallback(
        () => api.get('/recommendations/cross-sell', { params: { productId, maxItems } }),
        () => {
            const db = getDemoDb();
            const base = Number(productId);
            const links = (db.productRecommendations || [])
                .filter((x) => Number(x.productId) === base && x.type === 'cross-sell')
                .slice()
                .sort((a, b) => (a.priority || 0) - (b.priority || 0));
            const ids = links.map((x) => Number(x.recommendedProductId)).filter(Boolean).slice(0, Number(maxItems || 6));
            const enriched = enrichProducts(db, db.products);
            const map = new Map(enriched.map((p) => [Number(p.id), p]));
            const items = ids.map((id) => map.get(id)).filter(Boolean);
            return createResponse(items);
        }
    ),
    getAutoCrossSell: (productId, maxItems = 6) => fallback(
        () => api.get('/recommendations/auto-cross-sell', { params: { productId, maxItems } }),
        () => {
            const db = getDemoDb();
            const baseId = Number(productId);
            const base = db.products.find((p) => Number(p.id) === baseId);
            if (!base) return createResponse([]);

            const enriched = enrichProducts(db, db.products);
            const sameCategory = enriched
                .filter((p) => Number(p.id) !== baseId && Number(p.categoryId) === Number(base.categoryId))
                .slice(0, 3);
            const accessories = enriched
                .filter((p) => Number(p.id) !== baseId && Number(p.categoryId) !== Number(base.categoryId))
                .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
                .slice(0, Math.max(0, Number(maxItems || 6) - sameCategory.length));

            return createResponse([...sameCategory, ...accessories].slice(0, Number(maxItems || 6)));
        }
    ),
    setCrossSell: (productId, productIds = []) => fallback(
        () => api.put('/recommendations/cross-sell', { productIds }, { params: { productId } }),
        () => {
            const db = getDemoDb();
            const baseId = Number(productId);
            const list = Array.isArray(productIds) ? productIds.map((x) => Number(x)).filter((x) => x > 0 && x !== baseId) : [];
            const unique = Array.from(new Set(list)).slice(0, 12);

            db.productRecommendations = (db.productRecommendations || []).filter((x) => !(Number(x.productId) === baseId && x.type === 'cross-sell'));
            const nextId = nextNumericId(db.productRecommendations || []);
            unique.forEach((id, index) => {
                db.productRecommendations.push({
                    id: nextId + index,
                    productId: baseId,
                    recommendedProductId: id,
                    type: 'cross-sell',
                    priority: index + 1,
                });
            });
            saveDemoDb(db);
            return createResponse(db.productRecommendations.filter((x) => Number(x.productId) === baseId && x.type === 'cross-sell'));
        }
    ),
};

export default api;
