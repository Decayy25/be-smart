import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJsdoc.OAS3Definition = {
  openapi: "3.0.0",
  info: {
    title: "BE-Smart API Documentation",
    version: "1.0.0",
    description:
      "API Documentation untuk E-Learning SMarT — Sistem Manajemen Sekolah. " +
      "Dokumentasi ini mencakup semua endpoint yang tersedia beserta schema request/response.",
    contact: {
      name: "BE-Smart Team",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan token JWT yang didapat dari proses login",
      },
    },
    schemas: {
      // ========== Response Schemas ==========
      MetaResponse: {
        type: "object",
        properties: {
          status: {
            type: "integer",
            example: 200,
          },
          message: {
            type: "string",
            example: "Success",
          },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          meta: {
            $ref: "#/components/schemas/MetaResponse",
          },
          data: {
            type: "object",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          meta: {
            type: "object",
            properties: {
              status: {
                type: "integer",
                example: 500,
              },
              message: {
                type: "string",
                example: "Error message",
              },
            },
          },
          data: {
            type: "object",
            nullable: true,
          },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          meta: {
            type: "object",
            properties: {
              status: {
                type: "integer",
                example: 400,
              },
              message: {
                type: "string",
                example: "Validation error message",
              },
            },
          },
          data: {
            type: "object",
            description: "Object dengan field name sebagai key dan pesan error sebagai value",
            example: {
              email: "Email tidak valid",
            },
          },
        },
      },
      UnauthorizedResponse: {
        type: "object",
        properties: {
          meta: {
            type: "object",
            properties: {
              status: {
                type: "integer",
                example: 403,
              },
              message: {
                type: "string",
                example: "Authorization token is missing or invalid",
              },
            },
          },
          data: {
            type: "object",
            nullable: true,
            example: null,
          },
        },
      },

      // ========== User Schema ==========
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "MongoDB ObjectId",
            example: "64f1a2b3c4d5e6f7a8b9c0d1",
          },
          username: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          phoneNumber: {
            type: "number",
            example: 81234567890,
          },
          nik_ktp: {
            type: "string",
            nullable: true,
            pattern: "^\\d{16}$",
            example: "3201234567890001",
          },
          roles: {
            type: "array",
            items: {
              type: "string",
              enum: ["STUDENT", "TEACHER", "STAFF"],
            },
            example: ["STUDENT"],
          },
          status: {
            type: "string",
            enum: ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"],
            example: "PENDING",
          },
          isApprove: {
            type: "string",
            enum: [
              "APPROVED",
              "PENDING",
              "NOT_APPROVE",
              "PENDING_PAYMENT",
              "DAPODIK_ISSUE",
              "DATA_ISSUE",
            ],
            example: "NOT_APPROVE",
          },
          approvedByUser: {
            type: "string",
            nullable: true,
            example: null,
          },
          approvedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: null,
          },
          rejectionReason: {
            type: "string",
            nullable: true,
            example: null,
          },
          lastLoginAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: null,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      // ========== Student Profile Schema ==========
      StudentProfile: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "64f1a2b3c4d5e6f7a8b9c0d2",
          },
          userId: {
            type: "string",
            example: "64f1a2b3c4d5e6f7a8b9c0d1",
          },
          nisn: {
            type: "string",
            nullable: true,
            pattern: "^\\d{10}$",
            example: "0012345678",
          },
          studentId: {
            type: "string",
            nullable: true,
            example: null,
          },
          grade: {
            type: "string",
            nullable: true,
            enum: ["1","2","3","4","5","6","7","8","9","10","11","12", null],
            example: null,
          },
          classRoom: {
            type: "string",
            nullable: true,
            example: null,
          },
          academicYear: {
            type: "string",
            nullable: true,
            example: null,
          },
          fatherName: {
            type: "string",
            nullable: true,
            example: "Budi Santoso",
          },
          motherName: {
            type: "string",
            nullable: true,
            example: "Siti Rahayu",
          },
          parentPhone: {
            type: "string",
            nullable: true,
            example: "081234567890",
          },
          address: {
            type: "string",
            nullable: true,
            example: null,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      // ========== Teacher Profile Schema ==========
      TeacherProfile: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "64f1a2b3c4d5e6f7a8b9c0d3",
          },
          userId: {
            type: "string",
            example: "64f1a2b3c4d5e6f7a8b9c0d1",
          },
          nip: {
            type: "string",
            nullable: true,
            pattern: "^\\d{18}$",
            example: "198501012010011001",
          },
          nuptk: {
            type: "string",
            nullable: true,
            pattern: "^\\d{16}$",
            example: "1234567890123456",
          },
          specialization: {
            type: "string",
            example: "Matematika",
          },
          educationLevel: {
            type: "string",
            nullable: true,
            enum: ["D3", "D4", "S1", "S2", "S3"],
            example: "S1",
          },
          dapodikVerified: {
            type: "boolean",
            example: false,
          },
          positions: {
            type: "array",
            nullable: true,
            items: {
              type: "string",
              enum: [
                "Kepala Sekolah",
                "Wakil Kepala Sekolah",
                "Koordinator",
                "Wali Kelas",
                "Guru BK",
                "Kepala Program Keahlian",
                "Koordinator PKL",
                "Pembina OSIS",
                "Kepala Laboratorium",
                "Pembina Ekstrakurikuler",
              ],
            },
          },
          employmentStatus: {
            type: "string",
            enum: ["Tetap", "Kontrak", "Honorer", "Magang"],
            example: null,
          },
          documents: {
            type: "object",
            properties: {
              cv: {
                type: "string",
                nullable: true,
              },
              certificates: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
          },
          verificationDate: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: null,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      // ========== Staff Profile Schema ==========
      StaffProfile: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "64f1a2b3c4d5e6f7a8b9c0d4",
          },
          userId: {
            type: "string",
            example: "64f1a2b3c4d5e6f7a8b9c0d1",
          },
          employeeId: {
            type: "string",
            nullable: true,
            example: "EMP-001",
          },
          department: {
            type: "string",
            enum: [
              "Administrasi",
              "Koperasi",
              "Keuangan",
              "Perpustakaan",
              "Laboratorium",
              "Teknologi Informasi",
              "Keamanan",
              "Kebersihan",
            ],
            example: "Teknologi Informasi",
          },
          officeRoom: {
            type: "string",
            nullable: true,
            example: null,
          },
          workShift: {
            type: "string",
            nullable: true,
            example: null,
          },
          employmentStatus: {
            type: "string",
            enum: ["Tetap", "Kontrak", "Honorer", "Magang"],
            example: null,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      // ========== Register Request Bodies ==========
      RegisterStudentRequest: {
        type: "object",
        required: [
          "username",
          "email",
          "phoneNumber",
          "password",
          "confirmPassword",
          "nik_ktp",
          "role",
          "nisn",
          "fatherName",
          "motherName",
          "parentPhone",
        ],
        properties: {
          role: {
            type: "string",
            enum: ["STUDENT"],
            example: "STUDENT",
          },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "Ahmad Siswa",
          },
          email: {
            type: "string",
            format: "email",
            example: "ahmad@student.example.com",
          },
          phoneNumber: {
            type: "string",
            pattern: "^08[0-9]{8,11}$",
            example: "081234567890",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "password123",
          },
          confirmPassword: {
            type: "string",
            example: "password123",
          },
          nik_ktp: {
            type: "string",
            pattern: "^\\d{16}$",
            example: "3201234567890001",
          },
          nisn: {
            type: "string",
            pattern: "^\\d{10}$",
            example: "0012345678",
          },
          fatherName: {
            type: "string",
            minLength: 3,
            example: "Budi Santoso",
          },
          motherName: {
            type: "string",
            minLength: 3,
            example: "Siti Rahayu",
          },
          parentPhone: {
            type: "string",
            pattern: "^08[0-9]{8,11}$",
            example: "081298765432",
          },
        },
      },

      RegisterTeacherRequest: {
        type: "object",
        required: [
          "username",
          "email",
          "phoneNumber",
          "password",
          "confirmPassword",
          "nik_ktp",
          "role",
          "specialization",
        ],
        properties: {
          role: {
            type: "string",
            enum: ["TEACHER"],
            example: "TEACHER",
          },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "Pak Guru",
          },
          email: {
            type: "string",
            format: "email",
            example: "guru@teacher.example.com",
          },
          phoneNumber: {
            type: "string",
            pattern: "^08[0-9]{8,11}$",
            example: "081234567890",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "password123",
          },
          confirmPassword: {
            type: "string",
            example: "password123",
          },
          nik_ktp: {
            type: "string",
            pattern: "^\\d{16}$",
            example: "3201234567890002",
          },
          nuptk: {
            type: "string",
            pattern: "^\\d{16}$",
            example: "1234567890123456",
            description: "Opsional — NUPTK 16 digit",
          },
          nip: {
            type: "string",
            pattern: "^\\d{18}$",
            example: "198501012010011001",
            description: "Opsional — NIP 18 digit",
          },
          specialization: {
            type: "string",
            minLength: 3,
            example: "Matematika",
          },
          educationLevel: {
            type: "string",
            enum: ["D3", "D4", "S1", "S2", "S3"],
            example: "S1",
            description: "Opsional — Jenjang pendidikan terakhir",
          },
        },
      },

      RegisterStaffRequest: {
        type: "object",
        required: [
          "username",
          "email",
          "phoneNumber",
          "password",
          "confirmPassword",
          "nik_ktp",
          "role",
          "department",
        ],
        properties: {
          role: {
            type: "string",
            enum: ["STAFF"],
            example: "STAFF",
          },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "Admin Staff",
          },
          email: {
            type: "string",
            format: "email",
            example: "staff@school.example.com",
          },
          phoneNumber: {
            type: "string",
            pattern: "^08[0-9]{8,11}$",
            example: "081234567890",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "password123",
          },
          confirmPassword: {
            type: "string",
            example: "password123",
          },
          nik_ktp: {
            type: "string",
            pattern: "^\\d{16}$",
            example: "3201234567890003",
          },
          employeeId: {
            type: "string",
            example: "EMP-001",
            description: "Opsional — ID karyawan",
          },
          department: {
            type: "string",
            enum: [
              "ADMINISTRATION",
              "CLEANING_SERVICE",
              "COOPERATIVE",
              "FINANCE",
              "IT",
              "LABORATORY",
              "LIBRARY",
              "SECURITY",
            ],
            example: "IT",
          },
          employmentStatus: {
            type: "string",
            enum: ["CONTRACT", "HONORARY", "INTERN", "PERMANENT"],
            example: "PERMANENT",
            description: "Opsional — Status kepegawaian",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Auth",
      description: "Endpoint untuk autentikasi (Register, Login, dll)",
    },
  ],
};

const options: swaggerJsdoc.OAS3Options = {
  swaggerDefinition,
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
