import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Gig from '../modules/shared/models/Gig.js';
import Application from '../modules/shared/models/Application.js';
import User from '../modules/shared/models/User.js';

// Mock environment variables
process.env.JWT_SECRET = 'testsecret';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gigflow_test';
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoURI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Application.deleteMany({});
});

describe('Gig API Endpoints', () => {
    const registerUserData = { name: 'Gig Owner', email: 'owner@example.com', password: 'password123', role: 'hirer' };
    const registerInternData = { name: 'Gig Intern', email: 'intern@example.com', password: 'password123', role: 'intern' };

    let ownerToken;
    let internToken;
    let ownerId;
    let gigId;

    beforeEach(async () => {
        // Register and login users
        const ownerRes = await request(app).post('/api/v1/auth/register').send(registerUserData);
        ownerToken = ownerRes.headers['set-cookie'];
        ownerId = ownerRes.body.data._id;

        const internRes = await request(app).post('/api/v1/auth/register').send(registerInternData);
        internToken = internRes.headers['set-cookie'];

        // Create a gig owned by the owner
        const gigRes = await request(app)
            .post('/api/v1/gigs')
            .set('Cookie', ownerToken)
            .send({
                title: 'Develop a React App',
                description: 'Need a skilled React developer for a small web application. Must be proficient in hooks.',
                budget: 5000,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Development',
                tags: ['React', 'Frontend', 'JavaScript'],
            });
        gigId = gigRes.body.data._id;
    });

    // Test Create Gig
    describe('POST /api/v1/gigs', () => {
        it('should create a gig if authenticated and authorized', async () => {
            const res = await request(app)
                .post('/api/v1/gigs')
                .set('Cookie', ownerToken)
                .send({
                    title: 'New Gig Title',
                    description: 'Description for new gig that is long enough to pass validation.',
                    budget: 1000,
                    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    category: 'Development',
                    tags: ['test']
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.title).toBe('New Gig Title');
            expect(res.body.data.ownerId).toBe(ownerId);
            expect(res.body.data.status).toBe('open');
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/api/v1/gigs')
                .send({ title: 'New Gig Title', description: 'Description long enough', budget: 1000, category: 'Development' });

            expect(res.statusCode).toEqual(401);
        });

        it('should return 400 for missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/gigs')
                .set('Cookie', ownerToken)
                .send({ description: 'Missing title and budget' }); // Missing required fields

            expect(res.statusCode).toEqual(400);
        });
    });

    // Test Get Gigs (Feed)
    describe('GET /api/v1/gigs', () => {
        it('should return a list of open gigs with pagination', async () => {
            // Create a few more gigs
            await Gig.create({ ownerId: ownerId, title: 'Backend API', description: 'Node.js API for internship portal', budget: 3000, status: 'open', category: 'Development', tags: ['node'], deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await Gig.create({ ownerId: ownerId, title: 'UI Design Task', description: 'Figma design work for landing page', budget: 1500, status: 'open', category: 'Design', tags: ['figma'], deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

            const res = await request(app).get('/api/v1/gigs?limit=2&page=1&search=React'); 

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.gigs).toHaveLength(1); 
            expect(res.body.data.gigs[0].title).toBe('Develop a React App');
        });
    });

    // Test Get Gig by ID
    describe('GET /api/v1/gigs/:id', () => {
        it('should return a single gig by ID', async () => {
            const res = await request(app).get(`/api/v1/gigs/${gigId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('_id', gigId);
            expect(res.body.data.title).toBe('Develop a React App');
        });

        it('should return 404 if gig not found', async () => {
            const res = await request(app).get('/api/v1/gigs/6429f5f5f5f5f5f5f5f5f5f5');
            expect(res.statusCode).toEqual(404);
        });
    });

    // Test Update Gig
    describe('PUT /api/v1/gigs/:id', () => {
        it('should update a gig if owner and gig is open', async () => {
            const updatedData = {
                title: 'Develop a React App - Updated',
                description: 'Updated description for the app. Now with more details.',
                budget: 6000,
                category: 'Development',
            };

            const res = await request(app)
                .put(`/api/v1/gigs/${gigId}`)
                .set('Cookie', ownerToken)
                .send(updatedData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.title).toBe(updatedData.title);
            expect(res.body.data.budget).toBe(updatedData.budget);
        });

        it('should return 403 if not owner', async () => {
            const res = await request(app)
                .put(`/api/v1/gigs/${gigId}`)
                .set('Cookie', internToken) 
                .send({ title: 'Should Fail Now' });

            expect(res.statusCode).toEqual(403);
        });
    });

    // Test Delete Gig
    describe('DELETE /api/v1/gigs/:id', () => {
        it('should delete a gig if owner', async () => {
            const res = await request(app)
                .delete(`/api/v1/gigs/${gigId}`)
                .set('Cookie', ownerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Internship deleted successfully');

            const gig = await Gig.findById(gigId);
            expect(gig).toBeNull();
        });
    });
});
