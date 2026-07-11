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

  // Tambahkan service hanya jika tersedia
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
