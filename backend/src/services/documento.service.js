"use strict";
import { AppDataSource } from "../config/configDb.js";
import Practica from "../entity/practica.entity.js";
import Documento from "../entity/documento.entity.js";

export async function registrarDocumentoService(data) {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const documentoRepository = AppDataSource.getRepository(Documento);

    const practica = await practicaRepository.findOne({
      where: { id_practica: data.id_practica },
    });

    if (isNaN(data.id_practica) || data.id_practica <= 0) {
      return [null, "El id de práctica no es válido"];
    }

    if (!practica) {
      return [null, "No se encontró la práctica asociada"];
    }

    // Verificar que la práctica esté en estado válido para subir documentos
    const estadosPermitidos = ["activa", "en_progreso", "finalizada"];
    if (!estadosPermitidos.includes(practica.estado)) {
      return [
        null,
        "No se pueden subir documentos. La práctica debe estar activa, " +
          `en progreso o finalizada. Estado actual: ${practica.estado}`,
      ];
    }

    // Verificar si ya existe un documento del mismo tipo para esta práctica y usuario
    const documentoExistente = await documentoRepository.findOne({
      where: {
        id_practica: data.id_practica,
        id_usuario: data.id_usuario,
        tipo: data.tipo,
      },
    });

    if (documentoExistente) {
      return [
        null,
        `Ya existe un documento de tipo "${data.tipo}" para esta práctica. ` +
          "Debe eliminar el anterior antes de subir uno nuevo.",
      ];
    }

    const documentoData = {
      ...data,
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

export async function getDocumentosService(filtros = {}) {
  try {
    const documentoRepository = AppDataSource.getRepository(Documento);

    const queryBuilder = documentoRepository
      .createQueryBuilder("documento")
      .leftJoinAndSelect("documento.usuario", "usuario")
      .leftJoinAndSelect("documento.practica", "practica");

    // Filtrar por usuario si es estudiante
    if (filtros.id_usuario) {
      queryBuilder.andWhere("documento.id_usuario = :id_usuario", {
        id_usuario: filtros.id_usuario,
      });
    }

    // Filtrar por estado de revisión
    if (filtros.estado_revision) {
      queryBuilder.andWhere("documento.estado_revision = :estado_revision", {
        estado_revision: filtros.estado_revision,
      });
    }

    // Filtrar por tipo de documento
    if (filtros.tipo) {
      queryBuilder.andWhere("documento.tipo = :tipo", { tipo: filtros.tipo });
    }

    // Filtrar por práctica
    if (filtros.id_practica) {
      queryBuilder.andWhere("documento.id_practica = :id_practica", {
        id_practica: filtros.id_practica,
      });
    }

    queryBuilder.orderBy("documento.fecha_subida", "DESC");

    const documentos = await queryBuilder.getMany();
    return [documentos, null];
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return [null, "Error al obtener documentos"];
  }
}

export async function getDocumentoByIdService(id_documento) {
  try {
    const documentoRepository = AppDataSource.getRepository(Documento);

    const documento = await documentoRepository.findOne({
      where: { id_documento },
      relations: ["usuario", "practica"],
    });

    if (!documento) {
      return [null, "Documento no encontrado"];
    }

    return [documento, null];
  } catch (error) {
    console.error("Error al obtener documento:", error);
    return [null, "Error al obtener documento"];
  }
}

export async function updateEstadoDocumentoService(id_documento, estado) {
  try {
    const documentoRepository = AppDataSource.getRepository(Documento);

    const documento = await documentoRepository.findOne({
      where: { id_documento },
    });

    if (!documento) {
      return [null, "Documento no encontrado"];
    }

    documento.estado_revision = estado;
    await documentoRepository.save(documento);

    return [documento, null];
  } catch (error) {
    console.error("Error al actualizar estado del documento:", error);
    return [null, "Error al actualizar estado del documento"];
  }
}

export async function deleteDocumentoService(id_documento, id_usuario) {
  try {
    const documentoRepository = AppDataSource.getRepository(Documento);

    const documento = await documentoRepository.findOne({
      where: { id_documento },
    });

    if (!documento) {
      return [null, "Documento no encontrado"];
    }

    // Verificar que el usuario sea el propietario
    if (documento.id_usuario !== id_usuario) {
      return [null, "No tienes permisos para eliminar este documento"];
    }

    // Solo se puede eliminar si está pendiente
    if (documento.estado_revision !== "pendiente") {
      return [null, "No se puede eliminar un documento que ya ha sido revisado"];
    }

    await documentoRepository.remove(documento);

    return [{ message: "Documento eliminado correctamente" }, null];
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return [null, "Error al eliminar documento"];
  }
}
