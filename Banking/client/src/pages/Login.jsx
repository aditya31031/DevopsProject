import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = mode === 'login'
                ? await authAPI.login({ email: form.email, password: form.password })
                : await authAPI.register(form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo">🏦</div>
                    <h1>BankingOS</h1>
                    <p>Secure. Fast. Modern.</p>
                </div>

                <div className="tab-row">
                    <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
                    <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'register' && (
                        <div className="form-row">
                            <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
                            <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
                        </div>
                    )}
                    <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                    {error && <div className="error-msg">⚠️ {error}</div>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p className="demo-hint">
                    Demo: <strong>alice@example.com</strong> / <strong>Alice@1234</strong>
                </p>
            </div>
        </div>
    );
}
