import { IUserToken } from "./interfaces";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { SECRET } from "./env";

export const generateToken = (user: IUserToken): string => {
  return jwt.sign({ ...user }, SECRET, {
    expiresIn: "1h",
  });
};

export const getUserData = (token: string) => {
  return jwt.verify(token, SECRET) as IUserToken;
};
