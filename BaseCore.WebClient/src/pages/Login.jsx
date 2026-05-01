import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPostLoginPath, t } from '../utils/store';
import StoreLayout from '../components/store/StoreLayout';

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
            navigate(getPostLoginPath(result.user, requestedPath), { replace: true });
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
        <StoreLayout>
            <div className="store-login-shell">
                <div className="container py-5">
                    <div className="text-center mb-4">
                        <Link to="/" className="store-brand">Electro</Link>
                        <p className="text-muted mb-0">{t('Log in to get the best web experience.')}</p>
                    </div>
                    <div className="row justify-content-center">
                    {isLoginMode ? (
                        <div className="col-lg-5 mb-4">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body p-4">
                                    <h4 className="mb-3">{t('Log In')}</h4>
                                    <p className="text-muted"></p>

                                    {error && (
                                        <div className="alert alert-danger alert-dismissible">
                                            <button type="button" className="close" onClick={() => setError('')}>
                                                &times;
                                            </button>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="input-group mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={t('Username')}
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
                                        <div className="input-group mb-3">
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder={t('Password')}
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
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Link to="/" className="text-muted">{t('Back to Shop')}</Link>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : t('Sign In')}
                                            </button>
                                        </div>
                                        <div className="text-center mt-4">
                                            <span className="text-muted">{t("Don't have an account?")} </span>
                                            <button 
                                                type="button" 
                                                className="btn btn-link p-0 text-primary" 
                                                onClick={() => setIsLoginMode(false)}
                                            >
                                                {t('Register here')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="col-lg-5 mb-4">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body p-4">
                                    <h4 className="mb-3">{t('Create User Account')}</h4>
                                    <p className="text-muted"></p>

                                    {registerError && <div className="alert alert-danger">{registerError}</div>}
                                    {registerSuccess && <div className="alert alert-success">{registerSuccess}</div>}

                                    <form onSubmit={handleRegister}>
                                        <div className="form-group">
                                            <label>{t('Username')}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={registerData.username}
                                                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('Password')}</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={registerData.password}
                                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('Full Name')}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={registerData.name}
                                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('Email')}</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={registerData.email}
                                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group mb-4">
                                            <label>{t('Phone')}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={registerData.phone}
                                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Link to="/" className="text-muted">{t('Back to Shop')}</Link>
                                            <button
                                                type="submit"
                                                className="btn btn-outline-primary"
                                                disabled={registerLoading}
                                            >
                                                {registerLoading ? t('Loading...') : t('Create Account')}
                                            </button>
                                        </div>
                                        <div className="text-center mt-4">
                                            <span className="text-muted">{t('Already have an account?')} </span>
                                            <button 
                                                type="button" 
                                                className="btn btn-link p-0 text-primary" 
                                                onClick={() => setIsLoginMode(true)}
                                            >
                                                {t('Login here')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
};

const Login = () => {
    return <LoginContent />;
};

export default Login;
