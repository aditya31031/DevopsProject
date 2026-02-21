const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @desc    Transfer funds between accounts
// @route   POST /api/transactions/transfer
// @access  Private
exports.transfer = async (req, res, next) => {
    try {
        const { fromAccountId, toAccountNumber, amount, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const fromAccount = await Account.findOne({ _id: fromAccountId, owner: req.user.id, isActive: true });
        if (!fromAccount) {
            return res.status(404).json({ success: false, message: 'Source account not found' });
        }

        const toAccount = await Account.findOne({ accountNumber: toAccountNumber, isActive: true });
        if (!toAccount) {
            return res.status(404).json({ success: false, message: 'Destination account not found' });
        }

        if (fromAccount._id.toString() === toAccount._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot transfer to the same account' });
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient funds' });
        }

        // Atomic balance update
        fromAccount.balance -= Number(amount);
        toAccount.balance += Number(amount);

        await fromAccount.save();
        await toAccount.save();

        const transaction = await Transaction.create({
            type: 'transfer',
            amount,
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            initiatedBy: req.user.id,
            description: description || 'Fund Transfer',
            balanceAfter: fromAccount.balance,
            status: 'completed',
        });

        logger.info(`Transfer of ${amount} from ${fromAccount.accountNumber} to ${toAccount.accountNumber}`);
        res.status(200).json({
            success: true,
            message: 'Transfer successful',
            data: { transaction, newBalance: fromAccount.balance },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get transaction history for an account
// @route   GET /api/transactions/:accountId
// @access  Private
exports.getHistory = async (req, res, next) => {
    try {
        const { accountId } = req.params;
        const { page = 1, limit = 10, type } = req.query;

        // Verify account belongs to user
        const account = await Account.findOne({ _id: accountId, owner: req.user.id });
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        const filter = {
            $or: [{ fromAccount: accountId }, { toAccount: accountId }],
        };
        if (type) filter.type = type;

        const transactions = await Transaction.find(filter)
            .populate('fromAccount', 'accountNumber type')
            .populate('toAccount', 'accountNumber type')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: transactions.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: { transactions },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all transactions for current user
// @route   GET /api/transactions
// @access  Private
exports.getAllTransactions = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const userAccounts = await Account.find({ owner: req.user.id }).select('_id');
        const accountIds = userAccounts.map((a) => a._id);

        const transactions = await Transaction.find({
            $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
        })
            .populate('fromAccount', 'accountNumber type')
            .populate('toAccount', 'accountNumber type')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Transaction.countDocuments({
            $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
        });

        res.status(200).json({
            success: true,
            count: transactions.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: { transactions },
        });
    } catch (error) {
        next(error);
    }
};
