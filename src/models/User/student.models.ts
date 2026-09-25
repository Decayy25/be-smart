import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

/**
 * StudentProfile Schema
 * Optional: hanya siswa yang punya
 * Relationship: 1 User -> 1 StudentProfile (1:1)
 */
export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string | null; // Nomor induk siswa
  grade: string | null; // Kelas (1-12)
  classRoom: string | null; // Ruangan kelas
  academicYear: string | null; // Tahun ajaran
  fatherName: string | null;
  motherName: string | null;
  parentPhone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.String,
      default: null,
      sparse: true,
      trim: true,
    },
    grade: {
      type: Schema.Types.String,
      default: null,
      enum: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        null,
      ],
    },
    classRoom: {
      type: Schema.Types.String,
      default: null,
      trim: true,
    },
    academicYear: {
      type: Schema.Types.String,
      default: null,
      // Format: "2023/2024"
    },
    fatherName: {
      type: Schema.Types.String,
      default: null,
      trim: true,
    },
    motherName: {
      type: Schema.Types.String,
      default: null,
      trim: true,
    },
    parentPhone: {
      type: Schema.Types.String,
      default: null,
      match: [/^(\+62|0)[0-9]{9,12}$/, "Nomor telepon tidak valid"],
      trim: true,
    },
    address: {
      type: Schema.Types.String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "StudentProfiles",
  },
);

StudentProfileSchema.index({ parentPhone: 1 }, { sparse: true });
StudentProfileSchema.index({ grade: 1 });
StudentProfileSchema.index({ classRoom: 1 });
StudentProfileSchema.index({ academicYear: 1 });
StudentProfileSchema.index({ createdAt: 1 });
StudentProfileSchema.index({ updatedAt: 1 });
StudentProfileSchema.index({ grade: 1, classRoom: 1 });
StudentProfileSchema.index({ grade: 1, classRoom: 1, academicYear: 1 });
StudentProfileSchema.index({ academicYear: 1, grade: 1 });
StudentProfileSchema.index({ academicYear: 1, classRoom: 1 });
StudentProfileSchema.index({ studentId: 1, academicYear: 1 }, { sparse: true });
StudentProfileSchema.index({ parentPhone: 1, grade: 1 }, { sparse: true });
StudentProfileSchema.index({ fatherName: 1, motherName: 1 }, { sparse: true });

const StudentProfileModel = mongoose.model<IStudentProfile>(
  "StudentProfile",
  StudentProfileSchema,
);

export default StudentProfileModel;
