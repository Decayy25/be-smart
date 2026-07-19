import mongoose, { Document } from "mongoose";
import { EMPLOYMENT_STATUS, STAFF_DEPARTMENT } from "../../utils/constant";

const Schema = mongoose.Schema;

export interface IStaffProfile extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string | null;
  department: STAFF_DEPARTMENT;
  officeRoom: string | null;
  workShift: string | null;
  employmentStatus: EMPLOYMENT_STATUS;
  createdAt: Date;
  updatedAt: Date;
}

const StaffProfileSchema = new Schema<IStaffProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      // Id Karyawan
      type: Schema.Types.String,
      default: null,
      sparse: true,
      trim: true,
    },
    department: {
      type: Schema.Types.String,
      enum: [
        STAFF_DEPARTMENT.ADMINISTRATION,
        STAFF_DEPARTMENT.CLEANING_SERVICE,
        STAFF_DEPARTMENT.COOPERATIVE,
        STAFF_DEPARTMENT.FINANCE,
        STAFF_DEPARTMENT.IT,
        STAFF_DEPARTMENT.LABORATORY,
        STAFF_DEPARTMENT.LIBRARY,
        STAFF_DEPARTMENT.SECURITY,
      ],
      default: null,
    },
    officeRoom: {
      type: Schema.Types.String,
      default: null,
      sparse: true,
      trim: true,
    },
    workShift: {
      type: Schema.Types.String,
      default: null,
      sparse: true,
      trim: true,
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
  },
  {
    timestamps: true,
    collection: "StaffProfiles",
  },
);

StaffProfileSchema.index({ employeeId: 1 }, { sparse: true });
StaffProfileSchema.index({ department: 1 });
StaffProfileSchema.index({ employmentStatus: 1 });
StaffProfileSchema.index({ workShift: 1 }, { sparse: true });
StaffProfileSchema.index({ officeRoom: 1 }, { sparse: true });
StaffProfileSchema.index({ createdAt: 1 });
StaffProfileSchema.index({ updatedAt: 1 });
StaffProfileSchema.index({ department: 1, employmentStatus: 1 });
StaffProfileSchema.index({ department: 1, workShift: 1 }, { sparse: true });
StaffProfileSchema.index({ employmentStatus: 1, department: 1 });
StaffProfileSchema.index({ employeeId: 1, department: 1 }, { sparse: true });
StaffProfileSchema.index({ officeRoom: 1, workShift: 1 }, { sparse: true });
StaffProfileSchema.index({ department: 1, employmentStatus: 1, createdAt: 1 });
StaffProfileSchema.index({ employmentStatus: 1, department: 1, updatedAt: 1 });
StaffProfileSchema.index(
  { workShift: 1, employmentStatus: 1 },
  { sparse: true },
);
StaffProfileSchema.index(
  { department: 1, employmentStatus: 1, workShift: 1 },
  { sparse: true },
);
StaffProfileSchema.index(
  { department: 1, officeRoom: 1, employmentStatus: 1 },
  { sparse: true },
);
StaffProfileSchema.index(
  { employeeId: 1, employmentStatus: 1 },
  { sparse: true },
);
StaffProfileSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 31536000 }, // 1 Tahun
);

const StaffProfileModel = mongoose.model<IStaffProfile>(
  "StaffProfile",
  StaffProfileSchema,
);

export default StaffProfileModel;
