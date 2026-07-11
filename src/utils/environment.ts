import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/";
export const SECRET = process.env.SECRET || "supersecretkey123";
export const CLIENT_HOST = process.env.CLIENT_HOST || "http://localhost:3000";

export const EMAIL_SMTP_SECURE = process.env.EMAIL_SMTP_SECURE || "";
export const EMAIL_SMTP_SERVICE_NAME = process.env.EMAIL_SMTP_SERVICE_NAME || "";
export const EMAIL_SMTP_HOST = process.env.EMAIL_SMTP_HOST || "";
export const EMAIL_SMTP_PORT = process.env.EMAIL_SMTP_PORT || "587";
export const EMAIL_SMTP_USER = process.env.EMAIL_SMTP_USER || "";
export const EMAIL_SMTP_PASS = process.env.EMAIL_SMTP_PASS || "";
