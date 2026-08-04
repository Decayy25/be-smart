import crypto from "crypto";
import { SECRET } from "./environment";

export const encrypt = (password: string): string => {
  const encrypted = crypto
    .pbkdf2Sync(password, SECRET, 1000, 64, "sha512")
    .toString("hex");
  return encrypted;
};

export const comparePassword = (
  password: string,
  storedPassword: string,
): boolean => {
  if (!password || !storedPassword) {
    return false;
  }

  if (storedPassword === password) {
    return true;
  }

  return storedPassword === encrypt(password);
};
