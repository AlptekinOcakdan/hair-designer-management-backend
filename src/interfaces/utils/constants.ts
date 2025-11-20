import dotenv from "dotenv";
import jwt, {Secret} from "jsonwebtoken";

dotenv.config();

const requireEnv = (key: string): string => {
    return process.env[key] as string;
};

export const makeSignOptions = (expiry: string): jwt.SignOptions => {
    return {
        expiresIn: expiry as jwt.SignOptions["expiresIn"],
    };
};

export const NODE_ENV = requireEnv("NODE_ENV");
export const PORT = requireEnv("PORT");
export const PRODUCTION_SERVER_URL = requireEnv("PRODUCTION_SERVER_URL");
export const DEVELOPMENT_SERVER_URL = requireEnv("DEVELOPMENT_SERVER_URL");
export const ADMIN_DASHBOARD_URL = requireEnv("ADMIN_DASHBOARD_URL");
export const LOCAL_DEVELOPMENT_URL = requireEnv("LOCAL_DEVELOPMENT_URL");
export const LOCAL_PRODUCTION_URL = requireEnv("LOCAL_PRODUCTION_URL");
export const FRONTEND_URL = requireEnv("FRONTEND_URL");
export const DATABASE_URL = requireEnv("DATABASE_URL");
export const ACCESS_TOKEN_SECRET: Secret = requireEnv("ACCESS_TOKEN_SECRET");
export const REFRESH_TOKEN_SECRET: Secret = requireEnv("REFRESH_TOKEN_SECRET");
export const RESET_PASSWORD_SECRET: Secret = requireEnv("RESET_PASSWORD_SECRET");
export const API_URL = requireEnv("API_URL");
export const API_PREFIX = requireEnv("API_PREFIX");
export const EMAIL_SERVICE = requireEnv("EMAIL_SERVICE");
export const EMAIL_HOST = requireEnv("EMAIL_HOST");
export const EMAIL_PORT = requireEnv("EMAIL_PORT");
export const EMAIL_SECURE = requireEnv("EMAIL_SECURE");
export const SENDER_EMAIL = requireEnv("SENDER_EMAIL");
export const SENDER_EMAIL_PASSWORD = requireEnv("SENDER_EMAIL_PASSWORD");
export const AWS_ACCESS_KEY = requireEnv("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_KEY = requireEnv("AWS_SECRET_ACCESS_KEY");
export const AWS_REGION = requireEnv("AWS_REGION");
export const AWS_BUCKET_NAME = requireEnv("AWS_BUCKET_NAME");
export const ACCESS_TOKEN_EXPIRY = requireEnv("ACCESS_TOKEN_EXPIRY");
export const REFRESH_TOKEN_EXPIRY = requireEnv("REFRESH_TOKEN_EXPIRY");
export const NETGSM_USER_CODE = requireEnv("NETGSM_USER_CODE");
export const NETGSM_PASSWORD = requireEnv("NETGSM_PASSWORD");
export const NETGSM_HEADER = requireEnv("NETGSM_HEADER");

export const USER_ROLES = {
    ADMIN: "ADMIN",
    SYS_ADMIN: "SYS_ADMIN",
    MASTER:'MASTER',
    USER: "USER",
};