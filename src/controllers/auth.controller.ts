import type { Response, Request } from "express";
import { registerSchema } from "../validates/auth.validate";
import UserModel from "../models/user.models";
// import { IReqUser } from "../utils/interfaces";
import { generateToken } from "../utils/jwt";
import response from "../utils/response";

type TRegister = {
  name: string;
  email: string;
  password: string;
  confimPassword: string;
  nik_ktp?: string;
};

export default {
  async register(req: Request, res: Response) {
    const { name, email, password, confimPassword, nik_ktp } =
      req.body as any as TRegister;

    try {
      const data = await registerSchema.validate({
        name,
        email,
        password,
        confimPassword,
        nik_ktp,
      });

      const result = await UserModel.create(data);

      return response.success(res, result, "Success registration!");
    } catch (error) {
        return response.error(res, error, "failed registration!");
    }
  },
};
