
import { ADMIN_PANEL_ROLES } from '../../constants/roles';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { productApi, categoryApi, specApi, uploadApi, brandApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast, confirmDialog } from '../../utils/notify';
import { formatCurrency, resolveProductImage } from '../../utils/store';

const inputClass = 'rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100';

const normalizeSkuPart = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeProductCode = (value = '') => {
    return normalizeSkuPart(value).replace(/-/g, '');
};

const safeNormalizeSkuPart = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const safeNormalizeProductCode = (value = '') => safeNormalizeSkuPart(value).replace(/-/g, '');

const normalizeSpecKey = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const categoryPrefixMap = {
    phone: 'PHONE',
    smartphone: 'PHONE',
    'dien-thoai': 'PHONE',
    laptop: 'LAP',
    tablet: 'TAB',
    gaming: 'GAME',
    watch: 'WATCH',
    smartwatch: 'WATCH',
    'dong-ho-thong-minh': 'WATCH',
    camera: 'CAM',
    'may-anh': 'CAM',
    headphone: 'HEAD',
    headphones: 'HEAD',
    'tai-nghe': 'HEAD',
    audio: 'AUDIO',
    'am-thanh': 'AUDIO',
    'audio-am-thanh': 'AUDIO',
};

const getCategoryPrefix = (category) => {
    const source = category?.slug || category?.Slug || category?.name || category?.Name || '';
    const key = safeNormalizeSkuPart(source).toLowerCase();
    return categoryPrefixMap[key] || safeNormalizeSkuPart(source).replace(/-/g, '').slice(0, 6) || 'PROD';
};

const getCategoryKey = (category) => safeNormalizeSkuPart(category?.slug || category?.Slug || category?.name || category?.Name || '').toLowerCase();

const getWarrantyOptions = (category) => {
    const key = getCategoryKey(category);
    const prefix = getCategoryPrefix(category);
    if (['phone', 'smartphone', 'dien-thoai'].includes(key) || prefix === 'PHONE') return [12];
    if (key === 'laptop' || prefix === 'LAP') return [12, 24];
    if (key === 'tablet' || prefix === 'TAB') return [12];
    if (['watch', 'smartwatch', 'dong-ho-thong-minh'].includes(key) || prefix === 'WATCH') return [12];
    if (['camera', 'may-anh'].includes(key) || prefix === 'CAM') return [12, 24];
    if (['headphone', 'headphones', 'tai-nghe'].includes(key) || prefix === 'HEAD') return [6, 12];
    if (['audio', 'am-thanh'].includes(key) || prefix === 'AUDIO') return [12, 18, 24];
    return [12];
};

// Phụ kiện âm thanh / tai nghe mặc định không cần theo dõi serial từng đơn vị
const getDefaultSerialTracking = (category) => {
    const prefix = getCategoryPrefix(category);
    return !(prefix === 'HEAD' || prefix === 'AUDIO');
};

const getVariantMode = (category) => {
    const key = getCategoryKey(category);
    const prefix = getCategoryPrefix(category);
    if (
        ['phone', 'smartphone', 'dien-thoai'].includes(key) ||
        key === 'tablet' ||
        key === 'laptop' ||
        prefix === 'PHONE' ||
        prefix === 'TAB' ||
        prefix === 'LAP'
    ) {
        return 'ram-storage-color';
    }

    return 'version-color';
};

const getStorageSpecAliases = (category) => {
    const key = getCategoryKey(category);
    const prefix = getCategoryPrefix(category);

    if (['phone', 'smartphone', 'dien-thoai'].includes(key) || prefix === 'PHONE') {
        return ['internalstorage', 'bonhotrong', 'dungluong', 'storage'];
    }

    if (key === 'tablet' || prefix === 'TAB') {
        return ['internalstorage', 'bonhotrong', 'dungluong', 'storage'];
    }

    if (key === 'laptop' || prefix === 'LAP') {
        return ['harddrive', 'ocung', 'ssd', 'hdd', 'storage'];
    }

    return [];
};

const getStorageFieldLabel = (category) => {
    const key = getCategoryKey(category);
    const prefix = getCategoryPrefix(category);
    return key === 'laptop' || prefix === 'LAP' ? 'O cung' : 'Bo nho';
};

const getFallbackVariantOptions = (category) => {
    const key = getCategoryKey(category);
    const prefix = getCategoryPrefix(category);

    if (['phone', 'smartphone', 'dien-thoai'].includes(key) || prefix === 'PHONE') {
        return {
            ram: ['4GB', '6GB', '8GB', '12GB', '16GB'],
            storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
            colors: ['Den', 'Trang', 'Xanh', 'Hong', 'Tim', 'Titan Den', 'Titan Trang', 'Titan Tu Nhien'],
        };
    }

    if (key === 'laptop' || prefix === 'LAP') {
        return {
            ram: ['8GB', '16GB', '32GB'],
            storage: ['256GB SSD', '512GB SSD', '1TB SSD'],
            versions: ['Gaming', 'OLED', 'Touch'],
            colors: ['Bạc', 'Đen', 'Midnight', 'Starlight'],
        };
    }

    if (['watch', 'smartwatch', 'dong-ho-thong-minh'].includes(key) || prefix === 'WATCH') {
        return {
            versions: ['GPS', 'GPS + Cellular'],
            caseSizes: ['40mm', '44mm', '45mm'],
            colors: ['Đen', 'Bạc', 'Vàng'],
        };
    }

    if (key === 'tablet' || prefix === 'TAB') {
        return {
            ram: ['6GB', '8GB', '12GB'],
            storage: ['128GB', '256GB', '512GB'],
            versions: ['WiFi', 'WiFi + Cellular'],
            colors: ['Xám', 'Bạc', 'Xanh'],
        };
    }

    if (['camera', 'may-anh'].includes(key) || prefix === 'CAM') {
        return {
            versions: ['Body Only', 'Kit 18-45mm', 'Kit 18-55mm'],
            colors: ['Đen', 'Bạc'],
        };
    }

    if (['headphone', 'headphones', 'tai-nghe'].includes(key) || prefix === 'HEAD') {
        return {
            versions: ['USB-C', 'Lightning', 'Bluetooth', 'Có dây'],
            colors: ['Trắng', 'Đen', 'Xanh'],
        };
    }

    if (['audio', 'am-thanh'].includes(key) || prefix === 'AUDIO') {
        return {
            versions: ['Mini', 'Plus', 'Pro', 'Soundbar', 'Subwoofer'],
            colors: ['Đen', 'Trắng', 'Nâu'],
        };
    }

    return {};
};

const shouldUseVersionAxis = (category) => {
    const key = getCategoryKey(category);
    const prefix = getCategoryPrefix(category);
    return getVariantMode(category) === 'version-color' || key === 'tablet' || prefix === 'TAB' || key === 'laptop' || prefix === 'LAP';
};

const shouldUseCaseSizeAxis = (category) => {
    const key = getCategoryKey(category);
    const prefix = getCategoryPrefix(category);
    return ['watch', 'smartwatch', 'dong-ho-thong-minh'].includes(key) || prefix === 'WATCH';
};

const mergeOptions = (...groups) => {
    const seen = new Set();
    return groups.flat().map((option) => String(option || '').trim()).filter((option) => {
        if (!option) return false;
        const key = normalizeSpecKey(option);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const preferConfiguredOptions = (configuredOptions = [], fallbackOptions = []) => {
    const options = mergeOptions(configuredOptions);
    return options.length > 0 ? options : mergeOptions(fallbackOptions);
};

const colorHexMap = {
    den: '#000000',
    trang: '#ffffff',
    bac: '#c0c0c0',
    vang: '#facc15',
    midnight: '#111827',
    starlight: '#f5f0e6',
    xam: '#6b7280',
    xanh: '#2563eb',
    hong: '#f9a8d4',
    tim: '#8b5cf6',
    be: '#e5d3b3',
    kem: '#fff7ed',
    do: '#dc2626',
    graphite: '#374151',
    silver: '#c0c0c0',
    spacegray: '#4b5563',
    titanden: '#1f2937',
    titantrang: '#f3f4f6',
    titantunhien: '#d6d3d1',
};

const getColorHex = (colorName) => colorHexMap[normalizeSpecKey(colorName)] || '';

const joinVariantParts = (...parts) => parts.map((part) => String(part || '').trim()).filter(Boolean).join(' - ');

const buildVariantName = (category, variant = {}) => {
    const mode = getVariantMode(category);
    if (mode === 'ram-storage-color') {
        return joinVariantParts(
            variant.ram ?? variant.Ram,
            variant.storage ?? variant.Storage,
            shouldUseVersionAxis(category) ? (variant.variantOption ?? variant.VariantOption) : '',
            variant.colorName ?? variant.ColorName);
    }

    if (shouldUseCaseSizeAxis(category)) {
        return joinVariantParts(
            variant.variantOption ?? variant.VariantOption ?? variant.variantName ?? variant.VariantName,
            variant.storage ?? variant.Storage,
            variant.colorName ?? variant.ColorName);
    }

    return joinVariantParts(variant.variantOption ?? variant.VariantOption ?? variant.variantName ?? variant.VariantName, variant.colorName ?? variant.ColorName);
};

const inferVariantOption = (variant = {}) => {
    const currentName = String(variant.variantName ?? variant.VariantName ?? '').trim();
    const colorName = String(variant.colorName ?? variant.ColorName ?? '').trim();
    if (!currentName) return '';
    if (!colorName) return currentName;

    const colorSuffix = ` - ${colorName}`;
    if (currentName.endsWith(colorSuffix)) {
        return currentName.slice(0, -colorSuffix.length).trim();
    }

    return currentName;
};

const inferCaseSizeOption = (variant = {}) => {
    const currentStorage = String(variant.storage ?? variant.Storage ?? '').trim();
    if (currentStorage) return currentStorage;

    const currentName = String(variant.variantName ?? variant.VariantName ?? '').trim();
    return currentName.match(/\b\d{2}mm\b/i)?.[0] || '';
};

const inferVersionOption = (category, variant = {}) => {
    const inferred = inferVariantOption(variant);
    if (!shouldUseCaseSizeAxis(category)) return inferred;

    const caseSize = inferCaseSizeOption(variant);
    return caseSize ? inferred.replace(new RegExp(`\\s*-\\s*${caseSize}\\b`, 'i'), '').trim() : inferred;
};

const buildProductSku = (category, name) => {
    const code = safeNormalizeProductCode(name);
    return code ? `${getCategoryPrefix(category)}-${code}` : '';
};

const buildVariantSku = (productSku, variant = {}, category = null) => {
    const mode = getVariantMode(category);
    const parts = mode === 'ram-storage-color'
        ? [
            productSku,
            safeNormalizeSkuPart(variant.ram ?? variant.Ram),
            safeNormalizeSkuPart(variant.storage ?? variant.Storage),
            shouldUseVersionAxis(category) ? safeNormalizeSkuPart(variant.variantOption ?? variant.VariantOption) : '',
            safeNormalizeSkuPart(variant.colorName ?? variant.ColorName),
        ]
        : shouldUseCaseSizeAxis(category)
            ? [
                productSku,
                safeNormalizeSkuPart(variant.variantOption ?? variant.VariantOption),
                safeNormalizeSkuPart(variant.storage ?? variant.Storage),
                safeNormalizeSkuPart(variant.colorName ?? variant.ColorName),
            ]
        : [
            productSku,
            safeNormalizeSkuPart(variant.variantOption ?? variant.VariantOption),
            safeNormalizeSkuPart(variant.colorName ?? variant.ColorName),
        ];
    return parts.filter(Boolean).join('-');
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [submittedKeyword, setSubmittedKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [nameOptions, setNameOptions] = useState([]);
    const [stockFilter, setStockFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [specDefinitions, setSpecDefinitions] = useState([]);
    const [specValues, setSpecValues] = useState({});
    const [newSpecOptionValues, setNewSpecOptionValues] = useState({});
    const [addingSpecOptionIds, setAddingSpecOptionIds] = useState({});
    const [newVariantOptionValues, setNewVariantOptionValues] = useState({});
    const [addingVariantOptionKeys, setAddingVariantOptionKeys] = useState({});
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingVariantImages, setUploadingVariantImages] = useState({});
    const [brands, setBrands] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitLockRef = useRef(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        brand: '',
        price: 0,
        originalPrice: '',
        stock: 0,
        description: '',
        longDescription: '',
        imageUrl: '',
        images: [],
        variants: [],
        categoryId: '',
        additionalCategoryIds: [],
        warrantyMonths: 12,
        requiresSerialTracking: true,
        isActive: true,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false,
        isDiscounted: false,
    });
    const [error, setError] = useState('');
    const { isAdmin, hasRole } = useAuth();
    const canManageProducts = isAdmin();
    const canViewProductDetails = hasRole(ADMIN_PANEL_ROLES);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [page, submittedKeyword, categoryId]);

    // Nạp danh sách tên sản phẩm có sẵn (theo danh mục) cho dropdown tìm kiếm
    useEffect(() => {
        loadNameOptions(categoryId);
    }, [categoryId]);

    const loadNameOptions = async (filterCategoryId) => {
        try {
            const response = await productApi.search({
                categoryId: filterCategoryId || undefined,
                includeInactive: true,
                page: 1,
                pageSize: 100,
            });
            const items = response.data.items || response.data.data || [];
            const names = [...new Set(items.map((p) => p.name ?? p.Name).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b, 'vi'));
            setNameOptions(names);
        } catch (err) {
            console.error('Không thể tải danh sách tên sản phẩm:', err);
            setNameOptions([]);
        }
    };

    const loadSpecDefinitions = async (nextCategoryId, productSpecs = []) => {
        if (!nextCategoryId) {
            setSpecDefinitions([]);
            setSpecValues({});
            return;
        }

        try {
            const response = await specApi.getDefinitions(nextCategoryId);
            const definitions = Array.isArray(response.data) ? response.data : [];
            const values = {};
            productSpecs.forEach((spec) => {
                const definitionId = spec.specDefinitionId ?? spec.SpecDefinitionId;
                if (!definitionId) return;
                values[definitionId] = {
                    specOptionId: spec.specOptionId ?? spec.SpecOptionId ?? '',
                    value: spec.valueText ?? spec.optionValue ?? spec.value ?? spec.valueNumber ?? spec.valueBool ?? '',
                };
            });
            setSpecDefinitions(definitions);
            setSpecValues(values);
        } catch (err) {
            console.error('Khong the tai thong so:', err);
            setSpecDefinitions([]);
            setSpecValues({});
        }
    };

    const loadCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            setCategories(response.data || []);
        } catch (err) {
            console.error('Không thể tải danh mục:', err);
        }
    };

    const loadBrands = async (categoryId) => {
        if (!categoryId) {
            setBrands([]);
            return;
        }
        setBrands([]);
        try {
            const response = await brandApi.getByCategory(categoryId);
            const list = Array.isArray(response.data) ? response.data : [];
            const categoryBrands = [...new Set(list.map((b) => b.name ?? b.Name).filter(Boolean))];
            setBrands(categoryBrands);
        } catch (err) {
            console.error('Không thể tải thương hiệu:', err);
            setBrands([]);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.search({
                keyword: submittedKeyword,
                categoryId: categoryId || undefined,
                includeInactive: true,
                page,
                pageSize,
            });
            setProducts(response.data.items || response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (err) {
            console.error('Không thể tải sản phẩm:', err);
        } finally {
            setLoading(false);
        }
    };

    const visibleProducts = useMemo(() => {
        let filtered = products;
        if (stockFilter === 'low') filtered = products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 10);
        else if (stockFilter === 'out') filtered = products.filter((product) => Number(product.stock || 0) <= 0);
        else if (stockFilter === 'available') filtered = products.filter((product) => Number(product.stock || 0) > 10);

        return [...filtered]
            .map((product) => ({
                ...product,
                totalValue: Number(product.price || 0) * Number(product.stock || 0),
            }))
            .sort((a, b) => b.totalValue - a.totalValue);
    }, [products, stockFilter]);

    const inventoryStats = useMemo(() => {
        return products.reduce((acc, product) => {
            const stock = Number(product.stock || 0);
            acc.totalStock += stock;
            if (stock <= 0) acc.out += 1;
            else if (stock <= 10) acc.low += 1;
            else acc.available += 1;
            return acc;
        }, { totalStock: 0, low: 0, out: 0, available: 0 });
    }, [products]);

    const selectedFormCategory = useMemo(() => {
        const id = Number(formData.categoryId || 0);
        return categories.find((cat) => Number(cat.id ?? cat.Id) === id) || null;
    }, [categories, formData.categoryId]);
    const warrantyOptions = useMemo(() => getWarrantyOptions(selectedFormCategory), [selectedFormCategory]);

    const syncVariantSkus = (variants, oldProductSku, nextProductSku, force = false, category = null) => (variants || []).map((variant) => {
        const currentAutoSku = buildVariantSku(oldProductSku, variant, category);
        const nextAutoSku = buildVariantSku(nextProductSku, variant, category);
        const shouldUpdate = force || !String(variant.sku || '').trim() || variant.sku === currentAutoSku;
        return shouldUpdate ? { ...variant, sku: nextAutoSku } : variant;
    });

    const applyProductSkuSuggestion = (patch, force = false) => {
        setFormData((current) => {
            const next = { ...current, ...patch };
            const category = categories.find((cat) => Number(cat.id ?? cat.Id) === Number(next.categoryId || 0));
            const nextSku = buildProductSku(category, next.name);
            if (!nextSku) return next;

            const currentCategory = categories.find((cat) => Number(cat.id ?? cat.Id) === Number(current.categoryId || 0));
            const currentAutoSku = buildProductSku(currentCategory, current.name);
            const shouldUpdate = force || !String(current.sku || '').trim() || current.sku === currentAutoSku;
            if (!shouldUpdate) return next;

            return {
                ...next,
                sku: nextSku,
                variants: syncVariantSkus(next.variants, current.sku || currentAutoSku, nextSku, false, category),
            };
        });
    };

    const regenerateProductSku = () => {
        applyProductSkuSuggestion({}, true);
    };

    const handleNameChange = (value) => {
        applyProductSkuSuggestion({ name: value });
    };

    const handleProductSkuChange = (value) => {
        const previousSku = formData.sku;
        setFormData((current) => ({
            ...current,
            sku: value,
            variants: syncVariantSkus(current.variants, previousSku, value, false, selectedFormCategory),
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSubmittedKeyword(keyword.trim());
        setPage(1);
    };

    const openModal = async (product = null) => {
        setNewSpecOptionValues({});
        setAddingSpecOptionIds({});
        setNewVariantOptionValues({});
        setAddingVariantOptionKeys({});
        if (product) {
            let detail = product;
            try {
                const response = await productApi.getById(product.id, { includeInactive: true });
                detail = response.data || product;
            } catch (err) {
                console.error('Khong the tai chi tiet san pham:', err);
            }

            setEditingProduct(detail);
            const detailCategory = categories.find((cat) => Number(cat.id ?? cat.Id) === Number(detail.categoryId || 0)) || null;
            const detailWarrantyOptions = getWarrantyOptions(detailCategory);
            const detailWarranty = Number(detail.warrantyMonths) || 12;
            const resolvedWarranty = detailWarrantyOptions.includes(detailWarranty) ? detailWarranty : (detailWarrantyOptions[0] || 12);

            // Collect additional category IDs from productCategories if available
            const additionalIds = Array.isArray(detail.productCategories)
                ? detail.productCategories
                    .map(pc => pc.categoryId ?? pc.CategoryId)
                    .filter(id => Number(id) > 0 && Number(id) !== Number(detail.categoryId))
                : [];

            setFormData({
                name: detail.name,
                sku: detail.sku || '',
                price: detail.price,
                originalPrice: detail.originalPrice ?? '',
                stock: detail.stock,
                description: detail.description || '',
                longDescription: detail.longDescription || '',
                imageUrl: detail.imageUrl || '',
                images: Array.isArray(detail.images) ? detail.images : [],
                variants: Array.isArray(detail.variants) ? detail.variants.map((variant) => ({
                    ...variant,
                    variantOption: getVariantMode(detailCategory) === 'version-color' ? inferVersionOption(detailCategory, variant) : '',
                    storage: shouldUseCaseSizeAxis(detailCategory) ? inferCaseSizeOption(variant) : variant.storage,
                })) : [],
                brand: detail.brand || '',
                categoryId: detail.categoryId,
                additionalCategoryIds: additionalIds,
                warrantyMonths: resolvedWarranty,
                requiresSerialTracking: detail.requiresSerialTracking !== false,
                isActive: detail.isActive !== false,
                isFeatured: Boolean(detail.isFeatured),
                isBestSeller: Boolean(detail.isBestSeller),
                isNewArrival: Boolean(detail.isNewArrival),
                isDiscounted: Boolean(detail.isDiscounted),
            });
            await Promise.all([
                loadSpecDefinitions(detail.categoryId, detail.specs || []),
                loadBrands(detail.categoryId),
            ]);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: '',
                price: 0,
                originalPrice: '',
                stock: 0,
                description: '',
                longDescription: '',
                imageUrl: '',
                images: [],
                variants: [],
                brand: '',
                categoryId: '',
                additionalCategoryIds: [],
                warrantyMonths: '',
                requiresSerialTracking: true,
                isActive: true,
                isFeatured: false,
                isBestSeller: false,
                isNewArrival: false,
                isDiscounted: false,
            });
            setSpecDefinitions([]);
            setSpecValues({});
            setBrands([]);
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setNewSpecOptionValues({});
        setAddingSpecOptionIds({});
        setNewVariantOptionValues({});
        setAddingVariantOptionKeys({});
        setError('');
    };

    const updateImage = (index, patch) => {
        setFormData((current) => ({
            ...current,
            images: current.images.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
        }));
    };

    const addVariant = () => {
        setFormData((current) => ({
            ...current,
            variants: [
                ...(current.variants || []),
                (() => {
                    const category = categories.find((cat) => Number(cat.id ?? cat.Id) === Number(current.categoryId || 0)) || null;
                    const mode = getVariantMode(category);
                    const fallbackOptions = getFallbackVariantOptions(category);
                    const nextVariant = {
                        variantName: '',
                        variantOption: shouldUseVersionAxis(category) ? (fallbackOptions.versions?.[0] || '') : '',
                        colorName: '',
                        colorCode: '',
                        storage: '',
                        ram: '',
                        price: current.price || 0,
                        originalPrice: '',
                        stock: 0,
                        sku: '',
                        imageUrl: current.imageUrl || '',
                        isActive: true,
                    };

                    nextVariant.variantName = buildVariantName(category, nextVariant);
                    nextVariant.sku = buildVariantSku(current.sku, nextVariant, category);
                    return nextVariant;
                })(),
            ],
        }));
    };

    const updateVariant = (index, patch) => {
        setFormData((current) => ({
            ...current,
            variants: (current.variants || []).map((item, itemIndex) => {
                if (itemIndex !== index) return item;
                const category = categories.find((cat) => Number(cat.id ?? cat.Id) === Number(current.categoryId || 0)) || null;
                const next = { ...item, ...patch };
                if (Object.prototype.hasOwnProperty.call(patch, 'colorName') && !Object.prototype.hasOwnProperty.call(patch, 'colorCode')) {
                    const suggestedColorCode = getColorHex(patch.colorName);
                    if (suggestedColorCode && (!String(item.colorCode || '').trim() || item.colorCode === getColorHex(item.colorName))) {
                        next.colorCode = suggestedColorCode;
                    }
                }
                next.variantName = buildVariantName(category, next);
                if (Object.prototype.hasOwnProperty.call(patch, 'sku')) return next;

                const previousAutoSku = buildVariantSku(current.sku, item, category);
                const nextAutoSku = buildVariantSku(current.sku, next, category);
                if (!String(item.sku || '').trim() || item.sku === previousAutoSku) {
                    return { ...next, sku: nextAutoSku };
                }
                return next;
            }),
        }));
    };

    const removeVariant = (index) => {
        setFormData((current) => ({
            ...current,
            variants: (current.variants || []).filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const handleCategoryChange = async (nextCategoryId) => {
        const nextCategory = categories.find((cat) => Number(cat.id ?? cat.Id) === Number(nextCategoryId || 0));
        if (!nextCategoryId) {
            applyProductSkuSuggestion({
                categoryId: '',
                brand: '',
                warrantyMonths: '',
                variants: [],
            });
            setSpecDefinitions([]);
            setSpecValues({});
            setBrands([]);
            return;
        }

        const nextWarrantyOptions = getWarrantyOptions(nextCategory);
        const currentWarranty = Number(formData.warrantyMonths || 12);
        const nextVariantMode = getVariantMode(nextCategory);
        const nextFallbackOptions = getFallbackVariantOptions(nextCategory);
        applyProductSkuSuggestion({
            categoryId: nextCategoryId,
            brand: '',
            warrantyMonths: nextWarrantyOptions.includes(currentWarranty) ? currentWarranty : nextWarrantyOptions[0],
            requiresSerialTracking: getDefaultSerialTracking(nextCategory),
            variants: (formData.variants || []).map((variant) => {
                const nextVariant = {
                    ...variant,
                    variantOption: shouldUseVersionAxis(nextCategory)
                        ? (String(variant.variantOption || '').trim() || inferVersionOption(nextCategory, variant) || nextFallbackOptions.versions?.[0] || '')
                        : '',
                    ram: nextVariantMode === 'ram-storage-color' ? variant.ram : '',
                    storage: nextVariantMode === 'ram-storage-color' || shouldUseCaseSizeAxis(nextCategory) ? variant.storage : '',
                };
                return {
                    ...nextVariant,
                    variantName: buildVariantName(nextCategory, nextVariant),
                };
            }),
        });
        await Promise.all([
            loadSpecDefinitions(nextCategoryId, []),
            loadBrands(nextCategoryId),
        ]);
    };

    const setPrimaryImage = (imageUrl) => {
        setFormData((current) => ({
            ...current,
            imageUrl,
            images: (current.images || []).map((image) => ({ ...image, isPrimary: image.imageUrl === imageUrl })),
        }));
    };

    const removeImage = (index) => {
        setFormData((current) => {
            const currentImages = current.images || [];
            const removedImage = currentImages[index];
            const nextImages = currentImages.filter((_, itemIndex) => itemIndex !== index);
            const nextMainImage = removedImage?.imageUrl === current.imageUrl ? (nextImages[0]?.imageUrl || '') : current.imageUrl;

            return {
                ...current,
                imageUrl: nextMainImage,
                images: nextImages.map((image) => ({ ...image, isPrimary: image.imageUrl === nextMainImage })),
            };
        });
    };

    const handleUploadImages = async (files) => {
        const selectedFiles = Array.from(files || []);
        if (selectedFiles.length === 0) return;

        setUploadingImages(true);
        try {
            const response = await uploadApi.uploadProductImages(selectedFiles);
            console.log('Upload response:', response.data);
            const urls = Array.isArray(response.data?.urls) ? response.data.urls.filter(Boolean) : [];
            console.log('Extracted URLs:', urls);
            if (urls.length === 0) {
                console.error('No URLs returned from upload');
                return;
            }

            setFormData((current) => {
                const hasMainImage = Boolean(String(current.imageUrl || '').trim());
                const mainImageUrl = hasMainImage ? current.imageUrl : urls[0];
                const existingUrls = new Set((current.images || []).map((image) => image.imageUrl));
                const uploadedImages = urls
                    .filter((url) => !existingUrls.has(url))
                    .map((url, index) => ({
                        imageUrl: url,
                        altText: current.name || '',
                        sortOrder: (current.images || []).length + index,
                        isPrimary: url === mainImageUrl,
                    }));

                console.log('Uploaded images to add:', uploadedImages);
                const newFormData = {
                    ...current,
                    imageUrl: mainImageUrl,
                    images: [...(current.images || []), ...uploadedImages].map((image) => ({
                        ...image,
                        isPrimary: image.imageUrl === mainImageUrl,
                    })),
                };
                console.log('New formData images:', newFormData.images);
                return newFormData;
            });
        } catch (err) {
            console.error('Upload error:', err);
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Khong the upload anh san pham');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleUploadVariantImage = async (index, files) => {
        const selectedFiles = Array.from(files || []);
        if (selectedFiles.length === 0) return;

        setUploadingVariantImages((current) => ({ ...current, [index]: true }));
        try {
            const response = await uploadApi.uploadProductImages([selectedFiles[0]]);
            const urls = Array.isArray(response.data?.urls) ? response.data.urls.filter(Boolean) : [];
            if (urls.length === 0) {
                setError('Khong the upload anh bien the');
                return;
            }

            updateVariant(index, { imageUrl: urls[0] });
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Khong the upload anh bien the');
        } finally {
            setUploadingVariantImages((current) => {
                const next = { ...current };
                delete next[index];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitLockRef.current) return;
        submitLockRef.current = true;
        setIsSubmitting(true);
        setError('');

        try {
            const hasVariant = (formData.variants || []).some((variant) =>
                String(variant.variantName || '').trim() ||
                String(variant.colorName || '').trim() ||
                String(variant.storage || '').trim() ||
                String(variant.ram || '').trim() ||
                String(variant.sku || '').trim());
            if (!hasVariant) {
                setError('Vui lòng thêm ít nhất 1 biến thể (phiên bản) để bán sản phẩm.');
                return;
            }
            const selectedBrand = String(formData.brand || '').trim();
            if (formData.categoryId && brands.length === 0) {
                setError('Danh mục này chưa có thương hiệu. Hãy cấu hình Brand master trước khi tạo sản phẩm.');
                return;
            }
            if (brands.length > 0 && (!selectedBrand || !brands.includes(selectedBrand))) {
                setError('Vui lòng chọn Hãng/Thương hiệu thuộc đúng danh mục từ Brand master.');
                return;
            }

            const images = (formData.images || [])
                .filter((image) => String(image.imageUrl || '').trim())
                .map((image, index) => ({
                    ...image,
                    imageUrl: String(image.imageUrl || '').trim(),
                    altText: image.altText || null,
                    sortOrder: Number(image.sortOrder || index),
                    isPrimary: Boolean(image.isPrimary),
                }));

            const data = {
                ...formData,
                sku: String(formData.sku || '').trim() || null,
                brand: String(formData.brand || '').trim() || null,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice === '' || formData.originalPrice == null ? null : Number(formData.originalPrice),
                stock: editingProduct ? Number(editingProduct.stock || 0) : 0,
                categoryId: parseInt(formData.categoryId),
                longDescription: String(formData.longDescription || '').trim() || null,
                requiresSerialTracking: formData.requiresSerialTracking !== false,
                warrantyMonths: Math.max(1, Number(formData.warrantyMonths || 12)),
                isActive: formData.isActive !== false,
                isFeatured: Boolean(formData.isFeatured),
                isBestSeller: Boolean(formData.isBestSeller),
                isNewArrival: Boolean(formData.isNewArrival),
                isDiscounted: Boolean(formData.isDiscounted),
                images,
                variants: (formData.variants || [])
                    .filter((variant) =>
                        String(variant.variantName || '').trim() ||
                        String(variant.colorName || '').trim() ||
                        String(variant.storage || '').trim() ||
                        String(variant.ram || '').trim() ||
                        String(variant.sku || '').trim())
                    .map((variant) => ({
                        id: variant.id ?? variant.Id ?? 0,
                        variantName: String(variant.variantName || '').trim() || null,
                        colorName: String(variant.colorName || '').trim() || null,
                        colorCode: String(variant.colorCode || '').trim() || null,
                        storage: String(variant.storage || '').trim() || null,
                        ram: String(variant.ram || '').trim() || null,
                        price: variant.price === '' || variant.price == null ? null : Number(variant.price),
                        originalPrice: variant.originalPrice === '' || variant.originalPrice == null ? null : Number(variant.originalPrice),
                        stock: Math.max(0, Number(variant.stock || 0)),
                        sku: String(variant.sku || '').trim() || null,
                        imageUrl: String(variant.imageUrl || '').trim() || null,
                        isActive: variant.isActive !== false,
                    })),
            };

            let savedProduct;
            if (editingProduct) {
                const response = await productApi.update(editingProduct.id, data);
                savedProduct = response.data || { id: editingProduct.id };
            } else {
                const response = await productApi.create(data);
                savedProduct = response.data;
            }

            const savedProductId = savedProduct?.id || editingProduct?.id;
            if (savedProductId && specDefinitions.length > 0) {
                const specPayload = specDefinitions.filter((definition) => !definition.isVariantAxis).map((definition) => {
                    const stateValue = specValues[definition.id] || {};
                    const rawValue = typeof stateValue === 'object' ? stateValue.value : stateValue;
                    const specOptionId = typeof stateValue === 'object' ? stateValue.specOptionId : null;
                    const inputType = String(definition.inputType || definition.dataType || 'text');
                    const normalizedInputType = inputType.toLowerCase();
                    const isBooleanSpec = normalizedInputType === 'boolean' || normalizedInputType === 'bool';
                    const selectedOptionId = specOptionId ? Number(specOptionId) : null;
                    const selectedText = rawValue != null && String(rawValue).trim() ? String(rawValue).trim() : null;
                    return {
                        specDefinitionId: definition.id,
                        specOptionId: selectedOptionId,
                        valueText: isBooleanSpec ? null : selectedText,
                        valueNumber: null,
                        valueBool: isBooleanSpec && rawValue !== '' && rawValue != null ? rawValue === true || rawValue === 'true' : null,
                    };
                });
                await specApi.updateProductSpecs(savedProductId, specPayload);
            }

            closeModal();
            loadProducts();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || data?.detail || data?.title || 'Thao tác thất bại');
        } finally {
            submitLockRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!(await confirmDialog('Bạn có chắc muốn xóa sản phẩm này?'))) return;

        try {
            await productApi.delete(id);
            loadProducts();
        } catch (err) {
            toast.error('Không thể xóa sản phẩm');
        }
    };

    const stockBadge = (stock) => {
        const value = Number(stock || 0);
        if (value <= 0) return 'bg-red-500/10 text-red-300 ring-red-500/30';
        if (value <= 10) return 'bg-[var(--color-surface-2)] text-amber-300 ring-[var(--color-border)]';
        return 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30';
    };

    // Tách thông số chung vs trục biến thể (RAM/Bộ nhớ/Màu) để dùng làm dropdown cho variant
    const productSpecDefs = specDefinitions.filter((d) => !d.isVariantAxis);
    const variantAxisDefs = specDefinitions.filter((d) => d.isVariantAxis);
    const axisDefinition = (codes) => {
        const normalizedCodes = codes.map((code) => normalizeSpecKey(code));
        const definitions = [...variantAxisDefs, ...productSpecDefs];
        return definitions.find((definition) => {
            const code = normalizeSpecKey(definition.code || definition.Code || '');
            const name = normalizeSpecKey(definition.name || definition.Name || '');
            return normalizedCodes.includes(code) || normalizedCodes.includes(name);
        }) || null;
    };
    const axisOptions = (codes) => {
        const def = axisDefinition(codes);
        return (def?.options || []).map((o) => o.value ?? o.Value).filter(Boolean);
    };
    const selectedVariantMode = getVariantMode(selectedFormCategory);
    const versionDefinition = productSpecDefs.find((definition) => {
        const name = String(definition.name || definition.Name || '').trim().toLowerCase();
        const code = String(definition.code || definition.Code || '').trim().toLowerCase();
        return name === 'phiên bản' || name === 'phien ban' || code === 'variant' || code === 'version' || code === 'phien-ban';
    });
    const fallbackVariantOptions = getFallbackVariantOptions(selectedFormCategory);
    const configuredVersionOptions = mergeOptions(
        axisOptions(['variant', 'version', 'phienban', 'phien-ban']),
        (versionDefinition?.options || []).map((option) => option.value ?? option.Value).filter(Boolean));
    const versionOptions = preferConfiguredOptions(configuredVersionOptions, fallbackVariantOptions.versions || []);
    const storageAliases = getStorageSpecAliases(selectedFormCategory);
    const shouldShowStorageField = storageAliases.length > 0;
    const storageFieldLabel = getStorageFieldLabel(selectedFormCategory);
    const shouldShowVersionField = shouldUseVersionAxis(selectedFormCategory);
    const ramOptions = preferConfiguredOptions(axisOptions(['ram']), fallbackVariantOptions.ram || []);
    const storageOptions = preferConfiguredOptions(axisOptions(storageAliases), fallbackVariantOptions.storage || []);
    const caseSizeOptions = preferConfiguredOptions(axisOptions(['casesize', 'kichthuocmat']), fallbackVariantOptions.caseSizes || []);
    const colorOptions = preferConfiguredOptions(axisOptions(['color', 'mausac']), fallbackVariantOptions.colors || []);
    const colorDefinition = axisDefinition(['color', 'mausac']);
    const addSpecOptionFromForm = async (definition, currentRawValue = '', isMultiSelect = false) => {
        const definitionId = definition.id;
        const nextValue = String(newSpecOptionValues[definitionId] || '').trim();
        if (!nextValue) return;

        const currentOptions = Array.isArray(definition.options) ? definition.options : [];
        const existingOption = currentOptions.find((option) => normalizeSpecKey(option.value) === normalizeSpecKey(nextValue));
        if (existingOption) {
            if (isMultiSelect) {
                const selectedValues = String(currentRawValue || '').split(',').map((item) => item.trim()).filter(Boolean);
                const merged = mergeOptions(selectedValues, [existingOption.value]).join(', ');
                setSpecValues((current) => ({
                    ...current,
                    [definitionId]: { specOptionId: '', value: merged },
                }));
            } else {
                setSpecValues((current) => ({
                    ...current,
                    [definitionId]: { specOptionId: existingOption.id, value: existingOption.value },
                }));
            }
            setNewSpecOptionValues((current) => ({ ...current, [definitionId]: '' }));
            return;
        }

        setAddingSpecOptionIds((current) => ({ ...current, [definitionId]: true }));
        try {
            const response = await specApi.createOption({
                specDefinitionId: definitionId,
                value: nextValue,
                displayOrder: currentOptions.length + 1,
                isActive: true,
            });
            const created = response.data;
            setSpecDefinitions((current) => current.map((item) => {
                if (item.id !== definitionId) return item;
                return {
                    ...item,
                    options: [...(item.options || []), created].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0)),
                };
            }));
            setSpecValues((current) => {
                if (isMultiSelect) {
                    const selectedValues = String(currentRawValue || '').split(',').map((item) => item.trim()).filter(Boolean);
                    return {
                        ...current,
                        [definitionId]: { specOptionId: '', value: mergeOptions(selectedValues, [created.value]).join(', ') },
                    };
                }
                return {
                    ...current,
                    [definitionId]: { specOptionId: created.id, value: created.value },
                };
            });
            setNewSpecOptionValues((current) => ({ ...current, [definitionId]: '' }));
        } catch (err) {
            toast.error('Không thể thêm option mới');
        } finally {
            setAddingSpecOptionIds((current) => ({ ...current, [definitionId]: false }));
        }
    };

    const addVariantColorOption = async (variantIndex) => {
        if (!colorDefinition?.id) {
            toast.error('Danh mục này chưa có thông số màu sắc');
            return;
        }

        const optionKey = `color-${variantIndex}`;
        const nextValue = String(newVariantOptionValues[optionKey] || '').trim();
        if (!nextValue) return;

        const currentOptions = Array.isArray(colorDefinition.options) ? colorDefinition.options : [];
        const existingOption = currentOptions.find((option) => normalizeSpecKey(option.value) === normalizeSpecKey(nextValue));
        if (existingOption) {
            updateVariant(variantIndex, { colorName: existingOption.value });
            setNewVariantOptionValues((current) => ({ ...current, [optionKey]: '' }));
            return;
        }

        setAddingVariantOptionKeys((current) => ({ ...current, [optionKey]: true }));
        try {
            const response = await specApi.createOption({
                specDefinitionId: colorDefinition.id,
                value: nextValue,
                displayOrder: currentOptions.length + 1,
                isActive: true,
            });
            const created = response.data;
            setSpecDefinitions((current) => current.map((item) => {
                if (item.id !== colorDefinition.id) return item;
                return {
                    ...item,
                    options: [...(item.options || []), created].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0)),
                };
            }));
            updateVariant(variantIndex, { colorName: created.value });
            setNewVariantOptionValues((current) => ({ ...current, [optionKey]: '' }));
        } catch (err) {
            toast.error('Không thể thêm màu mới');
        } finally {
            setAddingVariantOptionKeys((current) => ({ ...current, [optionKey]: false }));
        }
    };

    const renderVariantColorField = (variant, index) => {
        const optionKey = `color-${index}`;
        const newColorValue = newVariantOptionValues[optionKey] || '';
        const isAddingColor = Boolean(addingVariantOptionKeys[optionKey]);

        return (
            <div>
                <label>
                    <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Mau sac</span>
                    {colorOptions.length > 0 ? (
                        <select className={`${inputClass} w-full`} value={variant.colorName || ''} onChange={(e) => updateVariant(index, { colorName: e.target.value })}>
                            <option value="">-- Chon mau --</option>
                            {variant.colorName && !colorOptions.includes(variant.colorName) && <option value={variant.colorName}>{variant.colorName}</option>}
                            {colorOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : (
                        <select className={`${inputClass} w-full`} value="" disabled>
                            <option value="">Mau sac chua co option</option>
                        </select>
                    )}
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                        className={`${inputClass} w-full`}
                        value={newColorValue}
                        onChange={(e) => setNewVariantOptionValues((current) => ({ ...current, [optionKey]: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addVariantColorOption(index);
                            }
                        }}
                        placeholder="Thêm màu mới"
                    />
                    <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--color-surface-2)] disabled:opacity-60" disabled={isAddingColor || !newColorValue.trim()} onClick={() => addVariantColorOption(index)}>
                        {isAddingColor ? 'Đang thêm' : 'Thêm'}
                    </button>
                </div>
            </div>
        );
    };

    const renderProductSpecField = (definition, keyPrefix = 'spec') => {
        const inputType = String(definition.inputType || definition.dataType || 'select');
        const dataType = inputType.toLowerCase();
        const currentValue = specValues[definition.id] || {};
        const rawValue = typeof currentValue === 'object' ? currentValue.value : currentValue;
        const currentOptionId = typeof currentValue === 'object' ? currentValue.specOptionId : '';
        const options = Array.isArray(definition.options) ? definition.options : [];
        const hasOptions = options.length > 0;
        const newOptionValue = newSpecOptionValues[definition.id] || '';
        const isAddingOption = Boolean(addingSpecOptionIds[definition.id]);
        const setSpecValue = (patch) => setSpecValues({
            ...specValues,
            [definition.id]: { specOptionId: currentOptionId || '', value: rawValue || '', ...patch },
        });
        const selectedMultiValues = String(rawValue || '').split(',').map((item) => item.trim()).filter(Boolean);
        const toggleMultiValue = (optionValue, checked) => {
            const nextValues = checked
                ? mergeOptions(selectedMultiValues, [optionValue])
                : selectedMultiValues.filter((item) => normalizeSpecKey(item) !== normalizeSpecKey(optionValue));
            setSpecValue({ value: nextValues.join(', '), specOptionId: '' });
        };

        return (
            <div key={`${keyPrefix}-${definition.id}`}>
                <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">{definition.name}{definition.unit ? ` (${definition.unit})` : ''}</span>
                {dataType === 'boolean' || dataType === 'bool' ? (
                    <select className={`${inputClass} w-full`} value={rawValue ?? ''} onChange={(e) => setSpecValue({ value: e.target.value, specOptionId: '' })}>
                        <option value="">Chua co du lieu</option>
                        <option value="true">Co</option>
                        <option value="false">Khong</option>
                    </select>
                ) : dataType === 'multiselect' ? (
                    <div className="grid gap-2">
                        <details className="relative">
                            <summary className={`${inputClass} flex min-h-10 w-full cursor-pointer list-none items-center justify-between gap-2`}>
                                <span className="min-w-0 truncate">
                                    {selectedMultiValues.length > 0 ? selectedMultiValues.join(', ') : (hasOptions ? 'Chọn option' : 'Chưa có option')}
                                </span>
                                <i className="fas fa-chevron-down text-[10px] text-[var(--color-fg-muted)]"></i>
                            </summary>
                            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl">
                                {!hasOptions ? (
                                    <div className="px-2 py-1.5 text-sm text-[var(--color-fg-muted)]">Chưa có option</div>
                                ) : options.map((option) => (
                                    <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--color-surface-2)]">
                                        <input
                                            type="checkbox"
                                            checked={selectedMultiValues.some((item) => normalizeSpecKey(item) === normalizeSpecKey(option.value))}
                                            onChange={(e) => toggleMultiValue(option.value, e.target.checked)}
                                        />
                                        <span>{option.value}</span>
                                    </label>
                                ))}
                            </div>
                        </details>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <input
                                className={`${inputClass} w-full`}
                                value={newOptionValue}
                                onChange={(e) => setNewSpecOptionValues((current) => ({ ...current, [definition.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSpecOptionFromForm(definition, rawValue, true);
                                    }
                                }}
                                placeholder="Thêm option mới"
                            />
                            <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--color-surface-2)] disabled:opacity-60" disabled={isAddingOption || !newOptionValue.trim()} onClick={() => addSpecOptionFromForm(definition, rawValue, true)}>
                                {isAddingOption ? 'Đang thêm' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        <select className={`${inputClass} w-full`} value={currentOptionId || ''} onChange={(e) => {
                            const option = options.find((item) => String(item.id) === e.target.value);
                            setSpecValue({ specOptionId: e.target.value, value: option?.value || '' });
                        }} disabled={!hasOptions}>
                            <option value="">{hasOptions ? 'Chọn option' : 'Chưa có option'}</option>
                            {options.map((option) => <option key={option.id} value={option.id}>{option.value}</option>)}
                        </select>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <input
                                className={`${inputClass} w-full`}
                                value={newOptionValue}
                                onChange={(e) => setNewSpecOptionValues((current) => ({ ...current, [definition.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSpecOptionFromForm(definition, rawValue, false);
                                    }
                                }}
                                placeholder="Thêm option mới"
                            />
                            <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--color-surface-2)] disabled:opacity-60" disabled={isAddingOption || !newOptionValue.trim()} onClick={() => addSpecOptionFromForm(definition, rawValue, false)}>
                                {isAddingOption ? 'Đang thêm' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">Danh mục bán hàng</p>
                    <h2 className="mb-0 text-2xl font-bold text-[var(--color-fg)]">Quản lý sản phẩm</h2>
                </div>
                {canManageProducts && (
                    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white  transition hover:bg-[var(--color-primary)]" onClick={() => openModal()}>
                        <i className="fas fa-plus"></i>
                        Thêm sản phẩm
                    </button>
                )}
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ">
                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg-muted)]">Tổng sản phẩm</p>
                    <div className="text-2xl font-bold text-[var(--color-fg)]">{totalCount}</div>
                </div>
                <button type="button" className={`rounded-md border p-4 text-left  ${stockFilter === 'available' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`} onClick={() => setStockFilter(stockFilter === 'available' ? '' : 'available')}>
                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg-muted)]">Còn hàng</p>
                    <div className="text-2xl font-bold text-emerald-300">{inventoryStats.available}</div>
                </button>
                <button type="button" className={`rounded-md border p-4 text-left  ${stockFilter === 'low' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`} onClick={() => setStockFilter(stockFilter === 'low' ? '' : 'low')}>
                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg-muted)]">Sắp hết hàng</p>
                    <div className="text-2xl font-bold text-amber-300">{inventoryStats.low}</div>
                </button>
                <button type="button" className={`rounded-md border p-4 text-left  ${stockFilter === 'out' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`} onClick={() => setStockFilter(stockFilter === 'out' ? '' : 'out')}>
                    <p className="mb-1 text-sm font-semibold text-[var(--color-fg-muted)]">Hết hàng</p>
                    <div className="text-2xl font-bold text-red-300">{inventoryStats.out}</div>
                </button>
            </div>

            <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] ">
                <div className="border-b border-[var(--color-border)] p-4">
                    <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto]">
                        <select
                            className={inputClass}
                            value={keyword}
                            onChange={(e) => {
                                const value = e.target.value;
                                setKeyword(value);
                                setSubmittedKeyword(value);
                                setPage(1);
                            }}
                        >
                            <option value="">Tất cả sản phẩm</option>
                            {nameOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <select
                            className={inputClass}
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setKeyword('');
                                setSubmittedKeyword('');
                                setPage(1);
                            }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]">
                            <i className="fas fa-search"></i>
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm font-medium text-[var(--color-fg-muted)]">Đang tải sản phẩm...</div>
                    ) : (
                        <div className="ts-table-container">
                            <table className="ts-table">
                                <thead>
                                    <tr>
                                        <th className="ts-table-col-wide">Sản phẩm</th>
                                        <th className="ts-table-col-medium ts-table-hide-mobile">Danh mục</th>
                                        <th className="ts-table-col-medium">Giá</th>
                                        <th className="ts-table-col-narrow">Tồn kho</th>
                                        <th className="ts-table-col-medium">Tổng giá</th>
                                        {canViewProductDetails && <th className="ts-table-col-narrow text-right">Thao tác</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={canViewProductDetails ? 6 : 5} className="px-4 py-10 text-center text-[var(--color-fg-muted)]">Không tìm thấy sản phẩm</td>
                                        </tr>
                                    ) : visibleProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <img src={resolveProductImage(product)} className="h-12 w-12 rounded-md border border-[var(--color-border)] object-contain bg-[var(--color-surface)]" alt={product.name} />
                                                    <div className="min-w-0">
                                                        <p className="mb-0 truncate font-semibold text-[var(--color-fg)]">{product.name}</p>
                                                        <p className="mb-0 text-xs text-[var(--color-fg-muted)]">
                                                            ID #{product.id} · {(product.isActive ?? product.IsActive) === false ? 'Đang ẩn' : 'Đang hiển thị'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="ts-table-hide-mobile truncate text-[var(--color-fg-muted)]">{product.category?.name || categories.find((cat) => cat.id === product.categoryId)?.name || 'Chưa phân loại'}</td>
                                            <td className="whitespace-nowrap font-semibold text-[var(--color-fg)]">{formatCurrency(product.price)}</td>
                                            <td>
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${stockBadge(product.stock)}`}>{product.stock}</span>
                                            </td>
                                            <td className="whitespace-nowrap font-semibold text-[var(--color-fg)]">{formatCurrency(product.totalValue)}</td>
                                            {canViewProductDetails && (
                                                <td>
                                                    <div className="flex justify-end gap-2">
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]" onClick={() => openModal(product)} title={canManageProducts ? 'Sửa' : 'Xem chi tiết'}>
                                                            <i className={`fas ${canManageProducts ? 'fa-edit' : 'fa-eye'}`}></i>
                                                        </button>
                                                        {canManageProducts && (
                                                            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-600 text-white hover:bg-rose-700" onClick={() => handleDelete(product.id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
                    <span>Tổng: {totalCount} sản phẩm</span>
                    <div className="flex items-center gap-2">
                        <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button>
                        <span>Trang {page}/{totalPages || 1}</span>
                        <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-1.5 font-semibold disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="fixed bottom-0 left-0 right-0 top-14 z-50 flex items-center justify-center bg-slate-950/50 px-4 pb-8 pt-4 lg:left-64">
                    <div className="max-h-[calc(100vh-7rem)] w-full max-w-6xl overflow-hidden rounded-md bg-[var(--color-surface)] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <h3 className="mb-0 text-lg font-bold text-[var(--color-fg)]">{!canManageProducts && editingProduct ? 'Thông tin sản phẩm' : (editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm')}</h3>
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-fg-dim)] hover:bg-[var(--color-surface-3)]" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="max-h-[calc(100vh-15rem)] overflow-y-auto p-4">
                                {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
                                {!canManageProducts && editingProduct && (
                                    <div className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm font-medium text-[var(--color-fg-muted)]">
                                        Chế độ chỉ xem — vai trò hiện tại được xem thông tin sản phẩm nhưng không chỉnh sửa.
                                    </div>
                                )}
                                <fieldset disabled={!canManageProducts} className="min-w-0">
                                <div className="grid gap-3 md:grid-cols-4">
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Danh mục</span>
                                        <select className={`${inputClass} w-full`} value={formData.categoryId} onChange={(e) => handleCategoryChange(e.target.value)} required>
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Thương hiệu (Hãng)</span>
                                        <select
                                            className={`${inputClass} w-full`}
                                            value={brands.includes(formData.brand) ? formData.brand : ''}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            disabled={!formData.categoryId || brands.length === 0}
                                        >
                                            <option value="">
                                                {!formData.categoryId
                                                    ? 'Chọn danh mục trước'
                                                    : brands.length === 0
                                                        ? 'Danh mục này chưa có thương hiệu'
                                                        : 'Chọn thương hiệu'}
                                            </option>
                                            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </label>
                                    <label className="md:col-span-2">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Tên sản phẩm</span>
                                        <input type="text" className={`${inputClass} w-full`} value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
                                    </label>
                                    <label className="md:col-span-2">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">SKU sản phẩm</span>
                                        <div className="flex gap-2">
                                            <input type="text" className={`${inputClass} min-w-0 flex-1`} value={formData.sku || ''} onChange={(e) => handleProductSkuChange(e.target.value)} placeholder="PHONE-IP15PRO" />
                                            <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--color-surface-2)]" onClick={regenerateProductSku}>
                                                Tự tạo lại SKU
                                            </button>
                                        </div>
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giá</span>
                                        <input type="number" className={`${inputClass} w-full`} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required min="0" />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Giá gốc</span>
                                        <input type="number" className={`${inputClass} w-full`} value={formData.originalPrice ?? ''} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} min="0" placeholder="Giá niêm yết nếu có" />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Tồn kho</span>
                                        <input type="number" className={`${inputClass} w-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]`} value={formData.stock} readOnly />
                                        <span className="mt-1 block text-xs font-semibold text-[var(--color-fg-muted)]">Tồn kho được cập nhật qua phiếu nhập kho, không chỉnh trực tiếp tại đây.</span>
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Thời hạn bảo hành (tháng)</span>
                                        <select
                                            className={`${inputClass} w-full`}
                                            value={formData.warrantyMonths ?? ''}
                                            onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value ? Number(e.target.value) : '' })}
                                            disabled={!formData.categoryId}
                                        >
                                            <option value="">{formData.categoryId ? 'Chọn thời hạn bảo hành' : 'Chọn danh mục trước'}</option>
                                            {formData.categoryId && warrantyOptions.map((month) => (
                                                <option key={month} value={month}>{month} tháng</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="md:col-span-4 flex items-start gap-3 rounded-md border border-[var(--color-border)] p-3">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5"
                                            checked={formData.requiresSerialTracking !== false}
                                            onChange={(e) => setFormData({ ...formData, requiresSerialTracking: e.target.checked })}
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold text-[var(--color-fg)]">Quản lý theo Serial/IMEI</span>
                                            <span className="mt-0.5 block text-xs text-[var(--color-fg-muted)]">
                                                Bật: mỗi đơn vị nhập kho có Serial/IMEI hoặc mã tem riêng (điện thoại, laptop…). Tắt: chỉ quản lý theo số lượng (phụ kiện, tai nghe…).
                                            </span>
                                        </span>
                                    </label>
                                    <div className="md:col-span-4 grid gap-2 rounded-md border border-[var(--color-border)] p-3 sm:grid-cols-2 lg:grid-cols-5">
                                        {[
                                            ['isActive', 'Đang hiển thị'],
                                            ['isFeatured', 'Nổi bật'],
                                            ['isBestSeller', 'Bán chạy'],
                                            ['isNewArrival', 'Hàng mới'],
                                            ['isDiscounted', 'Đang giảm giá'],
                                        ].map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
                                                <input type="checkbox" checked={Boolean(formData[key])} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} />
                                                {label} 
                                            </label>
                                        ))}
                                    </div>
                                    <label className="md:col-span-4">
                                        <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">Mô tả</span>
                                        <textarea className={`${inputClass} w-full`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" /> 
                                    </label>
                                    <div className="md:col-span-4 rounded-md border border-[var(--color-border)] p-3">
                                        <div className="mb-3 flex items-center justify-between gap-2"> 
                                            <div>
                                                <span className="block text-sm font-semibold text-[var(--color-fg)]">Ảnh sản phẩm</span>
                                                <span className="text-xs text-[var(--color-fg-muted)]">Upload file ảnh vào thư mục uploads/products. Ảnh chính sẽ dùng làm banner.</span>
                                            </div>
                                            <label className="cursor-pointer rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--color-surface-2)]">
                                                {uploadingImages ? 'Đang upload...' : 'Upload ảnh'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                                    multiple
                                                    disabled={uploadingImages}
                                                    onChange={(e) => {
                                                        handleUploadImages(e.target.files);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {formData.imageUrl && (
                                            <div className="mb-4 rounded-md border border-orange-200 bg-[var(--color-accent)]/10 p-3">
                                                <div className="mb-2 text-xs font-semibold uppercase text-[var(--color-accent)]">Ảnh chính / banner</div>
                                                <div className="flex items-center gap-3">
                                                    <img src={resolveProductImage({ imageUrl: formData.imageUrl })} className="h-20 w-20 rounded-md border border-orange-200 bg-[var(--color-surface)] object-contain" alt="Ảnh chính" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-semibold text-[var(--color-fg)]">{formData.imageUrl}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {(formData.images || []).length === 0 ? (
                                            <p className="mb-0 text-sm text-[var(--color-fg-muted)]">Chưa có ảnh. Hãy bấm "Upload ảnh".</p>
                                        ) : (formData.images || []).map((image, index) => (
                                            <div key={`image-${index}`} className="mb-3 grid gap-3 rounded-md border border-[var(--color-border)] p-3 md:grid-cols-[80px_minmax(0,1fr)_auto_auto] md:items-center">
                                                <img src={resolveProductImage({ imageUrl: image.imageUrl })} className="h-20 w-20 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] object-contain" alt={image.altText || formData.name || 'Ảnh sản phẩm'} />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-[var(--color-fg)]">{image.imageUrl}</div>
                                                    <input type="text" className={`${inputClass} mt-2 w-full`} placeholder="Alt text" value={image.altText || ''} onChange={(e) => updateImage(index, { altText: e.target.value })} />
                                                </div>
                                                <button type="button" className={`rounded-md px-3 py-2 text-xs font-semibold ${formData.imageUrl === image.imageUrl ? 'bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white' : 'border border-[var(--color-border)] text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]'}`} onClick={() => setPrimaryImage(image.imageUrl)}>
                                                    {formData.imageUrl === image.imageUrl ? 'Ảnh chính' : 'Làm ảnh chính'}
                                                </button>
                                                <button type="button" className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700" onClick={() => removeImage(index)}>
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="md:col-span-4 rounded-md border border-[var(--color-border)] p-3">
                                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <span className="block text-sm font-semibold text-[var(--color-fg)]">Thông số kỹ thuật theo danh mục</span>
                                                <span className="text-xs text-[var(--color-fg-muted)]">Day la thong tin chung cua Product cha, duoc load theo danh muc dang chon.</span>
                                            </div>
                                            <span className="text-xs font-semibold text-[var(--color-fg-muted)]">{productSpecDefs.length} thong so</span>
                                        </div>
                                        {productSpecDefs.length === 0 ? (
                                            <p className="mb-0 text-sm text-[var(--color-fg-muted)]">Danh muc nay chua co bo thong so chung. Hay cau hinh trong trang Danh muc truoc.</p>
                                        ) : (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {productSpecDefs.map((definition) => renderProductSpecField(definition, 'spec-parent'))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-4 rounded-md border border-[var(--color-border)] p-3">
                                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <span className="block text-sm font-semibold text-[var(--color-fg)]">Biến thể sản phẩm</span>
                                                <span className="text-xs text-[var(--color-fg-muted)]">Quan ly phien ban, mau sac, gia, ton kho va SKU rieng cho tung lua chon.</span>
                                            </div>
                                            <button type="button" className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--color-surface-2)]" onClick={addVariant}>
                                                + Them bien the
                                            </button>
                                        </div>
                                        {(formData.variants || []).length === 0 ? (
                                            <p className="mb-0 text-sm text-[var(--color-fg-muted)]">Chua co bien the. Hay them it nhat mot bien the Standard de ban va nhap kho theo variant.</p>
                                        ) : (
                                            <div className="grid gap-3">
                                                {(formData.variants || []).map((variant, index) => (
                                                    <div key={`variant-${index}`} className="rounded-md border border-[var(--color-border)] p-3">
                                                        <div className="mb-3 flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-fg-muted)]">Biến thể #{index + 1}</span>
                                                            <button type="button" className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700" onClick={() => removeVariant(index)}>
                                                                Xoa
                                                            </button>
                                                        </div>
                                                        <div className="grid gap-3">
                                                            {selectedVariantMode === 'ram-storage-color' ? (
                                                                <div className={`grid gap-3 ${shouldShowVersionField ? 'md:grid-cols-[105px_130px_minmax(130px,1fr)_minmax(120px,1fr)_150px]' : 'md:grid-cols-[105px_130px_minmax(130px,1fr)_150px]'}`}>
                                                                    <label>
                                                                        <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">RAM</span>
                                                                        {ramOptions.length > 0 ? (
                                                                            <select className={`${inputClass} w-full`} value={variant.ram || ''} onChange={(e) => updateVariant(index, { ram: e.target.value })}>
                                                                                <option value="">-- Chon RAM --</option>
                                                                                {variant.ram && !ramOptions.includes(variant.ram) && <option value={variant.ram}>{variant.ram}</option>}
                                                                                {ramOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                                                                            </select>
                                                                        ) : (
                                                                            <select className={`${inputClass} w-full`} value="" disabled>
                                                                                <option value="">RAM chua co option</option>
                                                                            </select>
                                                                        )}
                                                                    </label>
                                                                    {shouldShowStorageField && (
                                                                        <label>
                                                                            <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">{storageFieldLabel}</span>
                                                                            <select className={`${inputClass} w-full`} value={variant.storage || ''} onChange={(e) => updateVariant(index, { storage: e.target.value })} disabled={storageOptions.length === 0}>
                                                                                <option value="">{storageOptions.length > 0 ? `-- Chon ${storageFieldLabel.toLowerCase()} --` : `${storageFieldLabel} chua co option`}</option>
                                                                                {variant.storage && !storageOptions.includes(variant.storage) && <option value={variant.storage}>{variant.storage}</option>}
                                                                                {storageOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                                                                            </select>
                                                                        </label>
                                                                    )}
                                                                    {shouldShowVersionField && (
                                                                        <label>
                                                                            <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Phiên bản</span>
                                                                            {versionOptions.length > 0 ? (
                                                                                <select className={`${inputClass} w-full`} value={variant.variantOption || ''} onChange={(e) => updateVariant(index, { variantOption: e.target.value })}>
                                                                                    <option value="">-- Chon phien ban --</option>
                                                                                    {variant.variantOption && !versionOptions.includes(variant.variantOption) && <option value={variant.variantOption}>{variant.variantOption}</option>}
                                                                                    {versionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                                                                </select>
                                                                            ) : (
                                                                                <select className={`${inputClass} w-full`} value="" disabled>
                                                                                    <option value="">Phiên bản chưa có option</option>
                                                                                </select>
                                                                            )}
                                                                        </label>
                                                                    )}
                                                                    {renderVariantColorField(variant, index)}
                                                                    <label>
                                                                        <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Mã màu</span>
                                                                        <div className="flex gap-2">
                                                                            <input type="color" className="h-10 w-12 rounded-md border border-[var(--color-border)] bg-transparent p-1" value={variant.colorCode || '#000000'} onChange={(e) => updateVariant(index, { colorCode: e.target.value })} />
                                                                            <input type="text" className={`${inputClass} min-w-0 flex-1`} placeholder="#000000" value={variant.colorCode || ''} onChange={(e) => updateVariant(index, { colorCode: e.target.value })} />
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            ) : (
                                                                <div className={`grid gap-3 ${shouldUseCaseSizeAxis(selectedFormCategory) ? 'md:grid-cols-2 xl:grid-cols-[minmax(150px,1fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_minmax(160px,1fr)_minmax(220px,1.2fr)]' : 'md:grid-cols-2 xl:grid-cols-[minmax(150px,1fr)_minmax(130px,1fr)_minmax(160px,1fr)_minmax(220px,1.2fr)]'}`}>
                                                                    <label>
                                                                        <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Phiên bản</span>
                                                                        {versionOptions.length > 0 ? (
                                                                            <select className={`${inputClass} w-full`} value={variant.variantOption || ''} onChange={(e) => updateVariant(index, { variantOption: e.target.value })}>
                                                                                <option value="">-- Chon phien ban --</option>
                                                                                {variant.variantOption && !versionOptions.includes(variant.variantOption) && <option value={variant.variantOption}>{variant.variantOption}</option>}
                                                                                {versionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                                                            </select>
                                                                        ) : (
                                                                            <select className={`${inputClass} w-full`} value="" disabled>
                                                                            <option value="">Phiên bản chưa có option</option>
                                                                        </select>
                                                                    )}
                                                                </label>
                                                                    {shouldUseCaseSizeAxis(selectedFormCategory) && (
                                                                        <label>
                                                                            <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Kích thước mặt</span>
                                                                            {caseSizeOptions.length > 0 ? (
                                                                                <select className={`${inputClass} w-full`} value={variant.storage || ''} onChange={(e) => updateVariant(index, { storage: e.target.value })}>
                                                                                    <option value="">-- Chon kich thuoc --</option>
                                                                                    {variant.storage && !caseSizeOptions.includes(variant.storage) && <option value={variant.storage}>{variant.storage}</option>}
                                                                                    {caseSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                                                                </select>
                                                                            ) : (
                                                                                <select className={`${inputClass} w-full`} value="" disabled>
                                                                                    <option value="">Kích thước chưa có option</option>
                                                                                </select>
                                                                            )}
                                                                        </label>
                                                                    )}
                                                                    {renderVariantColorField(variant, index)}
                                                                    <label>
                                                                        <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Mã màu</span>
                                                                        <div className="flex gap-2">
                                                                            <input type="color" className="h-10 w-12 rounded-md border border-[var(--color-border)] bg-transparent p-1" value={variant.colorCode || '#000000'} onChange={(e) => updateVariant(index, { colorCode: e.target.value })} />
                                                                            <input type="text" className={`${inputClass} min-w-0 flex-1`} placeholder="#000000" value={variant.colorCode || ''} onChange={(e) => updateVariant(index, { colorCode: e.target.value })} />
                                                                        </div>
                                                                    </label>
                                                                    <label>
                                                                        <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Ten bien the</span>
                                                                        <input type="text" className={`${inputClass} w-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]`} value={variant.variantName || ''} readOnly placeholder="Tu sinh tu cau hinh da chon" title="Ten bien the duoc tu sinh tu cac option da chon" />
                                                                    </label>
                                                                </div>
                                                            )}

                                                            <div className={`grid gap-3 ${selectedVariantMode === 'ram-storage-color' ? 'md:grid-cols-[minmax(180px,1fr)_minmax(220px,1fr)_130px]' : 'md:grid-cols-[minmax(220px,1fr)_130px]'}`}>
                                                                {selectedVariantMode === 'ram-storage-color' && (
                                                                    <label>
                                                                        <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Ten bien the</span>
                                                                        <input type="text" className={`${inputClass} w-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]`} value={variant.variantName || ''} readOnly placeholder="Tu sinh tu cau hinh da chon" title="Ten bien the duoc tu sinh tu cac option da chon" />
                                                                    </label>
                                                                )}
                                                                <label>
                                                                    <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">SKU</span>
                                                                    <input type="text" className={`${inputClass} w-full`} value={variant.sku || ''} onChange={(e) => updateVariant(index, { sku: e.target.value })} placeholder="Tu sinh theo SKU san pham va thuoc tinh bien the" />
                                                                </label>
                                                                <div className="flex items-end">
                                                                    <button type="button" className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--color-surface-2)]" onClick={() => updateVariant(index, { sku: buildVariantSku(formData.sku, variant, selectedFormCategory) })}>
                                                                        Tao lai SKU
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-3 md:grid-cols-[150px_110px]">
                                                                <label>
                                                                    <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Gia ban hien tai</span>
                                                                    <input type="number" className={`${inputClass} w-full`} min="0" value={variant.price ?? ''} onChange={(e) => updateVariant(index, { price: e.target.value })} />
                                                                </label>
                                                                <label>
                                                                    <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Ton kho hien tai</span>
                                                                    <input type="number" className={`${inputClass} w-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]`} value={variant.stock ?? 0} readOnly title="Ton kho quan ly o muc Kho hang" />
                                                                </label>
                                                            </div>

                                                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
                                                                <div className="rounded-md border border-[var(--color-border)] p-3">
                                                                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                        <div>
                                                                            <span className="block text-sm font-semibold text-[var(--color-fg)]">Ảnh riêng của biến thể</span>
                                                                            <span className="text-xs text-[var(--color-fg-muted)]">Upload file anh vao thu muc uploads/products. Anh nay se dung cho mau sac / cau hinh cua bien the.</span>
                                                                        </div>
                                                                        <label className="cursor-pointer rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--color-surface-2)]">
                                                                            {uploadingVariantImages[index] ? 'Dang upload...' : 'Upload anh'}
                                                                            <input
                                                                                type="file"
                                                                                className="hidden"
                                                                                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                                                                disabled={Boolean(uploadingVariantImages[index])}
                                                                                onChange={(e) => {
                                                                                    handleUploadVariantImage(index, e.target.files);
                                                                                    e.target.value = '';
                                                                                }}
                                                                            />
                                                                        </label>
                                                                    </div>
                                                                    {!variant.imageUrl ? (
                                                                        <p className="mb-0 text-sm text-[var(--color-fg-muted)]">Chua co anh. Hay bam "Upload anh".</p>
                                                                    ) : (
                                                                        <div className="grid gap-3 rounded-md border border-[var(--color-border)] p-3 md:grid-cols-[96px_minmax(0,1fr)] md:items-center">
                                                                            <img src={resolveProductImage({ imageUrl: variant.imageUrl })} className="h-24 w-24 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] object-contain" alt={variant.variantName || 'Ảnh biến thể'} />
                                                                            <div className="min-w-0">
                                                                                <div className="truncate text-sm font-semibold text-[var(--color-fg)]">{variant.imageUrl}</div>
                                                                                <div className="mt-1 text-xs text-[var(--color-fg-muted)]">Anh hien tai cua bien the se duoc luu vao ProductVariants.ImageUrl.</div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <label className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-3 text-sm font-semibold text-[var(--color-fg)]">
                                                                    <input type="checkbox" checked={variant.isActive !== false} onChange={(e) => updateVariant(index, { isActive: e.target.checked })} />
                                                                    Cho phep ban bien the nay
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="hidden grid gap-3 md:grid-cols-4">
                                                            {selectedVariantMode === 'version-color' && (
                                                                <label>
                                                                    <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Phiên bản</span>
                                                                    {versionOptions.length > 0 ? (
                                                                        <select className={`${inputClass} w-full`} value={variant.variantOption || ''} onChange={(e) => updateVariant(index, { variantOption: e.target.value })}>
                                                                            <option value="">-- Chon phien ban --</option>
                                                                            {variant.variantOption && !versionOptions.includes(variant.variantOption) && <option value={variant.variantOption}>{variant.variantOption}</option>}
                                                                            {versionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                                                        </select>
                                                                    ) : (
                                                                        <select className={`${inputClass} w-full`} value="" disabled>
                                                                            <option value="">Phiên bản chưa có option</option>
                                                                        </select>
                                                                    )}
                                                                </label>
                                                            )}
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Mau sac</span>
                                                                {colorOptions.length > 0 ? (
                                                                    <select className={`${inputClass} w-full`} value={variant.colorName || ''} onChange={(e) => updateVariant(index, { colorName: e.target.value })}>
                                                                        <option value="">— Chọn màu —</option>
                                                                        {variant.colorName && !colorOptions.includes(variant.colorName) && <option value={variant.colorName}>{variant.colorName}</option>}
                                                                        {colorOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                                                                    </select>
                                                                ) : (
                                                                    <select className={`${inputClass} w-full`} value="" disabled>
                                                                        <option value="">Mau sac chua co option</option>
                                                                    </select>
                                                                )}
                                                            </label>
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Ten bien the</span>
                                                                <input type="text" className={`${inputClass} w-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]`} value={variant.variantName || ''} readOnly placeholder="Tu sinh theo cac lua chon ben trai" title="Ten bien the duoc tu sinh tu cac option da chon" />
                                                            </label>
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Mã màu</span>
                                                                <div className="flex gap-2">
                                                                    <input type="color" className="h-10 w-12 rounded-md border border-[var(--color-border)] bg-transparent p-1" value={variant.colorCode || '#000000'} onChange={(e) => updateVariant(index, { colorCode: e.target.value })} />
                                                                    <input type="text" className={`${inputClass} min-w-0 flex-1`} placeholder="#000000" value={variant.colorCode || ''} onChange={(e) => updateVariant(index, { colorCode: e.target.value })} />
                                                                </div>
                                                            </label>
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">SKU</span>
                                                                <div className="flex gap-2">
                                                                    <input type="text" className={`${inputClass} min-w-0 flex-1`} value={variant.sku || ''} onChange={(e) => updateVariant(index, { sku: e.target.value })} placeholder="Tu sinh theo SKU san pham va thuoc tinh bien the" />
                                                                    <button type="button" className="rounded-md border border-[var(--color-border)] px-2 py-2 text-[10px] font-semibold hover:bg-[var(--color-surface-2)]" onClick={() => updateVariant(index, { sku: buildVariantSku(formData.sku, variant, selectedFormCategory) })}>
                                                                        Tao lai
                                                                    </button>
                                                                </div>
                                                            </label>
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Bộ nhớ</span>
                                                                {storageOptions.length > 0 ? (
                                                                    <select className={`${inputClass} w-full`} value={variant.storage || ''} onChange={(e) => updateVariant(index, { storage: e.target.value })}>
                                                                        <option value="">— Chọn bộ nhớ —</option>
                                                                        {variant.storage && !storageOptions.includes(variant.storage) && <option value={variant.storage}>{variant.storage}</option>}
                                                                        {storageOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                                                                    </select>
                                                                ) : (
                                                                    <select className={`${inputClass} w-full`} value="" disabled>
                                                                        <option value="">Bo nho chua co option</option>
                                                                    </select>
                                                                )}
                                                            </label>
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">RAM</span>
                                                                {ramOptions.length > 0 ? (
                                                                    <select className={`${inputClass} w-full`} value={variant.ram || ''} onChange={(e) => updateVariant(index, { ram: e.target.value })}>
                                                                        <option value="">— Chọn RAM —</option>
                                                                        {variant.ram && !ramOptions.includes(variant.ram) && <option value={variant.ram}>{variant.ram}</option>}
                                                                        {ramOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                                                                    </select>
                                                                ) : (
                                                                    <select className={`${inputClass} w-full`} value="" disabled>
                                                                        <option value="">RAM chua co option</option>
                                                                    </select>
                                                                )}
                                                            </label>
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Gia</span>
                                                                <input type="number" className={`${inputClass} w-full`} min="0" value={variant.price ?? ''} onChange={(e) => updateVariant(index, { price: e.target.value })} />
                                                            </label>
                                                            <label>
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Ton kho</span>
                                                                <input type="number" className={`${inputClass} w-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]`} value={variant.stock ?? 0} readOnly title="Tồn kho quản lý ở mục Kho hàng" />
                                                            </label>
                                                            <label className="md:col-span-2">
                                                                <span className="mb-1 block text-xs font-semibold text-[var(--color-fg)]">Ảnh biến thể</span>
                                                                <input type="text" className={`${inputClass} w-full bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]`} value={variant.imageUrl || ''} readOnly placeholder="Upload anh de tu tao URL" />
                                                            </label>
                                                            <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-[var(--color-fg)]">
                                                                <input type="checkbox" checked={variant.isActive !== false} onChange={(e) => updateVariant(index, { isActive: e.target.checked })} />
                                                                Đang bán
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden md:col-span-4 rounded-md border border-[var(--color-border)] p-3">
                                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <span className="block text-sm font-semibold text-[var(--color-fg)]">Thông số kỹ thuật theo danh mục</span>
                                                <span className="text-xs text-[var(--color-fg-muted)]">Lấy từ bộ thông số của danh mục đang chọn, chỉ lưu dòng có giá trị.</span>
                                            </div>
                                            <span className="text-xs font-semibold text-[var(--color-fg-muted)]">{productSpecDefs.length} thông số</span>
                                        </div>
                                        {productSpecDefs.length === 0 ? (
                                            <p className="mb-0 text-sm text-[var(--color-fg-muted)]">Danh mục này chưa có bộ thông số chung. Hãy cấu hình trong trang Danh mục trước.</p>
                                        ) : (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {productSpecDefs.map((definition) => {
                                                    const inputType = String(definition.inputType || definition.dataType || 'text');
                                                    const dataType = inputType.toLowerCase();
                                                    const currentValue = specValues[definition.id] || {};
                                                    const rawValue = typeof currentValue === 'object' ? currentValue.value : currentValue;
                                                    const currentOptionId = typeof currentValue === 'object' ? currentValue.specOptionId : '';
                                                    const options = Array.isArray(definition.options) ? definition.options : [];
                                                    const hasOptions = options.length > 0;
                                                    const setSpecValue = (patch) => setSpecValues({
                                                        ...specValues,
                                                        [definition.id]: { specOptionId: currentOptionId || '', value: rawValue || '', ...patch },
                                                    });
                                                    return (
                                                        <label key={definition.id}>
                                                            <span className="mb-1 block text-sm font-semibold text-[var(--color-fg)]">{definition.name}{definition.unit ? ` (${definition.unit})` : ''}</span>
                                                            {dataType === 'boolean' || dataType === 'bool' ? (
                                                                <select className={`${inputClass} w-full`} value={rawValue ?? ''} onChange={(e) => setSpecValue({ value: e.target.value, specOptionId: '' })}>
                                                                    <option value="">Chưa có dữ liệu</option>
                                                                    <option value="true">Có</option>
                                                                    <option value="false">Không</option>
                                                                </select>
                                                            ) : hasOptions && dataType === 'multiselect' ? (
                                                                <div className="grid gap-2">
                                                                    <select
                                                                        multiple
                                                                        className={`${inputClass} h-28 w-full`}
                                                                        value={String(rawValue || '').split(',').map((item) => item.trim()).filter(Boolean)}
                                                                        onChange={(e) => setSpecValue({ value: Array.from(e.target.selectedOptions).map((option) => option.value).join(', '), specOptionId: '' })}
                                                                    >
                                                                        {options.map((option) => <option key={option.id} value={option.value}>{option.value}</option>)}
                                                                    </select>
                                                                </div>
                                                            ) : hasOptions ? (
                                                                <div className="grid gap-2">
                                                                    <select className={`${inputClass} w-full`} value={currentOptionId || ''} onChange={(e) => {
                                                                        const option = options.find((item) => String(item.id) === e.target.value);
                                                                        setSpecValue({ specOptionId: e.target.value, value: option?.value || '' });
                                                                    }}>
                                                                        <option value="">Chọn giá trị có sẵn</option>
                                                                        {options.map((option) => <option key={option.id} value={option.id}>{option.value}</option>)}
                                                                    </select>
                                                                </div>
                                                            ) : (
                                                                <select className={`${inputClass} w-full`} value="" disabled>
                                                                    <option value="">Chưa có option</option>
                                                                </select>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </fieldset>
                            </div>
                            <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.16)]">
                                {error && <span className="mr-auto line-clamp-2 text-xs font-medium text-red-700"><i className="fas fa-circle-exclamation mr-1"></i>{error}</span>}
                                <button type="button" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-60" onClick={closeModal} disabled={isSubmitting}>{canManageProducts ? 'Hủy' : 'Đóng'}</button>
                                {canManageProducts && (
                                    <button type="submit" className="rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70" disabled={isSubmitting}>
                                        {isSubmitting ? (editingProduct ? 'Đang cập nhật...' : 'Đang tạo...') : (editingProduct ? 'Cập nhật' : 'Tạo mới')}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;







