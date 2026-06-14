import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHero from '../../components/store/PageHero';
import { isStoreViewOnlyUser, setPageMeta, STORE_VIEW_ONLY_MESSAGE, t } from '../../utils/store';
import { useStoreSettings } from '../../contexts/StoreSettingsContext';

const Contact = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const settings = useStoreSettings();
    const contactItems = [
        settings.address && { icon: 'fas fa-map-marker-alt', title: 'Address', text: settings.address },
        settings.supportEmail && { icon: 'fas fa-envelope', title: 'Mail Us', text: settings.supportEmail },
        settings.hotline && { icon: 'fas fa-phone-alt', title: 'Telephone', text: settings.hotline },
        settings.supportTime && { icon: 'fas fa-clock', title: 'Working Hours', text: settings.supportTime },
    ].filter(Boolean);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = React.useState({ loading: false, success: false, error: '' });

    useEffect(() => {
        setPageMeta({
            title: `${t('Contact Us')} | TechStore`,
            description: t('Contact meta description'),
        });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewOnly) {
            setStatus({ loading: false, success: false, error: STORE_VIEW_ONLY_MESSAGE });
            return;
        }
        setStatus({ loading: true, success: false, error: '' });
        try {
            const { ticketApi } = await import('../../services/api');
            const response = await ticketApi.create({
                category: 'Contact',
                subject: formData.subject || 'Liên hệ từ khách hàng',
                description: formData.message,
                customerName: formData.name,
                customerEmail: formData.email,
                customerPhone: formData.phone
            });
            const ticket = response.data;
            setStatus({ loading: false, success: true, error: '' });
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            if (isAuthenticated && ticket?.id) {
                navigate(`/tickets/${ticket.id}`);
                return;
            }
        } catch (err) {
            setStatus({ loading: false, success: false, error: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' });
        }
    };

    return (
        <>
            <PageHero title={t('Contact Us')} current={t('Contact')} kicker="Liên hệ" />

            <section className="ts-container py-12">
                <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
                    {/* Form */}
                    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
                        <p className="ts-eyebrow text-[var(--color-accent)]">{t("Let's Connect")}</p>
                        <h2 className="ts-display mt-3 text-3xl text-[var(--color-fg)]">{t('Send Your Message')}</h2>
                        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">{t('We are here for you!')}</p>

                        {status.success && (
                            <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500">
                                Cảm ơn bạn! Tin nhắn đã được gửi thành công.
                            </div>
                        )}
                        {status.error && (
                            <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
                                {status.error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label>
                                <span className="ts-eyebrow mb-1.5 block text-[10px]">{t('Your Name')}</span>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="ts-input" placeholder="Nguyễn Văn A" />
                            </label>
                            <label>
                                <span className="ts-eyebrow mb-1.5 block text-[10px]">{t('Your Email')}</span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="ts-input" placeholder="email@example.com" />
                            </label>
                            <label>
                                <span className="ts-eyebrow mb-1.5 block text-[10px]">{t('Your Phone')}</span>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="ts-input" placeholder="0327 188 459" />
                            </label>
                            <label>
                                <span className="ts-eyebrow mb-1.5 block text-[10px]">{t('Subject')}</span>
                                <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className="ts-input" placeholder="Chủ đề..." />
                            </label>
                            <label className="md:col-span-2">
                                <span className="ts-eyebrow mb-1.5 block text-[10px]">{t('Message')}</span>
                                <textarea required rows="6" name="message" value={formData.message} onChange={handleChange} className="ts-input resize-none" placeholder="Nội dung của bạn..."></textarea>
                            </label>
                            <button disabled={status.loading} type="submit" className="ts-btn ts-btn-primary md:col-span-2">
                                <i className="fas fa-paper-plane"></i>{status.loading ? 'Đang gửi...' : t('Send Message')}
                            </button>
                        </form>
                    </div>

                    {/* Map + contact */}
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                            <iframe
                                className="h-72 w-full grayscale [filter:invert(0.92)_hue-rotate(180deg)_grayscale(0.8)]"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d105.7!3d21.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2sHanoi%20Vietnam!5e0!3m2!1sen!2svn!4v1694259649153!5m2!1sen!2svn"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="TechStore map"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {contactItems.map((item) => (
                                <div key={item.title} className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)]">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                                        <i className={item.icon}></i>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="ts-eyebrow text-[10px]">{t(item.title)}</p>
                                        <p className="mt-0.5 truncate text-sm text-[var(--color-fg)]">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Contact;
