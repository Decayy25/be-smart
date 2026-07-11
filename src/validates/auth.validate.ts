import * as Yup from "yup";

export const registerSchema = Yup.object({
  name: Yup.string()
    .required("Nama harus diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(255, "Nama maksimal 255 karakter")
    .trim(),

  email: Yup.string()
    .required("Email harus diisi")
    .email("Format email tidak valid")
    .lowercase()
    .trim(),

  password: Yup.string()
    .required("Password harus diisi")
    .min(6, "Password minimal 6 karakter")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, huruf kecil, dan angka",
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), " "], "Password tidak sama")
    .required("Konfirmasi password wajib diisi"),

  nik_ktp: Yup.string()
    .trim()
    .matches(/^\d{16}$/, "NIK KTP harus 16 digit"),
});