import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { productApi, couponApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import PageHero from '../../components/store/PageHero';
import ProductCard from '../../components/store/ProductCard';
import ProductGridSection from '../../components/store/ProductGridSection';
import ReviewModal from '../../components/store/ReviewModal';
import ReviewsSection from '../../components/store/ReviewsSection';
import QASection from '../../components/store/QASection';
import { usePublicCoupons } from '../../hooks/usePublicCoupons';
import { canClaimCoupon, getAvailableCouponsForProduct, getCouponClaimStatus } from '../../utils/couponUtils';
import { formatCurrency, isStoreViewOnlyUser, resolveProductImage, safeParseJson, setPageMeta, STORE_VIEW_ONLY_MESSAGE, t } from '../../utils/store';
import { cn } from '../../utils/cn';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const PRODUCT_DETAIL_CACHE_KEY = 'electro_product_detail_cache';


const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const normalizeRecentProduct = (p) => p ? ({
    id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl,
    categoryId: p.categoryId, category: p.category, brand: p.brand,
}) : null;

const getProductDetailCache = () => {
    const cached = safeParseJson(sessionStorage.getItem(PRODUCT_DETAIL_CACHE_KEY) || '{}', {});
    return cached && typeof cached === 'object' && !Array.isArray(cached) ? cached : {};
};

const cacheProductDetail = (product) => {
    if (!product?.id) return;
    const cached = getProductDetailCache();
    sessionStorage.setItem(PRODUCT_DETAIL_CACHE_KEY, JSON.stringify({ ...cached, [product.id]: product }));
};

const getInstantProduct = (productId) => {
    const cached = getProductDetailCache()[productId];
    if (cached?.id && Array.isArray(cached.specs) && cached.specs.length > 0) return cached;
    return productApi.getLocalCatalog?.().find((item) => item.id === productId) || null;
};

const getRelatedProductsFromLocalCatalog = (product) => {
    if (!product?.categoryId) return [];
    return (productApi.getLocalCatalog?.() || [])
        .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
        .slice(0, 4);
};

const rememberRecentProduct = (product) => {
    const normalized = normalizeRecentProduct(product);
    if (!normalized?.id) return;
    const current = safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []);
    const withoutDup = Array.isArray(current) ? current.filter((p) => p?.id !== normalized.id) : [];
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([normalized, ...withoutDup].slice(0, 6)));
};

const compactValue = (value) => {
    if (value == null) return '';
    if (Array.isArray(value)) return value.map(compactValue).filter(Boolean).join(', ');
    if (typeof value === 'object') {
        return Object.entries(value).map(([k, v]) => {
            const text = compactValue(v);
            return text ? `${k}: ${text}` : '';
        }).filter(Boolean).join(', ');
    }
    return String(value).trim();
};

const fixText = (value) => compactValue(value);

const inferBrandFromName = (name) => {
    const text = String(name || '').toLowerCase();
    const brands = ['Apple', 'Samsung', 'Xiaomi', 'Dell', 'Asus', 'HP', 'Lenovo', 'Canon', 'Sony', 'JBL', 'Bose', 'OnePlus', 'Nothing'];
    return brands.find((b) => text.includes(b.toLowerCase())) || '';
};

const getCategoryType = (product) => {
    const cat = normalizeText(`${product?.category?.name || ''} ${product?.categoryName || ''} ${product?.category || ''}`);
    const name = normalizeText(product?.name);
    if (cat.includes('dien thoai') || cat.includes('phone') || name.includes('iphone')) return 'phone';
    if (cat.includes('laptop') || name.includes('macbook')) return 'laptop';
    if (cat.includes('tablet') || name.includes('ipad')) return 'tablet';
    if (cat.includes('smartwatch') || cat.includes('watch')) return 'smartwatch';
    if (cat.includes('camera') || name.includes('eos')) return 'camera';
    if (cat.includes('headphone') || cat.includes('tai nghe') || name.includes('airpods')) return 'headphone';
    return 'default';
};

export const getProductSpecs = (product) => {
    if (!product) return [];
    const specs = Array.isArray(product.specs) ? product.specs
        : Array.isArray(product.specValues) ? product.specValues
        : Array.isArray(product.productSpecValues) ? product.productSpecValues : [];
    return specs.map((item) => ({
        label: fixText(item.name || item.label || item.specName || ''),
        value: item.unit ? `${fixText(item.value ?? item.optionValue ?? '')} ${fixText(item.unit)}` : fixText(item.value ?? item.optionValue ?? ''),
    })).filter((s) => s.label && s.value);
};

const getProductDescriptionParts = (product) => {
    const parts = [];
    const description = fixText(product?.longDescription) || fixText(product?.description);
    if (description) parts.push(description);
    [product?.highlights, product?.features].forEach((value) => {
        if (Array.isArray(value)) {
            const items = value.map(compactValue).filter(Boolean);
            if (items.length) parts.push(items);
            return;
        }
        const text = compactValue(value);
        if (text) parts.push(text);
    });
    return parts;
};

const getRelatedProducts = (product, catalog) => {
    const brand = product?.brand || inferBrandFromName(product?.name);
    const price = Number(product?.price || 0);
    return catalog.filter((item) => item.id !== product?.id)
        .map((item) => {
            const itemBrand = item.brand || inferBrandFromName(item.name);
            const itemPrice = Number(item.price || 0);
            let score = 0;
            if (item.categoryId === product?.categoryId) score += 4;
            if (brand && itemBrand === brand) score += 3;
            if (price && itemPrice && Math.abs(itemPrice - price) / price <= 0.25) score += 2;
            return { item, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item)
        .slice(0, 4);
};

const ratingLabels = { 1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Tuyệt vời' };

const reviewCriteria = {
    phone: ['Hiệu năng', 'Pin', 'Camera'],
    laptop: ['Hiệu năng', 'Màn hình', 'Pin'],
    tablet: ['Màn hình', 'Pin', 'Hiệu năng'],
    headphone: ['Âm thanh', 'Chống ồn', 'Pin'],
    smartwatch: ['Sức khỏe', 'Pin', 'Thiết kế'],
    camera: ['Hình ảnh', 'Quay video', 'Tiện dụng'],
    default: ['Chất lượng', 'Trải nghiệm', 'Thiết kế'],
};

const normalizeReview = (review, index = 0) => {
    const rating = Math.max(1, Math.min(5, Number(review?.rating || review?.stars || 5)));
    return {
        id: review?.id || `review-${index}`,
        customerName: fixText(review?.customerName || review?.userName || 'Khách hàng'),
        rating,
        date: fixText(review?.date || 'Gần đây'),
        content: fixText(review?.content || review?.comment || review?.message || ''),
        experienceRatings: review?.experienceRatings && typeof review.experienceRatings === 'object' ? review.experienceRatings : {},
        images: Array.isArray(review?.images) ? review.images.filter(Boolean) : [],
        tags: Array.isArray(review?.tags) ? review.tags.filter(Boolean) : [],
    };
};

const normalizeQuestion = (item, index = 0) => {
    if (!item) return null;
    const rawAnswer = item.answer || item.reply || (Array.isArray(item.answers) ? item.answers[0] : null);
    const answer = rawAnswer ? {
        adminName: fixText(rawAnswer.adminName || 'Quản trị viên'),
        content: fixText(rawAnswer.content || rawAnswer.answer || rawAnswer),
        createdAt: rawAnswer.createdAt || rawAnswer.date,
    } : null;
    const question = compactValue(item.question || item.content || item.message);
    if (!question) return null;
    return {
        id: item.id || `question-${index}`,
        customerName: fixText(item.customerName || 'Khách hàng'),
        question: fixText(question),
        createdAt: item.createdAt || item.date,
        answer: answer?.content ? answer : null,
    };
};

const formatRelativeTime = (value) => {
    if (!value) return 'Vừa xong';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60_000) return 'Vừa xong';
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 24) return `${Math.max(1, hours)} giờ trước`;
    return `${Math.max(1, Math.floor(hours / 24))} ngày trước`;
};

const getOptionLabel = (option, fallback = '') => fixText(
    typeof option === 'object'
        ? option.label || option.name || option.value || option.version || option.storage || option.title || fallback
        : option
);

const normalizeVersionOption = (option, index = 0) => {
    if (typeof option === 'string' || typeof option === 'number') return { id: `version-${option}`, label: String(option) };
    if (!option || typeof option !== 'object') return null;
    const label = getOptionLabel(option, `Phiên bản ${index + 1}`);
    if (!label) return null;
    return { id: option.id || option.sku || `version-${label}`, label, price: option.price, oldPrice: option.oldPrice, stock: option.stock, sku: option.sku, image: option.image || option.imageUrl };
};

const normalizeColorOption = (option, index = 0) => {
    if (typeof option === 'string' || typeof option === 'number') return { id: `color-${option}`, label: String(option) };
    if (!option || typeof option !== 'object') return null;
    const label = getOptionLabel(option, `Màu ${index + 1}`);
    if (!label) return null;
    return { id: option.id || option.sku || `color-${label}`, label, colorCode: option.colorCode || option.hex, price: option.price, oldPrice: option.oldPrice, stock: option.stock, sku: option.sku, image: option.image || option.imageUrl };
};

const normalizeRamOption = (option, index = 0) => {
    if (typeof option === 'string' || typeof option === 'number') return { id: `ram-${option}`, label: String(option) };
    if (!option || typeof option !== 'object') return null;
    const label = getOptionLabel(option, `RAM ${index + 1}`);
    if (!label) return null;
    return { id: option.id || option.sku || `ram-${label}`, label, price: option.price, oldPrice: option.oldPrice, stock: option.stock, sku: option.sku, image: option.image || option.imageUrl };
};

const uniqueOptions = (options) => {
    const seen = new Set();
    return options.filter((o) => {
        if (!o?.label) return false;
        const key = normalizeText(o.label);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const getActiveVariants = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    return variants.filter((variant) => variant?.isActive !== false);
};

const isOptionOutOfStock = (option) => option?.stock != null && Number(option.stock) <= 0;

const stripVariantPart = (variantName, ...parts) => {
    let text = fixText(variantName);
    parts.map(fixText).filter(Boolean).forEach((part) => {
        text = text
            .split(' - ')
            .filter((item) => normalizeText(item) !== normalizeText(part))
            .join(' - ');
    });
    return text.trim();
};

const getVariantVersionLabel = (variant) => {
    const direct = fixText(variant?.storage || variant?.version);
    if (direct) return direct;
    return stripVariantPart(variant?.variantName || variant?.name || variant?.label, variant?.ram, variant?.colorName || variant?.color);
};

const getProductVersions = (product) => {
    const variants = getActiveVariants(product);
    return uniqueOptions(variants.map((v, i) => normalizeVersionOption({ ...v, label: getVariantVersionLabel(v) }, i)).filter(Boolean));
};

const getProductRams = (product) => {
    const variants = getActiveVariants(product);
    // Chỉ hiện chọn RAM khi biến thể có RAM thật (đồng hồ/máy ảnh/tai nghe/loa không có RAM
    // -> tránh sinh nhãn ảo "RAM 1, RAM 2…" từ fallback).
    return uniqueOptions(
        variants
            .filter((v) => fixText(v.ram))
            .map((v, i) => normalizeRamOption({ ...v, label: v.ram }, i))
            .filter(Boolean)
    );
};

const getProductColors = (product) => {
    const variants = getActiveVariants(product);
    return uniqueOptions(variants.map((v, i) => normalizeColorOption({ ...v, label: v.colorName || v.color || v.label || v.name }, i)).filter(Boolean));
};

const getAvailableVersions = (product, selectedColor) => {
    const variants = getActiveVariants(product);
    const colorText = normalizeText(selectedColor?.label);
    if (!colorText) return getProductVersions(product);
    return uniqueOptions(variants
        .filter((v) => normalizeText(v.colorName || v.color) === colorText)
        .map((v, i) => normalizeVersionOption({ ...v, label: getVariantVersionLabel(v) }, i))
        .filter(Boolean));
};

const getAvailableColors = (product, selectedVersion) => {
    const variants = getActiveVariants(product);
    const versionText = normalizeText(selectedVersion?.label);
    if (!versionText) return getProductColors(product);
    return uniqueOptions(variants
        .filter((v) => normalizeText(getVariantVersionLabel(v)) === versionText)
        .map((v, i) => normalizeColorOption({ ...v, label: v.colorName || v.color || v.label || v.name }, i))
        .filter(Boolean));
};

const findSelectedVariant = (product, sv, sc, sr) => {
    const variants = getActiveVariants(product);
    if (!variants.length) return null;
    const versionText = normalizeText(sv?.label);
    const colorText = normalizeText(sc?.label);
    const ramText = normalizeText(sr?.label);
    return variants.find((v) => {
        const vVer = normalizeText(getVariantVersionLabel(v));
        const vCol = normalizeText(v.colorName || v.color);
        const vRam = normalizeText(v.ram);
        return (!versionText || vVer === versionText) && (!colorText || vCol === colorText) && (!ramText || vRam === ramText);
    }) || null;
};

const Stars = ({ value = 5, size = 'sm' }) => (
    <div className={cn("inline-flex items-center gap-0.5", size === 'sm' ? "text-xs" : "text-base")} aria-label={`${value} star rating`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className={cn(i < Math.round(value) ? "fas fa-star text-[var(--color-gold)]" : "far fa-star text-[var(--color-fg-dim)]")}></i>
        ))}
    </div>
);

const StarPicker = ({ value, onChange, labels = ratingLabels }) => (
    <div className="flex items-center gap-3">
        <div role="radiogroup" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    aria-label={`${star} sao`}
                    onClick={() => onChange(star)}
                    className={cn(
                        "text-lg transition-colors",
                        star <= value ? "text-[var(--color-gold)]" : "text-[var(--color-fg-dim)] hover:text-[var(--color-fg-muted)]"
                    )}
                >
                    <i className="fas fa-star"></i>
                </button>
            ))}
        </div>
        <span className="text-xs text-[var(--color-fg-muted)]">{value ? labels[value] : 'Chưa chọn'}</span>
    </div>
);

const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();
    const { coupons } = usePublicCoupons();
    const isViewOnly = isStoreViewOnlyUser(user);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addedMsg, setAddedMsg] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    const [activeImage, setActiveImage] = useState('');
    const [claimedCouponIds, setClaimedCouponIds] = useState([]);
    const [claimingCouponIds, setClaimingCouponIds] = useState([]);
    const [couponMsg, setCouponMsg] = useState('');
    const [activeTab, setActiveTab] = useState('description');
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [temporaryReviews, setTemporaryReviews] = useState([]);
    const [reviewMsg, setReviewMsg] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [experienceRatings, setExperienceRatings] = useState({});
    const [reviewContent, setReviewContent] = useState('');
    const [reviewImages, setReviewImages] = useState([]);
    const [reviewError, setReviewError] = useState('');
    const [temporaryQuestions, setTemporaryQuestions] = useState([]);
    const [fetchedReviews, setFetchedReviews] = useState([]);
    const [fetchedQuestions, setFetchedQuestions] = useState([]);
    const [questionInput, setQuestionInput] = useState('');
    const [questionError, setQuestionError] = useState('');
    const [questionMsg, setQuestionMsg] = useState('');
    const [expandedQuestionIds, setExpandedQuestionIds] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedRam, setSelectedRam] = useState(null);

    const numericId = useMemo(() => Number(id), [id]);
    const productImage = useMemo(() => {
        try { return resolveProductImage(product); }
        catch { return ''; }
    }, [product]);

    const productName = fixText(product?.name);
    const productCategoryName = fixText(product?.category?.name || product?.categoryName || product?.category || 'Sản phẩm');
    const productRams = useMemo(() => getProductRams(product), [product]);
    const productVersions = useMemo(() => getProductVersions(product), [product]);
    const productColors = useMemo(() => getProductColors(product), [product]);
    const selectedVariant = useMemo(() => findSelectedVariant(product, selectedVersion, selectedColor, selectedRam), [product, selectedVersion, selectedColor, selectedRam]);
    const productStock = Number(selectedVariant?.stock ?? selectedRam?.stock ?? selectedVersion?.stock ?? selectedColor?.stock ?? product?.stock ?? 0);
    const productPrice = Number(selectedVariant?.price ?? selectedRam?.price ?? selectedVersion?.price ?? selectedColor?.price ?? product?.price ?? 0);
    const productDescription = fixText(product?.longDescription || product?.description);
    const oldPrice = selectedVariant?.originalPrice ?? selectedVariant?.oldPrice ?? selectedRam?.oldPrice ?? selectedVersion?.oldPrice ?? selectedColor?.oldPrice ?? product?.originalPrice ?? product?.oldPrice ?? 0;
    const displaySku = selectedVariant?.sku || selectedRam?.sku || selectedVersion?.sku || selectedColor?.sku || product?.sku || product?.id;
    const selectedImage = selectedVariant?.imageUrl || selectedVariant?.image || selectedColor?.image || selectedRam?.image || selectedVersion?.image || '';
    const displayImage = selectedImage ? resolveProductImage({ id: product?.id, imageUrl: selectedImage }) : productImage;
    const galleryImages = useMemo(() => {
        const productImages = Array.isArray(product?.images) ? product.images.map((i) => i.imageUrl || i.url) : [];
        const variantImages = Array.isArray(product?.variants) ? product.variants.map((v) => v.imageUrl || v.image) : [];
        const images = [
            displayImage, productImage,
            ...productImages.map((u) => resolveProductImage({ id: product?.id, imageUrl: u })),
            ...variantImages.map((u) => resolveProductImage({ id: product?.id, imageUrl: u })),
        ];
        return [...new Set(images.filter(Boolean))];
    }, [displayImage, productImage, product]);
    const localCatalog = useMemo(() => productApi.getLocalCatalog?.() || [], [product?.id]);
    const productSpecifications = useMemo(() => getProductSpecs(product), [product]);
    const descriptionParts = useMemo(() => getProductDescriptionParts(product), [product]);
    const reviewExperienceItems = useMemo(() => reviewCriteria[getCategoryType(product)] || reviewCriteria.default, [product]);
    const productReviews = useMemo(() => {
        return [...temporaryReviews, ...fetchedReviews].filter((r) => r.content);
    }, [fetchedReviews, temporaryReviews]);
    const reviewSummary = useMemo(() => {
        if (!productReviews.length) return { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
        const distribution = productReviews.reduce((acc, r) => {
            const s = Math.round(r.rating);
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        const average = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
        return { average, total: productReviews.length, distribution };
    }, [productReviews]);
    const visibleReviews = showAllReviews ? productReviews : productReviews.slice(0, 3);
    const productQuestions = useMemo(() => {
        return [...temporaryQuestions, ...fetchedQuestions];
    }, [fetchedQuestions, temporaryQuestions]);
    const computedRelatedProducts = useMemo(() => {
        const scored = getRelatedProducts(product, localCatalog);
        return scored.length ? scored : relatedProducts.slice(0, 4);
    }, [product, localCatalog, relatedProducts]);
    const productCouponContext = useMemo(() => ({
        product, subtotal: productPrice,
        cartItems: product ? [{ product, quantity: 1 }] : [],
        currentHour: new Date().getHours(),
    }), [product, productPrice]);
    const productCoupons = useMemo(() => getAvailableCouponsForProduct(product, coupons, productCouponContext, claimedCouponIds), [product, coupons, productCouponContext, claimedCouponIds]);
    const visibleProductCoupons = productCoupons.slice(0, 3);

    useEffect(() => {
        setPageMeta({ title: `${t('Product Details')} | TechStore`, description: t('Product meta description') });
        // Load claimed coupons from backend
        const loadClaimedCoupons = async () => {
            try {
                const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
                const claimedIds = myCoupons.data?.items?.map((c) => String(c.couponId)) || [];
                setClaimedCouponIds(claimedIds);
            } catch (error) {
                console.error('Failed to load claimed coupons:', error);
                setClaimedCouponIds([]);
            }
        };
        loadClaimedCoupons();
    }, []);

    useEffect(() => {
        if (!Number.isFinite(numericId) || numericId <= 0) {
            setError(t('Product not found'));
            setProduct(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const instantProduct = getInstantProduct(numericId);

        setError(''); setQuantity(1); setAddedMsg(''); setCouponMsg('');
        setShowAllReviews(false); setReviewMsg(''); setReviewModalOpen(false);
        setReviewRating(0); setExperienceRatings({}); setReviewContent('');
        setReviewImages([]); setReviewError(''); setTemporaryReviews([]);
        setTemporaryQuestions([]); setQuestionInput(''); setQuestionError('');
        setQuestionMsg(''); setExpandedQuestionIds([]);
        setSelectedVersion(null); setSelectedColor(null); setSelectedRam(null);
        setActiveTab('description');

        if (instantProduct) {
            setProduct(instantProduct);
            setRelatedProducts(getRelatedProductsFromLocalCatalog(instantProduct));
            rememberRecentProduct(instantProduct);
            setRecentlyViewedProducts(safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []).filter((i) => i?.id !== instantProduct.id).slice(0, 4));
            cacheProductDetail(instantProduct);
        }

        const loadProduct = async () => {
            setLoading(!instantProduct);
            try {
                const response = await productApi.getById(numericId);
                const data = response.data;
                if (cancelled) return;
                if (!data?.id) {
                    setError(t('Product not found'));
                    setProduct(null);
                    setRelatedProducts([]);
                    return;
                }
                setProduct(data);
                setRelatedProducts(getRelatedProductsFromLocalCatalog(data));
                rememberRecentProduct(data);
                setRecentlyViewedProducts(safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []).filter((i) => i?.id !== data.id).slice(0, 4));
                cacheProductDetail(data);

                try {
                    const { ticketApi } = await import('../../services/api');
                    const ticketsRes = await ticketApi.getPublicByProduct(numericId);
                    const tickets = ticketsRes.data || [];
                    
                    // Separate reviews and Q&A based on subject
                    const reviewTickets = tickets.filter(t => t.category === 'Product' && t.subject?.includes('[Review'));
                    const qaTickets = tickets.filter(t => t.category === 'Product' && t.subject === 'Hỏi đáp sản phẩm');
                    
                    const reviews = reviewTickets.map(t => {
                        const details = safeParseJson(t.description, {});
                        // Parse admin responses from ticket updates
                        const adminResponses = (t.updates || [])
                            .filter(u => !u.isInternalNote && u.isAdminReply)
                            .map(u => ({
                                content: u.message,
                                createdAt: u.createdAt,
                                adminName: 'Quản trị viên'
                            }));
                        
                        return normalizeReview({
                            id: t.id,
                            customerName: t.customerName || 'Khách hàng',
                            rating: details.rating || 5,
                            date: new Date(t.createdAt).toLocaleDateString('vi-VN'),
                            createdAt: t.createdAt,
                            content: details.content || t.description,
                            experienceRatings: details.experienceRatings || {},
                            images: details.images || [],
                            adminResponses
                        });
                    });
                    setFetchedReviews(reviews);

                    const questions = qaTickets.map(t => {
                        return {
                            id: t.id,
                            customerName: t.customerName || 'Khách hàng',
                            question: t.description || t.subject,
                            createdAt: t.createdAt,
                            repliesTree: t.updatesTree || []
                        };
                    });
                    setFetchedQuestions(questions);
                } catch (e) {
                    console.error("Failed to load tickets", e);
                }
            } catch (e) {
                if (cancelled) return;
                const data = e.response?.data;
                setError(data?.message || data?.detail || data?.title || t('Unable to load product.'));
                setProduct(null);
                setRelatedProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProduct();
        return () => { cancelled = true; };
    }, [numericId]);

    useEffect(() => { setActiveImage(displayImage); }, [displayImage]);

    useEffect(() => {
        if (!product) return;
        const variants = getActiveVariants(product);
        if (!variants.length) return;

        const matched = findSelectedVariant(product, selectedVersion, selectedColor, selectedRam);
        if ((!productVersions.length || selectedVersion) && (!productColors.length || selectedColor) && (!productRams.length || selectedRam) && matched) return;

        const fallback =
            findSelectedVariant(product, selectedVersion, selectedColor, null) ||
            findSelectedVariant(product, selectedVersion, null, selectedRam) ||
            findSelectedVariant(product, null, selectedColor, selectedRam) ||
            findSelectedVariant(product, selectedVersion, null, null) ||
            findSelectedVariant(product, null, selectedColor, null) ||
            findSelectedVariant(product, null, null, selectedRam) ||
            variants.find((item) => Number(item.stock || 0) > 0) ||
            variants[0];

        if (!fallback) return;

        const versionKey = normalizeText(getVariantVersionLabel(fallback));
        const colorKey = normalizeText(fallback.colorName || fallback.color);
        const ramKey = normalizeText(fallback.ram);
        const nextVersion = productVersions.find((item) => normalizeText(item.label) === versionKey) || null;
        const nextColor = productColors.find((item) => normalizeText(item.label) === colorKey) || null;
        const nextRam = productRams.find((item) => normalizeText(item.label) === ramKey) || null;

        if ((nextVersion?.id || null) !== (selectedVersion?.id || null)) {
            setSelectedVersion(nextVersion);
        }
        if ((nextColor?.id || null) !== (selectedColor?.id || null)) {
            setSelectedColor(nextColor);
        }
        if ((nextRam?.id || null) !== (selectedRam?.id || null)) {
            setSelectedRam(nextRam);
        }
    }, [product, productVersions, productColors, productRams, selectedVersion, selectedColor, selectedRam]);

    useEffect(() => {
        if (!reviewModalOpen) return undefined;
        const handleEscape = (e) => { if (e.key === 'Escape') setReviewModalOpen(false); };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [reviewModalOpen]);

    const handleAddToCart = () => {
        if (isViewOnly) {
            setAddedMsg(STORE_VIEW_ONLY_MESSAGE);
            setTimeout(() => setAddedMsg(''), 2500);
            return;
        }
        if (productStock <= 0 || quantity < 1) return;
        if (productRams.length && !selectedRam) {
            setAddedMsg('Vui lòng chọn RAM.');
            setTimeout(() => setAddedMsg(''), 2500);
            return;
        }
        if (productVersions.length && !selectedVersion) {
            setAddedMsg('Vui lòng chọn phiên bản.');
            setTimeout(() => setAddedMsg(''), 2500);
            return;
        }
        if (productColors.length && !selectedColor) {
            setAddedMsg('Vui lòng chọn màu sắc.');
            setTimeout(() => setAddedMsg(''), 2500);
            return;
        }
        addItem({
            ...product, id: product.id, productId: product.id,
            variantId: selectedVariant?.id,
            selectedRam: selectedRam?.label || '',
            selectedVersion: selectedVersion?.label || '',
            selectedColor: selectedColor?.label || '',
            price: productPrice, oldPrice, stock: productStock,
            sku: displaySku, image: displayImage, imageUrl: displayImage,
            name: [product.name, selectedRam?.label, selectedVersion?.label, selectedColor?.label].filter(Boolean).join(' - '),
        }, quantity);
        setAddedMsg(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
        setTimeout(() => setAddedMsg(''), 2500);
    };

    const showCouponMessage = (msg) => {
        setCouponMsg(msg);
        setTimeout(() => setCouponMsg(''), 2500);
    };

    const handleClaimCoupon = async (coupon) => {
        if (isViewOnly) {
            showCouponMessage(STORE_VIEW_ONLY_MESSAGE);
            return;
        }
        if (claimingCouponIds.includes(coupon.id)) return;
        if (!canClaimCoupon(coupon, productCouponContext, claimedCouponIds)) {
            showCouponMessage(getCouponClaimStatus(coupon, productCouponContext, claimedCouponIds).message || 'Chưa đủ điều kiện');
            return;
        }
        setClaimingCouponIds((c) => [...c, coupon.id]);
        try {
            await couponApi.claim(coupon.apiId || coupon.id);
            const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
            const claimedIds = myCoupons.data?.items?.map((c) => String(c.couponId)) || [];
            setClaimedCouponIds(claimedIds);
            showCouponMessage('Đã lưu phiếu vào ví');
        } catch (error) {
            const msg = error.response?.data?.message || '';
            if (error.response?.status === 400 && /nhan|đã nhận|da nhan/i.test(msg)) {
                try {
                    const myCoupons = await couponApi.getMy({ page: 1, pageSize: 100 });
                    const claimedIds = myCoupons.data?.items?.map((c) => String(c.couponId)) || [];
                    setClaimedCouponIds(claimedIds);
                } catch (e) {
                    console.error('Failed to refresh claimed coupons after duplicate claim', e);
                }
                showCouponMessage('Bạn đã nhận phiếu này');
            } else {
                showCouponMessage(msg || 'Không thể nhận phiếu');
            }
        } finally {
            setClaimingCouponIds((c) => c.filter((id) => id !== coupon.id));
        }
    };

    const changeActiveImage = (direction) => {
        const currentIndex = Math.max(0, galleryImages.indexOf(activeImage));
        const nextIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
        setActiveImage(galleryImages[nextIndex]);
    };

    const openReviewModal = () => {
        setReviewError(''); setReviewMsg('');
        setReviewModalOpen(true);
    };

    const handleReviewImageChange = (event) => {
        const files = Array.from(event.target.files || []).slice(0, Math.max(0, 3 - reviewImages.length));
        const nextImages = files.map((f) => ({ id: `${f.name}-${f.lastModified}-${Date.now()}`, name: f.name, preview: URL.createObjectURL(f) }));
        setReviewImages((c) => [...c, ...nextImages].slice(0, 3));
        event.target.value = '';
    };

    const removeReviewImage = (imageId) => {
        setReviewImages((current) => {
            const removed = current.find((i) => i.id === imageId);
            if (removed?.preview) URL.revokeObjectURL(removed.preview);
            return current.filter((i) => i.id !== imageId);
        });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (isViewOnly) {
            setReviewError(STORE_VIEW_ONLY_MESSAGE);
            return;
        }
        const content = reviewContent.trim();
        if (!reviewRating) return setReviewError('Vui lòng chọn đánh giá chung.');
        if (content.length < 15) return setReviewError('Vui lòng nhập nhận xét tối thiểu 15 ký tự.');

        const descriptionObj = {
            content,
            rating: reviewRating,
            experienceRatings,
            images: reviewImages.map((i) => i.preview)
        };

        try {
            const { ticketApi } = await import('../../services/api');
            await ticketApi.create({
                category: 'Product',
                relatedProductId: numericId,
                subject: `[Review - ${reviewRating} Sao] Đánh giá sản phẩm`,
                description: JSON.stringify(descriptionObj),
                customerName: 'Khách hàng',
            });
            const newReview = normalizeReview({
                id: `temp-review-${Date.now()}`,
                customerName: 'Khách hàng',
                rating: reviewRating,
                date: new Date().toLocaleDateString('vi-VN'),
                createdAt: new Date().toISOString(),
                ...descriptionObj
            });
            setTemporaryReviews((c) => [newReview, ...c]);
            setReviewRating(0); setExperienceRatings({}); setReviewContent('');
            setReviewImages([]); setReviewError(''); setReviewModalOpen(false);
            setReviewMsg('Cảm ơn bạn đã gửi đánh giá.');
        } catch (err) {
            setReviewError('Có lỗi xảy ra, vui lòng thử lại sau.');
        }
    };

    const toggleQuestionAnswer = (id) => {
        setExpandedQuestionIds((c) => c.includes(id) ? c.filter((i) => i !== id) : [...c, id]);
    };

    const renderQuestionReplies = (nodes, depth = 0) => {
        const items = Array.isArray(nodes) ? nodes : [];
        if (!items.length) return null;

        return (
            <div className={cn(depth ? "ml-8 mt-3 space-y-3 border-l border-[var(--color-border)] pl-4" : "mt-3 space-y-3 ml-12")}>
                {items.map((node) => (
                    <div key={node.id} className={cn("rounded-md p-3", node.isAdminReply ? "border border-[var(--color-border)] bg-[var(--color-surface-2)]" : "bg-[var(--color-background)]")}>
                        <div className="flex items-baseline gap-2">
                            <strong className="text-xs text-[var(--color-fg)]">{node.senderName || (node.isAdminReply ? 'Admin' : 'Khách hàng')}</strong>
                            {node.isAdminReply && (
                                <span className="rounded bg-red-500/15 px-1 py-0.5 text-[9px] font-bold text-red-400">Admin</span>
                            )}
                            <span className="text-[11px] text-[var(--color-fg-dim)]">{formatRelativeTime(node.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">{node.message}</p>
                        {renderQuestionReplies(node.replies, depth + 1)}
                    </div>
                ))}
            </div>
        );
    };

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        if (isViewOnly) {
            setQuestionError(STORE_VIEW_ONLY_MESSAGE);
            setQuestionMsg('');
            return;
        }
        const question = questionInput.trim();
        if (question.length < 10) {
            setQuestionError('Vui lòng nhập câu hỏi tối thiểu 10 ký tự.');
            setQuestionMsg('');
            return;
        }

        try {
            const { ticketApi } = await import('../../services/api');
            await ticketApi.create({
                category: 'Product',
                relatedProductId: numericId,
                subject: 'Hỏi đáp sản phẩm',
                description: question,
                customerName: 'Khách hàng',
            });
            setTemporaryQuestions((c) => [{
                id: `temp-question-${Date.now()}`,
                customerName: 'Khách hàng',
                question, createdAt: new Date().toISOString(),
                repliesTree: [],
            }, ...c]);
            setQuestionInput(''); setQuestionError('');
            setQuestionMsg('Câu hỏi của bạn đã được gửi.');
        } catch (err) {
            setQuestionError('Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    if (loading) {
        return (
            <>
                <PageHero title={t('Product Details')} current={t('Product Details')} kicker="Sản phẩm" />
                <section className="ts-container py-12">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="aspect-square animate-pulse rounded-md bg-[var(--color-surface)]" />
                        <div className="space-y-4">
                            <div className="h-8 w-2/3 animate-pulse rounded bg-[var(--color-surface)]" />
                            <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--color-surface)]" />
                            <div className="h-12 w-1/4 animate-pulse rounded bg-[var(--color-surface)]" />
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <PageHero title={t('Product Details')} current={t('Product Details')} kicker="Sản phẩm" />
                <section className="ts-container flex flex-col items-center py-20 text-center">
                    <i className="fas fa-exclamation-circle text-4xl text-[var(--color-fg-dim)]"></i>
                    <p className="mt-6 text-sm text-[var(--color-fg-muted)]">{error || t('Product not found')}</p>
                    <Link to="/shop" className="ts-btn ts-btn-primary mt-6">{t('Back to Shop')}</Link>
                </section>
            </>
        );
    }

    return (
        <>
            <PageHero title={t('Product Details')} current={productName || t('Product Details')} kicker="Sản phẩm" />

            <section className="ts-container py-12">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-[var(--color-fg-dim)]">
                    <Link to="/" className="hover:text-[var(--color-accent)]">{t('Home')}</Link>
                    <span className="text-[var(--color-border-strong)]">·</span>
                    <Link to={`/shop?categoryId=${product.categoryId || ''}`} className="hover:text-[var(--color-accent)]">{productCategoryName}</Link>
                    <span className="text-[var(--color-border-strong)]">·</span>
                    <span className="truncate text-[var(--color-fg)]">{productName}</span>
                </nav>

                {/* Main grid */}
                <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:justify-center">
                    {/* Gallery */}
                    <div className="min-w-0 w-full max-w-[520px] justify-self-center lg:justify-self-start">
                        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                            {activeImage || productImage ? (
                                <img src={activeImage || productImage} alt={productName} className="h-full w-full object-contain p-12" />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--color-fg-dim)]">
                                    <i className="far fa-image text-5xl"></i>
                                    <span className="text-sm font-semibold">Chưa có ảnh sản phẩm</span>
                                </div>
                            )}
                            {galleryImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => changeActiveImage(-1)}
                                        aria-label="Ảnh trước"
                                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)]/80 text-[var(--color-fg-muted)] backdrop-blur-md transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                    >
                                        <i className="fas fa-chevron-left text-xs"></i>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => changeActiveImage(1)}
                                        aria-label="Ảnh sau"
                                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)]/80 text-[var(--color-fg-muted)] backdrop-blur-md transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                    >
                                        <i className="fas fa-chevron-right text-xs"></i>
                                    </button>
                                </>
                            )}
                        </div>
                        {galleryImages.length > 1 && (
                            <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
                                {galleryImages.map((image) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setActiveImage(image)}
                                        className={cn(
                                            "h-16 w-16 shrink-0 overflow-hidden rounded-sm border-2 bg-[var(--color-surface)] p-1 transition-all",
                                            activeImage === image ? "border-[var(--color-primary)]" : "border-[var(--color-border)] opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img src={image} alt="" className="h-full w-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                        <p className="ts-eyebrow text-[var(--color-accent)]">{productCategoryName}</p>
                        <h1 className="ts-display mt-3 break-words text-3xl text-[var(--color-fg)] md:text-4xl">{productName}</h1>

                        <div className="mt-4 flex items-center gap-3">
                            <Stars value={reviewSummary.average} />
                            <span className="text-xs text-[var(--color-fg-dim)]">
                                {reviewSummary.total > 0
                                    ? `${reviewSummary.average.toFixed(1)} · ${reviewSummary.total} đánh giá`
                                    : 'Chưa có đánh giá'}
                            </span>
                        </div>

                        <div className="mt-6 flex flex-wrap items-baseline gap-3">
                            <span className="ts-mono text-3xl font-semibold ts-gradient-text sm:text-4xl">{formatCurrency(productPrice)}</span>
                            {oldPrice > productPrice && (
                                <del className="ts-mono text-base text-[var(--color-fg-dim)]">{formatCurrency(oldPrice)}</del>
                            )}
                        </div>

                        <div className="mt-6 border-y border-[var(--color-border)] py-4 text-xs">
                            <div>
                                <p className="ts-eyebrow text-[10px]">Tình trạng</p>
                                <p className={cn("mt-1 font-medium", productStock > 0 ? "text-emerald-400" : "text-red-400")}>
                                    {productStock > 0 ? `${t('In Stock')} (${productStock})` : t('Out of Stock')}
                                </p>
                            </div>
                        </div>

                        {/* RAM */}
                        {productRams.length > 0 && (
                            <div className="mt-6">
                                <p className="ts-eyebrow mb-3 text-[10px]">RAM</p>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {productRams.map((ram) => {
                                        const active = selectedRam?.id === ram.id;
                                        const oos = isOptionOutOfStock(ram);
                                        return (
                                            <button
                                                key={ram.id}
                                                type="button"
                                                onClick={() => setSelectedRam(ram)}
                                                disabled={oos}
                                                className={cn(
                                                    "flex flex-col items-start rounded-sm border p-3 text-left transition-all",
                                                    active
                                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                                                    oos && "opacity-50"
                                                )}
                                            >
                                                <strong className="text-sm text-[var(--color-fg)]">{ram.label}</strong>
                                                {oos && <em className="mt-1 text-[10px] not-italic text-red-400">Hết hàng</em>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Versions */}
                        {productVersions.length > 0 && (
                            <div className="mt-6">
                                <p className="ts-eyebrow mb-3 text-[10px]">Phiên bản</p>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {productVersions.map((version) => {
                                        const active = selectedVersion?.id === version.id;
                                        const oos = isOptionOutOfStock(version);
                                        return (
                                            <button
                                                key={version.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVersion(version);
                                                    const nextColors = getAvailableColors(product, version);
                                                    if (nextColors.length && !nextColors.some((item) => item.id === selectedColor?.id)) {
                                                        setSelectedColor(nextColors[0]);
                                                    }
                                                }}
                                                disabled={oos}
                                                className={cn(
                                                    "flex flex-col items-start rounded-sm border p-3 text-left transition-all",
                                                    active
                                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                                                    oos && "opacity-50"
                                                )}
                                            >
                                                <strong className="text-sm text-[var(--color-fg)]">{version.label}</strong>
                                                {oos && <em className="mt-1 text-[10px] not-italic text-red-400">Hết hàng</em>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {productColors.length > 0 && (
                            <div className="mt-6">
                                <p className="ts-eyebrow mb-3 text-[10px]">Màu sắc</p>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {productColors.map((color) => {
                                        const active = selectedColor?.id === color.id;
                                        const colorImage = color.image ? resolveProductImage({ id: product.id, imageUrl: color.image }) : '';
                                        const oos = isOptionOutOfStock(color);
                                        return (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    const nextVersions = getAvailableVersions(product, color);
                                                    if (nextVersions.length && !nextVersions.some((item) => item.id === selectedVersion?.id)) {
                                                        setSelectedVersion(nextVersions[0]);
                                                    }
                                                    if (colorImage) setActiveImage(colorImage);
                                                }}
                                                disabled={oos}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-sm border p-2 text-left transition-all",
                                                    active ? "border-[var(--color-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                                                    oos && "opacity-50"
                                                )}
                                            >
                                                {colorImage ? (
                                                    <img src={colorImage} alt="" className="h-8 w-8 rounded-sm object-contain" />
                                                ) : (
                                                    <span className="h-6 w-6 rounded-sm border border-[var(--color-border)]" style={{ backgroundColor: color.colorCode || '#333' }} />
                                                )}
                                                <span className="min-w-0">
                                                    <strong className="block truncate text-xs text-[var(--color-fg)]">{color.label}</strong>
                                                    {color.price != null && <small className="ts-mono block text-[10px] text-[var(--color-accent)]">{formatCurrency(color.price)}</small>}
                                                    {oos && <small className="block text-[10px] text-red-400">Het hang</small>}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity + Add to Cart */}
                        <div className="mt-8 flex items-center gap-3">
                            <div className="flex items-center rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)]">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                                    disabled={quantity <= 1}
                                    aria-label="Giảm"
                                    className="flex h-11 w-11 items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] disabled:opacity-40"
                                >
                                    <i className="fas fa-minus text-xs"></i>
                                </button>
                                <span className="ts-mono w-12 text-center text-sm font-semibold text-[var(--color-fg)]">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity((v) => Math.min(productStock, v + 1))}
                                    disabled={productStock <= 0 || quantity >= productStock}
                                    aria-label="Tăng"
                                    className="flex h-11 w-11 items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] disabled:opacity-40"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={productStock <= 0}
                                className="ts-btn ts-btn-primary h-11 flex-1 px-6 text-sm"
                            >
                                <i className="fas fa-shopping-cart"></i>
                                {t('Add To Cart')}
                            </button>
                        </div>

                        {addedMsg && (
                            <div className="mt-3 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
                                <i className="fas fa-check-circle mr-2"></i>{addedMsg}
                            </div>
                        )}

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => toggleWishlist(product)}
                                className={cn(
                                    "ts-btn flex-1 text-xs",
                                    isInWishlist(product.id)
                                        ? "border-black bg-white text-black hover:bg-white"
                                        : "ts-btn-outline hover:border-black hover:text-black"
                                )}
                            >
                                <i className={isInWishlist(product.id) ? "fas fa-heart" : "far fa-heart"}></i>
                                {t('Wishlist')}
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleCompare(product)}
                                className={cn(
                                    "ts-btn flex-1 text-xs",
                                    isInCompare(product.id)
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15"
                                        : "ts-btn-outline"
                                )}
                            >
                                <i className="fas fa-random"></i>
                                {t('Compare')}
                            </button>
                        </div>

                        {/* Coupons */}
                        {productCoupons.length > 0 && (
                            <div className="mt-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="ts-eyebrow text-[var(--color-accent)]">Phiếu giảm giá</p>
                                    <Link to="/promotion" className="text-[11px] text-[var(--color-fg-dim)] hover:text-[var(--color-accent)]">Xem thêm</Link>
                                </div>
                                {couponMsg && (
                                    <div className="mb-3 rounded-sm border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-fg)]">{couponMsg}</div>
                                )}
                                <div className="space-y-2">
                                    {visibleProductCoupons.map(({ coupon, claimStatus }) => {
                                        const status = claimedCouponIds.includes(String(coupon.id)) ? 'claimed' : claimStatus.status;
                                        const canReceive = status === 'available';
                                        const isClaimed = status === 'claimed';
                                        return (
                                            <div key={coupon.id} className="flex items-center gap-3 rounded-sm border border-dashed border-[var(--color-border)] p-3">
                                                <span className="ts-mono shrink-0 rounded-sm bg-[var(--color-accent)]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">{coupon.code}</span>
                                                <span className="min-w-0 flex-1 truncate text-xs text-[var(--color-fg-muted)]">{coupon.title}</span>
                                                <button
                                                    type="button"
                                                    disabled={!canReceive || claimingCouponIds.includes(coupon.id)}
                                                    onClick={() => handleClaimCoupon(coupon)}
                                                    className={cn(
                                                        "shrink-0 rounded-sm px-3 py-1 text-[11px] font-medium",
                                                        isClaimed && "border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
                                                        canReceive && "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] text-white",
                                                        !canReceive && !isClaimed && "border border-[var(--color-border)] text-[var(--color-fg-dim)]"
                                                    )}
                                                >
                                                    {isClaimed ? 'Đã nhận' : (claimingCouponIds.includes(coupon.id) ? 'Đang xử lý...' : (canReceive ? 'Nhận' : 'Chưa đủ'))}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs: Description / Specs / Reviews / QnA */}
                <div className="mt-16">
                    <div className="flex gap-6 border-b border-[var(--color-border)] overflow-x-auto">
                        {[
                            { id: 'description', label: 'Mô tả' },
                            { id: 'specs', label: 'Thông số' },
                            { id: 'reviews', label: `Đánh giá${reviewSummary.total ? ` (${reviewSummary.total})` : ''}` },
                            { id: 'qna', label: 'Hỏi & Đáp' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative whitespace-nowrap pb-4 text-sm font-medium tracking-wide transition-colors",
                                    activeTab === tab.id ? "text-[var(--color-fg)]" : "text-[var(--color-fg-dim)] hover:text-[var(--color-fg-muted)]"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        {activeTab === 'description' && (
                            <div className="prose-luxury max-w-3xl space-y-4 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                                {descriptionParts.length > 0 ? descriptionParts.map((part, i) => (
                                    Array.isArray(part) ? (
                                        <ul key={i} className="list-disc space-y-1 pl-6">
                                            {part.map((item) => <li key={item}>{item}</li>)}
                                        </ul>
                                    ) : <p key={i}>{part}</p>
                                )) : <p className="italic">{t('No description')}</p>}
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="max-w-3xl ts-table-container">
                                {productSpecifications.length > 0 ? (
                                    <table className="ts-table">
                                        <tbody>
                                            {productSpecifications.map(({ label, value }) => (
                                                <tr key={label}>
                                                    <th scope="row" className="w-1/3 bg-[var(--color-surface-2)] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-fg-dim)]">{label}</th>
                                                    <td className="px-4 py-3 text-[var(--color-fg)]">{String(value)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="p-8 text-center text-sm text-[var(--color-fg-dim)]">Chưa có thông số.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <ReviewsSection
                                reviewMsg={reviewMsg}
                                reviews={productReviews}
                                summary={reviewSummary}
                                visibleReviews={visibleReviews}
                                showAll={showAllReviews}
                                onToggleShowAll={() => setShowAllReviews((v) => !v)}
                                onWriteReview={openReviewModal}
                                Stars={Stars}
                            />
                        )}

                        {activeTab === 'qna' && (
                            <QASection
                                onSubmit={handleSubmitQuestion}
                                questionInput={questionInput}
                                onQuestionChange={(e) => { setQuestionInput(e.target.value); setQuestionError(''); }}
                                questionError={questionError}
                                questionMsg={questionMsg}
                                questions={productQuestions}
                                expandedIds={expandedQuestionIds}
                                onToggle={toggleQuestionAnswer}
                                renderReplies={renderQuestionReplies}
                                formatRelativeTime={formatRelativeTime}
                            />
                        )}
                    </div>
                </div>

                {/* Review Modal */}
                <ReviewModal
                    open={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    onSubmit={handleSubmitReview}
                    productName={productName}
                    image={displayImage || productImage}
                    StarPicker={StarPicker}
                    rating={reviewRating}
                    onRatingChange={(r) => { setReviewRating(r); setReviewError(''); }}
                    experienceItems={reviewExperienceItems}
                    experienceRatings={experienceRatings}
                    onExperienceChange={(criterion, r) => setExperienceRatings((c) => ({ ...c, [criterion]: r }))}
                    content={reviewContent}
                    onContentChange={(e) => { setReviewContent(e.target.value); setReviewError(''); }}
                    onImageChange={handleReviewImageChange}
                    images={reviewImages}
                    onRemoveImage={removeReviewImage}
                    error={reviewError}
                />

                {/* Related */}
                <ProductGridSection title="Sản phẩm liên quan" products={computedRelatedProducts} />

                {/* Recently viewed */}
                <ProductGridSection title="Sản phẩm đã xem gần đây" products={recentlyViewedProducts} />
            </section>
        </>
    );
};

export default ProductDetail;
