import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../utils/store';

const PageHero = ({ title, current }) => {
    return (
        <div className="container-fluid page-header py-5">
            <h1 className="text-center text-white display-6 wow fadeInUp" data-wow-delay="0.1s">{title}</h1>
            <ol className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay="0.3s">
                <li className="breadcrumb-item"><Link to="/">{t('Home')}</Link></li>
                <li className="breadcrumb-item"><span>{t('Pages')}</span></li>
                <li className="breadcrumb-item active text-white">{current || title}</li>
            </ol>
        </div>
    );
};

export default PageHero;
