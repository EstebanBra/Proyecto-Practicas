"use strict";

import { AppDataSource } from "../config/configDb.js";
import Practica from "../entity/practica.entity.js";

export async function crearPracticaService(datosPractica) {
  try {
    if (!datosPractica.empresa) {
      return [null, "La empresa debe estar asignada en la práctica"];
    }

    if (
      !datosPractica.supervisor_nombre
      || !datosPractica.supervisor_email
      || !datosPractica.supervisor_telefono
    ) {
      return [
        null,
        "Los datos del supervisor son obligatorios (nombre, email y teléfono)",
      ];
    }

    if (!datosPractica.fecha_inicio || !datosPractica.fecha_fin) {
      return [
        null,
        "El periodo de la práctica debe estar definido correctamente",
      ];
    }

    if (!datosPractica.horas_practicas || !datosPractica.semanas) {
      return [null, "Las horas y semanas de práctica son obligatorias"];
    }

    if (
      !datosPractica.tipo_practica
      || !["publicada", "propia"].includes(datosPractica.tipo_practica)
    ) {
      return [null, "El tipo de práctica debe ser \"publicada\" o \"propia\""];
    }

    const practicaRepository = AppDataSource.getRepository(Practica);

    const nuevaPractica = practicaRepository.create({
      ...datosPractica,
      fecha_creacion: new Date(),
      estado: "Revision_Pendiente",
    });

    const practicaGuardada = await practicaRepository.save(nuevaPractica);
    return [practicaGuardada, null];
  } catch (error) {
    console.error("Error al crear práctica:", error);
    return [null, "Error al guardar la práctica en la base de datos"];
  }
}

export async function obtenerTodasPracticasService() {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const practicas = await practicaRepository.find({
      relations: ["estudiante", "docente"],
    });
    return [practicas, null];
  } catch (error) {
    console.error("Error al obtener todas las prácticas:", error);
    return [null, "Error al consultar las prácticas"];
  }
}

export async function obtenerPracticasEstudianteService(idEstudiante) {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const practicas = await practicaRepository.find({
      where: { id_estudiante: idEstudiante },
      relations: ["docente"],
    });
    return [practicas, null];
  } catch (error) {
    console.error("Error al obtener prácticas del estudiante:", error);
    return [null, "Error al consultar las prácticas del estudiante"];
  }
}

export async function obtenerPracticaPorIdService(id) {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const practica = await practicaRepository.findOne({
      where: { id_practica: id },
      relations: ["estudiante", "docente"],
    });

    if (!practica) return [null, "Práctica no encontrada"];
    return [practica, null];
  } catch (error) {
    console.error("Error al obtener práctica por ID:", error);
    return [null, "Error al consultar la práctica"];
  }
}

export async function actualizarEstadoPracticaService(
  id,
  estado,
  observaciones,
) {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const practica = await practicaRepository.findOne({
      where: { id_practica: id },
    });

    if (!practica) return [null, "Práctica no encontrada"];

    practica.estado = estado;
    practica.observaciones = observaciones;
    practica.fecha_actualizacion = new Date();

    const practicaActualizada = await practicaRepository.save(practica);
    return [practicaActualizada, null];
  } catch (error) {
    console.error("Error al actualizar estado de práctica:", error);
    return [null, "Error al actualizar el estado de la práctica"];
  }
}

export async function actualizarPracticaService(id, datosActualizacion) {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const practica = await practicaRepository.findOne({
      where: { id_practica: id },
    });

    if (!practica) return [null, "Práctica no encontrada"];

    if (practica.estado !== "Revision_Pendiente") {
      return [
        null,
        "Solo se pueden actualizar prácticas en estado 'Revision_Pendiente'",
      ];
    }

    Object.assign(practica, {
      ...datosActualizacion,
      fecha_actualizacion: new Date(),
    });

    const practicaActualizada = await practicaRepository.save(practica);
    return [practicaActualizada, null];
  } catch (error) {
    console.error("Error al actualizar práctica:", error);
    return [null, "Error al actualizar la práctica"];
  }
}
