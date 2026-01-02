import nodemailer from "nodemailer";

export async function sendEmail(destinatario, asunto, htmlContent) {
  try {
    // Validar que existan las variables de entorno
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER o EMAIL_PASS no están configurados en el .env");
      return false;
    }

    // Crear transporter para cada envío
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Correo enviado exitosamente a ${destinatario}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`✗ Error enviando correo a ${destinatario}:`, error.message);
    return false;
  }
}