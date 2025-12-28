"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import * as bitacoraService from "../services/Bitacoras.service.js";

export async function registrarBitacora(req, res) {
    try {
        const { 
            id_practica, 
            semana, 
            descripcion_actividades, 
            resultados_aprendizajes,
            horas_trabajadas,
            id_documento
        } = req.body;

        // Validar archivo si se proporcionó
        if (req.fileValidationError) {
            return handleErrorClient(res, 400, req.fileValidationError);
        }

        const archivo = req.file;

        // Validar campos requeridos
        if (!id_practica || !semana || !descripcion_actividades || !resultados_aprendizajes || !horas_trabajadas) {
            return handleErrorClient(res, 400, "Todos los campos son requeridos");
        }

        // Verificar la práctica activa
        const practicaActiva = await bitacoraService.verificarPracticaActiva(id_practica);
        if (!practicaActiva) {
            return handleErrorClient(res, 400, "No existe una práctica activa para registrar la bitácora");
        }

        // Validar la semana (permitir registro más flexible)
        if (semana < 1 || semana > 20) {
            return handleErrorClient(res, 400, "La semana debe estar entre 1 y 20");
        }

        // Validar secuencia de semanas (más flexible)
        const ultimaSemana = await bitacoraService.obtenerUltimaSemana(id_practica);
        if (semana <= ultimaSemana) {
            return handleErrorClient(res, 400, "Ya existe una bitácora para esta semana");
        }
        // Permitir saltos en las semanas si es necesario (máximo 5 semanas de diferencia)
        if (semana > ultimaSemana + 5) {
            return handleErrorClient(res, 400, "No puedes registrar bitácoras con más de 5 semanas de diferencia");
        }

        // Validar y convertir horas trabajadas
        const horasNum = parseFloat(horas_trabajadas);
        if (isNaN(horasNum) || horasNum < 1 || horasNum > 40) {
            return handleErrorClient(res, 400, "Las horas trabajadas deben estar entre 1 y 40");
        }
        if (horasNum % 0.5 !== 0) {
            return handleErrorClient(res, 400, "Las horas deben registrarse en intervalos de media hora");
        }

        // Validar contenido de textos
        if (descripcion_actividades.replace(/\s+/g, "").length < 50) {
            return handleErrorClient(
                res, 400, "La descripción debe tener contenido significativo (mínimo 50 caracteres)"
            );
        }

        if (resultados_aprendizajes.replace(/\s+/g, "").length < 25) {
            return handleErrorClient(
                res, 400, "Los resultados de aprendizaje deben tener mínimo 25 caracteres"
            );
        }

        // Preparar datos de la bitácora
        let datosBitacora = {
            id_practica: parseInt(id_practica),
            semana: parseInt(semana),
            descripcion_actividades: descripcion_actividades.trim(),
            resultados_aprendizajes: resultados_aprendizajes.trim(),
            horas_trabajadas: horasNum,
            estado_revision: "en_progreso",
            fecha_registro: new Date()
        };

        // Si se proporciona un ID de documento, obtener la información del archivo
        if (id_documento) {
            try {
                const { AppDataSource } = await import("../config/configDb.js");
                const documentoRepository = AppDataSource.getRepository("BitacorasDocumento");

                const documento = await documentoRepository.findOne({
                    where: { id_documento: parseInt(id_documento) }
                });

                if (documento) {
                    datosBitacora = {
                        ...datosBitacora,
                        nombre_archivo: documento.nombre_archivo,
                        ruta_archivo: documento.ruta_archivo,
                        formato_archivo: documento.formato,
                        peso_archivo_mb: documento.peso_mb
                    };
                } else {
                    return handleErrorClient(res, 400, "El documento especificado no existe");
                }
            } catch (docError) {
                console.error("Error al obtener documento:", docError);
                return handleErrorClient(res, 400, "Error al obtener la información del documento");
            }
        }



        // Registrar la bitácora
        const nuevaBitacora = await bitacoraService.crearBitacora(datosBitacora);
        return handleSuccess(res, 201, "Bitácora registrada exitosamente", nuevaBitacora);
    } catch (error) {
        console.error("Error al registrar bitácora:", error);
        if (error.code === "LIMIT_FILE_SIZE") {
            return handleErrorClient(res, 400, "El archivo excede el tamaño máximo permitido");
        }
        return handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerBitacora(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return handleErrorClient(res, 400, "El ID de la bitácora es requerido");
        }

        const bitacora = await bitacoraService.obtenerBitacora(id);
        if (!bitacora) {
            return handleErrorClient(res, 404, "Bitácora no encontrada");
        }

        return handleSuccess(res, 200, "Bitácora encontrada exitosamente", bitacora);
    } catch (error) {
        console.error("Error al obtener bitácora:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerBitacorasPorPractica(req, res) {
    try {
        const { id_practica } = req.params;
        if (!id_practica) {
            return handleErrorClient(res, 400, "El ID de la práctica es requerido");
        }

        const bitacoras = await bitacoraService.obtenerBitacorasPorPractica(id_practica);
        if (!bitacoras || bitacoras.length === 0) {
            return handleSuccess(res, 200, "No se encontraron bitácoras para esta práctica", []);
        }

        return handleSuccess(res, 200, "Bitácoras recuperadas exitosamente", bitacoras);
    } catch (error) {
        console.error("Error al obtener bitácoras:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerUltimaSemana(req, res) {
    try {
        const { id_practica } = req.params;
        if (!id_practica) {
            return handleErrorClient(res, 400, "El ID de la práctica es requerido");
        }

        const ultimaSemana = await bitacoraService.obtenerUltimaSemana(id_practica);
        return handleSuccess(res, 200, "Última semana recuperada exitosamente", { ultimaSemana: ultimaSemana || 0 });
    } catch (error) {
        console.error("Error al obtener última semana:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

// Buscar bitácoras por RUT del estudiante (para docentes)
export async function buscarBitacorasPorRut(req, res) {
    try {
        const { rut } = req.params;
        if (!rut) {
            return handleErrorClient(res, 400, "El RUT es requerido");
        }

        // --- CORRECCIÓN AQUÍ ---
        // Eliminamos la limpieza para que busque el RUT tal cual está en la BD (con puntos y guion)
        // Antes tenías: const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "");
        
        // Usamos el RUT directo
        const resultado = await bitacoraService.obtenerBitacorasPorRut(rut); 
        
        if (resultado.error && (!resultado.bitacoras || resultado.bitacoras.length === 0)) {
            return handleErrorClient(res, 404, resultado.error);
        }

        return handleSuccess(res, 200, "Bitácoras encontradas", resultado);
    } catch (error) {
        console.error("Error al buscar bitácoras por RUT:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerMiPractica(req, res) {
    try {
        // Obtenemos el ID del token (que corresponde al estudiante logueado)
        const idEstudiante = req.user.id; 
        
        // Llamamos al servicio con el nuevo nombre
        const practica = await bitacoraService.obtenerPracticaPorEstudiante(idEstudiante);

        if (!practica) {
            return handleErrorClient(res, 404, "No tienes una práctica activa en este momento.");
        }

        handleSuccess(res, 200, "Práctica encontrada", practica);
    } catch (error) {
        console.error("Error al obtener mi práctica:", error);
        handleErrorServer(res, 500, error.message);
    }
}
