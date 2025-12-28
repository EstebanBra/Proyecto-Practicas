"use strict";

import { Router } from "express";
import { uploadFields } from "../middlewares/subidor_documentos_finales.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isDocente } from "../middlewares/authorization.middleware.js";
import {
  getDocumentoById,
  getDocumentos,
  subirYRegistrarDocumento,
  updateEstadoDocumento,
} from "../controllers/documentos_finales.controller.js";

const router = Router();

router.use(authenticateJwt);

router.post("/subir", uploadFields, subirYRegistrarDocumento);
router.patch("/:id/estado", isDocente, updateEstadoDocumento);
router.get("/", getDocumentos);
router.get("/:id", getDocumentoById);

export default router;
