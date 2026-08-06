import type { Request } from "express";
import { Types } from "mongoose";

export interface IUserToken {
  id: string | Types.ObjectId;
  roles: string[];
}

export interface IReqUser extends Request {
  user?: IUserToken;
}

export interface IApproveUser extends Request {
  userId: string;
  isApprove: boolean;
  approveByUser: string;
  approveAt: Date;
}