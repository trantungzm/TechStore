import React, { useEffect, useState } from 'react';
import { bannerApi, uploadApi } from '../services/api';
import { resolveProductImage } from '../utils/store';

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
    const [banners, setBanners] = useState([]);
    const [form, setForm] = useState(defaultForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const loadBanners = async () => {
        try {
            setLoading(true);
            const response = await bannerApi.getAll();
            setBanners(response.data || []);
        } catch (err) {
            setError('Không tải được danh sách banner');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

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
            loadBanners();
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
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xoá banner này?')) return;

        try {
            await bannerApi.delete(id);
            setSuccess('Xoá banner thành công');
            loadBanners();
        } catch (err) {
            setError('Không thể xoá banner');
            console.error(err);
        }
    };

    const handleToggle = async (id) => {
        try {
            await bannerApi.toggle(id);
            loadBanners();
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
    };

    if (loading) {
        return <div className="p-8 text-center">Đang tải...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="mb-6 text-3xl font-bold">Quản lý banner</h1>

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

            {/* Form */}
            <div className="mb-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
                <h2 className="mb-4 text-xl font-semibold">
                    {editingId ? 'Sửa banner' : 'Tạo banner mới'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Banners List */}
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
                <div className="border-b border-[var(--color-border)] p-4">
                    <h2 className="text-xl font-semibold">Danh sách banner</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--color-surface-2)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Thứ tự</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Ảnh</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Kicker</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Tiêu đề</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">CTA</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        Chưa có banner nào. Hãy tạo banner đầu tiên ở form phía trên.
                                    </td>
                                </tr>
                            ) : (
                                banners
                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                    .map((banner) => (
                                        <tr key={banner.id} className="border-t border-[var(--color-border)]">
                                            <td className="px-4 py-3 text-sm">{banner.displayOrder}</td>
                                            <td className="px-4 py-3">
                                                {banner.imageUrl && (
                                                    <img
                                                        src={resolveProductImage({ imageUrl: banner.imageUrl, id: banner.id })}
                                                        alt="Banner"
                                                        className="h-16 w-24 rounded-md object-cover border border-[var(--color-border)]"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{banner.kicker}</td>
                                            <td className="px-4 py-3 text-sm max-w-xs truncate">{banner.title}</td>
                                            <td className="px-4 py-3 text-sm">{banner.ctaLabel}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-1 text-xs ${
                                                        banner.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {banner.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(banner)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(banner.id)}
                                                        className="text-yellow-600 hover:text-yellow-800"
                                                    >
                                                        {banner.isActive ? 'Ẩn' : 'Hiện'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(banner.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Xoá
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBanners;