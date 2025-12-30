"use strict";
import {
  createComentarioService,
  deleteComentarioService,
  getallComentariosService,
  getComentarioByIdService,
  getComentariosByUsuarioIdService,
  getComentariosService,
  updateComentarioService,
} from "../services/comentario.service.js";

import {
  comentarioBodyValidation,
  comentarioIdValidation,
  ComentarioqueryValidation
} from "../validations/comentario.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import { sendEmail } from "../helpers/email.helper.js";

export async function createComentario(req, res) { //Esta funcion crea un nuevo comentario
  try {
    const { body, user, files } = req; // Se toma el ID del usuario del token (req.user) en luga¿
    // Se establece automáticamente estado a "Pendiente" y se asigna el usuarioId del token
    
    // Procesar archivos si existen
    let archivosData = null;
    if (files && files.length > 0) {
      archivosData = files.map(file => ({
        nombre: file.originalname,
        ruta: file.path,
        tipo: file.mimetype,
        tamaño: file.size,
        filename: file.filename
      }));
    }
    
    const comentarioData = { 
      ...body, 
      usuarioId: user.id,
      estado: "Pendiente",
      archivos: archivosData
    };

    await comentarioBodyValidation.validateAsync(comentarioData); // Valida el cuerpo del comentario
    const newComentario = await createComentarioService(comentarioData); // Crea el comentario en la base de datos

    // Notificar por correo a los docentes que existe un nuevo comentario
    try {
      const userRepository = AppDataSource.getRepository(User);
      const docentes = await userRepository.find({ where: { rol: "docente" } });

      const destinatarios = docentes.map((docente) => docente.email).filter(Boolean);

      if (destinatarios.length > 0) {
        const asunto = `Nuevo comentario de ${user.nombreCompleto || "Estudiante"}`;
        const mensajeHtml = `
          <h2>Nuevo comentario recibido</h2>
          <p>El estudiante <strong>${user.nombreCompleto || "Estudiante"}</strong> envió un comentario.</p>
          <p><strong>Nivel de urgencia:</strong> ${comentarioData.nivelUrgencia || "normal"}</p>
          <p><strong>Tipo de problema:</strong> ${comentarioData.tipoProblema || "General"}</p>
          <p><strong>Mensaje:</strong> ${comentarioData.mensaje}</p>
          ${newComentario?.id ? `<p><strong>ID del comentario:</strong> ${newComentario.id}</p>` : ""}
        `;

        await Promise.allSettled(
          destinatarios.map((destinatario) => sendEmail(destinatario, asunto, mensajeHtml))
        );
      }
    } catch (notifyError) {
      console.error("Error notificando a docentes sobre el nuevo comentario:", notifyError);
    }

    handleSuccess(res, 201, "Comentario creado exitosamente", newComentario); 
  } catch (error) {
    handleErrorClient(res, 500, "Error creando el comentario", error);
  }
};

export async function getComentarios(req, res) {
  try {
    const { user, query } = req;
    
    // Validar que el usuario tenga información requerida
    if (!user || !user.rol || !user.id) {
      return handleErrorClient(res, 400, "Token inválido: falta información de usuario");
    }

    // Validar los query parameters si existen
    await ComentarioqueryValidation.validateAsync(query);

    // Estudiantes: solo sus propios comentarios. Docentes y admin: todos los comentarios.
    const comentarios = user.rol === "estudiante"
      ? await getComentariosByUsuarioIdService(user.id)
      : await getallComentariosService();

    handleSuccess(res, 200, "Comentarios obtenidos exitosamente", comentarios);
  } catch (error) {
    handleErrorClient(res, 500, "Error obteniendo los comentarios", error);
  }
};

export async function getComentarioById(req, res) {
  try {
    const { id } = req.params;
    await comentarioIdValidation.validateAsync({ id });
    const comentario = await getComentarioByIdService(id);
    handleSuccess(res, 200, "Comentario encontrado exitosamente", comentario);
  } catch (error) {
    handleErrorClient(res, 500, "Error obteniendo el comentario por ID", error);
  }
};

export async function updateComentario(req, res) {
  try {
    const { id } = req.params;
    const { body, user, files } = req;
    await comentarioIdValidation.validateAsync({ id });
    // Procesar archivos si existen
    let archivosData = null;
    if (files && files.length > 0) {
      archivosData = files.map(file => ({
        nombre: file.originalname,
        ruta: file.path,
        tipo: file.mimetype,
        tamaño: file.size,
        filename: file.filename
      }));
    }

    let comentarioDataActualizado;

    if (user.rol === "docente") {
      // Traer comentario existente para completar campos requeridos y forzar estado Respondido
      const existente = await getComentarioByIdService(id);
      if (!existente) {
        return handleErrorClient(res, 404, "Comentario no encontrado");
      }

      // Fusionar archivos: mantener los del estudiante y agregar los del docente
      let archivosFinales = existente.archivos || [];
      if (archivosData && archivosData.length > 0) {
        archivosFinales = [...archivosFinales, ...archivosData];
      }

      const payloadDocente = {
        mensaje: existente.mensaje,
        estado: "Respondido",
        nivelUrgencia: existente.nivelUrgencia || "normal",
        tipoProblema: existente.tipoProblema || "General",
        respuesta: body.respuesta,
        usuarioId: existente.usuarioId,
        ...(archivosFinales && archivosFinales.length > 0 && { archivos: archivosFinales })
      };

      const comentarioDataValidado = await comentarioBodyValidation.validateAsync(payloadDocente);
      comentarioDataActualizado = comentarioDataValidado;
    } else {
      // Estudiante edita su propio comentario
      const bodyConUsuario = { ...body, usuarioId: user.id, ...(archivosData && { archivos: archivosData }) };
      const comentarioDataValidado = await comentarioBodyValidation.validateAsync(bodyConUsuario);
      comentarioDataActualizado = comentarioDataValidado;
    }

    const updatedComentario = await updateComentarioService(id, comentarioDataActualizado);
    handleSuccess(res, 200, "Comentario actualizado exitosamente", updatedComentario);
  } catch (error) {
    handleErrorClient(res, 500, "Error actualizando el comentario", error);
  }
};

export async function deleteComentario(req, res) {
  try {
    const { id } = req.params;
    await comentarioIdValidation.validateAsync({ id });
    await deleteComentarioService(id);
    handleSuccess(res, 200, "Comentario Eliminado exitosamente");
  } catch (error) {
    handleErrorClient(res, 500, "Error eliminando el comentario", error);
  }
};

export async function getComentariosByUsuarioId(req, res) {
  try {
    // Si no se pasa un ID en la URL, se usa el ID del usuario autenticado.
    const usuarioId = req.params.usuarioId || req.user.id;

    // Un estudiante solo puede consultar sus propios comentarios
    if (req.user?.rol === "estudiante" && Number(usuarioId) !== Number(req.user.id)) {
      return handleErrorClient(
        res,
        403,
        "Acceso denegado",
        "Un estudiante solo puede ver sus propios comentarios"
      );
    }

    await comentarioIdValidation.validateAsync({ id: usuarioId });
    const comentarios = await getComentariosByUsuarioIdService(usuarioId);
    handleSuccess(res, 200, "Comentarios del usuario obtenidos exitosamente", comentarios);
  } catch (error) {
    handleErrorClient(res, 500, "Error obteniendo los comentarios del usuario", error);
  }  
};

export async function getAllComentarios(req, res) {
  try {
    const comentarios = await getallComentariosService();
    handleSuccess(res, 200, "Todos los comentarios obtenidos exitosamente", comentarios);
  } catch (error) {
    handleErrorClient(res, 500, "Error obteniendo todos los comentarios", error);
  }
};

export async function downloadArchivoComentario(req, res) {
  try {
    const { id, archivoIndex } = req.params;
    const { user } = req;
    
    await comentarioIdValidation.validateAsync({ id });
    const comentario = await getComentarioByIdService(id);
    
    if (!comentario) {
      return handleErrorClient(res, 404, "Comentario no encontrado");
    }
    
    // Verificar permisos: estudiante solo puede descargar archivos de sus propios comentarios
    if (user.rol === "estudiante" && Number(comentario.usuarioId) !== Number(user.id)) {
      return handleErrorClient(res, 403, "Acceso denegado", "No tienes permiso para descargar este archivo");
    }
    
    if (!comentario.archivos || comentario.archivos.length === 0) {
      return handleErrorClient(res, 404, "Este comentario no tiene archivos adjuntos");
    }
    
    const index = parseInt(archivoIndex);
    if (isNaN(index) || index < 0 || index >= comentario.archivos.length) {
      return handleErrorClient(res, 400, "Índice de archivo inválido");
    }
    
    const archivo = comentario.archivos[index];
    const filePath = archivo.ruta;
    
    // Enviar el archivo
    res.download(filePath, archivo.nombre, (err) => {
      if (err) {
        handleErrorClient(res, 500, "Error descargando el archivo", err);
      }
    });
  } catch (error) {
    handleErrorClient(res, 500, "Error descargando el archivo del comentario", error);
  }
};