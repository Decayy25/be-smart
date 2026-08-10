import express from "express";
import {
  ActivationCode,
  ApproveUser,
  Login,
  Me,
  Register,
} from "../controllers/auth.controller";
import {
  authenticate,
  authorize,
  authorizePosition,
} from "../middlewares/auth.middleware";
import { POSITION, ROLES } from "../utils/constant";

const router = express.Router();

router.post("/auth/register", Register);
router.post("/auth/login", Login);
router.get("/auth/me", authenticate, Me);
router.post("/auth/activation", ActivationCode);
router.patch(
  "/auth/:id/approve",
  authenticate,
  authorize([ROLES.TEACHER]),
  authorizePosition([POSITION.PRINCIPAL, POSITION.VICE_PRINCIPAL]),
  ApproveUser,
);

/**
 *
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register akun baru
 *     description: |
 *       Mendaftarkan user baru berdasarkan role (STUDENT, TEACHER, atau STAFF).
 *       Setiap role memiliki field tambahan yang berbeda.
 *       Setelah registrasi, user harus menunggu approval dari admin.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/RegisterStudentRequest'
 *               - $ref: '#/components/schemas/RegisterTeacherRequest'
 *               - $ref: '#/components/schemas/RegisterStaffRequest'
 *           examples:
 *             student:
 *               summary: Register sebagai Siswa
 *               value:
 *                 role: STUDENT
 *                 username: Ahmad Siswa
 *                 email: ahmad@student.example.com
 *                 phoneNumber: "081234567890"
 *                 password: password123
 *                 confirmPassword: password123
 *                 nik_ktp: "3201234567890001"
 *                 nisn: "0012345678"
 *                 fatherName: Budi Santoso
 *                 motherName: Siti Rahayu
 *                 parentPhone: "081298765432"
 *             teacher:
 *               summary: Register sebagai Guru
 *               value:
 *                 role: TEACHER
 *                 username: Pak Guru
 *                 email: guru@teacher.example.com
 *                 phoneNumber: "081234567890"
 *                 password: password123
 *                 confirmPassword: password123
 *                 nik_ktp: "3201234567890002"
 *                 nuptk: "1234567890123456"
 *                 nip: "198501012010011001"
 *                 specialization: Matematika
 *                 educationLevel: S1
 *                 documents:
 *                   cv: https://example.com/cv.pdf
 *                   certificates:
 *                     - https://example.com/certificate1.pdf
 *                     - https://example.com/certificate2.pdf
 *             staff:
 *               summary: Register sebagai Staff
 *               value:
 *                 role: STAFF
 *                 username: Admin Staff
 *                 email: staff@school.example.com
 *                 phoneNumber: "081234567890"
 *                 password: password123
 *                 confirmPassword: password123
 *                 nik_ktp: "3201234567890003"
 *                 department: IT
 *     responses:
 *       200:
 *         description: Registrasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   $ref: '#/components/schemas/MetaResponse'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     profile:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/StudentProfile'
 *                         - $ref: '#/components/schemas/TeacherProfile'
 *             example:
 *               meta:
 *                 status: 200
 *                 message: "Registration successful. Please wait for admin approval."
 *               data:
 *                 user:
 *                   _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                   username: "Ahmad Siswa"
 *                   email: "ahmad@student.example.com"
 *                   roles: ["STUDENT"]
 *                   status: "PENDING"
 *                   isApprove: "NOT_APPROVE"
 *                 profile:
 *                   _id: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                   userId: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                   fatherName: "Budi Santoso"
 *                   motherName: "Siti Rahayu"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               meta:
 *                 status: 400
 *                 message: "Email tidak valid"
 *               data:
 *                 email: "Email tidak valid"
 *       500:
 *         description: Server error / Email sudah terdaftar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               meta:
 *                 status: 500
 *                 message: "Registration failed, problem: Email Sudah terdaftar"
 *               data: null
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login akun
 *     description: Login menggunakan email, username, atau NIK dan password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             identifier: "ahmad@student.example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               meta:
 *                 status: 200
 *                 message: "Login success!"
 *               data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Login gagal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil informasi pengguna saat ini
 *     description: Mengambil data user dan profil berdasarkan token JWT yang valid.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               meta:
 *                 status: 200
 *                 message: "User data retrieved successfully"
 *               data:
 *                 -
 *                   _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                   username: "Ahmad Siswa"
 *                   email: "ahmad@student.example.com"
 *                   roles: ["STUDENT"]
 *                   status: "ACTIVE"
 *                   isApprove: "APPROVED"
 *                 -
 *                   userId: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                   studentId: "0012345678"
 *                   fatherName: "Budi Santoso"
 *                   motherName: "Siti Rahayu"
 *       401:
 *         description: Unauthorized / token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       500:
 *         description: Gagal mengambil data user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/activation:
 *   post:
 *     summary: Aktivasi akun pengguna
 *     description: Mengaktifkan akun setelah admin menyetujui user dengan activation code.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivationRequest'
 *           example:
 *             code: "activation-code-123"
 *     responses:
 *       200:
 *         description: Aktivasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               meta:
 *                 status: 200
 *                 message: "Activation successful"
 *               data:
 *                 -
 *                   _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                   username: "Ahmad Siswa"
 *                   email: "ahmad@student.example.com"
 *                   status: "ACTIVE"
 *                 -
 *                   _id: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                   userId: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                   status: "ACTIVE"
 *       400:
 *         description: User tidak disetujui atau kode tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Aktivasi gagal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/{id}/approve:
 *   patch:
 *     summary: Setujui atau ubah status approval akun pengguna
 *     description: Endpoint ini hanya dapat diakses oleh guru yang memiliki posisi Kepala Sekolah atau Wakil Kepala Sekolah. Identitas admin diambil dari token JWT yang sedang login.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna target yang akan diubah status approval-nya
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApprove
 *             properties:
 *               isApprove:
 *                 type: string
 *                 enum: [APPROVED, PENDING, PENDING_PAYMENT, DAPODIK_ISSUE, DATA_ISSUE]
 *                 example: APPROVED
 *               targetUserId:
 *                 type: string
 *                 description: ID pengguna target yang akan diubah status approval-nya. Jika tidak dikirim, parameter path id akan dipakai.
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *               approvedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-07T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Status approval berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               meta:
 *                 status: 200
 *                 message: "User approval status updated successfully"
 *               data:
 *                 _id: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 username: "Ahmad Siswa"
 *                 email: "ahmad@student.example.com"
 *                 isApprove: "APPROVED"
 *                 approvedByUser: "admin"
 *                 approvedAt: "2026-08-07T10:00:00.000Z"
 *       401:
 *         description: Tidak memiliki akses / token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       500:
 *         description: Gagal memperbarui approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export default router;
