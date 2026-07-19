import mongoose, { Document } from "mongoose";
import { ROLES, STATUS, APPROVE } from "../../utils/constant";
import { encrypt } from "../../utils/encrypt";

const Schema = mongoose.Schema;

export interface IUser extends Document {
  username: string;
  email: string;
  phoneNumber: number;
  password: string;
  nik_ktp: string | null;
  roles: string[];
  status: string;
  isApprove: string;
  approvedByUser: mongoose.Types.ObjectId | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  activationToken: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: Schema.Types.Number,
      required: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    // FIELD WAJIB untuk semua user
    nik_ktp: {
      type: Schema.Types.String,
      default: null,
      sparse: true,
      match: [/^\d{16}$/, "Nomor NIK harus 16 digit"],
    },
    roles: {
      type: [String],
      enum: [ROLES.STAFF, ROLES.TEACHER, ROLES.STUDENT],
      required: true,
      default: [],
    },
    status: {
      type: Schema.Types.String,
      enum: [STATUS.ACTIVE, STATUS.PENDING, STATUS.REJECTED, STATUS.SUSPENDED],
      default: STATUS.PENDING,
    },
    isApprove: {
      type: Schema.Types.String,
      enum: [
        APPROVE.APPROVED,
        APPROVE.PENDING_PAYMENT,
        APPROVE.DAPODIK_ISSUE,
        APPROVE.DATA_ISSUE,
        APPROVE.NOT_APPROVE,
      ],
      default: APPROVE.PENDING,
      index: true,
    },
    approvedByUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: Schema.Types.String,
      default: null,
    },
    activationToken: {
      type: Schema.Types.String,
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "Users",
  },
);

UserSchema.pre("save", async function (this: any) {
  const user = this;
  try {
    if (user.isModified("password")) {
      user.password = encrypt(user.password);
    }
    if (user.isNew) {
      user.activationToken = encrypt(user.id);
    }
    return user;
  } catch (error) {
    throw error;
  }
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.activationToken;
  return user;
};

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
