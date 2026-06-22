// Vai trò hệ thống — gom về một nơi để tránh hardcode lặp ở nhiều file.
export const ROLE = {
    ADMIN: 'Admin',
    WAREHOUSE: 'Warehouse',
    TECHNICAL: 'Technical',
    USER: 'User',
};

// Các vai trò được vào khu admin (phải khớp guard ở /admin và canAccessAdminPanel).
export const ADMIN_PANEL_ROLES = ['Admin', 'Warehouse', 'Technical'];

// Quyền theo nghiệp vụ.
export const STOCK_ROLES = ['Admin', 'Warehouse'];       // quản lý kho / xem đơn
export const RETURN_ROLES = ['Admin', 'Technical'];      // trả hàng / kỹ thuật

// Toàn bộ vai trò cố định của hệ thống.
export const ALL_SYSTEM_ROLES = ['Admin', 'User', 'Warehouse', 'Technical'];
