import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
  EMAIL_SMTP_SECURE,
  EMAIL_SMTP_SERVICE_NAME,
} from "./environment";
import { ROLES, STATUS } from "./constant";

export const renderMailHTML = async (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  const templatePath = path.join(__dirname, "../templates", templateName);
  let template = await fs.promises.readFile(templatePath, "utf-8");

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const regex = new RegExp(`<%= ${key} %>`, "g");
      template = template.replace(regex, String(data[key]));
    }
  }
  return template;
};

export const sendMail = async (options: {
  from?: string;
  to: string;
  subject: string;
  html: string;
}) => {
  const transportConfig: any = {
    host: EMAIL_SMTP_HOST,
    port: EMAIL_SMTP_PORT,
    secure: EMAIL_SMTP_SECURE,
    auth: {
      user: EMAIL_SMTP_USER,
      pass: EMAIL_SMTP_PASS,
    },
    requireTLS: true,
  };

  if (EMAIL_SMTP_SERVICE_NAME) {
    transportConfig.service = EMAIL_SMTP_SERVICE_NAME;
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const mailOptions = {
    from: options.from || EMAIL_SMTP_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  return await transporter.sendMail(mailOptions);
};



interface SendRegistrationEmailOptions {
  name: string;
  email: string;
  roles: ROLES[] | string[];
  isApprove: string;
  activationLink?: string;
  pendingPayment?: number;
  period?: string;
  reason?: string;
}

const templateMap: Record<string, string> = {
  approved: "registration-success.ejs",
  "student:pending_payment": "student-pending-payment.ejs",
  "teacher:dapodik_issue": "teacher-dapodik-issue.ejs",
  "staff:data_issue": "staff-dapodik-issue.ejs",
};


const determinePrimaryRole = (roles: ROLES[] | string[]): string => {
  const hierarchy = [
    ROLES.PRINCIPAL,
    ROLES.TEACHER,
    ROLES.STAFF,
    ROLES.STUDENT,
    ROLES.PENDING,
  ];

  for (const role of hierarchy) {
    if (roles.includes(role)) {
      return role.toLowerCase();
    }
  }

  return ROLES.STUDENT.toLowerCase();
};

export const sendRegistrationEmail = async (
  options: SendRegistrationEmailOptions,
) => {
  const {
    name,
    email,
    roles,
    isApprove,
    activationLink,
    pendingPayment,
    period,
    reason,
  } = options;

  // Tentukan primary role dari array roles
  const primaryRole = determinePrimaryRole(roles);

  // Tentukan template yang digunakan
  let templateName: string | undefined;

  if (isApprove === "approved") {
    templateName = templateMap["approved"];
  } else {
    const key = `${primaryRole}:${isApprove}`;
    templateName = templateMap[key];
  }

  if (!templateName) {
    throw new Error(
      `Template tidak ditemukan untuk roles: ${roles.join(", ")}, approve: ${isApprove}`,
    );
  }

  // Siapkan data untuk template
  const emailData: Record<string, any> = {
    name,
    adminEmail: process.env.ADMIN_EMAIL || "admin@smartelearning.com",
    adminPhone: process.env.ADMIN_PHONE || "0274-123456",
    dapodikOperator: process.env.DAPODIK_OPERATOR || "Operator Dapodik",
    tatuEmail: process.env.TATU_EMAIL || "tatu@school.com",
  };

  // Tambahkan data sesuai status
  if (isApprove === "approved" && activationLink) {
    emailData.activationLink = activationLink;
  } else if (isApprove === "pending_payment" && pendingPayment) {
    emailData.amount = pendingPayment;
    emailData.period = period || "Tahun Ajaran Ini";
  } else if (isApprove === "rejected" && reason) {
    emailData.reason = reason;
  }

  // Render dan kirim email
  const html = await renderMailHTML(templateName, emailData);

  await sendMail({
    to: email,
    subject: "Pemberitahuan Pendaftaran E-Learning SMarT",
    html,
  });
};