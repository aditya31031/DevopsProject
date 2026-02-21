import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';

export default function Transactions() {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        transactionAPI.getHistory(accountId).then((res) => {
            setTransactions(res.data.data.transactions);
        }).finally(() => setLoading(false));
    }, [accountId]);

    const badge = (type) => {
        const map = { deposit: '🟢', withdrawal: '🔴', transfer: '🔵' };
        return map[type] || '⚪';
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="nav-logo">🏦 BankingOS</div>
                <button className="btn-outline" onClick={() => navigate('/')}>← Back</button>
            </nav>
            <div className="dash-content">
                <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Transaction History</h2>
                {loading && <div className="loading">Loading...</div>}
                {!loading && transactions.length === 0 && (
                    <div className="empty-state"><p>No transactions yet.</p></div>
                )}
                <div className="txn-list">
                    {transactions.map((txn) => (
                        <div key={txn._id} className="txn-card">
                            <div className="txn-left">
                                <span className="txn-badge">{badge(txn.type)}</span>
                                <div>
                                    <p className="txn-type">{txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}</p>
                                    <p className="txn-desc">{txn.description || '—'}</p>
                                    <p className="txn-ref">Ref: {txn.reference}</p>
                                </div>
                            </div>
                            <div className="txn-right">
                                <p className={`txn-amount ${txn.type === 'deposit' ? 'credit' : 'debit'}`}>
                                    {txn.type === 'deposit' ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN')}
                                </p>
                                <p className="txn-date">{new Date(txn.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
