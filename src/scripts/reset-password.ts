import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import { DATABASE_URL, SECRET } from "../utils/environment";

dotenv.config();

const encrypt = (password: string): string => {
  return crypto
    .pbkdf2Sync(password, SECRET, 1000, 64, "sha512")
    .toString("hex");
};

async function resetPassword() {
  const email = "staff@school.example.com";
  const newPassword = "password123";

  try {
    await mongoose.connect(DATABASE_URL, { dbName: "DB-smart" });
    console.log("✅ Connected to database");

    const hashedPassword = encrypt(newPassword);
    console.log(`🔑 New hashed password: ${hashedPassword}`);

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    // Update langsung di database (bypass pre-save hook agar tidak double encrypt)
    const result = await db
      .collection("Users")
      .updateOne(
        { email: email },
        { $set: { password: hashedPassword } }
      );

    if (result.matchedCount === 0) {
      console.log(`❌ User dengan email "${email}" tidak ditemukan`);
    } else {
      console.log(`✅ Password berhasil direset untuk: ${email}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

resetPassword();
