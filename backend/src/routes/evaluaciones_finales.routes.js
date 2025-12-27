"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  isDocente,
  isEstudiante,
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
router.post("/et/", isEstudiante, crearEvaluacion);

router.get("/documento/:id_documento", isDocente, getEvaluacionByDocumento);
router.get("/documento/et/:id_documento", isEstudiante, getEvaluacionByDocumento,);
router.get("/docente", isDocente, getEvaluacionesByDocente);

router.patch("/:id", isDocente, updateEvaluacion);
export default router;
