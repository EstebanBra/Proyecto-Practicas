"use strict";

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.resolve("uploads/plantillas");

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
    const filename = `plantilla-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  const allowedFormats = [".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedFormats.includes(ext)) {
    return cb(new Error("Solo se permiten archivos Excel (.xlsx o .xls)"));
  }
  cb(null, true);
}

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB máximo

const upload = multer({ storage, fileFilter, limits });

// Middleware para subir un archivo Excel
export const uploadExcelFile = upload.single("plantilla");

export const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Archivo muy grande. Máximo 5MB"
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Demasiados archivos"
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Error al subir el archivo"
    });
  }
  next();
};
