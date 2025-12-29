"use strict";
import path from "path";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  deleteDocumentoService,
  getDocumentoByIdService,
  getDocumentosService,
  registrarDocumentoService,
  updateEstadoDocumentoService,
} from "../services/documento.service.js";
import { documentoEstadoValidation } from "../validations/documento.validation.js";

export async function subirYRegistrarDocumento(req, res) {
  try {
    if (req.fileValidationError) {
      return handleErrorClient(res, 400, req.fileValidationError);
    }

    const files = [];
    const tipos = [];

    // Procesar archivo de informe
    if (req.files?.informe?.length) {
      files.push(req.files.informe[0]);
      tipos.push("informe");
    }

    // Procesar archivo de autoevaluación
    if (req.files?.autoevaluacion?.length) {
      files.push(req.files.autoevaluacion[0]);
      tipos.push("autoevaluacion");
    }

    if (!files.length) {
      return handleErrorClient(
        res,
        400,
        "Debe subir al menos un archivo (informe o autoevaluación)"
      );
    }

    const { id_practica } = req.body;
    const id_usuario = req.user.id;

    if (!id_practica || !id_usuario) {
      return handleErrorClient(res, 400, "Faltan datos requeridos");
    }

    const documentosRegistrados = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tipo = tipos[i];

      const data = {
        id_practica: parseInt(id_practica),
        id_usuario,
        nombre_archivo: file.originalname,
        ruta_archivo: file.path,
        formato: path.extname(file.originalname).replace(".", "").toLowerCase(),
        peso_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
        tipo,
      };

      const [documento, error] = await registrarDocumentoService(data);

      if (error) {
        console.warn(`Error al registrar ${tipo}:`, error);
        continue;
      }

      documentosRegistrados.push(documento);
    }

    if (!documentosRegistrados.length) {
      return handleErrorClient(
        res,
        400,
        "No se pudo registrar ningún documento. Verifique que no existan documentos duplicados."
      );
    }

    handleSuccess(
      res,
      201,
      "Archivo(s) subido(s) correctamente",
      documentosRegistrados
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDocumentos(req, res) {
  try {
    const filtros = {};

    // Si es estudiante, solo ver sus propios documentos
    if (req.user.rol === "estudiante") {
      filtros.id_usuario = req.user.id;
    }

    // Filtros opcionales desde query params
    if (req.query.estado_revision) {
      filtros.estado_revision = req.query.estado_revision;
    }

    if (req.query.tipo) {
      filtros.tipo = req.query.tipo;
    }

    if (req.query.id_practica) {
      filtros.id_practica = parseInt(req.query.id_practica);
    }

    const [documentos, error] = await getDocumentosService(filtros);
    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Documentos encontrados", documentos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDocumentoById(req, res) {
  try {
    const { id } = req.params;
    const [documento, error] = await getDocumentoByIdService(id);

    if (error) return handleErrorClient(res, 404, error);

    // Si es estudiante, verificar que sea su documento
    if (req.user.rol === "estudiante" && documento.id_usuario !== req.user.id) {
      return handleErrorClient(res, 403, "No tienes acceso a este documento");
    }

    handleSuccess(res, 200, "Documento encontrado", documento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateEstadoDocumento(req, res) {
  try {
    const { id } = req.params;
    const { error } = documentoEstadoValidation.validate(req.body);

    if (error) return handleErrorClient(res, 400, error.details[0].message);

    const [documento, updateError] = await updateEstadoDocumentoService(
      id,
      req.body.estado_revision
    );

    if (updateError) return handleErrorClient(res, 400, updateError);

    handleSuccess(res, 200, "Estado actualizado correctamente", documento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteDocumento(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    const [result, error] = await deleteDocumentoService(id, id_usuario);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, result.message, null);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
