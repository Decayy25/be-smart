import { IUserToken } from "./interfaces";
import jwt from "jsonwebtoken";
import { SECRET } from "./environment";

export const generateToken = (user: IUserToken): string => {
  return jwt.sign({ ...user }, SECRET, {
    expiresIn: "1h",
  });
};

export const getUserData = (token: string) => {
  return jwt.verify(token, SECRET) as IUserToken;
};
