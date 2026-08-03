import type { Request, Response } from "express";
import * as Yup from "yup";
import getRegisterSchema from "../validators/auth.validator";
import UserModel from "../models/Auth/user.models";
import TeacherProfileModel from "../models/User/teacher.models";
import StudentProfileModel from "../models/User/student.models";
import StaffProfileModel, { IStaffProfile } from "../models/User/staff.models";
import response from "../utils/response";
import { APPROVE, ROLES, STAFF_DEPARTMENT, STATUS } from "../utils/constant";
import { encrypt } from "../utils/encrypt";
import { generateToken } from "../utils/jwt";
import {
  StaffRegisterData,
  StudentRegisterData,
  TeacherRegisterData,
} from "../@types/Auth";

export const Register = async (req: Request, res: Response) => {
  const { role, ...data } = req.body;

  try {
    const schema = getRegisterSchema(role);
    const validateData = await schema.validate({ role, ...data });

    const existingUser = await UserModel.findOne({
      $or: [
        { username: validateData.username },
        { email: validateData.email },
        { nik_ktp: validateData.nik_ktp },
      ],
    });

    if (existingUser) {
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
        });

        if (existingStudent) {
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
          isApprove: APPROVE.NOT_APPROVE,
        });

        await student.save();

        const studentProfile = new StudentProfileModel({
          userId: student._id,
          studentId: studentData.nisn,
          fatherName: studentData.fatherName || null,
          motherName: studentData.motherName || null,
          parentPhone: studentData.parentPhone,
        });

        await studentProfile.save();

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
        });

        if (existingTeacher) {
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
          isApprove: APPROVE.NOT_APPROVE,
        });

        await teacher.save();

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

        await teacherProfile.save();

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
          isApprove: APPROVE.NOT_APPROVE,
        });

        await staff.save();

        const staffProfile: IStaffProfile = new StaffProfileModel({
          userId: staff._id,
          employeeId: staffData.employeeId || null,
          department: departmentValue,
          officeRoom: staffData.officeRoom || null,
          workShift: staffData.workShift || null,
        });

        await staffProfile.save();

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
    if (error instanceof Yup.ValidationError) {
      return response.error(res, new Error(error.message), error.message);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return response.error(res, error, `Registration failed, problem: ${message}`);
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

    const normalizedIdentifier = String(identifier).trim();

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
        "Invalid email or password",
      );
    }

    if (user.password !== encrypt(String(password))) {
      return response.error(
        res,
        new Error("Incorrect password"),
        "Invalid email or password",
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
