"use strict";
import { AppDataSource } from "../config/configDb.js";

const bitacoraRepository = AppDataSource.getRepository("Bitacora");
const practicaRepository = AppDataSource.getRepository("Practica");

export async function verificarPracticaActiva(id_practica) {
    const practica = await practicaRepository.findOne({
        where: { id_practica: id_practica }
    });

    return practica && (practica.estado === "en_progreso" || practica.estado === "activa");
}

export async function crearBitacora(datoBitacora) {
    try {
        // Crear la nueva bitácora
        const nuevaBitacora = bitacoraRepository.create(datoBitacora);
        return await bitacoraRepository.save(nuevaBitacora);
    } catch (error) {
        console.error("Error en el servicio al crear bitácora:", error);
        throw new Error("Error al guardar la bitácora en la base de datos");
    }
}

export async function obtenerBitacora(id_bitacora) {
    const bitacora = await bitacoraRepository.findOne({
        where: { id_bitacora: id_bitacora }
    });

    if (!bitacora) {
        throw new Error("Bitácora no encontrada");
    }

    return bitacora;
}

export async function obtenerBitacorasPorPractica(id_practica) {
    return await bitacoraRepository.find({
        where: { id_practica: id_practica },
        order: { semana: "ASC" }
    });
}

export async function obtenerUltimaSemana(id_practica) {
    const resultado = await bitacoraRepository.findOne({
        where: { id_practica: id_practica },
        order: { semana: "DESC" }
    });

    return resultado ? resultado.semana : 0;
}

// Buscar bitácoras por RUT del estudiante (para docentes)
export async function obtenerBitacorasPorRut(rut) {
    const userRepository = AppDataSource.getRepository("User");
    
    // Buscar el usuario por RUT
    const usuario = await userRepository.findOne({
        where: { rut: rut }
    });

    if (!usuario) {
        return { error: "No se encontró un estudiante con ese RUT", bitacoras: [] };
    }

    // Buscar la práctica del estudiante
    const practica = await practicaRepository.findOne({
        // ---  Usamos 'id_estudiante' en lugar de 'id_usuario' ---
        where: { id_estudiante: usuario.id }
    });

    if (!practica) {
        return { error: "El estudiante no tiene una práctica asignada", bitacoras: [], estudiante: usuario };
    }

    //  Obtener las bitácoras de la práctica
    const bitacoras = await bitacoraRepository.find({
        where: { id_practica: practica.id_practica },
        order: { semana: "ASC" }
    });

    return { 
        bitacoras, 
        estudiante: {
            nombre: usuario.nombreCompleto || `${usuario.nombre || " "} ${usuario.apellido || " "}`.trim(),
            rut: usuario.rut,
            email: usuario.email
        },
        practica: {
            id_practica: practica.id_practica,
            estado: practica.estado
        }
    };
}

export async function obtenerPracticaPorEstudiante(idEstudiante) {
    return await practicaRepository.findOne({
        where: { 
            // Usamos id_estudiante porque así se llama la columna en tu entity
            id_estudiante: idEstudiante, 
            estado: "en_progreso" 
        }
    });
}

// Actualizar el estado de revisión de una bitácora (para docentes)
export async function actualizarEstadoBitacora(id_bitacora, estado_revision, nota = null) {
    const bitacora = await bitacoraRepository.findOne({
        where: { id_bitacora: id_bitacora }
    });

    if (!bitacora) {
        throw new Error("Bitácora no encontrada");
    }

    // Validar estados permitidos
    const estadosPermitidos = ["en_progreso", "pendiente", "aprobado", "rechazado", "completado"];
    if (!estadosPermitidos.includes(estado_revision)) {
        throw new Error("Estado de revisión no válido");
    }

    bitacora.estado_revision = estado_revision;
    
    // Si se proporciona una nota, actualizarla
    if (nota !== null && nota !== undefined) {
        const notaNum = parseFloat(nota);
        if (isNaN(notaNum) || notaNum < 1.0 || notaNum > 7.0) {
            throw new Error("La nota debe estar entre 1.0 y 7.0");
        }
        bitacora.nota = notaNum;
    }

    return await bitacoraRepository.save(bitacora);
}

// Eliminar una bitácora (para docentes y administradores)
export async function eliminarBitacora(id_bitacora) {
    const bitacora = await bitacoraRepository.findOne({
        where: { id_bitacora: id_bitacora }
    });

    if (!bitacora) {
        throw new Error("Bitácora no encontrada");
    }

    await bitacoraRepository.remove(bitacora);
    return { mensaje: "Bitácora eliminada correctamente", id: id_bitacora };
}
