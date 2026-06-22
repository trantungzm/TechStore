import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/store/PageHero';
import { setPageMeta, toast } from '../../utils/store';
import { cn } from '../../utils/cn';
import { repairApi, uploadApi, warrantyApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useStoreSettings } from '../../contexts/StoreSettingsContext';
import { claimStatusLabel, repairStatusLabel, warrantyStatusLabel } from '../../utils/warrantyStatus';

const policyGroups = [
    {
        icon: 'fa-shield-alt',
        title: 'Bảo hành điện tử',
        items: [
            'Bảo hành gắn với thiết bị theo Serial/IMEI',
            'Kích hoạt bảo hành ngay trong tài khoản sau khi nhận hàng',
            'Thời hạn bảo hành tính từ ngày kích hoạt',
            'Theo dõi trạng thái xử lý bảo hành trực tuyến',
        ],
    },
    {
        icon: 'fa-clipboard-check',
        title: 'Điều kiện bảo hành',
        items: [
            'Lỗi phát sinh do nhà sản xuất trong thời hạn bảo hành',
            'Sản phẩm còn nguyên trạng, không bị can thiệp',
            'Serial/IMEI hợp lệ và thuộc đơn hàng của bạn',
            'Phụ kiện đi kèm theo chính sách riêng của hãng',
        ],
    },
    {
        icon: 'fa-exclamation-triangle',
        title: 'Không thuộc bảo hành',
        items: [
            'Rơi vỡ, móp méo, cong vênh',
            'Vào nước, ẩm mốc, cháy nổ',
            'Sử dụng sai hướng dẫn hoặc tự ý sửa chữa',
            'Hết thời hạn bảo hành',
        ],
    },
];

const faqs = [
    ['Bảo hành điện tử khác gì bảo hành giấy?', 'Bảo hành điện tử liên kết theo Serial/IMEI và hiển thị trực tiếp trong tài khoản của bạn, không cần nhập tay để tra cứu.'],
    ['Thời hạn bảo hành tính từ khi nào?', 'Thời hạn bảo hành được tính từ ngày bạn kích hoạt lần đầu (thường là lúc bạn khởi động thiết bị lần đầu).'],
    ['Tôi có cần nhập mã đơn/serial để tạo yêu cầu không?', 'Không cần. Bạn chỉ cần chọn thiết bị trong “Sản phẩm của tôi” và mô tả lỗi.'],
    ['Tôi theo dõi tiến trình sửa chữa ở đâu?', 'Trong phần “Lịch sử sửa chữa”, bạn sẽ thấy các mốc trạng thái được cập nhật liên tục.'],
];

const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN');
};

const monthsBetween = (from, to) => {
    if (!from || !to) return 0;
    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diffDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.floor(diffDays / 30);
};

const statusLabel = warrantyStatusLabel;

const statusStyle = (status) => {
    const base = "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider";
    if (status === 'Active') return cn(base, "border-emerald-500/40 bg-emerald-500/10 text-emerald-300");
    if (status === 'NotActivated') return cn(base, "border-amber-500/40 bg-amber-500/10 text-amber-300");
    if (status === 'Expired') return cn(base, "border-red-500/40 bg-red-500/10 text-red-300");
    return cn(base, "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg-muted)]");
};

const CLAIM_TIMELINE = ['Pending', 'Confirmed', 'Received', 'Diagnosing', 'Repairing', 'ReadyToReturn', 'Delivered', 'Completed'];
const REPAIR_TIMELINE = ['Pending', 'Intake', 'Diagnosing', 'WaitingCustomerApproval', 'WaitingParts', 'Repairing', 'Testing', 'Completed', 'Delivered'];

const timelineIndex = (status, steps) => {
    const s = String(status || '').trim();
    const idx = steps.findIndex((x) => x === s);
    return idx >= 0 ? idx : 0;
};

const Timeline = ({ steps = [], current = '', getLabel = claimStatusLabel }) => {
    const currentIdx = timelineIndex(current, steps);
    return (
        <div className="mt-3 flex flex-wrap items-center gap-1">
            {steps.map((step, idx) => {
                const done = idx <= currentIdx;
                return (
                    <React.Fragment key={step}>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                                done ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-fg-dim)]"
                            )}>
                                <i className={`fas ${idx < currentIdx ? 'fa-check' : 'fa-circle text-[6px]'}`}></i>
                            </div>
                            <span className={cn("text-[11px]", done ? "text-[var(--color-fg)]" : "text-[var(--color-fg-dim)]")}>{getLabel(step)}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={cn("h-px w-6", done && idx < currentIdx ? "bg-[var(--color-primary)]/60" : "bg-[var(--color-border)]")} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const Warranty = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const settings = useStoreSettings();
    const hotline = settings.hotline || '';
    const hotlineTel = hotline.replace(/\s+/g, '');
    const supportEmail = settings.supportEmail || '';
    const supportTime = settings.supportTime || '';
    const [openFaq, setOpenFaq] = useState(0);
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [activating, setActivating] = useState(false);
    const [claims, setClaims] = useState([]);
    const [claimsLoading, setClaimsLoading] = useState(false);
    const [repairs, setRepairs] = useState([]);
    const [repairsLoading, setRepairsLoading] = useState(false);
    const [repairUpdates, setRepairUpdates] = useState({});
    const [repairOpenId, setRepairOpenId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [issueDescription, setIssueDescription] = useState('');
    const [receiveMethod, setReceiveMethod] = useState('');
    const [returnAddress, setReturnAddress] = useState('');
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState([]);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitCode, setSubmitCode] = useState('');
    const [publicLookup, setPublicLookup] = useState({ serialOrImei: '', orderCode: '', phone: '' });
    const [publicLookupState, setPublicLookupState] = useState({ loading: false, error: '', result: null });
    const [publicActivatingId, setPublicActivatingId] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const [imageLoading, setImageLoading] = useState({});

    useEffect(() => {
        setPageMeta({ title: 'Trung tâm bảo hành | TechStore', description: 'Xem thiết bị đã mua, kích hoạt bảo hành và gửi yêu cầu sửa chữa.' });
    }, []);

    useEffect(() => () => attachmentPreviews.forEach((i) => URL.revokeObjectURL(i.url)), [attachmentPreviews]);

    const handleImageLoad = (warrantyId) => {
        setImageLoading((prev) => ({ ...prev, [warrantyId]: false }));
        setImageErrors((prev) => ({ ...prev, [warrantyId]: false }));
    };

    const handleImageError = (warrantyId) => {
        console.warn(`Failed to load image for warranty ID: ${warrantyId}`);
        setImageLoading((prev) => ({ ...prev, [warrantyId]: false }));
        setImageErrors((prev) => ({ ...prev, [warrantyId]: true }));
    };

    const retryImageLoad = (warrantyId) => {
        setImageErrors((prev) => ({ ...prev, [warrantyId]: false }));
        setImageLoading((prev) => ({ ...prev, [warrantyId]: true }));
    };

    const normalizeImageUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        const trimmed = url.trim();
        if (!trimmed) return null;
        // Nếu là relative path, giữ nguyên
        if (trimmed.startsWith('/')) return trimmed;
        // Nếu là absolute URL
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
        // Nếu là path không bắt đầu bằng /, thêm /
        return `/${trimmed}`;
    };

    const loadWarranties = async () => {
        setLoading(true);
        setError('');
        setImageErrors({});
        try {
            const res = await warrantyApi.getMy();
            const items = Array.isArray(res.data) ? res.data : [];
            console.log('Warranties loaded:', items);
            if (items.length > 0) {
                items.forEach((w, idx) => {
                    const normalized = normalizeImageUrl(w.productImage);
                    console.log(`Warranty ${idx} (ID: ${w.id}) - Original image: "${w.productImage}" -> Normalized: "${normalized}"`);
                });
            }
            setWarranties(items);
            if (!selectedId && items.length > 0) setSelectedId(items[0].id);
        } catch (e) {
            const data = e.response?.data;
            console.error('Error loading warranties:', data);
            setError(data?.message || data?.detail || data?.title || 'Không tải được danh sách bảo hành.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            setWarranties([]);
            setSelectedId(null);
            return;
        }
        loadWarranties();
    }, [authLoading, isAuthenticated]);

    const selectedWarranty = useMemo(() => warranties.find((w) => w.id === selectedId) || null, [warranties, selectedId]);

    const loadClaims = async (warrantyId) => {
        if (!warrantyId) return;
        setClaimsLoading(true);
        try {
            const res = await warrantyApi.getMyClaims({ warrantyId });
            setClaims(Array.isArray(res.data) ? res.data : []);
        } catch {
            setClaims([]);
        } finally {
            setClaimsLoading(false);
        }
    };

    const loadRepairs = async (serialOrImei) => {
        if (!serialOrImei) { setRepairs([]); return; }
        setRepairsLoading(true);
        try {
            const res = await repairApi.getMy({ serialOrImei, page: 1, pageSize: 50 });
            setRepairs(Array.isArray(res.data) ? res.data : []);
        } catch {
            setRepairs([]);
        } finally {
            setRepairsLoading(false);
        }
    };

    useEffect(() => {
        setClaims([]);
        setRepairs([]);
        setRepairUpdates({});
        setRepairOpenId(null);
        setSubmitMessage('');
        setSubmitCode('');
        if (!selectedWarranty) return;
        loadClaims(selectedWarranty.id);
        loadRepairs(selectedWarranty.serialOrImei);
    }, [selectedWarranty?.id]);

    const handleActivate = async () => {
        if (!selectedWarranty) return;
        setActivating(true);
        try {
            const res = await warrantyApi.activate(selectedWarranty.id);
            setWarranties((current) => current.map((w) => (w.id === selectedWarranty.id ? res.data : w)));
            toast('Kích hoạt bảo hành thành công', 'success');
        } catch (e) {
            toast(e.response?.data?.message || e.response?.data?.detail || 'Không thể kích hoạt bảo hành.', 'danger');
        } finally {
            setActivating(false);
        }
    };

    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 3);
        attachmentPreviews.forEach((i) => URL.revokeObjectURL(i.url));
        setAttachmentFiles(files);
        setAttachmentPreviews(files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })));
    };

    const toggleRepair = async (repairId) => {
        const next = repairOpenId === repairId ? null : repairId;
        setRepairOpenId(next);
        if (!next) return;
        if (repairUpdates[next]) return;
        try {
            const res = await repairApi.getMyUpdates(next);
            setRepairUpdates((c) => ({ ...c, [next]: Array.isArray(res.data) ? res.data : [] }));
        } catch {
            setRepairUpdates((c) => ({ ...c, [next]: [] }));
        }
    };

    const handleSubmitClaim = async (e) => {
        e.preventDefault();
        if (!selectedWarranty) return;
        const issue = issueDescription.trim();
        if (issue.length < 15) return toast('Mô tả lỗi tối thiểu 15 ký tự.', 'danger');
        if (!receiveMethod) return toast('Vui lòng chọn hình thức gửi.', 'danger');
        if (receiveMethod === 'Shipping' && !returnAddress.trim()) return toast('Vui lòng nhập địa chỉ nhận lại.', 'danger');

        setSubmitting(true);
        try {
            let urls = [];
            if (attachmentFiles.length > 0) {
                const up = await uploadApi.uploadTicketAttachments(attachmentFiles);
                urls = up.data?.urls || (up.data?.url ? [up.data.url] : []);
            }
            const payload = {
                warrantyId: selectedWarranty.id,
                issueDescription: issue,
                receiveMethod,
                returnAddress: receiveMethod === 'Shipping' ? returnAddress.trim() : null,
                attachments: urls,
            };
            const res = await warrantyApi.createClaim(payload);
            setSubmitMessage(res.data?.message || 'Yêu cầu bảo hành đã được gửi.');
            setSubmitCode(res.data?.claimCode || '');
            setIssueDescription('');
            setReceiveMethod('');
            setReturnAddress('');
            attachmentPreviews.forEach((i) => URL.revokeObjectURL(i.url));
            setAttachmentFiles([]);
            setAttachmentPreviews([]);
            await loadClaims(selectedWarranty.id);
            toast('Đã tạo yêu cầu bảo hành', 'success');
        } catch (err) {
            toast(err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || 'Không thể tạo yêu cầu bảo hành.', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePublicLookup = async (e) => {
        e.preventDefault();
        const serialOrImei = publicLookup.serialOrImei.trim();
        const orderCode = publicLookup.orderCode.trim();
        const phone = publicLookup.phone.trim();
        if (!serialOrImei && !orderCode && !phone) {
            return setPublicLookupState({ loading: false, error: 'Vui lòng nhập Serial/IMEI, mã đơn hoặc SĐT.', result: null });
        }
        setPublicLookupState({ loading: true, error: '', result: null });
        try {
            const res = await warrantyApi.lookup({ serialOrImei: serialOrImei || null, orderCode: orderCode || null, phone: phone || null });
            const payload = res.data || {};
            const items = Array.isArray(payload.warranties) ? payload.warranties : [];
            setPublicLookupState({ loading: false, error: '', result: items });
        } catch (err) {
            const data = err.response?.data;
            setPublicLookupState({ loading: false, error: data?.message || data?.detail || data?.title || 'Không tìm thấy thông tin bảo hành.', result: null });
        }
        return undefined;
    };

    const handlePublicActivate = async (warranty) => {
        const serialOrImei = publicLookup.serialOrImei.trim() || warranty?.serialOrImei || '';
        const phone = publicLookup.phone.trim();
        const orderCode = publicLookup.orderCode.trim() || null;
        if (!serialOrImei) return toast('Vui lòng nhập Serial/IMEI.', 'danger');
        if (!phone) return toast('Vui lòng nhập số điện thoại.', 'danger');
        setPublicActivatingId(warranty?.id || 'x');
        try {
            await warrantyApi.activatePublic({ serialOrImei, phone, orderCode });
            toast('Đã kích hoạt bảo hành', 'success');
            await handlePublicLookup({ preventDefault: () => undefined });
        } catch (err) {
            toast(err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || 'Không thể kích hoạt bảo hành.', 'danger');
        } finally {
            setPublicActivatingId(null);
        }
    };

    const usage = useMemo(() => {
        const months = selectedWarranty?.warrantyMonths || 0;
        const activatedAt = selectedWarranty?.activatedAt || null;
        if (!months || !activatedAt) return { used: 0, total: months, percent: 0 };
        const used = Math.min(months, monthsBetween(activatedAt, Date.now()));
        const percent = months > 0 ? Math.round((used / months) * 100) : 0;
        return { used, total: months, percent };
    }, [selectedWarranty?.id, selectedWarranty?.activatedAt, selectedWarranty?.warrantyMonths]);

    return (
        <>
            <PageHero title="Trung tâm bảo hành" current="Bảo hành" kicker="Bảo hành điện tử" />

            <section className="ts-container py-12">
                <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
                    <button onClick={() => scrollToSection('my-devices')} className="ts-btn ts-btn-primary">
                        <i className="fas fa-mobile-alt"></i>Sản phẩm của tôi
                    </button>
                    {!isAuthenticated && (
                        <button onClick={() => scrollToSection('public-lookup')} className="ts-btn ts-btn-outline">
                            <i className="fas fa-search"></i>Tra cứu bảo hành
                        </button>
                    )}
                    <button onClick={() => scrollToSection('submit-claim')} className="ts-btn ts-btn-outline">
                        <i className="fas fa-tools"></i>Gửi yêu cầu sửa chữa
                    </button>
                </div>

                <section className="mb-16">
                    <div className="mb-8 text-center">
                        <p className="ts-eyebrow text-[var(--color-primary)]">Chính sách</p>
                        <h2 className="ts-display mt-3 text-2xl md:text-3xl">Chính sách bảo hành điện tử</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {policyGroups.map((g) => (
                            <article key={g.title} className="ts-panel p-6">
                                <i className={`fas ${g.icon} text-2xl text-[var(--color-primary)]`}></i>
                                <h3 className="ts-display mt-4 text-lg">{g.title}</h3>
                                <ul className="mt-4 space-y-2 text-sm text-[var(--color-fg-muted)]">
                                    {g.items.map((item) => (
                                        <li key={item} className="flex gap-2">
                                            <i className="fas fa-check mt-1 text-[10px] text-[var(--color-gold)]"></i>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="public-lookup" className="mb-16">
                    <div className="mb-8 text-center">
                        <p className="ts-eyebrow text-[var(--color-primary)]">Tra cứu</p>
                        <h2 className="ts-display mt-3 text-2xl md:text-3xl">Tra cứu bảo hành</h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--color-fg-muted)]">
                            Nhập Serial/IMEI, mã đơn hoặc SĐT để kiểm tra bảo hành điện tử.
                        </p>
                    </div>

                    <div className="ts-panel mx-auto max-w-3xl p-6">
                        <form onSubmit={handlePublicLookup} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <input
                                value={publicLookup.serialOrImei}
                                onChange={(e) => setPublicLookup((c) => ({ ...c, serialOrImei: e.target.value }))}
                                placeholder="Serial/IMEI"
                                className="ts-input"
                            />
                            <input
                                value={publicLookup.orderCode}
                                onChange={(e) => setPublicLookup((c) => ({ ...c, orderCode: e.target.value }))}
                                placeholder="Mã đơn"
                                className="ts-input"
                            />
                            <input
                                value={publicLookup.phone}
                                onChange={(e) => setPublicLookup((c) => ({ ...c, phone: e.target.value }))}
                                placeholder="Số điện thoại"
                                className="ts-input"
                            />
                            <div className="md:col-span-3">
                                <button type="submit" disabled={publicLookupState.loading} className={cn("ts-btn ts-btn-primary w-full", publicLookupState.loading && "opacity-70")}>
                                    <i className="fas fa-search"></i>{publicLookupState.loading ? 'Đang tra cứu...' : 'Tra cứu'}
                                </button>
                            </div>
                        </form>

                        {publicLookupState.error && <p className="mt-3 text-xs text-red-700">{publicLookupState.error}</p>}

                        {Array.isArray(publicLookupState.result) && publicLookupState.result.length > 0 && (
                            <div className="mt-5 space-y-3">
                                {publicLookupState.result.map((w) => (
                                    <div key={w.id} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="ts-eyebrow text-[10px]">Sản phẩm</p>
                                                <p className="text-sm font-semibold text-[var(--color-fg)]">{w.productName || '—'}</p>
                                                <p className="mt-1 text-xs text-[var(--color-fg-muted)]">IMEI/Serial: <span className="ts-mono">{w.serialOrImei || '—'}</span></p>
                                            </div>
                                            <span className={statusStyle(w.status)}>{statusLabel(w.status)}</span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-[var(--color-fg-muted)] sm:grid-cols-2">
                                            <p><span className="ts-eyebrow block text-[10px]">Ngày mua</span>{formatDate(w.purchaseDate)}</p>
                                            <p><span className="ts-eyebrow block text-[10px]">Ngày kích hoạt</span>{formatDate(w.activatedAt)}</p>
                                            <p><span className="ts-eyebrow block text-[10px]">Hết hạn</span>{formatDate(w.expiresAt)}</p>
                                            <p><span className="ts-eyebrow block text-[10px]">Mã BH</span><span className="ts-mono">{w.warrantyCode}</span></p>
                                        </div>
                                        {w.status === 'NotActivated' && (
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-amber-700">Chưa kích hoạt</p>
                                                    <p className="mt-0.5 text-xs text-amber-700/80">Nhập đúng SĐT mua hàng để kích hoạt ngay khi mở máy lần đầu.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={cn("ts-btn ts-btn-primary text-xs", publicActivatingId === w.id && "opacity-70")}
                                                    onClick={() => handlePublicActivate(w)}
                                                    disabled={publicActivatingId === w.id}
                                                >
                                                    <i className="fas fa-bolt"></i>{publicActivatingId === w.id ? 'Đang kích hoạt...' : 'Kích hoạt'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section id="my-devices" className="mb-16">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="ts-eyebrow text-[var(--color-primary)]">Thiết bị của tôi</p>
                            <h2 className="ts-display mt-2 text-3xl">Sản phẩm của tôi</h2>
                            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                                {authLoading ? 'Đang kiểm tra đăng nhập...' : !isAuthenticated ? 'Đăng nhập để xem thiết bị đã mua.' : loading ? 'Đang tải...' : `${warranties.length} thiết bị`}
                            </p>
                        </div>
                        {!isAuthenticated ? (
                            <Link to="/login" className="ts-btn ts-btn-primary text-xs">
                                <i className="fas fa-sign-in-alt"></i>Đăng nhập
                            </Link>
                        ) : (
                            <button type="button" onClick={loadWarranties} className="ts-btn ts-btn-outline text-xs">
                                <i className="fas fa-sync"></i>Làm mới
                            </button>
                        )}
                    </div>

                    {!isAuthenticated ? (
                        <div className="ts-panel p-6">
                            <p className="text-sm text-[var(--color-fg-muted)]">
                                Trung tâm bảo hành hiển thị thiết bị theo Serial/IMEI trong tài khoản của bạn. Vui lòng đăng nhập để tiếp tục.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link to="/login" className="ts-btn ts-btn-primary">
                                    Đăng nhập
                                </Link>
                                <Link to="/orders" className="ts-btn ts-btn-outline">
                                    Xem đơn hàng
                                </Link>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center py-16">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                            <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Đang tải...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{error}</span>
                            <button onClick={loadWarranties} className="ml-auto ts-btn ts-btn-outline px-3 py-1 text-xs">Thử lại</button>
                        </div>
                    ) : warranties.length === 0 ? (
                        <div className="ts-panel flex flex-col items-center border-dashed py-16 text-center">
                            <i className="fas fa-box-open text-4xl text-[var(--color-fg-dim)]"></i>
                            <h4 className="ts-display mt-6 text-xl">Chưa có thiết bị nào</h4>
                            <p className="mt-2 max-w-xl text-sm text-[var(--color-fg-muted)]">
                                Khi đơn hàng hoàn tất và có Serial/IMEI, thiết bị sẽ xuất hiện tại đây.
                            </p>
                            <Link to="/orders" className="ts-btn ts-btn-primary mt-6">Xem đơn hàng</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="space-y-3">
                                {warranties.map((w) => (
                                    <button
                                        key={w.id}
                                        type="button"
                                        onClick={() => setSelectedId(w.id)}
                                        className={cn(
                                            "w-full rounded-[22px] border bg-white/75 p-5 text-left shadow-[var(--shadow-soft)] transition-colors",
                                            selectedId === w.id
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="ts-eyebrow text-[10px]">Thiết bị</p>
                                                <h3 className="mt-1 text-sm font-semibold text-[var(--color-fg)]">{w.productName || '—'}</h3>
                                                <p className="mt-1 text-xs text-[var(--color-fg-muted)]">IMEI/Serial: <span className="ts-mono">{w.serialOrImei || '—'}</span></p>
                                            </div>
                                            <span className={statusStyle(w.status)}>{statusLabel(w.status)}</span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[var(--color-fg-muted)]">
                                            <p><span className="ts-eyebrow block text-[10px]">Kích hoạt</span>{formatDate(w.activatedAt)}</p>
                                            <p><span className="ts-eyebrow block text-[10px]">Hết hạn</span>{formatDate(w.expiresAt)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="ts-panel p-6 lg:col-span-2">
                                {!selectedWarranty ? (
                                    <p className="text-sm text-[var(--color-fg-muted)]">Chọn một thiết bị để xem chi tiết.</p>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="h-14 w-14 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white/75 shadow-[var(--shadow-soft)]">
                                                    {selectedWarranty.productImage && !imageErrors[selectedWarranty.id] ? (
                                                        <>
                                                            {imageLoading[selectedWarranty.id] && (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-fg-dim)]" />
                                                                </div>
                                                            )}
                                                            <img
                                                                src={selectedWarranty.productImage}
                                                                alt={selectedWarranty.productName || 'Product'}
                                                                className="h-full w-full object-cover"
                                                                onLoad={() => handleImageLoad(selectedWarranty.id)}
                                                                onError={() => handleImageError(selectedWarranty.id)}
                                                                loading="lazy"
                                                            />
                                                        </>
                                                    ) : (
                                                        <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                                                            {imageErrors[selectedWarranty.id] ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => retryImageLoad(selectedWarranty.id)}
                                                                    className="group relative flex h-full w-full items-center justify-center transition-colors hover:bg-[var(--color-surface-3)]"
                                                                    title="Thử tải lại"
                                                                >
                                                                    <i className="fas fa-image text-[10px] text-[var(--color-fg-dim)] group-hover:text-[var(--color-fg-muted)]"></i>
                                                                </button>
                                                            ) : (
                                                                <i className="fas fa-mobile-alt text-[var(--color-fg-dim)]"></i>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="ts-eyebrow text-[10px]">Bảo hành</p>
                                                    <h3 className="ts-display mt-1 text-xl">{selectedWarranty.productName || '—'}</h3>
                                                    <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                                                        IMEI/Serial: <span className="ts-mono">{selectedWarranty.serialOrImei || '—'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={statusStyle(selectedWarranty.status)}>{statusLabel(selectedWarranty.status)}</span>
                                                {selectedWarranty.orderCode && (
                                                    <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
                                                        Đơn hàng: <span className="ts-mono">{selectedWarranty.orderCode}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                            <div className="rounded-xl border border-[var(--color-border)] bg-white/68 p-4">
                                                <p className="ts-eyebrow text-[10px]">Ngày mua</p>
                                                <p className="mt-1 font-medium text-[var(--color-fg)]">{formatDate(selectedWarranty.purchaseDate)}</p>
                                            </div>
                                            <div className="rounded-xl border border-[var(--color-border)] bg-white/68 p-4">
                                                <p className="ts-eyebrow text-[10px]">Ngày kích hoạt</p>
                                                <p className="mt-1 font-medium text-[var(--color-fg)]">{formatDate(selectedWarranty.activatedAt)}</p>
                                            </div>
                                            <div className="rounded-xl border border-[var(--color-border)] bg-white/68 p-4">
                                                <p className="ts-eyebrow text-[10px]">Thời hạn</p>
                                                <p className="mt-1 font-medium text-[var(--color-fg)]">{selectedWarranty.warrantyMonths || 0} tháng</p>
                                            </div>
                                            <div className="rounded-xl border border-[var(--color-border)] bg-white/68 p-4">
                                                <p className="ts-eyebrow text-[10px]">Ngày hết hạn</p>
                                                <p className="mt-1 font-medium text-[var(--color-fg)]">{formatDate(selectedWarranty.expiresAt)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-[20px] border border-[var(--color-border)] bg-white/68 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-medium text-[var(--color-fg)]">Đã sử dụng bảo hành</p>
                                                <p className="ts-mono text-xs text-[var(--color-fg-muted)]">{usage.used} / {usage.total || 0} tháng</p>
                                            </div>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]"
                                                    style={{ width: `${Math.min(100, Math.max(0, usage.percent))}%` }}
                                                />
                                            </div>
                                        </div>

                                        {selectedWarranty.status === 'NotActivated' && (
                                            <div className="mt-6 rounded-[20px] border border-amber-500/30 bg-amber-500/10 p-5">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-700">Bảo hành chưa kích hoạt</p>
                                                        <p className="mt-1 text-xs text-amber-700/80">Kích hoạt khi bạn khởi động thiết bị lần đầu để bắt đầu tính thời hạn bảo hành.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleActivate}
                                                        disabled={activating}
                                                        className={cn("ts-btn ts-btn-primary", activating && "opacity-70")}
                                                    >
                                                        <i className="fas fa-bolt"></i>{activating ? 'Đang kích hoạt...' : 'Kích hoạt lần đầu'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <button type="button" onClick={() => scrollToSection('submit-claim')} className="ts-btn ts-btn-primary">
                                                <i className="fas fa-tools"></i>Tạo yêu cầu bảo hành
                                            </button>
                                            <button type="button" onClick={() => scrollToSection('repair-history')} className="ts-btn ts-btn-outline">
                                                <i className="fas fa-history"></i>Lịch sử sửa chữa
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <section id="submit-claim" className="mb-16">
                    <div className="mb-8 text-center">
                        <p className="ts-eyebrow text-[var(--color-primary)]">Gửi yêu cầu</p>
                        <h2 className="ts-display mt-3 text-2xl md:text-3xl">Gửi yêu cầu sửa chữa</h2>
                    </div>

                    <div className="ts-panel mx-auto max-w-3xl p-6">
                        {!isAuthenticated ? (
                            <div className="flex flex-col items-center gap-3 py-10 text-center">
                                <i className="fas fa-lock text-3xl text-[var(--color-fg-dim)]"></i>
                                <p className="text-sm text-[var(--color-fg-muted)]">Vui lòng đăng nhập để gửi yêu cầu bảo hành cho thiết bị đã mua.</p>
                                <Link to="/login" className="ts-btn ts-btn-primary">Đăng nhập</Link>
                            </div>
                        ) : !selectedWarranty ? (
                            <p className="text-sm text-[var(--color-fg-muted)]">Chọn một thiết bị trong “Sản phẩm của tôi” để tạo yêu cầu.</p>
                        ) : selectedWarranty.status === 'NotActivated' ? (
                            <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 p-5">
                                <p className="text-sm font-semibold text-amber-700">Thiết bị chưa kích hoạt bảo hành</p>
                                <p className="mt-1 text-xs text-amber-700/80">Kích hoạt khi bạn khởi động thiết bị lần đầu, sau đó mới tạo yêu cầu.</p>
                                <button type="button" onClick={handleActivate} disabled={activating} className={cn("ts-btn ts-btn-primary mt-4", activating && "opacity-70")}>
                                    <i className="fas fa-bolt"></i>{activating ? 'Đang kích hoạt...' : 'Kích hoạt lần đầu'}
                                </button>
                            </div>
                        ) : (
                            <>
                                {submitMessage && (
                                    <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                                        <strong className="text-sm text-emerald-700">{submitMessage}</strong>
                                        {submitCode && (
                                            <p className="mt-1 ts-mono text-xs text-[var(--color-fg-muted)]">
                                                Mã yêu cầu: <strong className="text-[var(--color-primary)]">{submitCode}</strong>
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="mb-5 rounded-[20px] border border-[var(--color-border)] bg-white/68 p-4 text-sm">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <p><span className="ts-eyebrow block text-[10px]">Thiết bị</span><strong className="text-[var(--color-fg)]">{selectedWarranty.productName || '—'}</strong></p>
                                        <p><span className="ts-eyebrow block text-[10px]">IMEI/Serial</span><span className="ts-mono text-[var(--color-fg)]">{selectedWarranty.serialOrImei || '—'}</span></p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitClaim} className="grid grid-cols-1 gap-4">
                                    <label className="block">
                                        <span className="ts-eyebrow mb-1.5 block text-[10px]">Mô tả lỗi</span>
                                        <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} rows={4} className="ts-input resize-none" />
                                    </label>

                                    <div>
                                        <p className="ts-eyebrow mb-2 text-[10px]">Hình thức gửi</p>
                                        <div className="flex gap-3">
                                            {[['StoreDropOff', 'Mang tới cửa hàng'], ['Shipping', 'Chuyển phát']].map(([val, label]) => (
                                                <label key={val} className={cn(
                                                    "flex flex-1 cursor-pointer items-center gap-2 rounded-xl border bg-white/70 px-4 py-2.5 text-sm transition-colors",
                                                    receiveMethod === val
                                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-fg)]"
                                                        : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-strong)]"
                                                )}>
                                                    <input type="radio" name="receiveMethod" value={val} checked={receiveMethod === val} onChange={(e) => setReceiveMethod(e.target.value)} className="accent-[var(--color-primary)]" />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {receiveMethod === 'Shipping' && (
                                        <label className="block">
                                            <span className="ts-eyebrow mb-1.5 block text-[10px]">Địa chỉ nhận lại</span>
                                            <input value={returnAddress} onChange={(e) => setReturnAddress(e.target.value)} className="ts-input" />
                                        </label>
                                    )}

                                    <label className="block">
                                        <span className="ts-eyebrow mb-1.5 block text-[10px]">Ảnh lỗi (tối đa 3)</span>
                                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-white/60 p-4">
                                            <i className="fas fa-camera text-[var(--color-fg-dim)]"></i>
                                            <input type="file" accept="image/*" multiple onChange={handleAttachmentChange} className="text-xs text-[var(--color-fg-muted)] file:mr-3 file:rounded-sm file:border file:border-[var(--color-border)] file:bg-[var(--color-surface-2)] file:px-3 file:py-1 file:text-xs file:text-[var(--color-fg)]" />
                                        </div>
                                        {attachmentPreviews.length > 0 && (
                                            <div className="mt-3 flex gap-2">
                                                {attachmentPreviews.map((image) => (
                                                    <img key={image.url} src={image.url} alt={image.name} className="h-16 w-16 rounded-xl object-cover" />
                                                ))}
                                            </div>
                                        )}
                                    </label>

                                    <button type="submit" disabled={submitting} className={cn("ts-btn ts-btn-primary", submitting && "opacity-70")}>
                                        <i className="fas fa-paper-plane"></i>{submitting ? 'Đang gửi...' : 'Tạo yêu cầu bảo hành'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </section>

                <section id="repair-history" className="mb-16">
                    <div className="mb-8 text-center">
                        <p className="ts-eyebrow text-[var(--color-primary)]">Lịch sử</p>
                        <h2 className="ts-display mt-3 text-2xl md:text-3xl">Lịch sử bảo hành & sửa chữa</h2>
                    </div>

                    <div className="mx-auto max-w-4xl space-y-6">
                        <div className="ts-panel p-6">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="ts-display text-lg">Yêu cầu bảo hành</h3>
                                {claimsLoading && <span className="text-xs text-[var(--color-fg-muted)]">Đang tải...</span>}
                            </div>
                            {!isAuthenticated ? (
                                <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Đăng nhập để xem lịch sử.</p>
                            ) : !selectedWarranty ? (
                                <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Chọn thiết bị để xem lịch sử.</p>
                            ) : claims.length === 0 ? (
                                <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Chưa có yêu cầu bảo hành nào.</p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {claims.map((c) => (
                                        <div key={c.id} className="rounded-[20px] border border-[var(--color-border)] bg-white/68 p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="ts-eyebrow text-[10px]">Mã yêu cầu</p>
                                                    <p className="ts-mono text-sm text-[var(--color-fg)]">{c.claimCode}</p>
                                                </div>
                                                <span className={statusStyle(c.status === 'Completed' ? 'Active' : c.status)}>{claimStatusLabel(c.status)}</span>
                                            </div>
                                            <Timeline steps={CLAIM_TIMELINE} current={c.status} />
                                            <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-[var(--color-fg-muted)] sm:grid-cols-3">
                                                <p><span className="ts-eyebrow block text-[10px]">Ngày tạo</span>{formatDate(c.createdAt)}</p>
                                                <p><span className="ts-eyebrow block text-[10px]">Nhận máy</span>{formatDate(c.receivedAt)}</p>
                                                <p><span className="ts-eyebrow block text-[10px]">Hoàn tất</span>{formatDate(c.completedAt)}</p>
                                            </div>
                                            {Array.isArray(c.updates) && c.updates.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {c.updates.slice(-4).map((u) => (
                                                        <div key={u.id} className="flex items-start justify-between gap-3 text-xs">
                                                            <div>
                                                                <p className="text-[var(--color-fg)]">{u.title}</p>
                                                                {u.message && <p className="text-[var(--color-fg-muted)]">{u.message}</p>}
                                                            </div>
                                                            <span className="ts-mono text-[10px] text-[var(--color-fg-dim)]">{formatDate(u.createdAt)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="ts-panel p-6">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="ts-display text-lg">Phiếu sửa chữa</h3>
                                {repairsLoading && <span className="text-xs text-[var(--color-fg-muted)]">Đang tải...</span>}
                            </div>
                            {!isAuthenticated ? (
                                <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Đăng nhập để xem lịch sử.</p>
                            ) : !selectedWarranty ? (
                                <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Chọn thiết bị để xem lịch sử.</p>
                            ) : repairs.length === 0 ? (
                                <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Chưa có phiếu sửa chữa nào.</p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {repairs.map((r) => (
                                        <div key={r.id} className="overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-white/68">
                                            <button
                                                type="button"
                                                onClick={() => toggleRepair(r.id)}
                                                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]"
                                            >
                                                <div>
                                                    <p className="ts-mono text-sm">{r.repairCode}</p>
                                                    <p className="mt-1 text-xs text-[var(--color-fg-muted)]">Tiếp nhận: {formatDate(r.receivedAt)} • Trạng thái: {repairStatusLabel(r.status)}</p>
                                                    <Timeline steps={REPAIR_TIMELINE} current={r.status} getLabel={repairStatusLabel} />
                                                </div>
                                                <i className={cn("fas fa-chevron-down text-xs text-[var(--color-fg-dim)] transition-transform", repairOpenId === r.id && "rotate-180")}></i>
                                            </button>
                                            {repairOpenId === r.id && (
                                                <div className="border-t border-[var(--color-border)] px-5 py-4">
                                                    {Array.isArray(repairUpdates[r.id]) && repairUpdates[r.id].length > 0 ? (
                                                        <div className="space-y-2">
                                                            {repairUpdates[r.id].map((u) => (
                                                                <div key={u.id} className="flex items-start justify-between gap-3 text-xs">
                                                                    <div>
                                                                        <p className="text-[var(--color-fg)]">{u.title}</p>
                                                                        {u.message && <p className="text-[var(--color-fg-muted)]">{u.message}</p>}
                                                                    </div>
                                                                    <span className="ts-mono text-[10px] text-[var(--color-fg-dim)]">{formatDate(u.createdAt)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-[var(--color-fg-muted)]">Chưa có cập nhật.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mb-16">
                    <div className="mb-8 text-center">
                        <p className="ts-eyebrow text-[var(--color-primary)]">Hỏi đáp</p>
                        <h2 className="ts-display mt-3 text-2xl md:text-3xl">Câu hỏi thường gặp</h2>
                    </div>
                    <div className="mx-auto max-w-3xl space-y-3">
                        {faqs.map(([q, a], i) => (
                            <article key={q} className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
                                <button
                                    type="button"
                                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]"
                                >
                                    <span>{q}</span>
                                    <i className={cn("fas fa-chevron-down text-xs text-[var(--color-fg-dim)] transition-transform", openFaq === i && "rotate-180")}></i>
                                </button>
                                {openFaq === i && (
                                    <p className="border-t border-[var(--color-border)] px-5 py-4 text-sm text-[var(--color-fg-muted)]">{a}</p>
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                <section className="rounded-md border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-8 md:p-12">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            <p className="ts-eyebrow text-[var(--color-primary)]">Hỗ trợ nhanh</p>
                            <h2 className="ts-display mt-3 text-2xl">Cần hỗ trợ thêm?</h2>
                            <p className="mt-3 text-sm text-[var(--color-fg-muted)]">Liên hệ TechStore để được tư vấn bảo hành điện tử và hỗ trợ gửi sản phẩm.</p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {hotline && <a href={`tel:${hotlineTel}`} className="ts-btn ts-btn-primary"><i className="fas fa-phone"></i>Gọi hỗ trợ</a>}
                                <Link to="/contact" className="ts-btn ts-btn-ghost">Liên hệ ngay</Link>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            {hotline && <p className="flex items-center gap-3"><i className="fas fa-phone-alt w-5 text-[var(--color-primary)]"></i><span className="text-[var(--color-fg-dim)]">Hotline:</span><strong className="ts-mono text-[var(--color-fg)]">{hotline}</strong></p>}
                            {supportEmail && <p className="flex items-center gap-3"><i className="fas fa-envelope w-5 text-[var(--color-primary)]"></i><span className="text-[var(--color-fg-dim)]">Email:</span><strong className="text-[var(--color-fg)]">{supportEmail}</strong></p>}
                            {supportTime && <p className="flex items-center gap-3"><i className="fas fa-clock w-5 text-[var(--color-primary)]"></i><span className="text-[var(--color-fg-dim)]">Giờ:</span><strong className="text-[var(--color-fg)]">{supportTime}</strong></p>}
                        </div>
                    </div>
                </section>
            </section>
        </>
    );
};

export default Warranty;
