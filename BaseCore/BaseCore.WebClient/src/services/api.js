import axios from 'axios';

const API_BASE_URL = '/api';
const DEMO_DB_KEY = 'basecore_demo_db';
const DEMO_SETTINGS_KEY = 'basecore_demo_settings';

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
        // Let callers decide how to handle unauthorized responses. Several admin
        // screens intentionally fall back to the local demo store when the API is
        // unavailable or a demo token reaches a real backend endpoint.
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

const isDemoToken = () =>
    typeof localStorage !== 'undefined' && localStorage.getItem('token')?.startsWith('demo-token-');

const isAdminRoute = () =>
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

const createDemoDb = () => {
    const users = [
        {
            id: '11111111-1111-1111-1111-111111111111',
            username: 'admin',
            password: 'admin123',
            name: '',
            email: '',
            phone: '0123456789',
            dateOfBirth: null,
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
            dateOfBirth: '1998-03-15',
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
            dateOfBirth: '1996-07-22',
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
            dateOfBirth: '2001-05-10',
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
            dateOfBirth: `199${i % 10}-01-15`,
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
        { id: 1, name: 'iPhone 15 Pro', price: 28990000, stock: 12, categoryId: 1, description: 'Flagship Apple smartphone', imageUrl: '', supplierId: 1, backupSupplierId: 2, supplyType: 'Official', warrantyProvider: 'Apple' },
        { id: 2, name: 'Samsung Galaxy S24', price: 21990000, stock: 15, categoryId: 1, description: 'Android flagship phone', imageUrl: '', supplierId: 4, backupSupplierId: 1, supplyType: 'Official', warrantyProvider: 'Samsung Viet Nam' },
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

    // Admin order history starts empty in demo mode. New checkout orders are
    // still saved into localStorage and will appear in admin normally.

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
        suppliers: [
            { id: 1, supplierCode: 'SUP-SYNNEX-FPT', code: 'SUP-SYNNEX-FPT', name: 'Synnex FPT', supplierType: 'AuthorizedDistributor', phone: '19006600', email: 'contact@synnexfpt.com', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
            { id: 2, supplierCode: 'SUP-DIGIWORLD', code: 'SUP-DIGIWORLD', name: 'Digiworld', supplierType: 'AuthorizedDistributor', phone: '02839299959', email: 'contact@digiworld.com.vn', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
            { id: 3, supplierCode: 'SUP-PETROSETCO', code: 'SUP-PETROSETCO', name: 'Petrosetco', supplierType: 'Tier1Distributor', phone: '02854168686', email: 'contact@petrosetco.com.vn', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
            { id: 4, supplierCode: 'SUP-SAMSUNG-VN', code: 'SUP-SAMSUNG-VN', name: 'Samsung Viet Nam', supplierType: 'OfficialBrand', phone: '1800588899', email: 'support.vn@samsung.com', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
            { id: 5, supplierCode: 'SUP-XIAOMI-VN', code: 'SUP-XIAOMI-VN', name: 'Xiaomi Viet Nam', supplierType: 'OfficialBrand', phone: '1800400410', email: 'service.vn@xiaomi.com', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
            { id: 6, supplierCode: 'SUP-OPPO-VN', code: 'SUP-OPPO-VN', name: 'OPPO Viet Nam', supplierType: 'OfficialBrand', phone: '1800577776', email: 'support.vn@oppo.com', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
            { id: 7, supplierCode: 'SUP-SONY-VN', code: 'SUP-SONY-VN', name: 'Sony Viet Nam', supplierType: 'OfficialBrand', phone: '1800585885', email: 'support.vn@sony.com', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
            { id: 8, supplierCode: 'SUP-CANON-VN', code: 'SUP-CANON-VN', name: 'Canon Viet Nam', supplierType: 'OfficialBrand', phone: '1900558800', email: 'support@canon.com.vn', address: 'Vietnam', isActive: true, createdAt: new Date().toISOString() },
        ],
        categorySuppliers: [
            { id: 1, categoryId: 1, supplierId: 1, sortOrder: 1, isActive: true },
            { id: 2, categoryId: 1, supplierId: 2, sortOrder: 2, isActive: true },
            { id: 3, categoryId: 2, supplierId: 1, sortOrder: 1, isActive: true },
            { id: 4, categoryId: 2, supplierId: 2, sortOrder: 2, isActive: true },
            { id: 5, categoryId: 5, supplierId: 2, sortOrder: 1, isActive: true },
            { id: 6, categoryId: 5, supplierId: 4, sortOrder: 2, isActive: true },
            { id: 7, categoryId: 6, supplierId: 2, sortOrder: 1, isActive: true },
            { id: 8, categoryId: 6, supplierId: 4, sortOrder: 2, isActive: true },
            { id: 9, categoryId: 7, supplierId: 7, sortOrder: 1, isActive: true },
            { id: 10, categoryId: 7, supplierId: 8, sortOrder: 2, isActive: true },
            { id: 11, categoryId: 8, supplierId: 7, sortOrder: 1, isActive: true },
            { id: 12, categoryId: 8, supplierId: 2, sortOrder: 2, isActive: true },
        ],
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
                
                const preservedOrders = storedDb.orders.filter((order) => !isGeneratedDemoOrder(order));
                const preservedOrderIds = new Set(preservedOrders.map((order) => String(order.id)));
                freshDb.orders = preservedOrders;
                freshDb.orderDetails = (storedDb.orderDetails || []).filter((detail) => preservedOrderIds.has(String(detail.orderId)));
                if (preservedOrders.length !== storedDb.orders.length) {
                    isModified = true;
                }
            }

            if (Array.isArray(storedDb.warranties) && storedDb.warranties.length > 0) {
                freshDb.warranties = storedDb.warranties;
            }

            if (Array.isArray(storedDb.tickets) && storedDb.tickets.length > 0) {
                freshDb.tickets = storedDb.tickets;
            }

            if (Array.isArray(storedDb.users) && storedDb.users.length > 0) {
                freshDb.users = storedDb.users;
            }
        } catch (e) {
            console.error('Failed to parse stored demo db');
        }
    }

    freshDb.users = (freshDb.users || []).map((user) => {
        if (user.username === 'admin@cnthht.vn' || user.email === 'admin@cnthht.vn') {
            return { ...user, isActive: false, userType: 0, role: 'User' };
        }

        const normalizedRole = resolveUserRole(user);
        const normalizedUserType =
            normalizedRole === 'Admin' ? 1 :
            normalizedRole === 'Warehouse' ? 2 :
            normalizedRole === 'Technical' ? 3 : 0;

        return {
            ...user,
            role: normalizedRole,
            userType: normalizedUserType,
        };
    });
    
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(freshDb));
    return freshDb;
};

const saveDemoDb = (db) => {
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
    return db;
};

const isGeneratedDemoOrder = (order) => {
    const id = Number(order?.id);
    if (order?.source === 'checkout') return false;

    return id >= 1001 &&
        id <= 1120 &&
        (
            String(order?.notes || '').startsWith('Order note ') ||
            String(order?.transactionId || '').startsWith('TXN-DEMO-') ||
            String(order?.shippingAddress || '').startsWith('123 Street ')
        );
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
        if (key === 'stockmanager' || key === 'warehouse' || key === 'marketing') return 'Warehouse';
        if (key === 'tech' || key === 'technical' || key === 'warranty' || key === 'maintenance' || key === 'repair' || key === 'repairs' || key === 'customerservice') return 'Technical';
        if (key === 'user') return 'User';
        if (key === 'admin') return 'Admin';
        return explicitRole;
    }
    const position = String(u.position || '').toLowerCase();
    if (position.includes('tech') || position.includes('technical') || position.includes('kỹ thuật') || position.includes('ky thuat')) {
        return 'Technical';
    }
    if (position.includes('warranty') || position.includes('repair') || position.includes('maintenance') || position.includes('bảo hành') || position.includes('bao hanh')) {
        return 'Technical';
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
    phoneNumber: user.phone,
    dateOfBirth: user.dateOfBirth,
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
        supplierName: db.suppliers?.find((supplier) => Number(supplier.id) === Number(product.supplierId))?.name || null,
        backupSupplierName: db.suppliers?.find((supplier) => Number(supplier.id) === Number(product.backupSupplierId))?.name || null,
        images: Array.isArray(product.images) ? product.images : [],
        variants: Array.isArray(product.variants) ? product.variants : [],
        specs: Array.isArray(product.specs) ? product.specs : [],
    }));

const fallback = async (request, demoRequest) => {
    try {
        return await request();
    } catch (error) {
        const status = error?.response?.status;
        if (isBackendUnavailable(error) || (isAdminRoute() && isDemoToken() && (status === 401 || status === 403))) {
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
                    if (key === 'stockmanager' || key === 'warehouse' || key === 'marketing') return 'Warehouse';
                    if (key === 'tech' || key === 'technical' || key === 'warranty' || key === 'maintenance' || key === 'repair' || key === 'repairs' || key === 'customerservice') return 'Technical';
                    if (key === 'user') return 'User';
                    if (key === 'admin') return 'Admin';
                    return explicitRole;
                }
                const position = String(u.position || '').toLowerCase();
                if (position.includes('tech') || position.includes('technical') || position.includes('kỹ thuật') || position.includes('ky thuat')) {
                    return 'Technical';
                }
                if (position.includes('warranty') || position.includes('repair') || position.includes('maintenance') || position.includes('bảo hành') || position.includes('bao hanh')) {
                    return 'Technical';
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
                dateOfBirth: user.dateOfBirth,
                role,
                expiresIn: 28800,
            });
        };

        return api.post('/auth/login', { username, password })
            .then(response => {
                const data = response.data;
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
                    }
                };
            })
            .catch((error) => {
                if (isBackendUnavailable(error)) return demoLogin();
                throw error;
            });
    },
    register: (data) => api.post('/auth/register', data)
        .then(response => {
            const respData = response.data;
            return {
                data: {
                    message: respData.message || respData.Message,
                    userId: respData.userId || respData.UserId,
                }
            };
        }),
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
                user.isActive !== false &&
                (!keyword ||
                [user.username, user.name, user.email, user.phone].some((value) => (value || '').toLowerCase().includes(keyword)))
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
            const nextUserType = Number(data.userType || 0);
            if (nextUserType === 1 && db.users.some((x) => Number(x.userType) === 1 && x.isActive !== false)) {
                return Promise.reject({ response: { data: { message: 'He thong chi cho phep 1 tai khoan admin.' } } });
            }
            const user = {
                id: nextGuid(),
                username: data.username,
                password: data.password,
                name: nextUserType === 1 ? '' : (data.name || ''),
                email: nextUserType === 1 ? '' : (data.email || ''),
                phone: data.phone || '',
                dateOfBirth: nextUserType === 1 ? null : (data.dateOfBirth || null),
                position: data.position || '',
                role: data.role || '',
                isActive: true,
                userType: nextUserType,
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
            if (!user) {
                return Promise.reject({ response: { data: { message: 'User not found' } } });
            }
            const nextUserType = Number(data.userType ?? user.userType);
            if (Number(user.userType) === 1 && nextUserType !== 1) {
                return Promise.reject({ response: { data: { message: 'Khong the doi vai tro cua admin duy nhat.' } } });
            }
            if (Number(user.userType) === 1 && data.isActive === false) {
                return Promise.reject({ response: { data: { message: 'Khong the khoa admin duy nhat.' } } });
            }
            if (nextUserType === 1 && Number(user.userType) !== 1 && db.users.some((x) => Number(x.userType) === 1 && x.isActive !== false)) {
                return Promise.reject({ response: { data: { message: 'He thong chi cho phep 1 tai khoan admin.' } } });
            }
            Object.assign(user, data);
            saveDemoDb(db);
            return createResponse(mapUserResponse(user));
        }
    ),
    updateRole: (id, data) => fallback(
        () => api.put(`/users/${id}/role`, data),
        () => {
            const db = getDemoDb();
            const user = db.users.find((x) => x.id === id);
            if (user) {
                const nextUserType = Number(data.userType ?? user.userType);
                if (Number(user.userType) === 1 && nextUserType !== 1) {
                    return Promise.reject({ response: { data: { message: 'Khong the doi vai tro cua admin duy nhat.' } } });
                }
                if (nextUserType === 1 && Number(user.userType) !== 1 && db.users.some((x) => Number(x.userType) === 1 && x.isActive !== false)) {
                    return Promise.reject({ response: { data: { message: 'He thong chi cho phep 1 tai khoan admin.' } } });
                }
                user.userType = nextUserType;
                user.role = data.role || user.role;
            }
            saveDemoDb(db);
            return createResponse(mapUserResponse(user));
        }
    ),
    delete: (id) => fallback(
        () => api.delete(`/users/${id}`),
        () => {
            const db = getDemoDb();
            const user = db.users.find((x) => x.id === id);
            if (!user) {
                return Promise.reject({ response: { data: { message: 'User not found' } } });
            }
            if (Number(user.userType) === 1) {
                return Promise.reject({ response: { data: { message: 'Khong the xoa admin duy nhat.' } } });
            }
            user.isActive = false;
            saveDemoDb(db);
            return createResponse({ message: 'Deleted' });
        }
    ),
};

export const roleApi = {
    getAll: () => fallback(
        () => api.get('/roles'),
        () => createResponse([
            { id: 'Admin', name: 'Admin', description: 'System administrator' },
            { id: 'Warehouse', name: 'Warehouse', description: 'Inventory and fulfillment staff' },
            { id: 'Technical', name: 'Technical', description: 'Technical support staff' },
            { id: 'User', name: 'User', description: 'Customer account' },
        ])
    ),
    getById: (id) => fallback(
        () => api.get(`/roles/${id}`),
        () => roleApi.getAll().then((res) => createResponse((res.data || []).find((role) => String(role.id) === String(id)) || null))
    ),
    create: (data) => fallback(
        () => api.post('/roles', data),
        () => Promise.reject({ response: { data: { message: 'He thong chi su dung 4 vai tro co dinh: Admin, User, Warehouse, Technical.' } } })
    ),
    update: (id, data) => fallback(
        () => api.put(`/roles/${id}`, data),
        () => createResponse({ id, ...data })
    ),
    delete: (id) => fallback(
        () => api.delete(`/roles/${id}`),
        () => Promise.reject({ response: { data: { message: '4 vai tro he thong khong duoc xoa.' } } })
    ),
};

const defaultSettings = {
    id: 1,
    storeName: 'CNTHHT Store',
    hotline: '0327 188 459',
    supportEmail: 'support@cnthht.vn',
    address: '',
    warrantyAddress: '',
    defaultShippingFee: 0,
    freeShippingThreshold: null,
    supportTime: '',
    logoUrl: '',
    facebookUrl: '',
    zaloUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const getDemoSettings = () => {
    try {
        const stored = localStorage.getItem(DEMO_SETTINGS_KEY);
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
        return defaultSettings;
    }
};

export const settingsApi = {
    get: () => fallback(
        () => api.get('/settings'),
        () => createResponse(getDemoSettings())
    ),
    update: (data) => fallback(
        () => api.put('/settings', data),
        () => {
            const next = {
                ...getDemoSettings(),
                ...data,
                updatedAt: new Date().toISOString(),
            };
            localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(next));
            return createResponse(next);
        }
    ),
};

export const couponApi = {
    getAll: (params = {}) => fallback(
        () => api.get('/coupons', { params }),
        () => {
            const db = getDemoDb();
            db.coupons = db.coupons || [];
            const page = Number(params.page || 1);
            const pageSize = Number(params.pageSize || 50);
            const items = db.coupons.slice((page - 1) * pageSize, page * pageSize);
            return createResponse({ items, totalCount: db.coupons.length, page, pageSize, totalPages: Math.ceil(db.coupons.length / pageSize) || 1 });
        }
    ),
    getById: (id) => fallback(
        () => api.get(`/coupons/${id}`),
        () => {
            const coupon = (getDemoDb().coupons || []).find((item) => String(item.id) === String(id));
            return coupon ? createResponse(coupon) : Promise.reject({ response: { status: 404, data: { message: 'Coupon not found' } } });
        }
    ),
    create: (data) => fallback(
        () => api.post('/coupons', data),
        () => {
            const db = getDemoDb();
            db.coupons = db.coupons || [];
            const coupon = {
                id: nextNumericId(db.coupons),
                ...data,
                claimedQuantity: 0,
                usedQuantity: 0,
                status: data?.isActive ? 'Active' : 'Disabled',
                createdAt: new Date().toISOString(),
            };
            db.coupons.unshift(coupon);
            saveDemoDb(db);
            return createResponse(coupon);
        }
    ),
    update: (id, data) => fallback(
        () => api.put(`/coupons/${id}`, data),
        () => {
            const db = getDemoDb();
            db.coupons = db.coupons || [];
            const coupon = db.coupons.find((item) => String(item.id) === String(id));
            if (!coupon) return Promise.reject({ response: { status: 404, data: { message: 'Coupon not found' } } });
            Object.assign(coupon, data, { status: data?.isActive ? 'Active' : 'Disabled' });
            saveDemoDb(db);
            return createResponse(coupon);
        }
    ),
    delete: (id) => fallback(
        () => api.delete(`/coupons/${id}`),
        () => {
            const db = getDemoDb();
            db.coupons = (db.coupons || []).filter((item) => String(item.id) !== String(id));
            saveDemoDb(db);
            return createResponse({ message: 'Deleted' });
        }
    ),
    toggle: (id) => fallback(
        () => api.put(`/coupons/${id}/toggle`),
        () => {
            const db = getDemoDb();
            const coupon = (db.coupons || []).find((item) => String(item.id) === String(id));
            if (!coupon) return Promise.reject({ response: { status: 404, data: { message: 'Coupon not found' } } });
            coupon.isActive = !coupon.isActive;
            coupon.status = coupon.isActive ? 'Active' : 'Disabled';
            saveDemoDb(db);
            return createResponse(coupon);
        }
    ),
    getUsers: (id) => fallback(
        () => api.get(`/coupons/${id}/users`),
        () => createResponse([])
    ),
    getStats: () => fallback(
        () => api.get('/coupons/stats'),
        () => {
            const coupons = getDemoDb().coupons || [];
            return createResponse({
                totalCoupons: coupons.length,
                activeCoupons: coupons.filter((item) => item.status === 'Active' || item.isActive).length,
                expiredCoupons: 0,
                totalClaimed: coupons.reduce((sum, item) => sum + Number(item.claimedQuantity || 0), 0),
                totalUsed: coupons.reduce((sum, item) => sum + Number(item.usedQuantity || 0), 0),
                totalDiscountAmount: 0,
            });
        }
    ),
    getPublic: (params = {}) => api.get('/coupons/public', { params }),
    getMy: (params = {}) => api.get('/coupons/my', { params }),
    claim: (id) => api.post(`/coupons/${id}/claim`),
    validate: (data) => api.post('/coupons/validate', data),
    applyPreview: (data) => api.post('/coupons/apply-preview', data),
    spin: () => api.post('/coupons/spin'),
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
            const detailIds = (db.orderDetails || []).map((x) => Number(x.id)).filter(Number.isFinite);
            const nextDetailId = (detailIds.length ? Math.max(...detailIds) : 0) + 1;
            const details = data.items.map((item, index) => {
                const productId = Number(item.productId || item.ProductId);
                const product = db.products.find((x) => Number(x.id) === productId);
                if (!product) throw new Error(`Product ${productId} not found`);
                product.stock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 0));
                const unitPrice = Number(item.unitPrice || product.price || 0);
                return {
                    id: nextDetailId + index,
                    orderId,
                    productId,
                    variantId: item.variantId || null,
                    productName: item.productName || product.name,
                    productImage: product.imageUrl || '',
                    quantity: Number(item.quantity || 1),
                    unitPrice,
                    totalPrice: unitPrice * Number(item.quantity || 1),
                    product,
                };
            });
            const totalAmount = details.reduce((sum, item) => sum + item.totalPrice, 0);
            const order = {
                id: orderId,
                orderCode: `CNTHHT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(orderId).padStart(4, '0')}`,
                source: 'checkout',
                userId: user.userId || user.id,
                customerName: data.customerName || user.name || '',
                customerPhone: data.customerPhone || '',
                customerEmail: data.customerEmail || user.email || '',
                subtotal: totalAmount,
                productDiscount: 0,
                shippingFee: data.shippingMethod === 'StorePickup' ? 0 : 30000,
                shippingDiscount: 0,
                orderDate: new Date().toISOString(),
                totalAmount: data.shippingMethod === 'StorePickup' ? totalAmount : totalAmount + 30000,
                status: 'Pending',
                paymentMethod: data.paymentMethod || 'BankTransfer',
                paymentStatus: data.paymentStatus || 'Unpaid',
                transactionId: data.paymentStatus === 'Paid' ? `TXN-${Date.now()}` : null,
                shippingMethod: data.shippingMethod || 'Delivery',
                shippingAddress: data.shippingAddress || '',
                storePickupLocation: data.storePickupLocation || null,
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
                    ...(data.paymentStatus === 'Paid' ? [{
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
            emitAdminOrdersUpdated();
            return createResponse({ order, details });
        }
    ),
    getMyOrders: () => fallback(
        () => api.get('/orders/my'),
        () => {
            const db = getDemoDb();
            const user = currentUser();
            const uid = user?.userId || user?.id;
            return createResponse(db.orders.filter((x) => String(x.userId || '') === String(uid || '') && x.source === 'checkout'));
        }
    ),
    getAll: () => fallback(
        () => api.get('/orders/all').then((res) => ({ ...res, data: unwrapPagedItems(res.data) })),
        () => createResponse(getDemoDb().orders)
    ),
    getById: (id) => fallback(
        () => api.get(`/orders/${id}`).then((res) => {
            if (res.data?.order) return res;
            return {
                ...res,
                data: {
                    order: {
                        ...res.data,
                        timeline: res.data?.timeline || res.data?.timelines || res.data?.Timeline || [],
                    },
                    details: res.data?.items || res.data?.details || res.data?.Items || [],
                },
            };
        }),
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
    updateProductSpecs: (productId, values = []) => fallback(
        () => api.put(`/specs/products/${productId}`, values),
        () => {
            const db = getDemoDb();
            const product = db.products.find((x) => Number(x.id) === Number(productId));
            if (!product) return Promise.reject({ response: { data: { message: 'Product not found' } } });
            product.specs = values
                .filter((item) => Number(item.specDefinitionId) > 0)
                .map((item) => ({
                    id: item.id || Number(`${productId}${item.specDefinitionId}`),
                    productId: Number(productId),
                    specDefinitionId: Number(item.specDefinitionId),
                    valueText: item.valueText ?? null,
                    valueNumber: item.valueNumber ?? null,
                    valueBool: item.valueBool ?? null,
                    value: item.valueBool ?? item.valueNumber ?? item.valueText ?? '',
                }))
                .filter((item) => item.value !== '' && item.value != null);
            saveDemoDb(db);
            return createResponse(product.specs);
        }
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
            const by = role === 'Admin' || role === 'Technical' || role === 'Warehouse' ? 'Support' : 'Customer';
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
            db.suppliers = db.suppliers || [];
            db.categorySuppliers = db.categorySuppliers || [];

            const user = currentUser();
            const categoryId = Number(data?.categoryId || 0);
            const supplierId = Number(data?.supplierId || 0);
            const supplier = db.suppliers.find((x) => Number(x.id || x.Id) === supplierId) || null;
            if (!categoryId) return Promise.reject({ response: { data: { message: 'Category is required' } } });
            if (!supplier) return Promise.reject({ response: { data: { message: 'Supplier is required' } } });
            const allowed = db.categorySuppliers.some((x) => Number(x.categoryId) === categoryId && Number(x.supplierId) === supplierId && x.isActive !== false);
            if (!allowed) return Promise.reject({ response: { data: { message: 'Supplier is not configured for the selected category' } } });
            const receipt = {
                id: nextNumericId(db.goodsReceipts),
                supplierId: supplier.id,
                supplierName: supplier.name,
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
                if (Number(product.categoryId) !== categoryId) {
                    throw new Error('Product does not belong to selected category');
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
                            supplierId: supplier?.id ?? null,
                            supplierName: receipt.supplierName,
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
                            supplierId: supplier?.id ?? null,
                            supplierName: receipt.supplierName,
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
    getSuppliers: (params = {}) => fallback(
        () => api.get('/suppliers', { params }).then((res) => ({ ...res, data: unwrapPagedItems(res.data) })),
        () => {
            const db = getDemoDb();
            const list = (db.suppliers || []).filter((x) => x.isActive !== false);
            return createResponse(list);
        }
    ),
    createSupplier: (data) => fallback(
        () => api.post('/suppliers', data),
        () => {
            const db = getDemoDb();
            db.suppliers = db.suppliers || [];
            const supplier = {
                id: nextNumericId(db.suppliers),
                supplierCode: data?.supplierCode || data?.code || `SUP-${String(data?.name || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 20) || Date.now()}`,
                code: data?.supplierCode || data?.code || `SUP-${String(data?.name || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 20) || Date.now()}`,
                name: data?.name || '',
                phone: data?.phone || null,
                email: data?.email || null,
                address: data?.address || null,
                taxCode: data?.taxCode || null,
                contactPerson: data?.contactPerson || null,
                supplierType: data?.supplierType || 'AuthorizedDistributor',
                note: data?.note || null,
                isActive: data?.isActive !== false,
                createdAt: new Date().toISOString(),
            };
            db.suppliers.push(supplier);
            saveDemoDb(db);
            return createResponse(supplier);
        }
    ),
    updateSupplier: (id, data) => fallback(
        () => api.put(`/suppliers/${id}`, data),
        () => {
            const db = getDemoDb();
            db.suppliers = db.suppliers || [];
            const supplier = db.suppliers.find((x) => Number(x.id || x.Id) === Number(id));
            if (!supplier) return Promise.reject({ response: { data: { message: 'Supplier not found' } } });
            supplier.supplierCode = data?.supplierCode || data?.code || supplier.supplierCode || supplier.code;
            supplier.code = data?.supplierCode || data?.code || supplier.code;
            supplier.name = data?.name || supplier.name;
            supplier.phone = data?.phone || null;
            supplier.email = data?.email || null;
            supplier.address = data?.address || null;
            supplier.taxCode = data?.taxCode || null;
            supplier.contactPerson = data?.contactPerson || null;
            supplier.supplierType = data?.supplierType || supplier.supplierType || 'AuthorizedDistributor';
            supplier.note = data?.note || null;
            supplier.isActive = data?.isActive !== false;
            supplier.updatedAt = new Date().toISOString();
            saveDemoDb(db);
            return createResponse(supplier);
        }
    ),
    deleteSupplier: (id) => fallback(
        () => api.delete(`/suppliers/${id}`),
        () => {
            const db = getDemoDb();
            db.suppliers = db.suppliers || [];
            const supplier = db.suppliers.find((x) => Number(x.id || x.Id) === Number(id));
            if (!supplier) return Promise.reject({ response: { data: { message: 'Supplier not found' } } });
            supplier.isActive = false;
            supplier.updatedAt = new Date().toISOString();
            saveDemoDb(db);
            return createResponse({ ok: true });
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
        () => api.get('/inventory/aged-stock', { params: { minDays: daysThreshold } }),
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

export const supplierApi = {
    getAll: (params = {}) => inventoryApi.getSuppliers(params),
    create: (data) => inventoryApi.createSupplier(data),
    update: (id, data) => inventoryApi.updateSupplier(id, data),
    delete: (id) => inventoryApi.deleteSupplier(id),
    toggleActive: (id) => fallback(
        () => api.put(`/suppliers/${id}/toggle-active`),
        () => {
            const db = getDemoDb();
            const supplier = (db.suppliers || []).find((x) => Number(x.id || x.Id) === Number(id));
            if (!supplier) return Promise.reject({ response: { data: { message: 'Supplier not found' } } });
            supplier.isActive = !supplier.isActive;
            supplier.updatedAt = new Date().toISOString();
            saveDemoDb(db);
            return createResponse(supplier);
        }
    ),
};

const enrichCategorySuppliers = (db, items) => items.map((item) => {
    const category = (db.categories || []).find((x) => Number(x.id) === Number(item.categoryId));
    const supplier = (db.suppliers || []).find((x) => Number(x.id) === Number(item.supplierId));
    return {
        ...item,
        categoryName: category?.name || null,
        supplierName: supplier?.name || null,
        supplierCode: supplier?.supplierCode || supplier?.code || null,
        supplierType: supplier?.supplierType || null,
    };
});

export const categorySupplierApi = {
    getAll: () => fallback(
        () => api.get('/category-suppliers'),
        () => {
            const db = getDemoDb();
            return createResponse(enrichCategorySuppliers(db, db.categorySuppliers || []));
        }
    ),
    getByCategory: (categoryId) => fallback(
        () => api.get(`/category-suppliers/category/${categoryId}`),
        () => {
            const db = getDemoDb();
            const items = (db.categorySuppliers || [])
                .filter((x) => Number(x.categoryId) === Number(categoryId))
                .filter((x) => x.isActive !== false)
                .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
            return createResponse(enrichCategorySuppliers(db, items));
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
