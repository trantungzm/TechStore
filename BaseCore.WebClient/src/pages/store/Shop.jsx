import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categoryApi, productApi, specApi, brandApi } from '../../services/api';
import ProductCard from '../../components/store/ProductCard';
import PageHero from '../../components/store/PageHero';
import { usePublicCoupons } from '../../hooks/usePublicCoupons';
import { getAvailableCouponsForProduct } from '../../utils/couponUtils';
import { normalizeSearchText, resolveProductImage, safeParseJson, setPageMeta, t } from '../../utils/store';
import { cn } from '../../utils/cn';

const RECENTLY_VIEWED_KEY = 'electro_recently_viewed_products';
const DEFAULT_MAX_PRICE = 50000000;

const formatVnd = (value) => {
    const amount = Number(value || 0);
    return `${new Intl.NumberFormat('vi-VN').format(Number.isFinite(amount) ? amount : 0)}đ`;
};

const parsePriceParam = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const slugifyCategory = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeCategorySlug = (value = '') => {
    const slug = String(value || '').trim().toLowerCase();
    const map = {
        all: '', phone: 'phone', smartphone: 'phone', 'dien-thoai': 'phone',
        laptop: 'laptop',
        gaming: 'gaming', tablet: 'tablet', watch: 'watch', smartwatch: 'watch', 'dong-ho-thong-minh': 'watch',
        camera: 'camera', 'may-anh': 'camera', headphone: 'headphone', headphones: 'headphone', audio: 'headphone', 'tai-nghe': 'headphone',
    };
    const slugified = slugifyCategory(slug);
    return map[slug] ?? map[slugified] ?? slugified;
};

const categorySlugMap = {
    Smartphone: 'phone', SmartPhone: 'phone', 'Điện thoại': 'phone', 'Mobiles & Tablets': 'phone',
    Laptop: 'laptop', Gaming: 'gaming', Tablet: 'tablet',
    Smartwatch: 'watch', 'Smart Watch': 'watch', 'Đồng hồ thông minh': 'watch',
    Camera: 'camera', 'Máy ảnh': 'camera', Audio: 'headphone', 'Tai nghe': 'headphone',
};

const categoryIdSlugMap = { 1: 'phone', 2: 'laptop', 4: 'tablet', 5: 'watch', 6: 'camera', 7: 'headphone' };

const categoryDescriptionMap = {
    phone: 'Lựa chọn điện thoại theo hãng, nhu cầu và mức giá phù hợp.',
    laptop: 'Lựa chọn laptop theo hãng, cấu hình và mức giá phù hợp.',
    tablet: 'Lựa chọn tablet theo hãng, cấu hình và mức giá phù hợp.',
    gaming: 'Thiết bị cho game thủ với hiệu năng cao và thiết kế chuyên game.',
    watch: 'Đồng hồ thông minh theo thương hiệu, tính năng và nhu cầu sử dụng.',
    camera: 'Máy ảnh theo thương hiệu, chụp hình và quay video.',
    headphone: 'Tai nghe theo thương hiệu, nhu cầu sử dụng và công nghệ âm thanh.',
};

const normalizeRecentProduct = (product) => {
    if (!product) return null;
    return { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, categoryId: product.categoryId };
};

const getProductSearchText = (product) => {
    const variantText = Array.isArray(product?.variants)
        ? product.variants.map((v) => [v?.variantName, v?.colorName, v?.storage, v?.ram].filter(Boolean).join(' ')).join(' ')
        : '';
    const specText = Array.isArray(product?.specs)
        ? product.specs.map((s) => s?.optionValue || s?.valueText || s?.value || '').filter(Boolean).join(' ')
        : '';
    return normalizeSearchText([
        product?.name, product?.title, product?.description, specText, product?.tags, product?.brand, product?.sku,
        product?.category?.name, product?.categoryName, product?.usage, product?.cpu, product?.gpu,
        product?.screenSize, product?.resolution, product?.ram, product?.storage, product?.battery, product?.camera,
        variantText,
    ].filter(Boolean).join(' '));
};

// Hãng lấy trực tiếp từ dữ liệu (Brand master), không "đoán" từ tên nữa.
const inferPhoneBrand = (product) => String(product?.brand || '').trim().toLowerCase();

const matchesPhonePriceRange = (product, range) => {
    const price = Number(product?.price || 0);
    if (!range || !Number.isFinite(price)) return true;
    if (range === 'duoi-3') return price < 3000000;
    if (range === '3-7') return price >= 3000000 && price <= 7000000;
    if (range === '7-15') return price >= 7000000 && price <= 15000000;
    if (range === '15-25') return price >= 15000000 && price <= 25000000;
    if (range === 'tren-25') return price > 25000000;
    return true;
};

const matchesTextToken = (product, token) => {
    if (!token) return true;
    return getProductSearchText(product).includes(normalizeSearchText(token));
};

const inferLaptopBrand = (product) => String(product?.brand || '').trim().toLowerCase();

const matchesLaptopPriceRange = (product, range) => {
    const price = Number(product?.price || 0);
    if (!range || !Number.isFinite(price)) return true;
    if (range === 'duoi-10') return price < 10000000;
    if (range === '10-15') return price >= 10000000 && price <= 15000000;
    if (range === '15-20') return price >= 15000000 && price <= 20000000;
    if (range === '20-30') return price >= 20000000 && price <= 30000000;
    if (range === '30-50') return price >= 30000000 && price <= 50000000;
    if (range === 'tren-50') return price > 50000000;
    return true;
};

const phoneFilterParams = ['brand', 'usage', 'priceRange', 'storage', 'ram', 'battery', 'camera'];
const laptopFilterParams = ['brand', 'usage', 'priceRange', 'cpu', 'ram', 'storage', 'gpu', 'screenSize', 'resolution'];

const phoneFilterGroups = [
    { key: 'brand', title: 'Hãng', options: [
        { label: 'Tất cả', value: '' }, { label: 'Apple', value: 'apple' }, { label: 'Samsung', value: 'samsung' },
        { label: 'Xiaomi', value: 'xiaomi' }, { label: 'OPPO', value: 'oppo' }, { label: 'Vivo', value: 'vivo' },
        { label: 'Realme', value: 'realme' }, { label: 'Nokia', value: 'nokia' },
    ]},
    { key: 'priceRange', title: 'Khoảng giá', options: [
        { label: 'Tất cả', value: '' },
        { label: 'Dưới 3 triệu', value: 'duoi-3' },
        { label: '3 - 7 triệu', value: '3-7' },
        { label: '7 - 15 triệu', value: '7-15' },
        { label: '15 - 25 triệu', value: '15-25' },
        { label: 'Trên 25 triệu', value: 'tren-25' },
    ]},
    { key: 'storage', title: 'Bộ nhớ', options: [{ label: 'Tất cả', value: '' }, ...['64GB', '128GB', '256GB', '512GB', '1TB'].map((l) => ({ label: l, value: l.toLowerCase() }))] },
    { key: 'ram', title: 'RAM', options: [{ label: 'Tất cả', value: '' }, ...['4GB', '6GB', '8GB', '12GB', '16GB'].map((l) => ({ label: l, value: l.toLowerCase() }))] },
];

const laptopFilterGroupsSimple = [
    { key: 'brand', title: 'Hãng', options: [
        { label: 'Tất cả', value: '' },
        ...['Apple', 'Dell', 'HP', 'Asus', 'Acer', 'Lenovo', 'MSI'].map((l) => ({ label: l, value: l.toLowerCase() })),
    ]},
    { key: 'priceRange', title: 'Khoảng giá', options: [
        { label: 'Tất cả', value: '' },
        { label: 'Dưới 10 triệu', value: 'duoi-10' },
        { label: '10 - 15 triệu', value: '10-15' },
        { label: '15 - 20 triệu', value: '15-20' },
        { label: '20 - 30 triệu', value: '20-30' },
        { label: '30 - 50 triệu', value: '30-50' },
        { label: 'Trên 50 triệu', value: 'tren-50' },
    ]},
    { key: 'cpu', title: 'CPU', options: [
        { label: 'Tất cả', value: '' },
        ...['i3', 'i5', 'i7', 'i9', 'm1', 'm2', 'm3'].map((c) => ({ label: c.toUpperCase(), value: c })),
    ]},
    { key: 'ram', title: 'RAM', options: [{ label: 'Tất cả', value: '' }, ...['8GB', '16GB', '32GB', '64GB'].map((l) => ({ label: l, value: l.toLowerCase() }))] },
];

const commonPriceOptions = [
    { label: 'Tất cả', value: '', min: null, max: null },
    { label: 'Dưới 5 triệu', value: 'lt5', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', value: '5-10', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', value: '10-20', min: 10000000, max: 20000000 },
    { label: '20 - 40 triệu', value: '20-40', min: 20000000, max: 40000000 },
    { label: 'Trên 40 triệu', value: 'gt40', min: 40000000, max: null },
];

const statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Còn hàng', value: 'in-stock' },
];

const offerOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Có phiếu giảm giá', value: 'coupon' },
    { label: 'Hàng mới về', value: 'new' },
    { label: 'Đang giảm giá', value: 'sale' },
    { label: 'Freeship', value: 'freeship' },
];

const categoryNameMap = {
    Smartphone: 'Điện thoại', Laptop: 'Laptop', Audio: 'Tai nghe', Smartwatch: 'Đồng hồ thông minh',
    Camera: 'Máy ảnh', Gaming: 'Gaming', Tablet: 'Tablet',
};

const getCategoryDisplayName = (name = '') => categoryNameMap[name] || name;

const getImmediateCatalog = () => {
    try { return productApi.getLocalCatalog?.() || []; } catch { return []; }
};

const getImmediateCategories = () => {
    try { return categoryApi.getLocalAll?.() || []; } catch { return []; }
};

const getProductStats = (items = [], totalCount) => {
    const byId = {};
    items.forEach((product) => {
        if (product.categoryId == null) return;
        const id = String(product.categoryId);
        byId[id] = (byId[id] || 0) + 1;
    });
    return { totalProducts: totalCount || items.length, byId };
};

const fetchStoreCatalog = async () => {
    const first = await productApi.getAll({ page: 1, pageSize: 100 });
    const data = first.data || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const totalPages = Number(data.totalPages || 1);
    const pageSize = Number(data.pageSize || items.length || 100);
    if (totalPages <= 1) return { items, totalCount: data.totalCount };
    const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => productApi.getAll({ page: i + 2, pageSize }))
    );
    return {
        items: [...items, ...rest.flatMap((r) => Array.isArray(r.data?.items) ? r.data.items : [])],
        totalCount: data.totalCount,
    };
};

const PAGE_SIZE = 12;

const Shop = () => {
    const [products, setProducts] = useState(() => getImmediateCatalog().slice(0, PAGE_SIZE));
    const [allProducts, setAllProducts] = useState(getImmediateCatalog);
    const [categories, setCategories] = useState(getImmediateCategories);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoryStats, setCategoryStats] = useState(() => getProductStats(getImmediateCatalog()));
    const [specDefinitions, setSpecDefinitions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    const [specLoading, setSpecLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(() => Math.ceil(getImmediateCatalog().length / PAGE_SIZE) || 1);
    const [loading, setLoading] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [openFilterSections, setOpenFilterSections] = useState({ price: true, status: true, offer: true });
    const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
    const { coupons } = usePublicCoupons();

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const keyword = params.get('search') || params.get('keyword') || '';
    const rawCategorySlug = params.get('category') || '';
    const categorySlug = normalizeCategorySlug(rawCategorySlug);
    const categoryIdParam = params.get('categoryId') || '';
    const urlMinPrice = params.get('minPrice') || '';
    const urlMaxPrice = params.get('maxPrice') || '';
    const urlInStock = params.get('inStock') === 'true';
    const urlOffer = params.get('offer') || '';
    const urlSortBy = params.get('sort') || params.get('sortBy') || '';

    const sidebarCategories = categories;
    const knownCategorySlugs = ['phone', 'laptop', 'gaming', 'tablet', 'watch', 'camera', 'headphone'];
    const getCategorySlug = (category) => {
        const name = category?.name || '';
        const displayName = getCategoryDisplayName(name);
        const normalizedSlug = normalizeCategorySlug(displayName);
        return category?.slug ||
            categorySlugMap[name] ||
            categorySlugMap[displayName] ||
            (knownCategorySlugs.includes(normalizedSlug) ? normalizedSlug : '') ||
            categoryIdSlugMap[Number(category?.id)] ||
            normalizedSlug;
    };
    const activeCategory = sidebarCategories.find((category) => {
        const currentSlug = getCategorySlug(category);
        return (categorySlug && currentSlug === categorySlug) || (categoryIdParam && String(category.id) === categoryIdParam);
    });
    const activeCategoryId = activeCategory?.id ? String(activeCategory.id) : categoryIdParam;
    const activeCategoryName = activeCategory ? getCategoryDisplayName(activeCategory.name) : '';
    const activeCategorySlug = activeCategory ? getCategorySlug(activeCategory) : categorySlug;
    const activeCategoryDescription = activeCategorySlug
        ? categoryDescriptionMap[activeCategorySlug] || `Khám phá các sản phẩm ${activeCategoryName ? activeCategoryName.toLowerCase() : 'công nghệ'} mới nhất.`
        : '';
    const isPhoneCategory = activeCategorySlug === 'phone';
    const isLaptopCategory = activeCategorySlug === 'laptop';

    const phoneFilterValues = {
        brand: params.get('brand') || '',
        priceRange: params.get('priceRange') || '',
        storage: params.get('storage') || '',
        ram: params.get('ram') || '',
    };

    const laptopFilterValues = {
        brand: params.get('brand') || '',
        priceRange: params.get('priceRange') || '',
        cpu: params.get('cpu') || '',
        ram: params.get('ram') || '',
    };

    const filterCategories = useMemo(() => sidebarCategories
        .filter((c) => c.id !== '')
        .filter((c) => ['phone', 'laptop', 'tablet', 'watch', 'camera', 'headphone'].includes(getCategorySlug(c)))
        .reduce((unique, category) => {
            const slug = getCategorySlug(category);
            if (!unique.some((item) => getCategorySlug(item) === slug)) unique.push(category);
            return unique;
        }, []), [sidebarCategories]);

    const recordRecentlyViewed = (product) => {
        const normalized = normalizeRecentProduct(product);
        if (!normalized?.id) return;
        const current = safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []);
        const withoutDup = Array.isArray(current) ? current.filter((p) => p?.id !== normalized.id) : [];
        const next = [normalized, ...withoutDup].slice(0, 6);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    };

    useEffect(() => {
        setPageMeta({ title: `${t('Shop')} | TechStore`, description: t('Shop meta description') });

        const loadCats = async () => {
            try {
                const response = await categoryApi.getAll();
                const cats = response.data || [];
                setCategories(cats);
                const statsById = {};
                cats.forEach((c) => {
                    if (c.productCount != null) statsById[String(c.id)] = c.productCount;
                });
                setCategoryStats({
                    totalProducts: cats.reduce((s, c) => s + (c.productCount || 0), 0),
                    byId: statsById,
                });
            } catch (e) {
                console.error('Failed to load categories', e);
            } finally {
                setCategoriesLoading(false);
            }
        };

        const loadCatalog = async () => {
            try {
                const { items, totalCount } = await fetchStoreCatalog();
                setAllProducts(items);
                setCategoryStats(getProductStats(items, totalCount));
            } catch (e) {
                console.error('Failed to load products catalog', e);
            }
        };

        Promise.all([loadCats(), loadCatalog()]);
    }, []);

    useEffect(() => {
        if (!activeCategoryId) {
            setBrandOptions([]);
            return;
        }
        brandApi.getByCategory(activeCategoryId)
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : [];
                setBrandOptions(list.map((b) => b.name ?? b.Name).filter(Boolean));
            })
            .catch(() => setBrandOptions([]));
    }, [activeCategoryId]);

    useEffect(() => {
        if (!activeCategoryId) {
            setSpecDefinitions([]);
            return;
        }

        const loadSpecDefinitions = async () => {
            setSpecLoading(true);
            try {
                const response = await specApi.getDefinitions(activeCategoryId);
                const definitions = Array.isArray(response.data) ? response.data : [];
                setSpecDefinitions(definitions);
            } catch (e) {
                console.error('Failed to load spec definitions:', e);
                setSpecDefinitions([]);
            } finally {
                setSpecLoading(false);
            }
        };

        loadSpecDefinitions();
    }, [activeCategoryId]);

    useEffect(() => {
        if (!openFilterDropdown) return undefined;

        const handlePointerDown = (event) => {
            if (!event.target?.closest?.('[data-shop-filter-dropdown]')) {
                setOpenFilterDropdown(null);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setOpenFilterDropdown(null);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openFilterDropdown]);

    useEffect(() => {
        if (!allProducts) return;
        setLoading(true);

        let filtered = allProducts.slice();
        const normalizedKeyword = normalizeSearchText(keyword);

        if (normalizedKeyword) {
            filtered = filtered.filter((p) => normalizeSearchText(getProductSearchText(p)).includes(normalizedKeyword));
        }
        if (activeCategoryId) {
            filtered = filtered.filter((p) => String(p.categoryId) === String(activeCategoryId));
        }
        if (urlInStock) filtered = filtered.filter((p) => Number(p.stock || 0) > 0);
        if (urlOffer === 'coupon') filtered = filtered.filter((p) => getAvailableCouponsForProduct(p, coupons).length > 0);
        else if (urlOffer === 'new') filtered = filtered.filter((p) => p.badge === 'New' || Number(p.id || 0) >= 20);
        else if (urlOffer === 'sale') filtered = filtered.filter((p) => p.badge === 'Sale' || Number(p.oldPrice || 0) > Number(p.price || 0));
        else if (urlOffer === 'freeship') filtered = filtered.filter((p) => Number(p.price || 0) >= 500000);

        const minPriceValue = urlMinPrice ? Number(urlMinPrice) : null;
        const maxPriceValue = urlMaxPrice ? Number(urlMaxPrice) : null;
        if (Number.isFinite(minPriceValue)) filtered = filtered.filter((p) => Number(p.price || 0) >= minPriceValue);
        if (Number.isFinite(maxPriceValue)) filtered = filtered.filter((p) => Number(p.price || 0) <= maxPriceValue);

        // Lọc Hãng theo Brand master (khớp tên thật, không "đoán" từ tên SP)
        const brandFilter = (params.get('brand') || '').trim().toLowerCase();
        if (brandFilter) {
            filtered = filtered.filter((p) => String(p.brand || '').trim().toLowerCase() === brandFilter);
        }

        if (specDefinitions.length > 0) {
            specDefinitions.forEach((def) => {
                const key = def.code || def.id;
                const value = params.get(key) || '';
                if (value) {
                    filtered = filtered.filter((p) => matchesTextToken(p, value));
                }
            });
        } else {
            if (isPhoneCategory) {
                filtered = filtered.filter((p) => matchesPhonePriceRange(p, phoneFilterValues.priceRange));
                if (phoneFilterValues.storage) filtered = filtered.filter((p) => matchesTextToken(p, phoneFilterValues.storage));
                if (phoneFilterValues.ram) filtered = filtered.filter((p) => matchesTextToken(p, phoneFilterValues.ram));
            } else if (isLaptopCategory) {
                filtered = filtered.filter((p) => matchesLaptopPriceRange(p, laptopFilterValues.priceRange));
                if (laptopFilterValues.cpu) filtered = filtered.filter((p) => matchesTextToken(p, laptopFilterValues.cpu));
                if (laptopFilterValues.ram) filtered = filtered.filter((p) => matchesTextToken(p, laptopFilterValues.ram));
            }
        }

        if (urlSortBy === 'price_asc') filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        else if (urlSortBy === 'price_desc') filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        else if (urlSortBy === 'name_asc') filtered.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        else if (urlSortBy === 'name_desc') filtered.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));

        setProducts(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
        setLoading(false);
    }, [allProducts, coupons, location.search, page, specDefinitions]);

    useEffect(() => { setPage(1); }, [location.search]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(location.search);
        if (value) next.set(key, value);
        else next.delete(key);
        navigate(`/shop${next.toString() ? `?${next.toString()}` : ''}`);
    };

    const handleCategoryChange = (value) => {
        const next = new URLSearchParams(location.search);
        if (value) next.set('category', value); else next.delete('category');
        next.delete('categoryId');
        [...phoneFilterParams, ...laptopFilterParams].forEach((p) => next.delete(p));
        if (specDefinitions.length > 0) {
            specDefinitions.forEach((def) => {
                const key = def.code || def.id;
                next.delete(key);
            });
        }
        navigate(`/shop${next.toString() ? `?${next.toString()}` : ''}`);
    };

    const handleKeywordSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const nextKeyword = String(formData.get('keyword') || '').trim();
        const next = new URLSearchParams(location.search);
        next.delete('keyword');
        if (nextKeyword) next.set('search', nextKeyword); else next.delete('search');
        navigate(`/shop${next.toString() ? `?${next.toString()}` : ''}`);
    };

    const handlePricePreset = (option) => {
        const next = new URLSearchParams(location.search);
        if (option.min != null && option.min > 0) next.set('minPrice', String(option.min));
        else next.delete('minPrice');
        if (option.max != null) next.set('maxPrice', String(option.max));
        else next.delete('maxPrice');
        navigate(`/shop${next.toString() ? `?${next.toString()}` : ''}`);
    };

    const handleClearAll = () => {
        navigate('/shop');
    };

    const currentPricePreset = useMemo(() => {
        const min = urlMinPrice ? Number(urlMinPrice) : null;
        const max = urlMaxPrice ? Number(urlMaxPrice) : null;
        return commonPriceOptions.find((o) => (o.min ?? null) === (min ?? null) && (o.max ?? null) === (max ?? null))?.value || '';
    }, [urlMinPrice, urlMaxPrice]);

    const activeFilterChips = [
        keyword && { label: `"${keyword}"`, onRemove: () => setParam('search', '') },
        activeCategoryName && { label: activeCategoryName, onRemove: () => handleCategoryChange('') },
        (urlMinPrice || urlMaxPrice) && {
            label: `${formatVnd(urlMinPrice || 0)} – ${formatVnd(urlMaxPrice || DEFAULT_MAX_PRICE)}`,
            onRemove: () => {
                const next = new URLSearchParams(location.search);
                next.delete('minPrice'); next.delete('maxPrice');
                navigate(`/shop${next.toString() ? `?${next.toString()}` : ''}`);
            },
        },
        urlInStock && { label: 'Còn hàng', onRemove: () => setParam('inStock', '') },
        urlOffer && { label: offerOptions.find((o) => o.value === urlOffer)?.label || urlOffer, onRemove: () => setParam('offer', '') },
        ...specDefinitions.map((def) => {
            const key = def.code || def.id;
            const value = params.get(key) || '';
            if (!value) return null;
            const option = def.options?.find((opt) => opt.value === value);
            return {
                label: `${def.name}: ${option?.value || value}`,
                onRemove: () => setParam(key, ''),
            };
        }).filter(Boolean),
    ].filter(Boolean);

    const currentFilterGroups = useMemo(() => {
        // Nhóm "Hãng" lấy từ Brand master theo danh mục (không phải spec).
        const brandGroup = brandOptions.length > 0 ? [{
            key: 'brand',
            title: 'Hãng',
            options: [{ label: 'Tất cả', value: '' }, ...brandOptions.map((b) => ({ label: b, value: b }))],
        }] : [];

        if (specDefinitions.length > 0) {
            const specGroups = specDefinitions
                .filter((def) => def.dataType === 'select' && Array.isArray(def.options) && def.options.length > 0)
                .map((def) => ({
                    key: def.code || def.id,
                    title: def.name,
                    options: [
                        { label: 'Tất cả', value: '' },
                        ...def.options
                            .filter((opt) => opt.isActive !== false)
                            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                            .map((opt) => ({ label: opt.value, value: opt.value })),
                    ],
                }));
            return [...brandGroup, ...specGroups];
        }
        const fallback = (isPhoneCategory ? phoneFilterGroups : isLaptopCategory ? laptopFilterGroupsSimple : [])
            .filter((g) => g.key !== 'brand');
        return [...brandGroup, ...fallback];
    }, [specDefinitions, brandOptions, isPhoneCategory, isLaptopCategory]);

    const currentFilterValues = useMemo(() => {
        const values = { brand: params.get('brand') || '' };
        if (specDefinitions.length > 0) {
            specDefinitions.forEach((def) => {
                const key = def.code || def.id;
                values[key] = params.get(key) || '';
            });
            return values;
        }
        const fallback = isPhoneCategory ? phoneFilterValues : laptopFilterValues;
        return { ...fallback, ...values };
    }, [specDefinitions, params, brandOptions, isPhoneCategory, isLaptopCategory]);

    const toggleFilterSection = (key) => {
        setOpenFilterSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const AccordionSection = ({ title, isOpen, onToggle, children }) => (
        <div className="border-b border-[var(--color-border)] last:border-0">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between py-3 text-sm font-medium text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
            >
                <span>{title}</span>
                <i className={cn("fas fa-chevron-down text-[10px] transition-transform", isOpen ? "rotate-180" : "")}></i>
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="pb-4">{children}</div>
            </div>
        </div>
    );

    const FilterDropdown = ({ title, options, value, onChange }) => {
        const isOpen = openFilterDropdown === title;
        return (
        <div className="relative" data-shop-filter-dropdown>
            <button
                type="button"
                onClick={() => setOpenFilterDropdown(isOpen ? null : title)}
                className="ts-btn ts-btn-outline px-3 py-1.5 text-xs flex items-center gap-1"
            >
                {title} <i className="fas fa-chevron-down text-[10px]"></i>
            </button>
            {isOpen && (
            <div
                className="absolute left-0 top-full z-30 mt-1 w-48 max-h-64 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-card"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
            >
                {options.map((opt) => (
                    <label
                        key={opt.value}
                        className={cn(
                            "flex items-center gap-2 p-1.5 text-xs cursor-pointer rounded-sm transition-colors",
                            String(value || '') === String(opt.value || '')
                                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                : "hover:bg-[var(--color-surface-2)]"
                        )}
                    >
                        <input
                            type="radio"
                            name={`${title}-${opt.value}`}
                            checked={String(value || '') === String(opt.value || '')}
                            onChange={() => {
                                onChange(opt.value);
                                setOpenFilterDropdown(null);
                            }}
                            className="accent-[var(--color-primary)]"
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
            )}
        </div>
        );
    };

    const PillSelect = ({ label, options, value, onChange }) => (
        <div>
            <p className="ts-eyebrow mb-2 text-[10px]">{label}</p>
            <div className="flex flex-wrap gap-1.5">
                {options.map((opt) => (
                    <button
                        key={opt.value || 'all'}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "rounded-sm border px-2.5 py-1 text-[11px] transition-all",
                            String(value || '') === String(opt.value || '')
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-fg)]"
                                : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <PageHero title="Cửa hàng" current={t('Shop')} kicker="Danh mục" />

            <section className="ts-container flex h-[calc(100vh-180px)] overflow-hidden">
                <div className="flex w-full gap-8">
                    {/* SIDEBAR */}
                    <aside className={cn(
                        "w-[280px] h-full flex-shrink-0 overflow-y-auto space-y-6",
                        mobileFiltersOpen ? "block" : "hidden lg:block"
                    )}>
                        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <p className="ts-eyebrow mb-3 text-[10px]">Danh mục</p>
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handleCategoryChange('')}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors",
                                            !activeCategorySlug
                                                ? "bg-[var(--color-surface-2)] text-[var(--color-fg)]"
                                                : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]/60 hover:text-[var(--color-fg)]"
                                        )}
                                    >
                                        <span>Tất cả</span>
                                        {categoryStats.totalProducts > 0 && (
                                            <span className="ts-mono text-[11px] text-[var(--color-fg-dim)]">{categoryStats.totalProducts}</span>
                                        )}
                                    </button>
                                </li>
                                {filterCategories.map((category) => {
                                    const slugVal = getCategorySlug(category);
                                    const isActive = activeCategorySlug === slugVal;
                                    const count = categoryStats.byId[String(category.id)] || category.productCount || 0;
                                    return (
                                        <li key={category.id}>
                                            <button
                                                type="button"
                                                onClick={() => handleCategoryChange(slugVal)}
                                                className={cn(
                                                    "flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors",
                                                    isActive
                                                        ? "bg-[var(--color-surface-2)] text-[var(--color-fg)]"
                                                        : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)]/60 hover:text-[var(--color-fg)]"
                                                )}
                                            >
                                                <span>{getCategoryDisplayName(category.name)}</span>
                                                {count > 0 && <span className="ts-mono text-[11px] text-[var(--color-fg-dim)]">{count}</span>}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {activeFilterChips.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="ts-btn ts-btn-ghost w-full"
                            >
                                <i className="fas fa-times text-[10px]"></i>
                                Xóa toàn bộ bộ lọc
                            </button>
                        )}
                    </aside>

                    {/* MAIN */}
                    <div className="flex-1 h-full overflow-y-auto flex flex-col">
                        <div className="sticky top-0 z-20 bg-[var(--color-background)] border-b border-[var(--color-border)]">
                            {activeCategoryName && (
                                <div className="px-4 py-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-bold tracking-tight text-[var(--color-fg)]">{activeCategoryName}</h1>
                                        <span className="text-xs text-[var(--color-fg-dim)] border-l border-[var(--color-border)] pl-2 hidden sm:inline">
                                            {activeCategoryDescription}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[var(--color-fg-muted)]">
                                        <span className="font-semibold text-[var(--color-primary)]">{products.length}</span> / {totalPages * PAGE_SIZE}
                                    </div>
                                </div>
                            )}

                            <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
                            <FilterDropdown
                                title="Khoảng giá"
                                options={commonPriceOptions}
                                value={currentPricePreset}
                                onChange={(v) => handlePricePreset(commonPriceOptions.find((o) => o.value === v) || commonPriceOptions[0])}
                            />
                            <FilterDropdown
                                title="Tình trạng"
                                options={statusOptions}
                                value={urlInStock ? 'in-stock' : ''}
                                onChange={(v) => setParam('inStock', v === 'in-stock' ? 'true' : '')}
                            />
                            <FilterDropdown
                                title="Ưu đãi"
                                options={offerOptions}
                                value={urlOffer}
                                onChange={(v) => setParam('offer', v)}
                            />
                            {currentFilterGroups
                                .filter((group) => group.title !== 'Khoảng giá')
                                .map((group) => (
                                <FilterDropdown
                                    key={group.key}
                                    title={group.title}
                                    options={group.options}
                                    value={currentFilterValues[group.key]}
                                    onChange={(v) => setParam(group.key, v)}
                                />
                            ))}
                        </div>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center gap-3 px-4 shrink-0">
                            <div className="flex-1">
                                <p className="text-sm text-[var(--color-fg-muted)]">
                                    {keyword
                                        ? <>Kết quả cho <span className="ts-mono text-[var(--color-accent)]">"{keyword}"</span></>
                                        : `Hiển thị ${products.length} / ${totalPages * PAGE_SIZE} sản phẩm`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen((v) => !v)}
                                className="ts-btn ts-btn-outline text-xs lg:hidden"
                            >
                                <i className="fas fa-sliders-h"></i>Bộ lọc
                            </button>
                            <div className="relative">
                                <select
                                    value={urlSortBy}
                                    onChange={(e) => setParam('sort', e.target.value)}
                                    className="ts-input w-auto appearance-none pr-9 text-xs"
                                >
                                    <option value="">Sắp xếp mặc định</option>
                                    <option value="name_desc">Mới nhất</option>
                                    <option value="price_asc">Giá: thấp → cao</option>
                                    <option value="price_desc">Giá: cao → thấp</option>
                                    <option value="name_asc">Tên A → Z</option>
                                </select>
                                <i className="fas fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-fg-dim)]"></i>
                            </div>
                        </div>

                        {activeFilterChips.length > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2 px-4 shrink-0">
                                <span className="ts-eyebrow text-[10px]">Bộ lọc:</span>
                                {activeFilterChips.map((chip, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={chip.onRemove}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-fg)]"
                                    >
                                        {chip.label}
                                        <i className="fas fa-times text-[9px]"></i>
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 px-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="aspect-[3/4] animate-pulse rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center px-4">
                                <i className="fas fa-search text-2xl text-[var(--color-fg-dim)]"></i>
                                <p className="mt-4 text-sm text-[var(--color-fg-muted)]">{t('No products found')}</p>
                                <button onClick={handleClearAll} className="ts-btn ts-btn-ghost mt-4 text-xs">
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 px-4">
                                    {products.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            onClickCapture={() => recordRecentlyViewed(product)}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-center gap-1 pb-4">
                                        <button
                                            type="button"
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--color-border)] text-xs text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-fg)] disabled:opacity-30"
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                            .reduce((acc, p, idx, arr) => {
                                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, idx) =>
                                                p === '...' ? (
                                                    <span key={`e-${idx}`} className="px-2 text-xs text-[var(--color-fg-dim)]">…</span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setPage(p)}
                                                        className={cn(
                                                            "h-9 min-w-9 rounded-sm border px-2 text-xs transition-colors",
                                                            p === page
                                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-fg)]"
                                                                : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )
                                        }
                                        <button
                                            type="button"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--color-border)] text-xs text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-fg)] disabled:opacity-30"
                                        >
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Shop;
