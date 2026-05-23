import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import PageHero from '../../components/store/PageHero';
import ProductCard from '../../components/store/ProductCard';
import coupons from '../../data/coupons';
import { canClaimCoupon, claimCoupon, getAvailableCouponsForProduct, getClaimedCoupons, getCouponClaimStatus, isCouponClaimed } from '../../utils/couponUtils';
import { fadeInUp, motionTransition } from '../../utils/motionVariants';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const PRODUCT_DETAIL_CACHE_KEY = 'electro_product_detail_cache';

const safeParseJson = (value, fallback) => {
    try { return JSON.parse(value); } catch { return fallback; }
};

const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä‘/g, 'd')
    .replace(/Ä/g, 'D')
    .toLowerCase();

const singleViewport = { once: true, amount: 0.05, margin: '0px 0px 100px 0px' };
const singleTransition = { ...motionTransition, duration: 0.9 };

const Rating = ({ small = false }) => (
    <div className={`electro-rating ${small ? 'mini' : ''}`} aria-label="4 star rating">
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star text-muted"></i>
    </div>
);

const normalizeRecentProduct = (product) => {
    if (!product) return null;
    return {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        category: product.category,
        brand: product.brand,
    };
};

const getProductDetailCache = () => {
    const cached = safeParseJson(sessionStorage.getItem(PRODUCT_DETAIL_CACHE_KEY) || '{}', {});
    return cached && typeof cached === 'object' && !Array.isArray(cached) ? cached : {};
};

const cacheProductDetail = (product) => {
    if (!product?.id) return;
    const cached = getProductDetailCache();
    sessionStorage.setItem(PRODUCT_DETAIL_CACHE_KEY, JSON.stringify({
        ...cached,
        [product.id]: product,
    }));
};

const getInstantProduct = (productId) => {
    const cached = getProductDetailCache()[productId];
    if (cached?.id) return cached;
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
    const withoutDup = Array.isArray(current) ? current.filter(p => p?.id !== normalized.id) : [];
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([normalized, ...withoutDup].slice(0, 6)));
};

const normalizeSpecKey = (key) => String(key || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

const compactValue = (value) => {
    if (value == null) return '';
    if (Array.isArray(value)) return value.map(compactValue).filter(Boolean).join(', ');
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([itemKey, itemValue]) => {
                const text = compactValue(itemValue);
                return text ? `${getSpecLabel(itemKey)}: ${text}` : '';
            })
            .filter(Boolean)
            .join(', ');
    }
    return String(value).trim();
};

const inferBrandFromName = (name) => {
    const text = String(name || '').toLowerCase();
    const brands = ['Apple', 'Samsung', 'Xiaomi', 'Dell', 'Asus', 'HP', 'Lenovo', 'Canon', 'Sony', 'JBL', 'Bose', 'OnePlus', 'Nothing'];
    return brands.find((brand) => text.includes(brand.toLowerCase())) || '';
};

const getCategoryType = (product) => {
    const categoryText = normalizeText(`${product?.category?.name || ''} ${product?.categoryName || ''} ${product?.category || ''} ${product?.categorySlug || ''} ${product?.slug || ''}`);
    const name = normalizeText(product?.name);
    if (categoryText.includes('dien thoai') || categoryText.includes('dien-thoai') || categoryText.includes('phone') || categoryText.includes('smartphone') || name.includes('iphone') || name.includes('galaxy') || name.includes('phone')) return 'phone';
    if (categoryText.includes('laptop') || name.includes('laptop') || name.includes('macbook') || name.includes('thinkpad') || name.includes('xps') || name.includes('vivobook')) return 'laptop';
    if (categoryText.includes('tablet') || categoryText.includes('may tinh bang') || categoryText.includes('may-tinh-bang') || name.includes('ipad') || name.includes('tab ')) return 'tablet';
    if (categoryText.includes('dong ho thong minh') || categoryText.includes('dong-ho-thong-minh') || categoryText.includes('smartwatch') || categoryText.includes('watch') || name.includes('watch')) return 'smartwatch';
    if (categoryText.includes('may anh') || categoryText.includes('may-anh') || categoryText.includes('camera') || categoryText.includes('action-camera') || name.includes('camera') || name.includes('eos') || name.includes('a7')) return 'camera';
    if (categoryText.includes('tai nghe') || categoryText.includes('tai-nghe') || categoryText.includes('headphone') || categoryText.includes('earphone') || categoryText.includes('audio') || name.includes('airpods') || name.includes('earbud') || name.includes('earphone') || name.includes('headphone') || name.includes('quietcomfort')) return 'headphone';
    return 'default';
};

const specLabelMap = {
    brand: 'HÃ£ng sáº£n xuáº¥t',
    manufacturer: 'HÃ£ng sáº£n xuáº¥t',
    sku: 'MÃ£ sáº£n pháº©m',
    code: 'MÃ£ sáº£n pháº©m',
    model: 'MÃ£ sáº£n pháº©m',
    category: 'Danh má»¥c',
    cpu: 'CPU',
    cpuType: 'Loáº¡i CPU',
    processor: 'CPU',
    ram: 'Dung lÆ°á»£ng RAM',
    ramSize: 'Dung lÆ°á»£ng RAM',
    ramType: 'Loáº¡i RAM',
    memory: 'Dung lÆ°á»£ng RAM',
    storage: 'á»” cá»©ng',
    hardDrive: 'á»” cá»©ng',
    ssd: 'á»” cá»©ng',
    internalStorage: 'Bá»™ nhá»› trong',
    rom: 'Bá»™ nhá»› trong',
    gpu: 'Card Ä‘á»“ há»a',
    graphics: 'Card Ä‘á»“ há»a',
    graphicsCard: 'Card Ä‘á»“ há»a',
    graphicsType: 'Loáº¡i card Ä‘á»“ há»a',
    screen: 'MÃ n hÃ¬nh',
    screenSize: 'KÃ­ch thÆ°á»›c mÃ n hÃ¬nh',
    displaySize: 'KÃ­ch thÆ°á»›c mÃ n hÃ¬nh',
    display: 'MÃ n hÃ¬nh',
    screenTechnology: 'CÃ´ng nghá»‡ mÃ n hÃ¬nh',
    displayTechnology: 'CÃ´ng nghá»‡ mÃ n hÃ¬nh',
    screenResolution: 'Äá»™ phÃ¢n giáº£i mÃ n hÃ¬nh',
    resolution: 'Äá»™ phÃ¢n giáº£i mÃ n hÃ¬nh',
    screenFeatures: 'TÃ­nh nÄƒng mÃ n hÃ¬nh',
    displayFeatures: 'TÃ­nh nÄƒng mÃ n hÃ¬nh',
    refreshRate: 'Táº§n sá»‘ quÃ©t',
    chipset: 'Chipset',
    nfc: 'CÃ´ng nghá»‡ NFC',
    nfcTechnology: 'CÃ´ng nghá»‡ NFC',
    rearCamera: 'Camera sau',
    backCamera: 'Camera sau',
    frontCamera: 'Camera trÆ°á»›c',
    selfieCamera: 'Camera trÆ°á»›c',
    camera: 'Camera',
    sim: 'Tháº» SIM',
    mobileNetwork: 'Máº¡ng di Ä‘á»™ng',
    battery: 'Pin',
    fastCharging: 'Sáº¡c nhanh',
    charging: 'Sáº¡c nhanh',
    chargingPort: 'Cá»•ng sáº¡c',
    operatingSystem: 'Há»‡ Ä‘iá»u hÃ nh',
    os: 'Há»‡ Ä‘iá»u hÃ nh',
    warranty: 'Báº£o hÃ nh',
    connection: 'Káº¿t ná»‘i',
    connectivity: 'Káº¿t ná»‘i',
    ports: 'Cá»•ng giao tiáº¿p',
    connections: 'Cá»•ng giao tiáº¿p',
    wireless: 'Káº¿t ná»‘i khÃ´ng dÃ¢y',
    wifi: 'WiFi',
    bluetooth: 'Bluetooth',
    webcam: 'Webcam',
    keyboard: 'BÃ n phÃ­m',
    weight: 'Trá»ng lÆ°á»£ng',
    material: 'Cháº¥t liá»‡u',
    dimensions: 'KÃ­ch thÆ°á»›c',
    feature: 'TÃ­nh nÄƒng',
    features: 'TÃ­nh nÄƒng',
    type: 'Loáº¡i sáº£n pháº©m',
    faceSize: 'KÃ­ch cá»¡ máº·t Ä‘á»“ng há»“',
    caseSize: 'KÃ­ch cá»¡ máº·t Ä‘á»“ng há»“',
    watchFaceSize: 'KÃ­ch cá»¡ máº·t Ä‘á»“ng há»“',
    faceDiameter: 'ÄÆ°á»ng kÃ­nh máº·t',
    wristSize: 'KÃ­ch thÆ°á»›c cá»• tay phÃ¹ há»£p',
    bezelMaterial: 'Cháº¥t liá»‡u viá»n',
    strapMaterial: 'Cháº¥t liá»‡u dÃ¢y',
    design: 'Thiáº¿t káº¿',
    healthFeatures: 'TÃ­nh nÄƒng sá»©c khá»e',
    workoutModes: 'Cháº¿ Ä‘á»™ luyá»‡n táº­p',
    calling: 'Nghe gá»i',
    gps: 'Äá»‹nh vá»‹ GPS',
    compatibility: 'TÆ°Æ¡ng thÃ­ch',
    waterResistant: 'Chá»‘ng nÆ°á»›c',
    waterResistance: 'KhÃ¡ng nÆ°á»›c / bá»¥i',
    batteryLife: 'Thá»i lÆ°á»£ng pin',
    chargingTime: 'Thá»i gian sáº¡c',
    cameraLine: 'DÃ²ng camera',
    cameraType: 'Loáº¡i camera',
    sensor: 'Cáº£m biáº¿n',
    lensAngle: 'GÃ³c á»‘ng kÃ­nh',
    displaySpecs: 'ThÃ´ng sá»‘ mÃ n hÃ¬nh',
    wirelessConnection: 'Káº¿t ná»‘i khÃ´ng dÃ¢y',
    batterySpecs: 'ThÃ´ng sá»‘ pin',
    aperture: 'Kháº©u Ä‘á»™',
    zoom: 'Zoom',
    stabilization: 'Chá»‘ng rung',
    video: 'Quay video',
    aiFeatures: 'TÃ­nh nÄƒng AI',
    nightVision: 'NhÃ¬n Ä‘Ãªm',
    lens: 'á»ng kÃ­nh',
    utilities: 'Tiá»‡n Ã­ch',
    headphoneType: 'Loáº¡i tai nghe',
    wearingStyle: 'Kiá»ƒu Ä‘eo',
    audioTechnology: 'CÃ´ng nghá»‡ Ã¢m thanh',
    driver: 'Driver',
    noiseCancelling: 'Chá»‘ng á»“n',
    microphone: 'Micro',
    micro: 'Micro',
    connectionPort: 'Cá»•ng káº¿t ná»‘i',
    controlMethod: 'PhÆ°Æ¡ng thá»©c Ä‘iá»u khiá»ƒn',
    otherFeatures: 'TÃ­nh nÄƒng khÃ¡c',
    bluetoothVersion: 'Bluetooth version',
    codec: 'Codec',
    latency: 'Äá»™ trá»…',
    stylusSupport: 'Há»— trá»£ bÃºt',
};

const directSpecKeys = [
    'brand', 'manufacturer', 'sku', 'code', 'model', 'category', 'cpu', 'cpuType', 'processor', 'ram', 'ramSize', 'ramType', 'memory', 'storage',
    'hardDrive', 'ssd', 'internalStorage', 'rom', 'gpu', 'graphics', 'graphicsCard', 'graphicsType', 'screen', 'screenSize', 'displaySize', 'display',
    'screenTechnology', 'displayTechnology', 'screenResolution', 'resolution', 'screenFeatures', 'displayFeatures',
    'refreshRate', 'chipset', 'nfc', 'nfcTechnology', 'rearCamera', 'backCamera', 'frontCamera', 'selfieCamera', 'camera', 'sim',
    'mobileNetwork', 'battery', 'fastCharging', 'charging', 'chargingPort', 'operatingSystem', 'os', 'warranty',
    'connection', 'connectivity', 'ports', 'connections', 'wireless', 'wifi', 'bluetooth', 'webcam', 'keyboard', 'weight', 'material', 'dimensions',
    'feature', 'features', 'type', 'faceSize', 'caseSize', 'watchFaceSize', 'bezelMaterial', 'strapMaterial',
    'faceDiameter', 'wristSize', 'design', 'healthFeatures', 'workoutModes', 'calling', 'gps', 'compatibility', 'waterResistant',
    'waterResistance', 'batteryLife', 'chargingTime', 'cameraLine', 'cameraType', 'sensor', 'lensAngle', 'displaySpecs',
    'wirelessConnection', 'batterySpecs', 'aperture', 'zoom',
    'stabilization', 'video', 'aiFeatures', 'nightVision', 'lens', 'headphoneType', 'wearingStyle',
    'audioTechnology', 'driver', 'noiseCancelling', 'microphone', 'micro', 'connectionPort', 'controlMethod',
    'otherFeatures', 'bluetoothVersion', 'codec', 'latency', 'utilities',
    'stylusSupport',
];

const categorySpecOrder = {
    phone: ['screenSize', 'displaySize', 'screenTechnology', 'displayTechnology', 'rearCamera', 'backCamera', 'frontCamera', 'selfieCamera', 'chipset', 'nfc', 'nfcTechnology', 'storage', 'internalStorage', 'rom', 'sim', 'operatingSystem', 'os', 'screenResolution', 'screenFeatures', 'displayFeatures', 'cpuType', 'gpu', 'ram', 'ramSize', 'battery', 'chargingPort', 'material', 'dimensions', 'weight', 'warranty'],
    laptop: ['graphicsType', 'gpu', 'graphicsCard', 'graphics', 'ram', 'ramSize', 'ramType', 'storage', 'hardDrive', 'ssd', 'screenSize', 'displaySize', 'screenTechnology', 'displayTechnology', 'battery', 'operatingSystem', 'os', 'screenResolution', 'resolution', 'cpuType', 'ports', 'connections', 'cpu', 'processor', 'refreshRate', 'webcam', 'bluetooth', 'wifi', 'material', 'dimensions', 'weight'],
    tablet: ['screenSize', 'displaySize', 'screenTechnology', 'displayTechnology', 'rearCamera', 'backCamera', 'frontCamera', 'selfieCamera', 'chipset', 'storage', 'internalStorage', 'rom', 'battery', 'operatingSystem', 'os', 'screenResolution', 'screenFeatures', 'displayFeatures', 'cpuType', 'compatibility', 'ram', 'ramSize', 'connection', 'connectivity', 'sim', 'fastCharging', 'stylusSupport', 'dimensions', 'weight', 'warranty'],
    headphone: ['dimensions', 'weight', 'audioTechnology', 'microphone', 'micro', 'connectionPort', 'batteryLife', 'controlMethod', 'otherFeatures', 'brand', 'manufacturer', 'headphoneType', 'type', 'wearingStyle', 'connection', 'connectivity', 'bluetoothVersion', 'codec', 'noiseCancelling', 'waterResistant', 'waterResistance', 'chargingTime', 'warranty'],
    smartwatch: ['screenTechnology', 'displayTechnology', 'screenSize', 'displaySize', 'faceDiameter', 'wristSize', 'calling', 'healthFeatures', 'compatibility', 'batteryLife', 'battery', 'brand', 'manufacturer', 'watchFaceSize', 'faceSize', 'caseSize', 'bezelMaterial', 'strapMaterial', 'design', 'workoutModes', 'gps', 'connection', 'connectivity', 'waterResistant', 'waterResistance', 'chargingTime', 'weight', 'warranty'],
    camera: ['cameraLine', 'resolution', 'lensAngle', 'displaySpecs', 'wirelessConnection', 'batterySpecs', 'stabilization', 'otherFeatures', 'brand', 'manufacturer', 'utilities', 'cameraType', 'type', 'sensor', 'lens', 'aperture', 'zoom', 'video', 'aiFeatures', 'nightVision', 'connection', 'connectivity', 'storage', 'dimensions', 'weight', 'warranty'],
    default: ['brand', 'type', 'feature', 'features', 'connection', 'connectivity', 'material', 'warranty'],
};

const commonExcludedSpecKeys = ['sku', 'code', 'model', 'category'];
const commonExcludedSpecLabels = ['MÃ£ sáº£n pháº©m', 'Danh má»¥c'];

const excludedSpecKeysByCategory = {
    phone: ['fastCharging', 'waterResistance', 'waterResistant'],
    laptop: ['keyboard', 'wireless', 'wirelessConnection', 'warranty'],
};

const excludedSpecLabelsByCategory = {
    phone: ['Sáº¡c nhanh', 'KhÃ¡ng nÆ°á»›c / bá»¥i', 'Chá»‘ng nÆ°á»›c'],
    laptop: ['BÃ n phÃ­m', 'Káº¿t ná»‘i khÃ´ng dÃ¢y', 'Báº£o hÃ nh'],
};

const getSpecLabel = (key, categoryType) => {
    const normalized = normalizeSpecKey(key).replace(/\s+([a-z])/g, (_, char) => char.toUpperCase());
    if ((normalized === 'storage' || normalized === 'rom') && ['phone', 'tablet'].includes(categoryType)) return 'Bá»™ nhá»› trong';
    if (normalized === 'gpu' && categoryType === 'phone') return 'GPU';
    if (normalized === 'resolution' && ['phone', 'laptop', 'tablet'].includes(categoryType)) return 'Äá»™ phÃ¢n giáº£i mÃ n hÃ¬nh';
    if (normalized === 'waterResistance' && categoryType !== 'phone') return 'Chá»‘ng nÆ°á»›c';
    return specLabelMap[normalized] || specLabelMap[key] || String(key || '').trim();
};

const addSpecValue = (specMap, key, value) => {
    const normalizedKey = normalizeSpecKey(key).replace(/\s+([a-z])/g, (_, char) => char.toUpperCase());
    const normalizedValue = compactValue(value);
    if (!normalizedKey || !normalizedValue) return;
    if (!specMap.has(normalizedKey)) specMap.set(normalizedKey, normalizedValue);
};

export const getProductSpecs = (product, options = {}) => {
    if (!product) return [];
    const specs = Array.isArray(product.specs) ? product.specs : [];
    return specs
        .map((item) => ({
            label: item.name || item.label || item.code || '',
            value: item.value ?? item.valueText ?? item.valueNumber ?? item.valueBool,
            unit: item.unit || '',
        }))
        .filter((item) => item.label && compactValue(item.value))
        .map((item) => ({
            label: item.label,
            value: item.unit ? `${compactValue(item.value)} ${item.unit}` : compactValue(item.value),
        }));
};

const getProductDescriptionParts = (product) => {
    const parts = [];
    const description = compactValue(product?.longDescription) || compactValue(product?.description);
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

const getBoughtTogetherProducts = (product, catalog) => {
    const categoryType = getCategoryType(product);
    const accessoryFirst = ['phone', 'laptop', 'tablet'].includes(categoryType);
    const others = catalog.filter((item) => item.id !== product?.id);
    const isAccessory = (item) => {
        const text = `${item.category?.name || ''} ${item.name || ''}`.toLowerCase();
        return item.categoryId === 3 || text.includes('accessor') || text.includes('hub') || text.includes('stand') || text.includes('keyboard') || text.includes('mouse') || text.includes('airpods');
    };
    const preferred = accessoryFirst ? others.filter(isAccessory) : others.filter((item) => item.categoryId !== product?.categoryId);
    return [...preferred, ...others.filter((item) => !preferred.some((preferredItem) => preferredItem.id === item.id))].slice(0, 4);
};

const getRelatedProducts = (product, catalog) => {
    const brand = product?.brand || inferBrandFromName(product?.name);
    const price = Number(product?.price || 0);
    return catalog
        .filter((item) => item.id !== product?.id)
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

const generalRatingLabels = {
    1: 'Ráº¥t tá»‡',
    2: 'Tá»‡',
    3: 'BÃ¬nh thÆ°á»ng',
    4: 'Tá»‘t',
    5: 'Tuyá»‡t vá»i',
};

const experienceRatingLabels = {
    1: 'Ráº¥t kÃ©m',
    2: 'ChÆ°a tá»‘t',
    3: 'Táº¡m á»•n',
    4: 'Tá»‘t',
    5: 'Ráº¥t tá»‘t',
};

const reviewExperienceCriteria = {
    phone: ['Hiá»‡u nÄƒng', 'Thá»i lÆ°á»£ng pin', 'Cháº¥t lÆ°á»£ng camera'],
    laptop: ['Hiá»‡u nÄƒng', 'MÃ n hÃ¬nh', 'Thá»i lÆ°á»£ng pin', 'BÃ n phÃ­m / touchpad'],
    tablet: ['MÃ n hÃ¬nh', 'Thá»i lÆ°á»£ng pin', 'Hiá»‡u nÄƒng', 'Há»c táº­p / giáº£i trÃ­'],
    headphone: ['Cháº¥t lÆ°á»£ng Ã¢m thanh', 'Chá»‘ng á»“n', 'Thá»i lÆ°á»£ng pin', 'Äá»™ thoáº£i mÃ¡i khi Ä‘eo'],
    smartwatch: ['Theo dÃµi sá»©c khá»e', 'Thá»i lÆ°á»£ng pin', 'Äá»™ chÃ­nh xÃ¡c', 'Thiáº¿t káº¿'],
    camera: ['Cháº¥t lÆ°á»£ng hÃ¬nh áº£nh', 'Chá»‘ng rung', 'Quay video', 'TÃ­nh tiá»‡n dá»¥ng'],
    default: ['Cháº¥t lÆ°á»£ng sáº£n pháº©m', 'Tráº£i nghiá»‡m sá»­ dá»¥ng', 'Thiáº¿t káº¿'],
};

const getReviewExperienceCriteria = (product) => reviewExperienceCriteria[getCategoryType(product)] || reviewExperienceCriteria.default;

const normalizeReview = (review, index = 0) => {
    const rating = Math.max(1, Math.min(5, Number(review?.rating || review?.stars || review?.score || 5)));
    return {
        id: review?.id || `review-${index}`,
        customerName: review?.customerName || review?.userName || review?.name || 'KhÃ¡ch hÃ ng',
        rating,
        date: review?.date || review?.createdAt || review?.time || 'Gáº§n Ä‘Ã¢y',
        content: compactValue(review?.content || review?.comment || review?.message || review?.experience),
        experienceRatings: review?.experienceRatings && typeof review.experienceRatings === 'object' ? review.experienceRatings : {},
        images: Array.isArray(review?.images) ? review.images.filter(Boolean) : [],
        tags: Array.isArray(review?.tags) ? review.tags.filter(Boolean) : [],
    };
};

const getProductReviews = (product, temporaryReviews = []) => {
    const rawReviews = Array.isArray(product?.reviews) ? product.reviews : [];
    return [...temporaryReviews, ...rawReviews.map(normalizeReview)]
        .filter((review) => review.content);
};

const getReviewSummary = (reviews) => {
    const total = reviews.length;
    if (!total) {
        return {
            average: 0,
            total: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
    }
    const distribution = reviews.reduce((acc, review) => {
        const star = Math.round(review.rating);
        acc[star] = (acc[star] || 0) + 1;
        return acc;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / total;
    return { average, total, distribution };
};

const formatRelativeTime = (value) => {
    if (!value) return 'Vá»«a xong';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60 * 1000) return 'Vá»«a xong';
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    if (hours < 24) return `${Math.max(1, hours)} giá» trÆ°á»›c`;
    const days = Math.floor(hours / 24);
    return `${Math.max(1, days)} ngÃ y trÆ°á»›c`;
};

const normalizeQuestion = (item, index = 0) => {
    if (!item) return null;
    const rawAnswer = item.answer || item.reply || item.response || (Array.isArray(item.answers) ? item.answers[0] : null);
    const answer = rawAnswer
        ? {
            adminName: rawAnswer.adminName || rawAnswer.authorName || rawAnswer.name || 'Quáº£n trá»‹ viÃªn',
            content: compactValue(rawAnswer.content || rawAnswer.answer || rawAnswer.message || rawAnswer.reply || rawAnswer),
            createdAt: rawAnswer.createdAt || rawAnswer.date || rawAnswer.time,
        }
        : null;
    const question = compactValue(item.question || item.content || item.message || item.text);
    if (!question) return null;
    return {
        id: item.id || item.questionId || `question-${index}`,
        customerName: item.customerName || item.userName || item.name || 'KhÃ¡ch hÃ ng',
        question,
        createdAt: item.createdAt || item.date || item.time,
        answer: answer?.content ? answer : null,
    };
};

const getProductQuestions = (product, temporaryQuestions = []) => {
    const rawQuestions = Array.isArray(product?.questions)
        ? product.questions
        : Array.isArray(product?.qna)
            ? product.qna
            : [];
    return [...temporaryQuestions, ...rawQuestions.map(normalizeQuestion).filter(Boolean)];
};

const getAvatarInitial = (name) => String(name || 'K').trim().charAt(0).toUpperCase() || 'K';

const StarRating = ({ value = 0, small = false }) => (
    <span className={`product-review-stars ${small ? 'is-small' : ''}`} aria-label={`${value} sao`}>
        {Array.from({ length: 5 }).map((_, index) => (
            <i key={`star-${index}`} className={`fas fa-star ${index < Math.round(value) ? '' : 'text-muted'}`}></i>
        ))}
    </span>
);

const ReviewStarPicker = ({ value, labels = experienceRatingLabels, onChange, compact = false }) => (
    <div className={`review-star-picker ${compact ? 'is-compact' : ''}`}>
        <div className="review-star-buttons" role="radiogroup" aria-label="Chá»n sá»‘ sao">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={star <= value ? 'is-active' : ''}
                    onClick={() => onChange(star)}
                    aria-label={`${star} sao`}
                >
                    <i className="fas fa-star"></i>
                </button>
            ))}
        </div>
        <span>{value ? labels[value] : 'ChÆ°a chá»n'}</span>
    </div>
);

const getOptionLabel = (option, fallback = '') => compactValue(
    typeof option === 'object'
        ? option.label || option.name || option.value || option.version || option.storage || option.title || fallback
        : option
);

const normalizeVersionOption = (option, index = 0) => {
    if (typeof option === 'string' || typeof option === 'number') {
        return { id: `version-${option}`, label: String(option) };
    }
    if (!option || typeof option !== 'object') return null;
    const label = getOptionLabel(option, option.id || `PhiÃªn báº£n ${index + 1}`);
    if (!label) return null;
    return {
        id: option.id || option.sku || `version-${label}`,
        label,
        price: option.price,
        oldPrice: option.oldPrice,
        stock: option.stock,
        sku: option.sku,
        image: option.image || option.imageUrl,
    };
};

const normalizeColorOption = (option, index = 0) => {
    if (typeof option === 'string' || typeof option === 'number') {
        return { id: `color-${option}`, label: String(option) };
    }
    if (!option || typeof option !== 'object') return null;
    const label = getOptionLabel(option, option.color || option.id || `MÃ u ${index + 1}`);
    if (!label) return null;
    return {
        id: option.id || option.sku || `color-${label}`,
        label,
        colorCode: option.colorCode || option.hex || option.code,
        price: option.price,
        oldPrice: option.oldPrice,
        stock: option.stock,
        sku: option.sku,
        image: option.image || option.imageUrl || option.thumbnail,
    };
};

const uniqueOptions = (options) => {
    const seen = new Set();
    return options.filter((option) => {
        if (!option?.label) return false;
        const key = normalizeText(option.label);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const getProductVersions = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    return uniqueOptions(variants
        .map((variant, index) => normalizeVersionOption({
            ...variant,
            label: variant.variantName || variant.version || variant.storage || variant.internalStorage || variant.label || variant.name,
        }, index))
        .filter(Boolean));
};

const getProductColors = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    return uniqueOptions(variants
        .map((variant, index) => normalizeColorOption({
            ...variant,
            label: variant.colorName || variant.color || variant.label || variant.name,
        }, index))
        .filter(Boolean));
};

const findSelectedVariant = (product, selectedVersion, selectedColor) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (!variants.length) return null;
    const versionText = normalizeText(selectedVersion?.label);
    const colorText = normalizeText(selectedColor?.label);
    const matches = (variant) => {
        const variantVersion = normalizeText(variant.variantName || variant.version || variant.storage || variant.internalStorage || variant.label || variant.name);
        const variantColor = normalizeText(variant.colorName || variant.color);
        const versionOk = !versionText || variantVersion === versionText;
        const colorOk = !colorText || variantColor === colorText;
        return versionOk && colorOk;
    };
    return variants.find(matches) || null;
};

const ProductDetail = () => {
    const { id } = useParams();
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toggleCompare, isInCompare } = useCompare();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addedMsg, setAddedMsg] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    const [activeImage, setActiveImage] = useState('');
    const [claimedCouponIds, setClaimedCouponIds] = useState([]);
    const [couponMsg, setCouponMsg] = useState('');
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
    const [questionInput, setQuestionInput] = useState('');
    const [questionError, setQuestionError] = useState('');
    const [questionMsg, setQuestionMsg] = useState('');
    const [expandedQuestionIds, setExpandedQuestionIds] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    const numericId = useMemo(() => Number(id), [id]);
    const productImage = useMemo(() => {
        try { return resolveProductImage(product); }
        catch { return '/electro/img/product-1.png'; }
    }, [product]);

    const productName = String(product?.name || '');
    const productCategoryName = t(String(product?.category?.name || 'Electronics'));
    const productVersions = useMemo(() => getProductVersions(product), [product]);
    const productColors = useMemo(() => getProductColors(product), [product]);
    const selectedVariant = useMemo(
        () => findSelectedVariant(product, selectedVersion, selectedColor),
        [product, selectedVersion, selectedColor]
    );
    const productStock = Number(selectedVariant?.stock ?? selectedVersion?.stock ?? selectedColor?.stock ?? product?.stock ?? 0);
    const productPrice = Number(selectedVariant?.price ?? selectedVersion?.price ?? selectedColor?.price ?? product?.price ?? 0);
    const productDescription = String(product?.description || '');
    const oldPrice = selectedVariant?.originalPrice ?? selectedVariant?.oldPrice ?? selectedVersion?.oldPrice ?? selectedColor?.oldPrice ?? product?.originalPrice ?? product?.oldPrice ?? 0;
    const displaySku = selectedVariant?.sku || selectedVersion?.sku || selectedColor?.sku || product?.sku || product?.id;
    const selectedImage = selectedVariant?.imageUrl || selectedVariant?.image || selectedColor?.image || selectedVersion?.image || '';
    const displayImage = selectedImage ? resolveProductImage({ id: product?.id, imageUrl: selectedImage }) : productImage;
    const galleryImages = useMemo(() => {
        const productImages = Array.isArray(product?.images) ? product.images.map((image) => image.imageUrl || image.url) : [];
        const variantImages = Array.isArray(product?.variants) ? product.variants.map((variant) => variant.imageUrl || variant.image) : [];
        const images = [
            displayImage,
            productImage,
            ...productImages.map((imageUrl) => resolveProductImage({ id: product?.id, imageUrl })),
            ...variantImages.map((imageUrl) => resolveProductImage({ id: product?.id, imageUrl })),
        ];
        return [...new Set(images.filter(Boolean))];
    }, [displayImage, productImage]);
    const localCatalog = useMemo(() => productApi.getLocalCatalog?.() || [], [product?.id]);
    const productSpecifications = useMemo(() => getProductSpecs(product), [product]);
    const descriptionParts = useMemo(() => getProductDescriptionParts(product), [product]);
    const reviewExperienceItems = useMemo(() => getReviewExperienceCriteria(product), [product]);
    const productReviews = useMemo(() => getProductReviews(product, temporaryReviews), [product, temporaryReviews]);
    const reviewSummary = useMemo(() => getReviewSummary(productReviews), [productReviews]);
    const visibleReviews = showAllReviews ? productReviews : productReviews.slice(0, 3);
    const productQuestions = useMemo(() => getProductQuestions(product, temporaryQuestions), [product, temporaryQuestions]);
    const computedRelatedProducts = useMemo(
        () => {
            const scoredProducts = getRelatedProducts(product, localCatalog);
            return scoredProducts.length ? scoredProducts : relatedProducts.slice(0, 4);
        },
        [product, localCatalog, relatedProducts]
    );
    const productCouponContext = useMemo(() => ({
        product,
        subtotal: productPrice,
        cartItems: product ? [{ product, quantity: 1 }] : [],
        currentHour: new Date().getHours(),
    }), [product, productPrice]);
    const productCoupons = useMemo(
        () => getAvailableCouponsForProduct(product, coupons, productCouponContext),
        [product, productCouponContext]
    );
    const visibleProductCoupons = productCoupons.slice(0, 3);

    useEffect(() => {
        setPageMeta({
            title: `${t('Product Details')} | Electro`,
            description: t('Product meta description'),
        });
        setClaimedCouponIds(getClaimedCoupons());
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

        setError('');
        setQuantity(1);
        setAddedMsg('');
        setCouponMsg('');
        setShowAllReviews(false);
        setReviewMsg('');
        setReviewModalOpen(false);
        setReviewRating(0);
        setExperienceRatings({});
        setReviewContent('');
        setReviewImages([]);
        setReviewError('');
        setTemporaryReviews([]);
        setTemporaryQuestions([]);
        setQuestionInput('');
        setQuestionError('');
        setQuestionMsg('');
        setExpandedQuestionIds([]);
        setSelectedVersion(null);
        setSelectedColor(null);

        if (instantProduct) {
            setProduct(instantProduct);
            setRelatedProducts(getRelatedProductsFromLocalCatalog(instantProduct));
            rememberRecentProduct(instantProduct);
            setRecentlyViewedProducts(safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []).filter((item) => item?.id !== instantProduct.id).slice(0, 4));
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
                setRecentlyViewedProducts(safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []).filter((item) => item?.id !== data.id).slice(0, 4));
                cacheProductDetail(data);
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

        return () => {
            cancelled = true;
        };
    }, [numericId]);

    useEffect(() => {
        setActiveImage(displayImage);
    }, [displayImage]);

    useEffect(() => {
        if (!reviewModalOpen) return undefined;
        const handleEscape = (event) => {
            if (event.key === 'Escape') setReviewModalOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        document.body.classList.add('review-modal-open');
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.classList.remove('review-modal-open');
        };
    }, [reviewModalOpen]);

    const handleAddToCart = () => {
        if (productStock <= 0 || quantity < 1) return;
        if (productVersions.length && !selectedVersion) {
            setAddedMsg('Vui lÃ²ng chá»n phiÃªn báº£n.');
            setTimeout(() => setAddedMsg(''), 2500);
            return;
        }
        if (productColors.length && !selectedColor) {
            setAddedMsg('Vui lÃ²ng chá»n mÃ u sáº¯c.');
            setTimeout(() => setAddedMsg(''), 2500);
            return;
        }
        addItem({
            ...product,
            id: product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            selectedVersion: selectedVersion?.label || '',
            selectedColor: selectedColor?.label || '',
            price: productPrice,
            oldPrice,
            stock: productStock,
            sku: displaySku,
            image: displayImage,
            imageUrl: displayImage,
            name: [product.name, selectedVersion?.label, selectedColor?.label].filter(Boolean).join(' - '),
        }, quantity);
        setAddedMsg(`ThÃªm vÃ o giá» hÃ ng: ${quantity}`);
        setTimeout(() => setAddedMsg(''), 2500);
    };

    const showCouponMessage = (message) => {
        setCouponMsg(message);
        setTimeout(() => setCouponMsg(''), 2500);
    };

    const handleClaimCoupon = (coupon) => {
        if (!canClaimCoupon(coupon, productCouponContext)) {
            showCouponMessage(getCouponClaimStatus(coupon, productCouponContext).message || 'ChÆ°a Ä‘á»§ Ä‘iá»u kiá»‡n');
            return;
        }
        const result = claimCoupon(coupon.id);
        setClaimedCouponIds(getClaimedCoupons());
        showCouponMessage(result.success ? 'ÄÃ£ lÆ°u phiáº¿u vÃ o vÃ­' : result.message);
    };

    const handleCopyCoupon = async (coupon) => {
        if (!isCouponClaimed(coupon.id)) {
            showCouponMessage('Báº¡n cáº§n nháº­n phiáº¿u trÆ°á»›c khi sá»­ dá»¥ng');
            return;
        }
        await navigator.clipboard?.writeText(coupon.code);
        showCouponMessage('ÄÃ£ sao chÃ©p');
    };

    const changeActiveImage = (direction) => {
        const currentIndex = Math.max(0, galleryImages.indexOf(activeImage));
        const nextIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
        setActiveImage(galleryImages[nextIndex]);
    };

    const openReviewModal = () => {
        setReviewError('');
        setReviewMsg('');
        setReviewModalOpen(true);
    };

    const handleReviewImageChange = (event) => {
        const files = Array.from(event.target.files || []).slice(0, Math.max(0, 3 - reviewImages.length));
        const nextImages = files.map((file) => ({
            id: `${file.name}-${file.lastModified}-${Date.now()}`,
            name: file.name,
            preview: URL.createObjectURL(file),
        }));
        setReviewImages((current) => [...current, ...nextImages].slice(0, 3));
        event.target.value = '';
    };

    const removeReviewImage = (imageId) => {
        setReviewImages((current) => {
            const removed = current.find((image) => image.id === imageId);
            if (removed?.preview) URL.revokeObjectURL(removed.preview);
            return current.filter((image) => image.id !== imageId);
        });
    };

    const handleSubmitReview = (event) => {
        event.preventDefault();
        const content = reviewContent.trim();
        if (!reviewRating) {
            setReviewError('Vui lÃ²ng chá»n Ä‘Ã¡nh giÃ¡ chung.');
            return;
        }
        if (content.length < 15) {
            setReviewError('Vui lÃ²ng nháº­p nháº­n xÃ©t tá»‘i thiá»ƒu 15 kÃ½ tá»±.');
            return;
        }
        const newReview = normalizeReview({
            id: `temp-review-${Date.now()}`,
            customerName: 'KhÃ¡ch hÃ ng',
            rating: reviewRating,
            date: new Date().toLocaleDateString('vi-VN'),
            createdAt: new Date().toISOString(),
            content,
            experienceRatings,
            images: reviewImages.map((image) => image.preview),
        });
        setTemporaryReviews((current) => [newReview, ...current]);
        setReviewRating(0);
        setExperienceRatings({});
        setReviewContent('');
        setReviewImages([]);
        setReviewError('');
        setReviewModalOpen(false);
        setReviewMsg('Cáº£m Æ¡n báº¡n Ä‘Ã£ gá»­i Ä‘Ã¡nh giÃ¡.');
    };

    const toggleQuestionAnswer = (questionId) => {
        setExpandedQuestionIds((current) => (
            current.includes(questionId)
                ? current.filter((item) => item !== questionId)
                : [...current, questionId]
        ));
    };

    const handleSubmitQuestion = (event) => {
        event.preventDefault();
        const question = questionInput.trim();
        if (question.length < 10) {
            setQuestionError('Vui lÃ²ng nháº­p cÃ¢u há»i tá»‘i thiá»ƒu 10 kÃ½ tá»±.');
            setQuestionMsg('');
            return;
        }
        setTemporaryQuestions((current) => [{
            id: `temp-question-${Date.now()}`,
            customerName: 'KhÃ¡ch hÃ ng',
            question,
            createdAt: new Date().toISOString(),
            answer: null,
        }, ...current]);
        setQuestionInput('');
        setQuestionError('');
        setQuestionMsg('CÃ¢u há»i cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c gá»­i.');
    };

    if (loading) {
        return (
            <>
                <PageHero title={t('Product Details')} current={t('Product Details')} />
                <div className="container py-5">
                    <div className="row g-4 align-items-start placeholder-glow">
                        <div className="col-md-5">
                            <div className="placeholder w-100" style={{ height: 360 }}></div>
                        </div>
                        <div className="col-md-7">
                            <div className="placeholder col-8 mb-3" style={{ height: 32 }}></div>
                            <div className="placeholder col-5 mb-2"></div>
                            <div className="placeholder col-4 mb-4"></div>
                            <div className="placeholder col-3 mb-4" style={{ height: 48 }}></div>
                            <div className="row g-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div className="col-sm-6" key={`spec-loading-${index}`}>
                                        <div className="placeholder col-10"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <PageHero title={t('Product Details')} current={t('Product Details')} />
                <div className="container py-5 text-center">
                    <i className="fas fa-exclamation-circle fa-4x text-muted mb-4"></i>
                    <div className="alert alert-light border d-inline-block">{error || t('Product not found')}</div>
                    <br />
                    <Link to="/shop" className="btn btn-outline-primary mt-3">{t('Back to Shop')}</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHero title={t('Product Details')} current={productName || t('Product Details')} />
            <div className="container-fluid single-product-page py-5">
                <div className="container">
                    <nav aria-label="breadcrumb" className="mb-4">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/">{t('Home')}</Link></li>
                            <li className="breadcrumb-item">
                                <Link to={`/shop?categoryId=${product.categoryId || ''}`}>{productCategoryName}</Link>
                            </li>
                            <li className="breadcrumb-item active text-truncate" style={{ maxWidth: 220 }}>{productName}</li>
                        </ol>
                    </nav>

                    <div className="row g-5">
                        <main className="col-12">
                            <motion.div
                                className="row g-4 align-items-start mb-5"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <div className="col-lg-5">
                                    <div className="bg-light rounded text-center p-4 position-relative">
                                        <button type="button" className="btn btn-link position-absolute top-50 start-0 translate-middle-y text-primary" onClick={() => changeActiveImage(-1)}>
                                            <i className="fas fa-long-arrow-alt-left"></i>
                                        </button>
                                        <img src={activeImage || productImage} className="img-fluid" alt={productName} style={{ height: 290, objectFit: 'contain' }} />
                                        <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-primary" onClick={() => changeActiveImage(1)}>
                                            <i className="fas fa-long-arrow-alt-right"></i>
                                        </button>
                                    </div>
                                    <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                                        {galleryImages.map((image) => (
                                            <button
                                                key={image}
                                                type="button"
                                                className={`btn rounded-circle p-2 ${activeImage === image ? 'border-primary border-2' : 'border-primary'}`}
                                                onClick={() => setActiveImage(image)}
                                                style={{ width: 66, height: 66 }}
                                            >
                                                <img src={image} alt="" className="img-fluid" style={{ width: 46, height: 46, objectFit: 'contain' }} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-lg-7">
                                    <h4 className="fw-bold mb-3">{productName}</h4>
                                    <p className="text-muted mb-3">{t('Category')}: {productCategoryName}</p>
                                    <div className="d-flex align-items-baseline gap-2 mb-3">
                                        <h5 className="fw-bold mb-0">{formatCurrency(productPrice)}</h5>
                                        {oldPrice > productPrice && <del className="text-danger">{formatCurrency(oldPrice)}</del>}
                                    </div>
                                    <Rating />
                                    <div className="d-flex gap-3 my-4 flex-wrap">
                                        <button type="button" className={`btn rounded px-4 ${isInCompare(product.id) ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => toggleCompare(product)}>
                                            <i className="fas fa-random me-2"></i>{t('Compare')}
                                        </button>
                                        <button type="button" className={`btn rounded px-4 ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => toggleWishlist(product)}>
                                            <i className="fas fa-heart me-2"></i>{t('Wishlist')}
                                        </button>
                                    </div>
                                    <p className="text-muted mb-0">MÃ£ sáº£n pháº©m: {displaySku}</p>
                                    <p className="text-muted">
                                        {t('Availability')}: {' '}
                                        <span className={`fw-bold ${productStock > 0 ? 'text-primary' : 'text-secondary'}`}>
                                            {productStock > 0 ? `${t('In Stock')} (${productStock})` : t('Out of Stock')}
                                        </span>
                                    </p>
                                    {productVersions.length > 0 && (
                                        <div className="product-option-group">
                                            <div className="product-option-title">PhiÃªn báº£n</div>
                                            <div className="product-version-grid">
                                                {productVersions.map((version) => {
                                                    const active = selectedVersion?.id === version.id;
                                                    return (
                                                        <button
                                                            key={version.id}
                                                            type="button"
                                                            className={`product-version-option ${active ? 'is-active' : ''}`}
                                                            onClick={() => setSelectedVersion(version)}
                                                        >
                                                            <strong>{version.label}</strong>
                                                            {version.price != null && <span>{formatCurrency(version.price)}</span>}
                                                            {version.stock === 0 && <em>Háº¿t hÃ ng</em>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {productColors.length > 0 && (
                                        <div className="product-option-group">
                                            <div className="product-option-title">MÃ u sáº¯c</div>
                                            <div className="product-color-grid">
                                                {productColors.map((color) => {
                                                    const active = selectedColor?.id === color.id;
                                                    const colorImage = color.image ? resolveProductImage({ id: product.id, imageUrl: color.image }) : '';
                                                    return (
                                                        <button
                                                            key={color.id}
                                                            type="button"
                                                            className={`product-color-option ${active ? 'is-active' : ''}`}
                                                            onClick={() => {
                                                                setSelectedColor(color);
                                                                if (colorImage) setActiveImage(colorImage);
                                                            }}
                                                        >
                                                            {colorImage ? (
                                                                <img src={colorImage} alt="" />
                                                            ) : (
                                                                <span className="product-color-swatch" style={{ backgroundColor: color.colorCode || '#f1f3f5' }}></span>
                                                            )}
                                                            <span>
                                                                <strong>{color.label}</strong>
                                                                {color.price != null && <small>{formatCurrency(color.price)}</small>}
                                                                {color.stock === 0 && <em>Háº¿t hÃ ng</em>}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {productVersions.length === 0 && productColors.length === 0 && (
                                        <div className="product-detail-empty mb-3">Chưa có dữ liệu</div>
                                    )}
                                    <p className="text-muted">{productDescription || t('No description')}</p>

                                    <div className="d-flex align-items-center gap-3 my-4">
                                        <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1}>
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <span>{quantity}</span>
                                        <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={() => setQuantity((value) => Math.min(productStock, value + 1))} disabled={productStock <= 0 || quantity >= productStock}>
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>

                                    {addedMsg && (
                                        <div className="alert alert-success py-2 mb-3 d-flex align-items-center gap-2">
                                            <i className="fas fa-check-circle"></i>{addedMsg}
                                        </div>
                                    )}

                                    <button type="button" className="btn btn-primary rounded-pill px-4 py-2" onClick={handleAddToCart} disabled={productStock <= 0}>
                                        <i className="fas fa-shopping-bag me-2"></i>{t('Add To Cart')}
                                    </button>

                                    {productCoupons.length > 0 && (
                                        <div className="product-coupon-mini-box border rounded mt-4 bg-white">
                                            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                                                <h5 className="fw-bold mb-0">Phiáº¿u giáº£m giÃ¡</h5>
                                                <Link to="/promotion" className="small text-primary">Xem thÃªm phiáº¿u</Link>
                                            </div>
                                            {couponMsg && <div className="alert alert-primary py-2 mb-3">{couponMsg}</div>}
                                            <div className="product-coupon-mini-list">
                                                {visibleProductCoupons.map(({ coupon, claimStatus }) => {
                                                    const status = claimedCouponIds.includes(coupon.id) ? 'claimed' : claimStatus.status;
                                                    const canReceive = status === 'available';
                                                    return (
                                                        <div className="product-coupon-mini" key={`product-coupon-${coupon.id}`}>
                                                            <span className="product-coupon-mini-code">{coupon.code}</span>
                                                            <span className="product-coupon-mini-desc">{coupon.title}</span>
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm rounded-pill ${status === 'claimed' ? 'btn-outline-primary' : canReceive ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                disabled={!canReceive}
                                                                onClick={() => handleClaimCoupon(coupon)}
                                                            >
                                                                {status === 'claimed' ? 'ÄÃ£ nháº­n' : canReceive ? 'Nháº­n' : 'ChÆ°a Ä‘á»§'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {productCoupons.length > 3 && (
                                                <Link to="/promotion" className="btn btn-sm btn-outline-primary rounded-pill mt-3">Xem thÃªm phiáº¿u</Link>
                                            )}
                                        </div>
                                    )}

                                    <div className="d-none">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h5 className="fw-bold mb-0">ThÃ´ng sá»‘ ká»¹ thuáº­t</h5>
                                            <span className="badge bg-light text-dark border">{productSpecifications.length} má»¥c</span>
                                        </div>
                                        <div className="row g-0">
                                            {productSpecifications.slice(0, 8).map(({ label, value }) => (
                                                <div className="col-sm-6 border-top py-2 pe-sm-3" key={`summary-spec-${label}`}>
                                                    <div className="small text-muted">{label}</div>
                                                    <div className="fw-semibold text-dark">{String(value)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.section
                                className="product-detail-section product-spec-section"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <div className="product-detail-card">
                                    <div className="product-detail-section-head">
                                        <div>
                                            <h4>ThÃ´ng sá»‘ ká»¹ thuáº­t</h4>
                                        </div>
                                    </div>
                                    {productSpecifications.length > 0 ? (
                                        <div className="product-spec-table-wrap">
                                            <table className="product-spec-table">
                                                <tbody>
                                                    {productSpecifications.map(({ label, value }) => (
                                                        <tr key={`detail-spec-${label}`}>
                                                            <th scope="row">{label}</th>
                                                            <td>{String(value)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="product-detail-empty">ChÆ°a cÃ³ dá»¯ liá»‡u</div>
                                    )}
                                </div>
                            </motion.section>

                            <motion.section
                                className="product-detail-section"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <div className="product-detail-card">
                                    <div className="product-detail-section-head">
                                        <h4>MÃ´ táº£ sáº£n pháº©m</h4>
                                    </div>
                                    {descriptionParts.length > 0 ? (
                                        <div className="product-description-block">
                                            {descriptionParts.map((part, index) => (
                                                Array.isArray(part) ? (
                                                    <ul key={`description-part-${index}`}>
                                                        {part.map((item) => <li key={item}>{item}</li>)}
                                                    </ul>
                                                ) : (
                                                    <p key={`description-part-${index}`}>{part}</p>
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="product-detail-empty">MÃ´ táº£ sáº£n pháº©m Ä‘ang Ä‘Æ°á»£c cáº­p nháº­t.</div>
                                    )}
                                </div>
                            </motion.section>

                            <motion.section
                                className="product-detail-section"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <div className="product-detail-card">
                                    <div className="product-detail-section-head">
                                        <div>
                                            <h4>ÄÃ¡nh giÃ¡ cá»§a khÃ¡ch hÃ ng</h4>
                                            {reviewMsg && <p className="product-review-success">{reviewMsg}</p>}
                                        </div>
                                        {productReviews.length > 0 && (
                                            <button type="button" className="btn btn-primary rounded-pill px-4" onClick={openReviewModal}>
                                                Viáº¿t Ä‘Ã¡nh giÃ¡
                                            </button>
                                        )}
                                    </div>

                                    {productReviews.length > 0 ? (
                                        <div className="product-review-layout">
                                            <div className="product-review-summary">
                                                <div className="product-review-score">{reviewSummary.average.toFixed(1)}/5</div>
                                                <StarRating value={reviewSummary.average} />
                                                <p>{reviewSummary.total} Ä‘Ã¡nh giÃ¡</p>
                                                <div className="product-review-bars">
                                                    {[5, 4, 3, 2, 1].map((star) => (
                                                        <div className="product-review-bar-row" key={`review-bar-${star}`}>
                                                            <span>{star} sao</span>
                                                            <div><i style={{ width: `${reviewSummary.total ? (reviewSummary.distribution[star] / reviewSummary.total) * 100 : 0}%` }}></i></div>
                                                            <strong>{reviewSummary.distribution[star]}</strong>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="product-review-list">
                                                <div className="product-review-criteria">
                                                    {reviewExperienceItems.map((criterion) => <span key={criterion}>{criterion}</span>)}
                                                </div>
                                                {visibleReviews.map((review) => (
                                                    <article className="product-review-item" key={review.id}>
                                                        <div className="product-review-item-head">
                                                            <div>
                                                                <h5>{review.customerName}</h5>
                                                                <span>{review.date}</span>
                                                            </div>
                                                            <StarRating value={review.rating} small />
                                                        </div>
                                                        <p>{review.content}</p>
                                                        {Object.keys(review.experienceRatings || {}).length > 0 && (
                                                            <div className="product-review-experience">
                                                                <strong>Tráº£i nghiá»‡m:</strong>
                                                                {Object.entries(review.experienceRatings).map(([criterion, score]) => (
                                                                    <span key={`${review.id}-${criterion}`}>{criterion}: {score}/5</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {review.images?.length > 0 && (
                                                            <div className="product-review-images">
                                                                {review.images.map((image, index) => (
                                                                    <img key={`${review.id}-image-${index}`} src={image} alt={`áº¢nh Ä‘Ã¡nh giÃ¡ ${index + 1}`} />
                                                                ))}
                                                            </div>
                                                        )}
                                                        {review.tags.length > 0 && (
                                                            <div className="product-review-tags">
                                                                {review.tags.map((tag) => <span key={tag}>{tag}</span>)}
                                                            </div>
                                                        )}
                                                    </article>
                                                ))}
                                                {productReviews.length > 3 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary rounded-pill px-4"
                                                        onClick={() => setShowAllReviews((value) => !value)}
                                                    >
                                                        {showAllReviews ? 'Thu gá»n' : 'Xem thÃªm Ä‘Ã¡nh giÃ¡'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="product-detail-empty product-review-empty">
                                            ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ nÃ o cho sáº£n pháº©m nÃ y.
                                            <button type="button" className="btn btn-primary rounded-pill px-4 mt-3" onClick={openReviewModal}>
                                                Viáº¿t Ä‘Ã¡nh giÃ¡ Ä‘áº§u tiÃªn
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.section>

                            {reviewModalOpen && (
                                <div className="review-modal-overlay" role="presentation" onMouseDown={() => setReviewModalOpen(false)}>
                                    <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onMouseDown={(event) => event.stopPropagation()}>
                                        <div className="review-modal-header">
                                            <h4 id="review-modal-title">ÄÃ¡nh giÃ¡ & nháº­n xÃ©t</h4>
                                            <button type="button" className="review-modal-close" aria-label="ÄÃ³ng" onClick={() => setReviewModalOpen(false)}>
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>

                                        <form className="review-modal-body" onSubmit={handleSubmitReview}>
                                            <div className="review-modal-product">
                                                <img src={displayImage || productImage} alt={productName} />
                                                <strong>{productName}</strong>
                                            </div>

                                            <section className="review-modal-group">
                                                <h5>ÄÃ¡nh giÃ¡ chung</h5>
                                                <ReviewStarPicker
                                                    value={reviewRating}
                                                    labels={generalRatingLabels}
                                                    onChange={(rating) => {
                                                        setReviewRating(rating);
                                                        setReviewError('');
                                                    }}
                                                />
                                            </section>

                                            <section className="review-modal-group">
                                                <h5>Theo tráº£i nghiá»‡m</h5>
                                                <div className="review-experience-list">
                                                    {reviewExperienceItems.map((criterion) => (
                                                        <div className="review-experience-row" key={criterion}>
                                                            <span>{criterion}</span>
                                                            <ReviewStarPicker
                                                                value={experienceRatings[criterion] || 0}
                                                                onChange={(rating) => setExperienceRatings((current) => ({ ...current, [criterion]: rating }))}
                                                                compact
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section className="review-modal-group">
                                                <textarea
                                                    className="review-modal-textarea"
                                                    rows="5"
                                                    value={reviewContent}
                                                    onChange={(event) => {
                                                        setReviewContent(event.target.value);
                                                        setReviewError('');
                                                    }}
                                                    placeholder="Xin má»i chia sáº» má»™t sá»‘ cáº£m nháº­n vá» sáº£n pháº©m (nháº­p tá»‘i thiá»ƒu 15 kÃ­ tá»±)"
                                                ></textarea>
                                            </section>

                                            <section className="review-modal-group">
                                                <label className="review-image-picker">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleReviewImageChange}
                                                        disabled={reviewImages.length >= 3}
                                                    />
                                                    <i className="fas fa-camera"></i>
                                                    <span>ThÃªm hÃ¬nh áº£nh</span>
                                                </label>
                                                {reviewImages.length > 0 && (
                                                    <div className="review-image-preview-list">
                                                        {reviewImages.map((image) => (
                                                            <div className="review-image-preview" key={image.id}>
                                                                <img src={image.preview} alt={image.name} />
                                                                <button type="button" aria-label="XÃ³a áº£nh" onClick={() => removeReviewImage(image.id)}>
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>

                                            {reviewError && <div className="review-modal-error">{reviewError}</div>}

                                            <div className="review-modal-footer">
                                                <button type="submit" className="btn btn-danger review-submit-button">Gá»¬I ÄÃNH GIÃ</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <motion.section
                                className="product-detail-section product-qna-section"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <div className="product-detail-card">
                                    <div className="product-detail-section-head">
                                        <h4>Há»i vÃ  Ä‘Ã¡p</h4>
                                    </div>
                                    <div className="product-qna-body">
                                        <div className="product-qna-ask-card">
                                            <div className="product-qna-icon">
                                                <i className="fas fa-comments"></i>
                                            </div>
                                            <div className="product-qna-ask-content">
                                                <h5>HÃ£y Ä‘áº·t cÃ¢u há»i cho chÃºng tÃ´i</h5>
                                                <p>ChÃºng tÃ´i sáº½ pháº£n há»“i trong thá»i gian sá»›m nháº¥t. Vui lÃ²ng Ä‘áº·t cÃ¢u há»i Ä‘á»ƒ nháº­n Ä‘Æ°á»£c thÃ´ng tin cáº­p nháº­t má»›i nháº¥t vá» sáº£n pháº©m.</p>
                                                <form className="product-qna-form" onSubmit={handleSubmitQuestion}>
                                                    <textarea
                                                        value={questionInput}
                                                        onChange={(event) => {
                                                            setQuestionInput(event.target.value);
                                                            setQuestionError('');
                                                        }}
                                                        rows="2"
                                                        placeholder="Viáº¿t cÃ¢u há»i cá»§a báº¡n táº¡i Ä‘Ã¢y"
                                                    ></textarea>
                                                    <button type="submit" className="btn btn-primary">Gá»­i cÃ¢u há»i</button>
                                                </form>
                                                {questionError && <div className="product-qna-error">{questionError}</div>}
                                                {questionMsg && <div className="product-qna-success">{questionMsg}</div>}
                                            </div>
                                        </div>

                                        {productQuestions.length > 0 ? (
                                            <div className="product-qna-list">
                                                {productQuestions.map((item) => {
                                                    const hasAnswer = Boolean(item.answer?.content);
                                                    const expanded = expandedQuestionIds.includes(item.id);
                                                    return (
                                                        <article className="product-qna-item" key={item.id}>
                                                            <div className="product-qna-question">
                                                                <div className="product-qna-avatar">{getAvatarInitial(item.customerName)}</div>
                                                                <div className="product-qna-content">
                                                                    <div className="product-qna-meta">
                                                                        <strong>{item.customerName}</strong>
                                                                        <span>{formatRelativeTime(item.createdAt)}</span>
                                                                    </div>
                                                                    <p>{item.question}</p>
                                                                    <div className="product-qna-actions">
                                                                        <button type="button">Pháº£n há»“i</button>
                                                                        {hasAnswer ? (
                                                                            <button type="button" onClick={() => toggleQuestionAnswer(item.id)}>
                                                                                {expanded ? 'Thu gá»n pháº£n há»“i' : 'Xem pháº£n há»“i'}
                                                                            </button>
                                                                        ) : (
                                                                            <span>Äang chá» pháº£n há»“i</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {hasAnswer && expanded && (
                                                                <div className="product-qna-answer">
                                                                    <div className="product-qna-admin-avatar">
                                                                        <i className="fas fa-user-shield"></i>
                                                                    </div>
                                                                    <div className="product-qna-content">
                                                                        <div className="product-qna-meta">
                                                                            <strong>{item.answer.adminName || 'Quáº£n trá»‹ viÃªn'}</strong>
                                                                            <em>QTV</em>
                                                                            <span>{formatRelativeTime(item.answer.createdAt)}</span>
                                                                        </div>
                                                                        <p>{item.answer.content}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="product-detail-empty product-qna-empty">ChÆ°a cÃ³ cÃ¢u há»i nÃ o cho sáº£n pháº©m nÃ y.</div>
                                        )}
                                    </div>
                                </div>
                            </motion.section>

                            {false && (
                            <>
                            <motion.ul
                                className="nav border-bottom mb-3"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <li className="nav-item">
                                    <button className="nav-link active text-dark border-0 bg-transparent border-bottom border-primary rounded-0" type="button">{t('Description')}</button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link text-primary border-0 bg-transparent rounded-0" type="button">ThÃ´ng sá»‘</button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link text-primary border-0 bg-transparent rounded-0" type="button">Reviews</button>
                                </li>
                            </motion.ul>

                            <motion.div
                                className="text-muted mb-5"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <p>{productDescription || t('No description')}</p>
                                <p><strong>{t('Features')}:</strong><br />{t('Category')}: {productCategoryName}. {t('Availability')}: {productStock > 0 ? t('In Stock') : t('Out of Stock')}.</p>
                                <p><strong>{t('Warranty')}:</strong><br />Products are supported according to the store warranty and return policy.</p>
                            </motion.div>

                            <motion.div
                                className="mb-5"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <h4 className="fw-bold mb-4">ThÃ´ng sá»‘ chi tiáº¿t</h4>
                                <div className="table-responsive border rounded">
                                    <table className="table table-striped mb-0 align-middle">
                                        <tbody>
                                            {productSpecifications.map(([label, value]) => (
                                                <tr key={`detail-spec-${label}`}>
                                                    <th scope="row" className="text-muted fw-semibold" style={{ width: '32%' }}>{label}</th>
                                                    <td>{String(value)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                            <motion.div
                                className="mb-5"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <h4 className="fw-bold mb-4">Leave a review</h4>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <input type="text" className="form-control border-0 border-bottom rounded-0 px-0" placeholder={`${t('Your Name')} *`} />
                                    </div>
                                    <div className="col-md-6">
                                        <input type="email" className="form-control border-0 border-bottom rounded-0 px-0" placeholder={`${t('Your Email')} *`} />
                                    </div>
                                    <div className="col-12">
                                        <textarea className="form-control border-0 border-bottom rounded-0 px-0" rows="6" placeholder={`${t('Message')} *`}></textarea>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center gap-3">
                                        <span className="text-muted">Rating:</span>
                                        <Rating small />
                                    </div>
                                    <div className="col-md-6 text-md-end">
                                        <button type="button" className="btn btn-primary rounded-pill px-4 py-3">{t('Send Message')}</button>
                                    </div>
                                </div>
                            </motion.div>
                            </>
                            )}
                        </main>
                    </div>

                    {false && boughtTogetherProducts.length > 0 && (
                        <motion.section
                            className="product-detail-section"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={singleViewport}
                            transition={singleTransition}
                        >
                            <div className="product-detail-section-head">
                                <h4>Sáº£n pháº©m thÆ°á»ng mua cÃ¹ng</h4>
                            </div>
                            <div className="row g-4 product-detail-grid">
                                {boughtTogetherProducts.map((item) => (
                                    <div key={`bought-together-${item.id}`} className="col-6 col-md-6 col-lg-3">
                                        <ProductCard product={item} />
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {computedRelatedProducts.length > 0 && (
                        <motion.section
                            className="product-detail-section"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={singleViewport}
                            transition={singleTransition}
                        >
                            <div className="product-detail-section-head">
                                <h4>Sáº£n pháº©m liÃªn quan</h4>
                            </div>
                            <div className="row g-4 product-detail-grid">
                                {computedRelatedProducts.map((item) => (
                                    <div key={`related-${item.id}`} className="col-6 col-md-6 col-lg-3">
                                        <ProductCard product={item} />
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {recentlyViewedProducts.length > 0 && (
                        <motion.section
                            className="product-detail-section"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={singleViewport}
                            transition={singleTransition}
                        >
                            <div className="product-detail-section-head">
                                <h4>Sáº£n pháº©m Ä‘Ã£ xem gáº§n Ä‘Ã¢y</h4>
                            </div>
                            <div className="row g-4 product-detail-grid">
                                {recentlyViewedProducts.map((item) => (
                                    <div key={`recently-viewed-${item.id}`} className="col-6 col-md-6 col-lg-3">
                                        <ProductCard product={item} />
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
