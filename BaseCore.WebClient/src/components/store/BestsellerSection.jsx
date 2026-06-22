import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { t } from '../../utils/store';

const offers = [];

const BestsellerSection = ({ products }) => (
    <>
        {/* Offers */}
        <section className="ts-container py-12">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {offers.map((offer, idx) => (
                    <motion.div
                        key={offer.title}
                        initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                        <Link
                            to="/shop"
                            className="group relative flex items-center justify-between overflow-hidden rounded-md border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-8 shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lift)]"
                        >
                            <div className="relative z-10 max-w-[55%]">
                                <p className="text-sm text-[var(--color-fg-muted)]">{offer.subtitle}</p>
                                <h3 className="ts-display mt-3 text-2xl text-[var(--color-fg)]">{t(offer.title)}</h3>
                                <p className="ts-display mt-2 text-5xl font-bold">
                                    <span className="ts-gradient-text">{offer.discount}</span>
                                    <span className="ml-2 text-sm font-normal text-[var(--color-fg-muted)]">Giảm</span>
                                </p>
                            </div>
                            <img
                                src={offer.imageUrl}
                                alt={offer.title}
                                className="relative z-10 h-44 w-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                            />
                            <span className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-[var(--color-accent)]/20" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Bestseller grid */}
        <section className="ts-container py-12">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="mb-12 flex items-end justify-between gap-4"
            >
                <div>
                    <p className="ts-eyebrow text-[var(--color-accent)]">{t('Bestseller Products')}</p>
                    <h2 className="ts-display mt-3 text-3xl md:text-4xl">{t('Most Popular Items')}</h2>
                    <div className="mt-3 h-px w-16 bg-gradient-to-r from-[var(--color-accent)] to-transparent" />
                </div>
                <Link to="/bestseller" className="ts-btn ts-btn-ghost hidden text-xs md:inline-flex group">
                    Xem tất cả <i className="fas fa-arrow-right ml-1 text-[10px] transition-transform group-hover:translate-x-1"></i>
                </Link>
            </motion.div>

            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ delay: (idx % 4) * 0.08, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </div>
        </section>
    </>
);

export default BestsellerSection;
