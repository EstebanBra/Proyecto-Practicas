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
    comentarioIdValidation
} from "../validations/comentario.validation.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

export async function createComentario(req, res) {
    try {
        const { body } = req;
        await comentarioBodyValidation.validateAsync(body);
        const newComentario = await createComentarioService(body);
        handleSuccess(res, 201, "Comentario creado exitosamente", newComentario);
    } catch (error) {
        handleErrorClient(res, 500, "Error creando el comentario", error);
    }
};

export async function getComentarios(req, res) {
    try {
        const { query } = req;
        // await comentarioQueryValidation.validateAsync(query); 
        const comentarios = await getComentariosService(query);
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
        const { body } = req;
        await comentarioIdValidation.validateAsync({ id });
        await comentarioBodyValidation.validateAsync(body);
        const updatedComentario = await updateComentarioService(id, body);
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
        const { usuarioId } = req.params;
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