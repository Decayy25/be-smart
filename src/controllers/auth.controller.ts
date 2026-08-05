import type { Request, Response } from "express";
import * as Yup from "yup";
import getRegisterSchema from "../validators/auth.validator";
import UserModel from "../models/Auth/user.models";
import TeacherProfileModel from "../models/User/teacher.models";
import StudentProfileModel from "../models/User/student.models";
import StaffProfileModel, { IStaffProfile } from "../models/User/staff.models";
import response from "../utils/response";
import { APPROVE, ROLES, STAFF_DEPARTMENT, STATUS } from "../utils/constant";
import { comparePassword } from "../utils/encrypt";
import { generateToken } from "../utils/jwt";
import {
  StaffRegisterData,
  StudentRegisterData,
  TeacherRegisterData,
} from "../@types/Auth";
import mongoose from "mongoose";
import { IReqUser } from "../utils/interfaces";

export const Register = async (req: Request, res: Response) => {
  const { role, ...data } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const schema = getRegisterSchema(role);
    const validateData = await schema.validate({ role, ...data });

    const existingUser = await UserModel.findOne({
      $or: [
        { username: validateData.username },
        { email: validateData.email },
        { nik_ktp: validateData.nik_ktp },
      ],
    }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      return response.error(
        res,
        new Error("Email/NIK/username sudah terdaftar"),
        "Registration failed, problem: Email/NIK/username sudah terdaftar",
      );
    }

    switch (role) {
      case ROLES.STUDENT: {
        const studentData = validateData as StudentRegisterData;

        const existingStudent = await StudentProfileModel.findOne({
          studentId: studentData.nisn,
        }).session(session);

        if (existingStudent) {
          await session.abortTransaction();
          return response.error(
            res,
            new Error("NISN sudah terdaftar"),
            "Registration failed, problem: NISN sudah terdaftar",
          );
        }

        const student = new UserModel({
          username: studentData.username,
          email: studentData.email,
          phoneNumber: studentData.phoneNumber,
          password: studentData.password,
          nik_ktp: studentData.nik_ktp,
          roles: [ROLES[role as keyof typeof ROLES]],
          status: STATUS.PENDING,
          isApprove: APPROVE.PENDING,
        });

        await student.save({ session });

        const studentProfile = new StudentProfileModel({
          userId: student._id,
          studentId: studentData.nisn,
          fatherName: studentData.fatherName || null,
          motherName: studentData.motherName || null,
          parentPhone: studentData.parentPhone,
        });

        await studentProfile.save({ session });

        await session.commitTransaction();

        return response.success(
          res,
          { user: student, profile: studentProfile },
          "Registration successful. Please wait for admin approval.",
        );
      }

      case ROLES.TEACHER: {
        const teacherData = validateData as TeacherRegisterData;

        const existingTeacher = await TeacherProfileModel.findOne({
          nuptk: teacherData.nuptk,
        }).session(session);

        if (existingTeacher) {
          await session.abortTransaction();
          return response.error(
            res,
            new Error("NUPTK sudah terdaftar"),
            "Registration failed, problem: NUPTK sudah terdaftar",
          );
        }

        const teacher = new UserModel({
          username: teacherData.username,
          email: teacherData.email,
          phoneNumber: teacherData.phoneNumber,
          password: teacherData.password,
          nik_ktp: teacherData.nik_ktp,
          roles: [ROLES[role as keyof typeof ROLES]],
          status: STATUS.PENDING,
          isApprove: APPROVE.PENDING,
        });

        await teacher.save({ session });

        const teacherProfile = new TeacherProfileModel({
          userId: teacher._id,
          nip: teacherData.nip || null,
          nuptk: teacherData.nuptk || null,
          specialization: teacherData.specialization,
          educationLevel: teacherData.educationLevel || null,
          documents: {
            cv: teacherData.documents?.cv,
            certificates: teacherData.documents?.certificates,
          },
        });

        await teacherProfile.save({ session });
        await session.commitTransaction();

        return response.success(
          res,
          { user: teacher, profile: teacherProfile },
          "Registration successful. Please wait for admin approval.",
        );
      }

      case ROLES.STAFF: {
        const staffData = validateData as StaffRegisterData;

        const departmentValue = staffData.department
          ? Object.values(STAFF_DEPARTMENT).includes(
              staffData.department as STAFF_DEPARTMENT,
            )
            ? staffData.department
            : (STAFF_DEPARTMENT[
                staffData.department as keyof typeof STAFF_DEPARTMENT
              ] ?? null)
          : null;

        const staff = new UserModel({
          username: staffData.username,
          email: staffData.email,
          phoneNumber: staffData.phoneNumber,
          password: staffData.password,
          nik_ktp: staffData.nik_ktp,
          roles: [ROLES[role as keyof typeof ROLES]],
          status: STATUS.PENDING,
          isApprove: APPROVE.PENDING,
        });

        await staff.save({ session });

        const staffProfile: IStaffProfile = new StaffProfileModel({
          userId: staff._id,
          employeeId: staffData.employeeId || null,
          department: departmentValue,
          officeRoom: staffData.officeRoom || null,
          workShift: staffData.workShift || null,
        });

        await staffProfile.save({ session });

        await session.commitTransaction();

        return response.success(
          res,
          { user: staff, profile: staffProfile },
          "Registration successful. Please wait for admin approval.",
        );
      }

      default:
        return response.error(
          res,
          new Error("Invalid role"),
          "Registration failed, problem: Invalid role",
        );
    }
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof Yup.ValidationError) {
      return response.error(res, new Error(error.message), error.message);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return response.error(
      res,
      error,
      `Registration failed, problem: ${message}`,
    );
  } finally {
    await session.endSession();
  }
};

export const Login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return response.error(
        res,
        new Error("Identifier or password required"),
        "Invalid credentials",
      );
    }

    const normalizedIdentifier = String(identifier).trim().toLowerCase();

    const user = await UserModel.findOne({
      $or: [
        {
          email: normalizedIdentifier,
        },
        {
          username: normalizedIdentifier,
        },
        {
          nik_ktp: normalizedIdentifier,
        },
      ],
      isApprove: APPROVE.APPROVED,
      status: STATUS.ACTIVE,
    });

    if (!user) {
      return response.error(
        res,
        new Error("User not found"),
        "User not found or not approved yet. Please check your credentials and approval status.",
      );
    }

    const inputPassword = String(password);
    const isPasswordValid = comparePassword(inputPassword, user.password);

    if (!isPasswordValid) {
      console.log(`Password: ${inputPassword}, Stored: ${user.password}`);
      return response.error(
        res,
        new Error("Incorrect password"),
        "Invalid identifier or password",
      );
    }

    const isActive = user.status === STATUS.ACTIVE;
    if (!isActive) {
      return response.error(
        res,
        new Error(
          "Account is not active yet. Please wait for approval and email activation.",
        ),
        "Login failed",
      );
    }

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
          name: user.username,
          email: user.email,
          roles: user.roles,
        },
      },
      "Login success!",
    );
  } catch (error) {
    return response.error(res, error, "Login failed");
  }
};

export const Me = async (req: IReqUser, res: Response) => {
  try {
    const user = req.user;
    let result;
    const currentRole = Array.isArray(user?.roles) ? user.roles[0] : user?.role;

    if (currentRole === "STUDENT") {
      result = [
        await UserModel.findById(user?.id),
        await StudentProfileModel.findOne({ userId: user?.id }),
      ];
    }

    if (currentRole === "TEACHER") {
      result = [
        await UserModel.findById(user?.id),
        await TeacherProfileModel.findOne({ userId: user?.id }),
      ];
    }

    if (currentRole === "STAFF") {
      result = [
        await UserModel.findById(user?.id),
        await StaffProfileModel.findOne({ userId: user?.id }),
      ];
    }

    return response.success(res, result, "User data retrieved successfully");
  } catch (error) {
    return response.error(res, error, "Failed to retrieve user data");
  }
};

export const ActivationCode = async (req: Request, res: Response) => {
  const { code } = req.body as { code: string };

  try {
    const approveDetected = await UserModel.findOne({
      activationCode: code,
      isApprove: APPROVE.APPROVED,
    });

    const user = await UserModel.findOneAndUpdate(
      {
        activationCode: code,
      },
      {
        status: STATUS.ACTIVE,
      },
      {
        new: true,
      },
    );

    const result = [approveDetected, user];

    return response.success(res, result, "Activation successful");
  } catch (error) {
    return response.error(res, error, "Activation failed");
  }
};

export const ApproveUser = async (req: Request, res: Response) => {
  const { userId, approve } = req.body as { userId: string; approve: boolean };
}