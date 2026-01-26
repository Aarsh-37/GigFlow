import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

describe('User Model Test', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should hash password on save', async () => {
        const userData = {
            name: 'Test Member',
            email: `test-${Date.now()}@example.com`,
            password: 'password123'
        };
        const user = await User.create(userData);
        expect(user.password).not.toBe(userData.password);
        await User.findByIdAndDelete(user._id);
    });

    it('should correctly match password', async () => {
        const userData = {
            name: 'Auth Test',
            email: `auth-${Date.now()}@example.com`,
            password: 'password123'
        };
        const user = await User.create(userData);
        const isMatch = await user.matchPassword('password123');
        const isNotMatch = await user.matchPassword('wrongpassword');

        expect(isMatch).toBe(true);
        expect(isNotMatch).toBe(false);
        await User.findByIdAndDelete(user._id);
    });
});
