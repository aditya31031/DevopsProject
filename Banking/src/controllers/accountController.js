const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @desc    Create a new bank account
// @route   POST /api/accounts
// @access  Private
exports.createAccount = async (req, res, next) => {
    try {
        const { type, currency } = req.body;

        const account = await Account.create({
            owner: req.user.id,
            type: type || 'savings',
            currency: currency || 'INR',
        });

        logger.info(`New account created: ${account.accountNumber} for user ${req.user.id}`);
        res.status(201).json({ success: true, data: { account } });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all accounts for current user
// @route   GET /api/accounts
// @access  Private
exports.getMyAccounts = async (req, res, next) => {
    try {
        const accounts = await Account.find({ owner: req.user.id, isActive: true });
        res.status(200).json({ success: true, count: accounts.length, data: { accounts } });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
exports.getAccount = async (req, res, next) => {
    try {
        const account = await Account.findOne({ _id: req.params.id, owner: req.user.id });
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }
        res.status(200).json({ success: true, data: { account } });
    } catch (error) {
        next(error);
    }
};

// @desc    Deposit money into account
// @route   POST /api/accounts/:id/deposit
// @access  Private
exports.deposit = async (req, res, next) => {
    try {
        const { amount, description } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const account = await Account.findOne({ _id: req.params.id, owner: req.user.id, isActive: true });
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        account.balance += Number(amount);
        await account.save();

        const transaction = await Transaction.create({
            type: 'deposit',
            amount,
            toAccount: account._id,
            initiatedBy: req.user.id,
            description: description || 'Deposit',
            balanceAfter: account.balance,
            status: 'completed',
        });

        logger.info(`Deposit of ${amount} to account ${account.accountNumber}`);
        res.status(200).json({ success: true, data: { account, transaction } });
    } catch (error) {
        next(error);
    }
};

// @desc    Withdraw money from account
// @route   POST /api/accounts/:id/withdraw
// @access  Private
exports.withdraw = async (req, res, next) => {
    try {
        const { amount, description } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const account = await Account.findOne({ _id: req.params.id, owner: req.user.id, isActive: true });
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (account.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient funds' });
        }

        if (amount > account.dailyWithdrawalLimit) {
            return res.status(400).json({ success: false, message: `Exceeds daily withdrawal limit of ${account.dailyWithdrawalLimit}` });
        }

        account.balance -= Number(amount);
        await account.save();

        const transaction = await Transaction.create({
            type: 'withdrawal',
            amount,
            fromAccount: account._id,
            initiatedBy: req.user.id,
            description: description || 'Withdrawal',
            balanceAfter: account.balance,
            status: 'completed',
        });

        logger.info(`Withdrawal of ${amount} from account ${account.accountNumber}`);
        res.status(200).json({ success: true, data: { account, transaction } });
    } catch (error) {
        next(error);
    }
};
