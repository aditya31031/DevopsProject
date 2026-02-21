const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['deposit', 'withdrawal', 'transfer'],
            required: [true, 'Transaction type is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        fromAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
        toAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
        initiatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'reversed'],
            default: 'completed',
        },
        balanceAfter: {
            type: Number,
        },
        reference: {
            type: String,
            unique: true,
            default: () =>
                `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        },
        metadata: {
            ip: String,
            userAgent: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries (reference already indexed via unique:true)
transactionSchema.index({ fromAccount: 1, createdAt: -1 });
transactionSchema.index({ toAccount: 1, createdAt: -1 });
transactionSchema.index({ initiatedBy: 1, createdAt: -1 });

// Use cached model if already compiled (prevents re-registration in tests)
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
