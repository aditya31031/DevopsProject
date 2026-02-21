import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountAPI } from '../services/api';

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeposit, setShowDeposit] = useState(null);
    const [amount, setAmount] = useState('');
    const [msg, setMsg] = useState('');

    const fetchAccounts = async () => {
        try {
            const res = await accountAPI.getAll();
            setAccounts(res.data.data.accounts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, []);

    const createAccount = async (type) => {
        await accountAPI.create({ type });
        fetchAccounts();
    };

    const handleDeposit = async (id) => {
        if (!amount) return;
        await accountAPI.deposit(id, { amount: Number(amount), description: 'Dashboard deposit' });
        setMsg(`✅ Deposited ₹${amount}`);
        setShowDeposit(null);
        setAmount('');
        fetchAccounts();
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="nav-logo">🏦 BankingOS</div>
                <div className="nav-right">
                    <span className="nav-user">👤 {user.firstName} {user.lastName}</span>
                    <button className="btn-outline" onClick={logout}>Logout</button>
                </div>
            </nav>

            <div className="dash-content">
                {/* Summary card */}
                <div className="summary-card">
                    <div>
                        <p className="summary-label">Total Balance</p>
                        <h2 className="summary-balance">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                    </div>
                    <div className="summary-counts">
                        <span>{accounts.length} Account{accounts.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {msg && <div className="success-msg">{msg}</div>}

                {/* Action buttons */}
                <div className="action-row">
                    <button className="btn-primary" onClick={() => createAccount('savings')}>+ Savings Account</button>
                    <button className="btn-secondary" onClick={() => createAccount('checking')}>+ Checking Account</button>
                </div>

                {/* Accounts list */}
                <div className="accounts-grid">
                    {loading && <div className="loading">Loading accounts...</div>}
                    {accounts.map((acc) => (
                        <div key={acc._id} className="account-card">
                            <div className="acc-header">
                                <span className="acc-type">{acc.type}</span>
                                <span className="acc-num">{acc.accountNumber}</span>
                            </div>
                            <p className="acc-balance">₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            <div className="acc-actions">
                                <button className="btn-sm btn-green" onClick={() => setShowDeposit(acc._id)}>Deposit</button>
                                <button className="btn-sm btn-blue" onClick={() => navigate(`/transactions/${acc._id}`)}>History</button>
                            </div>
                            {showDeposit === acc._id && (
                                <div className="deposit-form">
                                    <input
                                        type="number"
                                        placeholder="Amount (₹)"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                    />
                                    <button className="btn-sm btn-green" onClick={() => handleDeposit(acc._id)}>Confirm</button>
                                    <button className="btn-sm btn-outline" onClick={() => setShowDeposit(null)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {accounts.length === 0 && !loading && (
                    <div className="empty-state">
                        <p>No bank accounts yet. Create one above to get started! 🚀</p>
                    </div>
                )}
            </div>
        </div>
    );
}
