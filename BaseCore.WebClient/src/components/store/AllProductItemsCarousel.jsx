import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import ProductMiniCard from './ProductMiniCard';
import { t } from '../../utils/store';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const AllProductItemsCarousel = ({ products, onAddToCart }) => {
    const swiperRef = useRef(null);

    return (
        <div className="container">
            <div className="text-center mx-auto mb-5" style={{ maxWidth: 700 }}>
                <h4 className="electro-kicker">{t('Products')}</h4>
                <h1 className="display-4 fw-bold">{t('All Product Items')}</h1>
            </div>

            <div
                className="electro-swiper-wrap electro-all-products-carousel"
                onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
                onMouseLeave={() => swiperRef.current?.autoplay?.start()}
            >
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    loop
                    speed={2000}
                    spaceBetween={24}
                    grabCursor
                    watchSlidesProgress
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        576: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        992: { slidesPerView: 2 },
                        1200: { slidesPerView: 2 },
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onBeforeDestroy={() => {
                        swiperRef.current = null;
                    }}
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <ProductMiniCard product={product} onAddToCart={onAddToCart} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button type="button" className="electro-swiper-nav electro-swiper-prev" aria-label="Previous products" onClick={() => swiperRef.current?.slidePrev()}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                <button type="button" className="electro-swiper-nav electro-swiper-next" aria-label="Next products" onClick={() => swiperRef.current?.slideNext()}>
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

export default AllProductItemsCarousel;
