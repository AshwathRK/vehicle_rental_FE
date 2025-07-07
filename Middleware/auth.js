const { verifyAccessToken } = require('../utill');

const verifyTokenfromCookies = (req, res, next) => {
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    const token = req.cookies.accessToken;

    if (!token) {
        return next(); // Proceed without user if no token
    }

    try {
        const userPayload = verifyAccessToken(token);
        const expectedDeviceId = req.cookies.deviceId;

        // ✅ Fix: use `userPayload` instead of undefined `payload`
        if (userPayload.deviceId !== expectedDeviceId) {
            return res.status(403).json({ message: 'Token misuse detected' });
        }

        req.user = userPayload;
        console.log(userPayload)
        return next();
    } catch (error) {
        // Optionally clear the cookie if it's invalid
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyTokenfromCookies;