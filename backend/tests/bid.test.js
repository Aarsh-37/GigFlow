const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Assuming your Express app is exported from server.js
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');
const User = require('../models/User');

let server;
let dbConnection;

// Mock JWT secret for testing
process.env.JWT_SECRET = 'testsecret';

// Helper function to register and login users
async function registerAndLoginUser(userData) {
    const registerRes = await request(app).post('/api/auth/register').send(userData);
    const loginRes = await request(server).post('/api/auth/login').send({ email: userData.email, password: userData.password });
    return loginRes.body; // Returns { user, token }
}

beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/gigflow_test';
    dbConnection = await mongoose.connect(mongoURI);
    server = app.listen(5003); // Use a different port for tests
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Bid.deleteMany({});
});

describe('Bid API Endpoints', () => {
    const registerOwnerData = { name: 'Bid Owner', email: 'bidowner@example.com', password: 'password123', role: 'client' };
    const registerFreelancerData = { name: 'Bid Freelancer', email: 'bidfreelancer@example.com', password: 'password123', role: 'freelancer' };

    let ownerToken, freelancerToken;
    let ownerId, freelancerId;
    let gigId;
    let ownerBalanceBefore; // To track balance changes

    beforeEach(async () => {
        // Register and login users
        const ownerRes = await registerAndLoginUser(registerOwnerData);
        ownerToken = ownerRes.token;
        ownerId = ownerRes.user._id;

        const freelancerRes = await registerAndLoginUser(registerFreelancerData);
        freelancerToken = freelancerRes.token;
        freelancerId = freelancerRes.user._id;

        // Create a gig owned by the owner
        const gigRes = await request(app)
            .post('/api/gigs')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
                title: 'Test Gig for Bids',
                description: 'Description for bid tests',
                budget: 5000,
                bidDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                category: 'Development',
            });
        gigId = gigRes.body._id;

        // Store owner's balance before any bids/hires
        const owner = await User.findById(ownerId);
        ownerBalanceBefore = owner.balance;
    });

    // Test Place Bid
    describe('POST /api/bids', () => {
        it('should allow a freelancer to place a bid', async () => {
            const res = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'I can do this!', price: 4500 });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.gigId).toBe(gigId);
            expect(res.body.freelancerId).toBe(freelancerId);
            expect(res.body.price).toBe(4500);
            expect(res.body.status).toBe('pending');
        });

        it('should return 400 if freelancer bids on their own gig', async () => {
            const res = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${ownerToken}`) // Owner trying to bid on their own gig
                .send({ gigId: gigId, message: 'Owner bid', price: 4000 });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'You cannot bid on your own gig');
        });

        it('should return 400 if gig is not open', async () => {
            // Close the gig first
            await Gig.findByIdAndUpdate(gigId, { status: 'closed' });

            const res = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'Bid on closed gig', price: 4000 });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'This gig is no longer open');
        });

        it('should return 400 if bid deadline has passed', async () => {
            // Set gig deadline to past
            await Gig.findByIdAndUpdate(gigId, { bidDeadline: new Date(Date.now() - 1000) }); // 1 second ago

            const res = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'Bid after deadline', price: 4000 });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'The bid deadline for this gig has passed');
        });

        it('should return 400 if freelancer already bid on the gig', async () => {
            // Place one bid
            await request(app).post('/api/bids').set('Authorization', `Bearer ${freelancerToken}`).send({ gigId: gigId, message: 'First bid', price: 4500 });

            // Try to place another bid
            const res = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'Second bid', price: 4600 });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'You have already placed a bid on this gig');
        });

        it('should return 400 for missing fields', async () => {
            const res = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'Missing price' }); // Missing price

            expect(res.statusCode).toEqual(400);
        });
    });

    // Test Get Bids for a Gig (Owner view)
    describe('GET /api/bids/:gigId', () => {
        let anotherGigId;
        let anotherFreelancerToken;

        beforeEach(async () => {
            // Create another gig and register/login another freelancer
            const gigRes = await request(app)
                .post('/api/gigs')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ title: 'Another Gig', description: 'Desc', budget: 2000 });
            anotherGigId = gigRes.body._id;

            const anotherFreelancerRes = await registerAndLoginUser({ name: 'Another Freelancer', email: 'another@example.com', password: 'password123', role: 'freelancer' });
            anotherFreelancerToken = anotherFreelancerRes.token;

            // Place bids on the original gig
            await request(app).post('/api/bids').set('Authorization', `Bearer ${freelancerToken}`).send({ gigId: gigId, message: 'Bid 1', price: 4500 });
            await request(app).post('/api/bids').set('Authorization', `Bearer ${anotherFreelancerToken}`).send({ gigId: gigId, message: 'Bid 2', price: 4600 });

            // Place bid on the other gig
            await request(app).post('/api/bids').set('Authorization', `Bearer ${freelancerToken}`).send({ gigId: anotherGigId, message: 'Bid on other gig', price: 1800 });
        });

        it('should return bids for a specific gig (owner view)', async () => {
            const res = await request(app)
                .get(`/api/bids/${gigId}`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(2); // Should get bids for the original gig
            expect(res.body[0]).toHaveProperty('freelancerId');
            expect(res.body[0].freelancerId.name).toBe('Bid Freelancer'); // Check populated freelancer name
            expect(res.body[0].price).toBe(4600); // Check sorting by createdAt (desc)
        });

        it('should return 401 if not owner', async () => {
            const res = await request(app)
                .get(`/api/bids/${gigId}`)
                .set('Authorization', `Bearer ${freelancerToken}`); // Freelancer trying to view bids

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Not authorized to view bids for this gig');
        });

        it('should return 404 if gig not found', async () => {
            const res = await request(app)
                .get('/api/bids/invalidgigid')
                .set('Authorization', `Bearer ${ownerToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    // Test Hire Freelancer
    describe('PATCH /api/bids/:bidId/hire', () => {
        let bidToHireId;

        beforeEach(async () => {
            // Place a bid to hire
            const bidRes = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'Hire me!', price: 4500 });
            bidToHireId = bidRes.body._id;
        });

        it('should hire a freelancer and update statuses', async () => {
            const res = await request(app)
                .patch(`/api/bids/${bidToHireId}/hire`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Freelancer hired successfully');
            expect(res.body.gig.status).toBe('assigned');
            expect(res.body.bid.status).toBe('hired');

            // Check if other bids for the same gig were rejected
            const otherBids = await Bid.find({ gigId: gigId, _id: { $ne: bidToHireId } });
            otherBids.forEach(b => expect(b.status).toBe('rejected'));

            // Check owner's balance deduction and freelancer's balance increase (simulated)
            const owner = await User.findById(ownerId);
            const freelancer = await User.findById(freelancerId);
            expect(owner.balance).toBe(ownerBalanceBefore - 4500); // Owner balance reduced by bid price
            expect(freelancer.balance).toBeGreaterThan(0); // Freelancer balance should increase (simulated addition)
        });

        it('should return 401 if not gig owner', async () => {
            const res = await request(app)
                .patch(`/api/bids/${bidToHireId}/hire`)
                .set('Authorization', `Bearer ${freelancerToken}`); // Freelancer trying to hire

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Not authorized to hire for this gig');
        });

        it('should return 400 if gig is not open', async () => {
            await Gig.findByIdAndUpdate(gigId, { status: 'assigned' }); // Make gig assigned
            const res = await request(app)
                .patch(`/api/bids/${bidToHireId}/hire`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Gig is not open for hiring');
        });

        it('should return 400 if owner tries to hire themselves', async () => {
             // First, register owner as a freelancer too (if roles allow)
            const ownerAsFreelancerData = { name: 'Owner as Freelancer', email: 'ownerfreelancer@example.com', password: 'password123', role: 'freelancer' };
            await request(app).post('/api/auth/register').send(ownerAsFreelancerData);
            const ownerAsFreelancerToken = await registerAndLoginUser(ownerAsFreelancerData);

            // Bid on the gig using the owner's freelancer identity
            const ownerBidRes = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${ownerAsFreelancerToken}`)
                .send({ gigId: gigId, message: 'Owner bids as freelancer', price: 3000 });

            const res = await request(app)
                .patch(`/api/bids/${ownerBidRes.body._id}/hire`)
                .set('Authorization', `Bearer ${ownerAsFreelancerToken}`); // Owner trying to hire themselves

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'You cannot hire yourself');
        });

         it('should return 400 if insufficient balance', async () => {
            // Reduce owner's balance to be less than bid price
            await User.findByIdAndUpdate(ownerId, { balance: 1000 }); // Bid price is 4500

            const res = await request(app)
                .patch(`/api/bids/${bidToHireId}/hire`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Insufficient balance to hire for this gig');
        });
    });

    // Test Update Bid
    describe('PATCH /api/bids/:id', () => {
        let bidToUpdateId;

        beforeEach(async () => {
            // Place a bid to update
            const bidRes = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'Initial bid', price: 4000 });
            bidToUpdateId = bidRes.body._id;
        });

        it('should update a bid if it is pending and user is the bidder', async () => {
            const updatedData = { message: 'Updated bid message', price: 4200 };
            const res = await request(app)
                .patch(`/api/bids/${bidToUpdateId}`)
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send(updatedData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe(updatedData.message);
            expect(res.body.price).toBe(updatedData.price);
            expect(res.body.status).toBe('pending'); // Status should remain pending
        });

        it('should return 401 if user is not the bidder', async () => {
            const res = await request(app)
                .patch(`/api/bids/${bidToUpdateId}`)
                .set('Authorization', `Bearer ${ownerToken}`) // Owner trying to update freelancer's bid
                .send({ price: 4100 });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Not authorized to update this bid');
        });

        it('should return 400 if gig is not open', async () => {
            await Gig.findByIdAndUpdate(gigId, { status: 'assigned' }); // Make gig assigned

            const res = await request(app)
                .patch(`/api/bids/${bidToUpdateId}`)
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ price: 4100 });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Cannot update bid: Gig is no longer open');
        });

        it('should return 400 for invalid price', async () => {
            const res = await request(app)
                .patch(`/api/bids/${bidToUpdateId}`)
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ price: -100 }); // Invalid price

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Price must be a positive number');
        });
    });

    // Test Withdraw Bid
    describe('DELETE /api/bids/:id', () => {
        let bidToWithdrawId;

        beforeEach(async () => {
            // Place a bid to withdraw
            const bidRes = await request(app)
                .post('/api/bids')
                .set('Authorization', `Bearer ${freelancerToken}`)
                .send({ gigId: gigId, message: 'Bid to withdraw', price: 4000 });
            bidToWithdrawId = bidRes.body._id;
        });

        it('should allow a freelancer to withdraw a pending bid', async () => {
            const res = await request(app)
                .delete(`/api/bids/${bidToWithdrawId}`)
                .set('Authorization', `Bearer ${freelancerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Bid withdrawn successfully');

            // Verify bid is deleted from DB
            const bid = await Bid.findById(bidToWithdrawId);
            expect(bid).toBeNull();
        });

        it('should return 401 if user is not the bidder', async () => {
            const res = await request(app)
                .delete(`/api/bids/${bidToWithdrawId}`)
                .set('Authorization', `Bearer ${ownerToken}`); // Owner trying to withdraw freelancer's bid

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Not authorized to withdraw this bid');
        });

        it('should return 400 if gig is not open', async () => {
            await Gig.findByIdAndUpdate(gigId, { status: 'assigned' }); // Make gig assigned

            const res = await request(app)
                .delete(`/api/bids/${bidToWithdrawId}`)
                .set('Authorization', `Bearer ${freelancerToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Cannot withdraw bid: Gig is no longer open');
        });

         it('should return 404 if bid not found', async () => {
            const res = await request(app)
                .delete('/api/bids/invalidbidid')
                .set('Authorization', `Bearer ${freelancerToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Bid not found');
        });
    });
});
