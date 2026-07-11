import type { Response, Request } from "express";
import type { IReqUser } from "../utils/interfaces";
import { registerSchema } from "../validates/auth.validate";
import UserModel from "../models/user.models";
import { generateToken } from "../utils/jwt";
import { encrypt } from "../utils/encrypt";
import response from "../utils/response";
import { ROLES, STATUS } from "../utils/constant";
import { CLIENT_HOST } from "../utils/environment";
import { renderMailHTML, sendMail } from "../utils/mail";

type TRegister = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  nik_ktp?: string;
};

export default {
  async register(req: Request, res: Response) {
    const { name, email, phoneNumber, password, confirmPassword, nik_ktp } =
      req.body as any as TRegister;

    try {
      const data = await registerSchema.validate({
        name,
        email,
        phoneNumber,
        password,
        confirmPassword,
        nik_ktp,
      });

      const result = await UserModel.create(data);

      return response.success(res, result, "Success registration!");
    } catch (error) {
      return response.error(res, error, "failed registration!");
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return response.error(
          res,
          new Error("Email and password are required"),
          "Invalid credentials",
        );
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return response.error(
          res,
          new Error("User not found"),
          "Invalid email or password",
        );
      }

      if (user.password !== encrypt(password)) {
        return response.error(
          res,
          new Error("Incorrect password"),
          "Invalid email or password",
        );
      }

      // Check status: user must be active to login
      const isActive = user.status.includes(STATUS.ACTIVE);
      if (!isActive) {
        return response.error(
          res,
          new Error(
            "Account is not active yet. Please wait for approval and email activation.",
          ),
          "Login failed",
        );
      }

      // Generate token
      const token = generateToken({
        id: user._id,
        role: user.roles[0],
        roles: user.roles,
      });

      return response.success(
        res,
        {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
          },
        },
        "Login success!",
      );
    } catch (error) {
      return response.error(res, error, "Login failed");
    }
  },

  async approve(req: IReqUser, res: Response) {
    const { id } = req.params;
    const { roles } = req.body;

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return response.error(
          res,
          new Error("User not found"),
          "Approval failed",
        );
      }

      if (user.isApprove === false) {
        return response.error(
          res,
          new Error("User is already approved"),
          "User already approved",
        );
      }

      // Set approved details
      user.isApprove = true;
      user.approvedByUser = (req.user?.id as any) || null;
      user.approvedAt = new Date();

      // If roles specified, update it, otherwise default to STUDENT
      if (roles && Array.isArray(roles) && roles.length > 0) {
        const validRoles = Object.values(ROLES);
        const allValid = roles.every((role) =>
          validRoles.includes(role as ROLES),
        );
        if (!allValid) {
          return response.error(
            res,
            new Error("Invalid roles provided"),
            "Approval failed",
          );
        }
        user.roles = roles;
      } else {
        user.roles = [ROLES.STUDENT];
      }

      await user.save();

      // Send the activation email
      const activationLink = `${CLIENT_HOST}/api/auth/activation?code=${user.activationToken}`;
      const contentMail = await renderMailHTML("registration-success.ejs", {
        name: user.name,
        activationLink,
      });

      await sendMail({
        to: user.email,
        subject: "Aktivasi Akun Anda",
        html: contentMail,
      });

      return response.success(
        res,
        user,
        "User approved successfully. Activation email sent!",
      );
    } catch (error) {
      return response.error(res, error, "Approval failed");
    }
  },

  async activate(req: Request, res: Response) {
    const { code } = req.query;

    try {
      if (!code) {
        return response.error(
          res,
          new Error("Activation code is missing"),
          "Activation failed",
        );
      }

      const user = await UserModel.findOne({ activationToken: String(code) });
      if (!user) {
        return response.error(
          res,
          new Error("Invalid activation code"),
          "Activation failed",
        );
      }

      if (!user.isApprove) {
        return response.error(
          res,
          new Error("This account is not approved by administrators yet"),
          "Activation failed",
        );
      }

      // Set active status, clear activation token
      user.status = [STATUS.ACTIVE];
      user.activationToken = null;
      await user.save();

      return response.success(
        res,
        null,
        "Account activated successfully! You can now log in.",
      );
    } catch (error) {
      return response.error(res, error, "Activation failed");
    }
  },
};
