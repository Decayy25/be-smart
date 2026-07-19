import type { Response, NextFunction } from "express";
import type { IReqUser } from "../utils/interfaces";
import { getUserData } from "../utils/jwt";
import response from "../utils/response";

export const authenticate = (req: IReqUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.unauthorized(res, "Authorization token is missing or invalid");
  }

  const token = authHeader.split(" ")[1] ?? "";
  try {
    const decoded = getUserData(token);
    req.user = decoded;
    next();
  } catch (error) {
    return response.unauthorized(res, "Invalid or expired token");
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: IReqUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return response.unauthorized(res, "User not authenticated");
    }

    const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
    const hasRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      return response.unauthorized(res, "You do not have permission to access this resource");
    }

    next();
  };
};
