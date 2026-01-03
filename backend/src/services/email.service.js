"use strict";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Aseguramos que cargue las variables de entorno
dotenv.config();

// Configuración del "Transporte" (La conexión con Gmail)
const transporter = nodemailer.createTransport({
    service: "gmail", // Nodemailer ya conoce la configuración de Gmail
    auth: {
        user: process.env.EMAIL_USER, // El correo
        pass: process.env.EMAIL_PASS  // Contraseña de aplicación
    }
});

// Verificar que la conexión funciona al iniciar (Opcional, sirve para debug)
transporter.verify().then(() => {
    console.log("✅ Sistema de correos listo para enviar mensajes.");
}).catch((error) => {
    console.error("❌ Error en la configuración del correo:", error);
});

// Función para enviar correos de aceptación
export async function enviarCorreoAceptacion(emailDestino, nombreEstudiante, nombreOferta) {
    try {
        // Estructura del correo
        const info = await transporter.sendMail({
            from: `"Gestión de Prácticas UBB" <${process.env.EMAIL_USER}>`, // Remitente
            to: emailDestino, // Correo del estudiante
            subject: "🎉 ¡Tu postulación ha sido ACEPTADA!", // Asunto
            // Cuerpo del correo en HTML (Diseño bonito)
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #003366; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">¡Felicidades!</h1>
                    </div>
                    
                    <div style="padding: 20px; background-color: #ffffff;">
                        <h2 style="color: #333;">Hola, ${nombreEstudiante}</h2>
                        <p style="font-size: 16px; color: #555; line-height: 1.5;">
                            Nos complace informarte que tu postulación para la práctica profesional ha sido <strong>aceptada</strong> por el docente encargado.
                        </p>
                        
                        <div style="background-color: #f0f8ff; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #003366;">Oferta de Práctica:</p>
                            <p style="margin: 5px 0 0 0; font-size: 18px;">${nombreOferta}</p>
                        </div>

                        <p style="font-size: 14px; color: #666;">
                            <strong>¿Qué sigue?</strong><br>
                            Tu estado ha cambiado a "En Progreso". Ya puedes ingresar a la plataforma para registrar tus bitácoras semanales y subir tus documentos.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173/login" style="background-color: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a la Plataforma</a>
                        </div>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                        <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                    </div>
                </div>
            `
        });

        console.log("📧 Correo enviado exitosamente ID:", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Error al enviar el correo:", error);
        return false;
    }
}