import mongoose from "mongoose";
import { DATABASE_URL } from "./environment";

const db = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "DB-smart",
    });
    return Promise.resolve("\x1b[32mDatabase connectted! ✅");
  } catch (error) {
    return Promise.reject(error);
  }
};

export default db;
