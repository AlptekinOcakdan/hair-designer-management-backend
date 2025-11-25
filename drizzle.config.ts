import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import {DATABASE_URL} from "./src/interfaces/utils/constants";

dotenv.config();

export default defineConfig({
    schema: "./src/infrastructure/databases/drizzle/model/*",
    out: "./drizzle", // Migration dosyalarının çıkacağı yer
    dialect: "postgresql",
    dbCredentials: {
        url: DATABASE_URL!,
    },
});