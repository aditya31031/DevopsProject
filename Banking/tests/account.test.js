process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1d';

const request = require('supertest');
const app = require('../src/app');
const db = require('./testDb');

let token;

beforeAll(async () => { await db.connect(); });
afterAll(async () => { await db.closeDatabase(); });
beforeEach(async () => {
    await db.clearDatabase();
    const res = await request(app).post('/api/auth/register').send({
        firstName: 'Account', lastName: 'Tester',
        email: 'accounttest@bank.com', password: 'Test@1234',
    });
    token = res.body.token;
});

describe('Account API', () => {
    describe('POST /api/accounts', () => {
        it('should create a new savings account', async () => {
            const res = await request(app)
                .post('/api/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'savings' });
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.account.type).toBe('savings');
            expect(res.body.data.account.balance).toBe(0);
            expect(res.body.data.account.accountNumber).toBeDefined();
        });

        it('should require authentication', async () => {
            const res = await request(app).post('/api/accounts').send({ type: 'savings' });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/accounts', () => {
        it('should return all accounts for the user', async () => {
            await request(app).post('/api/accounts').set('Authorization', `Bearer ${token}`).send({ type: 'savings' });
            await request(app).post('/api/accounts').set('Authorization', `Bearer ${token}`).send({ type: 'checking' });

            const res = await request(app).get('/api/accounts').set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(2);
        });
    });

    describe('POST /api/accounts/:id/deposit', () => {
        it('should deposit money into account', async () => {
            const createRes = await request(app)
                .post('/api/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'savings' });
            const accountId = createRes.body.data.account._id;

            const res = await request(app)
                .post(`/api/accounts/${accountId}/deposit`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 5000, description: 'Test deposit' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.account.balance).toBe(5000);
            expect(res.body.data.transaction.type).toBe('deposit');
        });

        it('should reject invalid deposit amount', async () => {
            const createRes = await request(app)
                .post('/api/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'savings' });
            const accountId = createRes.body.data.account._id;

            const res = await request(app)
                .post(`/api/accounts/${accountId}/deposit`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: -100 });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/accounts/:id/withdraw', () => {
        it('should withdraw money from account', async () => {
            const createRes = await request(app)
                .post('/api/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'savings' });
            const accountId = createRes.body.data.account._id;

            await request(app)
                .post(`/api/accounts/${accountId}/deposit`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 10000 });

            const res = await request(app)
                .post(`/api/accounts/${accountId}/withdraw`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 3000 });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.account.balance).toBe(7000);
        });

        it('should reject withdrawal with insufficient funds', async () => {
            const createRes = await request(app)
                .post('/api/accounts')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'savings' });
            const accountId = createRes.body.data.account._id;

            const res = await request(app)
                .post(`/api/accounts/${accountId}/withdraw`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 9999999 });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/insufficient/i);
        });
    });
});
