import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../contexts/CompareContext';
import { useCart } from '../../contexts/CartContext';
import PageHero from '../../components/store/PageHero';
import { formatCurrency, resolveProductImage, setPageMeta, t } from '../../utils/store';

const Compare = () => {
    const { compareItems, removeFromCompare } = useCompare();
    const { addItem } = useCart();

    useEffect(() => {
        setPageMeta({
            title: `${t('Compare')} | Electro`,
            description: t('Compare meta description'),
        });
    }, []);

    return (
        <>
            <PageHero title={t('Compare Products')} current={t('Compare')} />
            <div className="container-fluid py-5">
                <div className="container py-5">
                    {compareItems.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-exchange-alt fa-4x text-muted mb-4"></i>
                            <h4 className="mb-4 text-muted">{t('No products to compare')}</h4>
                            <Link to="/shop" className="btn btn-primary rounded-pill py-3 px-5">
                                {t('Continue Shopping')}
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive border rounded">
                            <table className="table table-bordered text-center align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '15%', minWidth: '150px' }} className="align-middle fw-bold">
                                            {t('Features')}
                                        </th>
                                        {compareItems.map(item => (
                                            <th key={item.id} style={{ width: `${85 / compareItems.length}%`, minWidth: '200px' }} className="p-4 position-relative">
                                                <button 
                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" 
                                                    onClick={() => removeFromCompare(item.id)}
                                                    title={t('Remove')}
                                                    style={{ width: '30px', height: '30px', padding: '0' }}
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                                <img 
                                                    src={resolveProductImage(item)} 
                                                    alt={item.name} 
                                                    className="img-fluid mb-3 object-fit-contain" 
                                                    style={{ height: '150px' }} 
                                                />
                                                <h5 className="mb-0 text-dark">{item.name}</h5>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="fw-bold bg-light">{t('Price')}</td>
                                        {compareItems.map(item => (
                                            <td key={item.id} className="text-primary fw-bold h5 mb-0">
                                                {formatCurrency(item.price)}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="fw-bold bg-light">{t('Category')}</td>
                                        {compareItems.map(item => (
                                            <td key={item.id}>{t(item.category?.name || 'Electronics')}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="fw-bold bg-light">{t('Availability')}</td>
                                        {compareItems.map(item => (
                                            <td key={item.id}>
                                                {item.stock > 0 
                                                    ? <span className="badge bg-success rounded-pill px-3 py-2">{t('In Stock')} ({item.stock})</span> 
                                                    : <span className="badge bg-danger rounded-pill px-3 py-2">{t('Out of Stock')}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="fw-bold bg-light">{t('Description')}</td>
                                        {compareItems.map(item => (
                                            <td key={item.id} className="text-muted small">
                                                {item.description || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="fw-bold bg-light">{t('Action')}</td>
                                        {compareItems.map(item => (
                                            <td key={item.id}>
                                                <button
                                                    className="btn btn-primary rounded-pill py-2 px-4"
                                                    disabled={item.stock <= 0}
                                                    onClick={() => addItem(item, 1)}
                                                >
                                                    <i className="fa fa-shopping-cart me-2"></i> {t('Add To Cart')}
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Compare;
