"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  isDocente,
} from "../middlewares/authorization.middleware.js";

import {
  crearEvaluacion,
  getEvaluacionByDocumento,
  getEvaluacionesByDocente,
  updateEvaluacion,
} from "../controllers/evaluaciones_finales.controller.js";

const router = Router();

router.use(authenticateJwt);

router.post("/", isDocente, crearEvaluacion);
router.get("/docente", isDocente, getEvaluacionesByDocente);

router.get("/documento/:id_documento", getEvaluacionByDocumento);
router.patch("/:id", updateEvaluacion);

export default router;
