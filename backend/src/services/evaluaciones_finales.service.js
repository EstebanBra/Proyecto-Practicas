"use strict";

import Evaluacion from "../entity/evaluaciones_finales.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function crearEvaluacionService(
  data,
  tipo = "evaluacion_docente",
) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);

    const evaluacionExistente = await repo.findOne({
      where: {
        id_documento: data.id_documento,
        id_usuario: data.id_usuario,
        tipo_evaluacion: tipo,
      },
    });

    if (evaluacionExistente) {
      return [
        null,
        `Ya existe una ${tipo === "autoevaluacion" ? "autoevaluación" : "evaluación"} para este documento`,
      ];
    }

    const evaluacionData = {
      ...data,
      tipo_evaluacion: tipo,
      rol_usuario: tipo === "autoevaluacion" ? "estudiante" : "docente",
    };

    const nuevaEvaluacion = repo.create(evaluacionData);
    await repo.save(nuevaEvaluacion);
    return [nuevaEvaluacion, null];
  } catch (error) {
    console.error(`Error al registrar ${tipo}:`, error);
    return [
      null,
      `Error al guardar la ${tipo === "autoevaluacion" ? "autoevaluación" : "evaluación"} en la base de datos`,
    ];
  }
}

export async function getEvaluacionByDocumentoService(
  id_documento,
  tipo_evaluacion = null,
) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);

    const whereClause = { id_documento };
    if (tipo_evaluacion) {
      whereClause.tipo_evaluacion = tipo_evaluacion;
    }

    const evaluaciones = await repo.find({
      where: whereClause,
      relations: ["documento", "usuario"],
    });

    if (!evaluaciones || evaluaciones.length === 0) {
      return [[], "No hay evaluaciones registradas para este documento"];
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
    const evaluacion = await repo.findOne({
      where: { id_evaluacion },
      relations: ["documento"],
    });

    if (!evaluacion) return [null, "Evaluación no encontrada"];

    if (data.nota !== undefined) evaluacion.nota = data.nota;
    if (data.comentario !== undefined) evaluacion.comentario = data.comentario;
    evaluacion.fecha_registro = new Date();

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
      where: {
        id_usuario,
        tipo_evaluacion: "evaluacion_docente",
      },
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

export async function getAutoevaluacionByEstudianteService(id_usuario) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);
    const autoevaluaciones = await repo.find({
      where: {
        id_usuario,
        tipo_evaluacion: "autoevaluacion",
      },
      relations: ["documento"],
      order: { fecha_registro: "DESC" },
    });

    if (!autoevaluaciones || autoevaluaciones.length === 0)
      return [[], "No hay autoevaluaciones registradas por este estudiante"];

    return [autoevaluaciones, null];
  } catch (error) {
    console.error("Error al obtener autoevaluaciones:", error);
    return [null, error.message];
  }
}

export async function crearAutoevaluacionService(data) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);

    const autoevaluacionExistente = await repo.findOne({
      where: {
        id_documento: data.id_documento,
        tipo_evaluacion: "autoevaluacion",
      },
    });

    if (autoevaluacionExistente) {
      return [null, "Ya existe una autoevaluación para este documento"];
    }

    return await crearEvaluacionService(data, "autoevaluacion");
  } catch (error) {
    console.error("Error al registrar autoevaluación:", error);
    return [null, "Error al guardar la autoevaluación"];
  }
}
