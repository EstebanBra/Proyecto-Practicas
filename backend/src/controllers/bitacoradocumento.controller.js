"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import * as documentoService from "../services/bitacoradocumento.service.js";
import path from "path";
import fs from "fs";

export async function subirArchivo(req, res) {
    try {
        // Validar si hay errores de validación del archivo
        if (req.fileValidationError) {
            return handleErrorClient(res, 400, req.fileValidationError);
        }

        // Obtener el archivo (puede venir con cualquier nombre de campo)
        const file = req.files && req.files.length > 0 ? req.files[0] : req.file;

        if (!file) {
            return handleErrorClient(res, 400, "No se ha subido ningún archivo");
        }

        const { filename, path: filePath, size, mimetype } = file;

        // Determinar el formato del archivo
        let formato;
        if (mimetype.includes("pdf")) {
            formato = "pdf";
        } else if (mimetype.includes("docx") || mimetype.includes("msword")) {
            formato = "docx";
        } else if (mimetype.includes("zip") || mimetype.includes("x-zip")) {
            formato = "zip";
        } else if (mimetype.includes("rar")) {
            formato = "rar";
        } else {
            return handleErrorClient(res, 400, "El archivo debe ser PDF, DOCX, ZIP o RAR");
        }

        // Validar el tamaño del archivo (10MB máximo)
        const pesoMb = parseFloat((size / (1024 * 1024)).toFixed(2));
        if (pesoMb > 10) {
            return handleErrorClient(res, 400, "El archivo excede los 10 MB permitidos");
        }

        const archivoData = {
            nombre_archivo: filename,
            ruta_archivo: filePath,
            formato: formato,
            peso_mb: pesoMb
        };

        return handleSuccess(res, 201, "Archivo subido correctamente", archivoData);
    } catch (error) {
        console.error("Error al subir archivo:", error);
        if (error.code === "LIMIT_FILE_SIZE") {
            return handleErrorClient(res, 400, "El archivo excede los 10 MB permitidos");
        }
        return handleErrorServer(res, 500, "Error al procesar el archivo");
    }
}

export async function registrarDocumento(req, res) {
    try {
        const { id_practica, nombre_archivo, ruta_archivo, formato, peso_mb } = req.body;

        // Registrar el documento (las validaciones se hacen en el servicio)
        const documentoData = {
            id_practica: parseInt(id_practica),
            nombre_archivo,
            ruta_archivo,
            formato,
            peso_mb: parseFloat(peso_mb)
        };

        const [documento, error] = await documentoService.registrarDocumento(documentoData);

        if (error) {
            return handleErrorClient(res, 400, error);
        }

        return handleSuccess(res, 201, "Documento registrado correctamente", documento);
    } catch (error) {
        console.error("Error al registrar documento:", error);
        return handleErrorServer(res, 500, "Error al registrar el documento");
    }
}

export async function obtenerDocumentosPractica(req, res) {
    try {
        const { id_practica } = req.params;

        if (!id_practica) {
            return handleErrorClient(res, 400, "ID de práctica requerido");
        }

        const documentos = await documentoService.obtenerDocumentosPorPractica(id_practica);
        return handleSuccess(res, 200, "Documentos recuperados exitosamente", documentos);
    } catch (error) {
        console.error("Error al obtener documentos:", error);
        return handleErrorServer(res, 500, "Error al recuperar los documentos");
    }
}

export async function actualizarEstadoDocumento(req, res) {
    try {
        const { id_documento } = req.params;
        const { estado_revision } = req.body;

        if (!id_documento || !estado_revision) {
            return handleErrorClient(res, 400, "ID de documento y estado de revisión son requeridos");
        }

        if (!["pendiente", "aprobado", "rechazado"].includes(estado_revision)) {
            return handleErrorClient(res, 400, "Estado de revisión inválido");
        }

        const documento = await documentoService.actualizarEstadoDocumento(id_documento, estado_revision);
        return handleSuccess(res, 200, "Estado del documento actualizado", documento);
    } catch (error) {
        console.error("Error al actualizar estado del documento:", error);
        return handleErrorServer(res, 500, "Error al actualizar el estado del documento");
    }
}

export async function descargarDocumento(req, res) {
    try {
        const { id_documento } = req.params;

        if (!id_documento) {
            return handleErrorClient(res, 400, "ID de documento requerido");
        }

        // Obtener el documento de la base de datos
        const documento = await documentoService.obtenerDocumentoPorId(id_documento);

        if (!documento) {
            return handleErrorClient(res, 404, "Documento no encontrado");
        }

        const filePath = documento.ruta_archivo;

        // Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
            return handleErrorClient(res, 404, "El archivo no existe en el servidor");
        }

        // Enviar el archivo para descarga
        const fileName = documento.nombre_archivo;
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("Error al descargar archivo:", err);
                if (!res.headersSent) {
                    return handleErrorServer(res, 500, "Error al descargar el archivo");
                }
            }
        });
    } catch (error) {
        console.error("Error al descargar documento:", error);
        return handleErrorServer(res, 500, "Error al descargar el documento");
    }
}
