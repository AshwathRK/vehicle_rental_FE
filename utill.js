const jwt = require('jsonwebtoken');
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET =process.env.REFRESH_TOKEN_SECRET;

const generateTokens = (payload, deviceId) => {
    try {
        const accessToken = jwt.sign({ ...payload, deviceId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ ...payload, deviceId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    } catch (err) {
        throw new Error('Payload missing or invalid');
    }
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new Error('Access token verification failed');
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new Error('Refresh token verification failed');
    }
};

module.exports = {
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken
};