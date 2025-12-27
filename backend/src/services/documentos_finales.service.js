"use strict";

import { AppDataSource } from "../config/configDb.js";
import Documento from "../entity/documentos_finales.entity.js";
import Practica from "../entity/practica.entity.js";

export async function registrarDocumentoService(data) {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const documentoRepository = AppDataSource.getRepository(Documento);
    const practica = await practicaRepository.findOne({
      where: { id_practica: data.id_practica },
    });
    if (isNaN(data.id_practica) || data.id_practica <= 0) {
      return [null, "ID de práctica inválido"];
    }
    if (!practica) {
      return [null, "La práctica asociada no existe"];
    }
    if (practica.estado !== "finalizada") {
      return [
        null,
        "Solo se pueden registrar documentos cuando la práctica está finalizada",
      ];
    }
    const nombre = data.nombre_archivo.toLowerCase();
    const tipoDocumento = nombre.includes("informe")
      ? "informe"
      : nombre.includes("autoevaluacion")
        ? "autoevaluacion"
        : null;
    if (!tipoDocumento) {
      return [
        null,
        "Solo se aceptan archivos de tipo 'informe' o 'autoevaluación' al finalizar la práctica",
      ];
    }
    const documentoData = {
      ...data,
      tipo: tipoDocumento,
      estado_revision: "pendiente",
      fecha_subida: new Date(),
    };
    const nuevoDocumento = documentoRepository.create(documentoData);
    await documentoRepository.save(nuevoDocumento);
    return [nuevoDocumento, null];
  } catch (error) {
    console.error("Error al registrar documento:", error);
    return [null, "Error al guardar el documento en la base de datos"];
  }
}

export async function getDocumentosService() {
  try {
    const documentoRepository = AppDataSource.getRepository(Documento);
    const documentos = await documentoRepository.find();
    return [documentos, null];
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return [null, "Error al consultar los documentos"];
  }
}

export async function getDocumentoByIdService(id_documento) {
  try {
    const documentoRepository = AppDataSource.getRepository(Documento);
    const documento = await documentoRepository.findOne({
      where: { id_documento },
    });
    if (!documento) return [null, "Documento no encontrado"];
    return [documento, null];
  } catch (error) {
    console.error("Error al obtener documento:", error);
    return [null, "Error al consultar el documento"];
  }
}

export async function updateEstadoDocumentoService(id_documento, estado) {
  try {
    const documentoRepository = AppDataSource.getRepository(Documento);
    const documento = await documentoRepository.findOne({
      where: { id_documento },
    });
    if (!documento) return [null, "Documento no encontrado"];

    documento.estado_revision = estado;
    await documentoRepository.save(documento);
    return [documento, null];
  } catch (error) {
    console.error("Error al actualizar estado del documento:", error);
    return [null, "Error al actualizar el estado de revisión"];
  }
}
