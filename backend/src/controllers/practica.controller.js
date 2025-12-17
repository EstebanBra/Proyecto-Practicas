import practicaService from "../services/practica.service.js";
import { handleErrorClient as error, handleSuccess as success } from "../handlers/responseHandlers.js";

const practicaController = {
    // Crear solicitud de práctica
    crearPractica: async (req, res) => {
        try {
            const datosPractica = {
                ...req.body,
                id_estudiante: req.user.id,
                estado: "Revision_Pendiente"
            };
            const result = await practicaService.crearPractica(datosPractica);
            return success(res, 201, "Solicitud de práctica creada con éxito", result);
        } catch (err) {
            return error(res, 500, "Error al crear la práctica: " + err.message, err);
        }
    },

    // Obtener todas las prácticas (encargado)
    obtenerTodasPracticas: async (req, res) => {
        try {
            const practicas = await practicaService.obtenerTodasPracticas();
            return success(res, 200, "Prácticas obtenidas con éxito", practicas);
        } catch (err) {
            return error(res, 500, "Error al obtener las prácticas", err);
        }
    },

    // Obtener prácticas de un estudiante
    obtenerPracticasEstudiante: async (req, res) => {
        try {
            const practicas = await practicaService.obtenerPracticasEstudiante(req.user.id);
            return success(res, 200, "Prácticas del estudiante obtenidas con éxito", practicas);
        } catch (err) {
            return error(res, 500, "Error al obtener las prácticas del estudiante", err);
        }
    },

    // Obtener una práctica específica por ID
    obtenerPracticaPorId: async (req, res) => {
        try {
            const practica = await practicaService.obtenerPracticaPorId(req.params.id);
            if (!practica) {
                return error(res, 404, "Práctica no encontrada");
            }
            return success(res, 200, "Práctica recuperada con éxito", practica);
        } catch (err) {
            return error(res, 500, "Error al obtener la práctica solicitada", err);
        }
    },

    // Actualizar estado de la práctica (encargado)
    actualizarEstadoPractica: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado, observaciones } = req.body;

            if (!["Aprobada", "Rechazada", "En_Curso", "Finalizada"].includes(estado)) {
                return error(res, 400, "Estado no válido");
            }

            const practica = await practicaService.actualizarEstadoPractica(id, estado, observaciones);
            if (!practica) {
                return error(res, 404, "Práctica no encontrada");
            }
            return success(res, 200, "Estado de la práctica actualizado con éxito", practica);
        } catch (err) {
            return error(res, 500, "Error al actualizar el estado de la práctica", err);
        }
    },

    // Actualizar información de práctica (estudiante)
    actualizarPractica: async (req, res) => {
        try {
            const { id } = req.params;
            const datosActualizacion = req.body;
            
            const practica = await practicaService.actualizarPractica(id, datosActualizacion);
            if (!practica) {
                return error(res, 404, "Práctica no encontrada o no se puede actualizar en su estado actual");
            }
            return success(res, 200, "Práctica actualizada con éxito", practica);
        } catch (err) {
            return error(res, 500, "Error al actualizar la práctica", err);
        }
    }
};

export default practicaController;