import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { formatCurrency, t } from '../../utils/store';
import ElectroAssets from './ElectroAssets';

const StoreLayout = ({ children }) => {
    const [megaOpen, setMegaOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');
    const [toastState, setToastState] = useState(null);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { totalAmount, itemCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { compareCount } = useCompare();
    const navigate = useNavigate();
    const location = useLocation();

    const dashboardLabel = user?.name || user?.username || 'My Dashboard';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setKeyword(params.get('keyword') || '');
    }, [location.search]);

    const handleSearch = (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (keyword.trim()) params.set('keyword', keyword.trim());
        navigate(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let timeoutId;
        const handler = (event) => {
            const detail = event?.detail || {};
            const message = String(detail.message || '');
            const variant = String(detail.variant || 'primary');
            if (!message.trim()) return;
            setToastState({ message, variant, key: `${Date.now()}-${Math.random()}` });
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => setToastState(null), 3000);
        };

        window.addEventListener('store:toast', handler);
        return () => {
            window.removeEventListener('store:toast', handler);
            clearTimeout(timeoutId);
        };
    }, []);

    const handleCurrencyChange = (curr) => {
        setCurrency(curr);
        localStorage.setItem('currency', curr);
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className="electro-shell">
            <ElectroAssets />
            <style>{`
.electro-sticky-header{position:fixed;top:0;left:0;right:0;z-index:1030;background:rgba(248,249,250,.92);backdrop-filter:saturate(120%) blur(10px);-webkit-backdrop-filter:saturate(120%) blur(10px);border-bottom:1px solid rgba(0,0,0,.06);box-shadow:0 10px 24px rgba(0,0,0,.06)}
.electro-shell main{padding-top:210px}
@media (max-width: 991.98px){.electro-shell main{padding-top:132px}}
.electro-main-nav{background:#ff9800 !important;border-bottom:1px solid rgba(0,0,0,.08);box-shadow:0 6px 18px rgba(0,0,0,.08)}
.electro-main-nav .navbar{background:transparent !important}
.electro-main-nav .navbar-collapse{background:transparent !important}
.electro-main-nav .navbar-nav .nav-link{padding:.85rem 1.1rem;font-weight:600;color:#6c757d;position:relative}
.electro-main-nav .navbar-nav .nav-link:hover{color:#6c757d}
.electro-main-nav .navbar-nav .nav-link.active{color:#6c757d !important}
.electro-main-nav .navbar-nav .nav-link.active::after{content:'';position:absolute;left:1.1rem;right:1.1rem;bottom:.35rem;height:2px;background:#6c757d;border-radius:2px}
`}</style>

            <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>

            <header className="electro-sticky-header">
                <div className="container-fluid px-5 d-none border-bottom d-lg-block">
                    <div className="row gx-0 align-items-center">
                        <div className="col-lg-4 text-center text-lg-start mb-lg-0">
                            <div className="d-inline-flex align-items-center" style={{ height: 45 }}>
                                <Link to="/contact" className="text-muted me-2">{t('Help')}</Link><small> / </small>
                                <Link to="/contact" className="text-muted mx-2">{t('Support')}</Link><small> / </small>
                                <Link to="/contact" className="text-muted ms-2">{t('Contact')}</Link>
                            </div>
                        </div>
                        <div className="col-lg-4 text-center d-flex align-items-center justify-content-center">
                            <small className="text-dark">{t('Call Us:')}</small>
                            <a href="tel:+0121234567890" className="text-muted">(+012) 1234 567890</a>
                        </div>

                        <div className="col-lg-4 text-center text-lg-end">
                            <div className="d-inline-flex align-items-center" style={{ height: 45 }}>

    {/* Currency */}
    <div className="dropdown position-relative">
        <button
            type="button"
            className="btn btn-link dropdown-toggle text-muted me-2 p-0"
            onClick={() => setOpenDropdown(openDropdown === 'currency' ? null : 'currency')}
        >
            <small>{currency}</small>
        </button>

        <div className={`dropdown-menu rounded shadow ${openDropdown === 'currency' ? 'show' : ''}`} style={{ position: 'absolute' }}>
            <button type="button" className="dropdown-item" onClick={() => { handleCurrencyChange('USD'); setOpenDropdown(null); }}>USD</button>
            <button type="button" className="dropdown-item" onClick={() => { handleCurrencyChange('VND'); setOpenDropdown(null); }}>VND</button>
        </div>
    </div>

    {/* Language */}
    <div className="dropdown position-relative">
        <button
            type="button"
            className="btn btn-link dropdown-toggle text-muted mx-2 p-0"
            onClick={() => setOpenDropdown(openDropdown === 'lang' ? null : 'lang')}
        >
            <small>{language}</small>
        </button>

        <div className={`dropdown-menu rounded shadow ${openDropdown === 'lang' ? 'show' : ''}`} style={{ position: 'absolute' }}>
            <button type="button" className="dropdown-item" onClick={() => { handleLanguageChange('English'); setOpenDropdown(null); }}>English</button>
            <button type="button" className="dropdown-item" onClick={() => { handleLanguageChange('Vietnamese'); setOpenDropdown(null); }}>Vietnamese</button>
        </div>
    </div>

    {/* User */}
    <div className="dropdown position-relative">
        <button
            type="button"
            className="btn btn-link dropdown-toggle text-muted ms-2 p-0"
            onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
        >
            <small><i className="fa fa-home me-2"></i> {dashboardLabel}</small>
        </button>

        <div className={`dropdown-menu rounded shadow dropdown-menu-end ${openDropdown === 'user' ? 'show' : ''}`} style={{ position: 'absolute', right: 0, left: 'auto' }}>
            {!isAuthenticated && <NavLink to="/login" className="dropdown-item" onClick={() => setOpenDropdown(null)}>{t('Login')}</NavLink>}
            {isAuthenticated && <NavLink to="/orders" className="dropdown-item" onClick={() => setOpenDropdown(null)}>{t('Order History')}</NavLink>}
            {isAuthenticated && <NavLink to="/cart" className="dropdown-item" onClick={() => setOpenDropdown(null)}>{t('My Cart')}</NavLink>}
            {isAdmin() && <NavLink to="/admin" className="dropdown-item" onClick={() => setOpenDropdown(null)}>{t('Admin Panel')}</NavLink>}
            {isAuthenticated && (
                <button type="button" className="dropdown-item" onClick={() => { handleLogout(); setOpenDropdown(null); }}>
                    {t('Log Out')}
                </button>
            )}
        </div>
    </div>

</div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-3 px-lg-5 py-3 py-lg-4 border-bottom">
                    <div className="row gx-0 align-items-center text-center">
                        <div className="col-md-4 col-lg-3 text-center text-lg-start">
                            <div className="d-inline-flex align-items-center">
                                <Link to="/" className="navbar-brand p-0">
                                    <h1 className="display-5 text-primary m-0"><i className="fas fa-shopping-bag text-secondary me-2"></i>Electro</h1>
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-6 text-center">
                            <div className="position-relative ps-4">
                                <form onSubmit={handleSearch} className="d-flex border rounded-pill position-relative">
                                    <input
                                        className="form-control border-0 rounded-pill w-100 py-3 ps-4"
                                        type="text"
                                        placeholder={t('Search Looking For?')}
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                    />
                                    <button type="submit" className="btn btn-primary rounded-pill py-3 px-5" style={{ border: 0 }}>
                                        <i className="fas fa-search"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-3 text-center text-lg-end">
                            <div className="d-inline-flex align-items-center">
                                <NavLink to="/compare" className="text-muted d-flex align-items-center justify-content-center me-3">
                                    <div className="position-relative">
                                        <span className="rounded-circle btn-md-square border"><i className="fas fa-exchange-alt"></i></span>
                                        {compareCount > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                {compareCount}
                                            </span>
                                        )}
                                    </div>
                                </NavLink>
                                <NavLink to="/wishlist" className="text-muted d-flex align-items-center justify-content-center me-3">
                                    <div className="position-relative">
                                        <span className="rounded-circle btn-md-square border"><i className="fas fa-heart"></i></span>
                                        {wishlistCount > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                {wishlistCount}
                                            </span>
                                        )}
                                    </div>
                                </NavLink>
                                <NavLink to="/cart" className="text-muted d-flex align-items-center justify-content-center">
                                    <div className="position-relative">
                                        <span className="rounded-circle btn-md-square border"><i className="fas fa-shopping-cart"></i></span>
                                        {itemCount > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                {itemCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-dark ms-3">{formatCurrency(totalAmount)}</span>
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid px-3 px-lg-5 electro-main-nav">
                    <nav className="navbar navbar-expand-lg navbar-light py-0">
                        <button
                            className="navbar-toggler ms-auto my-2"
                            type="button"
                            data-toggle="collapse"
                            data-target="#storeMainNav"
                            aria-controls="storeMainNav"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="storeMainNav">
                            <div className="navbar-nav mx-auto">
                                <NavLink to="/" end className="nav-item nav-link">{t('Home')}</NavLink>
                               <div
    className="nav-item position-static"
    onMouseEnter={() => setMegaOpen(true)}
    onMouseLeave={() => setMegaOpen(false)}
>
    <NavLink to="/shop" end className="nav-link" style={{ cursor: 'pointer' }}>
         {t('Shop')}
    </NavLink>

    {megaOpen && (
        <div className="mega-menu shadow">
            <div className="container">
                <div className="row">

                    <div className="col-md-3">
                        <h6><i className="fas fa-layer-group me-2"></i>Category</h6>
                        <Link to="/shop?category=smartphone">
                            <i className="fas fa-mobile-alt me-2"></i> Smartphone
                        </Link>
                        <Link to="/shop?category=laptop">
                            <i className="fas fa-laptop me-2"></i> Laptop
                        </Link>
                        <Link to="/shop?category=tablet">
                            <i className="fas fa-tablet-alt me-2"></i> Tablet
                        </Link>
                    </div>

                    <div className="col-md-3">
                        <h6><i className="fas fa-headphones me-2"></i>Accessories</h6>
                        <Link to="/shop?category=accessories">
                            <i className="fas fa-plug me-2"></i> Accessories
                        </Link>
                        <Link to="/shop?category=audio">
                            <i className="fas fa-headphones-alt me-2"></i> Audio
                        </Link>
                        <Link to="/shop?category=smartwatch">
                            <i className="fas fa-clock me-2"></i> Smartwatch
                        </Link>
                    </div>

                    <div className="col-md-3">
                        <h6><i className="fas fa-gamepad me-2"></i>Entertainment</h6>
                        <Link to="/shop?category=gaming">
                            <i className="fas fa-gamepad me-2"></i> Gaming
                        </Link>
                        <Link to="/shop?category=camera">
                            <i className="fas fa-camera me-2"></i> Camera
                        </Link>
                    </div>

                   

                </div>
            </div>
        </div>
    )}
</div>
                                <NavLink to="/contact" className="nav-item nav-link">{t('Contact')}</NavLink>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            <main>{children}</main>

            <div className="container-fluid footer py-5 wow fadeIn" data-wow-delay="0.2s">
                <div className="container py-5">
                    <div className="row g-4 rounded mb-5" style={{ background: 'rgba(255, 255, 255, .03)' }}>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4" style={{ width: 70, height: 70 }}>
                                    <i className="fas fa-map-marker-alt fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">{t('Address')}</h4>
                                    <p className="mb-2">123 Street New York.USA</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4" style={{ width: 70, height: 70 }}>
                                    <i className="fas fa-envelope fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">{t('Mail Us')}</h4>
                                    <p className="mb-2">info@example.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4" style={{ width: 70, height: 70 }}>
                                    <i className="fa fa-phone-alt fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">{t('Telephone')}</h4>
                                    <p className="mb-2">(+012) 3456 7890</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="rounded p-4">
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-4" style={{ width: 70, height: 70 }}>
                                    <i className="fab fa-firefox-browser fa-2x text-primary"></i>
                                </div>
                                <div>
                                    <h4 className="text-white">Yoursite@ex.com</h4>
                                    <p className="mb-2">(+012) 3456 7890</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-5">
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="footer-item d-flex flex-column">
                                <div className="footer-item">
                                    <h4 className="text-primary mb-4">{t('Newsletter')}</h4>
                                    <p className="mb-3">Dolor amet sit justo amet elitr clita ipsum elitr est.Lorem ipsum dolor sit amet, consectetur adipiscing elit consectetur adipiscing elit.</p>
                                    <div className="position-relative mx-auto rounded-pill">
                                        <input className="form-control rounded-pill w-100 py-3 ps-4 pe-5" type="text" placeholder={t('Enter your email')} />
                                        <button type="button" className="btn btn-primary rounded-pill position-absolute top-0 end-0 py-2 mt-2 me-2">{t('SignUp')}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="footer-item d-flex flex-column">
                                <h4 className="text-primary mb-4">{t('Customer Service')}</h4>
                                <Link to="/contact"><i className="fas fa-angle-right me-2"></i> {t('Contact')}</Link>
                                <Link to="/shop"><i className="fas fa-angle-right me-2"></i> {t('Returns')}</Link>
                                <Link to="/orders"><i className="fas fa-angle-right me-2"></i> {t('Order History')}</Link>
                                <Link to="/"><i className="fas fa-angle-right me-2"></i> {t('Site Map')}</Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="footer-item d-flex flex-column">
                                <h4 className="text-primary mb-4">{t('Information')}</h4>
                                <Link to="/"><i className="fas fa-angle-right me-2"></i> {t('About Us')}</Link>
                                <Link to="/shop"><i className="fas fa-angle-right me-2"></i> {t('Delivery infomation')}</Link>
                                <Link to="/contact"><i className="fas fa-angle-right me-2"></i> {t('Privacy Policy')}</Link>
                                <Link to="/contact"><i className="fas fa-angle-right me-2"></i> {t('Terms & Conditions')}</Link>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="footer-item d-flex flex-column">
                                <h4 className="text-primary mb-4">{t('Extras')}</h4>
                                <Link to="/shop"><i className="fas fa-angle-right me-2"></i> {t('Brands')}</Link>
                                <Link to="/cart"><i className="fas fa-angle-right me-2"></i> {t('Gift Vouchers')}</Link>
                                <Link to="/wishlist"><i className="fas fa-angle-right me-2"></i> {t('Wishlist')}</Link>
                                <Link to="/orders"><i className="fas fa-angle-right me-2"></i> {t('Track Your Order')}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid copyright py-4">
                <div className="container">
                    <div className="row g-4 align-items-center">
                        <div className="col-md-6 text-center text-md-start mb-md-0">
                            <span className="text-white"><Link to="/" className="border-bottom text-white"><i className="fas fa-copyright text-light me-2"></i>Electro</Link>, All right reserved.</span>
                        </div>
                        <div className="col-md-6 text-center text-md-end text-white">
                            <span>BaseCore</span>
                        </div>
                    </div>
                </div>
            </div>

            <a href="#" className="btn btn-primary btn-lg-square back-to-top"><i className="fa fa-arrow-up"></i></a>
            {toastState && (
                <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
                    <div className={`toast show align-items-center text-bg-${toastState.variant} border-0`} role="alert" aria-live="assertive" aria-atomic="true" key={toastState.key}>
                        <div className="d-flex">
                            <div className="toast-body">{toastState.message}</div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setToastState(null)}></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreLayout;
