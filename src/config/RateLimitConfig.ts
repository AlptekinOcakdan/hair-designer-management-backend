import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});