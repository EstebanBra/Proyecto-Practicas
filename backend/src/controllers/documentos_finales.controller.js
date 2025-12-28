"use strict";

import {
  getDocumentoByIdService,
  getDocumentosService,
  registrarDocumentoService,
  updateEstadoDocumentoService,
} from "../services/documentos_finales.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { documentoEstadoValidation } from "../validations/documentos_finales.validation.js";

export async function subirYRegistrarDocumento(req, res) {
  try {
    if (req.fileValidationError) {
      return handleErrorClient(res, 400, req.fileValidationError);
    }

    const files = [];
    const tipos = [];

    if (req.files?.informe?.length) {
      files.push(...req.files.informe);
      tipos.push("informe");
    }

    if (req.files?.autoevaluacion?.length) {
      files.push(...req.files.autoevaluacion);
      tipos.push("autoevaluacion");
    }

    if (!files.length) {
      return handleErrorClient(
        res,
        400,
        "No se ha subido ningún archivo válido",
      );
    }

    const { id_practica } = req.body;
    const id_usuario = req.user.id;

    if (!id_practica || !id_usuario) {
      return handleErrorClient(res, 400, "Datos incompletos");
    }

    const documentosRegistrados = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tipo = tipos[i];

      const publicUrl = `${req.protocol}://${req.get("host")}/uploads/documentos/${file.filename}`;
      const formato = file.mimetype.includes("pdf") ? "pdf" : "docx";
      const peso_mb = Number((file.size / (1024 * 1024)).toFixed(2));

      const data = {
        id_practica,
        id_usuario,
        nombre_archivo: file.filename,
        ruta_archivo: publicUrl,
        formato,
        peso_mb,
        tipo,
      };

      const [documento] = await registrarDocumentoService(data);
      if (documento) documentosRegistrados.push(documento);
    }

    if (!documentosRegistrados.length) {
      return handleErrorClient(
        res,
        400,
        "No se pudo registrar ningún documento",
      );
    }

    handleSuccess(
      res,
      201,
      "Archivo(s) subido(s) correctamente",
      documentosRegistrados,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDocumentos(req, res) {
  try {
    const filtros = {};

    if (req.user.rol === "estudiante") {
      filtros.id_usuario = req.user.id;
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

    if (req.user.rol === "estudiante" && documento.id_usuario !== req.user.id) {
      return handleErrorClient(res, 403, "Acceso denegado");
    }

    handleSuccess(res, 200, "Documento encontrado", documento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateEstadoDocumento(req, res) {
  try {
    const { id } = req.params;
    const { estado_revision } = req.body;

    const { error } = documentoEstadoValidation.validate({ estado_revision });
    if (error) return handleErrorClient(res, 400, error.message);

    const [documento, errorDoc] = await updateEstadoDocumentoService(
      id,
      estado_revision,
    );
    if (errorDoc) return handleErrorClient(res, 404, errorDoc);

    handleSuccess(res, 200, "Estado del documento actualizado", documento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
