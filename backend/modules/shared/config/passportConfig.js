import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import logger from './logger.js'; // Import Winston logger

const configurePassport = () => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        logger.error('GOOGLE_CLIENT_ID is missing from environment variables.');
    } else {
        logger.info(`Google Client ID loaded: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...`);
    }

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
        proxy: true // Necessary if behind a proxy like Heroku/Render
    },
    async (request, accessToken, refreshToken, profile, done) => {
        logger.debug('Google OAuth Strategy invoked.'); // Use logger.debug
        try {
            const user = await User.findOne({ googleId: profile.id });

            if (user) {
                logger.info(`User found with Google ID: ${profile.id}`);
                // Update user details if necessary (e.g., name, avatar)
                // This is a good place to sync details from Google profile
                user.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.avatar = profile.photos?.[0].value || '';
                await user.save();
                done(null, user);
            } else {
                logger.log('debug', 'User not found, creating new user.'); // Use logger.log for debug level
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.name.givenName + ' ' + profile.name.familyName,
                    email: profile.emails[0].value,
                    avatar: profile.photos?.[0].value || '',
                    role: 'intern', // Default role for new Google users
                });
                logger.info(`New user created with Google ID: ${profile.id}`);
                done(null, newUser);
            }
        } catch (error) {
            logger.error('Error during Google OAuth callback:', error); // Use logger.error
            done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        logger.debug(`Serializing user: ${user._id}`); // Use logger.debug
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        logger.debug(`Deserializing user with ID: ${id}`); // Use logger.debug
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            logger.error('Error deserializing user:', error); // Use logger.error
            done(error, null);
        }
    });

    logger.info('Google OAuth Strategy initialized successfully.'); // Use logger.info
};

export default configurePassport;
