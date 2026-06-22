// Import các hook cần thiết từ React để quản lý state và side effects
import React, { useEffect, useMemo, useState } from 'react';
// Import API services cho category, coupon, brand, và product
import { categoryApi, couponApi, brandApi, productApi } from '../../services/api';

// Màn quản trị khuyến mãi: quản lý coupon, phạm vi áp dụng, thống kê và analytics.
// File này gom cả danh sách, bộ lọc và form cấu hình coupon theo nhiều loại scope.
// Component cho phép admin tạo, sửa, xóa, và quản lý phiếu giảm giá với các loại khác nhau:
// - Product coupon: áp dụng cho sản phẩm cụ thể
// - Shipping coupon: áp dụng cho phí vận chuyển
// - Scope types: All, Product, Category, Brand
// - Analytics: thống kê hiệu quả của các phiếu giảm giá

// Class CSS chung cho các input form để đảm bảo giao diện đồng nhất
// Sử dụng CSS variables để hỗ trợ theme dark/light mode
const inputClass = 'rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15';

// Hàm trả về object form mặc định khi tạo coupon mới hoặc reset form
// Thiết lập giá trị mặc định thông minh cho các trường (ngày bắt đầu = hiện tại, ngày kết thúc = 1 tháng sau)
const defaultForm = () => {
    const now = new Date();  // Lấy thời gian hiện tại
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);  // Tính thời gian 1 tháng sau
    return {
        code: '',                    // Mã coupon (ví dụ: SALE10)
        name: '',                    // Tên hiển thị của coupon
        description: '',             // Mô tả chi tiết về coupon
        type: 'Product',             // Loại coupon: Product hoặc Shipping
        discountType: 'Amount',      // Kiểu giảm giá: Amount, Percent, FreeShipping
        discountValue: 0,            // Giá trị giảm (số tiền hoặc phần trăm)
        maxDiscountAmount: '',       // Số tiền giảm tối đa (cho loại Percent)
        minOrderAmount: 0,           // Giá trị đơn hàng tối thiểu để áp dụng
        startAt: toInputDateTime(now),  // Ngày giờ bắt đầu (định dạng cho input datetime-local)
        endAt: toInputDateTime(nextMonth),  // Ngày giờ kết thúc (mặc định 1 tháng sau)
        totalQuantity: 100,          // Tổng số lượng coupon có thể nhận
        perUserLimit: 1,             // Số lượng tối đa mỗi user có thể nhận
        isActive: true,              // Trạng thái kích hoạt
        isPublic: true,              // Công khai cho tất cả user
        isAutoClaimable: true,       // Tự động nhận khi điều kiện thỏa mãn
        isSpinReward: false,         // Dùng làm quà trong vòng quay
        spinWeight: 0,               // Trọng số trong vòng quay (càng cao càng dễ trúng)
        allowedPaymentMethods: [],   // Danh sách phương thức thanh toán được áp dụng
        dailyUsageLimit: 0,          // Giới hạn số lần dùng mỗi ngày (0 = không giới hạn)
        scopeType: 'All',           // Phạm vi áp dụng: All, Product, Category, Brand
        productId: '',               // ID sản phẩm (nếu scopeType = Product)
        categoryId: '',              // ID danh mục (nếu scopeType = Category)
        brand: '',                   // Tên thương hiệu (nếu scopeType = Brand)
    };
};

// Hàm trả về object bộ lọc mặc định cho danh sách coupon
// Dùng để reset bộ lọc về trạng thái ban đầu
const defaultFilters = () => ({
    keyword: '',               // Từ khóa tìm kiếm (mã hoặc tên coupon)
    type: '',                   // Lọc theo loại coupon (Product/Shipping)
    discountType: '',          // Lọc theo kiểu giảm giá (Amount/Percent/FreeShipping)
    status: '',                // Lọc theo trạng thái (active/inactive/expired/scheduled)
    isActive: '',              // Lọc theo flag isActive
    isPublic: '',              // Lọc theo flag isPublic
    excludeSpinRewards: false, // Loại trừ coupon dùng làm quà quay
    fromDate: '',              // Lọc theo ngày bắt đầu (từ)
    toDate: '',                // Lọc theo ngày kết thúc (đến)
});

// Hàm chuyển đổi ngày tháng sang định dạng phù hợp cho input type="datetime-local"
// Input datetime-local yêu cầu định dạng YYYY-MM-DDTHH:mm (local time)
const toInputDateTime = (value) => {
    const date = value ? new Date(value) : new Date();  // Parse date hoặc dùng hiện tại
    if (Number.isNaN(date.getTime())) return '';  // Trả về rỗng nếu date không hợp lệ
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);  // Điều chỉnh timezone offset
    return local.toISOString().slice(0, 16);  // Cắt chuỗi để lấy YYYY-MM-DDTHH:mm
};

// Hàm chuyển đổi ngày tháng từ input sang định dạng ISO string cho API
// API yêu cầu định dạng ISO 8601 (ví dụ: 2024-01-01T00:00:00.000Z)
const toApiDateTime = (value) => (value ? new Date(value).toISOString() : new Date().toISOString());

// Hàm chuyển đổi date string (YYYY-MM-DD) sang ISO datetime cho API
// endOfDay = true sẽ set thời gian là 23:59:59 (để lọc đến hết ngày đó)
// endOfDay = false sẽ set thời gian là 00:00:00 (để lọc từ đầu ngày đó)
const toApiDate = (value, endOfDay = false) => {
    if (!value) return null;  // Trả về null nếu không có giá trị
    const date = new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`);  // Tạo date với thời gian cụ thể
    if (Number.isNaN(date.getTime())) return null;  // Trả về null nếu date không hợp lệ
    return date.toISOString();  // Chuyển sang ISO format
};

// Hàm helper để trích xuất mảng items từ response API
// Xử lý các cấu trúc response khác nhau từ backend
const unwrapItems = (payload) => {
    if (Array.isArray(payload)) return payload;  // Nếu payload là mảng, trả về luôn
    if (Array.isArray(payload?.items)) return payload.items;  // Nếu có field items, trả về items
    if (Array.isArray(payload?.data)) return payload.data;  // Nếu có field data, trả về data
    return [];  // Mặc định trả về mảng rỗng
};

// Hàm helper để trích xuất metadata phân trang từ response API
// Xử lý các cấu trúc response khác nhau và cung cấp fallback values
const unwrapPageMeta = (payload, fallbackItems, fallbackPage, fallbackPageSize) => {
    // Nếu payload không có hoặc là mảng, tính toán từ fallback items
    if (!payload || Array.isArray(payload)) {
        const totalCount = fallbackItems.length;
        return { totalCount, totalPages: Math.ceil(totalCount / fallbackPageSize) || 1 };
    }

    // Trích xuất totalCount từ các field khác nhau (tùy cấu trúc API)
    const totalCount = Number(payload.totalCount ?? payload.total ?? payload.count ?? fallbackItems.length);
    // Tính toán totalPages hoặc lấy từ response
    const totalPages = Number(payload.totalPages ?? (Math.ceil(totalCount / fallbackPageSize) || 1));
    return {
        totalCount,
        totalPages: Math.max(1, totalPages),  // Đảm bảo ít nhất 1 trang
        page: Number(payload.page || fallbackPage),  // Trang hiện tại
        pageSize: Number(payload.pageSize || fallbackPageSize),  // Số items mỗi trang
    };
};

// Hàm chuyển đổi status của coupon sang label tiếng Việt để hiển thị
// Xử lý các trường hợp status khác nhau (active, inactive, expired, scheduled)
const getStatusLabel = (coupon) => {
    const status = String(coupon.status || '').toLowerCase();
    if (status === 'active' || (!status && coupon.isActive)) return 'Hoạt động';
    if (status === 'disabled' || status === 'inactive' || !coupon.isActive) return 'Tạm dừng';
    if (status === 'expired') return 'Hết hạn';
    if (status === 'scheduled') return 'Sắp diễn ra';
    return coupon.status || 'Tạm dừng';  // Fallback
};

// Hàm tạo summary text cho phạm vi áp dụng của coupon
// Hiển thị tên sản phẩm/danh mục/thương hiệu thay vì chỉ ID
const getCouponScopeSummary = (coupon, products = [], categories = []) => {
    const scope = coupon?.scopes?.[0] || { scopeType: 'All' };  // Lấy scope đầu tiên (coupon chỉ có 1 scope)
    if (scope.scopeType === 'Product') {
        // Tìm tên sản phẩm từ danh sách products
        const productName = products.find((item) => String(item.id) === String(scope.productId))?.name;
        return productName ? `Sản phẩm: ${productName}` : `Sản phẩm ID: ${scope.productId || '-'}`;
    }
    if (scope.scopeType === 'Category') {
        // Tìm tên danh mục từ danh sách categories
        const categoryName = categories.find((item) => String(item.id) === String(scope.categoryId))?.name;
        return categoryName ? `Danh mục: ${categoryName}` : 'Theo danh mục';
    }
    if (scope.scopeType === 'Brand') {
        return scope.brand ? `Thương hiệu: ${scope.brand}` : 'Theo thương hiệu';
    }
    // Fallback cho các trường hợp khác
    return coupon?.isSpinReward ? 'Phiếu quay thưởng' : 'Khuyến mãi chung';
};

// Component chính quản lý coupon/voucher
// Sử dụng React hooks để quản lý state và lifecycle
const AdminCoupons = () => {
    // State lưu danh sách coupons từ API (có phân trang)
    const [coupons, setCoupons] = useState([]);
    // State lưu danh sách products (để select trong form scope)
    const [products, setProducts] = useState([]);
    // State lưu danh sách categories (để select trong form scope)
    const [categories, setCategories] = useState([]);
    // State lưu danh sách brands (để select trong form scope)
    const [brands, setBrands] = useState([]);
    // State lưu thống kê tổng quan (total, active, claimed, used)
    const [stats, setStats] = useState(null);
    // State lưu analytics top 10 coupon hiệu quả nhất
    const [analytics, setAnalytics] = useState([]);
    // State lưu dữ liệu form đang nhập (tạo mới hoặc sửa)
    const [form, setForm] = useState(defaultForm);
    // State lưu ID của coupon đang được sửa (null = đang tạo mới)
    const [editingId, setEditingId] = useState(null);
    // State điều khiển hiển thị/ẩn form modal
    const [showForm, setShowForm] = useState(false);
    // State hiển thị loading khi đang tải dữ liệu
    const [loading, setLoading] = useState(true);
    // State hiển thị loading khi đang lưu dữ liệu
    const [saving, setSaving] = useState(false);
    // State lưu thông báo lỗi
    const [error, setError] = useState('');
    // State lưu thông báo thành công
    const [success, setSuccess] = useState('');
    // State trang hiện tại cho phân trang
    const [page, setPage] = useState(1);
    // State số items mỗi trang (fix = 10)
    const [pageSize] = useState(10);
    // State tổng số items (từ API)
    const [totalCount, setTotalCount] = useState(0);
    // State tổng số trang (tính từ totalCount)
    const [totalPages, setTotalPages] = useState(1);
    // State bộ lọc draft (đang nhập, chưa áp dụng)
    const [filterDraft, setFilterDraft] = useState(defaultFilters);
    // State bộ lọc đã áp dụng (để gọi API)
    const [filters, setFilters] = useState(defaultFilters);

    // Tính số lượng coupon đang hoạt động để hiển thị trong stats card
    // Sử dụng useMemo để tránh tính toán lại khi coupons không thay đổi
    const activeCoupons = useMemo(
        () => coupons.filter((item) => String(item.status || '').toLowerCase() === 'active' || item.isActive).length,
        [coupons]
    );

    // useEffect hook để tải dữ liệu nền khi component mount lần đầu
    // Tải categories, brands, products, stats và analytics một lần duy nhất
    // Dữ liệu này dùng để populate dropdowns trong form và hiển thị dashboard
    useEffect(() => {
        const initData = async () => {
            try {
                // Gọi song song nhiều API để tối ưu performance
                const [categoryRes, statsRes, analyticsRes, brandRes, productRes] = await Promise.all([
                    categoryApi.getAll(),  // Lấy tất cả categories
                    couponApi.getStats(),  // Lấy thống kê tổng quan
                    couponApi.getAnalytics({ top: 10 }),  // Lấy top 10 coupon hiệu quả nhất
                    brandApi.getByCategory(),  // Lấy brands theo category
                    productApi.getAll({ page: 1, pageSize: 300 })  // Lấy danh sách sản phẩm (limit 300)
                ]);
                setCategories(unwrapItems(categoryRes.data));  // Lưu categories vào state
                setStats(statsRes.data || null);  // Lưu stats vào state
                setAnalytics(unwrapItems(analyticsRes.data));  // Lưu analytics vào state
                // Xử lý brands: lấy tên unique và sắp xếp alphabet
                const brandList = Array.isArray(brandRes.data) ? brandRes.data : [];
                setBrands([...new Set(brandList.map((b) => b.name ?? b.Name).filter(Boolean))].sort());
                setProducts(unwrapItems(productRes.data));  // Lưu products vào state
            } catch (err) {
                console.error("Lỗi khởi tạo dữ liệu Admin Coupons:", err);
            }
        };
        initData();
    }, []);  // Mảng dependency rỗng = chỉ chạy một lần khi mount

    // useEffect hook để tải danh sách coupon khi trang hoặc bộ lọc thay đổi
    // Tách riêng với useEffect initData để tránh gọi API không cần thiết
    useEffect(() => {
        loadCoupons(page, filters);
    }, [page, filters]);  // Re-run khi page hoặc filters thay đổi

    // Hàm tải danh sách coupon từ API theo trang và bộ lọc
    // Tách riêng với stats để giảm request không cần thiết khi đổi trang
    const loadCoupons = async (nextPage = page, activeFilters = filters) => {
        setLoading(true);  // Bật loading state
        setError('');  // Xóa thông báo lỗi cũ
        try {
            // Chuẩn bị params cho API call
            const params = {
                page: nextPage,
                pageSize,
                keyword: activeFilters.keyword?.trim() || undefined,  // Trim keyword, undefined nếu rỗng
                type: activeFilters.type || undefined,
                discountType: activeFilters.discountType || undefined,
                status: activeFilters.status || undefined,
                // Chuyển string 'true'/'false' sang boolean, undefined nếu rỗng
                isActive: activeFilters.isActive === '' ? undefined : activeFilters.isActive === 'true',
                isPublic: activeFilters.isPublic === '' ? undefined : activeFilters.isPublic === 'true',
                excludeSpinRewards: activeFilters.excludeSpinRewards ? true : undefined,
                // Chuyển date sang ISO format cho API
                fromDate: toApiDate(activeFilters.fromDate, false) || undefined,
                toDate: toApiDate(activeFilters.toDate, true) || undefined,
            };
            const couponRes = await couponApi.getAll(params);  // Gọi API
            const items = unwrapItems(couponRes.data);  // Trích xuất danh sách coupon
            const meta = unwrapPageMeta(couponRes.data, items, nextPage, pageSize);  // Trích xuất metadata phân trang

            setCoupons(items);  // Lưu danh sách coupon vào state
            setTotalCount(meta.totalCount);  // Lưu tổng số items
            setTotalPages(meta.totalPages);  // Lưu tổng số trang

            // Nếu API trả về page khác với page hiện tại, cập nhật page
            if (meta.page && meta.page !== page) {
                setPage(meta.page);
            }
        } catch (err) {
            // Xử lý lỗi và hiển thị thông báo phù hợp
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không thể tải danh sách phiếu giảm giá');
        } finally {
            setLoading(false);  // Tắt loading state dù thành công hay thất bại
        }
    };

    // Hàm làm tươi (refresh) thống kê và analytics sau khi có thay đổi coupon
    // Được gọi sau khi tạo, sửa, xóa, hoặc toggle coupon
    const refreshStats = async () => {
        try {
            // Gọi song song 2 API để tối ưu performance
            const [statsRes, analyticsRes] = await Promise.all([
                couponApi.getStats(),  // Lấy thống kê tổng quan mới
                couponApi.getAnalytics({ top: 10 })  // Lấy top 10 coupon hiệu quả nhất mới
            ]);
            setStats(statsRes.data || null);  // Cập nhật stats state
            setAnalytics(unwrapItems(analyticsRes.data));  // Cập nhật analytics state
        } catch (err) {
            console.error("Không thể cập nhật bảng thống kê:", err);
        }
    };

    // Hàm cập nhật một field trong form với các ràng buộc nghiệp vụ tự động
    // Một số field có ràng buộc với nhau nên cần đồng bộ ngay tại FE để form luôn hợp lệ
    const updateField = (field, value) => {
        setForm((current) => {
            const updated = { ...current, [field]: value };  // Copy form và cập nhật field
            // Ràng buộc: nếu đổi discountType sang FreeShipping thì reset discountValue về 0
            if (field === 'discountType' && value === 'FreeShipping') {
                updated.discountValue = 0;
            }
            // Ràng buộc: nếu scopeType là Product thì không thể dùng làm quà quay
            if (field === 'scopeType' && value === 'Product') {
                updated.isSpinReward = false;
                updated.spinWeight = 0;
            }
            return updated;
        });
    };

    // Hàm reset form về trạng thái mặc định và đóng modal
    // Được gọi khi hủy thao tác hoặc sau khi lưu thành công
    const resetForm = () => {
        setEditingId(null);  // Xóa ID đang sửa
        setForm(defaultForm());  // Reset form về giá trị mặc định
        setError('');  // Xóa thông báo lỗi
        setSuccess('');  // Xóa thông báo thành công
        setShowForm(false);  // Đóng modal form
    };

    // Hàm mở form tạo coupon mới
    // Reset form và hiển thị modal
    const openCreateForm = () => {
        setEditingId(null);  // Đảm bảo không có ID đang sửa
        setForm(defaultForm());  // Reset form về giá trị mặc định
        setError('');  // Xóa thông báo lỗi
        setSuccess('');  // Xóa thông báo thành công
        setShowForm(true);  // Hiển thị modal form
    };

    // Hàm mở form sửa coupon
    // Copy dữ liệu coupon từ backend vào form để chỉnh sửa
    const editCoupon = (coupon) => {
        const scope = coupon.scopes?.[0] || { scopeType: 'All' };  // Lấy scope đầu tiên
        setEditingId(coupon.id);  // Lưu ID coupon đang sửa
        setForm({
            code: coupon.code || '',
            name: coupon.name || '',
            description: coupon.description || '',
            type: coupon.type || 'Product',
            discountType: coupon.discountType || 'Amount',
            discountValue: Number(coupon.discountValue || 0),  // Đảm bảo là số
            maxDiscountAmount: coupon.maxDiscountAmount ?? '',  // Giữ nguyên chuỗi rỗng
            minOrderAmount: Number(coupon.minOrderAmount || 0),
            startAt: toInputDateTime(coupon.startAt),  // Chuyển sang định dạng input
            endAt: toInputDateTime(coupon.endAt),
            totalQuantity: Number(coupon.totalQuantity || 0),
            perUserLimit: Number(coupon.perUserLimit || 1),
            isActive: Boolean(coupon.isActive),  // Đảm bảo là boolean
            isPublic: Boolean(coupon.isPublic),
            isAutoClaimable: Boolean(coupon.isAutoClaimable),
            isSpinReward: Boolean(coupon.isSpinReward),
            spinWeight: Number(coupon.spinWeight || 0),
            // Chuyển string comma-separated sang array
            allowedPaymentMethods: String(coupon.allowedPaymentMethods || '')
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
            dailyUsageLimit: Number(coupon.dailyUsageLimit || 0),
            scopeType: scope.scopeType || 'All',
            productId: scope.productId || '',
            categoryId: scope.categoryId || '',
            brand: scope.brand || '',
        });
        setError('');  // Xóa thông báo lỗi
        setSuccess('');  // Xóa thông báo thành công
        setShowForm(true);  // Hiển thị modal form
    };

    // Hàm xây dựng payload để gửi lên API
    // Gom toàn bộ cấu hình coupon và scope theo định dạng backend mong đợi
    const buildPayload = () => {
        // Xây dựng object scope dựa trên scopeType
        const scope = {
            scopeType: form.scopeType,
            // Chỉ set productId nếu scopeType là Product và có giá trị
            productId: form.scopeType === 'Product' && form.productId ? Number(form.productId) : null,
            // Chỉ set categoryId nếu scopeType là Category và có giá trị
            categoryId: form.scopeType === 'Category' && form.categoryId ? Number(form.categoryId) : null,
            // Chỉ set brand nếu scopeType là Brand và có giá trị
            brand: form.scopeType === 'Brand' ? form.brand.trim() : null,
        };

        return {
            code: form.code.trim(),  // Trim whitespace
            name: form.name.trim(),
            description: form.description.trim(),
            type: form.type,
            discountType: form.discountType,
            // FreeShipping luôn có discountValue = 0
            discountValue: form.discountType === 'FreeShipping' ? 0 : Number(form.discountValue || 0),
            // Chuỗi rỗng chuyển thành null, ngược lại chuyển thành số
            maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
            minOrderAmount: Number(form.minOrderAmount || 0),
            startAt: toApiDateTime(form.startAt),  // Chuyển sang ISO format
            endAt: toApiDateTime(form.endAt),
            totalQuantity: Number(form.totalQuantity || 0),
            perUserLimit: Number(form.perUserLimit || 1),
            isActive: form.isActive,
            isPublic: form.isPublic,
            isAutoClaimable: form.isAutoClaimable,
            isSpinReward: form.isSpinReward,
            spinWeight: Number(form.spinWeight || 0),
            // Chuyển array sang string comma-separated
            allowedPaymentMethods: Array.isArray(form.allowedPaymentMethods) && form.allowedPaymentMethods.length
                ? form.allowedPaymentMethods.join(',')
                : null,
            dailyUsageLimit: Number(form.dailyUsageLimit || 0),
            scopes: [scope],  // Backend yêu cầu array scopes
        };
    };

    // Hàm xử lý submit form (tạo mới hoặc cập nhật coupon)
    // Logic dùng chung cho cả hai trường hợp, phân biệt dựa trên editingId
    const handleSubmit = async (event) => {
        event.preventDefault();  // Ngăn reload trang khi submit form
        setSaving(true);  // Bật saving state
        setError('');  // Xóa thông báo lỗi cũ
        setSuccess('');  // Xóa thông báo thành công cũ
        try {
            const payload = buildPayload();  // Xây dựng payload từ form
            if (editingId) {
                // Nếu có editingId thì là cập nhật
                await couponApi.update(editingId, payload);  // Gọi API update
                setSuccess('Đã cập nhật phiếu giảm giá');
            } else {
                // Ngược lại là tạo mới
                await couponApi.create(payload);  // Gọi API create
                setSuccess('Đã tạo phiếu giảm giá');
            }
            resetForm();  // Reset form về trạng thái mặc định
            refreshStats();  // Cập nhật thống kê và analytics

            // Nếu tạo mới và không ở trang 1, chuyển về trang 1 để thấy coupon mới
            if (!editingId && page !== 1) {
                setPage(1);
            } else {
                // Ngược lại, tải lại trang hiện tại
                await loadCoupons(page);
            }
        } catch (err) {
            // Xử lý lỗi và hiển thị thông báo phù hợp
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Không thể lưu phiếu giảm giá');
        } finally {
            setSaving(false);  // Tắt saving state dù thành công hay thất bại
        }
    };

    // Hàm bật/tắt trạng thái hoạt động của coupon (active/inactive)
    // Gọi API toggle và refresh cả danh sách lẫn thống kê
    const handleToggle = async (coupon) => {
        setError('');  // Xóa thông báo lỗi cũ
        try {
            await couponApi.toggle(coupon.id);  // Gọi API toggle trạng thái
            // Song song tải lại danh sách và thống kê
            await Promise.all([loadCoupons(page), refreshStats()]);
        } catch (err) {
            // Xử lý lỗi và hiển thị thông báo phù hợp
            const data = err.response?.data;
            setError(data?.message || 'Không thể đổi trạng thái phiếu');
        }
    };

    // Hàm xóa coupon
    // Hiển thị dialog xác nhận trước khi thực hiện xóa
    // Backend sẽ tự động tắt coupon thay vì xóa vật lý nếu đã có người nhận
    const handleDelete = async (coupon) => {
        if (!window.confirm(`Xóa phiếu "${coupon.code}"? Phiếu đã có người nhận sẽ chỉ bị tắt.`)) return;  // Hủy nếu user không xác nhận
        setError('');  // Xóa thông báo lỗi cũ
        try {
            await couponApi.delete(coupon.id);  // Gọi API xóa
            refreshStats();  // Cập nhật thống kê

            // Tính toán lại phân trang sau khi xóa
            const nextTotal = Math.max(0, totalCount - 1);  // Tổng số mới
            const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));  // Tổng trang mới
            const nextPage = Math.min(page, nextTotalPages);  // Trang mới (không vượt quá tổng trang)

            // Nếu trang hiện tại vượt quá tổng trang mới, chuyển về trang cuối cùng
            if (nextPage !== page) {
                setPage(nextPage);
            } else {
                // Ngược lại, tải lại trang hiện tại
                await loadCoupons(nextPage);
            }
        } catch (err) {
            // Xử lý lỗi và hiển thị thông báo phù hợp
            const data = err.response?.data;
            setError(data?.message || 'Không thể xóa phiếu');
        }
    };

    // Tính toán số thứ tự item đầu và cuối trên trang hiện tại để hiển thị trong UI
    const fromItem = coupons.length ? (page - 1) * pageSize + 1 : 0;  // Item đầu tiên trên trang
    const toItem = coupons.length ? (page - 1) * pageSize + coupons.length : 0;  // Item cuối cùng trên trang

    // Render UI chính của component
    return (
        <div className="px-4 py-6 lg:px-8">
            {/* Header với tiêu đề và nút thêm phiếu mới */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Khuyến mãi</p>
                    <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Phiếu giảm giá / Voucher</h2>
                </div>
                <button type="button" className="rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)]" onClick={openCreateForm}>
                    <i className="fas fa-plus mr-2"></i>
                    Thêm phiếu
                </button>
            </div>

            {/* Hiển thị thông báo lỗi và thành công */}
            {error && <div className="mb-4 rounded-md border border-rose-200 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{error}</div>}
            {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">{success}</div>}

            {/* Stats cards hiển thị các chỉ số tổng quan */}
            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Tổng phiếu</div>
                    <div className="mt-1 text-2xl font-extrabold text-[var(--color-fg)]">{stats?.totalCoupons ?? coupons.length}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Đang hoạt động</div>
                    <div className="mt-1 text-2xl font-extrabold text-emerald-300">{stats?.activeCoupons ?? activeCoupons}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Đã nhận</div>
                    <div className="mt-1 text-2xl font-extrabold text-[var(--color-fg)]">{stats?.totalClaimed ?? 0}</div>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <div className="text-xs font-bold uppercase text-[var(--color-fg-muted)]">Đã dùng</div>
                    <div className="mt-1 text-2xl font-extrabold text-[var(--color-fg)]">{stats?.totalUsed ?? 0}</div>
                </div>
            </div>

            {/* Analytics table hiển thị top 10 voucher hiệu quả nhất */}
            {analytics.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="border-b border-[var(--color-border)] px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Hiệu quả voucher (Top 10)</h3>
                    </div>
                    <div className="p-4">
                        <div className="ts-table-container">
                            <table className="ts-table">
                                <thead>
                                    <tr>
                                        <th className="ts-table-col-medium">Mã</th>
                                        <th className="ts-table-col-medium ts-table-hide-mobile">Đơn</th>
                                        <th className="ts-table-col-medium">Tổng giảm</th>
                                        <th className="ts-table-col-medium ts-table-hide-mobile">Tỷ lệ dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((item) => (
                                        <tr key={item.couponId || item.code}>
                                            <td>
                                                <div className="font-extrabold text-[var(--color-fg)]">{item.code}</div>
                                                <div className="text-xs text-[var(--color-fg-muted)] line-clamp-1">{item.name}</div>
                                            </td>
                                            <td className="ts-table-hide-mobile">{item.ordersCount || 0}</td>
                                            <td>{Number(item.totalDiscountAmount || 0).toLocaleString('vi-VN')}đ</td>
                                            <td className="ts-table-hide-mobile">{Math.round(Number(item.redemptionRate || 0) * 100)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Section danh sách coupon với bộ lọc và bảng */}
            <div className="grid gap-5">
                <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                    <div className="border-b border-[var(--color-border)] px-4 py-3">
                        <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">Danh sách phiếu</h3>
                    </div>
                    <div className="p-4">
                        {/* Form bộ lọc - submit sẽ áp dụng bộ lọc và reset về trang 1 */}
                        <form
                            className="mb-4 grid gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 md:grid-cols-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setPage(1);  // Reset về trang 1 khi áp dụng bộ lọc mới
                                setFilters({ ...filterDraft });  // Áp dụng bộ lọc từ draft
                            }}
                        >
                            {/* Input tìm kiếm theo mã hoặc tên coupon */}
                            <input
                                type="text"
                                className={`${inputClass} md:col-span-2`}
                                value={filterDraft.keyword}
                                onChange={(e) => setFilterDraft((current) => ({ ...current, keyword: e.target.value }))}
                                placeholder="Tìm theo mã / tên..."
                            />

                            {/* Select lọc theo loại coupon */}
                            <select
                                className={inputClass}
                                value={filterDraft.type}
                                onChange={(e) => setFilterDraft((current) => ({ ...current, type: e.target.value }))}
                            >
                                <option value="">Tất cả loại</option>
                                <option value="Product">Sản phẩm</option>
                                <option value="Shipping">Vận chuyển</option>
                            </select>
                            {/* Select lọc theo kiểu giảm giá */}
                            <select
                                className={inputClass}
                                value={filterDraft.discountType}
                                onChange={(e) => setFilterDraft((current) => ({ ...current, discountType: e.target.value }))}
                            >
                                <option value="">Tất cả kiểu giảm</option>
                                <option value="Amount">Số tiền</option>
                                <option value="Percent">Phần trăm</option>
                                <option value="FreeShipping">Free ship</option>
                            </select>

                            <select
                                className={inputClass}
                                value={filterDraft.isPublic}
                                onChange={(e) => setFilterDraft((current) => ({ ...current, isPublic: e.target.value }))}
                            >
                                <option value="">Công khai: tất cả</option>
                                <option value="true">Công khai</option>
                                <option value="false">Không công khai</option>
                            </select>
                            {/* Input lọc theo ngày bắt đầu và kết thúc */}
                            <input
                                type="date"
                                className={inputClass}
                                value={filterDraft.fromDate}
                                onChange={(e) => setFilterDraft((current) => ({ ...current, fromDate: e.target.value }))}
                            />
                            <input
                                type="date"
                                className={inputClass}
                                value={filterDraft.toDate}
                                onChange={(e) => setFilterDraft((current) => ({ ...current, toDate: e.target.value }))}
                            />
                            {/* Checkbox để loại trừ phiếu dùng làm quà quay */}
                            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)] md:col-span-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={filterDraft.excludeSpinRewards}
                                    onChange={(e) => setFilterDraft((current) => ({ ...current, excludeSpinRewards: e.target.checked }))}
                                />
                                Ẩn phiếu quay thưởng
                            </label>
                            {/* Nút xóa lọc và áp dụng lọc */}
                            <div className="flex gap-2 md:col-span-2 md:justify-end">
                                <button
                                    type="button"
                                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-3)]"
                                    onClick={() => {
                                        const cleared = defaultFilters();  // Reset bộ lọc về mặc định
                                        setFilterDraft(cleared);
                                        setFilters(cleared);
                                        setPage(1);
                                    }}
                                >
                                    Xóa lọc
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
                                >
                                    Lọc
                                </button>
                            </div>
                        </form>
                        {/* Hiển thị loading hoặc bảng danh sách coupon */}
                        {loading ? (
                            <div className="py-12 text-center text-sm font-semibold text-[var(--color-fg-muted)]">Đang tải phiếu giảm giá...</div>
                        ) : (
                            <>
                                {/* Bảng danh sách coupon với các cột thông tin */}
                                <div className="ts-table-container">
                                    <table className="ts-table">
                                        <thead>
                                            <tr>
                                                <th className="ts-table-col-medium">Mã phiếu</th>
                                                <th className="ts-table-col-medium ts-table-hide-mobile">Loại</th>
                                                <th className="ts-table-col-medium ts-table-hide-mobile">Giảm giá</th>
                                                <th className="ts-table-col-medium ts-table-hide-tablet">Điều kiện</th>
                                                <th className="ts-table-col-medium ts-table-hide-tablet">Lượt</th>
                                                <th className="ts-table-col-medium ts-table-hide-mobile">Trạng thái</th>
                                                <th className="ts-table-col-medium text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        {/* Body của bảng - render danh sách coupon */}
                                        <tbody>
                                            {coupons.map((coupon) => (
                                                <tr key={coupon.id}>
                                                    <td>
                                                        <div className="font-extrabold text-[var(--color-fg)]">{coupon.code}</div>
                                                        <div className="text-xs text-[var(--color-fg-muted)]">{coupon.name}</div>
                                                        <div className="text-xs text-[var(--color-fg-dim)]">{getCouponScopeSummary(coupon, products, categories)}</div>
                                                    </td>
                                                    <td className="ts-table-hide-mobile">{coupon.type === 'Shipping' ? 'Vận chuyển' : 'Sản phẩm'}</td>
                                                    <td className="ts-table-hide-mobile">
                                                        {coupon.discountType === 'FreeShipping' ? 'Miễn phí ship' : `${coupon.discountValue}${coupon.discountType === 'Percent' ? '%' : 'đ'}`}
                                                    </td>
                                                    <td className="ts-table-hide-tablet">{Number(coupon.minOrderAmount || 0).toLocaleString('vi-VN')}đ</td>
                                                    <td className="ts-table-hide-tablet">{coupon.claimedQuantity || 0}/{coupon.totalQuantity || '∞'} nhận, {coupon.usedQuantity || 0} dùng</td>
                                                    <td className="ts-table-hide-mobile">
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${(coupon.status === 'Active' || coupon.isActive) ? 'bg-emerald-500/10 text-emerald-300' : 'bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]'}`}>
                                                            {getStatusLabel(coupon)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" className="h-9 w-9 rounded-md bg-[var(--color-surface-3)] text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]" onClick={() => handleToggle(coupon)} title="Bật/tắt">
                                                                <i className="fas fa-power-off"></i>
                                                            </button>
                                                            <button type="button" className="h-9 w-9 rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white hover:bg-[var(--color-primary)]" onClick={() => editCoupon(coupon)} title="Sửa">
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button type="button" className="h-9 w-9 rounded-md bg-rose-600 text-white hover:bg-rose-700" onClick={() => handleDelete(coupon)} title="Xóa">
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Phân trang với nút trước/sau và hiển thị trang hiện tại */}
                                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Hiển thị {fromItem}-{toItem} trong {totalCount} phiếu
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="rounded-md border border-[var(--color-border)] px-3 py-2 font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={page <= 1}
                                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        >
                                            Trước
                                        </button>
                                        <span className="rounded-md bg-[var(--color-surface-3)] px-3 py-2 font-semibold text-[var(--color-fg)]">
                                            {page}/{totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            className="rounded-md border border-[var(--color-border)] px-3 py-2 font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {showForm && (
                    <div className="fixed bottom-0 left-0 right-0 top-14 z-[70] flex items-center justify-center bg-slate-950/50 px-4 pb-8 pt-4 lg:left-64">
                        <aside className="flex max-h-[calc(100vh-7rem)] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
                            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                                <h3 className="mb-0 text-base font-bold text-[var(--color-fg)]">{editingId ? 'Sửa phiếu' : 'Thêm phiếu'}</h3>
                                <button
                                    type="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-fg-dim)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-fg)]"
                                    onClick={resetForm}
                                    aria-label="Đóng"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-4">
                                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-fg-muted)]">
                                    Mã gắn theo sản phẩm chỉ hiện ở đúng trang chi tiết sản phẩm đó. Mã không gắn sản phẩm sẽ dùng cho trang khuyến mãi hoặc quay thưởng.
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mã</span>
                                        <input className={`${inputClass} w-full uppercase`} value={form.code} onChange={(e) => updateField('code', e.target.value)} required />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Loại</span>
                                        <select className={`${inputClass} w-full`} value={form.type} onChange={(e) => updateField('type', e.target.value)}>
                                            <option value="Product">Sản phẩm</option>
                                            <option value="Shipping">Vận chuyển</option>
                                        </select>
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Tên phiếu</span>
                                    <input className={`${inputClass} w-full`} value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mô tả</span>
                                    <textarea className={`${inputClass} min-h-20 w-full resize-y`} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Kiểu giảm</span>
                                        <select className={`${inputClass} w-full`} value={form.discountType} onChange={(e) => updateField('discountType', e.target.value)}>
                                            <option value="Amount">Số tiền</option>
                                            <option value="Percent">Phần trăm</option>
                                            <option value="FreeShipping">Free ship</option>
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giá trị</span>
                                        <input type="number" min="0" className={`${inputClass} w-full`} value={form.discountValue} onChange={(e) => updateField('discountValue', e.target.value)} disabled={form.discountType === 'FreeShipping'} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giảm tối đa</span>
                                        <input type="number" min="0" className={`${inputClass} w-full`} value={form.maxDiscountAmount} onChange={(e) => updateField('maxDiscountAmount', e.target.value)} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Đơn tối thiểu</span>
                                        <input type="number" min="0" className={`${inputClass} w-full`} value={form.minOrderAmount} onChange={(e) => updateField('minOrderAmount', e.target.value)} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Số lượng</span>
                                        <input type="number" min="0" className={`${inputClass} w-full`} value={form.totalQuantity} onChange={(e) => updateField('totalQuantity', e.target.value)} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mỗi user</span>
                                        <input type="number" min="1" className={`${inputClass} w-full`} value={form.perUserLimit} onChange={(e) => updateField('perUserLimit', e.target.value)} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Bắt đầu</span>
                                        <input type="datetime-local" className={`${inputClass} w-full`} value={form.startAt} onChange={(e) => updateField('startAt', e.target.value)} required />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Kết thúc</span>
                                        <input type="datetime-local" className={`${inputClass} w-full`} value={form.endAt} onChange={(e) => updateField('endAt', e.target.value)} required />
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Phạm vi</span>
                                    <select className={`${inputClass} w-full`} value={form.scopeType} onChange={(e) => updateField('scopeType', e.target.value)}>
                                        <option value="All">Tất cả</option>
                                        <option value="Product">Theo sản phẩm</option>
                                        <option value="Category">Theo danh mục</option>
                                        <option value="Brand">Theo thương hiệu</option>
                                    </select>
                                </label>
                                {form.scopeType === 'Product' && (
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Sản phẩm áp dụng</span>
                                        <select className={`${inputClass} w-full`} value={form.productId} onChange={(e) => updateField('productId', e.target.value)}>
                                            <option value="">Chọn sản phẩm</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                                {form.scopeType === 'Category' && (
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Danh mục</span>
                                        <select className={`${inputClass} w-full`} value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)}>
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                        </select>
                                    </label>
                                )}
                                {form.scopeType === 'Brand' && (
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Thương hiệu</span>
                                        <select className={`${inputClass} w-full`} value={form.brand} onChange={(e) => updateField('brand', e.target.value)}>
                                            <option value="">Chọn thương hiệu</option>
                                            {form.brand && !brands.includes(form.brand) && <option value={form.brand}>{form.brand}</option>}
                                            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </label>
                                )}
                                <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-[var(--color-fg)]">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} /> Bật</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublic} onChange={(e) => updateField('isPublic', e.target.checked)} /> Public</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAutoClaimable} onChange={(e) => updateField('isAutoClaimable', e.target.checked)} /> Tự nhận</label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
                                        <input type="checkbox" checked={form.isSpinReward} onChange={(e) => updateField('isSpinReward', e.target.checked)} disabled={form.scopeType === 'Product'} />
                                        Quà quay
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Trọng số quay</span>
                                        <input type="number" min="0" className={`${inputClass} w-full`} value={form.spinWeight} onChange={(e) => updateField('spinWeight', e.target.value)} disabled={!form.isSpinReward || form.scopeType === 'Product'} />
                                    </label>
                                </div>
                                {form.scopeType === 'Product' && (
                                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                        Coupon theo sản phẩm sẽ chỉ hiện ở trang chi tiết của sản phẩm đã chọn, nên không dùng làm phiếu quay thưởng.
                                    </div>
                                )}
                                <div className="grid gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                                    <p className="mb-0 text-sm font-bold text-[var(--color-fg)]">Rule nâng cao</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giới hạn dùng/ngày</span>
                                            <input type="number" min="0" className={`${inputClass} w-full`} value={form.dailyUsageLimit} onChange={(e) => updateField('dailyUsageLimit', e.target.value)} />
                                        </label>
                                        <div className="block">
                                            <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Phương thức thanh toán</span>
                                            <div className="mb-2 text-xs font-semibold text-[var(--color-fg-muted)]">Không chọn mục nào = áp dụng tất cả phương thức</div>
                                            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-[var(--color-fg)]">
                                                {['StorePayment', 'BankTransfer', 'Momo', 'ShopeePay', 'ApplePay'].map((pm) => (
                                                    <label key={pm} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={Array.isArray(form.allowedPaymentMethods) && form.allowedPaymentMethods.includes(pm)}
                                                            onChange={(e) => {
                                                                const next = new Set(Array.isArray(form.allowedPaymentMethods) ? form.allowedPaymentMethods : []);
                                                                if (e.target.checked) next.add(pm); else next.delete(pm);
                                                                updateField('allowedPaymentMethods', Array.from(next));
                                                            }}
                                                        />
                                                        {pm}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]" onClick={resetForm}>Hủy</button>
                                    <button type="submit" className="rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)] disabled:opacity-60" disabled={saving}>
                                        {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo phiếu'}
                                    </button>
                                </div>
                            </form>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCoupons;
