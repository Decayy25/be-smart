import mongoose, { Document } from "mongoose";
import { ROLES, STATUS, APPROVE } from "../../utils/constant";
import { encrypt } from "../../utils/encrypt";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../../utils/environment";
import { renderMailHTML, sendMail } from "../../utils/mail/mail";

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
  approvedByUser: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  activationCode: string | null;
  profilePicture: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const UserSchema = new Schema<IUser>(
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
        APPROVE.PENDING,
        APPROVE.APPROVED,
        APPROVE.PENDING_PAYMENT,
        APPROVE.DAPODIK_ISSUE,
        APPROVE.DATA_ISSUE,
      ],
      default: APPROVE.PENDING,
      index: true,
    },
    approvedByUser: {
      type: Schema.Types.String,
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
    activationCode: {
      type: Schema.Types.String,
      default: null,
      select: false,
    },
    profilePicture: {
      type: Schema.Types.String,
      default: "user.jpg",
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
      user.activationCode = encrypt(user.id);
    }
    return user;
  } catch (error) {
    throw error;
  }
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.activationCode;
  return user;
};

UserSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.isApprove === APPROVE.APPROVED) {
    try {
      doc.activationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await doc.save();

      const contentMail = await renderMailHTML("registration-success.ejs", {
        username: doc.username,
        email: doc.email,
        createdAt: doc.createdAt,
        activationLink: `${CLIENT_HOST}/auth/activation?code=${doc.activationCode}`,
      });

      await sendMail({
        from: EMAIL_SMTP_USER,
        to: doc.email,
        subject: "Activation Link - Silahkan Aktivasi Akun Anda",
        html: contentMail,
      });

      console.log(`Activation email sent to ${doc.email}`);
    } catch (error) {
      console.error(`Failed to send activation email:`, error);
    }
  }
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
