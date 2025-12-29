import practicaService from "../services/practica.service.js";
import { handleErrorClient as error, handleSuccess as success } from "../handlers/responseHandlers.js";

const practicaController = {
    // Crear solicitud de práctica
    crearPractica: async (req, res) => {
        try {
            // Verificar si hubo error en la carga de archivos (multer)
            if (req.fileValidationError) {
                return error(res, 400, req.fileValidationError);
            }

            // Normalizar tipo_presencia a minúsculas para la BD
            let tipo_presencia = req.body.tipo_presencia;
            if (tipo_presencia) {
                const mapa = {
                    "Presencial": "presencial",
                    "Virtual": "virtual",
                    "Hibrido": "hibrido"
                };
                tipo_presencia = mapa[tipo_presencia] || tipo_presencia.toLowerCase();
            }
            
            //procesar archivos subidos
            const documentos = req.files ? req.files.map(file => ({
                nombre: file.originalname,
                url: `/uploads/practicas/${file.filename}`,
                tipo: file.mimetype
            })) : [];
            
            if (documentos.length === 0) {
                return error(res, 400, "Debe proporcionar al menos un documento");
            }
            
            // Validar que tipo_practica sea válido si viene en el body
            let tipo_practica = req.body.tipo_practica || "propia";
            if (!["publicada", "propia"].includes(tipo_practica)) {
                return error(res, 400, "El tipo de práctica debe ser 'publicada' o 'propia'");
            }

            const datosPractica = {
                ...req.body,
                tipo_presencia: tipo_presencia,
                documentos: documentos,
                id_estudiante: req.user.id,
                tipo_practica: tipo_practica,
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

            if (!estado) {
                return error(res, 400, "El estado es obligatorio");
            }

            // Validar que el estado sea válido
            const estadosValidos = ["Aprobada", "Rechazada", "En_Curso", "Finalizada"];
            if (!estadosValidos.includes(estado)) {
                return error(res, 400, `Estado no válido. Debe ser uno de: ${estadosValidos.join(", ")}`);
            }

            // Verificar que la práctica existe antes de actualizar
            const practicaExistente = await practicaService.obtenerPracticaPorId(id);
            if (!practicaExistente) {
                return error(res, 404, "Práctica no encontrada");
            }

            // Validar transiciones de estado lógicas
            const estadoActual = practicaExistente.estado;
            if (estadoActual === "Finalizada") {
                return error(res, 400, "No se puede modificar el estado de una práctica finalizada");
            }
            if (estadoActual === "Rechazada" && estado !== "Rechazada") {
                return error(res, 400, "Una práctica rechazada no puede cambiar a otro estado");
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
            //verificar que la practica exista y pertenezca al estudiante
            const practicaExistente = await practicaService.obtenerPracticaPorId(id);
            if (!practicaExistente) {
                return error(res, 404, "Practica no encontrada");
            }
            if (practicaExistente.id_estudiante !== req.user.id) {
                return error(res, 403, "No tiene permiso para actualizar esta práctica");
            }

            const practica = await practicaService.actualizarPractica(id, datosActualizacion);
            if (!practica) {
                return error(res, 400, "Practica no posible de actualizar");
            }
            return success(res, 200, "Practica actualizada con éxito", practica);
        } catch (err) {
            return error(res, 500, "Error al actualizar la práctica", err);
        }
    }
};

export default practicaController;