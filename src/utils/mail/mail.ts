import nodemailer from "nodemailer";
import ejs from "ejs"
import path from "path"
<<<<<<< HEAD
=======
import { fileURLToPath } from "url"
>>>>>>> e921a0bc66a19125068fa095974e633ce7cbc745
import { 
    EMAIL_SMTP_HOST, 
    EMAIL_SMTP_PASS, 
    EMAIL_SMTP_PORT, 
    EMAIL_SMTP_SECURE, 
    EMAIL_SMTP_SERVICE_NAME, 
    EMAIL_SMTP_USER
} from "../environment";


const tranporter = nodemailer.createTransport({
    service: EMAIL_SMTP_SERVICE_NAME,
    host: EMAIL_SMTP_HOST,
    port: EMAIL_SMTP_PORT,
    secure: EMAIL_SMTP_SECURE,
    auth: {
        user: EMAIL_SMTP_USER,
        pass: EMAIL_SMTP_PASS
    },
    requireTLS: true
})

export interface IsendEmail {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export const sendMail = async ({ ...mailParams}: IsendEmail) => {
    const result = await tranporter.sendMail({
        ...mailParams
    })
    return result;
}

export const renderMailHTML = async (template: string, data: any): Promise<string> => {
<<<<<<< HEAD
=======
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
>>>>>>> e921a0bc66a19125068fa095974e633ce7cbc745
    const content = await ejs.renderFile(
        path.join(__dirname, `templates/${template}`),
        data
    )
    return content as string;
};

