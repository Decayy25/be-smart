import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/";
export const SECRET = process.env.SECRET || "";
