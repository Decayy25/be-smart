import { STAFF_DEPARTMENT } from "../utils/constant";

// Di file yang sesuai (misal validators/auth.types.ts)
interface StudentRegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  nik_ktp: string;
  nisn: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
}

interface TeacherRegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  nik_ktp: string;
  nip?: string;
  nuptk: string;
  specialization: string;
  educationLevel?: string;
  documents?: {
    cv: string;
    certificates: string;
  };
}

interface StaffRegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  nik_ktp: string;
  employeeId?: string;
  department?: STAFF_DEPARTMENT | string;
  officeRoom?: string;
  workShift?: string;
}

export type {StudentRegisterData, TeacherRegisterData, StaffRegisterData};