import type { Response, Request } from "express";
import type { IReqUser } from "../utils/interfaces";
import { getRegisterSchema } from "../schemas/auth.schema";
import UserModel from "../models/user.models";
import { generateToken } from "../utils/jwt";
import { encrypt } from "../utils/encrypt";
import response from "../utils/response";
import { APPROVE, ROLES, STATUS } from "../utils/constant";
import { CLIENT_HOST } from "../utils/environment";
import { sendRegistrationEmail } from "../utils/mail";
import * as Yup from "yup";

export default {
  async register(req: Request, res: Response) {
    const { role, ...data } = req.body;

    try {
      // Validasi berdasarkan role
      const schema = getRegisterSchema(role);
      const validatedData = await schema.validate({ role, ...data });

      // Cek email sudah terdaftar
      const existingUser = await UserModel.findOne({
        email: validatedData.email,
      });
      if (existingUser) {
        return response.error(
          res,
          new Error("Email already registered"),
          `Registration failed, problem: Email already registered`,
        );
      }

      // Untuk TEACHER: cek NUPTK sudah terdaftar
      if (role === "TEACHER") {
        const existingTeacher = await UserModel.findOne({
          nuptk: (validatedData as any).nuptk,
        });
        if (existingTeacher) {
          return response.error(
            res,
            new Error("NUPTK already registered"),
            `Registration failed, problem: NUPTK already registered`,
          );
        }
      }

      // Untuk STAFF: cek NIP sudah terdaftar
      if (role === "STAFF") {
        const existingStaff = await UserModel.findOne({
          nip: (validatedData as any).nip,
        });
        if (existingStaff) {
          return response.error(
            res,
            new Error("NIP already registered"),
            `Registration failed, problem: NIP already registered`,
          );
        }
      }

      // Hash password
      const hashedPassword = encrypt(validatedData.password);

      // Buat user baru
      const user = new UserModel({
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        password: hashedPassword,
        roles: [ROLES[role as keyof typeof ROLES]],
        status: STATUS.PENDING,
        isApprove: APPROVE.NOT_APPROVE,
        ...(role === "TEACHER" && {
          nuptk: (validatedData as any).nuptk,
          nip: (validatedData as any).nip,
          nik_ktp: (validatedData as any).nik_ktp,
          specialization: (validatedData as any).specialization,
          educationLevel: (validatedData as any).educationLevel,
          dapodikVerified: false,
        }),
        ...(role === "STAFF" && {
          nip: (validatedData as any).nip,
          nik_ktp: (validatedData as any).nik_ktp,
          position: (validatedData as any).position,
          department: (validatedData as any).department,
          adminVerified: false,
        }),
        ...(role === "STUDENT" && {
          nik_ktp: (validatedData as any).nik_ktp,
          parentName: (validatedData as any).parentName,
          parentPhone: (validatedData as any).parentPhone,
        }),
      });

      await user.save();

      // Kirim email notif registration pending (non-blocking)
      try {
        await sendRegistrationEmail({
          name: user.name,
          email: user.email,
          roles: user.roles,
          isApprove: APPROVE.NOT_APPROVE,
        });
      } catch (err) {
        console.error("Failed sending registration email:", err);
      }

      return response.success(
        res,
        {
          id: user._id,
          email: user.email,
          roles: user.roles,
        },
        "Registration successful. Please wait for admin approval.",
      );
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
         console.log(error.message)
        return response.error(
          res,
          new Error(error.message),
          error.message,
        );
      }
      return response.error(res, error, "Registration failed");
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
    const { roles, ApproveUser, pendingPayment, period } = req.body;

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return response.error(
          res,
          new Error("User not found"),
          "Approval failed",
        );
      }

      if (user.isApprove === APPROVE.NOT_APPROVE) {
        return response.error(
          res,
          new Error("User is already approved"),
          "User already approved",
        );
      }

      user.isApprove = ApproveUser;
      user.approvedByUser = (req.user?.id as any) || null;
      user.approvedAt = new Date();

      // Validasi dan set roles
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
      }

      await user.save();

      const isApprove = determineRegistrationApprove(user);
      const activationLink = `${CLIENT_HOST}/api/auth/activation?code=${user.activationToken}`;

      await sendRegistrationEmail({
        name: user.name,
        email: user.email,
        roles: user.roles,
        isApprove: isApprove,
        activationLink: isApprove === APPROVE.APPROVED ? activationLink : undefined,
        pendingPayment:
          isApprove === APPROVE.PENDING_PAYMENT ? pendingPayment : undefined,
        period: isApprove === APPROVE.PENDING_PAYMENT ? period : undefined,
      });

      return response.success(
        res,
        user,
        `User approved. ${isApprove === APPROVE.APPROVED ? "Activation" : "Notification"} email sent!`,
      );
    } catch (error) {
      return response.error(res, error, "Approval failed");
    }


    function determineRegistrationApprove(
      user: any,
    ): APPROVE {
      if (user.roles.includes(ROLES.STUDENT)) {
        if (user.pendingPayment && user.pendingPayment > 0) {
          return APPROVE.PENDING_PAYMENT;
        }
      }

      if (user.roles.includes(ROLES.TEACHER)) {
        if (!user.nuptk || !user.dapodikVerified) {
          return APPROVE.DAPODIK_ISSUE;
        }
      }

      if (user.roles.includes(ROLES.STAFF)) {
        if (!user.nip || !user.adminVerified) {
          return APPROVE.DATA_ISSUE;
        }
      }

      // Default approved
      return APPROVE.APPROVED;
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
