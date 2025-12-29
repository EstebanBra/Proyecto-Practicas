"use strict";

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.resolve(__dirname, "../../../uploads/documentos");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
    const ext = path.extname(safeName);
    const base = path.basename(safeName, ext);
    const finalBase = base.substring(0, 50);
    cb(null, `${finalBase}-${timestamp}-${randomId}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error("Solo se permiten archivos PDF o DOCX"), false);
  }
  cb(null, true);
}

const limits = { fileSize: 10 * 1024 * 1024 };

export const upload = multer({ storage, fileFilter, limits });

export const uploadFields = upload.fields([
  { name: "informe", maxCount: 1 },
  { name: "autoevaluacion", maxCount: 1 },
]);