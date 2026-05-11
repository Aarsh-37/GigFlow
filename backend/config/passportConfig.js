import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
    // 1. Setup Session Serialization (Always Needed)
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // 2. Setup Google Strategy (Optional)
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret || clientID === '' || clientSecret === '') {
        console.warn('--- PASSPORT WARNING ---');
        console.warn('Google OAuth credentials missing.');
        console.warn('Google Login functionality will be disabled.');
        console.warn('---');
        return;
    }

    console.log('Initializing Google OAuth Strategy...');

    try {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: clientID,
                    clientSecret: clientSecret,
                    callbackURL: '/api/auth/google/callback',
                },
                async (accessToken, refreshToken, profile, done) => {
                    const { id, displayName, emails } = profile;
                    const email = emails[0].value;

                    try {
                        let user = await User.findOne({
                            $or: [
                                { googleId: id },
                                { email: email }
                            ]
                        });

                        if (user) {
                            if (!user.googleId) {
                                user.googleId = id;
                                await user.save();
                            }
                            return done(null, user);
                        }

                        user = await User.create({
                            name: displayName,
                            email: email,
                            googleId: id,
                        });

                        return done(null, user);
                    } catch (error) {
                        return done(error, null);
                    }
                }
            )
        );
        console.log('Google OAuth Strategy initialized successfully.');
    } catch (strategyError) {
        console.error('CRITICAL ERROR: Failed to initialize Google Strategy:', strategyError.message);
    }
};

export default configurePassport;
