import mongoose, { Document } from "mongoose";
import {
  EDUCATION_LEVEL,
  EMPLOYMENT_STATUS,
  POSITION,
} from "../../utils/constant";

const Schema = mongoose.Schema;

export interface ITeacherProfile extends Document {
  userId: mongoose.Types.ObjectId;
  nip: string | null; // Nomor Identitas Pegawai
  nuptk: string | null; // Nomor Unik Pendidik Tenaga Kependidikan
  specialization: string | null; // Mata pelajaran / Keahlian
  educationLevel: EDUCATION_LEVEL | null; // Pendidikan terakhir (D3 - S3)
  dapodikVerified: boolean; // Verifikasi dari Dapodik
  positions: POSITION[] | null;
  employmentStatus: EMPLOYMENT_STATUS; // Honorer atau yang lain
  documents: {
    cv: string | null; // Pengganti pengalaman
    certificates: string[]; // Sertifikasi profesional
  };
  verificationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherProfileSchema = new Schema<ITeacherProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    nip: {
      type: Schema.Types.String,
      default: null,
      sparse: true,
      match: [/^\d{18}$/, "NIP harus 18 digit"],
      trim: true,
    },
    nuptk: {
      type: Schema.Types.String,
      default: null,
      sparse: true,
      match: [/^\d{16}$/, "NUPTK harus 16 digit"],
      trim: true,
    },
    specialization: {
      type: Schema.Types.String,
      required: true,
    },
    educationLevel: {
      type: Schema.Types.String,
      default: null,
      enum: [
        EDUCATION_LEVEL.D3,
        EDUCATION_LEVEL.D4,
        EDUCATION_LEVEL.S1,
        EDUCATION_LEVEL.S2,
        EDUCATION_LEVEL.S3,
      ],
    },
    dapodikVerified: {
      type: Schema.Types.Boolean,
      default: false,
      index: true,
    },
    positions: {
      type: [String],
      enum: [
        POSITION.PRINCIPAL,
        POSITION.COORDINATOR,
        POSITION.VICE_PRINCIPAL,
        POSITION.EXTRACURRICULAR_ADVISOR,
        POSITION.GUIDANCE_COUNSELOR,
        POSITION.HEAD_OF_PROGRAM,
        POSITION.HOMEROOM_TEACHER,
        POSITION.LAB_COORDINATOR,
        POSITION.OSIS_ADVISOR,
        POSITION.PKL_COORDINATOR,
      ],
    },
    documents: {
      cv: {
        type: Schema.Types.String,
        required: true,
      },
      certificates: {
        type: [String],
        required: true,
      },
    },
    employmentStatus: {
      type: Schema.Types.String,
      enum: [
        EMPLOYMENT_STATUS.CONTRACT,
        EMPLOYMENT_STATUS.HONORARY,
        EMPLOYMENT_STATUS.INTERN,
        EMPLOYMENT_STATUS.PERMANENT,
      ],
      default: null,
    },
    verificationDate: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "TeacherProfiles",
  },
);

TeacherProfileSchema.index({ nip: 1 }, { sparse: true });
TeacherProfileSchema.index({ nuptk: 1 }, { sparse: true });
TeacherProfileSchema.index({ specialization: 1 });
TeacherProfileSchema.index({ educationLevel: 1 });
TeacherProfileSchema.index({ employmentStatus: 1 });
TeacherProfileSchema.index({ positions: 1 });
TeacherProfileSchema.index({ createdAt: 1 });
TeacherProfileSchema.index({ updatedAt: 1 });
TeacherProfileSchema.index({ dapodikVerified: 1, specialization: 1 });
TeacherProfileSchema.index({ specialization: 1, educationLevel: 1 });
TeacherProfileSchema.index({ specialization: 1, employmentStatus: 1 });
TeacherProfileSchema.index({ educationLevel: 1, employmentStatus: 1 });
TeacherProfileSchema.index({ dapodikVerified: 1, employmentStatus: 1 });
TeacherProfileSchema.index({ nip: 1, specialization: 1 }, { sparse: true });
TeacherProfileSchema.index({ nuptk: 1, dapodikVerified: 1 }, { sparse: true });
TeacherProfileSchema.index({ nip: 1, nuptk: 1 }, { sparse: true });
TeacherProfileSchema.index({ positions: 1, specialization: 1 });
TeacherProfileSchema.index({ verificationDate: 1, dapodikVerified: 1 });
TeacherProfileSchema.index({
  specialization: 1,
  educationLevel: 1,
  employmentStatus: 1,
});
TeacherProfileSchema.index({
  dapodikVerified: 1,
  specialization: 1,
  educationLevel: 1,
});
TeacherProfileSchema.index({
  positions: 1,
  employmentStatus: 1,
  specialization: 1,
});
TeacherProfileSchema.index({
  specialization: 1,
  educationLevel: 1,
  createdAt: 1,
});
TeacherProfileSchema.index({
  dapodikVerified: 1,
  verificationDate: 1,
  specialization: 1,
});
TeacherProfileSchema.index({
  employmentStatus: 1,
  specialization: 1,
  updatedAt: 1,
});
TeacherProfileSchema.index({ specialization: "text" });
TeacherProfileSchema.index(
  { verificationDate: 1 },
  { expireAfterSeconds: 7776000 }, // 90 days
);

const TeacherProfileModel = mongoose.model<ITeacherProfile>(
  "TeacherProfile",
  TeacherProfileSchema,
);

export default TeacherProfileModel;
