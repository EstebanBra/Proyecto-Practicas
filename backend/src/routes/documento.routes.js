"use strict";
import { Router } from "express";
import { uploadFields } from "../middlewares/uploadDocumento.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isDocente, isEstudiante } from "../middlewares/authorization.middleware.js";
import {
  deleteDocumento,
  getDocumentoById,
  getDocumentos,
  subirYRegistrarDocumento,
  updateEstadoDocumento,
} from "../controllers/documento.controller.js";

const router = Router();

router.use(authenticateJwt);

// Estudiantes suben documentos
router.post("/subir", isEstudiante, uploadFields, subirYRegistrarDocumento);

// Docentes cambian estado de documentos
router.patch("/:id/estado", isDocente, updateEstadoDocumento);

// Obtener todos los documentos (filtrado según rol)
router.get("/", getDocumentos);

// Obtener documento por ID
router.get("/:id", getDocumentoById);

// Estudiantes pueden eliminar sus documentos pendientes
router.delete("/:id", isEstudiante, deleteDocumento);

export default router;
