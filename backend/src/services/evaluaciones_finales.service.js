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
      return [null, "La evaluación ya existe"];
    }
    const nuevaEvaluacion = repo.create({
      id_documento: data.id_documento,
      tipo_documento: data.tipo_documento,
      nota: data.nota,
      comentario: data.comentario || "",
      id_usuario: data.id_usuario,
    });

    await repo.save(nuevaEvaluacion);

    documento.nota_revision = data.nota;
    documento.comentario = data.comentario || null; // Agregado
    documento.estado_revision = "revisado";

    await docRepo.save(documento);

    return [nuevaEvaluacion, null];
  } catch (error) {
    return [null, "Error interno al crear evaluación"];
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
    const docRepo = AppDataSource.getRepository(Documento);

    const evaluacion = await repo.findOne({
      where: { id_evaluacion },
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    evaluacion.nota = data.nota;
    evaluacion.comentario = data.comentario || "";

    await repo.save(evaluacion);

    const documento = await docRepo.findOne({
      where: { id_documento: evaluacion.id_documento },
    });

    if (documento) {
      documento.nota_revision = data.nota;
      documento.comentario = data.comentario || null;
      await docRepo.save(documento);
    }

    return [evaluacion, null];
  } catch (error) {
    return [null, "Error interno al actualizar evaluación"];
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
