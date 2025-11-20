import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    schema: "./src/infrastructure/databases/drizzle/model/*",
    out: "./drizzle", // Migration dosyalarının çıkacağı yer
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});