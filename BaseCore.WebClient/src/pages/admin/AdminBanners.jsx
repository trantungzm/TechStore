import React, { useState } from 'react';
import { bannerApi, uploadApi } from '../../services/api';
import { resolveProductImage } from '../../utils/store';
import { confirmDialog } from '../../utils/notify';
import { useBanners } from '../../hooks/useBanners';

const inputClass = 'rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-blue-100';

const defaultForm = () => ({
    kicker: '',
    title: '',
    subTitle: '',
    ctaLabel: '',
    ctaTo: '',
    imageUrl: '',
    offerTitle: '',
    offerDiscount: '',
    offerProduct: '',
    displayOrder: 0,
    isActive: true,
});

const AdminBanners = () => {
    const { banners, loading, error, setError, reload } = useBanners();
    const [form, setForm] = useState(defaultForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            let imageUrl = form.imageUrl;
            
            // Upload image if a new file is selected
            if (imageFile) {
                const uploadResponse = await uploadApi.uploadProductImages([imageFile]);
                const uploadedUrls = uploadResponse.data?.urls || uploadResponse.data || [];
                if (uploadedUrls.length > 0) {
                    imageUrl = uploadedUrls[0];
                }
            }

            const bannerData = {
                ...form,
                imageUrl,
            };

            if (editingId) {
                await bannerApi.update(editingId, bannerData);
                setSuccess('Cập nhật banner thành công');
            } else {
                await bannerApi.create(bannerData);
                setSuccess('Tạo banner thành công');
            }

            setForm(defaultForm);
            setEditingId(null);
            setImageFile(null);
            setShowForm(false);
            reload();
        } catch (err) {
            setError(editingId ? 'Không thể cập nhật banner' : 'Không thể tạo banner');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (banner) => {
        setForm({
            kicker: banner.kicker || '',
            title: banner.title || '',
            subTitle: banner.subTitle || '',
            ctaLabel: banner.ctaLabel || '',
            ctaTo: banner.ctaTo || '',
            imageUrl: banner.imageUrl || '',
            offerTitle: banner.offerTitle || '',
            offerDiscount: banner.offerDiscount || '',
            offerProduct: banner.offerProduct || '',
            displayOrder: banner.displayOrder || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true,
        });
        setEditingId(banner.id);
        setImageFile(null);
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const handleOpenCreate = () => {
        setForm(defaultForm);
        setEditingId(null);
        setImageFile(null);
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!(await confirmDialog({ title: 'Xoá banner', message: 'Bạn chắc chắn muốn xoá banner này?', tone: 'danger', confirmText: 'Xoá' }))) return;

        try {
            await bannerApi.delete(id);
            setSuccess('Xoá banner thành công');
            reload();
        } catch (err) {
            setError('Không thể xoá banner');
            console.error(err);
        }
    };

    const handleToggle = async (id) => {
        try {
            await bannerApi.toggle(id);
            reload();
        } catch (err) {
            setError('Không thể đổi trạng thái hiển thị');
            console.error(err);
        }
    };

    const handleCancel = () => {
        setForm(defaultForm);
        setEditingId(null);
        setImageFile(null);
        setError('');
        setSuccess('');
        setShowForm(false);
    };

    if (loading) {
        return <div className="p-8 text-center">Đang tải...</div>;
    }

    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">Quản lý banner</h1>
                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    <i className="fas fa-plus"></i>Thêm banner
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-4 text-green-700">
                    {success}
                </div>
            )}

            {/* Form (modal) */}
            {showForm && (
            <div
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
                onClick={handleCancel}
            >
                <div
                    className="my-6 w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                        <h2 className="text-xl font-semibold">
                            {editingId ? 'Sửa banner' : 'Tạo banner mới'}
                        </h2>
                        <button
                            type="button"
                            onClick={handleCancel}
                            aria-label="Đóng"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    {error && (
                        <div className="mx-6 mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Dòng nhấn (Kicker)</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.kicker}
                                onChange={(e) => setForm({ ...form, kicker: e.target.value })}
                                placeholder="vd: Giảm đến 10.000.000₫"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="vd: MacBook Air M2 chính hãng"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Mô tả ngắn</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.subTitle}
                                onChange={(e) => setForm({ ...form, subTitle: e.target.value })}
                                placeholder="vd: Trả góp 0%, bảo hành 12 tháng"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Nút kêu gọi (CTA)</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.ctaLabel}
                                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                                placeholder="vd: Xem chi tiết"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Link CTA</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.ctaTo}
                                onChange={(e) => setForm({ ...form, ctaTo: e.target.value })}
                                placeholder="vd: /product/123"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Thứ tự hiển thị</label>
                            <input
                                type="number"
                                className={inputClass}
                                value={form.displayOrder}
                                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">Ảnh banner</label>
                        <input
                            type="file"
                            className={inputClass}
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        {form.imageUrl && (
                            <div className="mt-2">
                                <img
                                    src={resolveProductImage({ imageUrl: form.imageUrl, id: editingId || 1 })}
                                    alt="Xem trước banner"
                                    className="h-32 w-auto rounded-md border border-[var(--color-border)]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Special Offer Section */}
                    <div className="border-t border-[var(--color-border)] pt-4">
                        <h3 className="mb-3 text-lg font-semibold">Ưu đãi (tuỳ chọn)</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Tiêu đề ưu đãi</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={form.offerTitle}
                                    onChange={(e) => setForm({ ...form, offerTitle: e.target.value })}
                                    placeholder="vd: Ưu đãi hôm nay"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Mức giảm (VND)</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={form.offerDiscount}
                                    onChange={(e) => setForm({ ...form, offerDiscount: e.target.value })}
                                    placeholder="vd: 500000"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Tên sản phẩm (hiển thị)</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={form.offerProduct}
                                    onChange={(e) => setForm({ ...form, offerProduct: e.target.value })}
                                    placeholder="vd: MacBook Air M2 256GB"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="mr-2 h-4 w-4"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">
                            Hiển thị trên trang chủ
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-white hover:bg-[var(--color-accent)]/90 disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-md border border-[var(--color-border)] px-4 py-2 hover:bg-[var(--color-surface-2)]"
                            >
                                Huỷ
                            </button>
                        )}
                    </div>
                    </form>
                </div>
            </div>
            )}

            {/* Banners List */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Danh sách banner</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-fg-muted)]">
                    <i className="fas fa-images text-[var(--color-accent)]"></i>
                    {banners.length} banner
                    <span className="text-[var(--color-fg-dim)]">· {banners.filter((b) => b.isActive).length} đang hiển thị</span>
                </span>
            </div>

            {banners.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
                        <i className="fas fa-image text-2xl text-[var(--color-fg-dim)]"></i>
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-[var(--color-fg)]">Chưa có banner nào</h4>
                    <p className="mt-1 text-sm text-[var(--color-fg-muted)]">Hãy tạo banner đầu tiên ở form phía trên.</p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {banners
                        .slice()
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((banner) => (
                            <div
                                key={banner.id}
                                className={`group flex flex-col overflow-hidden rounded-2xl border bg-[var(--color-surface)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                    banner.isActive ? 'border-[var(--color-border)]' : 'border-[var(--color-border)] opacity-75'
                                }`}
                            >
                                {/* Preview ảnh */}
                                <div className="relative aspect-[16/7] overflow-hidden bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface-3)]">
                                    {banner.imageUrl ? (
                                        <img
                                            src={resolveProductImage({ imageUrl: banner.imageUrl, id: banner.id })}
                                            alt={banner.title || 'Banner'}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[var(--color-fg-dim)]">
                                            <i className="fas fa-image text-3xl"></i>
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <span className="absolute left-3 top-3 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-black/55 px-2 text-xs font-bold text-white backdrop-blur-sm">
                                        #{banner.displayOrder}
                                    </span>
                                    <span
                                        className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${
                                            banner.isActive ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/80 text-white'
                                        }`}
                                    >
                                        <i className={`fas ${banner.isActive ? 'fa-eye' : 'fa-eye-slash'} text-[10px]`}></i>
                                        {banner.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                                    </span>
                                    {banner.ctaLabel && (
                                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-fg)] backdrop-blur-sm">
                                            <i className="fas fa-arrow-pointer text-[10px] text-[var(--color-accent)]"></i>
                                            {banner.ctaLabel}
                                        </span>
                                    )}
                                </div>

                                {/* Nội dung */}
                                <div className="flex flex-1 flex-col p-4">
                                    {banner.kicker && (
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)]">{banner.kicker}</p>
                                    )}
                                    <h3 className="mt-1 line-clamp-1 text-base font-bold text-[var(--color-fg)]">{banner.title}</h3>
                                    {banner.subTitle && (
                                        <p className="mt-1 line-clamp-2 text-sm text-[var(--color-fg-muted)]">{banner.subTitle}</p>
                                    )}
                                    {(banner.offerTitle || banner.offerProduct || banner.offerDiscount) && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {banner.offerTitle && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                    <i className="fas fa-gift text-[10px]"></i>{banner.offerTitle}
                                                </span>
                                            )}
                                            {banner.offerProduct && (
                                                <span className="inline-flex items-center rounded-md bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-fg-muted)]">
                                                    {banner.offerProduct}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {banner.ctaTo && (
                                        <p className="mt-3 truncate text-[11px] text-[var(--color-fg-dim)]">
                                            <i className="fas fa-link mr-1"></i>{banner.ctaTo}
                                        </p>
                                    )}
                                </div>

                                {/* Thao tác */}
                                <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-t border-[var(--color-border)]">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-blue-600"
                                    >
                                        <i className="fas fa-pen text-xs"></i>Sửa
                                    </button>
                                    <button
                                        onClick={() => handleToggle(banner.id)}
                                        className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-amber-600"
                                    >
                                        <i className={`fas ${banner.isActive ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                                        {banner.isActive ? 'Ẩn' : 'Hiện'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        <i className="fas fa-trash text-xs"></i>Xoá
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default AdminBanners;