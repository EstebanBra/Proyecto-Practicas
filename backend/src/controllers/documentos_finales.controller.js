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

    if (req.files?.informe && req.files.informe.length > 0) {
      files.push(...req.files.informe);
      tipos.push(...Array(req.files.informe.length).fill("informe"));
    }

    if (req.files?.autoevaluacion && req.files.autoevaluacion.length > 0) {
      files.push(...req.files.autoevaluacion);
      tipos.push(
        ...Array(req.files.autoevaluacion.length).fill("autoevaluacion"),
      );
    }

    if (files.length === 0) {
      return handleErrorClient(
        res,
        400,
        "No se ha subido ningún archivo válido",
      );
    }

    const { id_practica } = req.body;
    if (!id_practica) {
      return handleErrorClient(res, 400, "El campo id_practica es obligatorio");
    }

    const documentosRegistrados = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tipo = tipos[i];

      const { filename, size, mimetype } = file;
      const publicUrl = `${req.protocol}://${req.get("host")}/uploads/documentos/${filename}`;
      const formato = mimetype.includes("pdf") ? "pdf" : "docx";
      const peso_mb = parseFloat((size / (1024 * 1024)).toFixed(2));

      const data = {
        id_practica,
        nombre_archivo: filename,
        ruta_archivo: publicUrl,
        formato,
        peso_mb,
        tipo: tipo,
      };

      const [documento, errorDoc] = await registrarDocumentoService(data);
      if (errorDoc) {
        console.warn(
          `No se pudo registrar el documento ${filename}:`,
          errorDoc,
        );
        continue;
      }

      documentosRegistrados.push(documento);
    }

    if (documentosRegistrados.length === 0) {
      return handleErrorClient(
        res,
        400,
        "Ningún documento fue registrado correctamente",
      );
    }

    handleSuccess(
      res,
      201,
      "Archivo subido correctamente",
      documentosRegistrados,
    );
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return handleErrorClient(
        res,
        400,
        "El archivo excede los 10 MB permitidos",
      );
    }
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDocumentos(req, res) {
  try {
    const [documentos, errorDocs] = await getDocumentosService();
    if (errorDocs) return handleErrorClient(res, 404, errorDocs);

    if (documentos.length === 0) {
      return res.status(204).send();
    }

    handleSuccess(res, 200, "Documentos encontrados", documentos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDocumentoById(req, res) {
  try {
    const { id } = req.params;
    const [documento, errorDoc] = await getDocumentoByIdService(id);

    if (errorDoc) return handleErrorClient(res, 404, errorDoc);
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
