import type { Request } from "express";
import { Types } from "mongoose";

export interface IUserToken {
  id: string | Types.ObjectId;
  username?: string;
  roles: string[];
  positions?: string[];
}

export interface IReqUser extends Request {
  user?: IUserToken;
}

export interface IApproveUser extends Request {
  userId?: string;
  isApprove: string;
  approvedAt?: Date;
}
