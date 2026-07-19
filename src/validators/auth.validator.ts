import * as Yup from "yup";

export const baseSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Nama minimal 3 karakter")
    .max(50, "Nama maksimal 50 karakter")
    .required("Nama harus diisi"),
  email: Yup.string().email("Email tidak valid").required("Email harus diisi"),
  phoneNumber: Yup.string()
    .matches(/^08[0-9]{8,11}$/, "Nomor HP tidak valid (08xxxxxxxxxx)")
    .required("Nomor HP harus diisi"),
  nik_ktp: Yup.string()
    .matches(/^\d{16}$/, "Nomor NIK harus 16 digit")
    .required("Nomor NIK harus diisi"),
  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .required("Password harus diisi"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password dan konfirmasi password harus sama")
    .required("Konfirmasi password harus diisi"),
});

export const studentRegisterSchema = baseSchema.shape({
  role: Yup.string()
    .oneOf(["STUDENT"], "Role harus STUDENT")
    .required("Role harus diisi"),
  nisn: Yup.string()
    .matches(/^\d{10}$/, "Nomor NISN harus 10 digit")
    .required("Nomor NISN harus diisi"),
  fatherName: Yup.string()
    .min(3, "Nama Bapak minimal 3 karakter")
    .required("Nama bapak kandung wajib diisi"),
  motherName: Yup.string()
    .min(3, "Nama Ibu minimal 3 karakter")
    .required("Nama Ibu kandung wajib diisi"),
  parentPhone: Yup.string()
    .matches(/^08[0-9]{8,11}$/, "Nomor HP orang tua tidak valid")
    .required("Nomor HP orang tua yang aktif wajib diisi"),
});

export const teacherRegisterSchema = baseSchema.shape({
  role: Yup.string()
    .oneOf(["TEACHER"], "Role harus TEACHER")
    .required("Role harus diisi"),
  nuptk: Yup.string()
    .matches(/^\d{16}$/, "NUPTK harus 16 digit")
    .optional(),
  nip: Yup.string()
    .matches(/^\d{18}$/, "NIP harus 18 digit")
    .optional(),
  specialization: Yup.string()
    .min(3, "Spesialisasi minimal 3 karakter")
    .required("Spesialisasi wajib diisi"),
  educationLevel: Yup.string()
    .oneOf(["D3", "D4", "S1", "S2", "S3"], "Jenjang pendidikan tidak valid")
    .optional(),
});

export const staffRegisterSchema = baseSchema.shape({
  role: Yup.string()
    .oneOf(["STAFF"], "Role harus STAFF")
    .required("Role harus diisi"),
  employeeId: Yup.string().optional(),
  department: Yup.string()
    .oneOf(
      [
        "ADMINISTRATION",
        "CLEANING_SERVICE",
        "COOPERATIVE",
        "FINANCE",
        "IT",
        "LABORATORY",
        "LIBRARY",
        "SECURITY",
      ],
      "Departemen tidak valid"
    )
    .required("Departemen harus diisi"),
  employmentStatus: Yup.string()
    .oneOf(
      ["CONTRACT", "HONORARY", "INTERN", "PERMANENT"],
      "Status kepegawaian tidak valid"
    )
    .optional(),
});

const getRegisterSchema = (role: string) => {
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

export default getRegisterSchema;
