const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const accountSchema = new mongoose.Schema(
    {
        accountNumber: {
            type: String,
            unique: true,
            default: () => uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase(),
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Account must belong to a user'],
        },
        type: {
            type: String,
            enum: ['savings', 'checking', 'fixed-deposit'],
            default: 'savings',
        },
        balance: {
            type: Number,
            default: 0,
            min: [0, 'Balance cannot be negative'],
        },
        currency: {
            type: String,
            default: 'INR',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        interestRate: {
            type: Number,
            default: 3.5,
        },
        dailyWithdrawalLimit: {
            type: Number,
            default: 50000,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Formatted balance
accountSchema.virtual('formattedBalance').get(function () {
    if (this.balance === undefined || this.balance === null) return null;
    return `${this.currency || 'INR'} ${this.balance.toFixed(2)}`;
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
