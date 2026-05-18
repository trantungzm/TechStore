import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import { formatCurrency, resolveProductImage } from '../utils/store';

const CompareContext = createContext(null);
const COMPARE_STORAGE_KEY = 'compareProducts';
const MAX_COMPARE_ITEMS = 2;

const normalizeText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const getCompareCategoryKey = (product) => {
    const text = normalizeText(`${product?.category?.name || ''} ${product?.categoryName || ''} ${product?.category || ''} ${product?.categorySlug || ''} ${product?.name || ''}`);
    if (product?.categoryId === 1 || text.includes('dien thoai') || text.includes('smartphone') || text.includes('phone') || text.includes('iphone') || text.includes('galaxy')) return 'phone';
    if (product?.categoryId === 2 || text.includes('laptop') || text.includes('macbook') || text.includes('thinkpad') || text.includes('vivobook')) return 'laptop';
    if (product?.categoryId === 5 || text.includes('tablet') || text.includes('may tinh bang') || text.includes('ipad')) return 'tablet';
    if (product?.categoryId === 8 || text.includes('tai nghe') || text.includes('headphone') || text.includes('earphone') || text.includes('airpods') || text.includes('bose')) return 'headphone';
    if (product?.categoryId === 6 || text.includes('dong ho thong minh') || text.includes('smartwatch') || text.includes('watch')) return 'smartwatch';
    if (product?.categoryId === 7 || text.includes('may anh') || text.includes('camera') || text.includes('canon') || text.includes('sony a7')) return 'camera';
    return product?.categoryId ? `category-${product.categoryId}` : 'default';
};

const getCategoryLabel = (product) => (
    product?.category?.name || product?.categoryName || 'Sản phẩm chính hãng'
);

const readCompareItems = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter((item) => item?.id).slice(0, MAX_COMPARE_ITEMS) : [];
    } catch {
        return [];
    }
};

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState(() => readCompareItems());
    const [isCompareBarVisible, setIsCompareBarVisible] = useState(false);
    const [isCompareBarCollapsed, setIsCompareBarCollapsed] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [compareNotice, setCompareNotice] = useState('');
    const [catalog, setCatalog] = useState(() => {
        try { return productApi.getLocalCatalog?.() || []; } catch { return []; }
    });
    const navigate = useNavigate();
    const location = useLocation();
    const isCompareRoute = location.pathname === '/compare';

    useEffect(() => {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
    }, [compareItems]);

    useEffect(() => {
        let active = true;
        const loadCatalog = async () => {
            try {
                const response = await productApi.getAll({ page: 1, pageSize: 1000 });
                const products = response.data?.items || [];
                if (active && products.length) setCatalog(products);
            } catch {
                // local catalog remains available as fallback
            }
        };
        loadCatalog();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!compareNotice) return undefined;
        const timeout = setTimeout(() => setCompareNotice(''), 2400);
        return () => clearTimeout(timeout);
    }, [compareNotice]);

    useEffect(() => {
        if (compareItems.length === 0 || isCompareRoute) {
            setIsCompareBarVisible(false);
            setPickerOpen(false);
        }
    }, [compareItems.length, isCompareRoute]);

    const addToCompare = (product) => {
        if (!product?.id) return false;
        setIsCompareBarVisible(true);
        let added = false;
        setCompareItems((current) => {
            if (current.some((item) => item.id === product.id)) {
                setCompareNotice('Sản phẩm đã có trong danh sách so sánh');
                return current;
            }
            if (current.length > 0 && getCompareCategoryKey(current[0]) !== getCompareCategoryKey(product)) {
                setCompareNotice('Chỉ có thể so sánh các sản phẩm cùng danh mục');
                return current;
            }
            if (current.length >= MAX_COMPARE_ITEMS) {
                setCompareNotice('Chỉ có thể so sánh tối đa 2 sản phẩm');
                return current;
            }
            added = true;
            return [...current, product];
        });
        setIsCompareBarCollapsed(false);
        setPickerOpen(false);
        if (added) setCompareNotice('Đã thêm sản phẩm vào so sánh');
        return added;
    };

    const toggleCompare = (product) => addToCompare(product);

    const removeFromCompare = (productId) => {
        setCompareItems((current) => {
            const nextItems = current.filter((item) => item.id !== productId);
            if (nextItems.length === 0) {
                setIsCompareBarVisible(false);
                setPickerOpen(false);
            }
            return nextItems;
        });
    };

    const clearCompare = () => {
        setCompareItems([]);
        setIsCompareBarVisible(false);
        setPickerOpen(false);
    };

    const isInCompare = (productId) => compareItems.some((item) => item.id === productId);

    const sameCategoryProducts = useMemo(() => {
        if (!compareItems.length) return [];
        const categoryKey = getCompareCategoryKey(compareItems[0]);
        const selectedIds = new Set(compareItems.map((item) => item.id));
        return catalog
            .filter((product) => product?.id && !selectedIds.has(product.id) && getCompareCategoryKey(product) === categoryKey)
            .slice(0, 8);
    }, [catalog, compareItems]);

    const goToCompare = () => {
        if (compareItems.length < 2) {
            setCompareNotice('Vui lòng chọn thêm 1 sản phẩm để so sánh');
            return;
        }
        setPickerOpen(false);
        navigate('/compare');
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const value = {
        compareItems,
        compareCount: compareItems.length,
        addToCompare,
        toggleCompare,
        isInCompare,
        removeFromCompare,
        clearCompare,
        getCompareCategoryKey,
    };

    return (
        <CompareContext.Provider value={value}>
            {children}
            {isCompareBarVisible && !isCompareRoute && compareItems.length > 0 && (
                <div className={`compare-floating-bar ${isCompareBarCollapsed ? 'is-collapsed' : ''}`}>
                    {compareNotice && <div className="compare-floating-notice">{compareNotice}</div>}
                    {isCompareBarCollapsed ? (
                        <button type="button" className="compare-collapsed-button" onClick={() => setIsCompareBarCollapsed(false)}>
                            So sánh sản phẩm ({compareItems.length})
                        </button>
                    ) : (
                        <div className="compare-floating-inner">
                            <div className="compare-slot-list">
                                {compareItems.map((item) => (
                                    <div className="compare-slot is-product" key={item.id}>
                                        <button type="button" className="compare-slot-remove" aria-label="Xóa khỏi so sánh" onClick={() => removeFromCompare(item.id)}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                        <img src={resolveProductImage(item)} alt={item.name || 'Sản phẩm'} />
                                        <div>
                                            <strong>{item.name || item.title}</strong>
                                            <span>{getCategoryLabel(item)}</span>
                                        </div>
                                    </div>
                                ))}

                                {compareItems.length < MAX_COMPARE_ITEMS && (
                                    <div className="compare-picker-wrap">
                                        <button type="button" className="compare-slot compare-slot-empty" onClick={() => setPickerOpen((open) => !open)}>
                                            <i className="fas fa-plus"></i>
                                            <span>Chọn sản phẩm so sánh</span>
                                        </button>
                                        {pickerOpen && (
                                            <div className="compare-picker-popover">
                                                <h5>Chọn sản phẩm so sánh</h5>
                                                {sameCategoryProducts.length > 0 ? (
                                                    <div className="compare-picker-list">
                                                        {sameCategoryProducts.map((product) => (
                                                            <div className="compare-picker-item" key={product.id}>
                                                                <img src={resolveProductImage(product)} alt={product.name || 'Sản phẩm'} />
                                                                <div>
                                                                    <strong>{product.name || product.title}</strong>
                                                                    <span>{formatCurrency(product.price)}</span>
                                                                </div>
                                                                <button type="button" onClick={() => addToCompare(product)}>Chọn</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p>Không có sản phẩm cùng danh mục để chọn.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="compare-floating-actions">
                                <span>Đã chọn {compareItems.length} sản phẩm</span>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setIsCompareBarCollapsed(true)}>Thu gọn</button>
                                <button type="button" className="btn btn-primary" disabled={compareItems.length < 2} onClick={goToCompare}>So sánh</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within CompareProvider');
    }
    return context;
};
