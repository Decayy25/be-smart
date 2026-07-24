import type { Request, Response } from "express";
import getRegisterSchema from "../validators/auth.validator";
import UserModel from "../models/Auth/user.models";
import response from "../utils/response";
import { APPROVE, ROLES, STATUS } from "../utils/constant";
import { encrypt } from "../utils/encrypt";
import * as Yup from "yup";
import TeacherProfileModel from "../models/User/teacher.models";
import StudentProfileModel from "../models/User/student.models";
import StaffProfileModel from "../models/User/staff.models";

export const Register = async (req: Request, res: Response) => {
  const { role, ...data } = req.body;

  try {
    const schema = getRegisterSchema(role);
    const validateData = await schema.validate({ role, ...data });
    const existingUser = await UserModel.findOne({
      username: validateData.username,
      email: validateData.email,
      nik_ktp: validateData.nik_ktp,
    });

    if (existingUser) {
      return response.error(
        res,
        new Error("Email sudah terdaftar"),
        "Registration failed, problem: Email Sudah terdaftar",
      );
    }

    if (role === ROLES.STUDENT) {
      const existingStudent = await UserModel.findOne({
        nisn: (validateData as any).nisn,
      });
      if (existingStudent) {
        return response.error(
          res,
          new Error("NISN sudah terdaftar"),
          `Registration failed, problem: NISN sudah terdaftar`,
        );
      }

      const hashedPassword = encrypt(validateData.password);

      const student = new UserModel({
        username: validateData.username,
        email: validateData.email,
        phoneNumber: validateData.phoneNumber,
        password: hashedPassword,
        nik_ktp: validateData.nik_ktp,
        roles: [ROLES[role as keyof typeof ROLES]],
        status: STATUS.PENDING,
        isApprove: APPROVE.NOT_APPROVE,
      });

      await student.save();

      const studentProfile = new StudentProfileModel({
        userId: student._id,
        nisn: (validateData as any).nisn || null,
        fatherName: (validateData as any).fatherName || null,
        motherName: (validateData as any).motherName || null,
        parentPhone: (validateData as any).parentPhone || null,
      });

      await studentProfile.save();

      return response.success(
        res,
        { user: student, profile: studentProfile },
        "Registration successful. Please wait for admin approval.",
      );
    }

    if (role === ROLES.TEACHER) {
      const existingTeacher = await UserModel.findOne({
        nuptk: (validateData as any).nuptk,
      });
      if (existingTeacher) {
        return response.error(
          res,
          new Error("NUPTK sudah terdaftar"),
          `Registration failed, problem: NUPTK sudah terdaftar`,
        );
      }

      const hashedPassword = encrypt(validateData.password);

      const teacher = new UserModel({
        username: validateData.username,
        email: validateData.email,
        phoneNumber: validateData.phoneNumber,
        password: hashedPassword,
        nik_ktp: validateData.nik_ktp,
        roles: [ROLES[role as keyof typeof ROLES]],
        status: STATUS.PENDING,
        isApprove: APPROVE.NOT_APPROVE,
      });

      await teacher.save();

      const teacherProfile = new TeacherProfileModel({
        userId: teacher._id,
        nip: (validateData as any).nip || null,
        nuptk: (validateData as any).nuptk || null,
        specialization: (validateData as any).specialization,
        educationLevel: (validateData as any).educationLevel || null,
      });

      await teacherProfile.save();

      return response.success(
        res,
        { user: teacher, profile: teacherProfile },
        "Registration successful. Please wait for admin approval.",
      );
    }

    if (role === ROLES.STAFF) {
      const existingStaff = await UserModel.findOne({
        nik_ktp: (validateData as any).nik_ktp,
      });
      if (existingStaff) {
        return response.error(
          res,
          new Error("NIK KTP sudah terdaftar"),
          `Registration failed, problem: NIK KTP sudah terdaftar`,
        );
      }

      const hashedPassword = encrypt(validateData.password);

      const staff = new UserModel({
        username: validateData.username,
        email: validateData.email,
        phoneNumber: validateData.phoneNumber,
        password: hashedPassword,
        nik_ktp: validateData.nik_ktp,
        roles: [ROLES[role as keyof typeof ROLES]],
        status: STATUS.PENDING,
        isApprove: APPROVE.NOT_APPROVE,
      });

      await staff.save();

      const staffProfile = new StaffProfileModel({
        userId: staff._id,
        employeeId: (validateData as any).employeeId || null,
        department: (validateData as any).department || null,
        officeRoom: (validateData as any).officeRoom || null,
        workShift: (validateData as any).workShift || null,
      });

      await staffProfile.save();

      return response.success(
        res,
        { user: staff, profile: staffProfile },
        "Registration successful. Please wait for admin approval.",
      );
    }
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.log(error.message);
      return response.error(res, new Error(error.message), error.message);
    }
    return response.error(res, error, "Registration failed");
  }
};
