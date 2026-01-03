"use strict";
import {
    actualizarPracticaService,
    asignarDocenteService,
    calificarPracticaService,
    crearPracticaExternaService,
    finalizarPracticaService,
    obtenerPracticaEstudianteService,
    obtenerPracticaPorIdService,
    obtenerPracticasEstudianteService,
    obtenerTodasPracticasService
} from "../services/practica.service.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess
} from "../handlers/responseHandlers.js";
import { practicaExternaValidation, practicaUpdateValidation } from "../validations/practica.validation.js";

/**
 * Crear práctica externa (estudiante)
 */
export async function crearPracticaExterna(req, res) {
    try {
        const { body } = req;
        const idEstudiante = req.user.id;

        const { error } = practicaExternaValidation.validate(body);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }

        const datosPractica = {
            ...body,
            id_estudiante: idEstudiante
        };

        const [practica, errorService] = await crearPracticaExternaService(datosPractica);

        if (errorService) {
            return handleErrorClient(res, 400, "Error al crear la práctica", errorService);
        }

        const mensaje = "Práctica externa creada exitosamente. Ya puedes subir tus bitácoras.";
        return handleSuccess(res, 201, mensaje, practica);

    } catch (error) {
        console.error("Error en crearPracticaExterna:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener práctica actual del estudiante
 */
export async function obtenerMiPractica(req, res) {
    try {
        const idEstudiante = req.user.id;

        const [practica, errorService] = await obtenerPracticaEstudianteService(idEstudiante);

        if (errorService) {
            return handleErrorClient(res, 400, "Error al obtener la práctica", errorService);
        }

        if (!practica) {
            return handleErrorClient(res, 404, "No tienes una práctica registrada");
        }

        return handleSuccess(res, 200, "Práctica obtenida exitosamente", practica);

    } catch (error) {
        console.error("Error en obtenerMiPractica:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener todas las prácticas del estudiante
 */
export async function obtenerMisPracticas(req, res) {
    try {
        const idEstudiante = req.user.id;

        const [practicas, errorService] = await obtenerPracticasEstudianteService(idEstudiante);

        if (errorService) {
            return handleErrorClient(res, 400, "Error al obtener las prácticas", errorService);
        }

        return handleSuccess(res, 200, "Prácticas obtenidas exitosamente", practicas);

    } catch (error) {
        console.error("Error en obtenerMisPracticas:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener práctica por ID
 */
export async function obtenerPracticaPorId(req, res) {
    try {
        const { id } = req.params;

        const [practica, errorService] = await obtenerPracticaPorIdService(parseInt(id));

        if (errorService) {
            return handleErrorClient(res, 404, errorService);
        }

        return handleSuccess(res, 200, "Práctica obtenida exitosamente", practica);

    } catch (error) {
        console.error("Error en obtenerPracticaPorId:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Actualizar práctica (estudiante)
 */
export async function actualizarPractica(req, res) {
    try {
        const { id } = req.params;
        const { body } = req;
        const idEstudiante = req.user.id;

        const { error } = practicaUpdateValidation.validate(body);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }

        const [practica, errorService] = await actualizarPracticaService(parseInt(id), body, idEstudiante);

        if (errorService) {
            return handleErrorClient(res, 400, errorService);
        }

        return handleSuccess(res, 200, "Práctica actualizada exitosamente", practica);

    } catch (error) {
        console.error("Error en actualizarPractica:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Finalizar práctica (estudiante)
 */
export async function finalizarPractica(req, res) {
    try {
        const { id } = req.params;
        const idEstudiante = req.user.id;

        const [practica, errorService] = await finalizarPracticaService(parseInt(id), idEstudiante);

        if (errorService) {
            return handleErrorClient(res, 400, errorService);
        }

        return handleSuccess(res, 200, "Práctica finalizada exitosamente", practica);

    } catch (error) {
        console.error("Error en finalizarPractica:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener todas las prácticas (docente/admin)
 */
export async function obtenerTodasPracticas(req, res) {
    try {
        const [practicas, errorService] = await obtenerTodasPracticasService();

        if (errorService) {
            return handleErrorClient(res, 400, errorService);
        }

        return handleSuccess(res, 200, "Prácticas obtenidas exitosamente", practicas);

    } catch (error) {
        console.error("Error en obtenerTodasPracticas:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Asignar docente a práctica (admin)
 */
export async function asignarDocente(req, res) {
    try {
        const { id } = req.params;
        const { id_docente } = req.body;

        if (!id_docente) {
            return handleErrorClient(res, 400, "El ID del docente es requerido");
        }

        const [practica, errorService] = await asignarDocenteService(parseInt(id), id_docente);

        if (errorService) {
            return handleErrorClient(res, 400, errorService);
        }

        return handleSuccess(res, 200, "Docente asignado exitosamente", practica);

    } catch (error) {
        console.error("Error en asignarDocente:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Calificar práctica (docente)
 */
export async function calificarPractica(req, res) {
    try {
        const { id } = req.params;
        const { nota } = req.body;

        if (nota === undefined || nota === null) {
            return handleErrorClient(res, 400, "La nota es requerida");
        }

        const [practica, errorService] = await calificarPracticaService(parseInt(id), parseFloat(nota));

        if (errorService) {
            return handleErrorClient(res, 400, errorService);
        }

        return handleSuccess(res, 200, "Práctica calificada exitosamente", practica);

    } catch (error) {
        console.error("Error en calificarPractica:", error);
        return handleErrorServer(res, 500, error.message);
    }
}
