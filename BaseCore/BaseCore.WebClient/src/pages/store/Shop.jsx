import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categoryApi, productApi } from '../../services/api';
import ProductCard from '../../components/store/ProductCard';
import PageHero from '../../components/store/PageHero';
import coupons from '../../data/coupons';
import { getAvailableCouponsForProduct } from '../../utils/couponUtils';
import { fadeInUp, motionTransition, motionViewport, staggerContainer } from '../../utils/motionVariants';
import { resolveProductImage, setPageMeta, t } from '../../utils/store';

const RECENTLY_VIEWED_KEY = 'electro_recently_viewed_products';
const DEFAULT_MAX_PRICE = 50000000;
const PRICE_STEP = 500000;

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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categorySlugMap = {
    Smartphone: 'dien-thoai',
    Laptop: 'laptop',
    Accessories: 'phu-kien',
    Audio: 'tai-nghe',
    Smartwatch: 'dong-ho-thong-minh',
    Camera: 'may-anh',
};

const categoryDescriptionMap = {
    'dien-thoai': 'Lựa chọn điện thoại theo hãng, nhu cầu sử dụng và mức giá phù hợp',
    laptop: 'Lựa chọn laptop theo hãng, nhu cầu sử dụng, cấu hình và mức giá phù hợp',
    tablet: 'Lựa chọn tablet theo hãng, nhu cầu sử dụng, cấu hình và mức giá phù hợp',
    'phu-kien': 'Tìm phụ kiện công nghệ hữu ích cho thiết bị và góc làm việc của bạn',
    'tai-nghe': 'Lựa chọn tai nghe theo thương hiệu, nhu cầu sử dụng, kiểu dáng và công nghệ âm thanh',
    'dong-ho-thong-minh': 'Lựa chọn đồng hồ thông minh theo thương hiệu, tính năng và nhu cầu sử dụng',
    'may-anh': 'Lựa chọn máy ảnh theo thương hiệu, nhu cầu chụp hình và cấu hình phù hợp',
};

const safeParseJson = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const normalizeRecentProduct = (product) => {
    if (!product) return null;
    return {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
    };
};

const productTags = ['Mới', 'thương hiệu', 'đen', 'trắng', 'máy tính bảng', 'điện thoại', 'máy ảnh', 'drone', 'tivi', 'giảm giá'];
const commonPriceOptions = [
    { label: 'Tất cả', min: null, max: null },
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: '20 - 40 triệu', min: 20000000, max: 40000000 },
    { label: 'Trên 40 triệu', min: 40000000, max: null },
];
const statusFilterOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Còn hàng', value: 'in-stock' },
];
const offerFilterOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Có phiếu giảm giá', value: 'coupon' },
    { label: 'Hàng mới về', value: 'new' },
    { label: 'Đang giảm giá', value: 'sale' },
    { label: 'Freeship', value: 'freeship' },
];
const fallbackFeaturedProducts = [
    { id: 'featured-1', name: 'Điện thoại thông minh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-1.png' },
    { id: 'featured-2', name: 'Máy ảnh thông minh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-2.png' },
    { id: 'featured-3', name: 'Ống kính máy ảnh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-3.png' },
];

const categoryNameMap = {
    'Accessories': 'Phụ kiện',
    'Electronics & Computer': 'Điện tử & Máy tính',
    'Laptops & Desktops': 'Laptop & Máy bàn',
    'Mobiles & Tablets': 'Điện thoại & Máy tính bảng',
    'SmartPhone & Smart TV': 'Điện thoại & Smart TV',
    'Smartphone': 'Điện thoại',
    'Laptop': 'Laptop',
    'Audio': 'Tai nghe',
    'Smartwatch': 'Đồng hồ thông minh',
    'Camera': 'Máy ảnh',
    'Gaming': 'Gaming',
    'Tablet': 'Tablet',
};

const getCategoryDisplayName = (name = '') => categoryNameMap[name] || name;

const normalizeSearchText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const getProductSearchText = (product) => normalizeSearchText([
    product?.name,
    product?.title,
    product?.description,
    product?.specs,
    product?.tags,
    product?.brand,
    product?.sku,
    product?.category?.name,
    product?.categoryName,
    product?.usage,
    product?.cpu,
    product?.gpu,
    product?.screenSize,
    product?.resolution,
    product?.ram,
    product?.storage,
    product?.battery,
    product?.camera,
].filter(Boolean).join(' '));

const inferPhoneBrand = (product) => {
    const explicitBrand = String(product?.brand || '').trim().toLowerCase();
    if (explicitBrand) return explicitBrand;
    const text = getProductSearchText(product);
    if (text.includes('iphone') || text.includes('apple')) return 'apple';
    if (text.includes('samsung')) return 'samsung';
    if (text.includes('xiaomi')) return 'xiaomi';
    if (text.includes('oppo')) return 'oppo';
    if (text.includes('vivo')) return 'vivo';
    if (text.includes('realme')) return 'realme';
    if (text.includes('nokia')) return 'nokia';
    return '';
};

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

const matchesPhoneUsage = (product, usage) => {
    if (!usage) return true;
    const text = getProductSearchText(product);
    const price = Number(product?.price || 0);
    if (usage === 'gaming') return !text.match(/gaming|snapdragon|rog|\d+gb/) || text.includes('gaming') || text.includes('snapdragon') || text.includes('rog') || text.includes('12gb') || text.includes('16gb');
    if (usage === 'chup-anh') return !text.match(/camera|mp|4k|chup anh/) || text.includes('camera') || text.includes('50mp') || text.includes('108mp') || text.includes('4k');
    if (usage === 'pin-trau') return !text.match(/mah|battery|pin/) || text.includes('5000mah') || text.includes('6000mah') || text.includes('battery') || text.includes('pin');
    if (usage === 'hoc-tap') return price > 0 ? price <= 10000000 : true;
    if (usage === 'van-phong') return price > 0 ? price <= 15000000 : true;
    if (usage === 'gia-re') return price > 0 ? price < 5000000 : true;
    if (usage === 'cao-cap') return price > 0 ? price > 15000000 : true;
    return true;
};

const matchesTextToken = (product, token) => {
    if (!token) return true;
    return getProductSearchText(product).includes(normalizeSearchText(token));
};

const matchesPhoneBattery = (product, battery) => {
    if (!battery) return true;
    const text = getProductSearchText(product);
    if (battery === '4000') return !text.match(/\d{4}mah/) || Number(text.match(/(\d{4})mah/)?.[1] || 0) >= 4000;
    if (battery === '5000') return !text.match(/\d{4}mah/) || Number(text.match(/(\d{4})mah/)?.[1] || 0) >= 5000;
    if (battery === 'sac-nhanh') return text.includes('fast charge') || text.includes('sac nhanh') || text.includes('quick charge') || text.includes('charging');
    return true;
};

const matchesPhoneCamera = (product, camera) => {
    if (!camera) return true;
    const text = getProductSearchText(product);
    if (!text.match(/camera|mp|4k|ois|chup anh|chong rung|stabilization/)) return true;
    if (camera === 'chup-anh-dep') return text.includes('camera') || text.includes('photo') || text.includes('chup anh');
    if (camera === '50mp') return text.includes('50mp') || text.includes('108mp') || text.includes('200mp');
    if (camera === '4k') return text.includes('4k');
    if (camera === 'chong-rung') return text.includes('ois') || text.includes('chong rung') || text.includes('stabilization');
    return true;
};

const inferLaptopBrand = (product) => {
    const explicitBrand = String(product?.brand || '').trim().toLowerCase();
    if (explicitBrand) return explicitBrand;
    const text = getProductSearchText(product);
    if (text.includes('macbook') || text.includes('apple')) return 'apple';
    if (text.includes('dell')) return 'dell';
    if (text.includes('hp ' ) || text.startsWith('hp')) return 'hp';
    if (text.includes('asus') || text.includes('rog') || text.includes('tuf')) return 'asus';
    if (text.includes('acer') || text.includes('nitro')) return 'acer';
    if (text.includes('lenovo') || text.includes('thinkpad') || text.includes('legion')) return 'lenovo';
    if (text.includes('msi')) return 'msi';
    if (text.includes('gigabyte')) return 'gigabyte';
    if (text.includes('lg') || text.includes('gram')) return 'lg';
    return '';
};

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

const matchesLaptopUsage = (product, usage) => {
    if (!usage) return true;
    const text = getProductSearchText(product);
    const price = Number(product?.price || 0);
    if (usage === 'gaming') return !text.match(/gaming|rtx|gtx|msi|rog|tuf|nitro|legion/) || text.match(/gaming|rtx|gtx|msi|rog|tuf|nitro|legion/);
    if (usage === 'do-hoa') return !text.match(/rtx|2k|2\.5k|3k|4k|creator|studio/) || text.match(/rtx|2k|2\.5k|3k|4k|creator|studio/);
    if (usage === 'van-phong') return price > 0 ? price <= 20000000 : true;
    if (usage === 'hoc-tap') return price > 0 ? price <= 15000000 : true;
    if (usage === 'lap-trinh') return text.includes('16gb') || text.includes('32gb') || text.includes('i5') || text.includes('i7') || text.includes('ryzen 5') || text.includes('ryzen 7');
    if (usage === 'mong-nhe') return !text.match(/ultrabook|lightweight|slim|gram|air/) || text.match(/ultrabook|lightweight|slim|gram|air/);
    if (usage === 'cao-cap') return price > 0 ? price >= 30000000 : true;
    if (usage === 'ai') return !text.match(/npu|ai pc|copilot|core ultra|ryzen ai/) || text.match(/npu|ai pc|copilot|core ultra|ryzen ai/);
    return true;
};

const matchesLaptopCpu = (product, cpu) => {
    if (!cpu) return true;
    const text = getProductSearchText(product);
    const aliases = {
        i3: ['i3', 'core i3'],
        i5: ['i5', 'core i5'],
        i7: ['i7', 'core i7'],
        i9: ['i9', 'core i9'],
        ryzen3: ['ryzen 3'],
        ryzen5: ['ryzen 5'],
        ryzen7: ['ryzen 7'],
        ryzen9: ['ryzen 9'],
        m1: ['m1'],
        m2: ['m2'],
        m3: ['m3'],
        m4: ['m4'],
    };
    return !text.match(/i3|i5|i7|i9|ryzen|m1|m2|m3|m4|core/) || aliases[cpu]?.some((item) => text.includes(item));
};

const matchesLaptopGpu = (product, gpu) => {
    if (!gpu) return true;
    const text = getProductSearchText(product);
    if (gpu === 'onboard') return !text.match(/rtx|gtx|iris xe|radeon|nvidia/);
    const aliases = {
        iris: ['iris xe'],
        radeon: ['radeon'],
        gtx: ['gtx'],
        rtx3050: ['rtx 3050', 'rtx3050'],
        rtx4050: ['rtx 4050', 'rtx4050'],
        rtx4060: ['rtx 4060', 'rtx4060'],
        rtx4070: ['rtx 4070', 'rtx4070'],
    };
    return !text.match(/rtx|gtx|iris xe|radeon|nvidia/) || aliases[gpu]?.some((item) => text.includes(item));
};

const matchesLaptopScreenSize = (product, size) => {
    if (!size) return true;
    const text = getProductSearchText(product);
    const match = text.match(/(\d{2}(?:\.\d)?)\s*(inch|")/);
    if (!match) return true;
    const inches = Number(match[1]);
    if (size === 'duoi-13') return inches < 13;
    if (size === '13-14') return inches >= 13 && inches <= 14;
    if (size === '15-16') return inches >= 15 && inches <= 16;
    if (size === 'tren-16') return inches > 16;
    return true;
};

const inferConfiguredBrand = (product, config) => {
    const explicitBrand = String(product?.brand || '').trim().toLowerCase();
    if (explicitBrand) return explicitBrand;
    const text = getProductSearchText(product);
    return Object.entries(config.brandAliases || {}).find(([, aliases]) => aliases.some((alias) => text.includes(alias)))?.[0] || '';
};

const matchesConfiguredPriceRange = (product, range, config) => {
    if (!range) return true;
    const priceRange = config.priceRanges?.[range];
    const price = Number(product?.price || 0);
    if (!priceRange || !Number.isFinite(price)) return true;
    return price >= priceRange[0] && price <= priceRange[1];
};

const matchesConfiguredOption = (product, group, value) => {
    if (!value || group.param.toLowerCase().includes('brand') || group.param.toLowerCase().includes('pricerange')) return true;
    const text = getProductSearchText(product);
    const option = group.options.find((item) => item.value === value);
    const aliases = [value, option?.label, option?.label?.replace(/\s+/g, '')]
        .filter(Boolean)
        .map(normalizeSearchText);
    const fieldValue = normalizeSearchText(product?.[group.param.replace(/^(tablet|watch|camera|headphone)/, '').replace(/^./, (char) => char.toLowerCase())] || '');
    if (fieldValue) return aliases.some((alias) => fieldValue.includes(alias));
    const groupHasAnyKnownToken = group.options.some((item) => {
        if (!item.value) return false;
        const label = normalizeSearchText(item.label || '');
        return text.includes(item.value) || text.includes(label);
    });
    return !groupHasAnyKnownToken || aliases.some((alias) => text.includes(alias));
};

const fallbackSidebarCategories = [
    { id: 1, name: 'Smartphone', slug: 'dien-thoai', productCount: 8 },
    { id: 2, name: 'Laptop', slug: 'laptop', productCount: 6 },
    { id: 5, name: 'Tablet', slug: 'tablet', productCount: 2 },
    { id: 8, name: 'Audio', slug: 'tai-nghe', productCount: 2 },
    { id: 6, name: 'Smartwatch', slug: 'dong-ho-thong-minh', productCount: 2 },
    { id: 7, name: 'Camera', slug: 'may-anh', productCount: 2 },
];

const hiddenSidebarCategorySlugs = ['phu-kien', 'gaming'];

const phoneFilterParams = ['brand', 'usage', 'priceRange', 'storage', 'ram', 'battery', 'camera'];
const laptopFilterParams = ['brand', 'usage', 'priceRange', 'cpu', 'ram', 'storage', 'gpu', 'screenSize', 'resolution'];

const phoneFilterGroups = [
    {
        key: 'brand',
        stateKey: 'phoneBrand',
        title: 'Hãng điện thoại',
        options: [
            { label: 'Tất cả', value: '' },
            { label: 'Apple', value: 'apple' },
            { label: 'Samsung', value: 'samsung' },
            { label: 'Xiaomi', value: 'xiaomi' },
            { label: 'OPPO', value: 'oppo' },
            { label: 'Vivo', value: 'vivo' },
            { label: 'Realme', value: 'realme' },
            { label: 'Nokia', value: 'nokia' },
        ],
    },
    {
        key: 'usage',
        stateKey: 'phoneUsage',
        title: 'Nhu cầu sử dụng',
        options: [
            { label: 'Tất cả', value: '' },
            { label: 'Điện thoại chơi game', value: 'gaming' },
            { label: 'Điện thoại chụp ảnh', value: 'chup-anh' },
            { label: 'Điện thoại pin trâu', value: 'pin-trau' },
            { label: 'Điện thoại học tập', value: 'hoc-tap' },
            { label: 'Điện thoại văn phòng', value: 'van-phong' },
            { label: 'Điện thoại giá rẻ', value: 'gia-re' },
            { label: 'Điện thoại cao cấp', value: 'cao-cap' },
        ],
    },
    {
        key: 'priceRange',
        stateKey: 'phonePriceRange',
        title: 'Khoảng giá',
        options: [
            { label: 'Dưới 3 triệu', value: 'duoi-3' },
            { label: 'Từ 3 - 7 triệu', value: '3-7' },
            { label: 'Từ 7 - 15 triệu', value: '7-15' },
            { label: 'Từ 15 - 25 triệu', value: '15-25' },
            { label: 'Trên 25 triệu', value: 'tren-25' },
        ],
    },
    {
        key: 'storage',
        stateKey: 'phoneStorage',
        title: 'Dung lượng bộ nhớ',
        options: ['64GB', '128GB', '256GB', '512GB', '1TB'].map((label) => ({ label, value: label.toLowerCase() })),
    },
    {
        key: 'ram',
        stateKey: 'phoneRam',
        title: 'RAM',
        options: ['4GB', '6GB', '8GB', '12GB', '16GB'].map((label) => ({ label, value: label.toLowerCase() })),
    },
    {
        key: 'battery',
        stateKey: 'phoneBattery',
        title: 'Pin',
        options: [
            { label: 'Từ 4000mAh', value: '4000' },
            { label: 'Từ 5000mAh', value: '5000' },
            { label: 'Sạc nhanh', value: 'sac-nhanh' },
        ],
    },
    {
        key: 'camera',
        stateKey: 'phoneCamera',
        title: 'Camera',
        options: [
            { label: 'Chụp ảnh đẹp', value: 'chup-anh-dep' },
            { label: 'Camera từ 50MP', value: '50mp' },
            { label: 'Quay video 4K', value: '4k' },
            { label: 'Chống rung', value: 'chong-rung' },
        ],
    },
];

const getPhoneFilterLabel = (key, value) => {
    const group = phoneFilterGroups.find((item) => item.key === key);
    return group?.options.find((option) => option.value === value)?.label || value;
};

const laptopFilterGroups = [
    {
        key: 'brand',
        title: 'Hãng máy',
        options: ['', 'Apple', 'Dell', 'HP', 'Asus', 'Acer', 'Lenovo', 'MSI', 'Gigabyte', 'LG'].map((label) => ({
            label: label || 'Tất cả',
            value: label.toLowerCase(),
        })),
    },
    {
        key: 'usage',
        title: 'Nhu cầu sử dụng',
        options: [
            { label: 'Tất cả', value: '' },
            { label: 'Laptop văn phòng', value: 'van-phong' },
            { label: 'Laptop học tập', value: 'hoc-tap' },
            { label: 'Laptop gaming', value: 'gaming' },
            { label: 'Laptop đồ họa', value: 'do-hoa' },
            { label: 'Laptop lập trình', value: 'lap-trinh' },
            { label: 'Laptop mỏng nhẹ', value: 'mong-nhe' },
            { label: 'Laptop cao cấp', value: 'cao-cap' },
            { label: 'Laptop AI', value: 'ai' },
        ],
    },
    {
        key: 'priceRange',
        title: 'Khoảng giá',
        options: [
            { label: 'Dưới 10 triệu', value: 'duoi-10' },
            { label: 'Từ 10 - 15 triệu', value: '10-15' },
            { label: 'Từ 15 - 20 triệu', value: '15-20' },
            { label: 'Từ 20 - 30 triệu', value: '20-30' },
            { label: 'Từ 30 - 50 triệu', value: '30-50' },
            { label: 'Trên 50 triệu', value: 'tren-50' },
        ],
    },
    {
        key: 'cpu',
        title: 'CPU',
        options: [
            ['Intel Core i3', 'i3'], ['Intel Core i5', 'i5'], ['Intel Core i7', 'i7'], ['Intel Core i9', 'i9'],
            ['AMD Ryzen 3', 'ryzen3'], ['AMD Ryzen 5', 'ryzen5'], ['AMD Ryzen 7', 'ryzen7'], ['AMD Ryzen 9', 'ryzen9'],
            ['Apple M1', 'm1'], ['Apple M2', 'm2'], ['Apple M3', 'm3'], ['Apple M4', 'm4'],
        ].map(([label, value]) => ({ label, value })),
    },
    { key: 'ram', title: 'Dung lượng RAM', options: ['8GB', '16GB', '32GB', '64GB'].map((label) => ({ label, value: label.toLowerCase() })) },
    { key: 'storage', title: 'Ổ cứng', options: [['SSD 256GB', '256gb'], ['SSD 512GB', '512gb'], ['SSD 1TB', '1tb'], ['SSD 2TB', '2tb']].map(([label, value]) => ({ label, value })) },
    {
        key: 'gpu',
        title: 'Card đồ họa',
        options: [
            ['Onboard', 'onboard'], ['Intel Iris Xe', 'iris'], ['AMD Radeon', 'radeon'], ['NVIDIA GTX', 'gtx'],
            ['NVIDIA RTX 3050', 'rtx3050'], ['NVIDIA RTX 4050', 'rtx4050'], ['NVIDIA RTX 4060', 'rtx4060'], ['NVIDIA RTX 4070', 'rtx4070'],
        ].map(([label, value]) => ({ label, value })),
    },
    {
        key: 'screenSize',
        title: 'Kích thước màn hình',
        options: [
            ['Dưới 13 inch', 'duoi-13'], ['13 - 14 inch', '13-14'], ['15 - 16 inch', '15-16'], ['Trên 16 inch', 'tren-16'],
        ].map(([label, value]) => ({ label, value })),
    },
    { key: 'resolution', title: 'Độ phân giải', options: ['Full HD', '2K', '2.5K', '3K', '4K', 'Retina'].map((label) => ({ label, value: slugifyCategory(label) })) },
];

const getLaptopFilterLabel = (key, value) => {
    const group = laptopFilterGroups.find((item) => item.key === key);
    return group?.options.find((option) => option.value === value)?.label || value;
};

const makeOptions = (items) => items.map((item) => Array.isArray(item)
    ? { label: item[0], value: item[1] }
    : { label: item, value: slugifyCategory(item) });

const categoryFilterConfigs = {
    tablet: {
        title: 'Bộ lọc tablet',
        clearLabel: 'Xóa bộ lọc tablet',
        emptyLabel: 'Không tìm thấy sản phẩm phù hợp',
        params: ['tabletBrand', 'tabletUsage', 'tabletPriceRange', 'tabletStorage', 'tabletRam', 'tabletScreenSize', 'tabletConnection'],
        brandParam: 'tabletBrand',
        priceParam: 'tabletPriceRange',
        brandAliases: {
            apple: ['ipad', 'apple'],
            samsung: ['galaxy tab', 'samsung'],
            xiaomi: ['xiaomi', 'pad'],
            lenovo: ['lenovo'],
            huawei: ['huawei'],
            oppo: ['oppo'],
        },
        priceRanges: {
            'duoi-5': [0, 5000000],
            '5-10': [5000000, 10000000],
            '10-15': [10000000, 15000000],
            '15-25': [15000000, 25000000],
            'tren-25': [25000000, Infinity],
        },
        groups: [
            { param: 'tabletBrand', title: 'Hãng tablet', options: [{ label: 'Tất cả', value: '' }, ...makeOptions(['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'Huawei', 'OPPO'])] },
            { param: 'tabletUsage', title: 'Nhu cầu sử dụng', options: [{ label: 'Tất cả', value: '' }, ...makeOptions([['Tablet học tập', 'hoc-tap'], ['Tablet giải trí', 'giai-tri'], ['Tablet chơi game', 'choi-game'], ['Tablet vẽ thiết kế', 've-thiet-ke'], ['Tablet làm việc', 'lam-viec'], ['Tablet cho trẻ em', 'tre-em'], ['Tablet cao cấp', 'cao-cap']])] },
            { param: 'tabletPriceRange', title: 'Khoảng giá', options: makeOptions([['Dưới 5 triệu', 'duoi-5'], ['Từ 5 - 10 triệu', '5-10'], ['Từ 10 - 15 triệu', '10-15'], ['Từ 15 - 25 triệu', '15-25'], ['Trên 25 triệu', 'tren-25']]) },
            { param: 'tabletStorage', title: 'Dung lượng bộ nhớ', options: makeOptions(['64GB', '128GB', '256GB', '512GB', '1TB']) },
            { param: 'tabletRam', title: 'RAM', options: makeOptions(['4GB', '6GB', '8GB', '12GB', '16GB']) },
            { param: 'tabletScreenSize', title: 'Kích thước màn hình', options: makeOptions([['Dưới 9 inch', 'duoi-9'], ['10 - 11 inch', '10-11'], ['12 inch trở lên', 'tu-12']]) },
            { param: 'tabletConnection', title: 'Kết nối', options: makeOptions(['WiFi', '4G', '5G']) },
        ],
    },
    'dong-ho-thong-minh': {
        title: 'Bộ lọc đồng hồ thông minh',
        clearLabel: 'Xóa bộ lọc đồng hồ thông minh',
        emptyLabel: 'Không tìm thấy sản phẩm phù hợp',
        params: ['watchBrand', 'watchUsage', 'watchPriceRange', 'watchSize', 'watchHealthFeature', 'watchBattery', 'watchConnectivity'],
        brandParam: 'watchBrand',
        priceParam: 'watchPriceRange',
        brandAliases: {
            apple: ['apple watch', 'apple'],
            samsung: ['galaxy watch', 'samsung'],
            xiaomi: ['xiaomi'],
            garmin: ['garmin'],
            huawei: ['huawei'],
            amazfit: ['amazfit'],
        },
        priceRanges: {
            'duoi-2': [0, 2000000],
            '2-5': [2000000, 5000000],
            '5-10': [5000000, 10000000],
            'tren-10': [10000000, Infinity],
        },
        groups: [
            { param: 'watchBrand', title: 'Hãng đồng hồ', options: [{ label: 'Tất cả', value: '' }, ...makeOptions(['Apple', 'Samsung', 'Xiaomi', 'Garmin', 'Huawei', 'Amazfit'])] },
            { param: 'watchUsage', title: 'Nhu cầu sử dụng', options: [{ label: 'Tất cả', value: '' }, ...makeOptions([['Đồng hồ thể thao', 'the-thao'], ['Đồng hồ theo dõi sức khỏe', 'suc-khoe'], ['Đồng hồ thời trang', 'thoi-trang'], ['Đồng hồ cho dân văn phòng', 'van-phong'], ['Đồng hồ cho chạy bộ', 'chay-bo'], ['Đồng hồ cho người mới dùng', 'moi-dung']])] },
            { param: 'watchPriceRange', title: 'Khoảng giá', options: makeOptions([['Dưới 2 triệu', 'duoi-2'], ['Từ 2 - 5 triệu', '2-5'], ['Từ 5 - 10 triệu', '5-10'], ['Trên 10 triệu', 'tren-10']]) },
            { param: 'watchSize', title: 'Kích thước mặt', options: makeOptions([['Dưới 40mm', 'duoi-40'], ['40 - 44mm', '40-44'], ['Trên 44mm', 'tren-44']]) },
            { param: 'watchHealthFeature', title: 'Tính năng sức khỏe', options: makeOptions([['Đo nhịp tim', 'nhip-tim'], ['Đo SpO2', 'spo2'], ['Theo dõi giấc ngủ', 'giac-ngu'], ['Đếm bước chân', 'buoc-chan'], ['ECG nếu có', 'ecg']]) },
            { param: 'watchBattery', title: 'Thời lượng pin', options: makeOptions([['1 - 3 ngày', '1-3'], ['4 - 7 ngày', '4-7'], ['Trên 7 ngày', 'tren-7']]) },
            { param: 'watchConnectivity', title: 'Kết nối / tương thích', options: makeOptions(['Android', 'iPhone', 'GPS', ['Nghe gọi Bluetooth', 'bluetooth-call'], 'eSIM']) },
        ],
    },
    'may-anh': {
        title: 'Bộ lọc máy ảnh',
        clearLabel: 'Xóa bộ lọc máy ảnh',
        emptyLabel: 'Không tìm thấy sản phẩm phù hợp',
        params: ['cameraBrand', 'cameraUsage', 'cameraPriceRange', 'cameraType', 'cameraResolution', 'cameraVideo', 'cameraLens'],
        brandParam: 'cameraBrand',
        priceParam: 'cameraPriceRange',
        brandAliases: {
            canon: ['canon', 'eos'],
            sony: ['sony', 'alpha', 'a7'],
            nikon: ['nikon'],
            fujifilm: ['fujifilm', 'fuji'],
            panasonic: ['panasonic', 'lumix'],
            leica: ['leica'],
        },
        priceRanges: {
            'duoi-10': [0, 10000000],
            '10-20': [10000000, 20000000],
            '20-40': [20000000, 40000000],
            'tren-40': [40000000, Infinity],
        },
        groups: [
            { param: 'cameraBrand', title: 'Hãng máy ảnh', options: [{ label: 'Tất cả', value: '' }, ...makeOptions(['Canon', 'Sony', 'Nikon', 'Fujifilm', 'Panasonic', 'Leica'])] },
            { param: 'cameraUsage', title: 'Nhu cầu sử dụng', options: [{ label: 'Tất cả', value: '' }, ...makeOptions([['Máy ảnh chụp du lịch', 'du-lich'], ['Máy ảnh chụp chân dung', 'chan-dung'], ['Máy ảnh quay vlog', 'vlog'], ['Máy ảnh quay video', 'video'], ['Máy ảnh chuyên nghiệp', 'chuyen-nghiep'], ['Máy ảnh cho người mới bắt đầu', 'moi-bat-dau']])] },
            { param: 'cameraPriceRange', title: 'Khoảng giá', options: makeOptions([['Dưới 10 triệu', 'duoi-10'], ['Từ 10 - 20 triệu', '10-20'], ['Từ 20 - 40 triệu', '20-40'], ['Trên 40 triệu', 'tren-40']]) },
            { param: 'cameraType', title: 'Loại máy', options: makeOptions(['Mirrorless', 'DSLR', 'Compact', 'Action Camera']) },
            { param: 'cameraResolution', title: 'Độ phân giải', options: makeOptions([['Dưới 20MP', 'duoi-20mp'], ['Từ 20MP - 30MP', '20-30mp'], ['Trên 30MP', 'tren-30mp']]) },
            { param: 'cameraVideo', title: 'Quay video', options: makeOptions(['Full HD', '4K', '6K', '8K']) },
            { param: 'cameraLens', title: 'Ống kính / lens', options: makeOptions([['Kit lens', 'kit-lens'], ['Lens rời', 'lens-roi'], 'Zoom', ['Góc rộng', 'goc-rong']]) },
        ],
    },
    'tai-nghe': {
        title: 'Bộ lọc tai nghe',
        clearLabel: 'Xóa bộ lọc tai nghe',
        emptyLabel: 'Không tìm thấy sản phẩm phù hợp',
        params: ['headphoneBrand', 'headphoneUsage', 'headphonePriceRange', 'headphoneType', 'headphoneConnection', 'headphoneFeature'],
        brandParam: 'headphoneBrand',
        priceParam: 'headphonePriceRange',
        brandAliases: {
            apple: ['airpods', 'apple'],
            sony: ['sony', 'wh-1000xm', 'wf-1000xm'],
            jbl: ['jbl'],
            samsung: ['galaxy buds', 'samsung'],
            xiaomi: ['xiaomi'],
            soundcore: ['soundcore'],
            logitech: ['logitech'],
            razer: ['razer'],
        },
        priceRanges: {
            'duoi-500': [0, 500000],
            '500-1': [500000, 1000000],
            '1-3': [1000000, 3000000],
            '3-5': [3000000, 5000000],
            'tren-5': [5000000, Infinity],
        },
        groups: [
            { param: 'headphoneBrand', title: 'Hãng tai nghe', options: [{ label: 'Tất cả', value: '' }, ...makeOptions(['Apple', 'Sony', 'JBL', 'Samsung', 'Xiaomi', 'Soundcore', 'Logitech', 'Razer'])] },
            { param: 'headphoneUsage', title: 'Nhu cầu sử dụng', options: [{ label: 'Tất cả', value: '' }, ...makeOptions([['Tai nghe chơi game', 'choi-game'], ['Tai nghe nghe nhạc', 'nghe-nhac'], ['Tai nghe học tập', 'hoc-tap'], ['Tai nghe làm việc', 'lam-viec'], ['Tai nghe thể thao', 'the-thao'], ['Tai nghe chống ồn', 'chong-on'], ['Tai nghe giá rẻ', 'gia-re'], ['Tai nghe cao cấp', 'cao-cap']])] },
            { param: 'headphonePriceRange', title: 'Khoảng giá', options: makeOptions([['Dưới 500 nghìn', 'duoi-500'], ['Từ 500 nghìn - 1 triệu', '500-1'], ['Từ 1 - 3 triệu', '1-3'], ['Từ 3 - 5 triệu', '3-5'], ['Trên 5 triệu', 'tren-5']]) },
            { param: 'headphoneType', title: 'Kiểu tai nghe', options: makeOptions(['In-ear', 'On-ear', 'Over-ear', 'True Wireless']) },
            { param: 'headphoneConnection', title: 'Kết nối', options: makeOptions([['Có dây', 'co-day'], 'Bluetooth', ['Wireless 2.4G', 'wireless-24g']]) },
            { param: 'headphoneFeature', title: 'Tính năng', options: makeOptions([['Chống ồn chủ động', 'chong-on-chu-dong'], ['Xuyên âm', 'xuyen-am'], ['Mic thoại', 'mic-thoai'], ['Pin trâu', 'pin-trau'], ['Âm bass mạnh', 'bass-manh'], ['Âm thanh Hi-Res', 'hi-res']]) },
        ],
    },
};

const extraCategoryFilterParams = Object.values(categoryFilterConfigs).flatMap((config) => config.params);

const getImmediateCatalog = () => {
    try {
        return productApi.getLocalCatalog?.() || [];
    } catch {
        return [];
    }
};

const getImmediateCategories = () => {
    try {
        return categoryApi.getLocalAll?.() || [];
    } catch {
        return [];
    }
};

const getPopularProducts = (items = []) => items
    .filter((product) => Number(product.stock || 0) > 0)
    .slice()
    .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    .slice(0, 4);

const getProductStats = (items = [], totalCount) => {
    const byId = {};
    items.forEach((product) => {
        if (product.categoryId == null) return;
        const id = String(product.categoryId);
        byId[id] = (byId[id] || 0) + 1;
    });
    return {
        totalProducts: totalCount || items.length,
        byId,
    };
};

const getHighestProductPrice = (items = []) => {
    const prices = items
        .map((product) => Number(product.price || 0))
        .filter((price) => Number.isFinite(price));
    const highestPrice = prices.length ? Math.max(...prices) : DEFAULT_MAX_PRICE;
    return highestPrice > 0 ? highestPrice : DEFAULT_MAX_PRICE;
};

const Shop = () => {
    const [products, setProducts] = useState(() => getImmediateCatalog().slice(0, 12));
    const [allProducts, setAllProducts] = useState(getImmediateCatalog);
    const [categories, setCategories] = useState(getImmediateCategories);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoryStats, setCategoryStats] = useState(() => getProductStats(getImmediateCatalog()));
    const [categoryQuery, setCategoryQuery] = useState('');
    const [categoriesExpanded, setCategoriesExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(() => Math.ceil(getImmediateCatalog().length / 12) || 1);
    const [loading, setLoading] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
    const [maxProductPrice, setMaxProductPrice] = useState(() => getHighestProductPrice(getImmediateCatalog()));
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [phoneBrand, setPhoneBrand] = useState('');
    const [phoneUsage, setPhoneUsage] = useState('');
    const [phonePriceRange, setPhonePriceRange] = useState('');
    const [phoneStorage, setPhoneStorage] = useState('');
    const [phoneRam, setPhoneRam] = useState('');
    const [phoneBattery, setPhoneBattery] = useState('');
    const [phoneCamera, setPhoneCamera] = useState('');
    const [laptopBrand, setLaptopBrand] = useState('');
    const [laptopUsage, setLaptopUsage] = useState('');
    const [laptopPriceRange, setLaptopPriceRange] = useState('');
    const [laptopCpu, setLaptopCpu] = useState('');
    const [laptopRam, setLaptopRam] = useState('');
    const [laptopStorage, setLaptopStorage] = useState('');
    const [laptopGpu, setLaptopGpu] = useState('');
    const [laptopScreenSize, setLaptopScreenSize] = useState('');
    const [laptopResolution, setLaptopResolution] = useState('');
    const [phoneFilterGroupsOpen, setPhoneFilterGroupsOpen] = useState({
        brand: true,
        usage: true,
        priceRange: true,
    });
    const [laptopFilterGroupsOpen, setLaptopFilterGroupsOpen] = useState({
        brand: true,
        usage: true,
        priceRange: true,
    });
    const [extraFilterGroupsOpen, setExtraFilterGroupsOpen] = useState({
        tabletBrand: true,
        tabletUsage: true,
        tabletPriceRange: true,
        watchBrand: true,
        watchUsage: true,
        watchPriceRange: true,
        cameraBrand: true,
        cameraUsage: true,
        cameraPriceRange: true,
        headphoneBrand: true,
        headphoneUsage: true,
        headphonePriceRange: true,
    });
    const [openFilterDropdown, setOpenFilterDropdown] = useState('');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [popularProducts, setPopularProducts] = useState(() => getPopularProducts(getImmediateCatalog()));
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const keyword = params.get('search') || params.get('keyword') || '';
    const categorySlug = params.get('category') || '';
    const categoryIdParam = params.get('categoryId') || '';
    const urlMinPrice = params.get('minPrice') || '';
    const urlMaxPrice = params.get('maxPrice') || '';
    const urlInStock = params.get('inStock') === 'true';
    const urlOffer = params.get('offer') || '';
    const urlSortBy = params.get('sort') || params.get('sortBy') || '';
    const urlPhoneFilters = {
        brand: params.get('brand') || '',
        usage: params.get('usage') || '',
        priceRange: params.get('priceRange') || '',
        storage: params.get('storage') || '',
        ram: params.get('ram') || '',
        battery: params.get('battery') || '',
        camera: params.get('camera') || '',
    };
    const urlLaptopFilters = {
        brand: params.get('brand') || '',
        usage: params.get('usage') || '',
        priceRange: params.get('priceRange') || '',
        cpu: params.get('cpu') || '',
        ram: params.get('ram') || '',
        storage: params.get('storage') || '',
        gpu: params.get('gpu') || '',
        screenSize: params.get('screenSize') || '',
        resolution: params.get('resolution') || '',
    };
    const sidebarCategories = categories.length ? categories : (categoriesLoading ? [] : fallbackSidebarCategories);
    const featuredSidebarProducts = popularProducts.length ? popularProducts.slice(0, 3) : fallbackFeaturedProducts;
    const getCategorySlug = (category) => category?.slug || categorySlugMap[category?.name] || slugifyCategory(getCategoryDisplayName(category?.name || ''));
    const activeCategory = sidebarCategories.find((category) => {
        const currentSlug = getCategorySlug(category);
        return (categorySlug && currentSlug === categorySlug) || (categoryIdParam && String(category.id) === categoryIdParam);
    });
    const activeCategoryId = activeCategory?.id ? String(activeCategory.id) : categoryIdParam;
    const activeCategoryName = activeCategory ? getCategoryDisplayName(activeCategory.name) : '';
    const activeCategorySlug = activeCategory ? getCategorySlug(activeCategory) : categorySlug;
    const activeCategoryDescription = activeCategorySlug
        ? categoryDescriptionMap[activeCategorySlug] || `Khám phá các sản phẩm ${activeCategoryName ? activeCategoryName.toLowerCase() : 'công nghệ'} mới nhất tại Electro`
        : '';
    const isPhoneCategory = activeCategorySlug === 'dien-thoai';
    const isLaptopCategory = activeCategorySlug === 'laptop';
    const activeExtraFilterConfig = categoryFilterConfigs[activeCategorySlug];
    const selectedExtraFilters = activeExtraFilterConfig
        ? Object.fromEntries(activeExtraFilterConfig.params.map((param) => [param, params.get(param) || '']))
        : {};
    const hasExtraFilters = Object.values(selectedExtraFilters).some(Boolean);
    const selectedPhoneFilters = {
        brand: phoneBrand,
        usage: phoneUsage,
        priceRange: phonePriceRange,
        storage: phoneStorage,
        ram: phoneRam,
        battery: phoneBattery,
        camera: phoneCamera,
    };
    const hasPhoneFilters = Object.values(selectedPhoneFilters).some(Boolean);
    const selectedLaptopFilters = {
        brand: laptopBrand,
        usage: laptopUsage,
        priceRange: laptopPriceRange,
        cpu: laptopCpu,
        ram: laptopRam,
        storage: laptopStorage,
        gpu: laptopGpu,
        screenSize: laptopScreenSize,
        resolution: laptopResolution,
    };
    const hasLaptopFilters = Object.values(selectedLaptopFilters).some(Boolean);
    const effectiveMaxPrice = maxProductPrice || DEFAULT_MAX_PRICE;
    const priceMarks = useMemo(() => {
        const marks = [0, 5000000, 10000000, 20000000];
        const lastMark = effectiveMaxPrice > DEFAULT_MAX_PRICE ? effectiveMaxPrice : DEFAULT_MAX_PRICE;
        return [...marks, lastMark];
    }, [effectiveMaxPrice]);

    const applyPhoneFilters = (items) => items.filter((product) => {
        if (!isPhoneCategory) return true;
        if (phoneBrand && inferPhoneBrand(product) !== phoneBrand) return false;
        if (!matchesPhonePriceRange(product, phonePriceRange)) return false;
        if (!matchesPhoneUsage(product, phoneUsage)) return false;
        const productText = getProductSearchText(product);
        if (phoneStorage && productText.match(/\b(64gb|128gb|256gb|512gb|1tb)\b/) && !matchesTextToken(product, phoneStorage)) return false;
        if (phoneRam && productText.match(/\b(4gb|6gb|8gb|12gb|16gb)\b/) && !matchesTextToken(product, phoneRam)) return false;
        if (!matchesPhoneBattery(product, phoneBattery)) return false;
        if (!matchesPhoneCamera(product, phoneCamera)) return false;
        return true;
    });

    const applyLaptopFilters = (items) => items.filter((product) => {
        if (!isLaptopCategory) return true;
        if (laptopBrand && inferLaptopBrand(product) !== laptopBrand) return false;
        if (!matchesLaptopPriceRange(product, laptopPriceRange)) return false;
        if (!matchesLaptopUsage(product, laptopUsage)) return false;
        if (!matchesLaptopCpu(product, laptopCpu)) return false;
        const productText = getProductSearchText(product);
        if (laptopRam && productText.match(/\b(8gb|16gb|32gb|64gb)\b/) && !matchesTextToken(product, laptopRam)) return false;
        if (laptopStorage && productText.match(/\b(256gb|512gb|1tb|2tb)\b/) && !matchesTextToken(product, laptopStorage)) return false;
        if (!matchesLaptopGpu(product, laptopGpu)) return false;
        if (!matchesLaptopScreenSize(product, laptopScreenSize)) return false;
        if (laptopResolution && productText.match(/full hd|2k|2\.5k|3k|4k|retina/) && !matchesTextToken(product, laptopResolution.replace('-', '.'))) return false;
        return true;
    });

    const applyConfiguredCategoryFilters = (items) => {
        if (!activeExtraFilterConfig) return items;
        return items.filter((product) => {
            const selectedBrand = selectedExtraFilters[activeExtraFilterConfig.brandParam];
            if (selectedBrand && inferConfiguredBrand(product, activeExtraFilterConfig) !== selectedBrand) return false;
            const selectedPriceRange = selectedExtraFilters[activeExtraFilterConfig.priceParam];
            if (!matchesConfiguredPriceRange(product, selectedPriceRange, activeExtraFilterConfig)) return false;
            return activeExtraFilterConfig.groups.every((group) => matchesConfiguredOption(product, group, selectedExtraFilters[group.param]));
        });
    };

    const recordRecentlyViewed = (product) => {
        const normalized = normalizeRecentProduct(product);
        if (!normalized?.id) return;

        const current = safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []);
        const withoutDup = Array.isArray(current) ? current.filter((p) => p?.id !== normalized.id) : [];
        const next = [normalized, ...withoutDup].slice(0, 6);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
        setRecentlyViewed(next);
    };

    // Initial load: categories, storefront catalog, recently viewed
    useEffect(() => {
        setPageMeta({
            title: `${t('Shop')} | Electro`,
            description: t('Shop meta description'),
        });

        const loadInitialData = async () => {
            const loadCats = async () => {
                try {
                    const response = await categoryApi.getAll();
                    const cats = response.data || [];
                    setCategories(cats);
                    
                    const statsById = {};
                    cats.forEach(c => {
                        if (c.productCount != null) {
                            statsById[String(c.id)] = c.productCount;
                        }
                    });

                    setCategoryStats({
                        totalProducts: cats.reduce((sum, c) => sum + (c.productCount || 0), 0),
                        byId: statsById
                    });
                } catch (error) {
                    console.error('Failed to load categories', error);
                } finally {
                    setCategoriesLoading(false);
                }
            };

            const loadRecent = () => {
                const recent = safeParseJson(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]', []);
                setRecentlyViewed(Array.isArray(recent) ? recent : []);
            };

            const loadCatalog = async () => {
                try {
                    const response = await productApi.getAll({ page: 1, pageSize: 1000 });
                    const nextProducts = response.data?.items || [];
                    setAllProducts(nextProducts);
                    setPopularProducts(getPopularProducts(nextProducts));
                    setCategoryStats(getProductStats(nextProducts, response.data?.totalCount));
                    setMaxProductPrice(getHighestProductPrice(nextProducts));
                } catch (error) {
                    console.error('Failed to load products catalog', error);
                }
            };

            await Promise.all([loadCats(), loadRecent(), loadCatalog()]);
        };

        loadInitialData();
    }, []);

    // Synchronize UI filters with URL params
    useEffect(() => {
        const nextMaxPrice = Math.min(parsePriceParam(urlMaxPrice, effectiveMaxPrice), effectiveMaxPrice);
        const nextMinPrice = Math.min(parsePriceParam(urlMinPrice, 0), nextMaxPrice);
        setMinPrice(nextMinPrice);
        setMaxPrice(nextMaxPrice);
        setInStockOnly(urlInStock);
        setSortBy(urlSortBy);
        setPhoneBrand(urlPhoneFilters.brand);
        setPhoneUsage(urlPhoneFilters.usage);
        setPhonePriceRange(urlPhoneFilters.priceRange);
        setPhoneStorage(urlPhoneFilters.storage);
        setPhoneRam(urlPhoneFilters.ram);
        setPhoneBattery(urlPhoneFilters.battery);
        setPhoneCamera(urlPhoneFilters.camera);
        setLaptopBrand(urlLaptopFilters.brand);
        setLaptopUsage(urlLaptopFilters.usage);
        setLaptopPriceRange(urlLaptopFilters.priceRange);
        setLaptopCpu(urlLaptopFilters.cpu);
        setLaptopRam(urlLaptopFilters.ram);
        setLaptopStorage(urlLaptopFilters.storage);
        setLaptopGpu(urlLaptopFilters.gpu);
        setLaptopScreenSize(urlLaptopFilters.screenSize);
        setLaptopResolution(urlLaptopFilters.resolution);
    }, [
        urlMinPrice,
        urlMaxPrice,
        urlInStock,
        urlSortBy,
        effectiveMaxPrice,
        urlPhoneFilters.brand,
        urlPhoneFilters.usage,
        urlPhoneFilters.priceRange,
        urlPhoneFilters.storage,
        urlPhoneFilters.ram,
        urlPhoneFilters.battery,
        urlPhoneFilters.camera,
        urlLaptopFilters.brand,
        urlLaptopFilters.usage,
        urlLaptopFilters.priceRange,
        urlLaptopFilters.cpu,
        urlLaptopFilters.ram,
        urlLaptopFilters.storage,
        urlLaptopFilters.gpu,
        urlLaptopFilters.screenSize,
        urlLaptopFilters.resolution,
    ]);

    // Load products when filters or page changes
    useEffect(() => {
        if (!allProducts) return;

        setLoading(true);

        let filteredProducts = allProducts.slice();
        const normalizedKeyword = normalizeSearchText(keyword);
        const minPriceValue = urlMinPrice ? Number(urlMinPrice) : null;
        const maxPriceValue = urlMaxPrice ? Number(urlMaxPrice) : null;

        if (normalizedKeyword) {
            filteredProducts = filteredProducts.filter((product) =>
                normalizeSearchText(getProductSearchText(product)).includes(normalizedKeyword)
            );
        }
        if (activeCategoryId) {
            filteredProducts = filteredProducts.filter((product) => String(product.categoryId) === String(activeCategoryId));
        }
        if (urlInStock) {
            filteredProducts = filteredProducts.filter((product) => Number(product.stock || 0) > 0);
        }
        if (urlOffer === 'coupon') {
            filteredProducts = filteredProducts.filter((product) => getAvailableCouponsForProduct(product, coupons).length > 0);
        } else if (urlOffer === 'new') {
            filteredProducts = filteredProducts.filter((product) => product.badge === 'New' || Number(product.id || 0) >= 20);
        } else if (urlOffer === 'sale') {
            filteredProducts = filteredProducts.filter((product) => product.badge === 'Sale' || Number(product.oldPrice || 0) > Number(product.price || 0));
        } else if (urlOffer === 'freeship') {
            filteredProducts = filteredProducts.filter((product) => Number(product.price || 0) >= 500000);
        }

        const pricesBeforePriceFilter = filteredProducts
            .map((product) => Number(product.price || 0))
            .filter((price) => Number.isFinite(price));
        const highestPrice = pricesBeforePriceFilter.length ? Math.max(...pricesBeforePriceFilter) : DEFAULT_MAX_PRICE;
        setMaxProductPrice(highestPrice > 0 ? highestPrice : DEFAULT_MAX_PRICE);

        if (minPriceValue !== null && Number.isFinite(minPriceValue)) {
            filteredProducts = filteredProducts.filter((product) => Number(product.price || 0) >= minPriceValue);
        }
        if (maxPriceValue !== null && Number.isFinite(maxPriceValue)) {
            filteredProducts = filteredProducts.filter((product) => Number(product.price || 0) <= maxPriceValue);
        }

        if (activeExtraFilterConfig) {
            filteredProducts = applyConfiguredCategoryFilters(filteredProducts);
        } else if (isLaptopCategory) {
            filteredProducts = applyLaptopFilters(filteredProducts);
        } else if (isPhoneCategory) {
            filteredProducts = applyPhoneFilters(filteredProducts);
        }

        if (urlSortBy === 'price_asc') {
            filteredProducts = filteredProducts.slice().sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        } else if (urlSortBy === 'price_desc') {
            filteredProducts = filteredProducts.slice().sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        } else if (urlSortBy === 'name_asc') {
            filteredProducts = filteredProducts.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        } else if (urlSortBy === 'name_desc') {
            filteredProducts = filteredProducts.slice().sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
        }

        setProducts(filteredProducts.slice((page - 1) * 12, page * 12));
        setTotalPages(Math.ceil(filteredProducts.length / 12) || 1);
        setLoading(false);
    }, [allProducts, keyword, activeCategoryId, urlMinPrice, urlMaxPrice, urlInStock, urlOffer, urlSortBy, page, isPhoneCategory, isLaptopCategory, activeCategorySlug, location.search, phoneBrand, phoneUsage, phonePriceRange, phoneStorage, phoneRam, phoneBattery, phoneCamera, laptopBrand, laptopUsage, laptopPriceRange, laptopCpu, laptopRam, laptopStorage, laptopGpu, laptopScreenSize, laptopResolution]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [keyword, activeCategoryId, categorySlug, urlMinPrice, urlMaxPrice, urlInStock, urlOffer, urlSortBy, phoneBrand, phoneUsage, phonePriceRange, phoneStorage, phoneRam, phoneBattery, phoneCamera, laptopBrand, laptopUsage, laptopPriceRange, laptopCpu, laptopRam, laptopStorage, laptopGpu, laptopScreenSize, laptopResolution]);

    const handleCategoryChange = (value) => {
        const nextParams = new URLSearchParams(location.search);
        if (value) {
            nextParams.set('category', value);
        } else {
            nextParams.delete('category');
        }
        nextParams.delete('categoryId');
        if (value !== 'dien-thoai') {
            phoneFilterParams.forEach((param) => nextParams.delete(param));
        }
        if (value !== 'laptop') {
            laptopFilterParams.forEach((param) => nextParams.delete(param));
        }
        if (!categoryFilterConfigs[value]) {
            extraCategoryFilterParams.forEach((param) => nextParams.delete(param));
        } else {
            extraCategoryFilterParams
                .filter((param) => !categoryFilterConfigs[value].params.includes(param))
                .forEach((param) => nextParams.delete(param));
        }
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const getCategoryCount = (category) => categoryStats.byId[String(category.id)] || category.productCount || 0;

    const handleKeywordSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nextKeyword = String(formData.get('keyword') || '').trim();
        const nextParams = new URLSearchParams(location.search);
        nextParams.delete('keyword');
        if (nextKeyword) nextParams.set('search', nextKeyword);
        else nextParams.delete('search');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const handleStockFilter = (checked) => {
        setInStockOnly(checked);
        const nextParams = new URLSearchParams(location.search);
        if (checked) nextParams.set('inStock', 'true');
        else nextParams.delete('inStock');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const handleOfferFilter = (value) => {
        const nextParams = new URLSearchParams(location.search);
        if (value) nextParams.set('offer', value);
        else nextParams.delete('offer');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
        setOpenFilterDropdown('');
    };

    const handleStatusFilter = (value) => {
        handleStockFilter(value === 'in-stock');
        setOpenFilterDropdown('');
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        const nextParams = new URLSearchParams(location.search);
        if (value) nextParams.set('sort', value);
        else nextParams.delete('sort');
        nextParams.delete('sortBy');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const updatePhoneFilter = (param, value) => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('category', 'dien-thoai');
        nextParams.delete('categoryId');
        if (value) nextParams.set(param, value);
        else nextParams.delete(param);
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const clearPhoneFilters = () => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('category', 'dien-thoai');
        phoneFilterParams.forEach((param) => nextParams.delete(param));
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const togglePhoneFilterGroup = (key) => {
        setPhoneFilterGroupsOpen((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    const updateLaptopFilter = (param, value) => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('category', 'laptop');
        nextParams.delete('categoryId');
        if (value) nextParams.set(param, value);
        else nextParams.delete(param);
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const clearLaptopFilters = () => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('category', 'laptop');
        laptopFilterParams.forEach((param) => nextParams.delete(param));
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const toggleLaptopFilterGroup = (key) => {
        setLaptopFilterGroupsOpen((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    const updateExtraCategoryFilter = (param, value) => {
        if (!activeExtraFilterConfig) return;
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('category', activeCategorySlug);
        nextParams.delete('categoryId');
        if (value) nextParams.set(param, value);
        else nextParams.delete(param);
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const clearExtraCategoryFilters = () => {
        if (!activeExtraFilterConfig) return;
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('category', activeCategorySlug);
        activeExtraFilterConfig.params.forEach((param) => nextParams.delete(param));
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const toggleExtraFilterGroup = (key) => {
        setExtraFilterGroupsOpen((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    const updatePriceParams = (nextMinPrice, nextMaxPrice) => {
        const nextParams = new URLSearchParams(location.search);
        if (nextMinPrice > 0) nextParams.set('minPrice', String(nextMinPrice));
        else nextParams.delete('minPrice');
        if (nextMaxPrice < effectiveMaxPrice) nextParams.set('maxPrice', String(nextMaxPrice));
        else nextParams.delete('maxPrice');
        if (inStockOnly) nextParams.set('inStock', 'true');
        else nextParams.delete('inStock');
        if (sortBy) nextParams.set('sort', sortBy);
        else nextParams.delete('sort');
        nextParams.delete('sortBy');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`, {
            replace: true,
            preventScrollReset: true,
        });
    };

    const handlePricePreset = (option) => {
        const nextMinPrice = option.min ?? 0;
        const nextMaxPrice = option.max ?? effectiveMaxPrice;
        setMinPrice(nextMinPrice);
        setMaxPrice(nextMaxPrice);
        updatePriceParams(nextMinPrice, nextMaxPrice);
        setOpenFilterDropdown('');
    };

    const clearSelectedFiltersKeepCategory = () => {
        const nextParams = new URLSearchParams(location.search);
        const currentCategory = activeCategorySlug || '';
        nextParams.delete('categoryId');
        nextParams.delete('minPrice');
        nextParams.delete('maxPrice');
        nextParams.delete('inStock');
        nextParams.delete('offer');
        nextParams.delete('sortBy');
        nextParams.delete('sort');
        phoneFilterParams.forEach((param) => nextParams.delete(param));
        laptopFilterParams.forEach((param) => nextParams.delete(param));
        extraCategoryFilterParams.forEach((param) => nextParams.delete(param));
        if (currentCategory) nextParams.set('category', currentCategory);
        else nextParams.delete('category');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
        setOpenFilterDropdown('');
    };

    const handleClearFilters = () => {
        const nextParams = new URLSearchParams(location.search);
        nextParams.delete('categoryId');
        nextParams.delete('category');
        nextParams.delete('minPrice');
        nextParams.delete('maxPrice');
        nextParams.delete('inStock');
        nextParams.delete('sortBy');
        nextParams.delete('sort');
        navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
    };

    const handleMinPriceRange = (value) => {
        const nextMinPrice = Math.min(parsePriceParam(value, 0), maxPrice);
        setMinPrice(nextMinPrice);
        updatePriceParams(nextMinPrice, maxPrice);
    };

    const handleMaxPriceRange = (value) => {
        const nextMaxPrice = Math.max(parsePriceParam(value, effectiveMaxPrice), minPrice);
        setMaxPrice(nextMaxPrice);
        updatePriceParams(minPrice, nextMaxPrice);
    };

    const handleResetPrice = () => {
        setMinPrice(0);
        setMaxPrice(effectiveMaxPrice);
        updatePriceParams(0, effectiveMaxPrice);
    };

    const filterCategories = sidebarCategories
        .filter((c) => c.id !== '')
        .filter((c) => !hiddenSidebarCategorySlugs.includes(getCategorySlug(c)))
        .filter((c) => ['dien-thoai', 'laptop', 'tablet', 'dong-ho-thong-minh', 'may-anh', 'tai-nghe'].includes(getCategorySlug(c)));

    const currentFilterGroups = isPhoneCategory
        ? phoneFilterGroups.map((group) => ({
            key: group.key,
            title: group.title,
            options: group.options,
            value: selectedPhoneFilters[group.key],
            onSelect: (value) => updatePhoneFilter(group.key, value),
        }))
        : isLaptopCategory
            ? laptopFilterGroups.map((group) => ({
                key: group.key,
                title: group.title,
                options: group.options,
                value: selectedLaptopFilters[group.key],
                onSelect: (value) => updateLaptopFilter(group.key, value),
            }))
            : activeExtraFilterConfig
                ? activeExtraFilterConfig.groups.map((group) => ({
                    key: group.param,
                    title: group.title,
                    options: group.options,
                    value: selectedExtraFilters[group.param],
                    onSelect: (value) => updateExtraCategoryFilter(group.param, value),
                }))
                : [
                    {
                        key: 'price',
                        title: 'Khoảng giá',
                        options: commonPriceOptions.map((option, index) => ({
                            label: option.label,
                            value: index === 0 ? '' : `${option.min ?? ''}-${option.max ?? ''}`,
                            raw: option,
                        })),
                        value: `${urlMinPrice || ''}-${urlMaxPrice || ''}`,
                        onSelect: (_, option) => handlePricePreset(option.raw),
                    },
                    {
                        key: 'status',
                        title: 'Tình trạng',
                        options: statusFilterOptions,
                        value: urlInStock ? 'in-stock' : '',
                        onSelect: handleStatusFilter,
                    },
                    {
                        key: 'offer',
                        title: 'Ưu đãi',
                        options: offerFilterOptions,
                        value: urlOffer,
                        onSelect: handleOfferFilter,
                    },
                ];

    const renderFilterDropdown = (group, mobile = false) => {
        const dropdownKey = `${mobile ? 'mobile' : 'desktop'}-${group.key}`;
        const isOpen = openFilterDropdown === dropdownKey;
        const selectedOption = group.options.find((option) => String(option.value) === String(group.value));
        const buttonLabel = selectedOption?.value ? `${group.title}: ${selectedOption.label}` : group.title;

        return (
            <div className="shop-filter-dropdown" key={dropdownKey}>
                <button
                    type="button"
                    className={`shop-filter-button ${selectedOption?.value ? 'is-active' : ''}`}
                    onClick={() => setOpenFilterDropdown(isOpen ? '' : dropdownKey)}
                    aria-expanded={isOpen}
                >
                    <span>{buttonLabel}</span>
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                </button>
                {isOpen && (
                    <div className="shop-filter-menu">
                        {group.options.map((option) => {
                            const isActive = String(group.value || '') === String(option.value || '');
                            return (
                                <button
                                    type="button"
                                    className={`shop-filter-option ${isActive ? 'is-active' : ''}`}
                                    key={`${group.key}-${option.value || 'all'}`}
                                    onClick={() => {
                                        group.onSelect(option.value, option);
                                        setOpenFilterDropdown('');
                                    }}
                                >
                                    <i className={`${isActive ? 'fas fa-check' : 'far fa-circle'} me-2`}></i>
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const activeFilterChips = [
        activeCategoryName && {
            key: 'category',
            label: activeCategoryName,
            onRemove: () => handleCategoryChange(''),
        },
        keyword && {
            key: 'keyword',
            label: `"${keyword}"`,
            onRemove: () => {
                const nextParams = new URLSearchParams(location.search);
                nextParams.delete('search');
                nextParams.delete('keyword');
                navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
            },
        },
        ...(
            isPhoneCategory
                ? Object.entries(selectedPhoneFilters)
                    .filter(([, value]) => value)
                    .map(([key, value]) => ({ key: `phone-${key}`, label: getPhoneFilterLabel(key, value), onRemove: () => updatePhoneFilter(key, '') }))
                : []
        ),
        ...(
            isLaptopCategory
                ? Object.entries(selectedLaptopFilters)
                    .filter(([, value]) => value)
                    .map(([key, value]) => ({ key: `laptop-${key}`, label: getLaptopFilterLabel(key, value), onRemove: () => updateLaptopFilter(key, '') }))
                : []
        ),
        ...(
            activeExtraFilterConfig
                ? Object.entries(selectedExtraFilters)
                    .filter(([, value]) => value)
                    .map(([key, value]) => {
                        const group = activeExtraFilterConfig.groups.find((item) => item.param === key);
                        return {
                            key: `extra-${key}`,
                            label: group?.options.find((option) => option.value === value)?.label || value,
                            onRemove: () => updateExtraCategoryFilter(key, ''),
                        };
                    })
                : []
        ),
        (urlMinPrice || urlMaxPrice) && {
            key: 'price',
            label: `${formatVnd(urlMinPrice || 0)} - ${formatVnd(urlMaxPrice || effectiveMaxPrice)}`,
            onRemove: handleResetPrice,
        },
        urlInStock && {
            key: 'stock',
            label: 'Còn hàng',
            onRemove: () => handleStatusFilter(''),
        },
        urlOffer && {
            key: 'offer',
            label: offerFilterOptions.find((option) => option.value === urlOffer)?.label || urlOffer,
            onRemove: () => handleOfferFilter(''),
        },
    ].filter(Boolean);

    return (
        <>
            <PageHero title={t('Shop Page')} current={t('Shop')} />

            <div className="container-fluid px-0">
                <div className="row g-0">
                    <div className="col-6 col-md-4 col-lg-2 border-start border-end wow fadeInUp" data-wow-delay="0.1s">
                        <div className="p-4">
                            <div className="d-inline-flex align-items-center">
                                <i className="fa fa-sync-alt fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">{t('Free Return')}</h6>
                                    <p className="mb-0">{t('30 days money back guarantee!')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.2s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fab fa-telegram-plane fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">{t('Free Shipping')}</h6>
                                    <p className="mb-0">{t('Free shipping on all order')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.3s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-life-ring fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">{t('Support 24/7')}</h6>
                                    <p className="mb-0">{t('We support online 24 hrs a day')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.4s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-credit-card fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">{t('Receive Gift Card')}</h6>
                                    <p className="mb-0">{t('Recieve gift all over oder $50')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.5s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-lock fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">{t('Secure Payment')}</h6>
                                    <p className="mb-0">{t('We Value Your Security')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2 border-end wow fadeInUp" data-wow-delay="0.6s">
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-blog fa-2x text-primary"></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">{t('Online Service')}</h6>
                                    <p className="mb-0">{t('Free return products in 30 days')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid bg-light py-5">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.2s">
                            <Link to="/shop" className="d-flex align-items-center justify-content-between border bg-white rounded p-4">
                                <div>
                                    <p className="text-muted mb-3">Tìm camera tốt nhất dành cho bạn!</p>
                                    <h3 className="text-primary">{t('Smart Camera')}</h3>
                                    <h1 className="display-3 text-secondary mb-0">40% <span className="text-primary fw-normal">Giảm</span></h1>
                                </div>
                                <img src="/electro/img/product-1.png" className="img-fluid" alt={t('Product')} />
                            </Link>
                        </div>
                        <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s">
                            <Link to="/shop" className="d-flex align-items-center justify-content-between border bg-white rounded p-4">
                                <div>
                                    <p className="text-muted mb-3">Tìm điện thoại tốt nhất dành cho bạn!</p>
                                    <h3 className="text-primary">{t('SmartPhone')}</h3>
                                    <h1 className="display-3 text-secondary mb-0">30% <span className="text-primary fw-normal">Giảm</span></h1>
                                </div>
                                <img src="/electro/img/product-2.png" className="img-fluid" alt={t('Product')} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid shop py-5">
                <div className="container py-5">
                    <div className="row g-4">
                        <div className="d-none">
                            <div className="border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.05s">
                                <h4 className="mb-3">Tìm kiếm sản phẩm</h4>
                                <form onSubmit={handleKeywordSubmit}>
                                    <div className="input-group">
                                        <input
                                            type="search"
                                            name="keyword"
                                            className="form-control"
                                            placeholder={activeCategoryName ? 'Tìm kiếm trong danh mục' : 'Tìm sản phẩm'}
                                            defaultValue={keyword}
                                        />
                                        <button type="submit" className="btn btn-primary" aria-label="Tìm kiếm sản phẩm">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="shop-category-filter border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.1s">
                                <button
                                    type="button"
                                    className="shop-category-toggle"
                                    onClick={() => setCategoriesExpanded((value) => !value)}
                                    aria-expanded={categoriesExpanded}
                                >
                                    <span>Danh mục sản phẩm</span>
                                    <i className={`fas fa-chevron-${categoriesExpanded ? 'up' : 'down'}`}></i>
                                </button>
                                {categoriesExpanded && (
                                    <ul className="list-unstyled categories-bars shop-category-list mb-0">
                                        {categoriesLoading && Array.from({ length: 6 }).map((_, index) => (
                                            <li key={`category-loading-${index}`}>
                                                <div className="categories-bars-item placeholder-glow">
                                                    <span className="placeholder col-8"></span>
                                                    <span className="placeholder col-2"></span>
                                                </div>
                                            </li>
                                        ))}
                                        {!categoriesLoading && (
                                            <li>
                                                <div className={`categories-bars-item shop-category-item ${!activeCategorySlug ? 'is-active' : ''}`}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 text-start text-decoration-none"
                                                        onClick={() => handleCategoryChange('')}
                                                    >
                                                        <i className={`${!activeCategorySlug ? 'fas fa-check' : 'fas fa-list'} me-2`}></i>Tất cả
                                                    </button>
                                                    {categoryStats.totalProducts > 0 && <span>({categoryStats.totalProducts})</span>}
                                                </div>
                                            </li>
                                        )}
                                        {!categoriesLoading && sidebarCategories
                                            .filter((c) => c.name.toLowerCase().includes(categoryQuery.toLowerCase()))
                                            .filter((c) => c.id !== '')
                                            .filter((c) => !hiddenSidebarCategorySlugs.includes(getCategorySlug(c)))
                                            .map((category) => {
                                                const categorySlugValue = getCategorySlug(category);
                                                const isActive = activeCategorySlug === categorySlugValue;
                                                const count = getCategoryCount(category);
                                                return (
                                                    <li key={category.id}>
                                                        <div className={`categories-bars-item shop-category-item ${isActive ? 'is-active' : ''}`}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0 text-start text-decoration-none"
                                                                onClick={() => handleCategoryChange(categorySlugValue)}
                                                            >
                                                                <i className={`${isActive ? 'fas fa-check' : 'far fa-circle'} me-2`}></i>{getCategoryDisplayName(category.name)}
                                                            </button>
                                                            {count > 0 && <span>({count})</span>}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                )}
                            </div>
                            {isPhoneCategory && (
                                <div className="phone-filter-box border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.15s">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h4 className="mb-0">Bộ lọc điện thoại</h4>
                                    </div>
                                    <div className="phone-filter-groups">
                                        {phoneFilterGroups.map((group) => (
                                            <div className="phone-filter-group" key={group.key}>
                                                <button
                                                    type="button"
                                                    className="phone-filter-group-toggle"
                                                    onClick={() => togglePhoneFilterGroup(group.key)}
                                                    aria-expanded={!!phoneFilterGroupsOpen[group.key]}
                                                >
                                                    <span>{group.title}</span>
                                                    <i className={`fas fa-chevron-${phoneFilterGroupsOpen[group.key] ? 'up' : 'down'}`}></i>
                                                </button>
                                                {phoneFilterGroupsOpen[group.key] && (
                                                    <div className="phone-filter-options">
                                                        {group.options.map((option) => {
                                                            const currentValue = selectedPhoneFilters[group.key];
                                                            const isActive = currentValue === option.value || (!currentValue && option.value === '');
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className={`phone-filter-option ${isActive ? 'is-active' : ''}`}
                                                                    key={`${group.key}-${option.value || 'all'}`}
                                                                    onClick={() => updatePhoneFilter(group.key, option.value)}
                                                                >
                                                                    <i className={`${isActive ? 'fas fa-check' : 'far fa-circle'} me-2`}></i>
                                                                    {option.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {hasPhoneFilters && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary rounded-pill w-100 mt-3"
                                            onClick={clearPhoneFilters}
                                        >
                                            Xóa bộ lọc điện thoại
                                        </button>
                                    )}
                                </div>
                            )}
                            {isLaptopCategory && (
                                <div className="phone-filter-box border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.15s">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h4 className="mb-0">Bộ lọc laptop</h4>
                                    </div>
                                    <div className="phone-filter-groups">
                                        {laptopFilterGroups.map((group) => (
                                            <div className="phone-filter-group" key={group.key}>
                                                <button
                                                    type="button"
                                                    className="phone-filter-group-toggle"
                                                    onClick={() => toggleLaptopFilterGroup(group.key)}
                                                    aria-expanded={!!laptopFilterGroupsOpen[group.key]}
                                                >
                                                    <span>{group.title}</span>
                                                    <i className={`fas fa-chevron-${laptopFilterGroupsOpen[group.key] ? 'up' : 'down'}`}></i>
                                                </button>
                                                {laptopFilterGroupsOpen[group.key] && (
                                                    <div className="phone-filter-options">
                                                        {group.options.map((option) => {
                                                            const currentValue = selectedLaptopFilters[group.key];
                                                            const isActive = currentValue === option.value || (!currentValue && option.value === '');
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className={`phone-filter-option ${isActive ? 'is-active' : ''}`}
                                                                    key={`${group.key}-${option.value || 'all'}`}
                                                                    onClick={() => updateLaptopFilter(group.key, option.value)}
                                                                >
                                                                    <i className={`${isActive ? 'fas fa-check' : 'far fa-circle'} me-2`}></i>
                                                                    {option.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {hasLaptopFilters && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary rounded-pill w-100 mt-3"
                                            onClick={clearLaptopFilters}
                                        >
                                            Xóa bộ lọc laptop
                                        </button>
                                    )}
                                </div>
                            )}
                            {activeExtraFilterConfig && (
                                <div className="phone-filter-box border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.15s">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h4 className="mb-0">{activeExtraFilterConfig.title}</h4>
                                    </div>
                                    <div className="phone-filter-groups">
                                        {activeExtraFilterConfig.groups.map((group) => (
                                            <div className="phone-filter-group" key={group.param}>
                                                <button
                                                    type="button"
                                                    className="phone-filter-group-toggle"
                                                    onClick={() => toggleExtraFilterGroup(group.param)}
                                                    aria-expanded={extraFilterGroupsOpen[group.param] !== false}
                                                >
                                                    <span>{group.title}</span>
                                                    <i className={`fas fa-chevron-${extraFilterGroupsOpen[group.param] !== false ? 'up' : 'down'}`}></i>
                                                </button>
                                                {extraFilterGroupsOpen[group.param] !== false && (
                                                    <div className="phone-filter-options">
                                                        {group.options.map((option) => {
                                                            const currentValue = selectedExtraFilters[group.param];
                                                            const isActive = currentValue === option.value || (!currentValue && option.value === '');
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className={`phone-filter-option ${isActive ? 'is-active' : ''}`}
                                                                    key={`${group.param}-${option.value || 'all'}`}
                                                                    onClick={() => updateExtraCategoryFilter(group.param, option.value)}
                                                                >
                                                                    <i className={`${isActive ? 'fas fa-check' : 'far fa-circle'} me-2`}></i>
                                                                    {option.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {hasExtraFilters && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary rounded-pill w-100 mt-3"
                                            onClick={clearExtraCategoryFilters}
                                        >
                                            {activeExtraFilterConfig.clearLabel}
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.28s">
                                <h4 className="mb-3">Tình trạng</h4>
                                <div className="additional-product">
                                    <label className="additional-product-item d-flex align-items-center text-dark mb-0">
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={inStockOnly}
                                            onChange={(event) => handleStockFilter(event.target.checked)}
                                        />
                                        Còn hàng
                                    </label>
                                </div>
                            </div>
                            <div className="bg-primary rounded position-relative wow fadeInUp" data-wow-delay="0.3s">
                                <img src="/electro/img/product-banner-3.jpg" className="img-fluid w-100 rounded" alt="Sale headphones" />
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded text-center" style={{ background: 'rgba(255, 255, 255, 0.35)' }}>
                                    <h2 className="text-primary fw-bold mb-2">GIẢM GIÁ</h2>
                                    <h5 className="text-secondary mb-3">Giảm đến 50%</h5>
                                    <Link to="/shop" className="btn btn-primary rounded-pill py-2 px-4">Mua ngay</Link>
                                </div>
                            </div>
                            <div className="featured-product border rounded p-4 mb-4 mt-4 wow fadeInUp" data-wow-delay="0.35s">
                                <h4 className="mb-3">Sản phẩm nổi bật</h4>
                                <div className="d-flex flex-column gap-3">
                                    {featuredSidebarProducts.map((p) => {
                                        const name = getCategoryDisplayName(p.category?.name || p.name || 'Điện thoại thông minh');
                                        const oldPrice = p.oldPrice || Number(p.price || 2.99) * 1.38;
                                        const fallbackItem = String(p.id).startsWith('featured-');
                                        return (
                                            <Link
                                                key={p.id}
                                                to={fallbackItem ? `/shop?keyword=${encodeURIComponent(name)}` : `/product/${p.id}`}
                                                className="featured-product-item text-decoration-none"
                                                onClick={() => !fallbackItem && recordRecentlyViewed(p)}
                                            >
                                                <img src={resolveProductImage(p)} alt={name} className="img-fluid me-3" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                                                <div>
                                                    <h6 className="mb-1 text-dark">{name}</h6>
                                                    <div className="text-primary small">
                                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star text-muted"></i>
                                                    </div>
                                                    <span className="fw-bold text-dark">{Number(p.price || 2.99).toFixed(2)} $</span>
                                                    <del className="text-danger ms-2">{Number(oldPrice).toFixed(2)} $</del>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                                <Link to="/shop" className="btn btn-primary rounded-pill w-100 py-3 mt-4">Xem thêm</Link>
                            </div>
                            <div className="product-tags border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.4s">
                                <h4 className="mb-3 text-uppercase">THẺ SẢN PHẨM</h4>
                                <div className="product-tags-items bg-light rounded p-3">
                                    {productTags.map((tag) => (
                                        <Link key={tag} to={`/shop?keyword=${encodeURIComponent(tag)}`} className="border rounded py-1 px-2 me-1 mb-2">
                                            {tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="shop-filter-surface bg-white border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.05s">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                    <h4 className="mb-0">Danh mục sản phẩm</h4>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary rounded-pill d-lg-none"
                                        onClick={() => setMobileFiltersOpen((value) => !value)}
                                        aria-expanded={mobileFiltersOpen}
                                    >
                                        <i className="fas fa-sliders-h me-2"></i>Bộ lọc
                                    </button>
                                </div>

                                <div className="shop-category-chip-row">
                                    <button
                                        type="button"
                                        className={`shop-category-chip ${!activeCategorySlug ? 'is-active' : ''}`}
                                        onClick={() => handleCategoryChange('')}
                                    >
                                        Tất cả
                                        {categoryStats.totalProducts > 0 && <span>{categoryStats.totalProducts}</span>}
                                    </button>
                                    {filterCategories.map((category) => {
                                        const categorySlugValue = getCategorySlug(category);
                                        const isActive = activeCategorySlug === categorySlugValue;
                                        const count = getCategoryCount(category);
                                        return (
                                            <button
                                                type="button"
                                                className={`shop-category-chip ${isActive ? 'is-active' : ''}`}
                                                key={category.id}
                                                onClick={() => handleCategoryChange(categorySlugValue)}
                                            >
                                                {getCategoryDisplayName(category.name)}
                                                {count > 0 && <span>{count}</span>}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="shop-filter-bar d-none d-lg-flex">
                                    {currentFilterGroups.map((group) => renderFilterDropdown(group))}
                                    <button type="button" className="shop-clear-filter-button" onClick={clearSelectedFiltersKeepCategory}>
                                        Xóa bộ lọc
                                    </button>
                                </div>

                                {mobileFiltersOpen && (
                                    <div className="shop-mobile-filter-panel d-lg-none">
                                        <div className="shop-mobile-filter-title">Bộ lọc</div>
                                        <div className="shop-mobile-filter-title small text-muted">Danh mục sản phẩm</div>
                                        <div className="shop-category-chip-row">
                                            <button
                                                type="button"
                                                className={`shop-category-chip ${!activeCategorySlug ? 'is-active' : ''}`}
                                                onClick={() => handleCategoryChange('')}
                                            >
                                                Tất cả
                                            </button>
                                            {filterCategories.map((category) => {
                                                const categorySlugValue = getCategorySlug(category);
                                                return (
                                                    <button
                                                        type="button"
                                                        className={`shop-category-chip ${activeCategorySlug === categorySlugValue ? 'is-active' : ''}`}
                                                        key={`mobile-${category.id}`}
                                                        onClick={() => handleCategoryChange(categorySlugValue)}
                                                    >
                                                        {getCategoryDisplayName(category.name)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="shop-filter-bar is-mobile">
                                            {currentFilterGroups.map((group) => renderFilterDropdown(group, true))}
                                        </div>
                                        <div className="d-flex gap-2 mt-3">
                                            <button type="button" className="btn btn-outline-primary rounded-pill flex-fill" onClick={clearSelectedFiltersKeepCategory}>
                                                Xóa bộ lọc
                                            </button>
                                            <button type="button" className="btn btn-primary rounded-pill flex-fill" onClick={() => setMobileFiltersOpen(false)}>
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeFilterChips.length > 0 && (
                                    <div className="shop-active-filter-row">
                                        {activeFilterChips.map((chip) => (
                                            <button type="button" className="shop-active-filter-chip" key={chip.key} onClick={chip.onRemove}>
                                                {chip.label} <span>×</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {activeCategoryName && (
                                <div className="bg-white border rounded p-4 mb-4 wow fadeInUp" data-wow-delay="0.05s">
                                    <div className="text-muted small mb-2">Danh mục sản phẩm</div>
                                    <h2 className="h3 mb-2">{activeCategoryName}</h2>
                                    <p className="mb-0 text-muted">{activeCategoryDescription}</p>
                                </div>
                            )}
                            <div className="row g-4 justify-content-between mb-4 wow fadeInUp" data-wow-delay="0.1s">
                                <div className="col-md-6 d-flex align-items-center gap-2 flex-wrap shop-result-heading">
                                    <h4 className="mb-0">{keyword ? `Kết quả tìm kiếm: ${keyword}` : (activeCategoryName ? ((isPhoneCategory || isLaptopCategory) ? activeCategoryName : `Danh mục: ${activeCategoryName}`) : 'Tất cả sản phẩm')}</h4>
                                    {/* Active filter indicators */}
                                    {keyword && (
                                        <span className="badge bg-primary rounded-pill">
                                            <i className="fas fa-search me-1"></i>"{keyword}"
                                        </span>
                                    )}
                                    {activeCategoryName && (
                                        <button
                                            type="button"
                                            className="badge bg-secondary rounded-pill border-0"
                                            onClick={() => handleCategoryChange('')}
                                        >
                                            <i className="fas fa-tag me-1"></i>
                                            {activeCategoryName} ×
                                        </button>
                                    )}
                                    {isPhoneCategory && Object.entries(selectedPhoneFilters)
                                        .filter(([, value]) => value)
                                        .map(([key, value]) => (
                                            <button
                                                type="button"
                                                className="badge bg-primary rounded-pill border-0"
                                                key={`phone-chip-${key}`}
                                                onClick={() => updatePhoneFilter(key, '')}
                                            >
                                                {getPhoneFilterLabel(key, value)} ×
                                            </button>
                                        ))}
                                    {isLaptopCategory && Object.entries(selectedLaptopFilters)
                                        .filter(([, value]) => value)
                                        .map(([key, value]) => (
                                            <button
                                                type="button"
                                                className="badge bg-primary rounded-pill border-0"
                                                key={`laptop-chip-${key}`}
                                                onClick={() => updateLaptopFilter(key, '')}
                                            >
                                                {getLaptopFilterLabel(key, value)} ×
                                            </button>
                                        ))}
                                    {activeExtraFilterConfig && Object.entries(selectedExtraFilters)
                                        .filter(([, value]) => value)
                                        .map(([key, value]) => {
                                            const group = activeExtraFilterConfig.groups.find((item) => item.param === key);
                                            const label = group?.options.find((option) => option.value === value)?.label || value;
                                            return (
                                                <button
                                                    type="button"
                                                    className="badge bg-primary rounded-pill border-0"
                                                    key={`extra-chip-${key}`}
                                                    onClick={() => updateExtraCategoryFilter(key, '')}
                                                >
                                                    {label} ×
                                                </button>
                                            );
                                        })}
                                    {(urlMinPrice || urlMaxPrice) && (
                                        <span className="badge bg-info text-dark rounded-pill">
                                            <i className="fas fa-dollar-sign me-1"></i>
                                            {formatVnd(urlMinPrice || 0)} - {formatVnd(urlMaxPrice || effectiveMaxPrice)}
                                        </span>
                                    )}
                                    {urlInStock && (
                                        <span className="badge bg-success rounded-pill">
                                            <i className="fas fa-check me-1"></i>Còn hàng
                                        </span>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <select
                                        className="form-select text-dark border rounded-pill p-3"
                                        value={urlSortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                    >
                                        <option value="">Sắp xếp</option>
                                        <option value="name_desc">Mới nhất</option>
                                        <option value="price_asc">Giá thấp đến cao</option>
                                        <option value="price_desc">Giá cao đến thấp</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="row g-4">
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <div key={idx} className="col-md-6 col-lg-6 col-xl-4">
                                            <div className="border rounded p-3 bg-white">
                                                <div className="placeholder-glow">
                                                    <div className="placeholder w-100" style={{ height: 180 }}></div>
                                                    <div className="placeholder col-7 mt-3"></div>
                                                    <div className="placeholder col-4"></div>
                                                    <div className="placeholder col-6 mt-2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="row g-4">
                                        {products.length === 0 && (
                                            <div className="col-12">
                                                <div className="alert alert-light border">
                                                    {isPhoneCategory ? 'Không tìm thấy điện thoại phù hợp' : (isLaptopCategory ? 'Không tìm thấy laptop phù hợp' : (activeExtraFilterConfig ? activeExtraFilterConfig.emptyLabel : (activeCategoryName ? 'Không tìm thấy sản phẩm trong danh mục này' : t('No products found'))))}
                                                </div>
                                            </div>
                                        )}
                                        {products.map((product) => (
                                            <motion.div
                                                key={product.id}
                                                className="col-md-6 col-lg-6 col-xl-4"
                                                variants={fadeInUp}
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={motionViewport}
                                                transition={{ ...motionTransition, duration: 1.05 }}
                                                onClickCapture={() => recordRecentlyViewed(product)}
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="pagination d-flex justify-content-center align-items-center gap-1 mt-5 flex-wrap">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                                disabled={page === 1}
                                                onClick={() => setPage(p => p - 1)}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                                .reduce((acc, p, idx, arr) => {
                                                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((p, idx) =>
                                                    p === '...' ? (
                                                        <span key={`ellipsis-${idx}`} className="px-1 text-muted">…</span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            className={`btn btn-sm rounded-pill px-3 ${p === page ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                            onClick={() => setPage(p)}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )
                                            }
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                            <span className="text-muted small ms-2">
                                                Trang {page}/{totalPages}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Shop;
