"use strict";

import Evaluacion from "../entity/evaluaciones_finales.entity.js";
import Documento from "../entity/documentos_finales.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function crearEvaluacionService(data) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);
    const docRepo = AppDataSource.getRepository(Documento);
    const documento = await docRepo.findOne({
      where: { id_documento: data.id_documento },
    });

    if (!documento) {
      return [null, "Documento no encontrado"];
    }
    if (documento.tipo !== data.tipo_documento) {
      return [null, `El documento no es del tipo ${data.tipo_documento}`];
    }
    const evaluacionExistente = await repo.findOne({
      where: {
        id_documento: data.id_documento,
        tipo_documento: data.tipo_documento,
      },
    });

    if (evaluacionExistente) {
      return [
        null,
        `Ya existe una evaluación para este ${data.tipo_documento}`,
      ];
    }

    const nuevaEvaluacion = repo.create(data);
    await repo.save(nuevaEvaluacion);
    documento.estado_revision = "calificado";
    await docRepo.save(documento);

    return [nuevaEvaluacion, null];
  } catch (error) {
    console.error("Error al registrar evaluación:", error);
    return [null, "Error al guardar la evaluación en la base de datos"];
  }
}

export async function getEvaluacionByDocumentoService(id_documento) {
  try {
    const repo = AppDataSource.getRepository(Evaluacion);

    const evaluacion = await repo.findOne({
      where: { id_documento },
      relations: ["documento", "usuario"],
    });

    if (!evaluacion) {
      return [null, "No hay evaluación registrada para este documento"];
    }

    return [evaluacion, null];
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    return [null, "Error al consultar la evaluación"];
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
    if (data.tipo_documento !== undefined) {
      evaluacion.tipo_documento = data.tipo_documento;
    }

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
      where: { id_usuario },
      relations: ["documento", "documento.usuario"],
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
