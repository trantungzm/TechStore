import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPostLoginPath } from '../../utils/store';
import AuthLayout from '../../layout/AuthLayout';
import { cn } from '../../utils/cn';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Thêm tính năng ẩn/hiện mật khẩu
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [registerData, setRegisterData] = useState({
        username: '', password: '', name: '', email: '', phone: '', dateOfBirth: '',
    });
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            const requestedPath = location.state?.from?.pathname;
            setIsLeaving(true);
            window.setTimeout(() => {
                navigate(getPostLoginPath(result.user, requestedPath), { replace: true });
            }, 240);
            return;
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterSuccess('');
        setRegisterLoading(true);

        const result = await register(registerData);

        if (result.success) {
            setRegisterSuccess('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.');
            setRegisterData({ username: '', password: '', name: '', email: '', phone: '', dateOfBirth: '' });
            // Tự động chuyển về tab login sau khi đăng ký thành công (Optional)
            setTimeout(() => setIsLoginMode(true), 2000);
        } else {
            setRegisterError(result.message);
        }
        setRegisterLoading(false);
    };

    // Định nghĩa nội dung động cho phần Branding bên trái dựa theo mode
    const brandingContent = isLoginMode ? {
        eyebrow: 'CHÀO MỪNG QUAY LẠI',
        heading: <>Tech tuyển chọn,<br /><span className="ts-gradient-text">trải nghiệm tinh tế</span>.</>,
        description: 'Đăng nhập để theo dõi đơn hàng, lưu phiếu giảm giá và quản lý bảo hành sản phẩm của bạn.',
        benefits: [
            'Theo dõi đơn hàng nhanh chóng',
            'Lưu và sử dụng phiếu giảm giá',
            'Quản lý sản phẩm yêu thích',
            'Tra cứu bảo hành dễ dàng'
        ]
    } : {
        eyebrow: 'GIA NHẬP TECHSTORE',
        heading: <>Mua sắm thông minh,<br /><span className="ts-gradient-text">nhận ngập ưu đãi</span>.</>,
        description: 'Đăng ký tài khoản ngay hôm nay để trở thành thành viên VIP và hưởng đặc quyền riêng biệt.',
        benefits: [
            'Nhận ngay voucher giảm giá thành viên mới',
            'Tích điểm đổi quà trên mỗi đơn hàng',
            'Nhận thông báo sớm nhất về các deal hot',
            'Hỗ trợ kỹ thuật ưu tiên 24/7'
        ]
    };

    return (
        <AuthLayout>
            <div className={cn("relative isolate flex min-h-screen items-center justify-center p-6 transition-opacity duration-300", isLeaving && "opacity-0")}>
                {/* Background Blobs */}
                <span aria-hidden className="ts-anim-blob pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] bg-gradient-to-br from-[var(--color-accent)]/25 to-[var(--color-primary)]/15 blur-3xl" />
                <span aria-hidden className="ts-anim-blob pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] bg-gradient-to-tr from-[var(--color-primary)]/15 to-[var(--color-accent)]/20 blur-3xl" style={{ animationDelay: '-6s' }} />

                <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lift)] lg:grid-cols-2 ts-anim-scale-in items-stretch">
                    
                    {/* Nửa bên trái: Branding side (Đã được làm động hóa) */}
                    <aside className="relative flex flex-col justify-between gap-8 overflow-hidden bg-gradient-to-br from-[var(--color-surface-2)] via-[var(--color-surface)] to-[var(--color-surface-2)] p-10 lg:p-12">
                        <span aria-hidden className="ts-anim-blob pointer-events-none absolute -bottom-12 -right-12 h-72 w-72 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 blur-3xl" />

                        <Link to="/" className="ts-display text-2xl text-[var(--color-fg)] relative w-fit">
                            Tech<span className="ts-gradient-text">Store</span>
                        </Link>

                        <div className="relative my-auto">
                            <p className="ts-eyebrow text-[var(--color-accent)] tracking-wider">{brandingContent.eyebrow}</p>
                            <h1 className="ts-display mt-4 text-4xl leading-tight text-[var(--color-fg)] md:text-5xl">
                                {brandingContent.heading}
                            </h1>
                            <p className="mt-5 text-sm text-[var(--color-fg-muted)] leading-relaxed">
                                {brandingContent.description}
                            </p>

                            <ul className="mt-8 space-y-3.5">
                                {brandingContent.benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-center gap-3 text-sm text-[var(--color-fg-muted)]">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/15 text-[10px] text-[var(--color-gold)]">
                                            <i className="fas fa-check"></i>
                                        </span>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p className="relative text-xs text-[var(--color-fg-dim)]">© {new Date().getFullYear()} TechStore. All rights reserved.</p>
                    </aside>

                    {/* Nửa bên phải: Form side */}
                    <section className="flex flex-col justify-center p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-[var(--color-border)]">
                        <Link to="/" className="mb-6 inline-flex w-fit items-center gap-2 text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] transition-colors">
                            <i className="fas fa-arrow-left"></i>Về trang chủ
                        </Link>

                        {isLoginMode ? (
                            <>
                                <p className="ts-eyebrow text-[var(--color-accent)] tracking-wider">ĐĂNG NHẬP</p>
                                <h2 className="ts-display mt-3 text-3xl text-[var(--color-fg)]">Đăng nhập</h2>
                                <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Chào mừng bạn quay lại TechStore</p>

                                {error && (
                                    <div className="mt-5 flex items-start justify-between gap-3 rounded-lg border border-red-500/40 bg-red-50 px-4 py-2.5 text-sm text-red-700 ts-anim-fade-in">
                                        <span>{error}</span>
                                        <button onClick={() => setError('')} aria-label="Đóng" className="text-red-600 hover:text-red-800 mt-0.5">
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
                                    <label className="block">
                                        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">Tên đăng nhập</span>
                                        <div className="relative">
                                            <i className="fas fa-user pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-dim)]"></i>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                placeholder="Nhập tên đăng nhập"
                                                className="ts-input pl-10" // Tăng padding trái để không dính icon
                                            />
                                        </div>
                                    </label>
                                    
                                    <label className="block">
                                        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">Mật khẩu</span>
                                        <div className="relative">
                                            <i className="fas fa-lock pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-dim)]"></i>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="ts-input pl-10 pr-10" // Padding đều hai bên
                                            />
                                            {/* Nút ẩn hiện mật khẩu trực quan */}
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] p-1"
                                            >
                                                <i className={cn("fas", showPassword ? "fa-eye-slash" : "fa-eye")}></i>
                                            </button>
                                        </div>
                                    </label>

                                    <div className="flex items-center justify-between text-xs py-0.5">
                                        <label className="inline-flex items-center gap-2 text-[var(--color-fg-muted)] cursor-pointer select-none">
                                            <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--color-primary)] cursor-pointer rounded-sm" />
                                            Ghi nhớ đăng nhập
                                        </label>
                                        <button type="button" className="text-[var(--color-accent)] hover:underline font-medium">Quên mật khẩu?</button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || isLeaving}
                                        className="ts-btn ts-btn-primary w-full py-3 font-medium transition-all"
                                    >
                                        {isLeaving ? <><i className="fas fa-check mr-2"></i>Đang chuyển...</> : loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Đang đăng nhập...</> : 'Đăng nhập'}
                                    </button>

                                    <p className="text-center text-xs text-[var(--color-fg-muted)] pt-2">
                                        Chưa có tài khoản?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLoginMode(false);
                                                setError('');
                                            }}
                                            className="text-[var(--color-accent)] font-semibold hover:underline"
                                        >
                                            Đăng ký ngay
                                        </button>
                                    </p>
                                </form>
                            </>
                        ) : (
                            <>
                                <p className="ts-eyebrow text-[var(--color-accent)] tracking-wider">ĐĂNG KÝ</p>
                                <h2 className="ts-display mt-3 text-3xl text-[var(--color-fg)]">Đăng ký tài khoản</h2>
                                <p className="mt-2 text-sm text-[var(--color-fg-muted)]">Tạo tài khoản để mua sắm thuận tiện hơn</p>

                                {registerError && <div className="mt-5 rounded-lg border border-red-500/40 bg-red-50 px-4 py-2.5 text-sm text-red-700 ts-anim-fade-in">{registerError}</div>}
                                {registerSuccess && <div className="mt-5 rounded-lg border border-emerald-500/40 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 ts-anim-fade-in">{registerSuccess}</div>}

                                <form onSubmit={handleRegister} autoComplete="off" className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                                    {[
                                        ['username', 'Tên đăng nhập', 'text', true, 'fa-user'],
                                        ['password', 'Mật khẩu', 'password', true, 'fa-lock'],
                                        ['name', 'Họ và tên', 'text', false, 'fa-id-card'],
                                        ['dateOfBirth', 'Ngày sinh', 'date', false, 'fa-calendar-days'],
                                        ['email', 'Email', 'email', false, 'fa-envelope'],
                                        ['phone', 'Số điện thoại', 'tel', false, 'fa-phone'],
                                    ].map(([field, label, type, req, icon]) => (
                                        <label key={field} className="block">
                                            <span className="mb-1.5 block text-xs font-semibold text-[var(--color-fg)]">
                                                {label}
                                                {req && <span className="ml-0.5 text-red-500">*</span>}
                                            </span>
                                            <div className="relative">
                                                <i className={`fas ${icon} pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-fg-dim)]`}></i>
                                                <input
                                                    type={field === 'password' && showPassword ? 'text' : type}
                                                    name={`register-${field}`}
                                                    value={registerData[field]}
                                                    onChange={(e) => setRegisterData({ ...registerData, [field]: e.target.value })}
                                                    required={req}
                                                    placeholder={field === 'password' ? '••••••••' : `Nhập ${label.toLowerCase()}`}
                                                    {...(field === 'password' ? { minLength: 6, autoComplete: 'new-password' } : { autoComplete: 'off' })}
                                                    {...(field === 'dateOfBirth' ? { max: new Date().toISOString().split('T')[0] } : {})}
                                                    className={cn('ts-input pl-10', field === 'password' && 'pr-10')}
                                                />
                                                {field === 'password' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
                                                    >
                                                        <i className={cn('fas', showPassword ? 'fa-eye-slash' : 'fa-eye')}></i>
                                                    </button>
                                                )}
                                            </div>
                                        </label>
                                    ))}

                                    <button
                                        type="submit"
                                        disabled={registerLoading}
                                        className="ts-btn ts-btn-primary mt-2 w-full sm:col-span-2 py-3 font-medium transition-all"
                                    >
                                        {registerLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tạo tài khoản...</> : 'Đăng ký ngay'}
                                    </button>

                                    <p className="text-center text-xs text-[var(--color-fg-muted)] sm:col-span-2 pt-2">
                                        Đã có tài khoản?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLoginMode(true);
                                                setRegisterError('');
                                                setRegisterSuccess('');
                                            }}
                                            className="text-[var(--color-accent)] font-semibold hover:underline"
                                        >
                                            Đăng nhập
                                        </button>
                                    </p>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;