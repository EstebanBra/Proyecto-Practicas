"use strict";

import Evaluacion from "../entity/evaluaciones_finales.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function crearEvaluacionService(data) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);

    const evaluacionExistente = await repo.findOne({
      where: {
        id_documento: data.id_documento,
        id_usuario: data.id_usuario,
      },
    });

    if (evaluacionExistente) {
      return [null, "Ya existe una evaluación para este documento"]; // NO actualizar
    }

    const nuevaEvaluacion = repo.create(data);
    await repo.save(nuevaEvaluacion);
    return [nuevaEvaluacion, null];
  } catch (error) {
    console.error("Error al registrar evaluación:", error);
    return [null, "Error al guardar la evaluación en la base de datos"];
  }
}

export async function getEvaluacionByDocumentoService(id_documento) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);
    const evaluaciones = await repo.find({
      where: { id_documento },
    });
    if (!evaluaciones || evaluaciones.length === 0) {
      return [null, "No hay evaluaciones registradas para este documento"];
    }
    return [evaluaciones, null];
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    return [null, "Error al consultar las evaluaciones"];
  }
}

export async function updateEvaluacionService(id_evaluacion, data) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);
    const evaluacion = await repo.findOne({ where: { id_evaluacion } });
    if (!evaluacion) return [null, "Evaluación no encontrada"];

    Object.assign(evaluacion, data, { fecha_registro: new Date() });
    await repo.save(evaluacion);
    return [evaluacion, null];
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    return [null, "Error al modificar la evaluación"];
  }
}

export async function getEvaluacionesByDocenteService(id_usuario) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);
    const evaluaciones = await repo.find({
      where: { id_usuario },
      relations: ["documento"],
      order: { fecha_registro: "DESC" },
    });

    if (!evaluaciones || evaluaciones.length === 0)
      return [[], "No hay evaluaciones registradas por este docente"];

    return [evaluaciones, null];
  } catch (error) {
    console.error("Error al obtener evaluaciones del docente:", error);
    return [null, error.message];
  }
}
