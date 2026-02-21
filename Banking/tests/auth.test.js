process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1d';

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const db = require('./testDb');

beforeAll(async () => { await db.connect(); });
afterAll(async () => { await db.closeDatabase(); });
beforeEach(async () => { await db.clearDatabase(); });

describe('Auth API', () => {
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@bank.com',
        password: 'Test@1234',
        phone: '+91-9999999990',
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user and return a token', async () => {
            const res = await request(app).post('/api/auth/register').send(testUser);
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.data.user.email).toBe(testUser.email);
            expect(res.body.data.user.password).toBeUndefined();
        });

        it('should not register with duplicate email', async () => {
            await request(app).post('/api/auth/register').send(testUser);
            const res = await request(app).post('/api/auth/register').send(testUser);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should not register without required fields', async () => {
            const res = await request(app).post('/api/auth/register').send({ email: 'test@bank.com' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(testUser);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'wrongpassword' });
            expect(res.statusCode).toBe(401);
        });

        it('should reject non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nobody@bank.com', password: 'Test@1234' });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user profile with valid token', async () => {
            const registerRes = await request(app).post('/api/auth/register').send(testUser);
            const token = registerRes.body.token;

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.user.email).toBe(testUser.email);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toBe(401);
        });
    });
});
