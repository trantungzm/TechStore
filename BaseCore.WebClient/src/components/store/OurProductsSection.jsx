import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { fadeInLeft, fadeInRight, fadeInUp, staggerContainer } from '../../utils/motionVariants';
import { t } from '../../utils/store';

const productTabs = ['All Products', 'New Arrivals', 'Featured', 'Top Selling'];

const sectionViewport = { once: true, amount: 0.18 };
const sectionTransition = { duration: 0.5, ease: 'easeOut' };

const tabListVariants = {
    ...fadeInRight,
    visible: {
        ...fadeInRight.visible,
        transition: {
            ...sectionTransition,
            staggerChildren: 0.08,
            delayChildren: 0.12,
        },
    },
};

const tabItemVariants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0 },
};

const OurProductsSection = ({ products, loading, onAddToCart }) => {
    const [selectedTab, setSelectedTab] = useState('All Products');

    const visibleProducts = useMemo(() => {
        const filteredProducts = selectedTab === 'All Products'
            ? products
            : products.filter((product) => product.tab === selectedTab);

        return filteredProducts.slice(0, 8);
    }, [products, selectedTab]);

    return (
        <section className="container-fluid py-5" id="featured-products">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-5">
                    <motion.h1
                        className="electro-section-title mb-0"
                        variants={fadeInLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={sectionViewport}
                        transition={sectionTransition}
                    >
                        {t('Our Products')}
                    </motion.h1>

                    <motion.div
                        className="electro-product-tabs"
                        variants={tabListVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={sectionViewport}
                    >
                        {productTabs.map((tab) => (
                            <motion.button
                                key={tab}
                                type="button"
                                className={selectedTab === tab ? 'active' : ''}
                                variants={tabItemVariants}
                                transition={sectionTransition}
                                onClick={() => setSelectedTab(tab)}
                            >
                                {t(tab)}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedTab}
                        className="row g-4 electro-tab-panel electro-home-products-grid"
                        variants={staggerContainer}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={sectionTransition}
                    >
                        {loading ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : visibleProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                className="col-6 col-md-4 col-xl-3"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={sectionViewport}
                                transition={{ ...sectionTransition, delay: (index % 4) * 0.06 }}
                            >
                                <ProductCard product={product} onAddToCart={onAddToCart} />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};

export default OurProductsSection;
