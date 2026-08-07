import type { Response, NextFunction } from "express";
import type { IReqUser } from "../utils/interfaces";
import TeacherProfileModel from "../models/User/teacher.models";
import { ROLES } from "../utils/constant";
import { getUserData } from "../utils/jwt";
import response from "../utils/response";

export const authenticate = (
  req: IReqUser,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.unauthorized(
      res,
      "Authorization token is missing or invalid",
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = getUserData(token!);
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

    const userRoles = req.user.roles;
    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return response.unauthorized(
        res,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
};
export const authorizePosition = (allowedPositions: string[]) => {
  return async (req: IReqUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return response.unauthorized(res, "User not authenticated");
    }

    const userRoles = req.user.roles || (req.user.roles ? [req.user.roles] : []);
    if (!userRoles.includes(ROLES.TEACHER)) {
      return response.unauthorized(
        res,
        "You do not have permission to access this resource",
      );
    }

    let positions = Array.isArray(req.user.positions) ? req.user.positions : [];

    if (positions.length === 0) {
      const teacherProfile = await TeacherProfileModel.findOne({
        userId: req.user.id,
      });
      positions = teacherProfile?.positions || [];
    }

    const hasPosition = positions.some((position) =>
      allowedPositions.includes(position),
    );

    if (!hasPosition) {
      return response.unauthorized(
        res,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
};
