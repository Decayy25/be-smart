import type { Request } from "express";
import { Types } from "mongoose";

export interface IUserToken {
  id?: string | Types.ObjectId;
  role?: string;
  roles?: string[];
}

export interface IReqUser extends Request {
  user?: IUserToken;
}
