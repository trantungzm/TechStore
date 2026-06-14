import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import ProductCard from '../../components/store/ProductCard';
import PageHero from '../../components/store/PageHero';
import { isStoreViewOnlyUser, setPageMeta, STORE_VIEW_ONLY_MESSAGE, t, toast } from '../../utils/store';
import { confirmDialog } from '../../utils/notify';

const hasActiveVariants = (product) => Array.isArray(product?.variants) && product.variants.some((variant) => variant?.isActive !== false);

const Wishlist = () => {
    const { user } = useAuth();
    const { wishlistItems, clearWishlist } = useWishlist();
    const { addItem } = useCart();
    const isViewOnly = isStoreViewOnlyUser(user);

    useEffect(() => {
        setPageMeta({
            title: `${t('Wishlist')} | TechStore`,
            description: t('Wishlist meta description'),
        });
    }, []);

    const handleAddAll = () => {
        if (isViewOnly) {
            toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        const inStock = wishlistItems.filter((p) => p.stock > 0 && !hasActiveVariants(p));
        if (inStock.length === 0) {
            toast('Không có sản phẩm nào có thể thêm nhanh. Vui lòng chọn phiên bản trong trang chi tiết.', 'danger');
            return;
        }
        inStock.forEach((p) => addItem(p, 1));
        const skipped = wishlistItems.filter((p) => p.stock > 0 && hasActiveVariants(p)).length;
        toast(`Đã thêm ${inStock.length} sản phẩm vào giỏ hàng${skipped ? `, bỏ qua ${skipped} sản phẩm cần chọn phiên bản` : ''}.`, 'success');
    };

    return (
        <>
            <PageHero title={t('Wishlist')} current={t('Wishlist')} kicker="Đã lưu" />

            <section className="ts-container py-12">
                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center rounded-md border border-dashed border-[var(--color-border)] py-20 text-center">
                        <i className="far fa-heart text-4xl text-[var(--color-fg-dim)]"></i>
                        <h4 className="ts-display mt-6 text-2xl">{t('Your wishlist is empty')}</h4>
                        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Hãy thêm sản phẩm bạn yêu thích để lưu lại cho sau.</p>
                        <Link to="/shop" className="ts-btn ts-btn-primary mt-6">{t('Continue Shopping')}</Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <p className="text-sm text-[var(--color-fg-muted)]">
                                <i className="fas fa-heart mr-2 text-[var(--color-primary)]"></i>
                                <strong className="text-[var(--color-fg)]">{wishlistItems.length}</strong> sản phẩm yêu thích
                            </p>
                            <div className="flex gap-2">
                                <button onClick={handleAddAll} className="ts-btn ts-btn-primary text-xs">
                                    <i className="fas fa-shopping-cart"></i>Thêm tất cả vào giỏ
                                </button>
                                <button
                                    onClick={() => confirmDialog({ title: 'Xóa danh sách yêu thích', message: 'Xóa toàn bộ danh sách yêu thích?', tone: 'danger', confirmText: 'Xóa' }).then((ok) => { if (ok) clearWishlist(); })}
                                    className="ts-btn ts-btn-outline text-xs"
                                >
                                    <i className="fas fa-trash"></i>Xóa tất cả
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                            {wishlistItems.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </>
    );
};

export default Wishlist;
