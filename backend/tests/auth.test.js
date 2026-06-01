import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../modules/shared/models/User.js';

// Mock environment variables
process.env.JWT_SECRET = 'testsecret';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
    // Wait for DB connection
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gigflow_test';
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoURI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('Auth API Endpoints', () => {
    const registerEndpoint = '/api/v1/auth/register';
    const loginEndpoint = '/api/v1/auth/login';
    const meEndpoint = '/api/v1/auth/me';
    const logoutEndpoint = '/api/v1/auth/logout';

    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user and set cookie', async () => {
            const res = await request(app)
                .post(registerEndpoint)
                .send(testUser);

            if (res.statusCode !== 201) console.log('Register Error:', res.body);
            expect(res.statusCode).toEqual(201);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.body.data.name).toBe(testUser.name);
            expect(res.body.data.email).toBe(testUser.email);
        });

        it('should return 400 if user already exists', async () => {
            await User.create(testUser);

            const res = await request(app)
                .post(registerEndpoint)
                .send(testUser);

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await request(app).post(registerEndpoint).send(testUser);
        });

        it('should log in a user and set cookie', async () => {
            const res = await request(app)
                .post(loginEndpoint)
                .send({ email: testUser.email, password: testUser.password });

            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.body.data.email).toBe(testUser.email);
        });

        it('should return 401 for invalid credentials', async () => {
            const res = await request(app)
                .post(loginEndpoint)
                .send({ email: testUser.email, password: 'wrongpassword' });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        beforeEach(async () => {
            await request(app).post(registerEndpoint).send(testUser);
        });

        it('should return user info if cookie is present', async () => {
            const loginRes = await request(app)
                .post(loginEndpoint)
                .send({ email: testUser.email, password: testUser.password });
            
            const cookie = loginRes.headers['set-cookie'];

            const res = await request(app)
                .get(meEndpoint)
                .set('Cookie', cookie);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.email).toBe(testUser.email);
        });

        it('should return 401 if cookie is missing', async () => {
            const res = await request(app).get(meEndpoint);
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('should clear the cookie', async () => {
            const res = await request(app).post(logoutEndpoint);
            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie'][0]).toContain('jwt=;');
        });
    });
});
