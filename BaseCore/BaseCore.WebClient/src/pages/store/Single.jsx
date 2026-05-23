import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/store/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { fadeInUp, motionTransition } from '../../utils/motionVariants';
import { formatCurrency, setPageMeta } from '../../utils/store';

const categories = [
    { id: 3, name: 'Phụ kiện', count: 3 },
    { id: 4, name: 'Điện tử & Máy tính', count: 5 },
    { id: 2, name: 'Laptop & Máy tính bàn', count: 2 },
    { id: 1, name: 'Điện thoại & Máy tính bảng', count: 8 },
    { id: 5, name: 'Điện thoại thông minh & TV thông minh', count: 5 },
];

const featuredProducts = [
    { id: 1, name: 'Điện thoại thông minh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-1.png' },
    { id: 2, name: 'Máy ảnh thông minh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-2.png' },
    { id: 3, name: 'Máy ảnh thông minh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-3.png' },
    { id: 4, name: 'Ống kính máy ảnh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-4.png' },
    { id: 5, name: 'Máy ảnh thông minh', price: 2.99, oldPrice: 4.11, imageUrl: '/electro/img/product-5.png' },
];

const galleryImages = [
    '/electro/img/product-2.png',
    '/electro/img/product-3.png',
    '/electro/img/product-4.png',
    '/electro/img/product-5.png',
    '/electro/img/product-1.png',
];

const relatedProducts = [1, 2, 3, 4].map((id) => ({
    id,
    name: 'Apple iPad Mini G2356',
    categoryId: 1,
    category: { name: 'Điện thoại thông minh' },
    price: 1050,
    oldPrice: 1250,
    stock: 20,
    badge: 'Mới',
    imageUrl: '/electro/img/product-1.png',
}));

const productTags = ['Mới', 'thương hiệu', 'đen', 'trắng', 'máy tính bảng', 'điện thoại', 'máy ảnh', 'drone', 'tivi', 'giảm giá'];
const singleViewport = { once: true, amount: 0.05, margin: '0px 0px 100px 0px' };
const singleTransition = { ...motionTransition, duration: 0.9 };

const Rating = ({ small = false }) => (
    <div className={`electro-rating ${small ? 'mini' : ''}`}>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star text-muted"></i>
    </div>
);

const Single = () => {
    const { addItem } = useCart();
    const [activeImage, setActiveImage] = useState(galleryImages[0]);
    const [quantity, setQuantity] = useState(1);
    const product = useMemo(() => ({
        id: 2,
        name: 'Máy ảnh thông minh',
        categoryId: 4,
        category: { name: 'Điện tử' },
        price: 3.35,
        stock: 20,
        imageUrl: activeImage,
    }), [activeImage]);

    useEffect(() => {
        setPageMeta({
            title: 'Chi tiết sản phẩm | Electro',
            description: 'Electro single product page.',
        });
    }, []);

    const handleAdd = () => addItem(product, quantity);

    return (
        <div className="container-fluid single-product-page py-5">
            <div className="container">
                <div className="row g-5">
                    <aside className="col-lg-3">
                        <form className="input-group mb-4">
                            <input type="search" className="form-control p-3" placeholder="từ khóa" />
                            <button className="btn btn-light border" type="button">
                                <i className="fa fa-search text-muted"></i>
                            </button>
                        </form>

                        <div className="mb-4">
                            <h4 className="mb-3">Danh mục sản phẩm</h4>
                            {categories.map((category) => (
                                <Link
                                    key={category.name}
                                    to={`/shop?categoryId=${category.id}`}
                                    className="d-flex justify-content-between align-items-center text-dark text-decoration-none py-2"
                                >
                                    <span><i className="fa fa-apple-alt text-primary me-3"></i>{category.name}</span>
                                    <span className="text-muted">({category.count})</span>
                                </Link>
                            ))}
                        </div>

                        <div className="mb-4">
                            <h4 className="mb-3">Chọn theo màu</h4>
                            {['Vàng', 'Xanh lá', 'Trắng'].map((color) => (
                                <label key={color} className="d-flex align-items-center gap-2 py-2">
                                    <input type="radio" name="single-color" className="form-check-input mt-0" />
                                    <span>{color}</span>
                                </label>
                            ))}
                        </div>

                        <div className="featured-product mb-4">
                            <h4 className="mb-3">Sản phẩm nổi bật</h4>
                            {featuredProducts.map((item) => (
                                <div key={item.id} className="d-flex gap-3 mb-3">
                                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                                        <img src={item.imageUrl} alt={item.name} style={{ width: 72, height: 72, objectFit: 'contain' }} />
                                    </Link>
                                    <div>
                                        <Link to={`/product/${item.id}`} className="text-dark fw-semibold text-decoration-none">{item.name}</Link>
                                        <Rating small />
                                        <div className="fw-bold">
                                            {formatCurrency(item.price)} <del className="text-danger fw-normal ms-1">{formatCurrency(item.oldPrice)}</del>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Link to="/shop" className="btn btn-primary rounded-pill w-100 py-3 mt-3">Xem thêm</Link>
                        </div>

                        <div className="bg-primary rounded position-relative mb-4 overflow-hidden" style={{ minHeight: 182 }}>
                            <img src="/electro/img/product-banner-3.jpg" className="img-fluid w-100 h-100" alt="Sale" style={{ objectFit: 'cover', opacity: 0.85 }} />
                            <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
                                <h2 className="text-primary fw-bold">GIẢM GIÁ</h2>
                                <h5 className="text-danger fw-bold">Giảm đến 50%</h5>
                                <Link to="/shop" className="btn btn-primary rounded-pill px-4">Mua ngay</Link>
                            </div>
                        </div>

                        <div className="product-tags bg-light rounded p-3">
                            <h4 className="mb-3">THẺ SẢN PHẨM</h4>
                            <div className="d-flex flex-wrap gap-2">
                                {productTags.map((tag) => (
                                    <Link key={tag} to={`/shop?keyword=${tag}`} className="btn btn-sm btn-outline-secondary bg-white rounded">{tag}</Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <main className="col-lg-9">
                        <motion.div
                            className="row g-4 align-items-start mb-5"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={singleViewport}
                            transition={singleTransition}
                        >
                            <div className="col-md-6">
                                <div className="bg-light rounded text-center p-4 position-relative">
                                    <button type="button" className="btn btn-link position-absolute top-50 start-0 translate-middle-y text-primary">
                                        <i className="fas fa-long-arrow-alt-left"></i>
                                    </button>
                                    <img src={activeImage} className="img-fluid" alt="Smart Camera" style={{ height: 290, objectFit: 'contain' }} />
                                    <button type="button" className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-primary">
                                        <i className="fas fa-long-arrow-alt-right"></i>
                                    </button>
                                </div>
                                <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                                    {galleryImages.map((image) => (
                                        <button
                                            key={image}
                                            type="button"
                                            className={`btn rounded-circle p-2 ${activeImage === image ? 'border-primary border-2' : 'border-primary'}`}
                                            onClick={() => setActiveImage(image)}
                                            style={{ width: 66, height: 66 }}
                                        >
                                            <img src={image} alt="" className="img-fluid" style={{ width: 46, height: 46, objectFit: 'contain' }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <h4 className="fw-bold mb-3">Máy ảnh thông minh</h4>
                                <p className="text-muted mb-3">Danh mục: Điện tử</p>
                                <h5 className="fw-bold mb-3">3,35 $</h5>
                                <Rating />
                                <div className="d-flex gap-3 my-4">
                                    <button type="button" className="btn btn-primary rounded px-4">
                                        <i className="fab fa-facebook-f me-2"></i>Chia sẻ
                                    </button>
                                    <button type="button" className="btn btn-danger rounded px-4">
                                        <i className="fab fa-twitter me-2"></i>Chia sẻ
                                    </button>
                                </div>
                                <p className="text-muted mb-0">Product SKU: N/A</p>
                                <p className="text-muted">Tình trạng: <span className="text-primary fw-bold">Còn 20 sản phẩm</span></p>
                                <p className="text-muted">Sản phẩm được thiết kế để mang lại trải nghiệm ổn định, hình ảnh sắc nét và thao tác tiện lợi trong nhu cầu sử dụng hằng ngày.</p>
                                <p className="text-muted">Thiết kế gọn gàng, dễ cầm nắm, phù hợp cho người dùng cần một thiết bị điện tử bền bỉ và hiệu quả.</p>

                                <div className="d-flex align-items-center gap-3 my-4">
                                    <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <span>{quantity}</span>
                                    <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={() => setQuantity((value) => value + 1)}>
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>

                                <button type="button" className="btn btn-primary rounded-pill px-4 py-2" onClick={handleAdd}>
                                    <i className="fas fa-shopping-bag me-2"></i>Thêm vào giỏ
                                </button>
                            </div>
                        </motion.div>

                        <motion.ul
                            className="nav border-bottom mb-3"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={singleViewport}
                            transition={singleTransition}
                        >
                            <li className="nav-item">
                                <button className="nav-link active text-dark border-0 bg-transparent border-bottom border-primary rounded-0" type="button">Mô tả</button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link text-primary border-0 bg-transparent rounded-0" type="button">Đánh giá</button>
                            </li>
                        </motion.ul>

                        <motion.div
                            className="text-muted mb-5"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={singleViewport}
                            transition={singleTransition}
                        >
                            <p>Sản phẩm <strong>máy ảnh thông minh</strong> được tối ưu cho nhu cầu chụp ảnh, quay video và sử dụng linh hoạt trong nhiều tình huống khác nhau. Thiết bị có chất lượng hoàn thiện tốt, thao tác nhanh và dễ sử dụng.</p>
                            <p><strong>Tính năng chính:</strong><br />Hình ảnh rõ nét, khả năng lấy nét ổn định, thân máy chắc chắn, phù hợp cho người dùng cá nhân và bán chuyên.</p>
                            <p><strong>Khả năng sử dụng:</strong><br />Phù hợp cho chụp sản phẩm, du lịch, học tập, làm việc và lưu giữ khoảnh khắc hằng ngày.</p>
                            <p><strong>Phụ kiện tương thích:</strong><br />Ống kính, túi đựng, thẻ nhớ, chân máy và các phụ kiện hỗ trợ khác.</p>
                            <p><strong>Bảo hành:</strong><br />Sản phẩm được hỗ trợ theo chính sách bảo hành và đổi trả của cửa hàng.</p>
                        </motion.div>

                        <motion.div
                            className="mb-5"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={singleViewport}
                            transition={singleTransition}
                        >
                            <h4 className="fw-bold mb-4">Để lại đánh giá</h4>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <input type="text" className="form-control border-0 border-bottom rounded-0 px-0" placeholder="Tên của bạn *" />
                                </div>
                                <div className="col-md-6">
                                    <input type="email" className="form-control border-0 border-bottom rounded-0 px-0" placeholder="Email của bạn *" />
                                </div>
                                <div className="col-12">
                                    <textarea className="form-control border-0 border-bottom rounded-0 px-0" rows="6" placeholder="Nội dung đánh giá *"></textarea>
                                </div>
                                <div className="col-md-6 d-flex align-items-center gap-3">
                                    <span className="text-muted">Chọn đánh giá:</span>
                                    <Rating small />
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <button type="button" className="btn btn-primary rounded-pill px-4 py-3">Gửi bình luận</button>
                                </div>
                            </div>
                        </motion.div>
                    </main>
                </div>

                <motion.section
                    className="single-related-section pt-5"
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={singleViewport}
                    transition={singleTransition}
                >
                    <div className="text-center mx-auto mb-5" style={{ maxWidth: 560 }}>
                        <h4 className="text-primary border-bottom border-primary d-inline-block pb-2">Sản phẩm liên quan</h4>
                        <p className="text-muted mt-3">Các sản phẩm cùng nhóm được gợi ý để bạn dễ so sánh, lựa chọn và mua sắm nhanh hơn.</p>
                    </div>
                    <div className="d-flex justify-content-between mb-4">
                        <button className="btn btn-primary rounded-pill px-4" type="button"><i className="fas fa-chevron-left"></i></button>
                        <button className="btn btn-primary rounded-pill px-4" type="button"><i className="fas fa-chevron-right"></i></button>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {relatedProducts.map((item) => (
                            <motion.div
                                key={item.id}
                                className="col-md-6 col-lg-3"
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={singleViewport}
                                transition={singleTransition}
                            >
                                <ProductCard product={item} />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default Single;
