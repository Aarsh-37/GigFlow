import jwt from 'jsonwebtoken';

const generateToken = (res, user) => {
    const token = jwt.sign(
        { 
            userId: user._id,
            email: user.email,
            role: user.role
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '30d'
        }
    );

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // 'lax' allows the cookie to be set after top-level cross-site redirects (e.g., Google OAuth).
        // 'strict' would block it, causing Google Auth to fail silently.
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return token;
};

export default generateToken;
