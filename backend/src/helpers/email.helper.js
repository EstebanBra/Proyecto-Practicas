import nodemailer from "nodemailer";
import { handleErrorServer } from "../handlers/responseHandlers.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(destinatario, asunto, htmlContent) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error("Error enviando correo:", error);
    return false;
  }
}