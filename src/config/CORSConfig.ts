import {
    PRODUCTION_SERVER_URL,
    DEVELOPMENT_SERVER_URL,
    ADMIN_DASHBOARD_URL,
    LOCAL_DEVELOPMENT_URL,
    LOCAL_PRODUCTION_URL,
    FRONTEND_URL,
} from "../interfaces/utils/constants";

export const corsOptions = {
    origin: [
        DEVELOPMENT_SERVER_URL,
        PRODUCTION_SERVER_URL,
        FRONTEND_URL,
        ADMIN_DASHBOARD_URL,
        LOCAL_DEVELOPMENT_URL,
        LOCAL_PRODUCTION_URL,
    ],
    methods: ["GET", "POST"],
    credentials: true,
};

