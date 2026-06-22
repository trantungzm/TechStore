import React from 'react';
import ProductCard from './ProductCard';

// Lưới sản phẩm có tiêu đề — dùng cho "Sản phẩm liên quan", "Đã xem gần đây"...
export default function ProductGridSection({ title, products }) {
    if (!products?.length) return null;
    return (
        <section className="mt-20">
            <h3 className="ts-display mb-8 text-2xl">{title}</h3>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {products.map((item) => (
                    <ProductCard key={item.id} product={item} />
                ))}
            </div>
        </section>
    );
}
