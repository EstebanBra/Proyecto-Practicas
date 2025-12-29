"use strict";
import { AppDataSource } from "../config/configDb.js";

const practicaRepository = AppDataSource.getRepository("Practica");
const userRepository = AppDataSource.getRepository("User");

/**
 * Crear una práctica externa (ingresada por el estudiante)
 * Se acepta automáticamente con estado "en_progreso" para permitir bitácoras
 */
export async function crearPracticaExternaService(datosPractica) {
    try {
        // Validar que el estudiante exista
        const estudiante = await userRepository.findOne({
            where: { id: datosPractica.id_estudiante }
        });

        if (!estudiante) {
            return [null, "Estudiante no encontrado"];
        }

        // Verificar que el estudiante no tenga ya una práctica activa o en progreso
        const practicaExistente = await practicaRepository.findOne({
            where: { 
                id_estudiante: datosPractica.id_estudiante,
                estado: "en_progreso"
            }
        });

        if (practicaExistente) {
            return [null, "Ya tienes una práctica en progreso. Debes finalizarla antes de crear una nueva."];
        }

        // Validar fechas
        const fechaInicio = new Date(datosPractica.fecha_inicio);
        const fechaFin = new Date(datosPractica.fecha_fin);

        if (fechaFin <= fechaInicio) {
            return [null, "La fecha de fin debe ser posterior a la fecha de inicio"];
        }

        // Crear la práctica con estado "en_progreso" automáticamente
        // para que el estudiante pueda comenzar a subir bitácoras inmediatamente
        const nuevaPractica = practicaRepository.create({
            id_estudiante: datosPractica.id_estudiante,
            empresa: datosPractica.empresa,
            supervisor_nombre: datosPractica.supervisor_nombre,
            supervisor_email: datosPractica.supervisor_email,
            supervisor_telefono: datosPractica.supervisor_telefono,
            fecha_inicio: datosPractica.fecha_inicio,
            fecha_fin: datosPractica.fecha_fin,
            horas_practicas: datosPractica.horas_practicas || null,
            semanas: datosPractica.semanas,
            tipo_presencia: datosPractica.tipo_presencia || "presencial",
            tipo_practica: "externa",
            documentos: datosPractica.documentos || [],
            estado: "en_progreso", // Aceptada automáticamente
            fecha_creacion: new Date()
        });

        const practicaGuardada = await practicaRepository.save(nuevaPractica);
        return [practicaGuardada, null];

    } catch (error) {
        console.error("Error al crear práctica externa:", error);
        return [null, `Error al crear la práctica: ${error.message}`];
    }
}

/**
 * Obtener práctica del estudiante actual
 */
export async function obtenerPracticaEstudianteService(idEstudiante) {
    try {
        const practica = await practicaRepository.findOne({
            where: { id_estudiante: idEstudiante },
            order: { fecha_creacion: "DESC" }
        });

        return [practica, null];
    } catch (error) {
        console.error("Error al obtener práctica:", error);
        return [null, "Error al obtener la práctica"];
    }
}

/**
 * Obtener todas las prácticas del estudiante
 */
export async function obtenerPracticasEstudianteService(idEstudiante) {
    try {
        const practicas = await practicaRepository.find({
            where: { id_estudiante: idEstudiante },
            order: { fecha_creacion: "DESC" }
        });

        return [practicas, null];
    } catch (error) {
        console.error("Error al obtener prácticas:", error);
        return [null, "Error al obtener las prácticas"];
    }
}

/**
 * Obtener práctica por ID
 */
export async function obtenerPracticaPorIdService(idPractica) {
    try {
        const practica = await practicaRepository.findOne({
            where: { id_practica: idPractica },
            relations: ["estudiante", "docente"]
        });

        if (!practica) {
            return [null, "Práctica no encontrada"];
        }

        return [practica, null];
    } catch (error) {
        console.error("Error al obtener práctica:", error);
        return [null, "Error al obtener la práctica"];
    }
}

/**
 * Actualizar práctica
 */
export async function actualizarPracticaService(idPractica, datosActualizacion, idEstudiante) {
    try {
        const practica = await practicaRepository.findOne({
            where: { id_practica: idPractica }
        });

        if (!practica) {
            return [null, "Práctica no encontrada"];
        }

        // Verificar que la práctica pertenezca al estudiante
        if (practica.id_estudiante !== idEstudiante) {
            return [null, "No tienes permiso para modificar esta práctica"];
        }

        // Solo permitir actualizar si está en progreso
        if (practica.estado !== "en_progreso") {
            return [null, "Solo puedes modificar prácticas que estén en progreso"];
        }

        // Campos que se pueden actualizar
        const camposPermitidos = [
            "empresa", "supervisor_nombre", "supervisor_email", "supervisor_telefono",
            "fecha_inicio", "fecha_fin", "horas_practicas", "semanas", "tipo_presencia"
        ];

        camposPermitidos.forEach(campo => {
            if (datosActualizacion[campo] !== undefined) {
                practica[campo] = datosActualizacion[campo];
            }
        });

        const practicaActualizada = await practicaRepository.save(practica);
        return [practicaActualizada, null];

    } catch (error) {
        console.error("Error al actualizar práctica:", error);
        return [null, "Error al actualizar la práctica"];
    }
}

/**
 * Finalizar práctica
 */
export async function finalizarPracticaService(idPractica, idEstudiante) {
    try {
        const practica = await practicaRepository.findOne({
            where: { id_practica: idPractica }
        });

        if (!practica) {
            return [null, "Práctica no encontrada"];
        }

        if (practica.id_estudiante !== idEstudiante) {
            return [null, "No tienes permiso para finalizar esta práctica"];
        }

        if (practica.estado !== "en_progreso") {
            return [null, "Solo puedes finalizar prácticas que estén en progreso"];
        }

        practica.estado = "finalizada";
        const practicaFinalizada = await practicaRepository.save(practica);

        return [practicaFinalizada, null];

    } catch (error) {
        console.error("Error al finalizar práctica:", error);
        return [null, "Error al finalizar la práctica"];
    }
}

/**
 * Obtener todas las prácticas (para docentes/admin)
 */
export async function obtenerTodasPracticasService() {
    try {
        const practicas = await practicaRepository.find({
            relations: ["estudiante", "docente"],
            order: { fecha_creacion: "DESC" }
        });

        return [practicas, null];
    } catch (error) {
        console.error("Error al obtener todas las prácticas:", error);
        return [null, "Error al obtener las prácticas"];
    }
}

/**
 * Asignar docente a práctica
 */
export async function asignarDocenteService(idPractica, idDocente) {
    try {
        const practica = await practicaRepository.findOne({
            where: { id_practica: idPractica }
        });

        if (!practica) {
            return [null, "Práctica no encontrada"];
        }

        const docente = await userRepository.findOne({
            where: { id: idDocente, rol: "docente" }
        });

        if (!docente) {
            return [null, "Docente no encontrado"];
        }

        practica.id_docente = idDocente;
        const practicaActualizada = await practicaRepository.save(practica);

        return [practicaActualizada, null];

    } catch (error) {
        console.error("Error al asignar docente:", error);
        return [null, "Error al asignar el docente"];
    }
}

/**
 * Calificar práctica (para docentes)
 */
export async function calificarPracticaService(idPractica, nota) {
    try {
        const practica = await practicaRepository.findOne({
            where: { id_practica: idPractica }
        });

        if (!practica) {
            return [null, "Práctica no encontrada"];
        }

        if (nota < 1.0 || nota > 7.0) {
            return [null, "La nota debe estar entre 1.0 y 7.0"];
        }

        practica.nota_practica = nota;
        const practicaActualizada = await practicaRepository.save(practica);

        return [practicaActualizada, null];

    } catch (error) {
        console.error("Error al calificar práctica:", error);
        return [null, "Error al calificar la práctica"];
    }
}
