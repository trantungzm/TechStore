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
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
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
    brand: 'Hãng sản xuất',
    manufacturer: 'Hãng sản xuất',
    sku: 'Mã sản phẩm',
    code: 'Mã sản phẩm',
    model: 'Mã sản phẩm',
    category: 'Danh mục',
    cpu: 'CPU',
    cpuType: 'Loại CPU',
    processor: 'CPU',
    ram: 'Dung lượng RAM',
    ramSize: 'Dung lượng RAM',
    ramType: 'Loại RAM',
    memory: 'Dung lượng RAM',
    storage: 'Ổ cứng',
    hardDrive: 'Ổ cứng',
    ssd: 'Ổ cứng',
    internalStorage: 'Bộ nhớ trong',
    rom: 'Bộ nhớ trong',
    gpu: 'Card đồ họa',
    graphics: 'Card đồ họa',
    graphicsCard: 'Card đồ họa',
    graphicsType: 'Loại card đồ họa',
    screen: 'Màn hình',
    screenSize: 'Kích thước màn hình',
    displaySize: 'Kích thước màn hình',
    display: 'Màn hình',
    screenTechnology: 'Công nghệ màn hình',
    displayTechnology: 'Công nghệ màn hình',
    screenResolution: 'Độ phân giải màn hình',
    resolution: 'Độ phân giải màn hình',
    screenFeatures: 'Tính năng màn hình',
    displayFeatures: 'Tính năng màn hình',
    refreshRate: 'Tần số quét',
    chipset: 'Chipset',
    nfc: 'Công nghệ NFC',
    nfcTechnology: 'Công nghệ NFC',
    rearCamera: 'Camera sau',
    backCamera: 'Camera sau',
    frontCamera: 'Camera trước',
    selfieCamera: 'Camera trước',
    camera: 'Camera',
    sim: 'Thẻ SIM',
    mobileNetwork: 'Mạng di động',
    battery: 'Pin',
    fastCharging: 'Sạc nhanh',
    charging: 'Sạc nhanh',
    chargingPort: 'Cổng sạc',
    operatingSystem: 'Hệ điều hành',
    os: 'Hệ điều hành',
    warranty: 'Bảo hành',
    connection: 'Kết nối',
    connectivity: 'Kết nối',
    ports: 'Cổng giao tiếp',
    connections: 'Cổng giao tiếp',
    wireless: 'Kết nối không dây',
    wifi: 'WiFi',
    bluetooth: 'Bluetooth',
    webcam: 'Webcam',
    keyboard: 'Bàn phím',
    weight: 'Trọng lượng',
    material: 'Chất liệu',
    dimensions: 'Kích thước',
    feature: 'Tính năng',
    features: 'Tính năng',
    type: 'Loại sản phẩm',
    faceSize: 'Kích cỡ mặt đồng hồ',
    caseSize: 'Kích cỡ mặt đồng hồ',
    watchFaceSize: 'Kích cỡ mặt đồng hồ',
    faceDiameter: 'Đường kính mặt',
    wristSize: 'Kích thước cổ tay phù hợp',
    bezelMaterial: 'Chất liệu viền',
    strapMaterial: 'Chất liệu dây',
    design: 'Thiết kế',
    healthFeatures: 'Tính năng sức khỏe',
    workoutModes: 'Chế độ luyện tập',
    calling: 'Nghe gọi',
    gps: 'Định vị GPS',
    compatibility: 'Tương thích',
    waterResistant: 'Chống nước',
    waterResistance: 'Kháng nước / bụi',
    batteryLife: 'Thời lượng pin',
    chargingTime: 'Thời gian sạc',
    cameraLine: 'Dòng camera',
    cameraType: 'Loại camera',
    sensor: 'Cảm biến',
    lensAngle: 'Góc ống kính',
    displaySpecs: 'Thông số màn hình',
    wirelessConnection: 'Kết nối không dây',
    batterySpecs: 'Thông số pin',
    aperture: 'Khẩu độ',
    zoom: 'Zoom',
    stabilization: 'Chống rung',
    video: 'Quay video',
    aiFeatures: 'Tính năng AI',
    nightVision: 'Nhìn đêm',
    lens: 'Ống kính',
    utilities: 'Tiện ích',
    headphoneType: 'Loại tai nghe',
    wearingStyle: 'Kiểu đeo',
    audioTechnology: 'Công nghệ âm thanh',
    driver: 'Driver',
    noiseCancelling: 'Chống ồn',
    microphone: 'Micro',
    micro: 'Micro',
    connectionPort: 'Cổng kết nối',
    controlMethod: 'Phương thức điều khiển',
    otherFeatures: 'Tính năng khác',
    bluetoothVersion: 'Bluetooth version',
    codec: 'Codec',
    latency: 'Độ trễ',
    stylusSupport: 'Hỗ trợ bút',
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
const commonExcludedSpecLabels = ['Mã sản phẩm', 'Danh mục'];

const excludedSpecKeysByCategory = {
    phone: ['fastCharging', 'waterResistance', 'waterResistant'],
    laptop: ['keyboard', 'wireless', 'wirelessConnection', 'warranty'],
};

const excludedSpecLabelsByCategory = {
    phone: ['Sạc nhanh', 'Kháng nước / bụi', 'Chống nước'],
    laptop: ['Bàn phím', 'Kết nối không dây', 'Bảo hành'],
};

const getFallbackSpecs = (product, categoryType) => {
    const name = normalizeText(product?.name);
    const brand = inferBrandFromName(product?.name);

    if (categoryType === 'phone') {
        const isIphone = name.includes('iphone');
        const isSamsung = name.includes('samsung') || name.includes('galaxy');
        const isXiaomi = name.includes('xiaomi');
        return {
            screenSize: isIphone ? '6.1 - 6.7 inch' : isSamsung ? '6.2 - 6.8 inch' : '6.7 inch',
            screenTechnology: isIphone ? 'Super Retina XDR OLED' : isSamsung ? 'Dynamic AMOLED 2X' : isXiaomi ? 'AMOLED' : 'OLED',
            rearCamera: isIphone ? 'Camera chính 48MP, hỗ trợ góc siêu rộng và tele tùy phiên bản' : isSamsung ? 'Camera chính độ phân giải cao, hỗ trợ góc siêu rộng và zoom' : 'Camera chính độ phân giải cao',
            frontCamera: isIphone ? 'Camera trước TrueDepth' : 'Camera trước hỗ trợ chụp chân dung và gọi video',
            chipset: isIphone ? 'Apple A-series' : isSamsung ? 'Snapdragon / Exynos tùy thị trường' : isXiaomi ? 'Snapdragon cao cấp' : 'Chipset hiệu năng cao',
            nfc: 'Có',
            storage: product?.storage || product?.internalStorage || '128GB / 256GB / 512GB tùy phiên bản',
            sim: isIphone ? 'Nano SIM và eSIM' : '2 SIM nano hoặc eSIM tùy phiên bản',
            operatingSystem: isIphone ? 'iOS' : 'Android',
            screenResolution: isIphone ? 'Super Retina XDR, độ phân giải cao' : 'Full HD+ hoặc QHD+ tùy phiên bản',
            screenFeatures: 'Tần số quét cao, HDR, hiển thị màu sắc sống động',
            cpuType: isIphone ? 'CPU nhiều lõi Apple' : 'CPU nhiều lõi',
            gpu: isIphone ? 'GPU Apple' : 'GPU tích hợp trong chipset',
            ram: product?.ram || (isIphone ? 'Tùy phiên bản' : '8GB / 12GB tùy phiên bản'),
            battery: 'Dung lượng pin theo từng phiên bản',
            fastCharging: 'Có',
            chargingPort: isIphone && !name.includes('15') ? 'Lightning' : 'USB-C',
            waterResistance: 'Có, tùy phiên bản',
            dimensions: 'Theo từng phiên bản',
            weight: 'Theo từng phiên bản',
            material: isIphone ? 'Khung kim loại, mặt kính' : 'Khung kim loại/nhựa, mặt kính',
            warranty: '12 tháng',
        };
    }

    if (categoryType === 'laptop') {
        const isMacbook = name.includes('macbook');
        const isGaming = name.includes('gaming') || name.includes('rog');
        return {
            cpu: isMacbook ? 'Apple Silicon' : 'Intel Core / AMD Ryzen tùy phiên bản',
            cpuType: isMacbook ? 'CPU Apple nhiều lõi' : 'CPU hiệu năng cao',
            ram: product?.ram || '8GB / 16GB tùy phiên bản',
            ramType: isMacbook ? 'Unified Memory' : 'DDR4 / DDR5 tùy phiên bản',
            storage: product?.storage || 'SSD 512GB tùy phiên bản',
            gpu: isGaming ? 'NVIDIA GeForce RTX' : isMacbook ? 'GPU Apple tích hợp' : 'Card đồ họa tích hợp/rời tùy phiên bản',
            screenSize: name.includes('15') ? '15 inch' : '13 - 16 inch tùy phiên bản',
            screenTechnology: isMacbook ? 'Liquid Retina' : 'IPS / OLED tùy phiên bản',
            resolution: 'Độ phân giải cao',
            refreshRate: isGaming ? '120Hz / 144Hz tùy phiên bản' : '60Hz',
            ports: 'USB, USB-C, HDMI tùy phiên bản',
            wireless: 'Wi-Fi, Bluetooth',
            webcam: 'Có',
            keyboard: 'Bàn phím tích hợp',
            battery: 'Theo từng phiên bản',
            operatingSystem: isMacbook ? 'macOS' : 'Windows',
            dimensions: 'Theo từng phiên bản',
            weight: 'Theo từng phiên bản',
            material: 'Nhôm/nhựa cao cấp tùy phiên bản',
            warranty: '12 tháng',
        };
    }

    if (categoryType === 'tablet') {
        const isIpad = name.includes('ipad');
        return {
            screenSize: isIpad ? '11 - 12.9 inch tùy phiên bản' : '10 - 12 inch tùy phiên bản',
            screenTechnology: isIpad ? 'Liquid Retina' : 'AMOLED / LCD tùy phiên bản',
            screenResolution: 'Độ phân giải cao',
            chipset: isIpad ? 'Apple M-series / A-series' : 'Chipset hiệu năng cao',
            cpuType: 'CPU nhiều lõi',
            ram: 'Theo từng phiên bản',
            storage: '128GB / 256GB tùy phiên bản',
            rearCamera: 'Camera sau',
            frontCamera: 'Camera trước',
            connection: 'Wi-Fi / 5G tùy phiên bản',
            sim: 'Tùy phiên bản',
            battery: 'Theo từng phiên bản',
            fastCharging: 'Có',
            operatingSystem: isIpad ? 'iPadOS' : 'Android',
            stylusSupport: 'Có, tùy phiên bản',
            dimensions: 'Theo từng phiên bản',
            weight: 'Theo từng phiên bản',
            warranty: '12 tháng',
        };
    }

    if (categoryType === 'smartwatch') {
        return {
            faceSize: 'Theo từng phiên bản',
            screenTechnology: 'AMOLED / Retina tùy phiên bản',
            screenResolution: 'Độ phân giải cao',
            bezelMaterial: 'Nhôm/thép tùy phiên bản',
            strapMaterial: 'Silicone hoặc dây thay thế',
            design: 'Đồng hồ thông minh',
            healthFeatures: 'Theo dõi sức khỏe, nhịp tim, giấc ngủ',
            workoutModes: 'Nhiều chế độ luyện tập',
            calling: 'Có, tùy phiên bản',
            gps: 'Có',
            connection: 'Bluetooth, Wi-Fi',
            compatibility: 'Tùy hệ điều hành điện thoại',
            waterResistant: 'Có',
            batteryLife: 'Theo từng phiên bản',
            chargingTime: 'Theo từng phiên bản',
            weight: 'Theo từng phiên bản',
            warranty: '12 tháng',
        };
    }

    if (categoryType === 'camera') {
        return {
            cameraType: 'Máy ảnh kỹ thuật số',
            cameraLine: brand || 'Dòng camera',
            sensor: 'Cảm biến ảnh chất lượng cao',
            resolution: 'Độ phân giải cao',
            lens: 'Hỗ trợ ống kính theo hệ máy',
            aperture: 'Tùy ống kính',
            zoom: 'Tùy ống kính',
            stabilization: 'Có, tùy phiên bản',
            video: 'Quay video chất lượng cao',
            aiFeatures: 'Có, tùy phiên bản',
            nightVision: 'Hỗ trợ chụp thiếu sáng',
            connection: 'Wi-Fi / Bluetooth tùy phiên bản',
            storage: 'Thẻ nhớ',
            battery: 'Pin rời',
            dimensions: 'Theo từng phiên bản',
            weight: 'Theo từng phiên bản',
            warranty: '12 tháng',
        };
    }

    if (categoryType === 'headphone') {
        return {
            headphoneType: name.includes('airpods') ? 'Tai nghe true wireless' : 'Tai nghe',
            wearingStyle: name.includes('quietcomfort') ? 'Chụp tai' : 'Đeo tai',
            audioTechnology: 'Âm thanh chất lượng cao',
            driver: 'Theo từng phiên bản',
            noiseCancelling: name.includes('quietcomfort') || name.includes('airpods') ? 'Có' : 'Tùy phiên bản',
            microphone: 'Có',
            connection: 'Bluetooth',
            bluetoothVersion: 'Bluetooth 5.x',
            codec: 'Theo từng phiên bản',
            latency: 'Độ trễ thấp',
            batteryLife: 'Theo từng phiên bản',
            chargingTime: 'Theo từng phiên bản',
            chargingPort: 'USB-C / hộp sạc tùy phiên bản',
            waterResistant: 'Tùy phiên bản',
            weight: 'Theo từng phiên bản',
            warranty: '12 tháng',
        };
    }

    return {};
};

const getSpecLabel = (key, categoryType) => {
    const normalized = normalizeSpecKey(key).replace(/\s+([a-z])/g, (_, char) => char.toUpperCase());
    if ((normalized === 'storage' || normalized === 'rom') && ['phone', 'tablet'].includes(categoryType)) return 'Bộ nhớ trong';
    if (normalized === 'gpu' && categoryType === 'phone') return 'GPU';
    if (normalized === 'resolution' && ['phone', 'laptop', 'tablet'].includes(categoryType)) return 'Độ phân giải màn hình';
    if (normalized === 'waterResistance' && categoryType !== 'phone') return 'Chống nước';
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
    const includeExcluded = Boolean(options.includeExcluded);
    const categoryType = getCategoryType(product);
    const specMap = new Map();

    ['specifications', 'specs', 'attributes', 'technicalSpecs', 'details'].forEach((containerKey) => {
        const rawSpecs = product[containerKey];
        if (Array.isArray(rawSpecs)) {
            rawSpecs.forEach((item) => {
                if (Array.isArray(item)) addSpecValue(specMap, item[0], item[1]);
                else if (item && typeof item === 'object') addSpecValue(
                    specMap,
                    item.label || item.name || item.key || item.title || item.specName,
                    item.value ?? item.val ?? item.content ?? item.specValue
                );
            });
        } else if (rawSpecs && typeof rawSpecs === 'object') {
            Object.entries(rawSpecs).forEach(([key, value]) => addSpecValue(specMap, key, value));
        }
    });

    directSpecKeys.forEach((key) => addSpecValue(specMap, key, product[key]));
    addSpecValue(specMap, 'brand', product.brand || product.manufacturer || inferBrandFromName(product.name));
    addSpecValue(specMap, 'sku', product.sku || product.code || product.model || product.id);
    addSpecValue(specMap, 'category', product.category?.name || product.categoryName || product.category);
    Object.entries(getFallbackSpecs(product, categoryType)).forEach(([key, value]) => addSpecValue(specMap, key, value));

    const orderedKeys = categorySpecOrder[categoryType] || categorySpecOrder.default;
    const excludedKeys = new Set((includeExcluded ? [] : [...commonExcludedSpecKeys, ...(excludedSpecKeysByCategory[categoryType] || [])])
        .map((key) => normalizeSpecKey(key).replace(/\s+([a-z])/g, (_, char) => char.toUpperCase())));
    const used = new Set();
    const orderedSpecs = orderedKeys
        .map((key) => normalizeSpecKey(key).replace(/\s+([a-z])/g, (_, char) => char.toUpperCase()))
        .filter((key) => !excludedKeys.has(key))
        .filter((key) => specMap.has(key) && !used.has(key) && used.add(key))
        .map((key) => ({ label: getSpecLabel(key, categoryType), value: specMap.get(key) }));

    const extraSpecs = [...specMap.entries()]
        .filter(([key]) => !used.has(key) && !excludedKeys.has(key))
        .map(([key, value]) => ({ label: getSpecLabel(key, categoryType), value }));

    const seenLabels = new Set();
    const excludedLabels = new Set((includeExcluded ? [] : [...commonExcludedSpecLabels, ...(excludedSpecLabelsByCategory[categoryType] || [])]).map(normalizeText));
    return [...orderedSpecs, ...extraSpecs].filter(({ label, value }) => {
        const key = normalizeText(label);
        if (!compactValue(value) || seenLabels.has(key) || excludedLabels.has(key)) return false;
        seenLabels.add(key);
        return true;
    });
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
    1: 'Rất tệ',
    2: 'Tệ',
    3: 'Bình thường',
    4: 'Tốt',
    5: 'Tuyệt vời',
};

const experienceRatingLabels = {
    1: 'Rất kém',
    2: 'Chưa tốt',
    3: 'Tạm ổn',
    4: 'Tốt',
    5: 'Rất tốt',
};

const reviewExperienceCriteria = {
    phone: ['Hiệu năng', 'Thời lượng pin', 'Chất lượng camera'],
    laptop: ['Hiệu năng', 'Màn hình', 'Thời lượng pin', 'Bàn phím / touchpad'],
    tablet: ['Màn hình', 'Thời lượng pin', 'Hiệu năng', 'Học tập / giải trí'],
    headphone: ['Chất lượng âm thanh', 'Chống ồn', 'Thời lượng pin', 'Độ thoải mái khi đeo'],
    smartwatch: ['Theo dõi sức khỏe', 'Thời lượng pin', 'Độ chính xác', 'Thiết kế'],
    camera: ['Chất lượng hình ảnh', 'Chống rung', 'Quay video', 'Tính tiện dụng'],
    default: ['Chất lượng sản phẩm', 'Trải nghiệm sử dụng', 'Thiết kế'],
};

const getReviewExperienceCriteria = (product) => reviewExperienceCriteria[getCategoryType(product)] || reviewExperienceCriteria.default;

const normalizeReview = (review, index = 0) => {
    const rating = Math.max(1, Math.min(5, Number(review?.rating || review?.stars || review?.score || 5)));
    return {
        id: review?.id || `review-${index}`,
        customerName: review?.customerName || review?.userName || review?.name || 'Khách hàng',
        rating,
        date: review?.date || review?.createdAt || review?.time || 'Gần đây',
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
    if (!value) return 'Vừa xong';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60 * 1000) return 'Vừa xong';
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    if (hours < 24) return `${Math.max(1, hours)} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${Math.max(1, days)} ngày trước`;
};

const normalizeQuestion = (item, index = 0) => {
    if (!item) return null;
    const rawAnswer = item.answer || item.reply || item.response || (Array.isArray(item.answers) ? item.answers[0] : null);
    const answer = rawAnswer
        ? {
            adminName: rawAnswer.adminName || rawAnswer.authorName || rawAnswer.name || 'Quản trị viên',
            content: compactValue(rawAnswer.content || rawAnswer.answer || rawAnswer.message || rawAnswer.reply || rawAnswer),
            createdAt: rawAnswer.createdAt || rawAnswer.date || rawAnswer.time,
        }
        : null;
    const question = compactValue(item.question || item.content || item.message || item.text);
    if (!question) return null;
    return {
        id: item.id || item.questionId || `question-${index}`,
        customerName: item.customerName || item.userName || item.name || 'Khách hàng',
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
        <div className="review-star-buttons" role="radiogroup" aria-label="Chọn số sao">
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
        <span>{value ? labels[value] : 'Chưa chọn'}</span>
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
    const label = getOptionLabel(option, option.id || `Phiên bản ${index + 1}`);
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
    const label = getOptionLabel(option, option.color || option.id || `Màu ${index + 1}`);
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

const getFallbackVersions = (product) => {
    const categoryType = getCategoryType(product);
    const basePrice = Number(product?.price || 0);
    if (!['phone', 'tablet'].includes(categoryType) || !basePrice) return [];
    const versionLabels = categoryType === 'laptop'
        ? ['SSD 512GB', 'SSD 1TB']
        : ['128GB', '256GB', '512GB'];
    return versionLabels.map((label, index) => ({
        id: `fallback-version-${product?.id}-${label}`,
        label,
        price: Math.round(basePrice * (1 + index * 0.12)),
        oldPrice: Math.round(basePrice * (1.08 + index * 0.12)),
        stock: Math.max(1, Number(product?.stock || 0) - index * 2),
        sku: `${product?.id || 'SP'}-${label.replace(/\s+/g, '').toUpperCase()}`,
    }));
};

const getFallbackColors = (product) => {
    const categoryType = getCategoryType(product);
    const name = normalizeText(product?.name);
    const basePrice = Number(product?.price || 0);
    if (!['phone', 'tablet', 'laptop', 'smartwatch', 'headphone'].includes(categoryType)) return [];
    let colors = [
        { label: 'Đen', colorCode: '#1f2937' },
        { label: 'Bạc', colorCode: '#d1d5db' },
        { label: 'Xanh', colorCode: '#1d4ed8' },
    ];
    if (name.includes('iphone')) {
        colors = [
            { label: 'Titan Tự Nhiên', colorCode: '#c8beb2' },
            { label: 'Xanh Đậm', colorCode: '#24324a' },
            { label: 'Trắng', colorCode: '#f8fafc' },
        ];
    } else if (name.includes('galaxy') || name.includes('samsung')) {
        colors = [
            { label: 'Đen', colorCode: '#111827' },
            { label: 'Xám', colorCode: '#9ca3af' },
            { label: 'Tím', colorCode: '#8b5cf6' },
        ];
    } else if (name.includes('xiaomi') || name.includes('oneplus') || name.includes('nothing')) {
        colors = [
            { label: 'Đen', colorCode: '#111827' },
            { label: 'Trắng', colorCode: '#f8fafc' },
            { label: 'Xanh Lá', colorCode: '#16a34a' },
        ];
    } else if (categoryType === 'headphone') {
        colors = [
            { label: 'Đen', colorCode: '#111827' },
            { label: 'Trắng', colorCode: '#f8fafc' },
        ];
    } else if (categoryType === 'laptop') {
        colors = [
            { label: 'Đen', colorCode: '#111827' },
            { label: 'Trắng', colorCode: '#f8fafc' },
        ];
    }
    return colors.map((color, index) => ({
        id: `fallback-color-${product?.id}-${color.label}`,
        ...color,
        price: basePrice || undefined,
        stock: Math.max(1, Number(product?.stock || 0) - index),
    }));
};

const getProductVersions = (product) => {
    if (getCategoryType(product) === 'laptop') return [];
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const fromVariants = variants
        .map((variant, index) => normalizeVersionOption({
            ...variant,
            label: variant.version || variant.storage || variant.internalStorage || variant.label || variant.name,
        }, index))
        .filter(Boolean);
    const fromOptions = [
        ...(Array.isArray(product?.options?.versions) ? product.options.versions : []),
        ...(Array.isArray(product?.storageOptions) ? product.storageOptions : []),
    ].map(normalizeVersionOption).filter(Boolean);
    const fallback = [product?.storage, product?.internalStorage, product?.rom]
        .map(normalizeVersionOption)
        .filter(Boolean);
    return uniqueOptions([...fromOptions, ...fromVariants, ...fallback, ...getFallbackVersions(product)]);
};

const getProductColors = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const fromVariants = variants
        .map((variant, index) => normalizeColorOption({
            ...variant,
            label: variant.color || variant.colorName || variant.label || variant.name,
        }, index))
        .filter(Boolean);
    const fromOptions = [
        ...(Array.isArray(product?.options?.colors) ? product.options.colors : []),
        ...(Array.isArray(product?.colors) ? product.colors : []),
    ].map(normalizeColorOption).filter(Boolean);
    return uniqueOptions([...fromOptions, ...fromVariants, ...getFallbackColors(product)]);
};

const findSelectedVariant = (product, selectedVersion, selectedColor) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (!variants.length) return null;
    const versionText = normalizeText(selectedVersion?.label);
    const colorText = normalizeText(selectedColor?.label);
    const matches = (variant) => {
        const variantVersion = normalizeText(variant.version || variant.storage || variant.internalStorage || variant.label || variant.name);
        const variantColor = normalizeText(variant.color || variant.colorName);
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
    const oldPrice = selectedVariant?.oldPrice ?? selectedVersion?.oldPrice ?? selectedColor?.oldPrice ?? product?.oldPrice ?? Math.round(productPrice * 1.19);
    const displaySku = selectedVariant?.sku || selectedVersion?.sku || selectedColor?.sku || product?.sku || product?.id;
    const selectedImage = selectedVariant?.image || selectedColor?.image || selectedVersion?.image || '';
    const displayImage = selectedImage ? resolveProductImage({ id: product?.id, imageUrl: selectedImage }) : productImage;
    const galleryImages = useMemo(() => {
        const images = [
            displayImage,
            productImage,
            '/electro/img/product-2.png',
            '/electro/img/product-3.png',
            '/electro/img/product-4.png',
            '/electro/img/product-5.png',
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
            setLoading(false);
            return () => {
                cancelled = true;
            };
        }

        const loadProduct = async () => {
            setLoading(true);
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
            ...product,
            id: selectedVariant?.id || product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            selectedVersion: selectedVersion?.label || '',
            selectedColor: selectedColor?.label || '',
            price: productPrice,
            oldPrice,
            stock: productStock,
            sku: displaySku,
            imageUrl: displayImage,
            name: [product.name, selectedVersion?.label, selectedColor?.label].filter(Boolean).join(' - '),
        }, quantity);
        setAddedMsg(`Thêm vào giỏ hàng: ${quantity}`);
        setTimeout(() => setAddedMsg(''), 2500);
    };

    const showCouponMessage = (message) => {
        setCouponMsg(message);
        setTimeout(() => setCouponMsg(''), 2500);
    };

    const handleClaimCoupon = (coupon) => {
        if (!canClaimCoupon(coupon, productCouponContext)) {
            showCouponMessage(getCouponClaimStatus(coupon, productCouponContext).message || 'Chưa đủ điều kiện');
            return;
        }
        const result = claimCoupon(coupon.id);
        setClaimedCouponIds(getClaimedCoupons());
        showCouponMessage(result.success ? 'Đã lưu phiếu vào ví' : result.message);
    };

    const handleCopyCoupon = async (coupon) => {
        if (!isCouponClaimed(coupon.id)) {
            showCouponMessage('Bạn cần nhận phiếu trước khi sử dụng');
            return;
        }
        await navigator.clipboard?.writeText(coupon.code);
        showCouponMessage('Đã sao chép');
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
            setReviewError('Vui lòng chọn đánh giá chung.');
            return;
        }
        if (content.length < 15) {
            setReviewError('Vui lòng nhập nhận xét tối thiểu 15 ký tự.');
            return;
        }
        const newReview = normalizeReview({
            id: `temp-review-${Date.now()}`,
            customerName: 'Khách hàng',
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
        setReviewMsg('Cảm ơn bạn đã gửi đánh giá.');
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
            setQuestionError('Vui lòng nhập câu hỏi tối thiểu 10 ký tự.');
            setQuestionMsg('');
            return;
        }
        setTemporaryQuestions((current) => [{
            id: `temp-question-${Date.now()}`,
            customerName: 'Khách hàng',
            question,
            createdAt: new Date().toISOString(),
            answer: null,
        }, ...current]);
        setQuestionInput('');
        setQuestionError('');
        setQuestionMsg('Câu hỏi của bạn đã được gửi.');
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
                                    <p className="text-muted mb-0">Mã sản phẩm: {displaySku}</p>
                                    <p className="text-muted">
                                        {t('Availability')}: {' '}
                                        <span className={`fw-bold ${productStock > 0 ? 'text-primary' : 'text-secondary'}`}>
                                            {productStock > 0 ? `${t('In Stock')} (${productStock})` : t('Out of Stock')}
                                        </span>
                                    </p>
                                    {productVersions.length > 0 && (
                                        <div className="product-option-group">
                                            <div className="product-option-title">Phiên bản</div>
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
                                                            {version.stock === 0 && <em>Hết hàng</em>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {productColors.length > 0 && (
                                        <div className="product-option-group">
                                            <div className="product-option-title">Màu sắc</div>
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
                                                                {color.stock === 0 && <em>Hết hàng</em>}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
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
                                                <h5 className="fw-bold mb-0">Phiếu giảm giá</h5>
                                                <Link to="/promotion" className="small text-primary">Xem thêm phiếu</Link>
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
                                                                {status === 'claimed' ? 'Đã nhận' : canReceive ? 'Nhận' : 'Chưa đủ'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {productCoupons.length > 3 && (
                                                <Link to="/promotion" className="btn btn-sm btn-outline-primary rounded-pill mt-3">Xem thêm phiếu</Link>
                                            )}
                                        </div>
                                    )}

                                    <div className="d-none">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h5 className="fw-bold mb-0">Thông số kỹ thuật</h5>
                                            <span className="badge bg-light text-dark border">{productSpecifications.length} mục</span>
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
                                            <h4>Thông số kỹ thuật</h4>
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
                                        <div className="product-detail-empty">Thông số kỹ thuật đang được cập nhật.</div>
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
                                        <h4>Mô tả sản phẩm</h4>
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
                                        <div className="product-detail-empty">Mô tả sản phẩm đang được cập nhật.</div>
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
                                            <h4>Đánh giá của khách hàng</h4>
                                            {reviewMsg && <p className="product-review-success">{reviewMsg}</p>}
                                        </div>
                                        {productReviews.length > 0 && (
                                            <button type="button" className="btn btn-primary rounded-pill px-4" onClick={openReviewModal}>
                                                Viết đánh giá
                                            </button>
                                        )}
                                    </div>

                                    {productReviews.length > 0 ? (
                                        <div className="product-review-layout">
                                            <div className="product-review-summary">
                                                <div className="product-review-score">{reviewSummary.average.toFixed(1)}/5</div>
                                                <StarRating value={reviewSummary.average} />
                                                <p>{reviewSummary.total} đánh giá</p>
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
                                                                <strong>Trải nghiệm:</strong>
                                                                {Object.entries(review.experienceRatings).map(([criterion, score]) => (
                                                                    <span key={`${review.id}-${criterion}`}>{criterion}: {score}/5</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {review.images?.length > 0 && (
                                                            <div className="product-review-images">
                                                                {review.images.map((image, index) => (
                                                                    <img key={`${review.id}-image-${index}`} src={image} alt={`Ảnh đánh giá ${index + 1}`} />
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
                                                        {showAllReviews ? 'Thu gọn' : 'Xem thêm đánh giá'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="product-detail-empty product-review-empty">
                                            Chưa có đánh giá nào cho sản phẩm này.
                                            <button type="button" className="btn btn-primary rounded-pill px-4 mt-3" onClick={openReviewModal}>
                                                Viết đánh giá đầu tiên
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.section>

                            {reviewModalOpen && (
                                <div className="review-modal-overlay" role="presentation" onMouseDown={() => setReviewModalOpen(false)}>
                                    <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onMouseDown={(event) => event.stopPropagation()}>
                                        <div className="review-modal-header">
                                            <h4 id="review-modal-title">Đánh giá & nhận xét</h4>
                                            <button type="button" className="review-modal-close" aria-label="Đóng" onClick={() => setReviewModalOpen(false)}>
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>

                                        <form className="review-modal-body" onSubmit={handleSubmitReview}>
                                            <div className="review-modal-product">
                                                <img src={displayImage || productImage} alt={productName} />
                                                <strong>{productName}</strong>
                                            </div>

                                            <section className="review-modal-group">
                                                <h5>Đánh giá chung</h5>
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
                                                <h5>Theo trải nghiệm</h5>
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
                                                    placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu 15 kí tự)"
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
                                                    <span>Thêm hình ảnh</span>
                                                </label>
                                                {reviewImages.length > 0 && (
                                                    <div className="review-image-preview-list">
                                                        {reviewImages.map((image) => (
                                                            <div className="review-image-preview" key={image.id}>
                                                                <img src={image.preview} alt={image.name} />
                                                                <button type="button" aria-label="Xóa ảnh" onClick={() => removeReviewImage(image.id)}>
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>

                                            {reviewError && <div className="review-modal-error">{reviewError}</div>}

                                            <div className="review-modal-footer">
                                                <button type="submit" className="btn btn-danger review-submit-button">GỬI ĐÁNH GIÁ</button>
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
                                        <h4>Hỏi và đáp</h4>
                                    </div>
                                    <div className="product-qna-body">
                                        <div className="product-qna-ask-card">
                                            <div className="product-qna-icon">
                                                <i className="fas fa-comments"></i>
                                            </div>
                                            <div className="product-qna-ask-content">
                                                <h5>Hãy đặt câu hỏi cho chúng tôi</h5>
                                                <p>Chúng tôi sẽ phản hồi trong thời gian sớm nhất. Vui lòng đặt câu hỏi để nhận được thông tin cập nhật mới nhất về sản phẩm.</p>
                                                <form className="product-qna-form" onSubmit={handleSubmitQuestion}>
                                                    <textarea
                                                        value={questionInput}
                                                        onChange={(event) => {
                                                            setQuestionInput(event.target.value);
                                                            setQuestionError('');
                                                        }}
                                                        rows="2"
                                                        placeholder="Viết câu hỏi của bạn tại đây"
                                                    ></textarea>
                                                    <button type="submit" className="btn btn-primary">Gửi câu hỏi</button>
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
                                                                        <button type="button">Phản hồi</button>
                                                                        {hasAnswer ? (
                                                                            <button type="button" onClick={() => toggleQuestionAnswer(item.id)}>
                                                                                {expanded ? 'Thu gọn phản hồi' : 'Xem phản hồi'}
                                                                            </button>
                                                                        ) : (
                                                                            <span>Đang chờ phản hồi</span>
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
                                                                            <strong>{item.answer.adminName || 'Quản trị viên'}</strong>
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
                                            <div className="product-detail-empty product-qna-empty">Chưa có câu hỏi nào cho sản phẩm này.</div>
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
                                    <button className="nav-link text-primary border-0 bg-transparent rounded-0" type="button">Thông số</button>
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
                                <h4 className="fw-bold mb-4">Thông số chi tiết</h4>
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
                                <h4>Sản phẩm thường mua cùng</h4>
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
                                <h4>Sản phẩm liên quan</h4>
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
                                <h4>Sản phẩm đã xem gần đây</h4>
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
