import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
const smtpSecure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;

const transporter  = createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    secure: smtpSecure,
});

export default transporter;