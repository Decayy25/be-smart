import mongoose from "mongoose";
import { DATABASE_URL } from "./environment";

const db = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "db-wpu",
    });
    return Promise.resolve("Database connectted!");
  } catch (error) {
    return Promise.reject(error);
  }
};

export default db;
