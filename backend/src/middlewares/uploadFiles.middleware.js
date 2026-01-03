"use strict";

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.resolve("uploads/documentos");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  const allowedFormats = [".pdf", ".docx", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedFormats.includes(ext)) {
    return cb(new Error("Solo se permiten archivos PDF, DOCX o PNG"));
  }
  cb(null, true);
}

const limits = { fileSize: 10 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

// Middleware para manejar múltiples archivos en comentarios (opcional)
export const uploadMultipleFiles = upload.array("archivos", 5); // Máximo 5 archivos

// Middleware que permite archivos opcionales
export const uploadOptionalFiles = (req, res, next) => {
  upload.array("archivos", 5)(req, res, (err) => {
    // Los archivos son opcionales, así que si no hay archivos, continuamos
    if (!err) return next();
    
    // Si hay un error relacionado con la cantidad o tamaño de archivos, rechazar
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT") {
        return handleMulterErrors(err, req, res, next);
      }
    } else if (err) {
      return handleMulterErrors(err, req, res, next);
    }
    
    next();
  });
};

// Middleware para manejar errores de Multer
export function handleMulterErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "Error",
        message: "El archivo excede el tamaño máximo permitido de 10MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        status: "Error",
        message: "Se excedió el número máximo de archivos permitidos (5)",
      });
    }
    return res.status(400).json({
      status: "Error",
      message: "Error al subir el archivo",
      details: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      status: "Error",
      message: err.message || "Error al procesar los archivos",
    });
  }
  
  next();
}

export default upload;
