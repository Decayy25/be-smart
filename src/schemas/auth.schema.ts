import * as Yup from "yup";

// Base schema untuk semua role
const baseSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Nama minimal 3 karakter")
    .max(50, "Nama maksimal 50 karakter")
    .required("Nama harus diisi"),
  email: Yup.string().email("Email tidak valid").required("Email harus diisi"),
  phoneNumber: Yup.string()
    .matches(/^08[0-9]{8,11}$/, "Nomor HP tidak valid (08xxxxxxxxxx)")
    .required("Nomor HP harus diisi"),
  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .required("Password harus diisi"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password dan konfirmasi password harus sama")
    .required("Konfirmasi password harus diisi"),
});

// Student Register Schema
export const studentRegisterSchema = baseSchema.shape({
  role: Yup.string()
    .oneOf(["STUDENT"], "Role harus STUDENT")
    .required("Role harus diisi"),
  nik_ktp: Yup.string()
    .matches(/^\d{16}$/, "NIK KTP harus 16 digit")
    .required("Nomor NIK harus diisi"),
    nisn: Yup.string()
    .matches(/^\d{16}$/, "Nomor NISN harus 10 digit")
    .required("Nomor NISN harus diisi"),
  parentName: Yup.string()
    .min(3, "Nama orang tua minimal 3 karakter")
    .optional(),
  parentPhone: Yup.string()
    .matches(/^08[0-9]{8,11}$/, "Nomor HP orang tua tidak valid")
    .optional(),
});

// Teacher Register Schema
export const teacherRegisterSchema = baseSchema.shape({
  role: Yup.string()
    .oneOf(["TEACHER"], "Role harus TEACHER")
    .required("Role harus diisi"),
  nuptk: Yup.string()
    .matches(/^\d{16}$/, "NUPTK harus 16 digit")
    .required("NUPTK harus diisi"),
  nip: Yup.string()
    .matches(/^\d{18}$/, "NIP harus 18 digit")
    .optional(),
  nik_ktp: Yup.string()
    .matches(/^\d{16}$/, "NIK KTP harus 16 digit")
    .required("NIK KTP harus diisi"),
  specialization: Yup.string()
    .min(3, "Spesialisasi minimal 3 karakter")
    .optional(),
  educationLevel: Yup.string()
    .oneOf(["D3", "S1", "S2", "S3"], "Jenjang pendidikan tidak valid")
    .optional(),
});

// Staff Register Schema
export const staffRegisterSchema = baseSchema.shape({
  role: Yup.string()
    .oneOf(["STAFF"], "Role harus STAFF")
    .required("Role harus diisi"),
  nip: Yup.string()
    .matches(/^\d{18}$/, "NIP harus 18 digit")
    .required("NIP harus diisi"),
  nik_ktp: Yup.string()
    .matches(/^\d{16}$/, "NIK KTP harus 16 digit")
    .required("NIK KTP harus diisi"),
  position: Yup.string()
    .min(3, "Jabatan minimal 3 karakter")
    .required("Jabatan harus diisi"),
  department: Yup.string().min(3, "Departemen minimal 3 karakter").optional(),
});

// Dynamic schema validator
export const getRegisterSchema = (role: string) => {
  switch (role) {
    case "STUDENT":
      return studentRegisterSchema;
    case "TEACHER":
      return teacherRegisterSchema;
    case "STAFF":
      return staffRegisterSchema;
    default:
      throw new Error("Invalid role");
  }
};
