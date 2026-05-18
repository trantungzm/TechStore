import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPostLoginPath, t } from '../utils/store';
import AuthLayout from '../components/layout/AuthLayout';

const LoginContent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registerData, setRegisterData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
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
            setRegisterSuccess('Account created successfully. You can log in now..');
            setRegisterData({
                username: '',
                password: '',
                name: '',
                email: '',
                phone: '',
            });
        } else {
            setRegisterError(result.message);
        }

        setRegisterLoading(false);
    };

    return (
        <AuthLayout>
            <div className={`auth-login-shell ${isLeaving ? 'is-leaving' : ''}`}>
                <div className="auth-login-panel">
                    <aside className="auth-login-branding">
                        <Link to="/" className="auth-login-logo">CNTHHT Store</Link>
                        <h1>Mua sắm công nghệ dễ dàng hơn</h1>
                        <p>Đăng nhập để theo dõi đơn hàng, lưu phiếu giảm giá và quản lý bảo hành sản phẩm.</p>
                        <div className="auth-login-benefits">
                            <span><i className="fas fa-check"></i>Theo dõi đơn hàng nhanh chóng</span>
                            <span><i className="fas fa-check"></i>Lưu và sử dụng phiếu giảm giá</span>
                            <span><i className="fas fa-check"></i>Quản lý sản phẩm yêu thích</span>
                            <span><i className="fas fa-check"></i>Tra cứu bảo hành dễ dàng</span>
                        </div>
                    </aside>
                    <section className="auth-login-form-wrap">
                        <Link to="/" className="auth-back-link">
                            <i className="fas fa-arrow-left"></i>
                            Quay về trang chủ
                        </Link>
                    {isLoginMode ? (
                        <div className="auth-login-card">
                                    <div className="auth-login-heading">
                                        <h2>Đăng nhập</h2>
                                        <p>Chào mừng bạn quay lại CNTHHT Store</p>
                                    </div>

                                    {error && (
                                        <div className="alert alert-danger alert-dismissible auth-login-alert">
                                            <button type="button" className="close" onClick={() => setError('')}>
                                                &times;
                                            </button>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="auth-login-form">
                                        <label>
                                            Email hoặc số điện thoại
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Email hoặc số điện thoại"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                            <div className="input-group-append">
                                                <div className="input-group-text">
                                                    <span className="fas fa-user"></span>
                                                </div>
                                            </div>
                                        </div>
                                        </label>
                                        <label>
                                            Mật khẩu
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Mật khẩu"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <div className="input-group-append">
                                                <div className="input-group-text">
                                                    <span className="fas fa-lock"></span>
                                                </div>
                                            </div>
                                        </div>
                                        </label>
                                        <div className="auth-login-options">
                                            <label className="auth-remember">
                                                <input type="checkbox" />
                                                <span>Ghi nhớ đăng nhập</span>
                                            </label>
                                            <button type="button" className="auth-forgot-link">Quên mật khẩu?</button>
                                        </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary auth-submit-btn"
                                                disabled={loading}
                                            >
                                                {isLeaving ? 'Đang chuyển...' : loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                            </button>
                                        <div className="auth-switch-text">
                                            <span>Chưa có tài khoản? </span>
                                            <button 
                                                type="button" 
                                                className="btn btn-link p-0 text-primary auth-inline-action"
                                                onClick={() => setIsLoginMode(false)}
                                            >
                                                Đăng ký ngay
                                            </button>
                                        </div>
                                    </form>
                        </div>
                    ) : (
                        <div className="auth-login-card">
                                    <div className="auth-login-heading">
                                        <h2>Đăng ký tài khoản</h2>
                                        <p>Tạo tài khoản CNTHHT Store để mua sắm thuận tiện hơn</p>
                                    </div>

                                    {registerError && <div className="alert alert-danger">{registerError}</div>}
                                    {registerSuccess && <div className="alert alert-success">{registerSuccess}</div>}

                                    <form onSubmit={handleRegister} className="auth-login-form" autoComplete="off">
                                        <div className="form-group">
                                            <label>Tên đăng nhập</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="register-username"
                                                autoComplete="off"
                                                value={registerData.username}
                                                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Mật khẩu</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="register-password"
                                                autoComplete="new-password"
                                                value={registerData.password}
                                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Họ và tên</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="register-full-name"
                                                autoComplete="name"
                                                value={registerData.name}
                                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="register-email"
                                                autoComplete="email"
                                                value={registerData.email}
                                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group mb-4">
                                            <label>Số điện thoại</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="register-phone"
                                                autoComplete="tel"
                                                value={registerData.phone}
                                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="auth-register-actions">
                                            <button
                                                type="submit"
                                                className="btn btn-primary auth-submit-btn"
                                                disabled={registerLoading}
                                            >
                                                {registerLoading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
                                            </button>
                                        </div>
                                        <div className="auth-switch-text">
                                            <span>Đã có tài khoản? </span>
                                            <button 
                                                type="button" 
                                                className="btn btn-link p-0 text-primary auth-inline-action"
                                                onClick={() => setIsLoginMode(true)}
                                            >
                                                Đăng nhập
                                            </button>
                                        </div>
                                    </form>
                        </div>
                    )}
                    </section>
                </div>
            </div>
        </AuthLayout>
    );
};

const Login = () => {
    return <LoginContent />;
};

export default Login;
