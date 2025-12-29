"use strict";
import { AppDataSource } from "../config/configDb.js";
import EvaluacionFinal from "../entity/evaluacionFinal.entity.js";
import Documento from "../entity/documento.entity.js";

export async function crearEvaluacionService(data) {
  try {
    const repo = AppDataSource.getRepository(EvaluacionFinal);
    const docRepo = AppDataSource.getRepository(Documento);

    const documento = await docRepo.findOne({
      where: { id_documento: data.id_documento },
    });

    if (!documento) {
      return [null, "Documento no encontrado"];
    }

    if (documento.tipo !== data.tipo_documento) {
      return [null, "El tipo de documento no coincide con el tipo de evaluación"];
    }

    // Verificar si ya existe una evaluación para este documento
    const evaluacionExistente = await repo.findOne({
      where: {
        id_documento: data.id_documento,
        tipo_documento: data.tipo_documento,
      },
    });

    if (evaluacionExistente) {
      return [null, "Ya existe una evaluación para este documento"];
    }

    // Validar nota entre 1 y 7
    if (data.nota < 1 || data.nota > 7) {
      return [null, "La nota debe estar entre 1.0 y 7.0"];
    }

    const nuevaEvaluacion = repo.create({
      id_documento: data.id_documento,
      tipo_documento: data.tipo_documento,
      nota: data.nota,
      comentario: data.comentario || "",
      id_usuario: data.id_usuario,
    });

    await repo.save(nuevaEvaluacion);

    // Actualizar el documento con la nota y estado
    documento.nota_revision = data.nota;
    documento.comentario = data.comentario || null;
    documento.estado_revision = "revisado";

    await docRepo.save(documento);

    return [nuevaEvaluacion, null];
  } catch (error) {
    console.error("Error al crear evaluación:", error);
    return [null, "Error interno al crear evaluación"];
  }
}

export async function getEvaluacionByDocumentoService(id_documento) {
  try {
    const repo = AppDataSource.getRepository(EvaluacionFinal);

    const evaluacion = await repo.findOne({
      where: { id_documento },
      relations: ["documento", "usuario"],
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada para este documento"];
    }

    return [evaluacion, null];
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    return [null, "Error al obtener evaluación"];
  }
}

export async function updateEvaluacionService(id_evaluacion, data) {
  try {
    const repo = AppDataSource.getRepository(EvaluacionFinal);
    const docRepo = AppDataSource.getRepository(Documento);

    const evaluacion = await repo.findOne({
      where: { id_evaluacion },
    });

    if (!evaluacion) {
      return [null, "Evaluación no encontrada"];
    }

    // Actualizar campos si se proporcionan
    if (data.nota !== undefined) {
      if (data.nota < 1 || data.nota > 7) {
        return [null, "La nota debe estar entre 1.0 y 7.0"];
      }
      evaluacion.nota = data.nota;
    }

    if (data.comentario !== undefined) {
      evaluacion.comentario = data.comentario;
    }

    await repo.save(evaluacion);

    // Actualizar también el documento
    const documento = await docRepo.findOne({
      where: { id_documento: evaluacion.id_documento },
    });

    if (documento) {
      if (data.nota !== undefined) {
        documento.nota_revision = data.nota;
      }
      if (data.comentario !== undefined) {
        documento.comentario = data.comentario;
      }
      await docRepo.save(documento);
    }

    return [evaluacion, null];
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    return [null, "Error al actualizar evaluación"];
  }
}

export async function getEvaluacionesByDocenteService(id_usuario) {
  try {
    const repo = AppDataSource.getRepository(EvaluacionFinal);

    const evaluaciones = await repo.find({
      where: { id_usuario },
      relations: ["documento", "documento.usuario", "documento.practica"],
      order: { fecha_registro: "DESC" },
    });

    return [evaluaciones, null];
  } catch (error) {
    console.error("Error al obtener evaluaciones del docente:", error);
    return [null, "Error al obtener evaluaciones"];
  }
}
