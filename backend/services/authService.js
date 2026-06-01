import User from '../modules/shared/models/User.js';

/**
 * Service for user registration.
 */
export const register = async (userData) => {
    const { name, email, password, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        const error = new Error('User already exists');
        error.status = 400;
        throw error;
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'intern'
    });

    return user;
};

/**
 * Service for user login.
 */
export const login = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        return user;
    } else {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }
};

/**
 * Service for updating user profile.
 */
export const updateProfile = async (userId, updateData) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    // Update allowed fields
    const allowedFields = ['name', 'bio', 'skills', 'avatar', 'linkedin', 'github', 'twitter'];
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            user[field] = updateData[field];
        }
    });

    return await user.save();
};
