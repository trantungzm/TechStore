import React, { useEffect, useState } from 'react';
import ElectroAssets from './ElectroAssets';
import ElectroFooter from './ElectroFooter';
import ElectroHeader from './ElectroHeader';

const StoreLayout = ({ children }) => {
    const [showSpinner, setShowSpinner] = useState(true);
    const [spinnerHiding, setSpinnerHiding] = useState(false);
    const [toastState, setToastState] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const hide = () => {
            setSpinnerHiding(true);
            window.setTimeout(() => setShowSpinner(false), 350);
        };
        if (document.readyState === 'complete') {
            hide();
            return undefined;
        }

        window.addEventListener('load', hide, { once: true });
        const fallbackTimer = window.setTimeout(hide, 800);
        return () => {
            window.removeEventListener('load', hide);
            window.clearTimeout(fallbackTimer);
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

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 320);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="electro-shell">
            <ElectroAssets />

            {showSpinner && (
                <div id="spinner" className={`electro-spinner bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center ${spinnerHiding ? 'is-hiding' : ''}`}>
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}

            <ElectroHeader />
            <main>{children}</main>
            <ElectroFooter />

            <button type="button" className={`btn btn-primary btn-lg-square back-to-top ${showBackToTop ? '' : 'is-hidden'}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <i className="fa fa-arrow-up"></i>
            </button>

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
