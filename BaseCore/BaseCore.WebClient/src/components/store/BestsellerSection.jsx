import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { t } from '../../utils/store';

const serviceItems = [
    { icon: 'fa fa-sync-alt', title: 'Free Return', text: '30 days money back guarantee!' },
    { icon: 'fab fa-telegram-plane', title: 'Free Shipping', text: 'Free shipping on all order' },
    { icon: 'fas fa-life-ring', title: 'Support 24/7', text: 'We support online 24 hrs a day' },
    { icon: 'fas fa-credit-card', title: 'Receive Gift Card', text: 'Recieve gift all over oder $50' },
    { icon: 'fas fa-lock', title: 'Secure Payment', text: 'We Value Your Security' },
    { icon: 'fas fa-blog', title: 'Online Service', text: 'Free return products in 30 days' },
];

const offers = [
    { title: 'Smart Camera', subtitle: 'Tìm camera tốt nhất dành cho bạn!', discount: '40%', imageUrl: '/electro/img/product-1.png' },
    { title: 'SmartPhone', subtitle: 'Tìm điện thoại tốt nhất dành cho bạn!', discount: '30%', imageUrl: '/electro/img/product-2.png' },
];

const banners = [
    {
        imageUrl: '/electro/img/product-banner.jpg',
        className: 'bg-primary rounded position-relative',
        overlay: 'rgba(255, 255, 255, 0.5)',
        title: <>EOS Rebel <br /><span>T7i Kit</span></>,
        price: '$899.99',
        buttonClass: 'btn-primary',
    },
    {
        imageUrl: '/electro/img/product-banner-2.jpg',
        className: 'text-center bg-primary rounded position-relative',
        overlay: 'rgba(242, 139, 0, 0.5)',
        title: <>GIẢM GIÁ</>,
        price: 'Giảm đến 50%',
        buttonClass: 'btn-secondary align-self-center',
    },
];

const BestsellerSection = ({ products }) => (
    <>
        <div className="container-fluid px-0">
            <div className="row g-0">
                {serviceItems.map((item, index) => (
                    <div className="col-6 col-md-4 col-lg-2 border-start border-end wow fadeInUp" data-wow-delay={`${0.1 + index * 0.1}s`} key={item.title}>
                        <div className="p-4">
                            <div className="d-flex align-items-center">
                                <i className={`${item.icon} fa-2x text-primary`}></i>
                                <div className="ms-4">
                                    <h6 className="text-uppercase mb-2">{t(item.title)}</h6>
                                    <p className="mb-0">{t(item.text)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="container-fluid bg-light py-5">
            <div className="container">
                <div className="row g-4">
                    {offers.map((offer, index) => (
                        <div className="col-lg-6 wow fadeInUp" data-wow-delay={`${0.2 + index * 0.1}s`} key={offer.title}>
                            <Link to="/shop" className="electro-offer-card d-flex align-items-center justify-content-between border bg-white rounded p-4 h-100">
                                <div>
                                    <p className="text-muted mb-3">{offer.subtitle}</p>
                                    <h3 className="text-primary">{t(offer.title)}</h3>
                                    <h1 className="display-3 text-secondary mb-0">{offer.discount} <span className="text-primary fw-normal">Giảm</span></h1>
                                </div>
                                <img src={offer.imageUrl} className="img-fluid" alt={offer.title} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="container-fluid products py-5">
            <div className="container pb-5">
                <div className="row g-4">
                    <div className="col-12 wow fadeInUp" data-wow-delay="0.1s">
                        <div className="text-center mx-auto" style={{ maxWidth: 700 }}>
                            <h4 className="text-primary">{t('Bestseller Products')}</h4>
                            <h1 className="display-5 mb-4">{t('Most Popular Items')}</h1>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="products-mini electro-scroll-row">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container-fluid py-5">
            <div className="container pb-5">
                <div className="row g-4">
                    {banners.map((banner, index) => (
                        <div className={`col-lg-6 wow ${index === 0 ? 'fadeInLeft' : 'fadeInRight'}`} data-wow-delay={`${0.1 + index * 0.1}s`} key={banner.imageUrl}>
                            <Link to="/shop">
                                <div className={banner.className}>
                                    <img src={banner.imageUrl} className="img-fluid w-100 rounded" alt="Product banner" />
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center rounded p-4" style={{ background: banner.overlay }}>
                                        <h3 className={`${index === 0 ? 'display-5 text-primary' : 'display-2 text-secondary'}`}>{banner.title}</h3>
                                        <p className={`${index === 0 ? 'fs-4 text-muted' : 'display-5 text-white mb-4'}`}>{banner.price}</p>
                                        <span className={`btn rounded-pill py-2 px-4 align-self-start ${banner.buttonClass}`}>{t('Shop Now')}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
);

export default BestsellerSection;
