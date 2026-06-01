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

describe('Application API Endpoints', () => {
    const hirerData = { name: 'Hirer', email: 'hirer@example.com', password: 'password123', role: 'hirer' };
    const internData = { name: 'Intern', email: 'intern@example.com', password: 'password123', role: 'intern' };

    let hirerToken;
    let internToken;
    let gigId;

    const validApplication = {
        coverLetter: 'I am a highly motivated student with strong React skills. I have built several projects using hooks and context API.',
        resume: 'https://cloudinary.com/resume.pdf'
    };

    beforeEach(async () => {
        // Register and login users
        const hirerRes = await request(app).post('/api/v1/auth/register').send(hirerData);
        hirerToken = hirerRes.headers['set-cookie'];

        const internRes = await request(app).post('/api/v1/auth/register').send(internData);
        internToken = internRes.headers['set-cookie'];

        // Create a gig owned by the hirer
        const gigRes = await request(app)
            .post('/api/v1/gigs')
            .set('Cookie', hirerToken)
            .send({
                title: 'Test Gig for Applications',
                description: 'Description for application tests. Needs to be long enough to pass validation.',
                budget: 5000,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                category: 'Development',
                tags: ['test']
            });
        gigId = gigRes.body.data._id;
    });

    // Test Apply for Gig
    describe('POST /api/v1/applications', () => {
        it('should allow an intern to apply for a gig', async () => {
            const res = await request(app)
                .post('/api/v1/applications')
                .set('Cookie', internToken)
                .send({ ...validApplication, gigId: gigId });

            expect(res.statusCode).toEqual(201);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.gigId).toBe(gigId);
            expect(res.body.data.status).toBe('APPLIED');
        });

        it('should return 403 if hirer tries to apply', async () => {
            const res = await request(app)
                .post('/api/v1/applications')
                .set('Cookie', hirerToken)
                .send({ ...validApplication, gigId: gigId });

            expect(res.statusCode).toEqual(403);
        });
    });

    // Test Get Gig Applications (Hirer view)
    describe('GET /api/v1/applications/gig/:gigId', () => {
        beforeEach(async () => {
            // Intern applies for the gig
            await request(app)
                .post('/api/v1/applications')
                .set('Cookie', internToken)
                .send({ ...validApplication, gigId: gigId });
        });

        it('should return applications for a specific gig (hirer view)', async () => {
            const res = await request(app)
                .get(`/api/v1/applications/gig/${gigId}`)
                .set('Cookie', hirerToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].coverLetter).toBe(validApplication.coverLetter);
        });

        it('should return 403 if intern tries to view gig applications', async () => {
            const res = await request(app)
                .get(`/api/v1/applications/gig/${gigId}`)
                .set('Cookie', internToken);

            expect(res.statusCode).toEqual(403);
        });
    });

    // Test Update Application Status
    describe('PATCH /api/v1/applications/:id/status', () => {
        let applicationId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/v1/applications')
                .set('Cookie', internToken)
                .send({ ...validApplication, gigId: gigId });
            applicationId = res.body.data._id;
        });

        it('should allow hirer to update application status', async () => {
            const res = await request(app)
                .patch(`/api/v1/applications/${applicationId}/status`)
                .set('Cookie', hirerToken)
                .send({ status: 'HIRED' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.status).toBe('HIRED');
        });

        it('should return 403 if intern tries to update status', async () => {
            const res = await request(app)
                .patch(`/api/v1/applications/${applicationId}/status`)
                .set('Cookie', internToken)
                .send({ status: 'REJECTED' });

            expect(res.statusCode).toEqual(403);
        });
    });
});
