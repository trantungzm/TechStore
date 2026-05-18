import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/store/PageHero';
import { setPageMeta } from '../../utils/store';

const NotFound = () => {
    useEffect(() => {
        setPageMeta({
            title: '404 Page | Electro',
            description: 'Electro 404 page placeholder.',
        });
    }, []);

    return (
        <>
            <PageHero title="404 Page" current="404" />
            <div className="container-fluid py-5">
                <div className="container py-5 text-center">
                    <div className="mx-auto" style={{ maxWidth: 680 }}>
                        <h1 className="display-1 text-primary fw-bold mb-3">404</h1>
                        <h2 className="mb-3">Page Not Found</h2>
                        <p className="text-muted mb-4">The page you are looking for does not exist or has been moved.</p>
                        <Link to="/" className="btn btn-primary rounded-pill py-3 px-5">
                            <i className="fas fa-home me-2"></i>Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFound;
