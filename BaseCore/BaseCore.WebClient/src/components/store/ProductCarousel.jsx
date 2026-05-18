import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductCarousel = ({ products, renderProduct, className = '' }) => {
    const swiperRef = useRef(null);

    return (
        <div
            className={`electro-swiper-wrap ${className}`}
            onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
            onMouseLeave={() => swiperRef.current?.autoplay?.start()}
        >
            <Swiper
                modules={[Autoplay, Pagination]}
                loop={products.length > 4}
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
                    1200: { slidesPerView: 4 },
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
                        {renderProduct(product)}
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
    );
};

export default ProductCarousel;
