import express from "express";
import { Register } from "../controllers/auth.controller";

const router = express.Router();

/**
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
router.post("/auth/register", Register);

export default router;