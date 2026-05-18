import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../contexts/CompareContext';
import { useCart } from '../../contexts/CartContext';
import PageHero from '../../components/store/PageHero';
import { getProductSpecs } from './ProductDetail';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';

const normalizeText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const compareSpecFields = {
    phone: [
        ['Kích thước màn hình'],
        ['Công nghệ màn hình'],
        ['Camera sau'],
        ['Camera trước'],
        ['Chipset'],
        ['Bộ nhớ trong', 'Ổ cứng'],
        ['RAM', 'Dung lượng RAM'],
        ['SIM', 'Thẻ SIM'],
        ['Hệ điều hành'],
        ['Độ phân giải màn hình', 'Độ phân giải'],
        ['Tính năng màn hình'],
        ['Loại CPU'],
        ['Pin'],
        ['Sạc nhanh'],
    ],
    laptop: [
        ['Loại card đồ họa'],
        ['Dung lượng RAM', 'RAM'],
        ['Loại RAM'],
        ['Ổ cứng', 'Bộ nhớ trong'],
        ['Kích thước màn hình'],
        ['Công nghệ màn hình'],
        ['Pin'],
        ['Hệ điều hành'],
        ['Độ phân giải màn hình', 'Độ phân giải'],
        ['Loại CPU'],
        ['Cổng giao tiếp', 'Cổng kết nối'],
    ],
    tablet: [
        ['Kích thước màn hình'],
        ['Công nghệ màn hình'],
        ['Camera sau'],
        ['Camera trước'],
        ['Chipset'],
        ['Bộ nhớ trong', 'Ổ cứng'],
        ['Pin'],
        ['Hệ điều hành'],
        ['Độ phân giải màn hình', 'Độ phân giải'],
        ['Tính năng màn hình'],
        ['Loại CPU'],
        ['Tương thích'],
    ],
    headphone: [
        ['Kích thước'],
        ['Trọng lượng'],
        ['Công nghệ âm thanh'],
        ['Micro'],
        ['Cổng kết nối'],
        ['Thời lượng sử dụng pin', 'Thời lượng pin'],
        ['Phương thức điều khiển'],
        ['Tính năng khác'],
        ['Hãng sản xuất', 'Thương hiệu'],
    ],
    smartwatch: [
        ['Công nghệ màn hình'],
        ['Kích thước màn hình'],
        ['Đường kính mặt'],
        ['Kích thước cổ tay phù hợp'],
        ['Nghe gọi'],
        ['Tiện ích sức khỏe', 'Tính năng sức khỏe'],
        ['Tương thích'],
        ['Thời lượng pin', 'Pin'],
        ['Hãng sản xuất', 'Thương hiệu'],
    ],
    camera: [
        ['Dòng camera'],
        ['Độ phân giải'],
        ['Góc ống kính'],
        ['Thông số màn hình'],
        ['Kết nối không dây'],
        ['Thông số pin'],
        ['Chống rung'],
        ['Tính năng khác'],
        ['Hãng sản xuất', 'Thương hiệu'],
        ['Tiện ích'],
    ],
    default: [
        ['Hãng sản xuất', 'Thương hiệu'],
        ['Loại sản phẩm'],
        ['Kết nối'],
        ['Chất liệu'],
        ['Bảo hành'],
    ],
};

const getComparableSpecs = (products, getCompareCategoryKey) => {
    const categoryKey = getCompareCategoryKey(products[0]);
    const fields = compareSpecFields[categoryKey] || compareSpecFields.default;
    const specMaps = products.map((product) => {
        const entries = getProductSpecs(product, { includeExcluded: true });
        return entries.reduce((map, spec) => {
            map.set(normalizeText(spec.label), spec.value);
            return map;
        }, new Map());
    });

    return fields.map((aliases) => ({
        label: aliases[0],
        values: specMaps.map((map) => {
            const alias = aliases.find((item) => map.has(normalizeText(item)));
            return alias ? map.get(normalizeText(alias)) : '—';
        }),
    }));
};

const Compare = () => {
    const { compareItems, removeFromCompare, getCompareCategoryKey } = useCompare();
    const { addItem } = useCart();
    const products = compareItems.slice(0, 2);
    const comparableSpecs = useMemo(
        () => (products.length >= 2 ? getComparableSpecs(products, getCompareCategoryKey) : []),
        [products, getCompareCategoryKey]
    );

    useEffect(() => {
        setPageMeta({
            title: 'So sánh sản phẩm | Electro',
            description: t('Compare meta description'),
        });
    }, []);

    return (
        <>
            <PageHero title="So sánh sản phẩm" current="So sánh" />
            <div className="container-fluid py-5">
                <div className="container py-5">
                    {products.length < 2 ? (
                        <div className="compare-empty-state">
                            <i className="fas fa-exchange-alt"></i>
                            <h4>Bạn chưa chọn đủ sản phẩm để so sánh.</h4>
                            <Link to="/shop" className="btn btn-primary rounded-pill py-3 px-5">
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    ) : (
                        <div className="compare-page-card">
                            <h3>So sánh sản phẩm</h3>
                            <div className="compare-table-wrap">
                                <table className="compare-spec-table">
                                    <thead>
                                        <tr>
                                            <th>Thông số</th>
                                            {products.map((product) => (
                                                <th key={product.id}>
                                                    <div className="compare-product-head">
                                                        <button type="button" className="compare-remove-top" onClick={() => removeFromCompare(product.id)}>
                                                            Xóa khỏi so sánh
                                                        </button>
                                                        <img src={resolveProductImage(product)} alt={product.name || 'Sản phẩm'} />
                                                        <h5>{product.name || product.title}</h5>
                                                        <strong>{formatCurrency(product.price)}</strong>
                                                        <div className="compare-product-actions">
                                                            <Link to={`/product/${product.id}`} className="btn btn-outline-primary btn-sm">Xem chi tiết</Link>
                                                            <button type="button" className="btn btn-primary btn-sm" disabled={product.stock <= 0} onClick={() => addItem(product, 1)}>
                                                                Thêm vào giỏ hàng
                                                            </button>
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparableSpecs.map((row) => (
                                            <tr key={row.label}>
                                                <th>{row.label}</th>
                                                {row.values.map((value, index) => (
                                                    <td key={`${row.label}-${products[index].id}`}>{value}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Compare;
