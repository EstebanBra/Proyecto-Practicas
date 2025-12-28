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
        where: { id_usuario: usuario.id }
    });

    if (!practica) {
        return { error: "El estudiante no tiene una práctica asignada", bitacoras: [], estudiante: usuario };
    }

    // Obtener las bitácoras de la práctica
    const bitacoras = await bitacoraRepository.find({
        where: { id_practica: practica.id_practica },
        order: { semana: "ASC" }
    });

    return { 
        bitacoras, 
        estudiante: {
            nombre: usuario.nombreCompleto || `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
            rut: usuario.rut,
            email: usuario.email
        },
        practica: {
            id_practica: practica.id_practica,
            estado: practica.estado
        }
    };
}
