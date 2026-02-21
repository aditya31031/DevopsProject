require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Account = require('./src/models/Account');
const Transaction = require('./src/models/Transaction');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Account.deleteMany({});
        await Transaction.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'Bank',
            email: 'admin@bank.com',
            password: 'Admin@1234',
            role: 'admin',
            phone: '+91-9999999999',
        });

        // Create two customers
        const alice = await User.create({
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@example.com',
            password: 'Alice@1234',
            phone: '+91-9876543210',
        });

        const bob = await User.create({
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob@example.com',
            password: 'Bob@1234',
            phone: '+91-9876543211',
        });

        // Create accounts
        const aliceAccount = await Account.create({
            owner: alice._id,
            type: 'savings',
            balance: 50000,
        });

        const bobAccount = await Account.create({
            owner: bob._id,
            type: 'checking',
            balance: 25000,
        });

        // Create seed transactions
        await Transaction.create({
            type: 'deposit',
            amount: 50000,
            toAccount: aliceAccount._id,
            initiatedBy: alice._id,
            description: 'Initial deposit',
            balanceAfter: 50000,
            status: 'completed',
        });

        await Transaction.create({
            type: 'deposit',
            amount: 25000,
            toAccount: bobAccount._id,
            initiatedBy: bob._id,
            description: 'Initial deposit',
            balanceAfter: 25000,
            status: 'completed',
        });

        console.log('\n🌱 Seed data created successfully!');
        console.log('─────────────────────────────────────');
        console.log(`👤 Admin:  admin@bank.com       / Admin@1234`);
        console.log(`👤 Alice:  alice@example.com    / Alice@1234 | Account: ${aliceAccount.accountNumber} | Balance: ₹50,000`);
        console.log(`👤 Bob:    bob@example.com      / Bob@1234   | Account: ${bobAccount.accountNumber} | Balance: ₹25,000`);
        console.log('─────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seed();
