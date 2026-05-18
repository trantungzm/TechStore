import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../utils/store';

const contactItems = [
    { icon: 'fas fa-map-marker-alt', title: 'Address', text: '123 Street New York.USA' },
    { icon: 'fas fa-envelope', title: 'Mail Us', text: 'info@example.com' },
    { icon: 'fa fa-phone-alt', title: 'Telephone', text: '(+012) 3456 7890' },
    { icon: 'fab fa-firefox-browser', title: 'Yoursite@ex.com', text: '(+012) 3456 7890' },
];

const footerGroups = [
    {
        title: 'Customer Service',
        links: [
            { label: 'Contact Us', to: '/contact' },
            { label: 'Returns', to: '/shop' },
            { label: 'Order History', to: '/orders' },
            { label: 'Site Map', to: '/' },
            { label: 'Wishlist', to: '/wishlist' },
        ],
    },
    {
        title: 'Information',
        links: [
            { label: 'About Us', to: '/' },
            { label: 'Delivery infomation', to: '/shop' },
            { label: 'Privacy Policy', to: '/contact' },
            { label: 'Terms & Conditions', to: '/contact' },
            { label: 'FAQ', to: '/contact' },
        ],
    },
    {
        title: 'Extras',
        links: [
            { label: 'Brands', to: '/shop' },
            { label: 'Gift Vouchers', to: '/cart' },
            { label: 'Affiliates', to: '/contact' },
            { label: 'Wishlist', to: '/wishlist' },
            { label: 'Track Your Order', to: '/orders' },
        ],
    },
];

const ElectroFooter = () => (
    <>
        <div className="container-fluid footer py-5 wow fadeIn" data-wow-delay="0.2s">
            <div className="container py-5">
                <div className="row g-4 rounded mb-5" style={{ background: 'rgba(255, 255, 255, .03)' }}>
                    {contactItems.map((item) => (
                        <div className="col-md-6 col-lg-6 col-xl-3" key={item.title}>
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4" style={{ width: 70, height: 70 }}>
                                    <i className={`${item.icon} fa-2x text-primary`}></i>
                                </div>
                                <div>
                                    <h4 className="text-white">{t(item.title)}</h4>
                                    <p className="mb-2">{item.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-5">
                    <div className="col-md-6 col-lg-6 col-xl-3">
                        <div className="footer-item d-flex flex-column">
                            <h4 className="text-primary mb-4">{t('Newsletter')}</h4>
                            <p className="text-white mb-3">Đăng ký nhận tin để cập nhật ưu đãi, sản phẩm mới và thông tin khuyến mãi từ Electro.</p>
                            <div className="position-relative mx-auto rounded-pill">
                                <input className="form-control rounded-pill w-100 py-3 ps-4 pe-5" type="email" placeholder={t('Enter your email')} />
                                <button type="button" className="btn btn-primary rounded-pill position-absolute top-0 end-0 py-2 mt-2 me-2">{t('SignUp')}</button>
                            </div>
                        </div>
                    </div>

                    {footerGroups.map((group) => (
                        <div className="col-md-6 col-lg-6 col-xl-3" key={group.title}>
                            <div className="footer-item d-flex flex-column">
                                <h4 className="text-primary mb-4">{t(group.title)}</h4>
                                {group.links.map((link) => (
                                    <Link to={link.to} key={`${group.title}-${link.label}`}>
                                        <i className="fas fa-angle-right me-2"></i>{t(link.label)}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="container-fluid copyright py-4">
            <div className="container">
                <div className="row g-4 align-items-center">
                    <div className="col-md-6 text-center text-md-start mb-md-0">
                        <span className="text-white">
                            <Link to="/" className="border-bottom text-white"><i className="fas fa-copyright text-light me-2"></i>Electro</Link>, đã đăng ký bản quyền.
                        </span>
                    </div>
                    <div className="col-md-6 text-center text-md-end text-white">BaseCore</div>
                </div>
            </div>
        </div>
    </>
);

export default ElectroFooter;
