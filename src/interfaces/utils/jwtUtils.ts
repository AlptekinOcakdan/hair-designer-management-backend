import jwt from 'jsonwebtoken';
import {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    makeSignOptions
} from "./constants";

// Updated: Accepts roles array
const generateAccessToken = (userId: string, roles: string[], rememberMe?: boolean) => {
    return jwt.sign(
        { userId, roles },
        ACCESS_TOKEN_SECRET,
        makeSignOptions(rememberMe ? REFRESH_TOKEN_EXPIRY : ACCESS_TOKEN_EXPIRY)
    );
};

const generateRefreshToken = (userId: string) => {
    return jwt.sign(
        { userId },
        REFRESH_TOKEN_SECRET,
        makeSignOptions(REFRESH_TOKEN_EXPIRY)
    );
};

const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};