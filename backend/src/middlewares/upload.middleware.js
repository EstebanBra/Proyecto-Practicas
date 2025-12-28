"use strict";

import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración base para upload de archivos
function createUploadMiddleware(options = {}) {
    const {
        destination = "uploads/documentos",
        maxSizeMB = 10,
        allowedFormats = ["pdf", "docx", "zip", "rar"],
        allowedMimes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip",
            "application/x-zip-compressed",
            "application/x-rar-compressed",
            "application/vnd.rar",
            "application/octet-stream"
        ],
        requireNamePattern = null // Para validar nombres como "informe" o "autoevaluacion"
    } = options;

    const uploadPath = path.resolve(destination);
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const base = path.basename(file.originalname, ext)
                .replace(/[^\w\-]+/g, "_")
                .toLowerCase();
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, `${base}-${unique}${ext}`);
        }
    });

    // Validación de doble extensión
    function hasDoubleExtension(filename) {
        const parts = filename.split(".");
        if (parts.length <= 2) return false;
        const last = parts.pop().toLowerCase();
        const prev = parts.pop().toLowerCase();
        const good = ["pdf", "docx"];
        const bad = ["exe", "bat", "cmd", "com", "js", "vbs", "msi", "scr", "ps1"];
        return good.includes(prev) && bad.includes(last);
    }

    function fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = file.mimetype;

        // Validar doble extensión
        if (hasDoubleExtension(file.originalname)) {
            req.fileValidationError = "Nombre de archivo inválido (doble extensión detectada)";
            return cb(null, false);
        }

        // Validar extensión
        const allowedExts = allowedFormats.map(format => `.${format}`);
        if (!allowedExts.includes(ext)) {
            req.fileValidationError = `Solo se permiten archivos: ${allowedFormats.join(", ").toUpperCase()}`;
            return cb(null, false);
        }

        // Validar MIME type
        if (!allowedMimes.includes(mime)) {
            if (mime !== "application/octet-stream") {
                req.fileValidationError = "Tipo de archivo no permitido";
                return cb(null, false);
            }
        }

        // Validar patrón de nombre si se especifica
        if (requireNamePattern) {
            const nombre = file.originalname.toLowerCase();
            const patterns = Array.isArray(requireNamePattern) ? requireNamePattern : [requireNamePattern];
            const matchesPattern = patterns.some(pattern => nombre.includes(pattern));

            if (!matchesPattern) {
                req.fileValidationError = `El nombre del archivo debe contener: ${patterns.join(" o ")}`;
                return cb(null, false);
            }
        }

        cb(null, true);
    }

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024,
            files: 1
        }
    });
}

// Middlewares específicos
export const uploadDocument = createUploadMiddleware({
    requireNamePattern: ["informe", "autoevaluacion"]
});

export const uploadBitacora = createUploadMiddleware({
    destination: "uploads/bitacoras"
});

export const uploadGeneral = createUploadMiddleware();

export default uploadDocument;
