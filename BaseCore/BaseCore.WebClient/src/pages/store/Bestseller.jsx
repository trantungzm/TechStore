import React, { useEffect } from 'react';
import BestsellerSection from '../../components/store/BestsellerSection';
import PageHero from '../../components/store/PageHero';
import { setPageMeta } from '../../utils/store';

const products = [
    { id: 101, name: 'Apple iPad Mini G2356', price: 26250000, oldPrice: 31250000, stock: 24, categoryId: 5, category: { name: 'SmartPhone' }, imageUrl: '/electro/img/product-15.png' },
    { id: 102, name: 'Đồng hồ thông minh Pro S9', price: 9750000, oldPrice: 12500000, stock: 18, categoryId: 3, category: { name: 'Accessories' }, imageUrl: '/electro/img/product-16.png' },
    { id: 103, name: 'Camera Mirrorless X100', price: 22475000, oldPrice: 24975000, stock: 9, categoryId: 6, category: { name: 'Camera' }, imageUrl: '/electro/img/product-1.png' },
    { id: 104, name: 'Laptop AirBook 14', price: 31975000, oldPrice: 37475000, stock: 12, categoryId: 2, category: { name: 'Laptops & Desktops' }, imageUrl: '/electro/img/product-7.png' },
    { id: 105, name: 'Tai nghe chống ồn', price: 5750000, oldPrice: 7250000, stock: 30, categoryId: 8, category: { name: 'Audio' }, imageUrl: '/electro/img/product-11.png' },
    { id: 106, name: 'Máy chơi game Ultra', price: 14975000, oldPrice: 17475000, stock: 11, categoryId: 4, category: { name: 'Gaming' }, imageUrl: '/electro/img/product-14.png' },
    { id: 107, name: 'Tablet Vision 11', price: 16750000, oldPrice: 19750000, stock: 14, categoryId: 5, category: { name: 'Mobiles & Tablets' }, imageUrl: '/electro/img/product-17.png' },
    { id: 108, name: 'Loa không dây', price: 4475000, oldPrice: 5725000, stock: 26, categoryId: 8, category: { name: 'Audio' }, imageUrl: '/electro/img/product-18.png' },
];

const Bestseller = () => {
    useEffect(() => {
        setPageMeta({
            title: 'Sản phẩm bán chạy | Electro',
            description: 'Sản phẩm bán chạy của Electro.',
        });
    }, []);

    return (
        <>
            <PageHero title="Sản phẩm bán chạy" current="Bán chạy" />
            <BestsellerSection products={products} />
        </>
    );
};

export default Bestseller;
