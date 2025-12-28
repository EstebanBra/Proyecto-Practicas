"use strict";

import express, { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { uploadFields } from "../middlewares/subidor_documentos_finales.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  isDocente,
  isEstudiante,
} from "../middlewares/authorization.middleware.js";
import {
  getDocumentoById,
  getDocumentos,
  subirYRegistrarDocumento,
  updateEstadoDocumento,
} from "../controllers/documentos_finales.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, "../../../uploads");

const router = Router();

router.use(authenticateJwt);

router.use("/uploads", express.static(uploadsPath));

router.post("/subir", uploadFields, subirYRegistrarDocumento);
router.patch("/:id/estado", isDocente, updateEstadoDocumento);

router.get("/", getDocumentos);

router.get("/:id", getDocumentoById);


export default router;
