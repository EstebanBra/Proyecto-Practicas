"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isDocente } from "../middlewares/authorization.middleware.js";
import {
  crearEvaluacion,
  getEvaluacionByDocumento,
  getEvaluacionesByDocente,
  updateEvaluacion,
} from "../controllers/evaluacionFinal.controller.js";

const router = Router();

router.use(authenticateJwt);

// Docentes crean evaluaciones
router.post("/", isDocente, crearEvaluacion);

// Docentes ven sus evaluaciones
router.get("/docente", isDocente, getEvaluacionesByDocente);

// Obtener evaluación por documento
router.get("/documento/:id_documento", getEvaluacionByDocumento);

// Actualizar evaluación
router.patch("/:id", isDocente, updateEvaluacion);

export default router;
