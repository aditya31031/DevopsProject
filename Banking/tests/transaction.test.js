process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1d';

const request = require('supertest');
const app = require('../src/app');
const db = require('./testDb');

let senderToken, receiverToken, senderAccountId, receiverAccountNumber;

beforeAll(async () => { await db.connect(); });
afterAll(async () => { await db.closeDatabase(); });

beforeEach(async () => {
    await db.clearDatabase();

    // Register sender
    const senderRes = await request(app).post('/api/auth/register').send({
        firstName: 'Sender', lastName: 'User', email: 'sender@bank.com', password: 'Test@1234',
    });
    senderToken = senderRes.body.token;

    // Register receiver
    const receiverRes = await request(app).post('/api/auth/register').send({
        firstName: 'Receiver', lastName: 'User', email: 'receiver@bank.com', password: 'Test@1234',
    });
    receiverToken = receiverRes.body.token;

    // Create sender account
    const senderAccRes = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ type: 'savings' });
    senderAccountId = senderAccRes.body.data.account._id;

    // Deposit funds into sender account
    await request(app)
        .post(`/api/accounts/${senderAccountId}/deposit`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({ amount: 20000, description: 'Setup deposit' });

    // Create receiver account
    const receiverAccRes = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${receiverToken}`)
        .send({ type: 'checking' });
    receiverAccountNumber = receiverAccRes.body.data.account.accountNumber;
});

describe('Transaction API', () => {
    describe('POST /api/transactions/transfer', () => {
        it('should transfer funds between accounts', async () => {
            const res = await request(app)
                .post('/api/transactions/transfer')
                .set('Authorization', `Bearer ${senderToken}`)
                .send({
                    fromAccountId: senderAccountId,
                    toAccountNumber: receiverAccountNumber,
                    amount: 5000,
                    description: 'Test transfer',
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.newBalance).toBe(15000);
        });

        it('should reject transfer with insufficient funds', async () => {
            const res = await request(app)
                .post('/api/transactions/transfer')
                .set('Authorization', `Bearer ${senderToken}`)
                .send({
                    fromAccountId: senderAccountId,
                    toAccountNumber: receiverAccountNumber,
                    amount: 999999,
                });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/insufficient/i);
        });

        it('should reject transfer to non-existent account', async () => {
            const res = await request(app)
                .post('/api/transactions/transfer')
                .set('Authorization', `Bearer ${senderToken}`)
                .send({
                    fromAccountId: senderAccountId,
                    toAccountNumber: 'NONEXISTENT123',
                    amount: 100,
                });
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/transactions/:accountId', () => {
        it('should return transaction history for an account', async () => {
            const res = await request(app)
                .get(`/api/transactions/${senderAccountId}`)
                .set('Authorization', `Bearer ${senderToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.transactions)).toBe(true);
            expect(res.body.data.transactions.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('GET /api/transactions', () => {
        it('should return all transactions for current user', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${senderToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.transactions)).toBe(true);
        });
    });
});
