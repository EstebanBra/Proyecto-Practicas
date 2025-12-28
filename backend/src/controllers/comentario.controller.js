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

    // Estudiantes: solo sus propios comentarios. Docentes: todos los comentarios.
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
    await comentarioBodyValidation.validateAsync(body);
    
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
    
    // Si el usuario es docente, cambiar estado a "Respondido"
    const comentarioDataActualizado = user.rol === "profesor" 
      ? { ...body, estado: "Respondido", ...(archivosData && { archivos: archivosData }) }
      : { ...body, ...(archivosData && { archivos: archivosData }) };
    
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